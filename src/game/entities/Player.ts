/**
 * Veggie Clash - Player Entity
 * The Carrot Commando - main player character
 */

// Power-up system interfaces
interface PowerUpEffect {
    multiplier: number;
    duration: number;
    remainingTime: number;
    timerBar?: Phaser.GameObjects.Graphics;
}

// Power-up types enumeration
enum PowerUpType {
    DAMAGE_BOOST = 'RANCH_DIP',
    SPEED_BOOST = 'OLIVE_OIL',
    FIRE_RATE_BOOST = 'FERTILIZER',
    INSTANT_HEAL = 'COMPOST_HEART'
}

import Phaser from 'phaser';
import { GAME_SETTINGS, COLORS, AUDIO_KEYS } from '../config.js';
import { Projectile } from './Projectile';
import { AssetKey } from '../systems/AssetGenerator';

export class Player extends Phaser.GameObjects.Sprite {
    public health: number;
    public maxHealth: number;
    public currentWeapon: number = 0;
    public currentAmmo: number = -1; // Infinite for pea shooter
    public maxAmmo: number = -1;

    private moveSpeed: number = GAME_SETTINGS.PLAYER_SPEED;
    private isDashing: boolean = false;
    private dashCooldown: number = 0;
    private lastShotTime: number = 0;
    private invulnerabilityTime: number = 0;
    private regenTimer: number = 0;
    private lastCombatTime: number = 0;

    private moveX: number = 0;
    private moveY: number = 0;
    public projectiles: Phaser.GameObjects.Group;

    // Power-up system
    private activePowerUps: Map<PowerUpType, PowerUpEffect> = new Map();
    private baseMoveSpeed: number = GAME_SETTINGS.PLAYER_SPEED;
    private baseDamageMultiplier: number = 1.0;
    private baseFireRateMultiplier: number = 1.0;
    private powerUpTimerBars: Map<PowerUpType, Phaser.GameObjects.Graphics> = new Map();

