/**
 * Veggie Clash - Endless Runner Game Scene
 * Side-scrolling endless runner mode with distance tracking, obstacles, and power-ups
 */

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_SETTINGS, COLORS, AUDIO_KEYS, ASSET_KEYS } from '../config';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import BackgroundManager from '../systems/BackgroundManager';
import { AnimationManager } from '../systems/AnimationManager';
import { AudioManager } from '../systems/AudioManager';
import { VisualEffectsManager } from '../systems/VisualEffectsManager';
import { EnemyHealthBarManager } from '../entities/EnemyHealthBar';
import { AssetRegistry, AssetKeys } from '../systems/AssetRegistry';

interface RunnerObstacle {
    sprite: Phaser.GameObjects.Sprite;
    dangerZone?: Phaser.GameObjects.Rectangle;
}

interface RunnerCoin {
    sprite: Phaser.GameObjects.Sprite;
    plus: Phaser.GameObjects.Text;
}

interface RunnerPowerUp {
    type: 'magnet' | 'shield' | 'double_coins' | 'weapon_upgrade';
    sprite: Phaser.GameObjects.Sprite;
    plus: Phaser.GameObjects.Text;
}

interface RunnerData {
    mode: 'endless';
}

export class RunnerGameScene extends Phaser.Scene {
    // Core game objects
    private player!: Player;
    private enemies!: Phaser.GameObjects.Group;
    private playerProjectiles!: Phaser.GameObjects.Group;
    private enemyProjectiles!: Phaser.GameObjects.Group;

    // Runner-specific objects
    private obstacles!: Phaser.GameObjects.Group;
    private coins!: Phaser.GameObjects.Group;
    private powerUps!: Phaser.GameObjects.Group;
    private dangerZone!: Phaser.GameObjects.Sprite;

    // Systems
    private backgroundManager!: BackgroundManager;
    private animationManager!: AnimationManager;
    private audioManager!: AudioManager;
    private visualEffectsManager!: VisualEffectsManager;
    private enemyHealthBarManager!: EnemyHealthBarManager;
    private assetRegistry!: AssetRegistry;

    // Lanes and movement
    private lanes: number[] = [150, 300, 450]; // Y positions for 3 lanes
    private currentLane: number = 1; // Middle lane
    private autoRunSpeed: number = 250; // Base horizontal speed
    private isJumping: boolean = false;
    private isSliding: boolean = false;
    private jumpHeight: number = 80;

    // Game stats
    private distance: number = 0;
    private coinsCollected: number = 0;
    private enemiesDefeated: number = 0;
    private gameTime: number = 0;
    private difficultyLevel: number = 1;

    // Power-ups
    private activeMagnet: boolean = false;
    private activeShield: boolean = false;
    private activeDoubleCoins: boolean = false;
    private weaponBoostTime: number = 0;
    private magnetRange: number = 120;

    // World and camera
    private worldWidth: number = 1600;
    private cameraOffset: number = 200; // Keep player X position

    // Spawning
    private lastObstacleSpawn: number = 0;
    private lastCoinSpawn: number = 0;
    private lastPowerUpSpawn: number = 0;
    private obstacleSpawnRate: number = 1500;
    private coinSpawnRate: number = 800;
    private powerUpSpawnRate: number = 8000;

    // Runner data
    private runnerData!: RunnerData;

    // Input
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;

    // Mobile controls
    private joystickData = { x: 0, y: 0 };
    private runnerJumpFlag = false;
    private runnerSlideFlag = false;

    constructor() {
        super({ key: 'RunnerGameScene' });
    }

    init(data: RunnerData): void {
        this.runnerData = data || { mode: 'endless' };
        this.resetGameState();
    }

    private resetGameState(): void {
        // Reset all game state
        this.distance = 0;
        this.coinsCollected = 0;
        this.enemiesDefeated = 0;
        this.gameTime = 0;
        this.difficultyLevel = 1;
        this.currentLane = 1; // Middle lane
        this.isJumping = false;
        this.isSliding = false;

        // Reset power-ups
        this.activeMagnet = false;
        this.activeShield = false;
        this.activeDoubleCoins = false;
        this.weaponBoostTime = 0;

        // Reset spawning timers
        this.lastObstacleSpawn = 0;
        this.lastCoinSpawn = 0;
        this.lastPowerUpSpawn = 0;
        this.obstacleSpawnRate = 1500;
        this.coinSpawnRate = 800;
        this.powerUpSpawnRate = 8000;
    }

