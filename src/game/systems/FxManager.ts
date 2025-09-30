/**
 * Veggie Clash FX Manager
 * Handles weapon effects, muzzle flashes, impact decals, and projectile trails
 */

import Phaser from 'phaser';

export class FxManager {
    private scene: Phaser.Scene;
    private decalPool: Phaser.GameObjects.Sprite[] = [];
    private muzzleEmitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();
    private trailEmitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initializePools();
    }

    private initializePools(): void {
        // Create decal pool for impact splats
        for (let i = 0; i < 10; i++) {
            const decal = this.scene.add.sprite(0, 0, 'fx_impact');
            decal.setVisible(false);
            this.decalPool.push(decal);
        }
    }

    /**
     * Create muzzle flash effect for weapon firing
     */
    public createMuzzleFlash(x: number, y: number, angle: number, weaponType: string = 'pea'): void {
        const muzzleKey = `muzzle_${weaponType}_${angle}`;

        if (this.muzzleEmitters.has(muzzleKey)) {
            const emitter = this.muzzleEmitters.get(muzzleKey)!;
            emitter.explode(8, x, y);
        } else {
            // Create new muzzle flash emitter
            const emitter = this.scene.add.particles(x, y, 'fx_muzzle', {
                speed: { min: 30, max: 100 },
                angle: angle - 10,
                scale: { start: 0.5, end: 0.1 },
                alpha: { start: 1, end: 0 },
                lifespan: 200,
                quantity: 8,
                blendMode: 'ADD',
                tint: [0xFFFF00, 0xFFAA00, 0xFF4400]
            });

            this.muzzleEmitters.set(muzzleKey, emitter);
            emitter.stop();

            // Auto-cleanup after delay
            this.scene.time.delayedCall(250, () => {
                emitter.destroy();
                this.muzzleEmitters.delete(muzzleKey);
            });
        }
    }

    /**
     * Create projectile trail effect
     */
    public createProjectileTrail(projectile: Phaser.GameObjects.Sprite, weaponType: string = 'pea'): void {
        let trailConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;

        switch (weaponType) {
            case 'pea':
                trailConfig = {
                    follow: projectile,
                    frequency: 10,
                    lifespan: 300,
                    speed: 20,
                    alpha: { start: 0.8, end: 0 },
                    tint: 0x90EE90
                };
                break;
            case 'corn':
                trailConfig = {
                    follow: projectile,
                    frequency: 15,
                    lifespan: 400,
                    speed: 25,
                    alpha: { start: 1, end: 0 },
                    tint: 0xFFD700
                };
                break;
            case 'beet':
                trailConfig = {
                    follow: projectile,
                    frequency: 5,
                    lifespan: 500,
                    speed: 30,
                    alpha: { start: 0.9, end: 0 },
                    tint: 0x8A2BE2,
                    scale: { start: 0.5, end: 0.2 }
                };
                break;
        }

        const emitter = this.scene.add.particles(0, 0, null, trailConfig);
        emitter.setPosition(projectile.x, projectile.y);

        // Store reference for later cleanup
        const trailKey = `trail_${projectile.name}_${Date.now()}`;
        this.trailEmitters.set(trailKey, emitter);

        // Auto-destroy when projectile is destroyed
        const originalDestroy = projectile.destroy;
        projectile.destroy = () => {
            emitter.stop();
            this.scene.time.delayedCall(300, () => {
                emitter.destroy();
                this.trailEmitters.delete(trailKey);
            });
            originalDestroy.call(projectile);
        };
    }

    /**
     * Create impact decal on ground
     */
    public createImpactDecal(x: number, y: number, weaponType: string = 'pea'): void {
        const decal = this.getDecalFromPool();
        if (!decal) return;

        decal.setPosition(x, y);
        decal.setVisible(true);
        decal.setAlpha(1);
        decal.setScale(0.8);

        // Set texture based on weapon type
        if (this.scene.textures.exists(`fx_impact_${weaponType}`)) {
            decal.setTexture(`fx_impact_${weaponType}`);
        }

        // Animate fade-out
        this.scene.tweens.add({
            targets: decal,
            alpha: 0,
            scale: 0.3,
            duration: Phaser.Math.Between(2000, 3000),
            ease: 'Power2',
            onComplete: () => {
                decal.setVisible(false);
                this.returnDecalToPool(decal);
            }
        });
    }

    /**
     * Create shoot trail (short fading line)
     */
    public createShootTrail(startX: number, startY: number, endX: number, endY: number): void {
        const trail = this.scene.add.graphics();
        trail.lineStyle(3, 0xFFFF99, 0.8);
        trail.lineBetween(startX, startY, endX, endY);

        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => trail.destroy()
        });
    }

    /**
     * Get decal from pool (recycling system)
     */
    private getDecalFromPool(): Phaser.GameObjects.Sprite | null {
        for (const decal of this.decalPool) {
            if (!decal.active) {
                decal.setActive(true);
                return decal;
            }
        }
        return null; // Pool exhausted
    }

    /**
     * Return decal to pool
     */
    private returnDecalToPool(decal: Phaser.GameObjects.Sprite): void {
        decal.setActive(false);
        decal.setAlpha(1);
        decal.setScale(0.8);
        decal.setPosition(-100, -100); // Move off-screen
    }

    /**
     * Create weapon-specific effect
     */
    public createWeaponEffect(x: number, y: number, weaponType: string): void {
        switch (weaponType) {
            case 'pea_shooter':
                this.createMuzzleFlash(x, y, 0, 'pea');
                break;
            case 'corn_cannon':
                this.createMuzzleFlash(x, y, 0, 'corn');
                // Additional corn-specific effects
                this.scene.cameras.main.shake(100, 0.002);
                break;
            case 'beet_bazooka':
                this.createMuzzleFlash(x, y, 0, 'beet');
                // Additional beet-specific effects
                this.scene.cameras.main.shake(200, 0.004);
                break;
        }
    }

    /**
     * Update method (called every frame)
     */
    public update(): void {
        // Pool management can be handled here if needed
    }

    /**
     * Cleanup method
     */
    public destroy(): void {
        // Destroy all emitters
        this.muzzleEmitters.forEach(emitter => emitter.destroy());
        this.trailEmitters.forEach(emitter => emitter.destroy());

        // Clean up decal pool
        this.decalPool.forEach(decal => decal.destroy());

        this.muzzleEmitters.clear();
        this.trailEmitters.clear();
        this.decalPool = [];
    }
}
