/**
 * Asset Registry - Unified asset management system
 * Provides centralized string-based asset keys and handles both external and procedural fallbacks
 */

import { AssetKey } from './AssetGenerator';

export enum AssetKeys {
    // Player
    Player = 'player',

    // Enemies
    EnemyTomato = 'enemy_tomato',
    EnemyOnion = 'enemy_onion',
    EnemyPepper = 'enemy_pepper',
    EnemyBroccoli = 'enemy_broccoli',
    EnemyEggplant = 'enemy_eggplant',

    // Projectiles
    ProjectilePea = 'projectile_pea',
    ProjectileCorn = 'projectile_corn',
    ProjectileBeet = 'projectile_beet',
    ProjectileEnemy = 'projectile_enemy',

    // Particles
    ParticleExplosion = 'particle_explosion',
    ParticleMuzzle = 'particle_muzzle',
    ParticleHit = 'particle_hit',
    ParticlePickup = 'particle_pickup',
    ParticleBlood = 'particle_blood',

    // UI Elements
    UIButton = 'ui_button',
    UIPanel = 'ui_panel',
    UIHealthBarBg = 'ui_healthbar_bg',
    UIHealthBarFill = 'ui_healthbar_fill',

    // UI Icons
    UIIconHealth = 'ui_icon_health',
    UIIconScore = 'ui_icon_score',
    UIIconWave = 'ui_icon_wave',
    UIIconLocation = 'ui_icon_location',
    UIIconRadar = 'ui_icon_radar',
    UIIconAmmo = 'ui_icon_ammo',
    UIIconWeaponPea = 'ui_icon_weapon_pea',
    UIIconWeaponCorn = 'ui_icon_weapon_corn',
    UIIconWeaponBeet = 'ui_icon_weapon_beet',

    // Mobile Controls
    JoystickBase = 'joystick_base',
    JoystickThumb = 'joystick_thumb',
    ButtonShoot = 'button_shoot',
    ButtonDash = 'button_dash',
    ButtonReload = 'button_reload',
    ButtonPause = 'button_pause',

    // Environment
    Wall = 'wall',
    Floor = 'floor',

    // Power-ups
    PowerupRanch = 'powerup_ranch',
    PowerupOil = 'powerup_olive_oil', // Note: Standardized key
    PowerupFertilizer = 'powerup_fertilizer',
    PowerupHeart = 'powerup_compost_heart',

    // Effects
    ExplosionFrame0 = 'explosion_frame_0',
    ExplosionFrame1 = 'explosion_frame_1',
    ExplosionFrame2 = 'explosion_frame_2',
    ExplosionFrame3 = 'explosion_frame_3',
    ExplosionFrame4 = 'explosion_frame_4',
    ExplosionFrame5 = 'explosion_frame_5',
    ExplosionFrame6 = 'explosion_frame_6',
    ExplosionFrame7 = 'explosion_frame_7',
    MuzzleFlash = 'muzzle_flash',
    HitEffect = 'hit_effect',
    ExplosionEffect = 'explosion_effect',

    // Backgrounds (Runner Mode)
    BackgroundRunner = 'bg_runner_gradient',

    // Runner Mode Assets
    RunnerObstaclePit = 'obstacle-pit',
    RunnerObstacleSpike = 'obstacle-spike',
    RunnerObstacleLog = 'obstacle-log',
    RunnerCoin = 'coin',
    PowerUpMagnet = 'powerup-magnet',
    PowerUpShield = 'powerup-shield',
    PowerUpDoubleCoins = 'powerup-double_coins',
    PowerUpWeaponUpgrade = 'powerup-weapon_upgrade',
    DangerZoneBoss = 'danger-zone-boss',

    // Ground texture for runner
    GroundTile = 'ground-tile'
}