    // Weapon data
    private weapons = [
        { name: 'Pea Shooter', damage: 10, fireRate: 150, ammo: -1, projectileTexture: AssetKey.ProjectilePea },
        { name: 'Corn Cannon', damage: 25, fireRate: 400, ammo: 30, projectileTexture: AssetKey.ProjectileCorn },
        { name: 'Beet Bazooka', damage: 50, fireRate: 800, ammo: 10, projectileTexture: AssetKey.ProjectileBeet }
    ];

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, AssetKey.Player);

        this.health = GAME_SETTINGS.PLAYER_MAX_HEALTH;
        this.maxHealth = GAME_SETTINGS.PLAYER_MAX_HEALTH;

        // Set up physics body
        scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setSize(28, 40); // Slightly smaller than sprite for better feel
        body.setOffset(2, 4);

        // Create projectiles group
        this.projectiles = scene.add.group();

        // Set initial weapon stats
        this.updateWeaponStats();

        // Visual setup
        this.setDepth(100); // Player should be on top
        this.setOrigin(0.5, 0.5);
    }

    update(delta: number): void {
        this.handleMovement();
        this.updateTimers(delta);
        this.handleRegeneration(delta);
        this.updateAnimation();
        this.updatePowerUps(delta);
    }

    private handleMovement(): void {
        const body = this.body as Phaser.Physics.Arcade.Body;

        if (this.isDashing) {
            // Dash movement is handled by tween
            return;
        }

        // Normalize diagonal movement
        const length = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY);
        if (length > 0) {
            const normalizedX = this.moveX / length;
            const normalizedY = this.moveY / length;

            body.setVelocity(
                normalizedX * this.moveSpeed,
                normalizedY * this.moveSpeed
            );
        } else {
            body.setVelocity(0, 0);
        }
    }

    private updateTimers(delta: number): void {
        if (this.dashCooldown > 0) {
            this.dashCooldown -= delta;
        }

        if (this.invulnerabilityTime > 0) {
            this.invulnerabilityTime -= delta;
            // Flash effect
            this.setAlpha(Math.sin(this.invulnerabilityTime / 50) * 0.5 + 0.5);
        } else {
            this.setAlpha(1);
        }

        if (this.regenTimer > 0) {
            this.regenTimer -= delta;
        }
    }

    private handleRegeneration(delta: number): void {
        // Start regen if out of combat for 5 seconds and not at full health
        if (Date.now() - this.lastCombatTime > GAME_SETTINGS.PLAYER_REGEN_DELAY &&
            this.health < this.maxHealth) {

            this.regenTimer += delta;
            if (this.regenTimer >= 1000) { // Regen every second
                this.health = Math.min(this.maxHealth, this.health + GAME_SETTINGS.PLAYER_REGEN_RATE);
                this.regenTimer = 0;

                // Emit health changed event
                this.scene.events.emit('playerHealthChanged', this.health);
            }
        }
    }

    private updateAnimation(): void {
        // Simple animation logic
        const isMoving = Math.abs(this.moveX) > 0.1 || Math.abs(this.moveY) > 0.1;

        if (this.isDashing) {
            // Dash animation (if available)
            if (this.anims.exists('player-dash')) {
                this.play('player-dash', true);
            }
        } else if (isMoving) {
            // Walk animation
            if (this.anims.exists('player-walk')) {
                this.play('player-walk', true);
            }
        } else {
            // Idle animation
            if (this.anims.exists('player-idle')) {
                this.play('player-idle', true);
            }
        }

        // Flip sprite based on movement direction
        if (this.moveX < -0.1) {
            this.setFlipX(true);
        } else if (this.moveX > 0.1) {
            this.setFlipX(false);
        }
    }

    /**
     * Update power-up effects and timers
     */
    private updatePowerUps(delta: number): void {
        let recalculateStats = false;

        for (const [powerUpType, effect] of this.activePowerUps) {
            effect.remainingTime -= delta;

            // Update HUD timer
            this.updatePowerUpTimerBar(powerUpType, effect);

            if (effect.remainingTime <= 0) {
                this.removePowerUp(powerUpType);
                recalculateStats = true;
            }
        }

        if (recalculateStats) {
            this.recalculateStats();
        }
    }

    /**
     * Apply power-up to player
     */
    applyPowerUp(powerUpType: PowerUpType, multiplier: number, durationMs: number): void {
        // Check stacking rules
        const existingEffect = this.activePowerUps.get(powerUpType);

        if (existingEffect) {
            // Same type - refresh duration, use higher multiplier
            existingEffect.multiplier = Math.max(existingEffect.multiplier, multiplier);
            existingEffect.remainingTime = durationMs;
            existingEffect.duration = durationMs;
            console.log(`Refreshed ${powerUpType} power-up`);
        } else {
            // New power-up - add it
            const effect: PowerUpEffect = {
                multiplier,
                duration: durationMs,
                remainingTime: durationMs
            };

            this.activePowerUps.set(powerUpType, effect);

            // Create HUD timer bar
            this.createPowerUpTimerBar(powerUpType);

            // Show pickup particle effect
            this.showPickupEffect();

            console.log(`Applied ${powerUpType} power-up`);
        }

        this.recalculateStats();
    }

    /**
     * Remove power-up effect
     */
    private removePowerUp(powerUpType: PowerUpType): void {
        const effect = this.activePowerUps.get(powerUpType);
        if (effect) {
            this.activePowerUps.delete(powerUpType);

            // Remove HUD timer
            if (effect.timerBar) {
                effect.timerBar.destroy();
            }

            console.log(`Removed ${powerUpType} power-up`);
        }
    }

    /**
     * Recalculate player stats based on active power-ups
     */
    private recalculateStats(): void {
        // Reset to base values
        let damageMultiplier = this.baseDamageMultiplier;
        let speedMultiplier = 1.0;
        let fireRateMultiplier = this.baseFireRateMultiplier;

        // Apply all active power-ups with clamping
        for (const [powerUpType, effect] of this.activePowerUps) {
            switch (powerUpType) {
                case PowerUpType.DAMAGE_BOOST:
                    damageMultiplier *= effect.multiplier;
                    break;
                case PowerUpType.SPEED_BOOST:
                    speedMultiplier *= effect.multiplier;
                    break;
                case PowerUpType.FIRE_RATE_BOOST:
                    fireRateMultiplier *= effect.multiplier;
                    break;
                case PowerUpType.INSTANT_HEAL:
                    // Instant effect already applied
                    break;
            }
        }

        // Apply caps (damage ≤ 2.0x, speed ≤ 1.5x, fire rate ≤ 2.0x)
        damageMultiplier = Math.min(damageMultiplier, 2.0);
        speedMultiplier = Math.min(speedMultiplier, 1.5);
        fireRateMultiplier = Math.min(fireRateMultiplier, 2.0);

        // Update player stats
        this.moveSpeed = this.baseMoveSpeed * speedMultiplier;

        // Emit stat changed events for HUD
        this.scene.events.emit('playerStatsChanged', {
            damageMultiplier,
            speedMultiplier: speedMultiplier - 1.0, // Send difference from base
            fireRateMultiplier: fireRateMultiplier
        });
    }

    /**
     * Create HUD timer bar for power-up
     */
    private createPowerUpTimerBar(powerUpType: PowerUpType): void {
        const barWidth = 60;
        const barHeight = 8;
        const barX = 100 + (this.activePowerUps.size * 70); // Stack bars horizontally
        const barY = 50;

        const timerBar = this.scene.add.graphics();
        timerBar.setDepth(120);

        this.powerUpTimerBars.set(powerUpType, timerBar);

        // Get color for power-up type
        const color = this.getPowerUpColor(powerUpType);

        // Register effect with timer bar reference
        const effect = this.activePowerUps.get(powerUpType);
        if (effect) {
            effect.timerBar = timerBar;
        }
    }

    /**
     * Update power-up timer bar display
     */
    private updatePowerUpTimerBar(powerUpType: PowerUpType, effect: PowerUpEffect): void {
        if (!effect.timerBar) return;

        const timerBar = effect.timerBar;
        const barWidth = 60;
        const barHeight = 8;
        const barX = 100 + (Array.from(this.activePowerUps.keys()).indexOf(powerUpType) * 70);
        const barY = 50;

        const progress = effect.remainingTime / effect.duration;

        // Clear previous
        timerBar.clear();

        // Background
        timerBar.fillStyle(0x333333, 0.8);
        timerBar.fillRect(barX, barY, barWidth, barHeight);

        // Fill
        if (progress > 0) {
            const color = this.getPowerUpColor(powerUpType);
            timerBar.fillStyle(color, 0.9);
            timerBar.fillRect(barX + 1, barY + 1, (barWidth - 2) * progress, barHeight - 2);
        }

        // Border
        timerBar.lineStyle(2, 0xFFFFFF, 1);
        timerBar.strokeRect(barX, barY, barWidth, barHeight);

        // Icon indicator
        const iconTexture = this.getPowerUpIcon(powerUpType);
        if (iconTexture) {
            const icon = this.scene.add.sprite(barX - 15, barY + barHeight/2, iconTexture);
            icon.setScale(0.5);
            icon.setDepth(121);
        }
    }

    /**
     * Get color for power-up type
     */
    private getPowerUpColor(powerUpType: PowerUpType): number {
        switch (powerUpType) {
            case PowerUpType.DAMAGE_BOOST:
                return 0xDC143C; // Crimson (red)
            case PowerUpType.SPEED_BOOST:
                return 0x4169E1; // Royal Blue
            case PowerUpType.FIRE_RATE_BOOST:
                return 0xFFD700; // Gold
            case PowerUpType.INSTANT_HEAL:
                return 0x32CD32; // LimeGreen
            default:
                return 0xFFFFFF; // White
        }
    }

    /**
     * Get icon texture for power-up type
     */
    private getPowerUpIcon(powerUpType: PowerUpType): AssetKey | null {
        switch (powerUpType) {
            case PowerUpType.DAMAGE_BOOST:
                return AssetKey.PowerupRanch;
            case PowerUpType.SPEED_BOOST:
                return AssetKey.PowerupOil;
            case PowerUpType.FIRE_RATE_BOOST:
                return AssetKey.PowerupFertilizer;
            case PowerUpType.INSTANT_HEAL:
                return AssetKey.PowerupHeart;
            default:
                return null;
        }
    }

    /**
     * Show pickup particle effect
     */
    private showPickupEffect(): void {
        // Gold particles around player
        const pickupParticles = this.scene.add.particles(this.x, this.y, AssetKey.ParticlePickup, {
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 800,
            quantity: 8,
            tint: 0xFFD700 // Gold
        });

        this.scene.time.delayedCall(1000, () => {
            pickupParticles.destroy();
        });
    }

    setMovement(x: number, y: number): void {
        this.moveX = x;
        this.moveY = y;
    }

    shoot(): void {
        const now = Date.now();
        const weapon = this.weapons[this.currentWeapon];
        const fireRate = weapon.fireRate / this.baseFireRateMultiplier; // Apply boost

        // Check fire rate
        if (now - this.lastShotTime < fireRate) {
            return;
        }

        // Check ammo
        if (weapon.ammo !== -1 && this.currentAmmo <= 0) {
            // TODO: Play empty click sound
            return;
        }

        // Calculate shooting direction towards mouse/pointer
        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);

        // Create projectile with damage boost
        const damage = Math.floor(weapon.damage * this.baseDamageMultiplier); // Apply damage boost
        const projectile = new Projectile(
            this.scene,
            this.x + Math.cos(angle) * 30, // Offset from player center
            this.y + Math.sin(angle) * 30,
            weapon.projectileTexture,
            angle,
            damage,
            true // isPlayerProjectile
        );

        // Add to both local group and scene's projectile group
        this.projectiles.add(projectile);
        this.scene.add.existing(projectile);
        this.scene.physics.add.existing(projectile);

        // Also add to scene's player projectiles group if it exists
        if ((this.scene as any).playerProjectiles) {
            (this.scene as any).playerProjectiles.add(projectile);
        }

        // Update ammo
        if (weapon.ammo !== -1) {
            this.currentAmmo--;
        }

        // Play shoot sound
        this.playShootSound();

        // Create muzzle flash effect
        this.createMuzzleFlash(angle);

        this.lastShotTime = now;
    }

    dash(): void {
        if (this.isDashing || this.dashCooldown > 0) {
            return;
        }

        // Calculate dash direction (movement direction or towards mouse if not moving)
        let dashX, dashY;

        if (Math.abs(this.moveX) > 0.1 || Math.abs(this.moveY) > 0.1) {
            // Dash in movement direction
            const length = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY);
            dashX = (this.moveX / length) * GAME_SETTINGS.PLAYER_DASH_DISTANCE;
            dashY = (this.moveY / length) * GAME_SETTINGS.PLAYER_DASH_DISTANCE;
        } else {
            // Dash towards mouse
            const pointer = this.scene.input.activePointer;
            const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
            dashX = Math.cos(angle) * GAME_SETTINGS.PLAYER_DASH_DISTANCE;
            dashY = Math.sin(angle) * GAME_SETTINGS.PLAYER_DASH_DISTANCE;
        }

        // Start dash
        this.isDashing = true;
        this.invulnerabilityTime = GAME_SETTINGS.PLAYER_DASH_DURATION;

        // Dash tween
        this.scene.tweens.add({
            targets: this,
            x: this.x + dashX,
            y: this.y + dashY,
            duration: GAME_SETTINGS.PLAYER_DASH_DURATION,
            ease: 'Power2',
            onComplete: () => {
                this.isDashing = false;
                this.dashCooldown = GAME_SETTINGS.PLAYER_DASH_COOLDOWN;
            }
        });

        // Play dash sound
        if (this.scene.sound.get(AUDIO_KEYS.SFX.DASH)) {
            this.scene.sound.play(AUDIO_KEYS.SFX.DASH, { volume: 0.5 });
        }

        // Create dash trail effect
        this.createDashTrail();
    }

    switchWeapon(direction: number): void {
        const newWeapon = (this.currentWeapon + direction + this.weapons.length) % this.weapons.length;
        this.currentWeapon = newWeapon;
        this.updateWeaponStats();

        // Emit weapon switched event
        this.scene.events.emit('weaponSwitched', this.currentWeapon);
    }

    private updateWeaponStats(): void {
        const weapon = this.weapons[this.currentWeapon];
        this.maxAmmo = weapon.ammo;
        this.currentAmmo = weapon.ammo; // Refill ammo on weapon switch
    }

    takeDamage(amount: number): void {
        if (this.isInvulnerable()) {
            return;
        }

        this.health = Math.max(0, this.health - amount);
        this.invulnerabilityTime = 500; // Brief invulnerability
        this.lastCombatTime = Date.now();
        this.regenTimer = 0; // Reset regen timer

        // Screen shake
        this.scene.cameras.main.shake(
            GAME_SETTINGS.SCREEN_SHAKE_DURATION,
            GAME_SETTINGS.SCREEN_SHAKE_INTENSITY * 0.01
        );

        // Emit health changed event
        this.scene.events.emit('playerHealthChanged', this.health);

        // Knockback effect
        this.setTint(0xF44336); // Red color for damage
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
    }

    isInvulnerable(): boolean {
        return this.invulnerabilityTime > 0;
    }

    /**
     * Apply instant heal power-up
     */
    applyHeal(amount: number): void {
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);

        // Show heal effect if health changed
        if (this.health > oldHealth) {
            // Green tint for healing
            this.setTint(0x90EE90);
            this.scene.time.delayedCall(300, () => {
                this.clearTint();
            });

            // Emit health changed event
            this.scene.events.emit('playerHealthChanged', this.health);
        }

        console.log(`Healed +${amount} health`);
    }

    private createMuzzleFlash(angle: number): void {
        const flashX = this.x + Math.cos(angle) * 25;
        const flashY = this.y + Math.sin(angle) * 25;

        const muzzleFlash = this.scene.add.sprite(flashX, flashY, AssetKey.ParticleMuzzle);
        muzzleFlash.setRotation(angle);
        muzzleFlash.setScale(0.5);
        muzzleFlash.setDepth(99);

        this.scene.tweens.add({
            targets: muzzleFlash,
            alpha: 0,
            scale: 0.8,
            duration: 100,
            onComplete: () => muzzleFlash.destroy()
        });
    }

    private createDashTrail(): void {
        // Create particle trail
        const trail = this.scene.add.particles(this.x, this.y, AssetKey.ParticleHit, {
            speed: 50,
            scale: { start: 0.3, end: 0 },
            lifespan: 300,
            quantity: 3,
            tint: 0xFF9800 // Orange color for dash trail
        });

        // Follow player during dash
        this.scene.tweens.add({
            targets: trail,
            x: this.x,
            y: this.y,
            duration: GAME_SETTINGS.PLAYER_DASH_DURATION,
            onComplete: () => {
                trail.stop();
                this.scene.time.delayedCall(500, () => trail.destroy());
            }
        });
    }

    private playShootSound(): void {
        const weapon = this.weapons[this.currentWeapon];
        let soundKey = AUDIO_KEYS.SFX.SHOOT_PEA;

        switch (this.currentWeapon) {
            case 0:
                soundKey = AUDIO_KEYS.SFX.SHOOT_PEA;
                break;
            case 1:
                soundKey = AUDIO_KEYS.SFX.SHOOT_CORN;
                break;
            case 2:
                soundKey = AUDIO_KEYS.SFX.SHOOT_BEET;
                break;
        }

        if (this.scene.sound.get(soundKey)) {
            this.scene.sound.play(soundKey, { volume: 0.4 });
        }
    }

    getProjectiles(): Phaser.GameObjects.Group {
        return this.projectiles;
    }

    destroy(fromScene?: boolean): void {
        // Clean up power-up timer bars
        for (const timerBar of this.powerUpTimerBars.values()) {
            timerBar.destroy();
        }
        this.powerUpTimerBars.clear();
        this.activePowerUps.clear();

        if (this.projectiles) {
            this.projectiles.destroy(true);
        }
        super.destroy(fromScene);
    }
}
