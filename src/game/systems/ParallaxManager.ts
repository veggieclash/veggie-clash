/**
 * Veggie Clash - Parallax Manager
 * Handles multi-layer parallax scrolling background system
 */

import Phaser from 'phaser';

interface ParallaxLayer {
    graphics: Phaser.GameObjects.Graphics;
    scrollFactor: number;
    lastCameraX: number;
    lastCameraY: number;
}

export class ParallaxManager {
    private scene: Phaser.Scene;
    private layers: ParallaxLayer[] = [];
    private worldWidth: number;
    private worldHeight: number;

    constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
        this.scene = scene;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.createLayers();
    }

    private createLayers(): void {
        // Far layer (factor 0.20) - sky, distant hills, clouds
        const farLayer = this.createFarLayer();
        this.layers.push({
            graphics: farLayer,
            scrollFactor: 0.20,
            lastCameraX: 0,
            lastCameraY: 0
        });

        // Mid layer (factor 0.50) - tree line, greenhouse, barns
        const midLayer = this.createMidLayer();
        this.layers.push({
            graphics: midLayer,
            scrollFactor: 0.50,
            lastCameraX: 0,
            lastCameraY: 0
        });

        // Near layer (factor 0.85) - fence posts, shrubs, tall grass
        const nearLayer = this.createNearLayer();
        this.layers.push({
            graphics: nearLayer,
            scrollFactor: 0.85,
            lastCameraX: 0,
            lastCameraY: 0
        });
    }

    private createFarLayer(): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(-100);

        // Sky gradient
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x90EE90, 1);
        graphics.fillRect(0, 0, this.worldWidth * 2, this.worldHeight);

        // Distant hills
        const hillColor = 0x8FBC8F;
        for (let i = 0; i < 8; i++) {
            const x = (i * this.worldWidth / 4) - this.worldWidth / 2;
            const y = this.worldHeight * 0.7;
            const width = this.worldWidth / 3;
            const height = this.worldHeight * 0.3;
            
            graphics.fillStyle(hillColor, 0.6);
            graphics.fillEllipse(x, y, width, height);
        }

        // Clouds
        graphics.fillStyle(0xFFFFFF, 0.8);
        for (let i = 0; i < 12; i++) {
            const x = Math.random() * this.worldWidth * 2;
            const y = Math.random() * this.worldHeight * 0.4;
            const size = 40 + Math.random() * 60;
            
            // Cloud made of overlapping circles
            graphics.fillCircle(x, y, size);
            graphics.fillCircle(x + size * 0.6, y, size * 0.8);
            graphics.fillCircle(x - size * 0.6, y, size * 0.8);
            graphics.fillCircle(x, y - size * 0.4, size * 0.6);
        }

        return graphics;
    }

    private createMidLayer(): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(-50);

        // Tree line
        graphics.fillStyle(0x228B22, 0.7);
        const treeY = this.worldHeight * 0.8;
        for (let i = 0; i < 20; i++) {
            const x = (i * this.worldWidth / 10) - this.worldWidth / 2;
            const height = 80 + Math.random() * 40;
            const width = 20 + Math.random() * 15;
            
            // Tree trunk
            graphics.fillStyle(0x8B4513, 0.8);
            graphics.fillRect(x - width/4, treeY, width/2, height * 0.3);
            
            // Tree crown
            graphics.fillStyle(0x228B22, 0.7);
            graphics.fillCircle(x, treeY - height * 0.2, width);
        }

        // Greenhouse silhouettes
        for (let i = 0; i < 3; i++) {
            const x = (i * this.worldWidth / 2) + this.worldWidth * 0.2;
            const y = this.worldHeight * 0.75;
            const width = 120;
            const height = 80;

            // Greenhouse frame
            graphics.lineStyle(3, 0x8B4513, 0.6);
            graphics.strokeRect(x - width/2, y - height, width, height);
            
            // Glass panels
            graphics.fillStyle(0xF0F8FF, 0.3);
            graphics.fillRect(x - width/2 + 3, y - height + 3, width - 6, height - 6);
            
            // Roof
            graphics.fillStyle(0x654321, 0.8);
            graphics.fillTriangle(x - width/2 - 10, y - height, x + width/2 + 10, y - height, x, y - height - 30);
        }

        // Barn silhouette
        const barnX = this.worldWidth * 0.1;
        const barnY = this.worldHeight * 0.8;
        graphics.fillStyle(0x8B0000, 0.6);
        graphics.fillRect(barnX - 60, barnY - 100, 120, 100);
        graphics.fillTriangle(barnX - 70, barnY - 100, barnX + 70, barnY - 100, barnX, barnY - 150);

        return graphics;
    }

    private createNearLayer(): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(-10);

        // Wooden fence posts
        graphics.fillStyle(0x8B4513, 0.9);
        for (let i = 0; i < 40; i++) {
            const x = i * (this.worldWidth / 20);
            const y = this.worldHeight * 0.85;
            const height = 40 + Math.random() * 20;
            
            graphics.fillRect(x - 3, y - height, 6, height);
            
            // Fence rails
            if (i > 0) {
                graphics.fillRect(x - this.worldWidth/40, y - height * 0.7, this.worldWidth/20, 4);
                graphics.fillRect(x - this.worldWidth/40, y - height * 0.4, this.worldWidth/20, 4);
            }
        }

        // Shrubs and bushes
        graphics.fillStyle(0x32CD32, 0.8);
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.worldWidth;
            const y = this.worldHeight * (0.85 + Math.random() * 0.1);
            const size = 15 + Math.random() * 25;
            
            // Bush made of overlapping circles
            graphics.fillCircle(x, y, size);
            graphics.fillCircle(x + size * 0.4, y - size * 0.2, size * 0.8);
            graphics.fillCircle(x - size * 0.4, y - size * 0.2, size * 0.8);
        }

        // Tall grass clumps
        graphics.lineStyle(2, 0x90EE90, 0.7);
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.worldWidth;
            const y = this.worldHeight * (0.9 + Math.random() * 0.08);
            const height = 10 + Math.random() * 15;
            
            // Draw several grass blades
            for (let j = 0; j < 3; j++) {
                const offsetX = (Math.random() - 0.5) * 8;
                graphics.lineBetween(x + offsetX, y, x + offsetX + (Math.random() - 0.5) * 4, y - height);
            }
        }

        // Irrigation pipes
        graphics.lineStyle(6, 0x708090, 0.8);
        const pipeY = this.worldHeight * 0.88;
        graphics.lineBetween(0, pipeY, this.worldWidth, pipeY);
        
        // Pipe joints
        graphics.fillStyle(0x2F4F4F, 0.9);
        for (let i = 0; i < 8; i++) {
            const x = (i + 1) * this.worldWidth / 9;
            graphics.fillCircle(x, pipeY, 8);
        }

        // Rocks scattered around
        graphics.fillStyle(0x696969, 0.8);
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.worldWidth;
            const y = this.worldHeight * (0.85 + Math.random() * 0.1);
            const size = 8 + Math.random() * 12;
            
            graphics.fillEllipse(x, y, size * 1.2, size * 0.8);
        }

        return graphics;
    }

    public update(camera: Phaser.Cameras.Scene2D.Camera): void {
        const deltaX = camera.scrollX - this.layers[0].lastCameraX;
        const deltaY = camera.scrollY - this.layers[0].lastCameraY;

        this.layers.forEach((layer) => {
            // Apply parallax scrolling
            const parallaxDeltaX = deltaX * layer.scrollFactor;
            const parallaxDeltaY = deltaY * layer.scrollFactor;
            
            layer.graphics.x -= parallaxDeltaX;
            layer.graphics.y -= parallaxDeltaY;
            
            // Update last camera position for this layer
            layer.lastCameraX = camera.scrollX;
            layer.lastCameraY = camera.scrollY;
        });
    }

    public destroy(): void {
        this.layers.forEach(layer => layer.graphics.destroy());
        this.layers = [];
    }
}
