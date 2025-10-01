import { Settings } from './Settings';
import { AUDIO_KEYS } from '../config';

// Audio configuration constants
const AUDIO_CONFIG = {
    MAX_POOLED_SOUNDS: 10,
    SFX: {
        WEAPON_PEA: 'weapon_pea',
        WEAPON_CORN: 'weapon_corn',
        WEAPON_BEET: 'weapon_beet',
        PLAYER_HIT: 'player_hit',
        ENEMY_HIT_LIGHT: 'enemy_hit_light',
        ENEMY_HIT_MEDIUM: 'enemy_hit_medium',
        ENEMY_HIT_HEAVY: 'enemy_hit_heavy',
        EXPLOSION_SMALL: 'explosion_small',
        EXPLOSION_MEDIUM: 'explosion_medium',
        EXPLOSION_LARGE: 'explosion_large',
        POWERUP_PICKUP: 'powerup_pickup',
        UI_CLICK: 'ui_click',
        UI_HOVER: 'ui_hover',
        UI_ERROR: 'ui_error',
        UI_SUCCESS: 'ui_success'
    }
};

/**
 * Audio manager handles all game audio including music, sound effects, and volume control
 * Integrates with Settings system for persistent volume preferences
 */
export class AudioManager {
    private static instance: AudioManager;
    private scene: Phaser.Scene;
    private settings: Settings;
    
    // Audio objects
    private currentMusic: Phaser.Sound.BaseSound | null = null;
    private sfxPool: Map<string, Phaser.Sound.BaseSound[]> = new Map();
    private musicVolume: number = 1.0;
    private sfxVolume: number = 1.0;
    private masterVolume: number = 1.0;
    private muted: boolean = false;
    
    // Audio state
    private musicCrossfading: boolean = false;
    private pendingMusicKey: string | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.settings = Settings.getInstance();
        this.loadSettings();
        
        // Listen for settings changes
        this.scene.events.on('settings-changed', this.onSettingsChanged, this);
        
