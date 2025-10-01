/**
 * Veggie Clash - Game Scene
 * Main gameplay scene with player, enemies, and game mechanics
 */

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_SETTINGS, COLORS, AUDIO_KEYS } from '../config';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { ParallaxManager } from '../systems/ParallaxManager';
import { AnimationManager } from '../systems/AnimationManager';
import { AudioManager } from '../systems/AudioManager';
import { EnemyType } from '../entities/Enemy';
import { EnemyHealthBarManager } from '../entities/EnemyHealthBar';
import { AssetKey } from '../systems/AssetGenerator';
import { AssetValidator } from '../systems/AssetValidator';
import BackgroundManager from '../systems/BackgroundManager';
import { GameState } from '../state/GameState';

export interface GameData {
    mode: 'campaign' | 'survival';
    level?: number;
}

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private enemies!: Phaser.GameObjects.Group;
    private playerProjectiles!: Phaser.GameObjects.Group;
    private enemyProjectiles!: Phaser.GameObjects.Group;
    private powerUps!: Phaser.GameObjects.Group;

    private gameData!: GameData;
    private score: number = 0;
    private wave: number = 1;
    private enemiesKilled: number = 0;
    private gameTime: number = 0;
    private lastEnemySpawn: number = 0;
    private isPaused = false;
    private pauseOverlay?: Phaser.GameObjects.Container;

    // Visual systems
    private backgroundManager!: BackgroundManager;
    private parallaxManager!: ParallaxManager;
    private animationManager!: AnimationManager;
    private audioManager!: AudioManager;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private pointer!: Phaser.Input.Pointer;

    // Mobile controls
    private joystickData = { x: 0, y: 0 };
    private mobileShoot = false;
    
    constructor() {
        super({ key: SCENE_KEYS.GAME });
    }

    init(data: GameData): void {
        this.gameData = data || { mode: 'campaign', level: 1 };

        // Reset game state for new game
        const gameState = GameState.getInstance();
        gameState.reset();
        gameState.setLevel(this.gameData.level || 1);
        gameState.lastMode = this.gameData.mode;

        // Initialize local copies from state
        this.score = gameState.score;
        this.wave = 1;
        this.enemiesKilled = 0;
        this.gameTime = 0;
        this.lastEnemySpawn = 0;
    }

    create(): void {
        // Initialize visual systems
        this.initializeSystems();

        this.createWorld();
        this.createPlayer();
        this.createGroups();
        this.setupInput();
        this.setupPhysics();
        this.startHUD();
        this.setupMobileControls();

        // Show tutorial if first time in this mode
        this.showTutorialIfNeeded();

        // Start background music
        this.startGameMusic();

        console.log(`🥕 Starting ${this.gameData.mode} mode`, this.gameData);
    }

    update(time: number, delta: number): void {
        this.gameTime += delta;

        // Update background parallax
        this.backgroundManager.update();

        // Update visual systems
        if (this.parallaxManager) {
            this.parallaxManager.update(this.cameras.main);
        }
        if (this.animationManager) {
            this.animationManager.update(delta);
        }

        // Update player
        if (this.player) {
            this.updatePlayer(delta);
        }

        // Update enemies
        this.updateEnemies(delta);

        // Update enemy health bars
        if (this.enemyHealthBarManager) {
            this.enemyHealthBarManager.update();
        }

        // Spawn enemies
        this.spawnEnemies(time);

        // Update projectiles
        this.updateProjectiles();

        // Check win/lose conditions
        this.checkGameState();
    }

    private initializeSystems(): void {
        // Initialize BackgroundManager
        this.backgroundManager = new BackgroundManager(this);

        // Initialize AnimationManager for character animations and effects
        this.animationManager = new AnimationManager(this);

        // Initialize AudioManager for enhanced audio control
        this.audioManager = AudioManager.getInstance(this);
    }

    private createWorld(): void {
        // Initialize background via BackgroundManager
        this.backgroundManager.create();

        // Set world bounds (use camera size for fixed arena to avoid voids)
        const cam = this.cameras.main;
        this.physics.world.setBounds(0, 0, cam.width, cam.height);
        this.cameras.main.setBounds(0, 0, cam.width, cam.height);

        // Add some decorative elements at proper depth
        this.createEnvironment();
    }



    private createEnvironment(): void {
        // Skip decorative elements to avoid rendering artifacts
        // These were causing visual clutter and potential rendering issues

        // World setup is complete via BackgroundManager
        // No additional decorative elements needed for clean background
    }

    private createPlayer(): void {
        const startX = GAME_SETTINGS.WORLD_WIDTH / 2;
        const startY = GAME_SETTINGS.WORLD_HEIGHT / 2;

        this.player = new Player(this, startX, startY);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);

        // Camera follows player
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Initialize enemy health bar manager after systems are ready
        this.enemyHealthBarManager = new EnemyHealthBarManager(this);
    }

    private enemyHealthBarManager!: EnemyHealthBarManager;

    private createGroups(): void {
        this.enemies = this.add.group();
        this.playerProjectiles = this.add.group();
        this.enemyProjectiles = this.add.group();
        this.powerUps = this.add.group();
    }

    private setupInput(): void {
        // Create input keys
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D,SPACE,Q,E,R');
        
        // Mouse/touch input
        this.pointer = this.input.activePointer;
        
        // Shooting
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.player?.shoot();
            }
        });
        
        // Dash
        this.input.keyboard!.on('keydown-SPACE', () => {
            this.player?.dash();
        });
        
        // Weapon switching
        this.input.keyboard!.on('keydown-Q', () => {
            this.player?.switchWeapon(-1);
        });
        
        this.input.keyboard!.on('keydown-E', () => {
            this.player?.switchWeapon(1);
        });
        
        // Pause
        this.input.keyboard!.on('keydown-ESC', () => {
            this.pauseGame();
        });
    }

    private setupMobileControls(): void {
        // Listen for mobile control events
        window.addEventListener('joystick-move', (event: any) => {
            this.joystickData = event.detail;
        });
        
        window.addEventListener('mobile-shoot', (event: any) => {
            this.mobileShoot = event.detail.pressed;
        });
        
        window.addEventListener('mobile-dash', () => {
            this.player?.dash();
        });
        
        window.addEventListener('mobile-pause', () => {
            this.pauseGame();
        });
    }

    private setupPhysics(): void {
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
            this.handleProjectilePlayerHit(projectile as Projectile, player as Player);
        });
        
        // Player vs power-ups
        this.physics.add.overlap(this.player, this.powerUps, (player, powerUp) => {
            this.handlePowerUpCollection(player as Player, powerUp as Phaser.GameObjects.GameObject);
        });
    }

    private updatePlayer(delta: number): void {
        if (!this.player) return;
        
        // Handle movement input
        let moveX = 0;
        let moveY = 0;
        
        // Desktop controls
        if (this.wasd.A.isDown || this.cursors.left?.isDown) moveX -= 1;
        if (this.wasd.D.isDown || this.cursors.right?.isDown) moveX += 1;
        if (this.wasd.W.isDown || this.cursors.up?.isDown) moveY -= 1;
        if (this.wasd.S.isDown || this.cursors.down?.isDown) moveY += 1;
        
        // Mobile controls
        if (Math.abs(this.joystickData.x) > 0.1 || Math.abs(this.joystickData.y) > 0.1) {
            moveX = this.joystickData.x;
            moveY = this.joystickData.y;
        }
        
        this.player.setMovement(moveX, moveY);
        
        // Handle shooting
        if (this.pointer.isDown || this.mobileShoot) {
            this.player.shoot();
        }
        
        // Update player
        this.player.update(delta);
    }

    private updateEnemies(delta: number): void {
        this.enemies.children.entries.forEach((enemy) => {
            (enemy as Enemy).update(delta);
        });
    }

    private spawnEnemies(time: number): void {
        if (time - this.lastEnemySpawn > GAME_SETTINGS.ENEMY_SPAWN_RATE) {
            if (this.enemies.children.size < GAME_SETTINGS.ENEMY_MAX_COUNT) {
                this.spawnEnemy();
                this.lastEnemySpawn = time;
            }
        }
    }

    private spawnEnemy(): void {
        // Random spawn position at edges
        const edge = Math.floor(Math.random() * 4);
        let x: number, y: number;

        switch (edge) {
            case 0: // Top
                x = Math.random() * GAME_SETTINGS.WORLD_WIDTH;
                y = 0;
                break;
            case 1: // Right
                x = GAME_SETTINGS.WORLD_WIDTH;
                y = Math.random() * GAME_SETTINGS.WORLD_HEIGHT;
                break;
            case 2: // Bottom
                x = Math.random() * GAME_SETTINGS.WORLD_WIDTH;
                y = GAME_SETTINGS.WORLD_HEIGHT;
                break;
            default: // Left
                x = 0;
                y = Math.random() * GAME_SETTINGS.WORLD_HEIGHT;
                break;
        }

        const enemyTypes: EnemyType[] = ['tomato', 'onion', 'pepper', 'broccoli'];
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

        const enemy = new Enemy(this, x, y, randomType);
        this.enemies.add(enemy);
        this.add.existing(enemy);
        this.physics.add.existing(enemy);

        // Create health bar for this enemy
        if (this.enemyHealthBarManager) {
            this.enemyHealthBarManager.createForEnemy(enemy);
        }
    }

    private updateProjectiles(): void {
        // Clean up off-screen projectiles
        this.playerProjectiles.children.entries.forEach((projectile) => {
            const p = projectile as Projectile;
            if (p.x < -50 || p.x > GAME_SETTINGS.WORLD_WIDTH + 50 || 
                p.y < -50 || p.y > GAME_SETTINGS.WORLD_HEIGHT + 50) {
                p.destroy();
            }
        });
        
        this.enemyProjectiles.children.entries.forEach((projectile) => {
            const p = projectile as Projectile;
            if (p.x < -50 || p.x > GAME_SETTINGS.WORLD_WIDTH + 50 || 
                p.y < -50 || p.y > GAME_SETTINGS.WORLD_HEIGHT + 50) {
                p.destroy();
            }
        });
    }

    private handlePlayerEnemyCollision(player: Player, enemy: Enemy): void {
        if (!player.isInvulnerable()) {
            const damage = 10;
            player.takeDamage(damage);
            
            // Enhanced hit feedback using AnimationManager
            if (this.animationManager && player instanceof Phaser.GameObjects.Sprite) {
                this.animationManager.showHitFeedback(player, damage);
                this.animationManager.applyInvulnerabilityFrames(player);
            }
            
            // Play hit sound using AudioManager
            if (this.audioManager) {
                this.audioManager.playHitSound();
            }
        }
    }

    private handleProjectileEnemyHit(projectile: Projectile, enemy: Enemy): void {
        const damage = projectile.damage;
        enemy.takeDamage(damage);
        projectile.destroy();
        
        // Enhanced hit feedback and impact particles
        if (this.animationManager) {
            this.animationManager.showHitFeedback(enemy, damage);
            this.animationManager.createImpactParticles(enemy.x, enemy.y, 'seed');
        }
        
            // TODO: Play hit sound using AudioManager
            // if (this.audioManager) {
            //     this.audioManager.playHitSound('enemy');
            // }
        
        if (enemy.health <= 0) {
            this.enemiesKilled++;
            const gameState = GameState.getInstance();
            gameState.updateScore(100);
            this.score = gameState.score;

            // Enhanced explosion effect for destroyed enemies
            if (this.animationManager) {
                this.animationManager.createImpactParticles(enemy.x, enemy.y, 'explode');
            }
            if (this.audioManager) {
                this.audioManager.playExplosion('small');
            }

            enemy.destroy();

        // Chance to spawn power-up
            if (Math.random() < 0.2) {
                this.spawnPowerUp(enemy.x, enemy.y);
            }
        }
    }

    private showTutorialIfNeeded(): void {
        const gameState = GameState.getInstance();
        const tutorialFlag = `tutorial_shown_${this.gameData.mode}`;

        if (!gameState.getFlag(tutorialFlag)) {
            this.showTutorial();
            gameState.setFlag(tutorialFlag, true);
        }
    }

    private showTutorial(): void {
        const { width, height } = this.cameras.main;

        // Create overlay background
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0);
        overlay.setInteractive();

        // Tutorial panel
        const panel = this.add.rectangle(width / 2, height / 2, 600, 450, COLORS.UI_BACKGROUND, 0.95);
        panel.setStrokeStyle(4, COLORS.UI_TEXT);

        // Title
        this.add.text(width / 2, height / 2 - 200, '🌱 Welcome to Veggie Clash!', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Controls instructions
        const instructions = this.gameData.mode === 'campaign' ? [
            '🎯 WASD or Arrow Keys: Move around',
            '🖱️ Mouse: Aim and shoot at enemies',
            '⚡ SPACE: Dash to avoid damage',
            '🔫 Q/E: Switch between weapons',
            '💚 Stay out of combat to heal',
            '',
            'Destroy 20 enemies to win the level!'
        ] : [
            '🏃 Endless Runner mode!',
            '🎯 WASD or Arrow Keys: Move',
            '🖱️ Mouse: Aim and shoot',
            '⚡ SPACE: Dash',
            '🔫 Q/E: Switch weapons',
            '',
            'Survive as long as possible!'
        ];

        instructions.forEach((instruction, index) => {
            this.add.text(width / 2, height / 2 - 120 + (index * 30), instruction, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        });

        // Start button
        const startButton = this.add.text(width / 2, height / 2 + 140, 'Start Playing!', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        startButton.setInteractive({ useHandCursor: true });
        startButton.on('pointerdown', () => {
            // Remove tutorial overlay and panel
            overlay.destroy();
            panel.destroy();
            startButton.destroy();
            // Tutorial instruction texts will be destroyed automatically
        });
    }

    private handleProjectilePlayerHit(projectile: Projectile, player: Player): void {
        if (!player.isInvulnerable()) {
            const damage = projectile.damage;
            player.takeDamage(damage);
            
            // Enhanced hit feedback using AnimationManager
            if (this.animationManager && player instanceof Phaser.GameObjects.Sprite) {
                this.animationManager.showHitFeedback(player, damage);
                this.animationManager.applyInvulnerabilityFrames(player);
            }
            
            // Play hit sound using AudioManager
            if (this.audioManager) {
                this.audioManager.playHitSound('player');
            }
        }
        projectile.destroy();
    }

    private handlePowerUpCollection(player: Player, powerUp: Phaser.GameObjects.GameObject): void {
        const powerUpSprite = powerUp as Phaser.GameObjects.Image;
        const assetKey = powerUpSprite.texture.key;

        // Enhanced power-up collection effect
        if (this.animationManager) {
            this.animationManager.createPowerUpEffect(powerUpSprite.x, powerUpSprite.y, 0x45B7D1);
        }

        // Play power-up sound using AudioManager
        if (this.audioManager) {
            this.audioManager.playPowerUpSound('common');
        }

        // Apply appropriate power-up effect based on asset key
        if (assetKey === AssetKey.PowerupRanch) {
            (player as any).applyPowerUp('RANCH_DIP', 1.5, 10000); // Damage boost - will be fixed with asset key update
        } else if (assetKey === AssetKey.PowerupOil) {
            (player as any).applyPowerUp('OLIVE_OIL', 1.15, 8000); // Speed boost - will be fixed with asset key update
        } else if (assetKey === AssetKey.PowerupFertilizer) {
            (player as any).applyPowerUp('FERTILIZER', 1.4, 10000); // Fire rate boost - will be fixed with asset key update
        } else if (assetKey === AssetKey.PowerupHeart) {
            (player as any).applyHeal(25); // Instant heal
        }

        powerUp.destroy();
    }

    private spawnPowerUp(x: number, y: number): void {
        const powerUpTypes = ['ranch', 'oil', 'fertilizer', 'heart'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        const powerUp = this.add.image(x, y, `powerup-${randomType}`);
        this.physics.add.existing(powerUp);
        this.powerUps.add(powerUp);
        
        // Add floating animation
        this.tweens.add({
            targets: powerUp,
            y: y - 10,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    private createHitEffect(x: number, y: number): void {
        const particles = this.add.particles(x, y, 'particle-hit', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            quantity: 5
        });
        
        this.time.delayedCall(300, () => particles.destroy());
    }

    private checkGameState(): void {
        // Check if player is dead
        if (this.player && this.player.health <= 0) {
            this.gameOver();
            return;
        }
        
        // Campaign mode: check if level is complete
        if (this.gameData.mode === 'campaign') {
            if (this.enemiesKilled >= 20) { // Simple win condition
                this.levelComplete();
            }
        }
        
        // Survival mode: increase difficulty over time
        if (this.gameData.mode === 'survival') {
            const newWave = Math.floor(this.gameTime / 60000) + 1; // New wave every minute
            if (newWave > this.wave) {
                this.wave = newWave;
                // Increase spawn rate
                // GAME_SETTINGS.ENEMY_SPAWN_RATE = Math.max(500, 2000 - (this.wave * 100));
            }
        }
    }

    private startHUD(): void {
        this.scene.launch(SCENE_KEYS.HUD, {
            player: this.player,
            gameMode: this.gameData.mode,
            level: this.gameData.level
        });
    }

    private startGameMusic(): void {
        if (this.sound.get(AUDIO_KEYS.MUSIC.GAME)) {
            const music = this.sound.add(AUDIO_KEYS.MUSIC.GAME, { loop: true, volume: 0.4 });
            music.play();
        }
    }

    private pauseGame(): void {
        if (this.isPaused) return this.resumeGame();

        this.isPaused = true;
        this.physics.world.pause();

        const w = this.scale.width, h = this.scale.height;

        const dim = this.add.rectangle(0, 0, w, h, 0x000000, 0.55).setOrigin(0);
        const panel = this.add.rectangle(w/2, h/2, 420, 300, 0x111111, 0.95).setOrigin(0.5).setStrokeStyle(2, 0xffffff, 0.25);

        const resume = this.add.text(w/2, h/2 - 80, "Resume", {
            fontSize: "22px",
            color: "#fff",
            backgroundColor: "rgba(255,255,255,.08)",
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerup", () => this.resumeGame());

        const settings = this.add.text(w/2, h/2 - 30, "Settings", {
            fontSize: "22px",
            color: "#fff",
            backgroundColor: "rgba(255,255,255,.08)",
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerup", () => {
            // For now, just show existing settings. In future could create dedicated game settings overlay
            this.scene.launch(SCENE_KEYS.PAUSE);
        });

        const restart = this.add.text(w/2, h/2 + 20, "Restart", {
            fontSize: "22px",
            color: "#fff",
            backgroundColor: "rgba(255,255,255,.08)",
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerup", () => this.restartLevel());

        const mainMenu = this.add.text(w/2, h/2 + 70, "Main Menu", {
            fontSize: "22px",
            color: "#fff",
            backgroundColor: "rgba(255,255,255,.08)",
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerup", () => this.exitToMenu());

        this.pauseOverlay = this.add.container(0, 0, [dim, panel, resume, settings, restart, mainMenu]);
    }

    private resumeGame(): void {
        this.pauseOverlay?.destroy(true);
        this.pauseOverlay = undefined;
        this.physics.world.resume();
        this.isPaused = false;
    }

    private restartLevel(): void {
        this.pauseOverlay?.destroy(true);
        this.scene.restart(); // This will call init() and reset the scene
    }

    private exitToMenu(): void {
        this.pauseOverlay?.destroy(true);
        this.scene.stop(SCENE_KEYS.HUD);
        this.scene.start(SCENE_KEYS.MENU);
    }

    private gameOver(): void {
        // Stop HUD scene first
        this.scene.stop(SCENE_KEYS.HUD);
        this.scene.start(SCENE_KEYS.GAME_OVER, {
            score: this.score,
            wave: this.wave,
            enemiesKilled: this.enemiesKilled,
            mode: this.gameData.mode
        });
    }

    private levelComplete(): void {
        if (this.gameData.mode === 'campaign' && this.gameData.level && this.gameData.level < 2) {
            // Start next level
            this.scene.stop(SCENE_KEYS.HUD);
            this.scene.start(SCENE_KEYS.GAME, {
                mode: 'campaign',
                level: this.gameData.level + 1
            });
        } else {
            // Campaign complete or survival mode
            this.scene.stop(SCENE_KEYS.HUD);
            this.scene.start(SCENE_KEYS.GAME_OVER, {
                score: this.score,
                wave: this.wave,
                enemiesKilled: this.enemiesKilled,
                mode: this.gameData.mode,
                victory: true
            });
        }
    }

    shutdown(): void {
        // Clean up
        this.sound.stopAll();
        window.removeEventListener('joystick-move', () => {});
        window.removeEventListener('mobile-shoot', () => {});
        window.removeEventListener('mobile-dash', () => {});
        window.removeEventListener('mobile-pause', () => {});
    }
}
