/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', 'docs/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        'dist/',
        'docs/',
        '**/*.d.ts',
        'src/main.ts',
        'src/game/scenes/**', // Exclude scene files for rendering coverage
        'src/game/systems/AssetGenerator.ts', // Procedural generation
        'src/game/assets/**', // Asset files
        'vite.config.ts',
        'vitest.config.ts'
      ],
      lines: 70,
      branches: 60,
      functions: 70,
      statements: 70
    },
    testTimeout: 10000,
    bail: 1
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
