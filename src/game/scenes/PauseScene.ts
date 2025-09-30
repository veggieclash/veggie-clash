/**
 * Veggie Clash - Pause Scene
 * Pause menu overlay
 */

import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, AUDIO_KEYS } from '../config';

export class PauseScene extends Phaser.Scene {
    private selectedIndex: number = 0;
    private menuItems: Array<{ text: string, action: () => void }> = [];
    private menuButtons: Phaser.GameObjects.Text[] = [];

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
        const panel = this.add.rectangle(width / 2, height / 2, 500, 400, COLORS.UI_BACKGROUND, 0.95);
        panel.setStrokeStyle(4, COLORS.UI_TEXT);

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
                button.setTint(COLORS.ACCENT_ORANGE);
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
        const { width, height } = this.cameras.main;

        // Create overlay background
        const settingsOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        settingsOverlay.setOrigin(0);
        settingsOverlay.setInteractive();

        // Settings panel
        const panel = this.add.rectangle(width / 2, height / 2, 600, 400, COLORS.UI_BACKGROUND, 0.95);
        panel.setStrokeStyle(4, COLORS.UI_TEXT);

        // Title
        this.add.text(width / 2, height / 2 - 150, '⚙️ Settings', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Volume controls (simplified)
        const volumeText = this.add.text(width / 2, height / 2 - 50, 'Audio Settings:', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, 'Master Volume: 70%', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 30, 'SFX Volume: 80%', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 60, 'Music Volume: 60%', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

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
            settingsOverlay.destroy();
            panel.destroy();
            volumeText.destroy();
            closeButton.destroy();
        });
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
