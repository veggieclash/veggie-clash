/**
 * Veggie Clash - HUD Scene
 * User interface overlay showing game stats and controls using new component-based design
 */

import Phaser from 'phaser';
import { SCENE_KEYS } from '../config';
import { HUDLayout } from '../ui/HUDLayout';
import { Radar } from '../ui/Radar';
import { WeaponChip } from '../ui/WeaponChip';
import { GameState } from '../state/GameState';

export class HUDScene extends Phaser.Scene {
    private hud!: HUDLayout;
    private radar!: Radar;
    private weapon!: WeaponChip;

    constructor() {
        super({ key: SCENE_KEYS.HUD });
    }

    init(data: any): void {
        // Data not needed for new component design - components get data from GameState
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Create new component-based HUD
        this.hud = new HUDLayout(this);
        this.weapon = new WeaponChip(this, width - 16, 16);
        this.radar = new Radar(this, width - 16, height - 16, 220);

        // Handle viewport resize
        this.scale.on(Phaser.Scale.Events.RESIZE, (gw: number, gh: number) => {
            this.weapon?.resize(gw - 16, 16);
            this.radar?.destroy();
            this.radar = new Radar(this, gw - 16, gh - 16, 220);
        });

        // Setup proper cleanup
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
    }

    update(): void {
        this.hud.updateFromState();
        this.weapon.update();

        // Update radar with live game data
        const gameState = GameState.getInstance();
        this.radar.update(() => ({
            player: new Phaser.Math.Vector2(gameState.playerX, gameState.playerY),
            enemies: gameState.enemies,
            radius: 1200 // Adjustable radar range
        }));
    }

    private onShutdown(): void {
        this.hud?.destroy();
        this.radar?.destroy();
        this.weapon?.destroy();

        // Remove resize listener
        this.scale.off(Phaser.Scale.Events.RESIZE);
    }

    // Keep compatibility with existing methods by forwarding to HUDLayout
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
}
