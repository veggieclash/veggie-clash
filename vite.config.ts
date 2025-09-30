import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // GitHub Pages deployment configuration
  base: process.env.NODE_ENV === 'production' ? '/veggie-clash/' : '/',
  
  // Build configuration
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/game': resolve(__dirname, 'src/game'),
      '@/assets': resolve(__dirname, 'src/game/assets'),
      '@/data': resolve(__dirname, 'src/game/data')
    }
  },

  // Asset handling
  assetsInclude: ['**/*.json', '**/*.png', '**/*.jpg', '**/*.svg', '**/*.mp3', '**/*.wav', '**/*.ogg'],

  // Optimization
  optimizeDeps: {
    include: ['phaser', 'tone']
  }
})
