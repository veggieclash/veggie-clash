/**
 * Veggie Clash - Enemy Health Bar Component
 * Displays health bars above enemies with color transitions (green→yellow→red)
 */

import Phaser from 'phaser';
import { AssetKey } from '../systems/AssetGenerator';

export class EnemyHealthBar extends Phaser.GameObjects.Container {
    private backgroundBar: Phaser.GameObjects.Sprite;
    private healthBarFill: Phaser.GameObjects.Sprite;
    private healthBarWidth: number = 40;
    private healthBarHeight: number = 6;
    private enemy: any; // Enemy reference to track health

    constructor(scene: Phaser.Scene, enemy: any) {
        super(scene, 0, 0);

        this.enemy = enemy;
        this.setDepth(110); // Above enemies but below player

        this.createHealthBar();
        this.scene.add.existing(this);
    }

    private createHealthBar(): void {
        // Background bar (empty health)
        this.backgroundBar = this.scene.add.sprite(0, 0, AssetKey.UIHealthBarBg);
        this.backgroundBar.setOrigin(0.5, 0.5);
        this.backgroundBar.setDisplaySize(this.healthBarWidth, this.healthBarHeight);

        // Health fill bar
        this.healthBarFill = this.scene.add.sprite(0, 0, AssetKey.UIHealthBarFill);
        this.healthBarFill.setOrigin(0.5, 0.5);
        this.healthBarFill.setDisplaySize(this.healthBarWidth, this.healthBarHeight);

        // Add to container
        this.add(this.backgroundBar);
        this.add(this.healthBarFill);

        // Position above enemy
        this.updatePosition();
        this.updateHealthDisplay();
    }

    /**
     * Update health bar position to follow enemy
     */
    updatePosition(): void {
        if (!this.enemy || !this.enemy.active) return;

        this.x = this.enemy.x;
        this.y = this.enemy.y - this.enemy.height / 2 - 15; // Above enemy sprite
    }

    /**
     * Update health bar display with current health percentage
     */
    updateHealthDisplay(): void {
        if (!this.enemy || !this.enemy.active) return;

        const healthPercent = this.enemy.health / this.enemy.maxHealth;
        const fillWidth = Math.max(0, healthPercent * this.healthBarWidth);

        // Update fill bar width
        this.healthBarFill.setDisplaySize(fillWidth, this.healthBarHeight);

        // Update fill color based on health percentage
        if (healthPercent > 0.6) {
            // Green (healthy)
            this.healthBarFill.setTint(0x32CD32); // LimeGreen
        } else if (healthPercent > 0.3) {
            // Yellow (caution)
            this.healthBarFill.setTint(0xFFD700); // Gold
        } else {
            // Red (danger)
            this.healthBarFill.setTint(0xDC143C); // Crimson
        }

        // Hide if enemy died or is about to die
        if (this.enemy.health <= 0) {
            this.setVisible(false);
        } else {
            this.setVisible(true);
        }
    }

    /**
     * Show boss health bar at top of screen (different implementation)
     */
    showAsBossBar(): void {
        // For boss enemies - move to top of screen
        this.x = this.scene.cameras.main.centerX - this.healthBarWidth / 2;
        this.y = 30; // Near top of screen

        // Make it larger for boss
        const bossWidth = 200;
        const bossHeight = 12;

        this.backgroundBar.setDisplaySize(bossWidth, bossHeight);
        this.healthBarFill.setDisplaySize(bossWidth * this.enemy.health / this.enemy.maxHealth, bossHeight);

        // Different color scheme for boss (more red)
        this.healthBarFill.setTint(0x8B0000); // DarkRed
    }

    /**
     * Update method - called each frame
     */
    update(): void {
        this.updatePosition();
        this.updateHealthDisplay();
    }

    /**
     * Clean up when enemy is destroyed
     */
    destroy(fromScene?: boolean): void {
        this.enemy = null;
        super.destroy(fromScene);
    }
}

/**
 * Enemy Health Bar Manager - Handles all enemy health bars
 */
export class EnemyHealthBarManager {
    private scene: Phaser.Scene;
    private healthBars: Map<any, EnemyHealthBar> = new Map();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Listen for enemy creation/destruction events
        // This would need to be hooked up in the game scene
    }

    /**
     * Create health bar for enemy
     */
    createForEnemy(enemy: any): void {
        if (this.healthBars.has(enemy)) return;

        const healthBar = new EnemyHealthBar(this.scene, enemy);
        this.healthBars.set(enemy, healthBar);

        // Destroy health bar when enemy dies
        const originalOnDestroy = enemy.onDestroy;
        enemy.onDestroy = () => {
            if (originalOnDestroy) originalOnDestroy.call(enemy);
            this.removeForEnemy(enemy);
        };
    }

    /**
     * Update all health bars
     */
    update(): void {
        for (const [enemy, healthBar] of this.healthBars) {
            if (enemy.active && enemy.health > 0) {
                healthBar.update();
            } else {
                // Cleanup dead enemies
                this.removeForEnemy(enemy);
            }
        }
    }

    /**
     * Handle boss specifically (top screen bar)
     */
    makeBossBar(enemy: any): void {
        const healthBar = this.healthBars.get(enemy);
        if (healthBar) {
            healthBar.showAsBossBar();
        }
    }

    /**
     * Remove health bar for enemy
     */
    removeForEnemy(enemy: any): void {
        const healthBar = this.healthBars.get(enemy);
        if (healthBar) {
            healthBar.destroy();
            this.healthBars.delete(enemy);
        }
    }

    /**
     * Clean up all health bars
     */
    destroy(): void {
        for (const healthBar of this.healthBars.values()) {
            healthBar.destroy();
        }
        this.healthBars.clear();
    }
}
