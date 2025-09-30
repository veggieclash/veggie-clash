/**
 * Asset Generator - Creates procedural game assets at runtime
 * Generates sprites, particles, UI elements, and animations programmatically
 * This allows the game to run without requiring external art files
 */

// Standardized asset key enum to prevent mismatches
export enum AssetKey {
    // Player
    Player = "player",

    // Enemies
    EnemyTomato = "enemy_tomato",
    EnemyOnion = "enemy_onion",
    EnemyPepper = "enemy_pepper",
    EnemyBroccoli = "enemy_broccoli",
    EnemyEggplant = "enemy_eggplant",

    // Projectiles
    ProjectilePea = "projectile_pea",
    ProjectileCorn = "projectile_corn",
    ProjectileBeet = "projectile_beet",
    ProjectileEnemy = "projectile_enemy",

    // Particles
    ParticleExplosion = "particle_explosion",
    ParticleMuzzle = "particle_muzzle",
    ParticleHit = "particle_hit",
    ParticlePickup = "particle_pickup",
    ParticleBlood = "particle_blood",

    // UI Elements
    UIButton = "ui_button",
    UIPanel = "ui_panel",
    UIHealthBarBg = "ui_healthbar_bg",
    UIHealthBarFill = "ui_healthbar_fill",

    // UI Icons
    UIIconHealth = "ui_icon_health",
    UIIconScore = "ui_icon_score",
    UIIconWave = "ui_icon_wave",
    UIIconLocation = "ui_icon_location",
    UIIconRadar = "ui_icon_radar",
    UIIconAmmo = "ui_icon_ammo",
    UIIconWeaponPea = "ui_icon_weapon_pea",
    UIIconWeaponCorn = "ui_icon_weapon_corn",
    UIIconWeaponBeet = "ui_icon_weapon_beet",

    // Mobile Controls
    JoystickBase = "joystick_base",
    JoystickThumb = "joystick_thumb",
    ButtonShoot = "button_shoot",
    ButtonDash = "button_dash",
    ButtonReload = "button_reload",
    ButtonPause = "button_pause",

    // Environment
    Wall = "wall",
    Floor = "floor",

    // Power-ups
    PowerupRanch = "powerup_ranch",
    PowerupOil = "powerup_oil",
    PowerupFertilizer = "powerup_fertilizer",
    PowerupHeart = "powerup_heart",

    // Effects
    ExplosionFrame0 = "explosion_frame_0",
    ExplosionFrame1 = "explosion_frame_1",
    ExplosionFrame2 = "explosion_frame_2",
    ExplosionFrame3 = "explosion_frame_3",
    ExplosionFrame4 = "explosion_frame_4",
    ExplosionFrame5 = "explosion_frame_5",
    ExplosionFrame6 = "explosion_frame_6",
    ExplosionFrame7 = "explosion_frame_7",
    MuzzleFlash = "muzzle_flash",
    HitEffect = "hit_effect",
    ExplosionEffect = "explosion_effect"
}

