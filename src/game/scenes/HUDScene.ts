/**
 * Veggie Clash - HUD Scene
 * User interface overlay showing game stats and controls
 */

import Phaser from 'phaser';
import { SCENE_KEYS, COLORS } from '../config.js';

export class HUDScene extends Phaser.Scene {
    private healthBar!: Phaser.GameObjects.Rectangle;
    private healthBg!: Phaser.GameObjects.Rectangle;
    private scoreText!: Phaser.GameObjects.Text;
    private ammoText!: Phaser.GameObjects.Text;
    private weaponText!: Phaser.GameObjects.Text;
    private waveText!: Phaser.GameObjects.Text;
    
    private player: any;
    private gameMode: string;
    private level?: number;
    
    // Radar components
    private radarContainer!: Phaser.GameObjects.Container;
    private playerDot!: Phaser.GameObjects.Arc;
    private enemyDots: Phaser.GameObjects.Arc[] = [];
    private radarBounds: { x: number, y: number, width: number, height: number } = { x: 0, y: 0, width: 120, height: 120 };
    
    constructor() {
        super({ key: SCENE_KEYS.HUD });
    }

    init(data: any): void {
        this.player = data.player;
        this.gameMode = data.gameMode || 'campaign';
        this.level = data.level;
    }

    create(): void {
        this.createHealthBar();
        this.createScoreDisplay();
        this.createWeaponDisplay();
        this.createMiniMap();
        this.setupEvents();
    }

    update(): void {
        this.updateHealthBar();
        this.updateScore();
        this.updateWeaponDisplay();
        this.updateRadar();
    }

