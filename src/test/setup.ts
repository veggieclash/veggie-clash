/**
 * Vitest setup file for Veggie Clash
 */

import { vi, beforeAll } from 'vitest';

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore logs during testing
  // log: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

// Mock Phaser for non-UI tests
const mockPhaserScene = {
  add: {
    graphics: vi.fn(() => ({
      fillStyle: vi.fn().mockReturnThis(),
      fillCircle: vi.fn().mockReturnThis(),
      fillRect: vi.fn().mockReturnThis(),
      strokeCircle: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    })),
    renderTexture: vi.fn(() => ({
      draw: vi.fn(),
      saveTexture: vi.fn(),
    })),
    sprite: vi.fn(),
    group: vi.fn(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      children: { entries: [] }
    })),
    text: vi.fn(),
    particles: vi.fn(),
  },
  textures: {
    exists: vi.fn(() => false),
    get: vi.fn()
  },
  physics: {
    add: {
      existing: vi.fn(),
      overlap: vi.fn()
    },
    world: {
      setBounds: vi.fn()
    }
  },
  cameras: {
    main: {
      setScroll: vi.fn(),
      setBounds: vi.fn(),
      shake: vi.fn(),
      ignore: vi.fn(),
      startFollow: vi.fn(),
      scrollX: 0,
      scrollY: 0
    }
  },
  events: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  },
  time: {
    addEvent: vi.fn(),
    delayedCall: vi.fn((delay, callback) => ({ callback }))
  },
  tweens: {
    add: vi.fn(() => ({
      onComplete: { callback: vi.fn() }
    }))
  },
  input: {
    keyboard: {
      createCursorKeys: vi.fn(() => ({
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false }
      })),
      on: vi.fn(),
      off: vi.fn()
    },
    on: vi.fn()
  },
  scene: {
    launch: vi.fn(),
    pause: vi.fn(),
    start: vi.fn()
  },
  load: {
    audio: vi.fn(),
    spritesheet: vi.fn(),
    image: vi.fn()
  },
  game: {
    loop: {
      delta: 16.67 // ~60 FPS
    }
  }
};

// Mock window events for mobile controls
global.window = {
  ...global.window,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
} as any;

// Make Phaser globally available for tests
beforeAll(() => {
  (global as any).Phaser = {
    Scene: class {
      constructor() {
        Object.assign(this, mockPhaserScene);
      }
    },
    Game: vi.fn(),
    AUTO: 'AUTO',
    Math: {
      Clamp: Math.min,
      Distance: {
        Between: (x1: number, y1: number, x2: number, y2: number) =>
          Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      },
      Angle: {
        Between: (x1: number, y1: number, x2: number, y2: number) =>
          Math.atan2(y2 - y1, x2 - x1)
      },
      PI2: Math.PI * 2
    },
    Display: {
      Color: {
        GetColor: (r: number, g: number, b: number) => (r << 16) + (g << 8) + b
      }
    },
    Scale: {
      FIT: 'FIT',
      CENTER_BOTH: 'CENTER_BOTH'
    },
    Physics: {
      Arcade: {
        Body: class {
          setVelocity(x: number, y: number) {
            this.velocity = { x, y };
          }
          setVelocityX(x: number) { this.velocity.x = x; }
          setVelocityY(y: number) { this.velocity.y = y; }
          setImmovable(immovable: boolean) { this.immovable = immovable; }
          velocity = { x: 0, y: 0 };
          immovable = false;
        }
      }
    }
  };
});
