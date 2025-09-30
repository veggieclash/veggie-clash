/**
 * Veggie Clash - Game Over Scene
 * Shows final score and restart options
 */

import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, AUDIO_KEYS } from '../config';

export interface GameOverData {
    score: number;
    wave: number;
    enemiesKilled: number;
    mode: 'campaign' | 'survival';
    victory?: boolean;
}

export class GameOverScene extends Phaser.Scene {
    private gameData!: GameOverData;
    private selectedIndex: number = 0;
    private menuItems: Array<{ text: string, action: () => void }> = [];
    private menuButtons: Phaser.GameObjects.Text[] = [];

    constructor() {
        super({ key: SCENE_KEYS.GAME_OVER });
    }

    init(data: GameOverData): void {
        this.gameData = data;
        this.selectedIndex = 0;
    }

    create(): void {
        this.createBackground();
        this.displayResults();
        this.createMenu();
        this.setupInput();
        this.saveHighScore();
        
        // Play appropriate sound
        if (this.gameData.victory) {
            this.playVictorySound();
        } else {
            this.playDefeatSound();
        }
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;

        // Background color based on victory/defeat
        const bgColor = this.gameData.victory ? COLORS.PRIMARY_GREEN : COLORS.HEALTH_LOW;
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(bgColor, bgColor, 0x000000, 0x000000, 1);
        graphics.fillRect(0, 0, width, height);

        // Add some atmosphere particles
        this.createAtmosphereParticles();
    }

    private createAtmosphereParticles(): void {
        if (this.gameData.victory) {
            // Victory confetti
            const confetti = this.add.particles(0, -50, 'particle-hit', {
                x: { min: 0, max: this.cameras.main.width },
                y: { min: -100, max: -50 },
                speedY: { min: 100, max: 200 },
                speedX: { min: -50, max: 50 },
                scale: { min: 0.5, max: 1.5 },
                lifespan: 3000,
                frequency: 100,
                tint: [COLORS.ACCENT_ORANGE, COLORS.PRIMARY_GREEN, COLORS.SECONDARY_GREEN]
            });
            
            this.time.delayedCall(5000, () => confetti.stop());
        } else {
            // Defeat rain
            this.add.particles(0, -50, 'particle-hit', {
                x: { min: 0, max: this.cameras.main.width },
                y: { min: -100, max: -50 },
                speedY: { min: 200, max: 300 },
                speedX: { min: -20, max: 20 },
                scale: { min: 0.2, max: 0.8 },
                alpha: { start: 0.6, end: 0 },
                lifespan: 2000,
                frequency: 200,
                tint: 0x666666
            });
        }
    }