    private createHealthBar(): void {
        const padding = 20;
        
        // Health icon sprite
        const healthIcon = this.add.image(padding, padding + 9, 'ui_icon_health');
        healthIcon.setScrollFactor(0).setDepth(1000);
        healthIcon.setScale(0.8);
        
        // Health text
        this.add.text(padding + 25, padding, 'Health:', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(1000);
        
        // Health bar background (positioned after the text)
        this.healthBg = this.add.rectangle(padding + 120, padding + 10, 200, 20, 0x000000, 0.5);
        this.healthBg.setScrollFactor(0);
        this.healthBg.setDepth(1000);
        
        // Health bar fill (positioned after the text)
        this.healthBar = this.add.rectangle(padding + 120, padding + 10, 196, 16, 0x00FF00);
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(1001);
    }

    private createScoreDisplay(): void {
        const padding = 20;
        
        // Score icon and text
        const scoreIcon = this.add.image(padding, padding + 59, 'ui_icon_score');
        scoreIcon.setScrollFactor(0).setDepth(1000);
        scoreIcon.setScale(0.8);
        
        this.scoreText = this.add.text(padding + 25, padding + 50, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(1000);
        
        if (this.gameMode === 'survival') {
            // Wave icon and text
            const waveIcon = this.add.image(padding, padding + 89, 'ui_icon_wave');
            waveIcon.setScrollFactor(0).setDepth(1000);
            waveIcon.setScale(0.8);
            
            this.waveText = this.add.text(padding + 25, padding + 80, 'Wave: 1', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setScrollFactor(0).setDepth(1000);
        }
        
        if (this.gameMode === 'campaign' && this.level) {
            // Location icon and text
            const locationIcon = this.add.image(padding, padding + 89, 'ui_icon_location');
            locationIcon.setScrollFactor(0).setDepth(1000);
            locationIcon.setScale(0.8);
            
            this.add.text(padding + 25, padding + 80, `Level: ${this.level}`, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setScrollFactor(0).setDepth(1000);
        }
    }

    private createWeaponDisplay(): void {
        const { width } = this.cameras.main;
        const padding = 20;

        // Weapon sprite icon (right aligned)
        const weaponIcon = this.add.image(width - padding - 200, padding + 9, 'ui_icon_weapon_pea');
        weaponIcon.setScrollFactor(0).setDepth(1000);
        weaponIcon.setScale(0.8);
        weaponIcon.setName('weaponIcon'); // Store reference for updates

        // Ammo icon
        const ammoIcon = this.add.image(width - padding - 200, padding + 39, 'ui_icon_ammo');
        ammoIcon.setScrollFactor(0).setDepth(1000);
        ammoIcon.setScale(0.7);
        ammoIcon.setName('ammoIcon'); // Store reference for updates

        this.weaponText = this.add.text(width - padding, padding, 'Pea Shooter', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

        this.ammoText = this.add.text(width - padding, padding + 30, '∞ Ammo', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
    }

    private createMiniMap(): void {
        const { width, height } = this.cameras.main;
        const mapSize = 120;
        const padding = 20;
        
        this.radarBounds = {
            x: width - padding - mapSize/2,
            y: height - padding - mapSize/2,
            width: mapSize,
            height: mapSize
        };
        
        // Mini-map background
        const miniMapBg = this.add.rectangle(
            this.radarBounds.x,
            this.radarBounds.y,
            mapSize,
            mapSize,
            0x000000,
            0.7
        );
        miniMapBg.setScrollFactor(0);
        miniMapBg.setDepth(999);
        miniMapBg.setStrokeStyle(2, 0xffffff, 0.8);
        
        // Mini-map title with radar icon
        const radarTitleIcon = this.add.image(
            this.radarBounds.x - 30,
            this.radarBounds.y - 35,
            'ui_icon_radar'
        );
        radarTitleIcon.setScrollFactor(0).setDepth(1000);
        radarTitleIcon.setScale(0.8);

        this.add.text(
            this.radarBounds.x,
            this.radarBounds.y - 35,
            'Radar',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        
        // Create player dot
        this.playerDot = this.add.circle(this.radarBounds.x, this.radarBounds.y, 3, 0x00FF00);
        this.playerDot.setScrollFactor(0).setDepth(1001);
    }

    private createControlsHint(): void {
        const { width, height } = this.cameras.main;
        const padding = 20;
        
        // Only show on desktop
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) return;
        
        const controls = [
            'WASD: Move',
            'Mouse: Aim & Shoot',
            'SPACE: Dash',
            'Q/E: Switch Weapon',
            'ESC: Pause'
        ];
        
        controls.forEach((control, index) => {
            this.add.text(
                padding,
                height - padding - (controls.length - index) * 25,
                control,
                {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 1
                }
            ).setScrollFactor(0).setDepth(1000).setAlpha(0.8);
        });
    }

    private updateHealthBar(): void {
        if (!this.player || !this.healthBar) return;
        
        const healthPercent = Math.max(0, this.player.health / this.player.maxHealth);
        const maxWidth = 196;
        
        this.healthBar.width = maxWidth * healthPercent;
        
        // Change color based on health
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x00FF00); // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xFFA500); // Orange
        } else {
            this.healthBar.setFillStyle(0xF44336); // Red
        }
    }

    private updateScore(): void {
        if (!this.scoreText) return;

        // Get score from the main game scene
        const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
        if (gameScene && gameScene.score !== undefined) {
            this.scoreText.setText(`Score: ${gameScene.score}`);
        }

        // Update wave counter for survival mode
        if (this.waveText && gameScene && gameScene.wave !== undefined) {
            this.waveText.setText(`Wave: ${gameScene.wave}`);
        }
    }

    private updateWeaponDisplay(): void {
        if (!this.player || !this.weaponText || !this.ammoText) return;

        // Update weapon icon and name
        const weaponIndex = this.player.currentWeapon || 0;
        const weaponIcons = ['ui_icon_weapon_pea', 'ui_icon_weapon_corn', 'ui_icon_weapon_beet'];
        const weaponNames = ['Pea Shooter', 'Corn Cannon', 'Beet Bazooka'];

        this.weaponText.setText(weaponNames[weaponIndex] || 'Unknown');

        // Update weapon icon sprite
        const weaponIcon = this.children.getByName('weaponIcon') as Phaser.GameObjects.Image;
        if (weaponIcon) {
            weaponIcon.setTexture(weaponIcons[weaponIndex] || 'ui_icon_weapon_pea');
        }

        // Update ammo
        if (this.player.currentAmmo !== undefined && this.player.maxAmmo !== undefined) {
            if (this.player.maxAmmo === -1) {
                this.ammoText.setText('∞ Ammo');
            } else {
                this.ammoText.setText(`${this.player.currentAmmo}/${this.player.maxAmmo}`);
            }
        }
    }

    private updateRadar(): void {
        if (!this.player || !this.playerDot) return;
        
        // Get the game scene to access enemies
        const gameScene = this.scene.get(SCENE_KEYS.GAME) as any;
        if (!gameScene) return;
        
        // The radar shows player at center, so we don't need to update player dot position
        // Player is always at the center of the radar
        
        // Clear existing enemy dots
        this.enemyDots.forEach(dot => dot.destroy());
        this.enemyDots = [];
        
        // Add enemy dots
        if (gameScene.enemies && gameScene.enemies.children) {
            const radarScale = 0.1; // Scale factor to fit world into radar
            const radarRange = 400; // Maximum range to show enemies
            
            gameScene.enemies.children.entries.forEach((enemy: any) => {
                if (!enemy.active) return;
                
                // Calculate relative position to player
                const deltaX = enemy.x - this.player.x;
                const deltaY = enemy.y - this.player.y;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Only show enemies within range
                if (distance > radarRange) return;
                
                // Scale position to radar size
                const radarX = this.radarBounds.x + (deltaX * radarScale);
                const radarY = this.radarBounds.y + (deltaY * radarScale);
                
                // Make sure dot is within radar bounds
                const halfRadar = this.radarBounds.width / 2;
                if (Math.abs(radarX - this.radarBounds.x) > halfRadar || 
                    Math.abs(radarY - this.radarBounds.y) > halfRadar) {
                    return;
                }
                
                // Create enemy dot - red for enemies
                const enemyDot = this.add.circle(radarX, radarY, 2, 0xFF0000);
                enemyDot.setScrollFactor(0).setDepth(1001);
                this.enemyDots.push(enemyDot);
            });
        }
    }

    private setupEvents(): void {
        // Listen for player events
        this.events.on('playerHealthChanged', (health: number) => {
            this.updateHealthBar();
        });
        
        this.events.on('weaponSwitched', (weaponIndex: number) => {
            this.updateWeaponDisplay();
        });
        
        this.events.on('scoreChanged', (score: number) => {
            this.updateScore();
        });
    }

    showDamageIndicator(direction: number): void {
        const { width, height } = this.cameras.main;
        
        // Create damage indicator at screen edge
        const indicatorSize = 50;
        let x, y, rotation;
        
        switch (Math.floor(direction / (Math.PI / 2))) {
            case 0: // Right
                x = width - 20;
                y = height / 2;
                rotation = 0;
                break;
            case 1: // Bottom
                x = width / 2;
                y = height - 20;
                rotation = Math.PI / 2;
                break;
            case 2: // Left
                x = 20;
                y = height / 2;
                rotation = Math.PI;
                break;
            default: // Top
                x = width / 2;
                y = 20;
                rotation = -Math.PI / 2;
                break;
        }
        
        const indicator = this.add.triangle(x, y, 0, 0, indicatorSize, 0, indicatorSize/2, indicatorSize/2, 0xF44336);
        indicator.setScrollFactor(0);
        indicator.setDepth(1002);
        indicator.setRotation(rotation);
        indicator.setAlpha(0.8);
        
        // Animate and destroy
        this.tweens.add({
            targets: indicator,
            alpha: 0,
            scale: 1.5,
            duration: 500,
            ease: 'Power2',
            onComplete: () => indicator.destroy()
        });
    }

    showPowerUpNotification(powerUpType: string): void {
        const { width } = this.cameras.main;

        const powerUpNames: Record<string, string> = {
            ranch: 'DAMAGE BOOST!',
            oil: 'SPEED BOOST!',
            fertilizer: 'RAPID FIRE!',
            heart: 'HEALTH RESTORED!'
        };

        // Create notification text
        const notification = this.add.text(width / 2, 150, powerUpNames[powerUpType] || 'POWER UP!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);

        // Add power-up icon sprite
        const powerUpSprites: Record<string, string> = {
            ranch: 'powerup_ranch',
            oil: 'powerup_oil',
            fertilizer: 'powerup_fertilizer',
            heart: 'powerup_heart'
        };

        const powerUpIcon = this.add.image(width / 2 - 80, 150, powerUpSprites[powerUpType] || 'powerup_ranch');
        powerUpIcon.setScrollFactor(0).setDepth(1003);
        powerUpIcon.setScale(1.2);
        powerUpIcon.setAlpha(0.9);

        // Animate both notification and icon
        this.tweens.add({
            targets: [notification, powerUpIcon],
            y: 120,
            alpha: 0,
            scale: notification === notification ? 1.2 : 1.5,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                notification.destroy();
                powerUpIcon.destroy();
            }
        });
    }

    shutdown(): void {
        this.events.off('playerHealthChanged');
        this.events.off('weaponSwitched');
        this.events.off('scoreChanged');
    }
}
