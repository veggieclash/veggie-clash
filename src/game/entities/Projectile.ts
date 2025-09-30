/**
 * Veggie Clash - Projectile Entity
 * Bullets, shells, and other projectiles
 */

import Phaser from 'phaser';

export class Projectile extends Phaser.GameObjects.Sprite {
    public damage: number;
    public speed: number = 400;
    public isPlayerProjectile: boolean;
    private velocity: Phaser.Math.Vector2;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        angle: number,
        damage: number,
        isPlayerProjectile: boolean = false
    ) {
        super(scene, x, y, texture);
        
        this.damage = damage;
        this.isPlayerProjectile = isPlayerProjectile;
        
        // Set up physics
        scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.width * 0.8, this.height * 0.8); // Smaller hitbox
        
        // Calculate velocity from angle
        this.velocity = new Phaser.Math.Vector2(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        body.setVelocity(this.velocity.x, this.velocity.y);
        
        // Set rotation to match direction
        this.setRotation(angle);
        
        // Set depth
        this.setDepth(50);
        
        // Set tint based on owner
        if (!isPlayerProjectile) {
            this.setTint(0xff4444); // Red tint for enemy projectiles
        }
    }

    update(): void {
        // Projectiles move automatically via physics
        // Could add trail effects or rotation here
    }

    hit(): void {
        // Create hit effect
        this.createHitEffect();
        
        // Destroy projectile
        this.destroy();
    }

    private createHitEffect(): void {
        // Create small explosion effect
        const particles = this.scene.add.particles(this.x, this.y, 'particle-hit', {
            speed: { min: 30, max: 80 },
            scale: { start: 0.3, end: 0 },
            lifespan: 200,
            quantity: 3
        });
        
        this.scene.time.delayedCall(200, () => particles.destroy());
    }
}