export class AssetGenerator {
    private scene: Phaser.Scene;
    private graphics: Phaser.GameObjects.Graphics;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
    }

    /**
     * Generate all game assets
     */
    public generateAllAssets(): void {
        console.log('AssetGenerator: Generating procedural assets...');
        
        // Generate player assets
        this.generatePlayerAssets();
        
        // Generate enemy assets
        this.generateEnemyAssets();
        
        // Generate weapon and projectile assets
        this.generateWeaponAssets();
        
        // Generate particle assets
        this.generateParticleAssets();
        
        // Generate UI assets
        this.generateUIAssets();
        
        // Generate mobile control assets
        this.generateMobileAssets();
        
        // Generate environment assets
        this.generateEnvironmentAssets();
        
        // Generate power-up assets
        this.generatePowerUpAssets();
        
        console.log('AssetGenerator: All assets generated successfully');
    }

    private generatePlayerAssets(): void {
        // Player (Captain Carrot) - Disney-style cute carrot warrior
        const playerTexture = this.scene.add.renderTexture(0, 0, 40, 56);
        this.graphics.clear();
        
        // Draw black outline for character definition
        this.graphics.fillStyle(0x000000);
        this.graphics.fillCircle(20, 35, 16); // Body outline
        this.graphics.fillCircle(20, 20, 14); // Head outline
        
        // Carrot body (bright orange gradient effect)
        this.graphics.fillStyle(0xFF8C42);
        this.graphics.fillCircle(20, 35, 14); // Rounded carrot body
        
        // Body gradient highlights
        this.graphics.fillStyle(0xFFB366);
        this.graphics.fillCircle(17, 32, 8); // Left highlight
        this.graphics.fillCircle(23, 38, 6); // Right highlight
        
        // Carrot head (slightly lighter)
        this.graphics.fillStyle(0xFFA555);
        this.graphics.fillCircle(20, 20, 12);
        
        // Carrot leaves (vibrant blue-green for contrast)
        this.graphics.fillStyle(0x00CED1);
        // Multiple leaf shapes
        this.graphics.fillEllipse(15, 8, 8, 16);
        this.graphics.fillEllipse(20, 6, 8, 18);
        this.graphics.fillEllipse(25, 8, 8, 16);
        
        // Leaf details
        this.graphics.fillStyle(0x20B2AA);
        this.graphics.fillEllipse(15, 8, 4, 8);
        this.graphics.fillEllipse(20, 6, 4, 9);
        this.graphics.fillEllipse(25, 8, 4, 8);
        
        // Large Disney-style eyes with sparkle
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillCircle(16, 18, 4); // Left eye
        this.graphics.fillCircle(24, 18, 4); // Right eye
        
        // Eye pupils
        this.graphics.fillStyle(0x000000);
        this.graphics.fillCircle(17, 19, 2);
        this.graphics.fillCircle(23, 19, 2);
        
        // Eye sparkles (Disney style)
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillCircle(18, 18, 1);
        this.graphics.fillCircle(24, 18, 1);
        
        // Happy mouth
        this.graphics.fillStyle(0x000000);
        this.graphics.fillEllipse(20, 24, 6, 3);
        
        // Cute blush marks
        this.graphics.fillStyle(0xFF6B9D);
        this.graphics.fillCircle(12, 22, 2);
        this.graphics.fillCircle(28, 22, 2);
        
        // Battle gear - cute helmet
        this.graphics.fillStyle(0x4169E1);
        this.graphics.fillEllipse(20, 14, 18, 8);
        
        // Helmet shine
        this.graphics.fillStyle(0x87CEEB);
        this.graphics.fillEllipse(20, 12, 8, 3);
        
        // Tiny arms
        this.graphics.fillStyle(0xFF8C42);
        this.graphics.fillCircle(8, 30, 3);
        this.graphics.fillCircle(32, 30, 3);
        
        // Render to texture
        playerTexture.draw(this.graphics, 0, 0);
        playerTexture.saveTexture('player');
        
        console.log('Generated Disney-style player texture');
    }

    private generateEnemyAssets(): void {
        // Tomato Trooper (red with helmet)
        this.generateEnemyAsset('enemy_tomato', {
            body: 0xDC143C,
            accent: 0x8B0000,
            helmet: 0x2D4A22,
            size: { width: 28, height: 28 },
            shape: 'round'
        });
        
        // Onion Operative (white/yellow with layers)
        this.generateEnemyAsset('enemy_onion', {
            body: 0xFFF8DC,
            accent: 0xF0E68C,
            helmet: 0x8B4513,
            size: { width: 24, height: 32 },
            shape: 'bulb'
        });
        
        // Pepper Sniper (red with scope)
        this.generateEnemyAsset('enemy_pepper', {
            body: 0xFF4500,
            accent: 0xFF6347,
            helmet: 0x000000,
            size: { width: 16, height: 40 },
            shape: 'long'
        });
        
        // Broccoli Brute (green, large)
        this.generateEnemyAsset('enemy_broccoli', {
            body: 0x228B22,
            accent: 0x006400,
            helmet: 0x2F4F4F,
            size: { width: 36, height: 44 },
            shape: 'tree'
        });
        
        // Boss Eggplant (purple, huge)
        this.generateEnemyAsset('enemy_eggplant', {
            body: 0x663399,
            accent: 0x4B0082,
            helmet: 0xFFD700,
            size: { width: 64, height: 80 },
            shape: 'oval'
        });
    }

    private generateEnemyAsset(key: string, config: any): void {
        const texture = this.scene.add.renderTexture(0, 0, config.size.width + 8, config.size.height + 8);
        this.graphics.clear();
        
        const centerX = (config.size.width + 8) / 2;
        const centerY = (config.size.height + 8) / 2;
        
        // Black outline for definition
        this.graphics.fillStyle(0x000000);
        
        // Draw Disney-style characters based on shape type
        switch (config.shape) {
            case 'round':
                // Tommy Tomato - cute round tomato
                this.graphics.fillCircle(centerX, centerY, config.size.width / 2 + 2);
                this.graphics.fillStyle(config.body);
                this.graphics.fillCircle(centerX, centerY, config.size.width / 2);
                
                // Tomato highlights
                this.graphics.fillStyle(0xFF6B6B);
                this.graphics.fillCircle(centerX - 4, centerY - 3, 6);
                
                // Leafy crown
                this.graphics.fillStyle(0x32CD32);
                this.graphics.fillEllipse(centerX - 6, centerY - 10, 4, 8);
                this.graphics.fillEllipse(centerX, centerY - 12, 4, 8);
                this.graphics.fillEllipse(centerX + 6, centerY - 10, 4, 8);
                break;
                
            case 'bulb':
                // Ollie Onion - adorable layered onion
                this.graphics.fillEllipse(centerX, centerY, config.size.width + 2, config.size.height + 2);
                this.graphics.fillStyle(config.body);
                this.graphics.fillEllipse(centerX, centerY, config.size.width - 2, config.size.height - 4);
                
                // Onion layers with cute colors
                this.graphics.fillStyle(0xFFFACD);
                this.graphics.fillEllipse(centerX, centerY, config.size.width - 6, config.size.height - 8);
                this.graphics.fillStyle(0xF5F5DC);
                this.graphics.fillEllipse(centerX, centerY, config.size.width - 10, config.size.height - 12);
                
                // Root sprouts
                this.graphics.fillStyle(0x90EE90);
                this.graphics.fillRect(centerX - 2, centerY - config.size.height/2 - 4, 4, 8);
                break;
                
            case 'long':
                // Pete Pepper - spicy but cute pepper
                this.graphics.fillEllipse(centerX, centerY, 14, config.size.height + 2);
                this.graphics.fillStyle(config.body);
                this.graphics.fillEllipse(centerX, centerY, 12, config.size.height - 2);
                
                // Pepper highlights
                this.graphics.fillStyle(0xFF7F50);
                this.graphics.fillEllipse(centerX - 2, centerY - 8, 8, 16);
                
                // Green stem
                this.graphics.fillStyle(0x228B22);
                this.graphics.fillEllipse(centerX, centerY - config.size.height/2 - 2, 8, 6);
                break;
                
            case 'tree':
                // Benny Broccoli - friendly tree broccoli
                this.graphics.fillCircle(centerX, centerY + 8, 16);
                this.graphics.fillStyle(config.body);
                
                // Multiple florets for tree appearance
                this.graphics.fillCircle(centerX - 6, centerY - 6, 8);
                this.graphics.fillCircle(centerX + 6, centerY - 6, 8);
                this.graphics.fillCircle(centerX, centerY, 10);
                this.graphics.fillCircle(centerX - 4, centerY + 8, 6);
                this.graphics.fillCircle(centerX + 4, centerY + 8, 6);
                
                // Broccoli highlights
                this.graphics.fillStyle(0x90EE90);
                this.graphics.fillCircle(centerX - 6, centerY - 6, 4);
                this.graphics.fillCircle(centerX + 6, centerY - 6, 4);
                this.graphics.fillCircle(centerX, centerY, 5);
                
                // Thick stem
                this.graphics.fillStyle(0x8FBC8F);
                this.graphics.fillRect(centerX - 3, centerY + 12, 6, config.size.height - 20);
                break;
                
            case 'oval':
                // Boss Eddie Eggplant - majestic purple eggplant
                this.graphics.fillEllipse(centerX, centerY, config.size.width + 2, config.size.height + 2);
                this.graphics.fillStyle(config.body);
                this.graphics.fillEllipse(centerX, centerY, config.size.width - 4, config.size.height - 8);
                
                // Eggplant shine
                this.graphics.fillStyle(0x9370DB);
                this.graphics.fillEllipse(centerX - 8, centerY - 6, 16, 24);
                
                // Golden crown (boss status)
                this.graphics.fillStyle(0xFFD700);
                this.graphics.fillRect(centerX - 12, centerY - config.size.height/2 - 2, 24, 8);
                // Crown points
                this.graphics.fillTriangle(centerX - 8, centerY - config.size.height/2 - 2, centerX - 6, centerY - config.size.height/2 - 8, centerX - 4, centerY - config.size.height/2 - 2);
                this.graphics.fillTriangle(centerX - 2, centerY - config.size.height/2 - 2, centerX, centerY - config.size.height/2 - 10, centerX + 2, centerY - config.size.height/2 - 2);
                this.graphics.fillTriangle(centerX + 4, centerY - config.size.height/2 - 2, centerX + 6, centerY - config.size.height/2 - 8, centerX + 8, centerY - config.size.height/2 - 2);
                break;
        }
        
        // Disney-style eyes for all characters
        const eyeSize = config.size.width < 30 ? 3 : (config.size.width < 50 ? 4 : 6);
        const eyeOffset = config.size.width < 30 ? 4 : (config.size.width < 50 ? 5 : 8);
        
        // White eye backgrounds
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillCircle(centerX - eyeOffset, centerY - 2, eyeSize);
        this.graphics.fillCircle(centerX + eyeOffset, centerY - 2, eyeSize);
        
        // Eye pupils (angry for enemies)
        this.graphics.fillStyle(0x000000);
        this.graphics.fillCircle(centerX - eyeOffset + 1, centerY - 1, eyeSize/2);
        this.graphics.fillCircle(centerX + eyeOffset - 1, centerY - 1, eyeSize/2);
        
        // Angry eyebrows
        this.graphics.fillStyle(0x8B0000);
        this.graphics.fillRect(centerX - eyeOffset - 2, centerY - 6, eyeSize + 2, 2);
        this.graphics.fillRect(centerX + eyeOffset - 2, centerY - 6, eyeSize + 2, 2);
        
        // Mouth (frown for enemies)
        this.graphics.fillStyle(0x000000);
        const mouthSize = config.size.width < 30 ? 4 : 6;
        this.graphics.fillEllipse(centerX, centerY + 6, mouthSize, 2);
        
        texture.draw(this.graphics, 0, 0);
        texture.saveTexture(key);
        
        console.log(`Generated Disney-style ${key} texture`);
    }

    private generateWeaponAssets(): void {
        // Pea Shooter projectiles
        const peaTexture = this.scene.add.renderTexture(0, 0, 8, 8);
        this.graphics.clear();
        this.graphics.fillStyle(0x9ACD32);
        this.graphics.fillCircle(4, 4, 3);
        peaTexture.draw(this.graphics, 0, 0);
        peaTexture.saveTexture('projectile_pea');
        
        // Corn Cannon projectiles (larger, yellow)
        const cornTexture = this.scene.add.renderTexture(0, 0, 12, 16);
        this.graphics.clear();
        this.graphics.fillStyle(0xFFD700);
        this.graphics.fillRect(2, 0, 8, 16);
        this.graphics.fillStyle(0xFFA500);
        this.graphics.fillRect(0, 2, 12, 4);
        this.graphics.fillRect(0, 8, 12, 4);
        cornTexture.draw(this.graphics, 0, 0);
        cornTexture.saveTexture('projectile_corn');
        
        // Beet Bazooka projectiles (large, purple)
        const beetTexture = this.scene.add.renderTexture(0, 0, 16, 20);
        this.graphics.clear();
        this.graphics.fillStyle(0x8B008B);
        this.graphics.fillEllipse(8, 10, 14, 18);
        this.graphics.fillStyle(0x4B0082);
        this.graphics.fillRect(6, 0, 4, 8);
        beetTexture.draw(this.graphics, 0, 0);
        beetTexture.saveTexture('projectile_beet');

        // Enemy projectiles (varied colors for different enemies)
        const enemyTexture = this.scene.add.renderTexture(0, 0, 12, 12);
        this.graphics.clear();
        this.graphics.fillStyle(0xDC143C); // Tomato red
        this.graphics.fillCircle(6, 6, 5);
        enemyTexture.draw(this.graphics, 0, 0);
        enemyTexture.saveTexture('projectile_enemy');

        console.log('Generated weapon projectile textures');
    }

    private generateParticleAssets(): void {
        // Explosion particles (orange/red)
        const explosionParticle = this.scene.add.renderTexture(0, 0, 4, 4);
        this.graphics.clear();
        this.graphics.fillStyle(0xFF4500);
        this.graphics.fillRect(0, 0, 4, 4);
        explosionParticle.draw(this.graphics, 0, 0);
        explosionParticle.saveTexture('particle_explosion');
        
        // Muzzle flash particles (bright yellow)
        const muzzleParticle = this.scene.add.renderTexture(0, 0, 3, 3);
        this.graphics.clear();
        this.graphics.fillStyle(0xFFFF00);
        this.graphics.fillRect(0, 0, 3, 3);
        muzzleParticle.draw(this.graphics, 0, 0);
        muzzleParticle.saveTexture('particle_muzzle');
        
        // Hit effect particles (white sparks)
        const hitParticle = this.scene.add.renderTexture(0, 0, 2, 2);
        this.graphics.clear();
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillRect(0, 0, 2, 2);
        hitParticle.draw(this.graphics, 0, 0);
        hitParticle.saveTexture('particle_hit');
        
        // Power-up pickup particles (gold)
        const pickupParticle = this.scene.add.renderTexture(0, 0, 3, 3);
        this.graphics.clear();
        this.graphics.fillStyle(0xFFD700);
        this.graphics.fillRect(0, 0, 3, 3);
        pickupParticle.draw(this.graphics, 0, 0);
        pickupParticle.saveTexture('particle_pickup');
        
        // Blood particles (red)
        const bloodParticle = this.scene.add.renderTexture(0, 0, 2, 2);
        this.graphics.clear();
        this.graphics.fillStyle(0xDC143C);
        this.graphics.fillRect(0, 0, 2, 2);
        bloodParticle.draw(this.graphics, 0, 0);
        bloodParticle.saveTexture('particle_blood');
        
        console.log('Generated particle textures');
    }

    private generateUIAssets(): void {
        // Button background (rounded rectangle)
        const buttonTexture = this.scene.add.renderTexture(0, 0, 200, 50);
        this.graphics.clear();
        this.graphics.fillStyle(0x4A7C59);
        this.graphics.fillRoundedRect(2, 2, 196, 46, 8);
        this.graphics.lineStyle(2, 0x2D4A22);
        this.graphics.strokeRoundedRect(2, 2, 196, 46, 8);
        buttonTexture.draw(this.graphics, 0, 0);
        buttonTexture.saveTexture('ui_button');
        
        // Panel background
        const panelTexture = this.scene.add.renderTexture(0, 0, 300, 200);
        this.graphics.clear();
        this.graphics.fillStyle(0x2F4F4F, 0.9);
        this.graphics.fillRoundedRect(0, 0, 300, 200, 10);
        this.graphics.lineStyle(3, 0x4A7C59);
        this.graphics.strokeRoundedRect(0, 0, 300, 200, 10);
        panelTexture.draw(this.graphics, 0, 0);
        panelTexture.saveTexture('ui_panel');
        
        // Health bar background
        const healthBarBg = this.scene.add.renderTexture(0, 0, 100, 12);
        this.graphics.clear();
        this.graphics.fillStyle(0x8B0000);
        this.graphics.fillRoundedRect(0, 0, 100, 12, 6);
        healthBarBg.draw(this.graphics, 0, 0);
        healthBarBg.saveTexture('ui_healthbar_bg');
        
        // Health bar fill
        const healthBarFill = this.scene.add.renderTexture(0, 0, 100, 12);
        this.graphics.clear();
        this.graphics.fillStyle(0x32CD32);
        this.graphics.fillRoundedRect(0, 0, 100, 12, 6);
        healthBarFill.draw(this.graphics, 0, 0);
        healthBarFill.saveTexture('ui_healthbar_fill');
        
        // Generate HUD icons to replace emojis
        this.generateHUDIcons();
        
        console.log('Generated UI textures');
    }

    /**
     * Generate HUD icons to replace emoji characters
     */
    private generateHUDIcons(): void {
        // Health Heart Icon (❤️ replacement)
        const heartIcon = this.scene.add.renderTexture(0, 0, 20, 18);
        this.graphics.clear();
        this.graphics.fillStyle(0xFF4444);
        // Draw heart shape with two circles and triangle
        this.graphics.fillCircle(6, 6, 4);
        this.graphics.fillCircle(14, 6, 4);
        this.graphics.fillTriangle(10, 14, 3, 8, 17, 8);
        // Heart highlight
        this.graphics.fillStyle(0xFF8888);
        this.graphics.fillCircle(5, 5, 2);
        this.graphics.fillCircle(13, 5, 2);
        heartIcon.draw(this.graphics, 0, 0);
        heartIcon.saveTexture('ui_icon_health');

        // Trophy/Score Icon (🏆 replacement)
        const trophyIcon = this.scene.add.renderTexture(0, 0, 18, 20);
        this.graphics.clear();
        this.graphics.fillStyle(0xFFD700);
        // Trophy cup
        this.graphics.fillEllipse(9, 8, 12, 10);
        // Trophy handles
        this.graphics.fillEllipse(3, 8, 4, 6);
        this.graphics.fillEllipse(15, 8, 4, 6);
        // Trophy base
        this.graphics.fillRect(6, 14, 6, 4);
        this.graphics.fillRect(4, 18, 10, 2);
        // Trophy shine
        this.graphics.fillStyle(0xFFFF88);
        this.graphics.fillEllipse(7, 6, 4, 3);
        trophyIcon.draw(this.graphics, 0, 0);
        trophyIcon.saveTexture('ui_icon_score');

        // Wave Icon (🌊 replacement)
        const waveIcon = this.scene.add.renderTexture(0, 0, 20, 16);
        this.graphics.clear();
        this.graphics.fillStyle(0x4FB3D9);
        // Draw wave pattern
        this.graphics.fillEllipse(4, 8, 8, 4);
        this.graphics.fillEllipse(12, 6, 6, 3);
        this.graphics.fillEllipse(16, 10, 4, 2);
        // Wave highlights
        this.graphics.fillStyle(0x87CEEB);
        this.graphics.fillEllipse(4, 6, 4, 2);
        this.graphics.fillEllipse(12, 4, 3, 1);
        waveIcon.draw(this.graphics, 0, 0);
        waveIcon.saveTexture('ui_icon_wave');

        // Level/Location Icon (📍 replacement)
        const locationIcon = this.scene.add.renderTexture(0, 0, 16, 20);
        this.graphics.clear();
        this.graphics.fillStyle(0xFF4444);
        // Pin shape
        this.graphics.fillCircle(8, 6, 6);
        this.graphics.fillTriangle(8, 18, 4, 10, 12, 10);
        // Pin highlight
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillCircle(8, 6, 3);
        locationIcon.draw(this.graphics, 0, 0);
        locationIcon.saveTexture('ui_icon_location');

        // Weapon Icons
        this.generateWeaponIcons();

        // Radar/Map Icon (📡 replacement)
        const radarIcon = this.scene.add.renderTexture(0, 0, 18, 18);
        this.graphics.clear();
        this.graphics.fillStyle(0x00FF00);
        // Radar circles
        this.graphics.strokeCircle(9, 9, 8);
        this.graphics.strokeCircle(9, 9, 5);
        this.graphics.strokeCircle(9, 9, 2);
        // Radar sweep line
        this.graphics.lineBetween(9, 9, 15, 5);
        // Center dot
        this.graphics.fillCircle(9, 9, 1);
        radarIcon.draw(this.graphics, 0, 0);
        radarIcon.saveTexture('ui_icon_radar');

        // Ammo Counter Icon
        const ammoIcon = this.scene.add.renderTexture(0, 0, 16, 20);
        this.graphics.clear();
        this.graphics.fillStyle(0xBBBBBB);
        // Bullet shape
        this.graphics.fillEllipse(8, 4, 6, 8);
        this.graphics.fillRect(5, 8, 6, 8);
        // Bullet tip
        this.graphics.fillStyle(0x444444);
        this.graphics.fillTriangle(8, 0, 5, 6, 11, 6);
        ammoIcon.draw(this.graphics, 0, 0);
        ammoIcon.saveTexture('ui_icon_ammo');

        console.log('Generated HUD icon sprites');
    }

    /**
     * Generate weapon-specific icons for UI
     */
    private generateWeaponIcons(): void {
        // Pea Shooter Icon (🔫 replacement)
        const peaGunIcon = this.scene.add.renderTexture(0, 0, 20, 12);
        this.graphics.clear();
        this.graphics.fillStyle(0x8FBC8F);
        // Gun barrel
        this.graphics.fillRect(8, 4, 12, 4);
        // Gun handle
        this.graphics.fillRect(2, 6, 8, 6);
        // Gun details
        this.graphics.fillStyle(0x556B2F);
        this.graphics.fillRect(0, 8, 6, 2);
        this.graphics.fillRect(18, 5, 2, 2);
        peaGunIcon.draw(this.graphics, 0, 0);
        peaGunIcon.saveTexture('ui_icon_weapon_pea');

        // Corn Cannon Icon (🌽 replacement)
        const cornCannonIcon = this.scene.add.renderTexture(0, 0, 20, 12);
        this.graphics.clear();
        this.graphics.fillStyle(0xFFD700);
        // Cannon barrel
        this.graphics.fillRect(6, 3, 14, 6);
        // Cannon base
        this.graphics.fillRect(0, 6, 8, 4);
        // Cannon details
        this.graphics.fillStyle(0xFFA500);
        this.graphics.fillRect(18, 4, 2, 4);
        this.graphics.fillRect(2, 8, 4, 1);
        cornCannonIcon.draw(this.graphics, 0, 0);
        cornCannonIcon.saveTexture('ui_icon_weapon_corn');

        // Beet Bazooka Icon (💥 replacement)
        const beetBazookaIcon = this.scene.add.renderTexture(0, 0, 20, 14);
        this.graphics.clear();
        this.graphics.fillStyle(0x8B008B);
        // Bazooka tube
        this.graphics.fillRect(4, 4, 16, 6);
        // Bazooka grip
        this.graphics.fillRect(0, 7, 6, 4);
        // Bazooka details
        this.graphics.fillStyle(0xFF00FF);
        this.graphics.fillRect(16, 5, 4, 4);
        this.graphics.fillRect(2, 9, 2, 1);
        beetBazookaIcon.draw(this.graphics, 0, 0);
        beetBazookaIcon.saveTexture('ui_icon_weapon_beet');
    }

    private generateMobileAssets(): void {
        // Virtual joystick base
        const joystickBase = this.scene.add.renderTexture(0, 0, 100, 100);
        this.graphics.clear();
        this.graphics.fillStyle(0x000000, 0.3);
        this.graphics.fillCircle(50, 50, 48);
        this.graphics.lineStyle(2, 0xFFFFFF, 0.6);
        this.graphics.strokeCircle(50, 50, 48);
        joystickBase.draw(this.graphics, 0, 0);
        joystickBase.saveTexture('joystick_base');
        
        // Virtual joystick thumb
        const joystickThumb = this.scene.add.renderTexture(0, 0, 60, 60);
        this.graphics.clear();
        this.graphics.fillStyle(0x4A7C59, 0.8);
        this.graphics.fillCircle(30, 30, 28);
        this.graphics.lineStyle(2, 0x2D4A22);
        this.graphics.strokeCircle(30, 30, 28);
        joystickThumb.draw(this.graphics, 0, 0);
        joystickThumb.saveTexture('joystick_thumb');
        
        // Touch buttons
        const touchButton = this.scene.add.renderTexture(0, 0, 60, 60);
        this.graphics.clear();
        this.graphics.fillStyle(0x4A7C59, 0.7);
        this.graphics.fillCircle(30, 30, 28);
        this.graphics.lineStyle(2, 0x2D4A22);
        this.graphics.strokeCircle(30, 30, 28);
        touchButton.draw(this.graphics, 0, 0);
        touchButton.saveTexture('button_shoot');
        
        // Create copies for different button types
        touchButton.saveTexture('button_dash');
        touchButton.saveTexture('button_reload');
        touchButton.saveTexture('button_pause');
        
        console.log('Generated mobile control textures');
    }

    private generateEnvironmentAssets(): void {
        // Wall tile
        const wallTexture = this.scene.add.renderTexture(0, 0, 32, 32);
        this.graphics.clear();
        this.graphics.fillStyle(0x8B4513);
        this.graphics.fillRect(0, 0, 32, 32);
        this.graphics.fillStyle(0xA0522D);
        this.graphics.fillRect(2, 2, 28, 28);
        this.graphics.fillStyle(0x654321);
        this.graphics.fillRect(16, 0, 2, 32);
        this.graphics.fillRect(0, 16, 32, 2);
        wallTexture.draw(this.graphics, 0, 0);
        wallTexture.saveTexture('wall');
        
        // Floor tile
        const floorTexture = this.scene.add.renderTexture(0, 0, 32, 32);
        this.graphics.clear();
        this.graphics.fillStyle(0x228B22);
        this.graphics.fillRect(0, 0, 32, 32);
        this.graphics.fillStyle(0x32CD32);
        this.graphics.fillRect(4, 4, 24, 24);
        // Add some grass details
        this.graphics.fillStyle(0x006400);
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            this.graphics.fillRect(x, y, 1, 2);
        }
        floorTexture.draw(this.graphics, 0, 0);
        floorTexture.saveTexture('floor');
        
        console.log('Generated environment textures');
    }

    private generatePowerUpAssets(): void {
        // Ranch Dip (damage boost) - white container
        const ranchTexture = this.scene.add.renderTexture(0, 0, 24, 24);
        this.graphics.clear();
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillRoundedRect(2, 6, 20, 16, 4);
        this.graphics.fillStyle(0xF5F5DC);
        this.graphics.fillRoundedRect(4, 8, 16, 12, 2);
        this.graphics.fillStyle(0xFF6347);
        this.graphics.fillRect(8, 2, 8, 6);
        ranchTexture.draw(this.graphics, 0, 0);
        ranchTexture.saveTexture('powerup_ranch');
        
        // Olive Oil (speed boost) - green bottle
        const oilTexture = this.scene.add.renderTexture(0, 0, 24, 24);
        this.graphics.clear();
        this.graphics.fillStyle(0x6B8E23);
        this.graphics.fillRect(6, 4, 12, 18);
        this.graphics.fillStyle(0x556B2F);
        this.graphics.fillRect(8, 2, 8, 4);
        this.graphics.fillStyle(0x9ACD32);
        this.graphics.fillRect(8, 6, 8, 14);
        oilTexture.draw(this.graphics, 0, 0);
        oilTexture.saveTexture('powerup_oil');
        
        // Fertilizer (rapid fire) - brown bag
        const fertilizerTexture = this.scene.add.renderTexture(0, 0, 24, 24);
        this.graphics.clear();
        this.graphics.fillStyle(0x8B4513);
        this.graphics.fillRect(4, 6, 16, 16);
        this.graphics.fillStyle(0xA0522D);
        this.graphics.fillRect(6, 8, 12, 12);
        this.graphics.fillStyle(0x654321);
        this.graphics.fillRect(8, 2, 8, 8);
        fertilizerTexture.draw(this.graphics, 0, 0);
        fertilizerTexture.saveTexture('powerup_fertilizer');
        
        // Compost Heart (health) - heart shape
        const heartTexture = this.scene.add.renderTexture(0, 0, 24, 24);
        this.graphics.clear();
        this.graphics.fillStyle(0x32CD32);
        // Draw heart shape with two circles and a triangle
        this.graphics.fillCircle(8, 8, 6);
        this.graphics.fillCircle(16, 8, 6);
        this.graphics.fillTriangle(12, 18, 4, 12, 20, 12);
        heartTexture.draw(this.graphics, 0, 0);
        heartTexture.saveTexture('powerup_heart');
        
        console.log('Generated power-up textures');
    }

    /**
     * Generate effect sprites for visual effects
     */
    public generateEffectSprites(): void {
        // Explosion animation frames (simple expanding circle)
        for (let frame = 0; frame < 8; frame++) {
            const size = 32 + (frame * 8);
            const explosionFrame = this.scene.add.renderTexture(0, 0, size, size);
            this.graphics.clear();
            
            const alpha = 1.0 - (frame / 8);
            const innerColor = Phaser.Display.Color.GetColor(255, 255 - (frame * 30), 0);
            const outerColor = Phaser.Display.Color.GetColor(255 - (frame * 20), 0, 0);
            
            this.graphics.fillStyle(outerColor, alpha);
            this.graphics.fillCircle(size/2, size/2, size/2);
            this.graphics.fillStyle(innerColor, alpha * 0.7);
            this.graphics.fillCircle(size/2, size/2, size/3);
            
            explosionFrame.draw(this.graphics, 0, 0);
            explosionFrame.saveTexture(`explosion_frame_${frame}`);
        }
        
        // Muzzle flash
        const muzzleFlashTexture = this.scene.add.renderTexture(0, 0, 32, 16);
        this.graphics.clear();
        this.graphics.fillStyle(0xFFFF00, 0.8);
        this.graphics.fillEllipse(16, 8, 30, 14);
        this.graphics.fillStyle(0xFFFFFF, 0.6);
        this.graphics.fillEllipse(16, 8, 20, 8);
        muzzleFlashTexture.draw(this.graphics, 0, 0);
        muzzleFlashTexture.saveTexture('muzzle_flash');
        
        // Hit effect
        const hitEffectTexture = this.scene.add.renderTexture(0, 0, 16, 16);
        this.graphics.clear();
        this.graphics.fillStyle(0xFFFFFF);
        // Draw star/spark shape
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = 8 + Math.cos(angle) * 3;
            const y1 = 8 + Math.sin(angle) * 3;
            const x2 = 8 + Math.cos(angle) * 7;
            const y2 = 8 + Math.sin(angle) * 7;
            this.graphics.lineBetween(8, 8, x2, y2);
        }
        hitEffectTexture.draw(this.graphics, 0, 0);
        hitEffectTexture.saveTexture('hit_effect');
        
        // Generic explosion effect
        const explosionEffect = this.scene.add.renderTexture(0, 0, 48, 48);
        this.graphics.clear();
        this.graphics.fillStyle(0xFF4500);
        this.graphics.fillCircle(24, 24, 22);
        this.graphics.fillStyle(0xFFD700);
        this.graphics.fillCircle(24, 24, 16);
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillCircle(24, 24, 8);
        explosionEffect.draw(this.graphics, 0, 0);
        explosionEffect.saveTexture('explosion_effect');
        
        console.log('Generated effect sprite textures');
    }

    /**
     * Clean up graphics object
     */
    public destroy(): void {
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}
