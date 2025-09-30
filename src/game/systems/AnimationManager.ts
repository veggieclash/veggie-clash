/**
 * Veggie Clash - Animation Manager
 * Handles character animations, hit feedback, and visual effects
 */

import Phaser from 'phaser';

interface AnimatedSprite {
    sprite: Phaser.GameObjects.Sprite;
    bobTween?: Phaser.Tweens.Tween;
    blinkTimer: number;
    nextBlinkTime: number;
    originalY: number;
}

export class AnimationManager {
    private scene: Phaser.Scene;
    private animatedSprites: Map<string, AnimatedSprite> = new Map();
    private particlePools: Map<string, Phaser.GameObjects.Particles.ParticleEmitter[]> = new Map();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initializeParticlePools();
    }

    private initializeParticlePools(): void {
        // Create particle pools for muzzle flash and impact effects
        this.particlePools.set('muzzle', []);
        this.particlePools.set('impact', []);
        this.particlePools.set('hit', []);
    }

    /**
     * Register a sprite for idle animations
     */
    public registerSprite(key: string, sprite: Phaser.GameObjects.Sprite): void {
        const animatedSprite: AnimatedSprite = {
            sprite,
            originalY: sprite.y,
            blinkTimer: 0,
            nextBlinkTime: this.getRandomBlinkTime()
        };

        this.animatedSprites.set(key, animatedSprite);
        this.startIdleAnimation(animatedSprite);
    }

    /**
     * Unregister a sprite from animations
     */
    public unregisterSprite(key: string): void {
        const animatedSprite = this.animatedSprites.get(key);
        if (animatedSprite) {
            if (animatedSprite.bobTween) {
                animatedSprite.bobTween.destroy();
            }
            this.animatedSprites.delete(key);
        }
    }

    /**
     * Start idle bob animation for a sprite
     */
    private startIdleAnimation(animatedSprite: AnimatedSprite): void {
        const sprite = animatedSprite.sprite;
        const bobHeight = sprite.displayHeight * 0.1; // ±10% sprite height
        
        animatedSprite.bobTween = this.scene.tweens.add({
            targets: sprite,
            y: animatedSprite.originalY - bobHeight,
            duration: 1800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * Handle hit feedback with improved juice (white flash, knockback, particles, numbers)
     */
    public showHitFeedback(sprite: Phaser.GameObjects.Sprite, damage: number = 10): void {
        // White flash tint overlay (120ms)
        sprite.setTint(0xffffff);
        this.scene.tweens.add({
            targets: sprite,
            tint: 0xffffff,
            ease: 'Power2',
            duration: 120,
            onComplete: () => sprite.clearTint()
        });

        // Knockback effect - small impulse opposite to player direction
        this.applyKnockback(sprite, damage);

        // Screen shake - intensity based on damage
        const shakeIntensity = damage > 30 ? 0.004 : 0.002;
        this.scene.cameras.main.shake(damage > 50 ? 120 : 80, shakeIntensity);

        // Create improved hit particles (6-10 leaf particles)
        this.createHitParticles(sprite.x, sprite.y);

        // Damage number popup
        this.createDamageNumber(sprite.x, sprite.y, damage);

        // Squash effect for enemies
        this.scene.tweens.add({
            targets: sprite,
            scaleY: 0.8,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
    }

    /**
     * Apply invulnerability frames with flicker effect
     */
    public applyInvulnerabilityFrames(sprite: Phaser.GameObjects.Sprite, duration: number = 800): void {
        let flickerCount = 0;
        const flickerInterval = 80;
        const maxFlickers = Math.floor(duration / flickerInterval);

        const flickerTween = this.scene.time.addEvent({
            delay: flickerInterval,
            callback: () => {
                sprite.setAlpha(sprite.alpha === 1 ? 0.3 : 1);
                flickerCount++;
                
                if (flickerCount >= maxFlickers) {
                    sprite.setAlpha(1);
                    flickerTween.destroy();
                }
            },
            repeat: maxFlickers - 1
        });
    }

    /**
     * Create muzzle flash effect
     */
    public createMuzzleFlash(x: number, y: number, angle: number = 0): void {
        const particles = this.scene.add.particles(x, y, 'particle_muzzle', {
            speed: { min: 20, max: 60 },
            scale: { start: 0.8, end: 0.1 },
            alpha: { start: 1, end: 0 },
            lifespan: { min: 250, max: 400 },
            quantity: { min: 8, max: 12 },
            angle: { min: angle - 30, max: angle + 30 },
            blendMode: 'ADD',
            tint: [0xFFFF00, 0xFFA500, 0xFF4500]
        });

        // Auto-destroy after particles fade
        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
    }

    /**
     * Create impact particles when projectiles hit
     */
    public createImpactParticles(x: number, y: number, type: 'seed' | 'juice' | 'explode' = 'seed'): void {
        let config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;

        switch (type) {
            case 'seed':
                config = {
                    speed: { min: 50, max: 120 },
                    scale: { start: 0.6, end: 0.1 },
                    alpha: { start: 1, end: 0 },
                    lifespan: { min: 300, max: 600 },
                    quantity: { min: 6, max: 10 },
                    gravityX: 0,
                    gravityY: 100,
                    bounce: 0.3,
                    tint: [0x90EE90, 0x32CD32, 0x228B22]
                };
                break;
            
            case 'juice':
                config = {
                    speed: { min: 30, max: 80 },
                    scale: { start: 0.4, end: 0.1 },
                    alpha: { start: 0.8, end: 0 },
                    lifespan: { min: 200, max: 400 },
                    quantity: { min: 8, max: 15 },
                    gravityX: 0,
                    gravityY: 50,
                    tint: [0xFF6347, 0xFF4500, 0xDC143C]
                };
                break;
            
            case 'explode':
                config = {
                    speed: { min: 80, max: 150 },
                    scale: { start: 0.8, end: 0.2 },
                    alpha: { start: 1, end: 0 },
                    lifespan: { min: 400, max: 700 },
                    quantity: { min: 12, max: 18 },
                    blendMode: 'ADD',
                    tint: [0xFF4500, 0xFFA500, 0xFFFF00]
                };
                break;
        }

        const particles = this.scene.add.particles(x, y, 'particle_hit', config);

        // Auto-destroy after particles fade
        this.scene.time.delayedCall(800, () => {
            particles.destroy();
        });
    }

    /**
     * Create hit particles for character damage
     */
    private createHitParticles(x: number, y: number): void {
        const particles = this.scene.add.particles(x, y, 'particle_hit', {
            speed: { min: 40, max: 100 },
            scale: { start: 0.5, end: 0.1 },
            alpha: { start: 1, end: 0 },
            lifespan: { min: 200, max: 400 },
            quantity: { min: 5, max: 8 },
            tint: [0xFF0000, 0xFF4444, 0xFFFFFF]
        });

        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
    }

    /**
     * Create power-up collection effect
     */
    public createPowerUpEffect(x: number, y: number, color: number = 0x45B7D1): void {
        // Sparkle burst
        const sparkles = this.scene.add.particles(x, y, 'particle_hit', {
            speed: { min: 60, max: 120 },
            scale: { start: 0.6, end: 0.1 },
            alpha: { start: 1, end: 0 },
            lifespan: { min: 500, max: 800 },
            quantity: 15,
            blendMode: 'ADD',
            tint: [color, 0xFFFFFF, 0xFFFF00]
        });

        // Rising text effect
        const text = this.scene.add.text(x, y - 20, '+POWER UP!', {
            fontSize: '16px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: text,
            y: y - 60,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });

        this.scene.time.delayedCall(1000, () => {
            sparkles.destroy();
        });
    }

    /**
     * Update method to handle ongoing animations
     */
    public update(delta: number): void {
        // Handle blink animations
        this.animatedSprites.forEach((animatedSprite) => {
            animatedSprite.blinkTimer += delta;
            
            if (animatedSprite.blinkTimer >= animatedSprite.nextBlinkTime) {
                this.performBlink(animatedSprite);
                animatedSprite.blinkTimer = 0;
                animatedSprite.nextBlinkTime = this.getRandomBlinkTime();
            }
        });
    }

    /**
     * Perform blink animation on sprite
     */
    private performBlink(animatedSprite: AnimatedSprite): void {
        const sprite = animatedSprite.sprite;
        
        // Simple blink by scaling Y briefly
        this.scene.tweens.add({
            targets: sprite,
            scaleY: 0.7,
            duration: 60,
            yoyo: true,
            ease: 'Power2'
        });
    }

    /**
     * Apply knockback effect to sprite
     */
    private applyKnockback(sprite: Phaser.GameObjects.Sprite, damage: number): void {
        // Only apply knockback to physics-enabled sprites
        const body = sprite.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        // Determine knockback direction based on physics body
        const playerX = this.scene.cameras.main.scrollX + this.scene.cameras.main.width / 2;
        const direction = sprite.x < playerX ? -1 : 1;

        // Apply impulse (clamp to prevent tunneling)
        const knockbackSpeed = Math.min(50 + damage, 150);
        body.setVelocityX(direction * knockbackSpeed);
        body.setVelocityY(-30); // Slight upward knockback

        // Reset velocity after short duration
        this.scene.time.delayedCall(200, () => {
            if (body) {
                body.setVelocityX(0);
            }
        });
    }

    /**
     * Create damage number popup
     */
    private createDamageNumber(x: number, y: number, damage: number): void {
        // Use bitmap font if available, fallback to text
        let textObj: Phaser.GameObjects.Text;

        if (this.scene.textures.exists('bitmap_font')) {
            // TODO: Use bitmap font
            textObj = this.scene.add.text(x, y, damage.toString(), {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            });
        } else {
            textObj = this.scene.add.text(x, y, damage.toString(), {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            });
        }

        textObj.setOrigin(0.5).setDepth(500);

        // Animate scale and movement
        this.scene.tweens.add({
            targets: textObj,
            y: y - 24,
            scaleX: 1.4,
            scaleY: 1.4,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => textObj.destroy()
        });
    }

    /**
     * Get random time until next blink (4-6 seconds)
     */
    private getRandomBlinkTime(): number {
        return 4000 + Math.random() * 2000; // 4-6 seconds
    }

    /**
     * Cleanup method
     */
    public destroy(): void {
        this.animatedSprites.forEach((animatedSprite) => {
            if (animatedSprite.bobTween) {
                animatedSprite.bobTween.destroy();
            }
        });
        this.animatedSprites.clear();
        
        this.particlePools.forEach((pool) => {
            pool.forEach(emitter => emitter.destroy());
        });
        this.particlePools.clear();
    }
}
