/**
 * Veggie Clash - Preload Scene
 * Loads all game assets and initializes audio
 */

import Phaser from 'phaser';
import { SCENE_KEYS, ASSET_PATHS, AUDIO_KEYS } from '@/game/config';

export class PreloadScene extends Phaser.Scene {
    private loadingText!: Phaser.GameObjects.Text;
    private progressBar!: Phaser.GameObjects.Rectangle;
    
    constructor() {
        super({ key: SCENE_KEYS.PRELOAD });
    }

    preload(): void {
        this.createLoadingUI();
        this.loadAssets();
        this.setupLoadingEvents();
    }

    create(): void {
        // Initialize audio system
        this.initializeAudio();
        
        // Create animations
        this.createAnimations();
        
        // Start the menu scene
        this.scene.start(SCENE_KEYS.MENU);
    }

    private createLoadingUI(): void {
        const { width, height } = this.cameras.main;
        
        // Background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x4CAF50, 0x4CAF50, 0x8BC34A, 0x8BC34A, 1);
        graphics.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, height / 2 - 150, '🥕 Veggie Clash 🥕', {
            fontFamily: 'Arial',
            fontSize: '56px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height / 2 - 80, 'Garden Warfare Loading...', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2 + 20, 'Loading assets...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Progress bar background
        const progressBg = this.add.rectangle(width / 2, height / 2 + 80, 500, 30, 0x000000, 0.5);
        progressBg.setStrokeStyle(3, 0xffffff);

        // Progress bar
        this.progressBar = this.add.rectangle(width / 2 - 246, height / 2 + 80, 4, 24, 0xffffff);

        // Tips text
        const tips = [
            "🥕 Use WASD to move around the garden",
            "🎯 Click to shoot, right-click for special attacks",
            "⚡ Press SPACE to dash and avoid damage",
            "🔫 Press Q/E to switch weapons",
            "❤️ Stay out of combat for 5 seconds to regenerate health"
        ];
        
        this.add.text(width / 2, height / 2 + 150, tips[Math.floor(Math.random() * tips.length)], {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    private loadAssets(): void {
        // Skip loading external assets - use only procedurally generated assets from BootScene
        console.log('Using procedurally generated assets...');

        // Load only the JSON data files that exist
        this.loadData();

        // Preload background manager assets if needed
        if (this.scene.get(SCENE_KEYS.GAME)) {
            // The BackgroundManager will handle its own preloading via create()
            console.log('BackgroundManager will load assets on demand');
        }
        
        // Set up procedural audio
        this.setupProceduralAudio();
    }

    private loadData(): void {
        // Load the data files from public directory
        if (this.load) {
            // These files now exist in the public/data folders
            this.load.json('level1-data', 'data/levels/level1.json');
            this.load.json('level2-data', 'data/levels/level2.json');
            this.load.json('arena-data', 'data/levels/survival_arena.json');

            this.load.json('weapons-balance', 'data/balance/weapons.json');
            this.load.json('enemies-balance', 'data/balance/enemies.json');
            this.load.json('powerups-balance', 'data/balance/powerups.json');

            // Add error handlers for data files
            const dataFiles = ['level1-data', 'level2-data', 'arena-data', 'weapons-balance', 'enemies-balance', 'powerups-balance'];
            dataFiles.forEach(key => {
                this.load.on(`loaderror-${key}`, () => {
                    console.warn(`Data file ${key} not found, using default configuration`);
                });
            });
        }
    }

    private setupLoadingEvents(): void {
        // Update progress bar
        this.load.on('progress', (progress: number) => {
            this.progressBar.width = 492 * progress;
            this.progressBar.x = (this.cameras.main.width / 2) - 246 + (this.progressBar.width / 2);
        });

        // Update loading text
        this.load.on('fileprogress', (file: any) => {
            this.loadingText.setText(`Loading: ${file.key}...`);
        });

        // Handle completion
        this.load.on('complete', () => {
            this.loadingText.setText('Loading complete! Starting game...');
        });
    }

    private initializeAudio(): void {
        // Set up audio system with fallback to procedural generation
        if (!this.sound.locked) {
            this.setupProceduralAudio();
        } else {
            // Wait for user interaction to unlock audio
            this.input.once('pointerdown', () => {
                this.setupProceduralAudio();
            });
        }
    }

    private setupProceduralAudio(): void {
        // Generate procedural audio for missing files using Web Audio API
        // This is a fallback for when audio files are not available
        console.log('Setting up procedural audio generation...');
        
        // We'll implement actual procedural audio in the AudioManager
        // For now, just log that the system is ready
        console.log('Audio system initialized');
    }

    private createAnimations(): void {
        // Create player animations if spritesheet is available
        if (this.textures.exists('player-sheet')) {
            this.anims.create({
                key: 'player-idle',
                frames: this.anims.generateFrameNumbers('player-sheet', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'player-walk',
                frames: this.anims.generateFrameNumbers('player-sheet', { start: 4, end: 7 }),
                frameRate: 12,
                repeat: -1
            });

            this.anims.create({
                key: 'player-dash',
                frames: this.anims.generateFrameNumbers('player-sheet', { start: 8, end: 11 }),
                frameRate: 20,
                repeat: 0
            });
        }

        console.log('Animations created');
    }
}