    create(): void {
        console.log('Starting Endless Runner Mode');

        // Initialize systems
        this.initializeSystems();

        // Set up world
        this.createWorld();

        // Create player
        this.createPlayer();

        // Create groups
        this.createGroups();

        // Set up input
        this.setupInput();

        // Set up physics
        this.setupPhysics();

        // Create danger zone (initially far behind)
        this.createDangerZone();

        // Start systems
        this.startHUD();

        // Initialize spawning

        // Start music
        this.startGameMusic();
    }

    private initializeSystems(): void {
        // Initialize visual systems
        this.backgroundManager = new BackgroundManager(this);
        this.animationManager = new AnimationManager(this);
        this.audioManager = AudioManager.getInstance(this);
        this.visualEffectsManager = new VisualEffectsManager(this);

        // Initialize enemy health bar manager
        this.enemyHealthBarManager = new EnemyHealthBarManager(this);

        // Initialize asset registry
        this.assetRegistry = new AssetRegistry(this);
    }

    private createWorld(): void {
        // Initialize scrolling background
        this.backgroundManager.create();

        // Set infinite world bounds (expandable)
        this.physics.world.setBounds(0, 0, this.worldWidth, GAME_SETTINGS.WORLD_HEIGHT);

        // Camera follows player horizontally
        this.cameras.main.setBounds(0, 0, Number.MAX_VALUE, GAME_SETTINGS.WORLD_HEIGHT);
        this.cameras.main.setLerp(0.2, 0.2); // Smooth camera movement

        // Add invisible world expansion as player moves
        this.createEnvironment();
    }

    private createEnvironment(): void {
        // Add scrolling ground tiles
        for (let i = 0; i < 10; i++) {
            const groundTileTexture = this.assetRegistry.getTexture(AssetKeys.GroundTile);
            const groundTile = this.add.sprite(i * 160, GAME_SETTINGS.HEIGHT - 50, groundTileTexture);
            groundTile.setOrigin(0, 1);
            groundTile.setDepth(10);

            // Move with camera for parallax effect
            this.cameras.main.ignore(groundTile);
        }

        // Add lane markers (invisible but for collision)
        this.lanes.forEach((laneY, index) => {
            const laneMarker = this.add.rectangle(0, laneY, 800, 10, 0x000000, 0);
            laneMarker.setOrigin(0, 0.5);
            laneMarker.name = `lane-${index}`;
        });
    }

    private createPlayer(): void {
        // Create player at middle lane, fixed camera position
        const startX = this.cameraOffset;
        const startY = this.lanes[1]; // Middle lane

        this.player = new Player(this, startX, startY);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);

        // Set minimum health (runner has less tolerance)
        this.player.health = 3; // Small health pool for runner

