/**
 * Veggie Clash - Settings System
 * Handles game settings, preferences, and accessibility options
 */

export interface GameSettings {
    // Audio settings
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    audioEnabled: boolean;
    
    // Graphics settings
    particleQuality: 'low' | 'medium' | 'high';
    graphicsQuality: 'low' | 'medium' | 'high';
    screenShake: boolean;

    // Visual effect toggles (controlled by graphicsQuality)
    enableVignette: boolean;
    enableAmbientFog: boolean;
    enableBloom: boolean;
    enableCRTOvrelay: boolean;
    enableOutlines: boolean;
    enableShadows: boolean;
    
    // Accessibility settings
    highContrast: boolean;
    colorBlindMode: boolean;
    reduceMotion: boolean;
    showSubtitles: boolean;
    
    // Control settings
    keyBindings: Record<string, string>;
    mouseSensitivity: number;
    
    // Mobile settings
    joystickDeadzone: number;
    autoAim: boolean;
}

export class Settings {
    private static instance: Settings;
    private settings: GameSettings;
    private readonly STORAGE_KEY = 'veggie-clash-settings';

    private constructor() {
        this.settings = this.getDefaultSettings();
        this.loadSettings();
    }

    static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    private getDefaultSettings(): GameSettings {
        return {
            // Audio defaults
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.6,
            audioEnabled: true,

            // Graphics defaults
            particleQuality: 'high',
            graphicsQuality: 'high',
            screenShake: true,
            enableVignette: true,
            enableAmbientFog: true,
            enableBloom: true,
            enableCRTOvrelay: false, // CRT overlay disabled by default (desktop only)
            enableOutlines: true,
            enableShadows: true,

            // Accessibility defaults
            highContrast: false,
            colorBlindMode: false,
            reduceMotion: false,
            showSubtitles: true,

            // Control defaults
            keyBindings: {
                moveUp: 'W',
                moveDown: 'S',
                moveLeft: 'A',
                moveRight: 'D',
                shoot: 'MOUSE_LEFT',
                altFire: 'MOUSE_RIGHT',
                dash: 'SPACE',
                reload: 'R',
                weaponPrev: 'Q',
                weaponNext: 'E',
                pause: 'ESC'
            },
            mouseSensitivity: 1.0,

            // Mobile defaults
            joystickDeadzone: 0.1,
            autoAim: true
        };
    }

    loadSettings(): void {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                // Merge with defaults to ensure all properties exist
                this.settings = { ...this.getDefaultSettings(), ...parsedSettings };
            }
        } catch (error) {
            console.warn('Failed to load settings, using defaults:', error);
            this.settings = this.getDefaultSettings();
        }
        
        // Apply settings to document
        this.applyAccessibilitySettings();
    }

    saveSettings(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    get(key: keyof GameSettings): any {
        return this.settings[key];
    }

    set<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
        this.settings[key] = value;
        this.saveSettings();

        // Apply graphics quality changes
        if (key === 'graphicsQuality') {
            this.applyGraphicsQuality(value as 'low' | 'medium' | 'high');
        }

        // Apply immediate changes for accessibility settings
        if (['highContrast', 'colorBlindMode', 'reduceMotion'].includes(key)) {
            this.applyAccessibilitySettings();
        }
    }

    getAll(): GameSettings {
        return { ...this.settings };
    }

    reset(): void {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        this.applyAccessibilitySettings();
    }

    private applyAccessibilitySettings(): void {
        const body = document.body;
        
        // High contrast mode
        if (this.settings.highContrast) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
        
        // Color blind mode
        if (this.settings.colorBlindMode) {
            body.classList.add('color-blind-safe');
        } else {
            body.classList.remove('color-blind-safe');
        }
        
        // Reduce motion
        if (this.settings.reduceMotion) {
            body.classList.add('reduce-motion');
        } else {
            body.classList.remove('reduce-motion');
        }
    }

    // Apply graphics quality settings based on overall quality level
    private applyGraphicsQuality(quality: 'low' | 'medium' | 'high'): void {
        switch (quality) {
            case 'low':
                this.settings.enableVignette = false;
                this.settings.enableAmbientFog = false;
                this.settings.enableBloom = false;
                this.settings.enableCRTOvrelay = false;
                this.settings.enableOutlines = false;
                this.settings.enableShadows = false;
                this.settings.particleQuality = 'low';
                break;
            case 'medium':
                this.settings.enableVignette = true;
                this.settings.enableAmbientFog = true;
                this.settings.enableBloom = false;
                this.settings.enableCRTOvrelay = false;
                this.settings.enableOutlines = true;
                this.settings.enableShadows = true;
                this.settings.particleQuality = 'medium';
                break;
            case 'high':
                this.settings.enableVignette = true;
                this.settings.enableAmbientFog = true;
                this.settings.enableBloom = true;
                this.settings.enableCRTOvrelay = !this.isMobile; // CRT only on desktop
                this.settings.enableOutlines = true;
                this.settings.enableShadows = true;
                this.settings.particleQuality = 'high';
                break;
        }
        this.saveSettings();
    }

    // Check if running on mobile device
    private get isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Utility methods for common settings
    getAudioSettings(): any {
        return {
            masterVolume: this.settings.masterVolume,
            sfxVolume: this.settings.sfxVolume,
            musicVolume: this.settings.musicVolume,
            muted: !this.settings.audioEnabled
        };
    }

    getVolume(type: 'master' | 'sfx' | 'music'): number {
        const masterVol = this.settings.masterVolume;
        if (!this.settings.audioEnabled) return 0;
        
        switch (type) {
            case 'sfx':
                return masterVol * this.settings.sfxVolume;
            case 'music':
                return masterVol * this.settings.musicVolume;
            default:
                return masterVol;
        }
    }

    isKeyBound(action: string, key: string): boolean {
        return this.settings.keyBindings[action] === key;
    }

    rebindKey(action: string, newKey: string): boolean {
        // Check if key is already bound to another action
        const existingAction = Object.keys(this.settings.keyBindings)
            .find(act => this.settings.keyBindings[act] === newKey);
        
        if (existingAction && existingAction !== action) {
            return false; // Key already bound
        }
        
        this.settings.keyBindings[action] = newKey;
        this.saveSettings();
        return true;
    }

    // Export settings for debugging or sharing
    exportSettings(): string {
        return JSON.stringify(this.settings, null, 2);
    }

    // Import settings from JSON string
    importSettings(settingsJson: string): boolean {
        try {
            const importedSettings = JSON.parse(settingsJson);
            // Validate that it has the expected structure
            const defaults = this.getDefaultSettings();
            const validSettings: Partial<GameSettings> = {};
            
            // Only import valid settings keys
            Object.keys(defaults).forEach(key => {
                const settingKey = key as keyof GameSettings;
                if (key in importedSettings) {
                    (validSettings as any)[settingKey] = importedSettings[key];
                }
            });
            
            this.settings = { ...defaults, ...validSettings };
            this.saveSettings();
            this.applyAccessibilitySettings();
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }
}

// Singleton instance getter
export const settings = Settings.getInstance();