    private displayResults(): void {
        const { width, height } = this.cameras.main;

        // Main title
        const titleText = this.gameData.victory ? '🏆 VICTORY! 🏆' : '💥 GAME OVER 💥';
        const titleColor = this.gameData.victory ? '#ffffff' : '#ff4444';
        
        this.add.text(width / 2, height / 4, titleText, {
            fontFamily: 'Arial',
            fontSize: '56px',
            color: titleColor,
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Subtitle
        let subtitle = '';
        if (this.gameData.victory) {
            subtitle = this.gameData.mode === 'campaign' ? 'Campaign Complete!' : 'Amazing Survival!';
        } else {
            subtitle = 'Better luck next time, Carrot!';
        }

        this.add.text(width / 2, height / 4 + 80, subtitle, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Stats panel
        this.createStatsPanel();
    }

    private createStatsPanel(): void {
        const { width, height } = this.cameras.main;
        const panelY = height / 2 - 50;

        // Stats background
        const statsPanel = this.add.rectangle(width / 2, panelY, 600, 250, COLORS.UI_BACKGROUND, 0.9);
        statsPanel.setStrokeStyle(4, COLORS.UI_TEXT);

        // Stats title
        this.add.text(width / 2, panelY - 100, '📊 Final Stats', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Display stats
        const stats = [
            `🏆 Final Score: ${this.gameData.score.toLocaleString()}`,
            `🎯 Enemies Defeated: ${this.gameData.enemiesKilled}`,
        ];

        if (this.gameData.mode === 'survival') {
            stats.push(`🌊 Waves Survived: ${this.gameData.wave}`);
        } else {
            stats.push(`📍 Level: ${this.gameData.mode === 'campaign' ? 'Complete' : 'Failed'}`);
        }

        stats.forEach((stat, index) => {
            this.add.text(width / 2, panelY - 50 + (index * 40), stat, {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5);
        });

        // High score check
        this.displayHighScore(panelY + 60);
    }

    private displayHighScore(y: number): void {
        const { width } = this.cameras.main;
        const highScoreKey = `highScore_${this.gameData.mode}`;
        const currentHighScore = parseInt(localStorage.getItem(highScoreKey) || '0');

        if (this.gameData.score > currentHighScore) {
            // New high score!
            this.add.text(width / 2, y, '🎉 NEW HIGH SCORE! 🎉', {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);

            // Add pulsing animation
            const highScoreText = this.add.text(width / 2, y, '🎉 NEW HIGH SCORE! 🎉', {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);

            this.tweens.add({
                targets: highScoreText,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 1000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        } else {
            // Show current high score
            this.add.text(width / 2, y, `Best Score: ${currentHighScore.toLocaleString()}`, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#cccccc'
            }).setOrigin(0.5);
        }
    }

    private createMenu(): void {
        const { width, height } = this.cameras.main;
        const startY = height - 200;
        const spacing = 60;

        this.menuItems = [
            { text: '🔄 Try Again', action: () => this.restartGame() },
            { text: '🏠 Main Menu', action: () => this.returnToMenu() }
        ];

        // Add level selection for campaign mode
        if (this.gameData.mode === 'campaign' && this.gameData.victory) {
            this.menuItems.splice(1, 0, { text: '➡️ Next Level', action: () => this.nextLevel() });
        }

        this.menuButtons = this.menuItems.map((item, index) => {
            const button = this.add.text(width / 2, startY + (index * spacing), item.text, {
                fontFamily: 'Arial',
                fontSize: '32px',
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

        // R to restart quickly
        this.input.keyboard?.on('keydown-R', () => {
            this.restartGame();
        });
    }

    private saveHighScore(): void {
        const highScoreKey = `highScore_${this.gameData.mode}`;
        const currentHighScore = parseInt(localStorage.getItem(highScoreKey) || '0');

        if (this.gameData.score > currentHighScore) {
            localStorage.setItem(highScoreKey, this.gameData.score.toString());
            
            // Also save detailed stats
            const statsKey = `stats_${this.gameData.mode}`;
            const stats = {
                score: this.gameData.score,
                wave: this.gameData.wave,
                enemiesKilled: this.gameData.enemiesKilled,
                date: new Date().toISOString()
            };
            localStorage.setItem(statsKey, JSON.stringify(stats));
        }
    }

    private restartGame(): void {
        this.fadeToScene(() => {
            this.scene.start(SCENE_KEYS.GAME, {
                mode: this.gameData.mode,
                level: this.gameData.mode === 'campaign' ? 1 : undefined
            });
        });
    }

    private nextLevel(): void {
        if (this.gameData.mode === 'campaign') {
            this.fadeToScene(() => {
                this.scene.start(SCENE_KEYS.GAME, {
                    mode: 'campaign',
                    level: 2 // Next level
                });
            });
        }
    }

    private returnToMenu(): void {
        this.fadeToScene(() => {
            this.scene.start(SCENE_KEYS.MENU);
        });
    }

    private fadeToScene(callback: () => void): void {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', callback);
    }

    private playVictorySound(): void {
        // Use power-up sound as victory sound
        if (this.sound.get(AUDIO_KEYS.SFX.POWER_UP)) {
            this.sound.play(AUDIO_KEYS.SFX.POWER_UP, { volume: 0.8 });
        }
    }

    private playDefeatSound(): void {
        // Use explosion sound as defeat sound
        if (this.sound.get(AUDIO_KEYS.SFX.EXPLOSION)) {
            this.sound.play(AUDIO_KEYS.SFX.EXPLOSION, { volume: 0.6 });
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
}