        AudioManager.instance = this;
    }

    public static getInstance(scene?: Phaser.Scene): AudioManager {
        if (!AudioManager.instance && scene) {
            AudioManager.instance = new AudioManager(scene);
        }
        return AudioManager.instance;
    }

    private loadSettings(): void {
        const audioSettings = this.settings.getAudioSettings();
        this.masterVolume = audioSettings.masterVolume;
        this.sfxVolume = audioSettings.sfxVolume;
        this.musicVolume = audioSettings.musicVolume;
        this.muted = audioSettings.muted;
    }

    private onSettingsChanged(settingsData: any): void {
        if (settingsData.audio) {
            this.masterVolume = settingsData.audio.masterVolume;
            this.sfxVolume = settingsData.audio.sfxVolume;
            this.musicVolume = settingsData.audio.musicVolume;
            this.muted = settingsData.audio.muted;
            
            // Update current music volume
            if (this.currentMusic && this.currentMusic.isPlaying && 'setVolume' in this.currentMusic) {
                (this.currentMusic as any).setVolume(this.getEffectiveVolume('music'));
            }
        }
    }

    private getEffectiveVolume(type: 'music' | 'sfx'): number {
        if (this.muted) return 0;
        
        const typeVolume = type === 'music' ? this.musicVolume : this.sfxVolume;
        return this.masterVolume * typeVolume;
    }

    /**
     * Play a sound effect
     */
    public playSfx(key: string, config?: Phaser.Types.Sound.SoundConfig): Phaser.Sound.BaseSound | null {
        try {
            const sound = this.scene.sound.add(key, {
                volume: this.getEffectiveVolume('sfx'),
                ...config
            });
            
            sound.play();
            return sound;
        } catch (error) {
            console.warn(`AudioManager: Could not play sound '${key}'`, error);
            return null;
        }
    }

    /**
     * Play background music with optional crossfade
     */
    public playMusic(key: string, config?: Phaser.Types.Sound.SoundConfig, fadeTime: number = 1000): void {
        try {
            // If same music is playing, do nothing
            if (this.currentMusic?.key === key && this.currentMusic.isPlaying) {
                return;
            }

            if (this.currentMusic && this.currentMusic.isPlaying) {
                // Crossfade to new music
                this.crossfadeMusic(key, config, fadeTime);
            } else {
                // Start new music directly
                this.startMusic(key, config, fadeTime);
            }
        } catch (error) {
            console.warn(`AudioManager: Could not play music '${key}'`, error);
        }
    }

    private startMusic(key: string, config?: Phaser.Types.Sound.SoundConfig, fadeTime: number = 1000): void {
        this.currentMusic = this.scene.sound.add(key, {
            loop: true,
            volume: 0,
            ...config
        });

        this.currentMusic.play();
        
        // Fade in
        this.scene.tweens.add({
            targets: this.currentMusic,
            volume: this.getEffectiveVolume('music'),
            duration: fadeTime,
            ease: 'Power2'
        });
    }

    private crossfadeMusic(newKey: string, config?: Phaser.Types.Sound.SoundConfig, fadeTime: number = 1000): void {
        if (this.musicCrossfading) return;
        
        this.musicCrossfading = true;
        this.pendingMusicKey = newKey;
        
        const oldMusic = this.currentMusic;
        
        // Fade out current music
        this.scene.tweens.add({
            targets: oldMusic,
            volume: 0,
            duration: fadeTime / 2,
            ease: 'Power2',
            onComplete: () => {
                oldMusic?.stop();
                oldMusic?.destroy();
                
                // Start new music
                this.startMusic(this.pendingMusicKey!, config, fadeTime / 2);
                this.musicCrossfading = false;
                this.pendingMusicKey = null;
            }
        });
    }

    /**
     * Stop current music with optional fade out
     */
    public stopMusic(fadeTime: number = 1000): void {
        if (!this.currentMusic || !this.currentMusic.isPlaying) return;

        if (fadeTime > 0) {
            this.scene.tweens.add({
                targets: this.currentMusic,
                volume: 0,
                duration: fadeTime,
                ease: 'Power2',
                onComplete: () => {
                    this.currentMusic?.stop();
                    this.currentMusic = null;
                }
            });
        } else {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    /**
     * Pause/Resume music
     */
    public pauseMusic(): void {
        if (this.currentMusic?.isPlaying) {
            this.currentMusic.pause();
        }
    }

    public resumeMusic(): void {
        if (this.currentMusic?.isPaused) {
            this.currentMusic.resume();
        }
    }

    /**
     * Get/Set volumes
     */
    public setMasterVolume(volume: number): void {
        this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.updateAllVolumes();
    }

    public setSfxVolume(volume: number): void {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.updateAllVolumes();
    }

    public setMusicVolume(volume: number): void {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        if (this.currentMusic?.isPlaying && 'setVolume' in this.currentMusic) {
            (this.currentMusic as any).setVolume(this.getEffectiveVolume('music'));
        }
    }

    public getMasterVolume(): number { return this.masterVolume; }
    public getSfxVolume(): number { return this.sfxVolume; }
    public getMusicVolume(): number { return this.musicVolume; }

    /**
     * Mute/Unmute
     */
    public setMuted(muted: boolean): void {
        this.muted = muted;
        this.updateAllVolumes();
    }

    public toggleMute(): void {
        this.setMuted(!this.muted);
    }

    public isMuted(): boolean {
        return this.muted;
    }

    private updateAllVolumes(): void {
        // Update current music
        if (this.currentMusic?.isPlaying && 'setVolume' in this.currentMusic) {
            (this.currentMusic as any).setVolume(this.getEffectiveVolume('music'));
        }
        
        // Update playing SFX (Note: this won't affect already playing sounds)
        // Future SFX will use the new volume automatically
    }

    /**
     * Object pooling for frequently used sound effects
     */
    private getSfxFromPool(key: string): Phaser.Sound.BaseSound | null {
        const pool = this.sfxPool.get(key);
        if (pool && pool.length > 0) {
            return pool.pop()!;
        }
        return null;
    }

    private returnSfxToPool(key: string, sound: Phaser.Sound.BaseSound): void {
        if (!this.sfxPool.has(key)) {
            this.sfxPool.set(key, []);
        }
        
        const pool = this.sfxPool.get(key)!;
        if (pool.length < AUDIO_CONFIG.MAX_POOLED_SOUNDS) {
            pool.push(sound);
        } else {
            sound.destroy();
        }
    }

    /**
     * Preload and cache frequently used sounds
     */
    public preloadSfx(keys: string[]): void {
        keys.forEach(key => {
            if (!this.sfxPool.has(key)) {
                this.sfxPool.set(key, []);
            }
            
            // Pre-create a few instances
            for (let i = 0; i < 3; i++) {
                if (this.scene.cache.audio.exists(key)) {
                    const sound = this.scene.sound.add(key);
                    this.sfxPool.get(key)!.push(sound);
                }
            }
        });
    }

    /**
     * Audio context helpers for mobile
     */
    public resumeAudioContext(): void {
        try {
            const soundManager = this.scene.sound as any;
            if (soundManager.context && soundManager.context.state === 'suspended') {
                soundManager.context.resume();
            }
        } catch (error) {
            console.warn('AudioManager: Could not resume audio context', error);
        }
    }

    /**
     * Special game-specific audio functions
     */
    public playWeaponSound(weaponType: string): void {
        const weaponSounds: Record<string, string> = {
            'pea_shooter': AUDIO_CONFIG.SFX.WEAPON_PEA,
            'corn_cannon': AUDIO_CONFIG.SFX.WEAPON_CORN,
            'beet_bazooka': AUDIO_CONFIG.SFX.WEAPON_BEET
        };

        const soundKey = weaponSounds[weaponType];
        if (soundKey) {
            this.playSfx(soundKey);
        }
    }

    public playHitSound(targetType: 'player' | 'enemy', damage: number): void {
        if (targetType === 'player') {
            this.playSfx(AUDIO_CONFIG.SFX.PLAYER_HIT, { 
                volume: this.getEffectiveVolume('sfx') * (damage > 20 ? 1.2 : 1.0) 
            });
        } else {
            // Different hit sounds for different damage levels
            if (damage >= 50) {
                this.playSfx(AUDIO_CONFIG.SFX.ENEMY_HIT_HEAVY);
            } else if (damage >= 20) {
                this.playSfx(AUDIO_CONFIG.SFX.ENEMY_HIT_MEDIUM);
            } else {
                this.playSfx(AUDIO_CONFIG.SFX.ENEMY_HIT_LIGHT);
            }
        }
    }

    public playExplosion(size: 'small' | 'medium' | 'large' = 'medium'): void {
        const explosionSounds = {
            small: AUDIO_CONFIG.SFX.EXPLOSION_SMALL,
            medium: AUDIO_CONFIG.SFX.EXPLOSION_MEDIUM,
            large: AUDIO_CONFIG.SFX.EXPLOSION_LARGE
        };

        this.playSfx(explosionSounds[size]);
    }

    public playPowerUpSound(type: string): void {
        this.playSfx(AUDIO_CONFIG.SFX.POWERUP_PICKUP, {
            rate: type === 'rare' ? 1.2 : 1.0
        });
    }

    public playUISound(action: 'click' | 'hover' | 'error' | 'success'): void {
        const uiSounds = {
            click: AUDIO_CONFIG.SFX.UI_CLICK,
            hover: AUDIO_CONFIG.SFX.UI_HOVER,
            error: AUDIO_CONFIG.SFX.UI_ERROR,
            success: AUDIO_CONFIG.SFX.UI_SUCCESS
        };

        this.playSfx(uiSounds[action]);
    }

    /**
     * Dynamic music system
     */
    public setMusicIntensity(intensity: number): void {
        // Could implement dynamic music layering here
        // For now, just adjust volume based on intensity
        if (this.currentMusic?.isPlaying && 'setVolume' in this.currentMusic) {
            const intensityVolume = Phaser.Math.Clamp(intensity, 0.3, 1.0);
            (this.currentMusic as any).setVolume(this.getEffectiveVolume('music') * intensityVolume);
        }
    }

    /**
     * UI audio helper methods
     */
    public uiClick(): void {
        if (this.scene.sound.get(AUDIO_KEYS.UI.BUTTON_CLICK)) {
            this.scene.sound.play(AUDIO_KEYS.UI.BUTTON_CLICK, {
                volume: this.getEffectiveVolume('sfx') * 0.8
            });
        } else {
            // Fallback - try SUCCESS
            if (this.scene.sound.get(AUDIO_KEYS.UI.SUCCESS)) {
                this.scene.sound.play(AUDIO_KEYS.UI.SUCCESS, {
                    volume: this.getEffectiveVolume('sfx') * 0.6
                });
            }
        }
    }

    public previewUI(): void {
        if (this.scene.sound.get(AUDIO_KEYS.UI.SUCCESS)) {
            this.scene.sound.play(AUDIO_KEYS.UI.SUCCESS, {
                volume: this.getEffectiveVolume('sfx') * 0.5
            });
        } else {
            // Fallback beep-like sound using existing assets if available
            if (this.scene.sound.get(AUDIO_KEYS.UI.BUTTON_CLICK)) {
                this.scene.sound.play(AUDIO_KEYS.UI.BUTTON_CLICK, {
                    volume: this.getEffectiveVolume('sfx') * 0.3,
                    rate: 1.5
                });
            }
        }
    }

    public applyMusicVolume(): void {
        // Update current music volume if playing
        if (this.currentMusic?.isPlaying && 'setVolume' in this.currentMusic) {
            (this.currentMusic as any).setVolume(this.getEffectiveVolume('music'));
        }
    }

    /**
     * Cleanup when scene is destroyed
     */
    public destroy(): void {
        // Stop all audio
        this.stopMusic(0);

        // Clear all pools
        this.sfxPool.forEach(pool => {
            pool.forEach(sound => sound.destroy());
        });
        this.sfxPool.clear();

        // Remove event listeners
        this.scene.events.off('settings-changed', this.onSettingsChanged, this);

        // Clear reference
        if (AudioManager.instance === this) {
            AudioManager.instance = null as any;
        }
    }
}
