import { Settings } from './Settings';

/**
 * Visual Effects Manager handles particles, screen shake, flash effects, and other visual polish
 * Simplified version focused on working functionality
 */
export class VisualEffectsManager {
    private static instance: VisualEffectsManager;
    private scene: Phaser.Scene;
    private settings: Settings;
    
    // Screen effects
    private screenShakeIntensity: number = 0;
    private screenShakeDuration: number = 0;
    private flashOverlay: Phaser.GameObjects.Rectangle | null = null;
    
    // Settings
    private screenShakeEnabled: boolean = true;
    private reduceMotion: boolean = false;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.settings = Settings.getInstance();
        this.loadSettings();
        
        this.setupScreenEffects();
        
        VisualEffectsManager.instance = this;
    }

    public static getInstance(scene?: Phaser.Scene): VisualEffectsManager {
        if (!VisualEffectsManager.instance && scene) {
            VisualEffectsManager.instance = new VisualEffectsManager(scene);
        }
        return VisualEffectsManager.instance;
    }

    private loadSettings(): void {
        this.screenShakeEnabled = this.settings.get('screenShake') !== false;
        this.reduceMotion = this.settings.get('reduceMotion') === true;
    }

    private setupScreenEffects(): void {
        // Create flash overlay
        this.flashOverlay = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width * 2,
            this.scene.cameras.main.height * 2,
            0xffffff
        )
        .setOrigin(0)
        .setAlpha(0)
        .setScrollFactor(0)
        .setDepth(1000);
    }

    // Public effect methods
    public explode(x: number, y: number, size: 'small' | 'medium' | 'large' = 'medium'): void {
        if (this.reduceMotion) return;
        
        // Simple explosion effect using graphics
        const explosion = this.scene.add.circle(x, y, size === 'small' ? 15 : size === 'large' ? 40 : 25, 0xff4400, 0.8);
        
        this.scene.tweens.add({
            targets: explosion,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // Screen shake based on size
        const shakeIntensity = size === 'small' ? 3 : size === 'large' ? 12 : 6;
        this.screenShake(shakeIntensity, 200);
    }

    public muzzleFlash(x: number, y: number, angle: number = 0): void {
        if (this.reduceMotion) return;
        
        // Simple muzzle flash effect
        const flash = this.scene.add.circle(x, y, 8, 0xffff00, 0.9);
        flash.setRotation(angle);
        
        this.scene.tweens.add({
            targets: flash,
            scaleX: 1.5,
            scaleY: 0.3,
            alpha: 0,
            duration: 100,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    public hitEffect(x: number, y: number, color: number = 0xff4444): void {
        // Simple hit effect
        const hit = this.scene.add.circle(x, y, 5, color, 0.8);
        
        this.scene.tweens.add({
            targets: hit,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                hit.destroy();
            }
        });
    }

    public powerUpPickup(x: number, y: number): void {
        // Simple pickup effect
        const pickup = this.scene.add.circle(x, y, 10, 0x00ff00, 0.6);
        
        this.scene.tweens.add({
            targets: pickup,
            y: y - 30,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                pickup.destroy();
            }
        });
    }

    public screenShake(intensity: number = 5, duration: number = 200): void {
        if (!this.screenShakeEnabled || this.reduceMotion) return;
        
        this.screenShakeIntensity = Math.max(this.screenShakeIntensity, intensity);
        this.screenShakeDuration = Math.max(this.screenShakeDuration, duration);
    }

    public screenFlash(color: number = 0xffffff, intensity: number = 0.5, duration: number = 100): void {
        if (!this.flashOverlay || this.reduceMotion) return;
        
        this.flashOverlay.setFillStyle(color);
        this.flashOverlay.setAlpha(intensity);
        
        this.scene.tweens.add({
            targets: this.flashOverlay,
            alpha: 0,
            duration: duration,
            ease: 'Power2'
        });
    }

    public slowMotion(factor: number = 0.3, duration: number = 1000): void {
        if (this.reduceMotion) return;
        
        this.scene.physics.world.timeScale = factor;
        
        this.scene.time.delayedCall(duration, () => {
            this.scene.physics.world.timeScale = 1.0;
        });
    }

    public update(): void {
        // Update screen shake
        if (this.screenShakeDuration > 0 && this.screenShakeEnabled && !this.reduceMotion) {
            const camera = this.scene.cameras.main;
            const shakeX = Phaser.Math.Between(-this.screenShakeIntensity, this.screenShakeIntensity);
            const shakeY = Phaser.Math.Between(-this.screenShakeIntensity, this.screenShakeIntensity);
            
            camera.setScroll(camera.scrollX + shakeX, camera.scrollY + shakeY);
            
            this.screenShakeDuration -= this.scene.game.loop.delta;
            
            if (this.screenShakeDuration <= 0) {
                this.screenShakeIntensity = 0;
                this.screenShakeDuration = 0;
            }
        }
    }

    // Settings integration
    public updateSettings(): void {
        this.loadSettings();
    }

    // Cleanup
    public destroy(): void {
        // Destroy screen effects
        if (this.flashOverlay) {
            this.flashOverlay.destroy();
        }
        
        // Clear reference
        if (VisualEffectsManager.instance === this) {
            VisualEffectsManager.instance = null as any;
        }
    }

    // Utility methods for specific game events
    public weaponFired(x: number, y: number, angle: number, weaponType: string): void {
        this.muzzleFlash(x, y, angle);
        
        // Different effects for different weapons
        if (weaponType === 'beet_bazooka') {
            this.screenShake(8, 300);
        } else if (weaponType === 'corn_cannon') {
            this.screenShake(3, 150);
        }
    }

    public enemyHit(x: number, y: number, damage: number): void {
        const color = damage > 50 ? 0xff0000 : damage > 20 ? 0xff4444 : 0xff8888;
        this.hitEffect(x, y, color);
        
        if (damage > 30) {
            this.screenShake(2, 100);
        }
    }

    public playerHit(damage: number): void {
        const intensity = Math.min(damage / 100, 0.8);
        this.screenFlash(0xff0000, intensity, 200);
        this.screenShake(Math.min(damage / 10, 10), 300);
    }

    public enemyDeath(x: number, y: number, enemyType: string): void {
        if (enemyType === 'boss') {
            this.explode(x, y, 'large');
            this.screenShake(15, 800);
            this.slowMotion(0.2, 1500);
        } else {
            this.explode(x, y, 'medium');
            this.screenShake(4, 200);
        }
    }

    public levelComplete(): void {
        if (this.reduceMotion) return;
        
        // Celebratory effect
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                this.powerUpPickup(
                    Phaser.Math.Between(100, this.scene.cameras.main.width - 100),
                    Phaser.Math.Between(100, this.scene.cameras.main.height - 100)
                );
            });
        }
        
        this.screenFlash(0x00ff00, 0.3, 500);
    }
}
