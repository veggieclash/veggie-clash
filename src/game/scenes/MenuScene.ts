/**
 * Veggie Clash - Menu Scene
 * Main menu with game mode selection and settings
 */

import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, AUDIO_KEYS } from '../config';
import { settings } from '../systems/Settings';
import { AudioManager } from '../systems/AudioManager';
import { Slider } from '../ui/Slider';
import { FocusNav } from '../ui/FocusNav';

export class MenuScene extends Phaser.Scene {
    private menuMusic?: Phaser.Sound.BaseSound;
    private selectedIndex: number = 0;
    private menuItems: Array<{ text: string, action: () => void }> = [];
    private menuButtons: Phaser.GameObjects.Text[] = [];
    private audioManager!: AudioManager;
    private focusNav!: FocusNav;
    private settingsOverlay?: Phaser.GameObjects.Container;

    constructor() {
        super({ key: SCENE_KEYS.MENU });
    }

    create(): void {
        // Initialize audio manager
        this.audioManager = AudioManager.getInstance(this);

        this.createBackground();
        this.createTitle();
        this.createMenu();
        this.createQuickAccessToggles();
        this.setupInput();
        this.startMenuMusic();

        // Add some visual flair
        this.createParticleEffects();

        // Setup proper cleanup
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
    }

    private onShutdown(): void {
        // Clean up overlays and listeners
        this.settingsOverlay?.destroy(true);
        this.settingsOverlay = undefined;

        // Remove keyboard listeners
        this.input.keyboard?.removeAllListeners();

        // Stop menu music
        if (this.menuMusic) {
            this.menuMusic.stop();
            this.menuMusic.destroy();
        }

        // Clean up audio manager
        this.audioManager?.destroy();
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;

        // Create animated gradient background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x4CAF50, 0x8BC34A, 0x4CAF50, 0xFF9800, 1);
        graphics.fillRect(0, 0, width, height);

        // Add some decorative elements
        this.createDecorations();
    }

    private createDecorations(): void {
        const { width, height } = this.cameras.main;

        // Add some veggie silhouettes as decoration
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(50, height - 50);
            const scale = Phaser.Math.FloatBetween(0.3, 0.8);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.3);

            const veggies = ['enemy-tomato', 'enemy-onion', 'enemy-pepper', 'enemy-broccoli'];
            const randomVeggie = veggies[Math.floor(Math.random() * veggies.length)];

            const decoration = this.add.image(x, y, randomVeggie);
            decoration.setScale(scale);
            decoration.setAlpha(alpha);
            decoration.setTint(0x000000);

