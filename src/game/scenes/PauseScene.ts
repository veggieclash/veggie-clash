/**
 * Veggie Clash - Pause Scene
 * Pause menu overlay
 */

import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, AUDIO_KEYS } from '../config';
import { settings } from '../systems/Settings';
import { AudioManager } from '../systems/AudioManager';
import { Slider } from '../ui/Slider';

export class PauseScene extends Phaser.Scene {
    private selectedIndex: number = 0;
    private menuItems: Array<{ text: string, action: () => void }> = [];
    private menuButtons: Phaser.GameObjects.Text[] = [];
    private audioManager!: AudioManager;
    private settingsOverlay?: Phaser.GameObjects.Container;

    constructor() {
        super({ key: SCENE_KEYS.PAUSE });
    }

    create(): void {
        this.createOverlay();
        this.createMenu();
        this.setupInput();
        this.playSelectSound();
    }

    private createOverlay(): void {
        const { width, height } = this.cameras.main;

        // Semi-transparent overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setOrigin(0);

        // Pause panel
        const panel = this.add.rectangle(width / 2, height / 2, 500, 400, 0x111111, 0.95);
        panel.setStrokeStyle(4, 0xffffff);

        // Title
        this.add.text(width / 2, height / 2 - 150, '⏸️ PAUSED', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    private createMenu(): void {
        const { width, height } = this.cameras.main;
        const startY = height / 2 - 50;
        const spacing = 60;

        this.menuItems = [
            { text: '▶️ Resume', action: () => this.resumeGame() },
            { text: '⚙️ Settings', action: () => this.showSettings() },
            { text: '🏠 Main Menu', action: () => this.returnToMenu() }
        ];

        this.menuButtons = this.menuItems.map((item, index) => {
            const button = this.add.text(width / 2, startY + (index * spacing), item.text, {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
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

        // ESC to resume
        this.input.keyboard?.on('keydown-ESC', () => {
            this.resumeGame();
        });

        // Handle mobile pause button
        window.addEventListener('mobile-pause', () => {
            this.resumeGame();
        });
    }

    private resumeGame(): void {
        this.scene.stop();
        this.scene.resume(SCENE_KEYS.GAME);
    }

    private showSettings(): void {
        // Simple settings overlay
        this.showSettingsOverlay();
    }

    private returnToMenu(): void {
        this.scene.stop(SCENE_KEYS.HUD);
        this.scene.stop(SCENE_KEYS.GAME);
        this.scene.start(SCENE_KEYS.MENU);
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
        const btnClose = this.makeButton(panel.x, panel.y + 130, "Back", () => this.closeSettingsOverlay());

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

    private closeSettingsOverlay(): void {
        this.settingsOverlay?.destroy(true);
        this.settingsOverlay = undefined;
        this.input.keyboard?.removeListener('keydown-ESC');
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
        // Clean up mobile event listener
        window.removeEventListener('mobile-pause', () => {});
    }
}
