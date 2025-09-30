/**
 * Veggie Clash - Boot Scene
 * Initial scene that sets up the game and loads critical assets
 */

import Phaser from 'phaser';
import { SCENE_KEYS, COLORS } from '@/game/config';
import { AssetGenerator } from '../systems/AssetGenerator';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.BOOT });
    }

    preload(): void {
        // Create loading bar
        this.createLoadingScreen();
        
        // Load essential assets for the loading screen
        this.loadEssentialAssets();
    }

    create(): void {
        // Initialize game systems
        this.setupGameSystems();
        
        // Start the preload scene
        this.scene.start(SCENE_KEYS.PRELOAD);
    }

    private createLoadingScreen(): void {
        const { width, height } = this.cameras.main;
        
        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x4CAF50, 0x4CAF50, 0x8BC34A, 0x8BC34A, 1);
        graphics.fillRect(0, 0, width, height);

        // Title text
        this.add.text(width / 2, height / 2 - 100, '🥕 Veggie Clash 🥕', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Loading text
        this.add.text(width / 2, height / 2 + 50, 'Initializing garden warfare...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Loading bar background
        const loadingBarBg = this.add.rectangle(width / 2, height / 2 + 100, 400, 20, 0x000000, 0.5);
        loadingBarBg.setStrokeStyle(2, 0xffffff);

        // Loading bar
        const loadingBar = this.add.rectangle(width / 2 - 200, height / 2 + 100, 4, 16, 0xffffff);
        
        // Update loading bar on progress
        this.load.on('progress', (progress: number) => {
            loadingBar.width = 396 * progress;
            loadingBar.x = (width / 2) - 200 + (loadingBar.width / 2);
        });

        // Handle file load progress
        this.load.on('fileprogress', (file: any) => {
            console.log(`Loading: ${file.key}`);
        });
    }

    private loadEssentialAssets(): void {
        // Create placeholder textures programmatically if assets don't exist
        this.createPlaceholderTextures();
        
        // Try to load favicon as a test
        this.load.image('favicon', 'favicon.png').on('loaderror', () => {
            console.warn('Favicon not found, using placeholder');
        });
    }

    private createPlaceholderTextures(): void {
        // Generate Disney-style assets using AssetGenerator
        console.log('Generating Disney-style vegetable characters...');

        try {
            const assetGenerator = new AssetGenerator(this);
            assetGenerator.generateAllAssets();
            console.log('Disney-style assets generated successfully!');
        } catch (error) {
            console.warn('Asset generation failed, proceeding without procedural assets:', error);
        }
    }


    private setupGameSystems(): void {
        // Enable input systems
        this.input.keyboard?.enabled && console.log('Keyboard input enabled');
        this.input.mouse?.enabled && console.log('Mouse input enabled');
        
        // Set up global input handlers
        this.input.keyboard?.on('keydown-F11', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // Initialize audio context on first user interaction
        this.input.once('pointerdown', () => {
            try {
                if (this.sound && (this.sound as any).context?.state === 'suspended') {
                    (this.sound as any).context.resume();
                }
            } catch (e) {
                console.log('Audio context not available or already running');
            }
        });

        console.log('🥕 Boot scene initialized successfully');
    }
}
