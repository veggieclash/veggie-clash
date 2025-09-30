/**
 * Asset Validator - Utility for validating asset keys at runtime
 * Prevents "missing texture" errors and logs issues for debugging
 */

import { AssetKey } from './AssetGenerator';

export class AssetValidator {
    private scene: Phaser.Scene;
    private static instance: AssetValidator;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        AssetValidator.instance = this;
    }

    /**
     * Get the Asset Validator instance (should match scene)
     */
    static getInstance(): AssetValidator | null {
        return AssetValidator.instance;
    }

    /**
     * Validate if a texture exists, log warnings for missing assets
     */
    validateTexture(key: string): boolean {
        if (!this.scene.textures.exists(key)) {
            console.warn(`AssetValidator: Missing texture key "${key}". Available textures:`,
                this.getAvailableTextures());
            return false;
        }
        return true;
    }

    /**
     * Get a list of all available texture keys in the scene
     */
    getAvailableTextures(): string[] {
        return this.scene.textures.getTextureKeys();
    }

    /**
     * Validate multiple asset keys at once
     */
    validateAssets(keys: string[]): { valid: string[], invalid: string[] } {
        const valid: string[] = [];
        const invalid: string[] = [];

        for (const key of keys) {
            if (this.validateTexture(key)) {
                valid.push(key);
            } else {
                invalid.push(key);
            }
        }

        if (invalid.length > 0) {
            console.warn(`AssetValidator: ${invalid.length} asset keys not found:`, invalid);
        }

        return { valid, invalid };
    }

    /**
     * Get the closest matching asset key if an exact match fails
     */
    suggestSimilar(key: string): string[] {
        const available = this.getAvailableTextures();

        // Simple string similarity - check for substring matches
        const suggestions: string[] = [];

        for (const availableKey of available) {
            if (availableKey.includes(key) || key.includes(availableKey)) {
                suggestions.push(availableKey);
            }
        }

        return suggestions;
    }

    /**
     * Run comprehensive asset validation on build/load
     */
    validateBuild(): void {
        console.log('AssetValidator: Running comprehensive asset validation...');

        // Validate all AssetKey enum values
        const allAssetKeys = Object.values(AssetKey);

        // Filter out frame-specific keys that are generated dynamically
        const staticKeys = allAssetKeys.filter(key =>
            !key.startsWith('explosion_frame_') &&
            !key.startsWith('ExplosionFrame')
        );

        const { valid, invalid } = this.validateAssets(staticKeys);

        console.log(`AssetValidator: ${valid.length} valid assets, ${invalid.length} missing assets`);

        if (invalid.length > 0) {
            console.error('AssetValidator: Missing critical assets:');
            for (const invalidKey of invalid) {
                const suggestions = this.suggestSimilar(invalidKey);
                if (suggestions.length > 0) {
                    console.error(`  "${invalidKey}" - Did you mean: ${suggestions.join(', ')}?`);
                } else {
                    console.error(`  "${invalidKey}" - No similar assets found`);
                }
            }
        }

        console.log('AssetValidator: Asset validation complete');
    }
}