export class AssetRegistry {
    private scene: Phaser.Scene;
    private assetGenerator!: any; // Import('AssetGenerator').AssetGenerator;
    private missingAssets: Map<string, number> = new Map();
    private readonly FALLBACK_TIMEOUT = 5000; // Log missing assets only once every 5s to avoid spam

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initializeAsync();
    }

    private async initializeAsync(): Promise<void> {
        try {
            const { AssetGenerator } = await import('./AssetGenerator');
            this.assetGenerator = new AssetGenerator(this.scene);
            this.assetGenerator.generateAllAssets();
            this.assetGenerator.generateEffectSprites();
        } catch (error) {
            console.warn('AssetGenerator failed to load, assets will be missing:', error);
        }
    }

    /**
     * Get a texture key, ensuring it exists or providing fallback
     * @param key Asset key to resolve
     * @returns Valid texture key
     */
    public getTexture(key: string): string {
        // First, try exact key from external assets
        if (this.scene.textures.exists(key)) {
            return key;
        }

        // Try standardized keys
        const standardizedKey = this.standardizeKey(key);
        if (this.scene.textures.exists(standardizedKey)) {
            console.warn(`Using standardized key '${standardizedKey}' for '${key}'`);
            return standardizedKey;
        }

        // Log missing asset (with throttling)
        const now = Date.now();
        if (!this.missingAssets.has(key) || now - (this.missingAssets.get(key) as number) > this.FALLBACK_TIMEOUT) {
            console.warn(`Asset '${key}' not found, using fallback`);
            this.missingAssets.set(key, now);
        }

        return this.getProceduralFallback(key);
    }

    /**
     * Assert that a texture exists, logging warnings for missing assets
     * @param key Asset key to check
     */
    public assertTexture(key: string): void {
        if (!this.scene.textures.exists(key)) {
            console.warn(`Asset assertion failed: '${key}' not found`);
            this.getTexture(key); // This will generate fallback and log
        }
    }

    /**
     * Standardize asset keys to avoid common mismatches
     */
    private standardizeKey(key: string): string {
        const keyMappings: { [key: string]: string } = {
            // Power-up key variations
            'powerup_olive_oil': AssetKeys.PowerupOil,
            'powerup-compost_heart': AssetKeys.PowerupHeart,

            // Particles with different formats
            'particle_explosion': AssetKeys.ParticleExplosion,
            'particle_muzzle': AssetKeys.ParticleMuzzle,
            'particle_hit': AssetKeys.ParticleHit,

            // Runner mode assets
            'ground-tile': AssetKeys.GroundTile,
            'danger-zone-boss': AssetKeys.DangerZoneBoss
        };

        return keyMappings[key] || key;
    }

    /**
     * Get procedural fallback for when assets are missing
     */
    private getProceduralFallback(key: string): string {
        // Categorize by key patterns
        if (key.startsWith('projectile_') || key.includes('projectile')) {
            // All projectile sprites
            switch (key) {
                case AssetKeys.ProjectilePea: return 'projectile_pea';
                case AssetKeys.ProjectileCorn: return 'projectile_corn';
                case AssetKeys.ProjectileBeet: return 'projectile_beet';
                default: return 'projectile_pea'; // Default pea projectile
            }
        }

        if (key.startsWith('enemy_') || key.includes('enemy')) {
            switch (key) {
                case AssetKeys.EnemyTomato: return 'enemy_tomato';
                case AssetKeys.EnemyOnion: return 'enemy_onion';
                case AssetKeys.EnemyPepper: return 'enemy_pepper';
                case AssetKeys.EnemyBroccoli: return 'enemy_broccoli';
                case AssetKeys.EnemyEggplant: return 'enemy_eggplant';
                default: return 'enemy_tomato'; // Default enemy
            }
        }

        if (key.startsWith('particle_') || key.includes('particle')) {
            switch (key) {
                case AssetKeys.ParticleExplosion: return 'particle_explosion';
                case AssetKeys.ParticleMuzzle: return 'particle_muzzle';
                case AssetKeys.ParticleHit: return 'particle_hit';
                case AssetKeys.ParticlePickup: return 'particle_pickup';
                case AssetKeys.ParticleBlood: return 'particle_blood';
                default: return 'particle_hit'; // Small white square fallback
            }
        }

        if (key.startsWith('ui_icon_')) {
            switch (key) {
                case AssetKeys.UIIconHealth: return 'ui_icon_health';
                case AssetKeys.UIIconScore: return 'ui_icon_score';
                case AssetKeys.UIIconWave: return 'ui_icon_wave';
                case AssetKeys.UIIconLocation: return 'ui_icon_location';
                case AssetKeys.UIIconRadar: return 'ui_icon_radar';
                case AssetKeys.UIIconAmmo: return 'ui_icon_ammo';
                case AssetKeys.UIIconWeaponPea: return 'ui_icon_weapon_pea';
                case AssetKeys.UIIconWeaponCorn: return 'ui_icon_weapon_corn';
                case AssetKeys.UIIconWeaponBeet: return 'ui_icon_weapon_beet';
                default: return 'ui_icon_health'; // Default icon fallback
            }
        }

        if (key.startsWith('powerup_') || key.includes('powerup')) {
            switch (key) {
                case AssetKeys.PowerupRanch: return 'powerup_ranch';
                case AssetKeys.PowerupOil: return 'powerup_olive_oil';
                case AssetKeys.PowerupFertilizer: return 'powerup_fertilizer';
                case AssetKeys.PowerupHeart: return 'powerup_compost_heart';
                default: return 'powerup_heart'; // Default powerup
            }
        }

        if (key.startsWith('bg_')) {
            // Background fallback - return a procedural gradient
            return this.createBackgroundFallback(key);
        }

        // Obstacle fallbacks for runner mode
        if (key.startsWith('obstacle-') || key.startsWith('obstacle_')) {
            return this.createObstacleFallback(key);
        }

        // Runner powerups
        if (key.startsWith('powerup-')) {
            switch (key) {
                case AssetKeys.PowerUpMagnet: return 'powerup_magnet';
                case AssetKeys.PowerUpShield: return 'powerup_shield';
                case AssetKeys.PowerUpDoubleCoins: return 'powerup_double_coins';
                case AssetKeys.PowerUpWeaponUpgrade: return 'powerup_weapon_upgrade';
                default: return 'powerup_shield';
            }
        }

        // Coin and other runner assets
        switch (key) {
            case AssetKeys.RunnerCoin: return 'coin';
            case AssetKeys.DangerZoneBoss: return 'danger-zone-boss';
            case AssetKeys.GroundTile: return 'ground-tile';
        }

        // Final fallback for UI elements, buttons, etc.
        return 'ui_button';
    }

    /**
     * Create procedural fallback for backgrounds
     */
    private createBackgroundFallback(key: string): string {
        // Check if already created
        if (this.scene.textures.exists(key)) {
            return key;
        }

        // Create procedural gradient background
        const bgTexture = this.scene.add.renderTexture(0, 0, 800, 600);
        const graphics = this.scene.add.graphics();

        // Create gradient effect
        graphics.fillGradientStyle(0x2E7D32, 0x2E7D32, 0x1B5E20, 0x1B5E20, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Add some soil lines
        graphics.lineStyle(2, 0x4A7C59, 0.3);
        for (let i = 0; i < 10; i++) {
            graphics.lineBetween(0, i * 60, 800, i * 60);
        }

        bgTexture.draw(graphics, 0, 0);
        bgTexture.saveTexture(key);
        graphics.destroy();

        return key;
    }

    /**
     * Create procedural fallback for runner obstacles
     */
    private createObstacleFallback(key: string): string {
        // Check if already created
        if (this.scene.textures.exists(key)) {
            return key;
        }

        let width = 32, height = 32;
        let color = 0x8B4513; // Brown base

        // Determine obstacle type from key
        if (key.includes('pit')) {
            width = 64; height = 16; color = 0x000000; // Black pit
        } else if (key.includes('spike')) {
            // Triangular spike shape
            const spikeTexture = this.scene.add.renderTexture(0, 0, 32, 48);
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x808080);
            graphics.fillTriangle(16, 0, 6, 32, 26, 32); // Spike shape
            graphics.lineStyle(1, 0x404040);
            graphics.strokeTriangle(16, 0, 6, 32, 26, 32);
            spikeTexture.draw(graphics, 0, 0);
            spikeTexture.saveTexture(key);
            graphics.destroy();
            return key;
        } else if (key.includes('log')) {
            width = 64; height = 24; color = 0x654321; // Darker log
        }

        // Basic rectangular obstacle
        const obstacleTexture = this.scene.add.renderTexture(0, 0, width, height);
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(color);
        graphics.fillRect(0, 0, width, height);
        graphics.lineStyle(1, 0x333333);
        graphics.strokeRect(0, 0, width, height);
        obstacleTexture.draw(graphics, 0, 0);
        obstacleTexture.saveTexture(key);
        graphics.destroy();

        return key;
    }

    /**
     * Get strongly-typed asset keys
     */
    public static Keys = AssetKeys;
}
