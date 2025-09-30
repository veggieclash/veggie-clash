/**
 * Performance Monitor - Monitors FPS and adjusts quality settings
 * Tracks frame rate and reduces effects when performance drops
 */

export class PerformanceMonitor {
    private scene: Phaser.Scene;
    private fpsHistory: number[] = [];
    private historySize = 10;
    private lastAdjustment = 0;
    private readonly ADJUSTMENT_COOLDOWN = 3000; // 3 seconds between adjustments

    // Performance thresholds
    private readonly PERFECT_FPS = 60;
    private readonly GOOD_FPS = 50;
    private readonly POOR_FPS = 45;
    private readonly BAD_FPS = 30;

    // Quality settings
    private maxParticles = 50;
    private maxEnemies = 25;
    private enableBackgroundEffects = true;
    private parallaxUpdateRate = 1.0; // How often to update parallax (1.0 = every frame)

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initializeMonitoring();
    }

    /**
     * Initialize FPS monitoring
     */
    private initializeMonitoring(): void {
        // Monitor FPS every frame
        this.scene.events.on('update', () => {
            this.trackFPS();
            this.checkPerformance();
        });

        // Emit initial quality settings
        this.emitQualitySettings();
    }

    /**
     * Track current FPS
     */
    private trackFPS(): void {
        const currentFPS = Math.round(this.scene.game.loop.actualFps);
        this.fpsHistory.push(currentFPS);

        // Keep only recent history
        if (this.fpsHistory.length > this.historySize) {
            this.fpsHistory.shift();
        }
    }

    /**
     * Get average FPS over recent history
     */
    private getAverageFPS(): number {
        if (this.fpsHistory.length === 0) return this.PERFECT_FPS;

        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return sum / this.fpsHistory.length;
    }

    /**
     * Check performance and adjust quality if needed
     */
    private checkPerformance(): void {
        const now = this.scene.time.now;
        const avgFPS = this.getAverageFPS();

        // Only adjust if enough time has passed and we have stable history
        if (this.fpsHistory.length < this.historySize ||
            now - this.lastAdjustment < this.ADJUSTMENT_COOLDOWN) {
            return;
        }

        let qualityDegraded = false;

        // Performance-based adjustments
        if (avgFPS <= this.BAD_FPS) {
            // Critical performance - maximum quality reduction
            this.maxParticles = Math.max(10, this.maxParticles - 5);
            this.maxEnemies = Math.max(12, this.maxEnemies - 3);
            this.enableBackgroundEffects = false;
            this.parallaxUpdateRate = Math.max(0.2, this.parallaxUpdateRate - 0.2);
            qualityDegraded = true;
        } else if (avgFPS <= this.POOR_FPS) {
            // Poor performance - moderate reduction
            this.maxParticles = Math.max(20, this.maxParticles - 3);
            this.maxEnemies = Math.max(18, this.maxEnemies - 2);
            this.parallaxUpdateRate = Math.max(0.5, this.parallaxUpdateRate - 0.2);
            qualityDegraded = true;
        } else if (avgFPS >= this.GOOD_FPS) {
            // Good performance - gradual quality increase
            if (avgFPS >= this.PERFECT_FPS) {
                // Perfect performance - maximum quality
                this.maxParticles = Math.min(100, this.maxParticles + 1);
                this.maxEnemies = Math.min(40, this.maxEnemies + 1);
                this.enableBackgroundEffects = true;
                this.parallaxUpdateRate = Math.min(1.0, this.parallaxUpdateRate + 0.1);
            }
            // Reset adjustment timer even if no change to prevent constant small adjustments
            this.lastAdjustment = now;
        }

        if (qualityDegraded) {
            console.warn(`🎮 Performance Monitor: Low FPS (${avgFPS.toFixed(1)}), reducing quality`);
            this.lastAdjustment = now;
            this.emitQualitySettings();
        }
    }

    /**
     * Emit current quality settings as events
     */
    private emitQualitySettings(): void {
        // Emit global quality settings that systems can listen to
        this.scene.events.emit('PERFORMANCE/QUALITY_UPDATE', {
            maxParticles: this.maxParticles,
            maxEnemies: this.maxEnemies,
            enableBackgroundEffects: this.enableBackgroundEffects,
            parallaxUpdateRate: this.parallaxUpdateRate
        });
    }

    /**
     * Get current performance metrics
     */
    public getMetrics(): {
        currentFPS: number;
        averageFPS: number;
        qualitySettings: {
            maxParticles: number;
            maxEnemies: number;
            enableBackgroundEffects: boolean;
            parallaxUpdateRate: number;
        }
    } {
        return {
            currentFPS: Math.round(this.scene.game.loop.actualFps),
            averageFPS: Math.round(this.getAverageFPS()),
            qualitySettings: {
                maxParticles: this.maxParticles,
                maxEnemies: this.maxEnemies,
                enableBackgroundEffects: this.enableBackgroundEffects,
                parallaxUpdateRate: this.parallaxUpdateRate
            }
        };
    }

    /**
     * Manually override quality settings (for user preferences)
     */
    public setQualitySettings(settings: {
        maxParticles?: number;
        maxEnemies?: number;
        enableBackgroundEffects?: boolean;
        parallaxUpdateRate?: number;
    }): void {
        if (settings.maxParticles !== undefined) {
            this.maxParticles = Math.max(5, Math.min(200, settings.maxParticles));
        }
        if (settings.maxEnemies !== undefined) {
            this.maxEnemies = Math.max(5, Math.min(60, settings.maxEnemies));
        }
        if (settings.enableBackgroundEffects !== undefined) {
            this.enableBackgroundEffects = settings.enableBackgroundEffects;
        }
        if (settings.parallaxUpdateRate !== undefined) {
            this.parallaxUpdateRate = Math.max(0.1, Math.min(1.0, settings.parallaxUpdateRate));
        }

        this.emitQualitySettings();
        console.log('🎮 Performance Monitor: Quality settings manually updated');
    }

    /**
     * Force performance check (useful for testing)
     */
    public forcePerformanceCheck(): void {
        this.lastAdjustment = 0; // Allow immediate adjustment
        this.checkPerformance();
    }

    /**
     * Get performance rating string
     */
    public getPerformanceRating(): string {
        const avgFPS = this.getAverageFPS();

        if (avgFPS >= this.PERFECT_FPS) return 'Perfect';
        if (avgFPS >= this.GOOD_FPS) return 'Good';
        if (avgFPS >= this.POOR_FPS) return 'Poor';
        if (avgFPS >= this.BAD_FPS) return 'Bad';
        return 'Critical';
    }

    /**
     * Reset performance settings to defaults
     */
    public resetToDefaults(): void {
        this.maxParticles = 50;
        this.maxEnemies = 25;
        this.enableBackgroundEffects = true;
        this.parallaxUpdateRate = 1.0;
        this.emitQualitySettings();
        console.log('🎮 Performance Monitor: Reset to default quality settings');
    }

    /**
     * Cleanup
     */
    public destroy(): void {
        this.scene.events.off('update');
        this.fpsHistory = [];
    }
}