            // Add gentle floating animation
            this.tweens.add({
                targets: decoration,
                y: y - 20,
                duration: 3000 + Math.random() * 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    private createTitle(): void {
        const { width, height } = this.cameras.main;

        // Main title
        const title = this.add.text(width / 2, height / 4, '🥕 VEGGIE CLASH 🥕', {
            fontFamily: 'Arial',
            fontSize: '72px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 10, fill: true }
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height / 4 + 80, 'Garden Warfare Awaits!', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Add pulsing animation to title
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    private createMenu(): void {
        const { width, height } = this.cameras.main;
        const startY = height / 2 + 50;
        const spacing = 70;

        this.menuItems = [
            { text: '🎯 Campaign', action: () => this.startCampaign() },
            { text: '🏃 Endless Runner', action: () => this.startEndlessRunner() },
            { text: '⚔️ Survival Arena', action: () => this.startSurvival() },
            { text: '⚙️ Settings', action: () => this.openSettings() },
            { text: '📚 How to Play', action: () => this.showTutorial() },
            { text: '🏆 Credits', action: () => this.showCredits() }
        ];

        this.menuButtons = this.menuItems.map((item, index) => {
            const button = this.add.text(width / 2, startY + (index * spacing), item.text, {
                fontFamily: 'Arial',
                fontSize: '36px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);

            button.setInteractive({ useHandCursor: true });
            
            button.on('pointerover', () => {
                this.selectMenuItem(index);
                this.playHoverSound();
            });
            
            button.on('pointerdown', () => {
                this.activateMenuItem();
                this.playSelectSound();
            });

            return button;
        });

        this.updateMenuSelection();
    }

    private selectMenuItem(index: number): void {
        this.selectedIndex = index;
        this.updateMenuSelection();
    }

    private updateMenuSelection(): void {
        this.menuButtons.forEach((button, index) => {
            if (index === this.selectedIndex) {
                button.setTint(0xFF9800);
                button.setScale(1.1);
            } else {
                button.clearTint();
                button.setScale(1.0);
            }
        });
    }

    private activateMenuItem(): void {
        this.menuItems[this.selectedIndex].action();
    }

    private setupInput(): void {
        // Keyboard navigation
        this.input.keyboard?.on('keydown-UP', () => {
            this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
            this.updateMenuSelection();
            this.playHoverSound();
        });

        this.input.keyboard?.on('keydown-DOWN', () => {
            this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
            this.updateMenuSelection();
            this.playHoverSound();
        });

        this.input.keyboard?.on('keydown-ENTER', () => {
            this.activateMenuItem();
            this.playSelectSound();
        });

        this.input.keyboard?.on('keydown-SPACE', () => {
            this.activateMenuItem();
            this.playSelectSound();
        });

        // Handle mobile pause button
        window.addEventListener('mobile-pause', () => {
            this.openSettings();
        });
    }

    private startCampaign(): void {
        this.fadeToScene(() => {
            this.scene.start(SCENE_KEYS.GAME, { mode: 'campaign', level: 1 });
        });
    }

    private startSurvival(): void {
        this.fadeToScene(() => {
            this.scene.start(SCENE_KEYS.GAME, { mode: 'survival' });
        });
    }

    private startEndlessRunner(): void {
        this.fadeToScene(() => {
            this.scene.start(SCENE_KEYS.RUNNER_GAME, { mode: 'endless' });
        });
    }

    private openSettings(): void {
        // For now, just show a simple settings overlay
        this.showSettingsOverlay();
    }

    private showTutorial(): void {
        this.showTutorialOverlay();
    }

    private showCredits(): void {
        this.showCreditsOverlay();
    }

    private fadeToScene(callback: () => void): void {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', callback);
    }

    private showSettingsOverlay(): void {
        if (this.settingsOverlay) return;

        this.audioManager = AudioManager.getInstance(this);

        const { width, height } = this.cameras.main;

        // Get current settings
        const { masterVolume, sfxVolume, musicVolume } = settings.getAll();

        // Create overlay background
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0);
        overlay.setInteractive();

        // Settings panel
        const panel = this.add.rectangle(width / 2, height / 2, 600, 400, 0x111111, 0.95);
        panel.setStrokeStyle(4, 0xffffff);

        // Title
        this.add.text(width / 2, height / 2 - 150, '⚙️ Settings', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Volume sliders
        const sMaster = new Slider({
            scene: this,
            x: panel.x - 200,
            y: panel.y - 80,
            label: "Master",
            value: masterVolume ?? 0.7,
            onChange: (v) => { settings.set("masterVolume", v); this.audioManager.previewUI(); }
        });

        const sSfx = new Slider({
            scene: this,
            x: panel.x - 200,
            y: panel.y - 30,
            label: "SFX",
            value: sfxVolume ?? 0.8,
            onChange: (v) => { settings.set("sfxVolume", v); this.audioManager.previewUI(); }
        });

        const sMusic = new Slider({
            scene: this,
            x: panel.x - 200,
            y: panel.y + 20,
            label: "Music",
            value: musicVolume ?? 0.6,
            onChange: (v) => { settings.set("musicVolume", v); this.audioManager.applyMusicVolume(); }
        });

        // Accessibility toggles
        const btnHC = this.makeToggle(panel.x - 200, panel.y + 80, "High Contrast", settings.get("highContrast") ?? false, (on) => {
            settings.set("highContrast", on);
        });

        const btnRM = this.makeToggle(panel.x + 40, panel.y + 80, "Reduce Motion", settings.get("reduceMotion") ?? false, (on) => {
            settings.set("reduceMotion", on);
        });

        // Close button
        const btnClose = this.makeButton(panel.x, panel.y + 130, "Close", () => this.closeSettingsOverlay());

        // Container for cleanup
        this.settingsOverlay = this.add.container(0, 0, [
            overlay, panel, sMaster.container, sSfx.container, sMusic.container, btnHC, btnRM, btnClose
        ]);

        // ESC closes
        this.input.keyboard!.once('keydown-ESC', () => this.closeSettingsOverlay());
    }

    private makeButton(x: number, y: number, label: string, onUp: () => void): Phaser.GameObjects.Text {
        const t = this.add.text(x, y, label, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        t.on('pointerover', () => t.setStyle({ backgroundColor: 'rgba(255,255,255,0.18)' }));
        t.on('pointerout', () => t.setStyle({ backgroundColor: 'rgba(255,255,255,0.08)' }));
        t.on('pointerdown', () => { this.audioManager.uiClick(); t.setScale(0.98); });
        t.on('pointerup', () => { t.setScale(1); onUp(); });

        return t;
    }

    private makeToggle(x: number, y: number, label: string, initial: boolean, onToggle: (on: boolean) => void): Phaser.GameObjects.Text {
        let toggleOn = initial;
        const onTxt = () => `${label}: ${toggleOn ? "On" : "Off"}`;
        const b = this.makeButton(x + 120, y, onTxt(), () => {
            toggleOn = !toggleOn;
            b.setText(onTxt());
            onToggle(toggleOn);
        }).setOrigin(0, 0.5);
        this.add.text(x, y, "", { fontSize: "1px" }); // spacer for layout baseline
        return b;
    }

    private createQuickAccessToggles(): void {
        const { width, height } = this.cameras.main;

        // Add quick-access accessibility toggles in upper-right corner
        const btnHC = this.makeQuickToggle(width - 200, 50, "HC", settings.get("highContrast") ?? false, (on) => {
            settings.set("highContrast", on);
        });

        const btnRM = this.makeQuickToggle(width - 100, 50, "RM", settings.get("reduceMotion") ?? false, (on) => {
            settings.set("reduceMotion", on);
        });

        // Labels for clarity
        this.add.text(width - 195, 25, "High Contrast", { fontSize: '12px', color: '#ffffff' });
        this.add.text(width - 95, 25, "Reduce Motion", { fontSize: '12px', color: '#ffffff' });
    }

    private makeQuickToggle(x: number, y: number, label: string, initial: boolean, onToggle: (on: boolean) => void): Phaser.GameObjects.Text {
        let toggleOn = initial;
        const onTxt = () => toggleOn ? `[${label}]` : `${label}`;

        const b = this.add.text(x, y, onTxt(), {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: toggleOn ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255,255,255,0.1)',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        b.on('pointerover', () => b.setStyle({ backgroundColor: toggleOn ? 'rgba(76, 175, 80, 1.0)' : 'rgba(255,255,255,0.2)' }));
        b.on('pointerout', () => b.setStyle({ backgroundColor: toggleOn ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255,255,255,0.1)' }));
        b.on('pointerdown', () => { this.audioManager?.uiClick(); });
        b.on('pointerup', () => {
            toggleOn = !toggleOn;
            b.setText(onTxt());
            b.setStyle({ backgroundColor: toggleOn ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255,255,255,0.1)' });
            onToggle(toggleOn);
        });

        return b;
    }

    private closeSettingsOverlay(): void {
        this.settingsOverlay?.destroy(true);
        this.settingsOverlay = undefined;
        this.input.keyboard?.removeListener('keydown-ESC');
    }

    private showTutorialOverlay(): void {
        const { width, height } = this.cameras.main;

        // Create overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0);
        overlay.setInteractive();

        // Tutorial panel
        const panel = this.add.rectangle(width / 2, height / 2, 700, 500, 0x111111, 0.95);
        panel.setStrokeStyle(4, 0xffffff);

        // Title
        this.add.text(width / 2, height / 2 - 200, '📚 How to Play', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Instructions
        const instructions = [
            '🥕 You are the Carrot Commando!',
            '🎯 Use WASD to move, mouse to aim and shoot',
            '⚡ Press SPACE to dash and avoid damage',
            '🔫 Press Q/E to switch weapons',
            '❤️ Stay out of combat to regenerate health',
            '🏆 Defeat all enemies to win the level!'
        ];

        instructions.forEach((instruction, index) => {
            this.add.text(width / 2, height / 2 - 120 + (index * 40), instruction, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff'
            }).setOrigin(0.5);
        });

        // Close button
        const closeButton = this.add.text(width / 2, height / 2 + 180, 'Got it!', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            closeButton.destroy();
        });
    }

    private showCreditsOverlay(): void {
        const { width, height } = this.cameras.main;

        // Create overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0);
        overlay.setInteractive();

        // Credits panel
        const panel = this.add.rectangle(width / 2, height / 2, 600, 400, 0x111111, 0.95);
        panel.setStrokeStyle(4, 0xffffff);

        // Title
        this.add.text(width / 2, height / 2 - 150, '🏆 Credits', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Credits text
        const credits = [
            'Game Design & Development',
            'Veggie Clash Team',
            '',
            'Built with Phaser 3 & TypeScript',
            'Deployed on GitHub Pages',
            '',
            'Thanks for playing!'
        ];

        credits.forEach((credit, index) => {
            this.add.text(width / 2, height / 2 - 80 + (index * 30), credit, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff'
            }).setOrigin(0.5);
        });

        // Close button
        const closeButton = this.add.text(width / 2, height / 2 + 120, 'Back', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            closeButton.destroy();
        });
    }

    private createParticleEffects(): void {
        // Add subtle floating particles for atmosphere
        const particles = this.add.particles(0, 0, 'particle-hit', {
            x: { min: 0, max: this.cameras.main.width },
            y: this.cameras.main.height + 10,
            speedY: { min: -50, max: -20 },
            speedX: { min: -10, max: 10 },
            scale: { min: 0.1, max: 0.3 },
            alpha: { start: 0, end: 0.5, ease: 'Quad.easeOut' },
            lifespan: 8000,
            frequency: 500
        });

        particles.setDepth(-1); // Behind other elements
    }

    private startMenuMusic(): void {
        if (this.sound.get(AUDIO_KEYS.MUSIC.MENU)) {
            this.menuMusic = this.sound.add(AUDIO_KEYS.MUSIC.MENU, { loop: true, volume: 0.6 });
            this.menuMusic.play();
        }
    }

    private playHoverSound(): void {
        if (this.sound.get(AUDIO_KEYS.SFX.MENU_HOVER)) {
            this.sound.play(AUDIO_KEYS.SFX.MENU_HOVER, { volume: 0.3 });
        }
    }

    private playSelectSound(): void {
        if (this.sound.get(AUDIO_KEYS.SFX.MENU_SELECT)) {
            this.sound.play(AUDIO_KEYS.SFX.MENU_SELECT, { volume: 0.5 });
        }
    }

    shutdown(): void {
        // Stop menu music when leaving the scene
        if (this.menuMusic) {
            this.menuMusic.stop();
        }
    }
}