        console.log('Runner Player created');
    }

    private createGroups(): void {
        this.enemies = this.add.group();
        this.playerProjectiles = this.add.group();
        this.enemyProjectiles = this.add.group();
        this.obstacles = this.add.group();
        this.coins = this.add.group();
        this.powerUps = this.add.group();

        // Set up projectile handling
        this.enemyProjectiles.children.iterate((projectile) => {
            this.add.existing(projectile);
            this.physics.add.existing(projectile);
            return true;
        });
    }

    private setupInput(): void {
        // Keyboard controls for runner mode
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D,SPACE,SHIFT');

        // Runner controls mapping
        // A/D or Left/Right = Change lanes (instead of strafe)
        // W/Up = Jump
        // S/Down = Slide
        // Space = Jump (alternative)
        // Shift = Slide (alternative)
        // Mouse = Aim/Shoot

        this.input.keyboard!.on('keydown-A', () => this.changeLane(-1));
        this.input.keyboard!.on('keydown-D', () => this.changeLane(1));
        this.input.keyboard!.on('keydown-LEFT', () => this.changeLane(-1));
        this.input.keyboard!.on('keydown-RIGHT', () => this.changeLane(1));

        this.input.keyboard!.on('keydown-W', () => this.playerJump());
        this.input.keyboard!.on('keydown-UP', () => this.playerJump());
        this.input.keyboard!.on('keydown-SPACE', () => this.playerJump());

        this.input.keyboard!.on('keydown-S', () => this.playerSlide());
        this.input.keyboard!.on('keydown-DOWN', () => this.playerSlide());
        this.input.keyboard!.on('keydown-SHIFT', () => this.playerSlide());

        // ESC to pause
        this.input.keyboard!.on('keydown-ESC', () => this.pauseGame());

        // Shooting (aim at mouse/pointer as before)
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.player?.shoot();
            }
        });

        // Desktop controls for jumping
        if (this.cursors.up?.isDown || this.wasd.W?.isDown || this.wasd.SPACE?.isDown) {
            this.playerJump();
        }

        // Desktop controls for sliding
        if (this.cursors.down?.isDown || this.wasd.S?.isDown || this.wasd.SHIFT?.isDown) {
            this.playerSlide();
        }
    }

    private setupMobileControls(): void {
        // Listen for mobile control events (adapted for runner)
        window.addEventListener('joystick-move', (event: any) => {
            this.joystickData = event.detail;
            // Use vertical joystick for lane changes
            if (event.detail.x > 0.5) this.changeLane(1);
            if (event.detail.x < -0.5) this.changeLane(-1);
        });

        window.addEventListener('mobile-shoot', (event: any) => {
            if (event.detail.pressed) this.player?.shoot();
        });

        window.addEventListener('mobile-jump', () => this.playerJump());
        window.addEventListener('mobile-slide', () => this.playerSlide());
        window.addEventListener('mobile-pause', () => this.pauseGame());
    }

    private setupPhysics(): void {
        // Player vs obstacles
        this.physics.add.overlap(this.player, this.obstacles, (player, obstacle) => {
            this.handlePlayerObstacleCollision(player as Player, obstacle as Phaser.GameObjects.Sprite);
        });

        // Player vs enemies
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            this.handlePlayerEnemyCollision(player as Player, enemy as Enemy);
        });

        // Player projectiles vs enemies
        this.physics.add.overlap(this.playerProjectiles, this.enemies, (projectile, enemy) => {
            this.handleProjectileEnemyHit(projectile as Projectile, enemy as Enemy);
        });

        // Enemy projectiles vs player
        this.physics.add.overlap(this.enemyProjectiles, this.player, (projectile, player) => {
            this.handleEnemyProjectileHit(projectile as Projectile, player as Player);
        });

        // Player vs coins
        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            this.collectCoin(coin as Phaser.GameObjects.Sprite);
        });

        // Player vs power-ups
        this.physics.add.overlap(this.player, this.powerUps, (player, powerUp) => {
            this.collectPowerUp(powerUp as Phaser.GameObjects.Sprite);
        });

        // Magnet effect for coins (when active)
        this.time.addEvent({
            delay: 16, // ~60 FPS
            callback: this.updateMagnetEffect,
            callbackScope: this,
            loop: true
        });
    }

    update(time: number, delta: number): void {
        this.gameTime += delta;

        // Update camera and world bounds
        this.updateCameraAndWorld();

        // Update background
        this.backgroundManager?.update();

        // Update systems
        if (this.animationManager) {
            this.animationManager.update(delta);
        }
        if (this.visualEffectsManager) {
            this.visualEffectsManager.update();
        }

        // Update player position and animations
        this.updatePlayer(delta);

        // Update all game objects
        this.updateEnemies(delta);

        // Update health bars
        if (this.enemyHealthBarManager) {
            this.enemyHealthBarManager.update();
        }

        // Handle power-up timers
        this.updatePowerUps(delta);

        // Spawn objects
        this.updateSpawning(time);

        // Scale difficulty
        this.updateDifficulty();

        // Check game state
        this.checkGameState();

        // Update distance
        this.updateDistance(delta);
    }

    private updateCameraAndWorld(): void {
        const playerX = this.player.x;

        // Smooth camera follow
        const targetX = playerX - this.cameraOffset;
        this.cameras.main.setScroll(targetX, this.cameras.main.scrollY);

        // Expand world bounds as needed
        if (playerX + 400 > this.worldWidth) {
            this.worldWidth += 400;
            this.physics.world.setBounds(0, 0, this.worldWidth, GAME_SETTINGS.WORLD_HEIGHT);
        }

        // Update ground tiles to cover new area
        this.updateGroundTiles();
    }

    private updateGroundTiles(): void {
        // Shift ground tiles to maintain continuous ground
        // Implementation would update tile positions
        // Simplified for now
    }

    private updatePlayer(delta: number): void {
        if (!this.player) return;

        // Auto-run forward
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setVelocity(this.autoRunSpeed, playerBody.velocity.y);

        // Handle lane-based vertical movement
        const targetY = this.lanes[this.currentLane];

        // Smooth transition to lane
        if (Math.abs(this.player.y - targetY) > 1) {
            this.player.y += (targetY - this.player.y) * 0.1;
        }

        // Handle jumping
        if (this.isJumping) {
            this.player.setTint(0xFFD700); // Yellow tint for jumping
        } else {
            this.player.clearTint();
        }

        // Handle sliding
        if (this.isSliding) {
            this.player.setScale(1, 0.7); // Compress vertically
            this.player.y = targetY + 20; // Slight downward offset
        } else {
            this.player.setScale(1, 1);
        }

        // Update player (weapon firing, etc.)
        this.player.update(delta);

        // Keep player in bounds
        this.player.y = Phaser.Math.Clamp(this.player.y, 50, GAME_SETTINGS.HEIGHT - 100);
    }

    private changeLane(direction: number): void {
        const newLane = Phaser.Math.Clamp(this.currentLane + direction, 0, 2);
        if (newLane !== this.currentLane) {
            this.currentLane = newLane;
            this.audioManager?.playSfx('sfx_menu_select', { volume: 0.3 });
        }
    }

    private playerJump(): void {
        if (this.isJumping) return;

        this.isJumping = true;

        // Immediate jump
        this.tweens.add({
            targets: this.player,
            y: this.player.y - this.jumpHeight,
            duration: 400,
            ease: 'Quad.out',
            onComplete: () => {
                this.isJumping = false;
            }
        });

        // Play jump sound
        this.audioManager?.playSfx('sfx_dash', { volume: 0.5 });
    }

    private playerSlide(): void {
        if (this.isSliding) return;

        this.isSliding = true;

        // Slide for duration
        this.time.delayedCall(800, () => {
            this.isSliding = false;
        });

        // Play slide sound
        this.audioManager?.playSfx('sfx_dash', { volume: 0.3 });
    }

    private updateEnemies(delta: number): void {
        this.enemies.children.entries.forEach((enemy) => {
            const enemyObj = enemy as Enemy;
            enemyObj.update(delta);

            // Move enemy with the world toward player
            const enemyBody = enemyObj.body as Phaser.Physics.Arcade.Body;
            enemyBody.setVelocityX(-this.autoRunSpeed * 0.3); // Move slower than player for runner feel

            // Add some AI movement toward player
            if (this.player) {
                const distanceToPlayer = Phaser.Math.Distance.Between(enemyObj.x, enemyObj.y, this.player.x, this.player.y);
                if (distanceToPlayer < 300) {
                    // Move toward player if close enough
                    const angleToPlayer = Phaser.Math.Angle.Between(enemyObj.x, enemyObj.y, this.player.x, this.player.y);
                    enemyBody.setVelocityX(enemyBody.velocity.x + Math.cos(angleToPlayer) * 50);
                    enemyBody.setVelocityY(Math.sin(angleToPlayer) * 50);

                    // Keep enemy on track (don't let them move too far up/down from their lane)
                    const targetY = this.lanes[Math.floor(enemyObj.y / 150) % 3];
                    enemyBody.setVelocityY(Math.sin(angleToPlayer) * 50 + (targetY - enemyObj.y) * 0.1);
                }
            }

            // Remove enemies that fall behind too far
            if (enemyObj.x < this.cameras.main.scrollX - 300) {
                enemy.destroy();
            }
        });
    }

    private updateSpawning(time: number): void {
        // Spawn obstacles
        if (time - this.lastObstacleSpawn > this.obstacleSpawnRate) {
            this.spawnObstacle();
            this.lastObstacleSpawn = time;
        }

        // Spawn coins
        if (time - this.lastCoinSpawn > this.coinSpawnRate) {
            this.spawnCoin();
            this.lastCoinSpawn = time;
        }

        // Spawn power-ups (rare)
        if (time - this.lastPowerUpSpawn > this.powerUpSpawnRate) {
            this.spawnPowerUp();
            this.lastPowerUpSpawn = time;
        }
    }

    private spawnObstacle(): void {
        const obstacleTypes = ['pit', 'spike', 'log', 'enemy'];
        const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        const spawnX = this.cameras.main.scrollX + this.worldWidth - 100;
        const spawnY = this.lanes[Math.floor(Math.random() * 3)];

        if (randomType === 'enemy') {
            // Spawn enemy obstacle
            const enemyTypes: ('tomato' | 'onion' | 'pepper' | 'broccoli')[] = ['tomato', 'onion', 'pepper', 'broccoli'];
            const randomEnemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

            const enemy = new Enemy(this, spawnX, spawnY, randomEnemyType);
            this.enemies.add(enemy);
            this.add.existing(enemy);
            this.physics.add.existing(enemy);

            // Create health bar
            if (this.enemyHealthBarManager) {
                this.enemyHealthBarManager.createForEnemy(enemy);
            }
        } else {
            // Spawn physical obstacle
            const obstacle = this.add.sprite(spawnX, spawnY, `obstacle-${randomType}`);
            this.physics.add.existing(obstacle);
            (obstacle.body as Phaser.Physics.Arcade.Body).setImmovable(true);

            this.obstacles.add(obstacle);
        }

        // Add slight random timing variation
        this.obstacleSpawnRate = Phaser.Math.Clamp(this.obstacleSpawnRate - 10, 500, 2000);
    }

    private spawnCoin(): void {
        const spawnX = this.cameras.main.scrollX + this.worldWidth - 100;
        const spawnY = this.lanes[Math.floor(Math.random() * 3)] + (Math.random() - 0.5) * 40;

        const coinSprite = this.add.sprite(spawnX, spawnY, 'coin');
        coinSprite.setScale(0.6);

        this.physics.add.existing(coinSprite);

        // Add floating animation
        this.tweens.add({
            targets: coinSprite,
            y: spawnY - 10,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Create coin collection text (+10 or +20)
        const coinValue = Math.random() < 0.8 ? 10 : 20;
        const plusText = this.add.text(spawnX, spawnY - 30, `+${coinValue}`, {
            fontSize: '16px',
            color: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        });
        plusText.setVisible(false);
        plusText.setDepth(150);

        const coinObj: RunnerCoin = {
            sprite: coinSprite,
            plus: plusText
        };

        coinSprite.setData('coinObj', coinObj);
        this.coins.add(coinSprite);
    }

    private spawnPowerUp(): void {
        const powerUpTypes: ('magnet' | 'shield' | 'double_coins' | 'weapon_upgrade')[] =
            ['magnet', 'shield', 'double_coins', 'weapon_upgrade'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

        const spawnX = this.cameras.main.scrollX + this.worldWidth - 100;
        const spawnY = this.lanes[Math.floor(Math.random() * 3)];

        const powerUpSprite = this.add.sprite(spawnX, spawnY, `powerup-${randomType}`);
        powerUpSprite.setScale(0.7);

        this.physics.add.existing(powerUpSprite);

        // Add glowing effect
        this.tweens.add({
            targets: powerUpSprite,
            alpha: 0.7,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Create collection text
        const plusText = this.add.text(spawnX, spawnY - 35, `${randomType.toUpperCase()}`, {
            fontSize: '14px',
            color: '#00FF00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        });
        plusText.setVisible(false);
        plusText.setDepth(150);

        const powerUpObj: RunnerPowerUp = {
            type: randomType,
            sprite: powerUpSprite,
            plus: plusText
        };

        powerUpSprite.setData('powerUpObj', powerUpObj);
        this.powerUps.add(powerUpSprite);
    }

    private collectCoin(coinSprite: Phaser.GameObjects.Sprite): void {
        const coinObj = coinSprite.getData('coinObj') as RunnerCoin;
        const coinValue = Math.random() < 0.8 ? 10 : 20;
        this.coinsCollected += coinValue;

        // Show collection effect
        coinObj.plus.setPosition(coinObj.sprite.x, coinObj.sprite.y - 30);
        coinObj.plus.setVisible(true);
        coinObj.plus.setAlpha(1);

        // Animate text upward
        this.tweens.add({
            targets: coinObj.plus,
            y: coinObj.plus.y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => coinObj.plus.destroy()
        });

        // Visual effect
        this.visualEffectsManager?.powerUpPickup(coinObj.sprite.x, coinObj.sprite.y);

        // Sound
        this.audioManager?.playUISound('success');

        coinObj.sprite.destroy();
        this.coins.remove(coinObj.sprite);
    }

    private collectPowerUp(powerUpSprite: Phaser.GameObjects.Sprite): void {
        const powerUpObj = powerUpSprite.getData('powerUpObj') as RunnerPowerUp;
        // Apply power-up effect
        switch (powerUpObj.type) {
            case 'magnet':
                this.activeMagnet = true;
                this.time.delayedCall(10000, () => { this.activeMagnet = false; });
                break;
            case 'shield':
                this.activeShield = true;
                this.player.setTint(0x87CEEB);
                this.time.delayedCall(5000, () => {
                    this.activeShield = false;
                    if (!this.activeShield) this.player.clearTint();
                });
                break;
            case 'double_coins':
                this.activeDoubleCoins = true;
                this.time.delayedCall(10000, () => { this.activeDoubleCoins = false; });
                break;
            case 'weapon_upgrade':
                this.weaponBoostTime = Date.now();
                this.time.delayedCall(5000, () => { this.weaponBoostTime = 0; });
                break;
        }

        // Show collection effect
        powerUpObj.plus.setPosition(powerUpObj.sprite.x, powerUpObj.sprite.y - 35);
        powerUpObj.plus.setVisible(true);
        powerUpObj.plus.setAlpha(1);

        this.tweens.add({
            targets: powerUpObj.plus,
            y: powerUpObj.plus.y - 40,
            alpha: 0,
            duration: 1200,
            onComplete: () => powerUpObj.plus.destroy()
        });

        this.visualEffectsManager?.powerUpPickup(powerUpObj.sprite.x, powerUpObj.sprite.y);
        this.audioManager?.playPowerUpSound('normal');

        powerUpObj.sprite.destroy();
        this.powerUps.remove(powerUpObj.sprite);
    }

    private updateMagnetEffect(): void {
        if (!this.activeMagnet) return;

        this.coins.children.entries.forEach((coinSprite) => {
            const coin = coinSprite as Phaser.GameObjects.Sprite;
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, coin.x, coin.y);

            if (distance < this.magnetRange) {
                const angle = Phaser.Math.Angle.Between(coin.x, coin.y, this.player.x, this.player.y);
                const pullStrength = 200 * (1 - distance / this.magnetRange);
                coin.x += Math.cos(angle) * pullStrength * 0.016;
                coin.y += Math.sin(angle) * pullStrength * 0.016;
            }
        });
    }

    private updateDistance(delta: number): void {
        this.distance += (this.autoRunSpeed / 100) * (delta / 1000); // Approximate meters

        // Update HUD with distance
        this.events.emit('updateRunnerDistance', this.distance);
        this.events.emit('updateRunnerCoins', this.coinsCollected);
    }

    private updateDifficulty(): void {
        // Increase difficulty over time
        this.difficultyLevel = Math.floor(this.distance / 500) + 1;

        if (this.gameTime % 30000 < 100) { // Every 30 seconds
            this.autoRunSpeed = Math.min(this.autoRunSpeed + 5, 400);
            this.obstacleSpawnRate = Math.max(this.obstacleSpawnRate - 50, 300);
            this.coinSpawnRate = Math.max(this.coinSpawnRate - 20, 200);
        }
    }

    private updatePowerUps(delta: number): void {
        // Update active power-up timers and effects
        if (this.weaponBoostTime > 0) {
            const timeSince = Date.now() - this.weaponBoostTime;
            if (timeSince > 5000) {
                this.weaponBoostTime = 0;
            }
        }
    }

    private createDangerZone(): void {
        // Boss silhouette or fire edge behind player
        this.dangerZone = this.add.sprite(-100, GAME_SETTINGS.HEIGHT / 2, 'danger-zone-boss');
        this.dangerZone.setScale(0.5);
        this.dangerZone.setDepth(20);
        this.dangerZone.setTint(0xFF0000);

        // Add fire particles at danger zone
        this.add.particles(0, GAME_SETTINGS.HEIGHT - 50, 'particle-hit', {
            speedX: { min: -20, max: -10 },
            speedY: { min: -10, max: 10 },
            scale: { start: 0.5, end: 0 },
            lifespan: 1000,
            quantity: 3,
            tint: 0xFF4500
        });

        this.updateDangerZonePosition();
    }

    private updateDangerZonePosition(): void {
        // Move danger zone toward player (slow creep)
        const dangerSpeed = 20; // pixels per second
        const delta = this.game.loop.delta / 1000;
        this.dangerZone.x += dangerSpeed * delta;

        // If danger zone reaches player, game over
        if (this.dangerZone.x > this.player.x - 50) {
            this.gameOver();
        }
    }

    // Collision handlers
    private handlePlayerObstacleCollision(player: Player, obstacle: Phaser.GameObjects.Sprite): void {
        if (!this.activeShield) {
            this.player.takeDamage(1);
            // Knockback effect
            player.x -= 50;
            this.cameras.main.shake(100, 0.01);

            if (this.animationManager) {
                this.animationManager.showHitFeedback(player, 10);
            }
        } else {
            // Shield blocks obstacle
            obstacle.destroy();
            this.activeShield = false;
            player.clearTint();
        }
    }

    private handlePlayerEnemyCollision(player: Player, enemy: Enemy): void {
        this.handlePlayerObstacleCollision(player, enemy);
    }

    private handleProjectileEnemyHit(projectile: Projectile, enemy: Enemy): void {
        const damage = this.weaponBoostTime > 0 ? projectile.damage * 2 : projectile.damage;
        enemy.takeDamage(damage);

        if (enemy.health <= 0) {
            this.enemiesDefeated++;
            this.coinsCollected += 5; // Bonus coins for defeating enemies

            if (this.animationManager) {
                this.animationManager.createImpactParticles(enemy.x, enemy.y, 'explode');
            }
            if (this.audioManager) {
                this.audioManager.playExplosion('small');
            }

            enemy.destroy();
        }

        projectile.destroy();
    }

    private handleEnemyProjectileHit(projectile: Projectile, player: Player): void {
        if (!this.activeShield) {
            this.player.takeDamage(projectile.damage);
            // Knockback effect
            player.x -= 30;
            this.cameras.main.shake(100, 0.01);

            if (this.animationManager) {
                this.animationManager.showHitFeedback(player, 10);
            }
        }

        projectile.destroy();
    }

    private checkGameState(): void {
        // Check if player is dead
        if (this.player && (this.player.health <= 0 || this.player.x < this.dangerZone.x - 100)) {
            this.gameOver();
        }
    }

    // Additional missing methods
    private startHUD(): void {
        this.scene.launch(SCENE_KEYS.HUD, {
            player: this.player,
            gameMode: 'endless',
            level: 'runner'
        });
    }

    private startGameMusic(): void {
        if (this.audioManager) {
            this.audioManager.playMusic('music_game');
        }
    }

    private pauseGame(): void {
        this.scene.pause();
        this.scene.launch('PauseScene');
    }

    private gameOver(): void {
        this.scene.start('GameOverScene', {
            score: this.distance,
            coins: this.coinsCollected,
            enemiesDefeated: this.enemiesDefeated,
            mode: 'endless'
        });
    }

    destroy(): void {
        // Clean up event listeners
        window.removeEventListener('joystick-move', () => {});
        window.removeEventListener('mobile-shoot', () => {});
        window.removeEventListener('mobile-jump', () => {});
        window.removeEventListener('mobile-slide', () => {});
        window.removeEventListener('mobile-pause', () => {});
    }
}
