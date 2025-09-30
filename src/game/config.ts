/**
 * Veggie Clash - Game Configuration
 * Central configuration file for game constants, settings, and Phaser config
 */

export const GAME_CONFIG = {
    // Game dimensions
    WIDTH: 800,
    HEIGHT: 600,
    
    // Performance
    TARGET_FPS: 60,
    PHYSICS_FPS: 60,
    
    // Player configuration
    PLAYER: {
        SPEED: 200,
        HEALTH: 100,
        HEALTH_REGEN_RATE: 1, // HP per second
        HEALTH_REGEN_DELAY: 5000, // ms out of combat before regen starts
        DASH_SPEED: 400,
        DASH_DURATION: 150,
        DASH_COOLDOWN: 1000,
        GRENADE_COOLDOWN: 12000
    },
    
    // Combat
    COMBAT: {
        CRIT_MULTIPLIER: 1.5,
        COMBO_DECAY_TIME: 3000,
        HIT_STOP_DURATION: 60,
        SCREEN_SHAKE_INTENSITY: 4
    },
    
    // Wave system
    WAVES: {
        BASE_SPAWN_RATE: 2000,
        DIFFICULTY_SCALING: 1.1,
        ELITE_WAVE_INTERVAL: 3,
        SURVIVAL_WAVE_DURATION: 60000
    },
    
    // Audio
    AUDIO: {
        MASTER_VOLUME: 0.7,
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.8
    }
};

export const COLORS = {
    // UI Colors
    PRIMARY: '#4CAF50',
    SECONDARY: '#FFC107',
    DANGER: '#F44336',
    SUCCESS: '#8BC34A',
    INFO: '#2196F3',
    WARNING: '#FF9800',
    
    // High contrast mode
    HIGH_CONTRAST: {
        BLACK: '#000000',
        WHITE: '#FFFFFF',
        YELLOW: '#FFFF00',
        BLUE: '#0000FF'
    },
    
    // Color-blind safe palette
    COLOR_BLIND_SAFE: {
        BLUE: '#0173B2',
        ORANGE: '#DE8F05',
        GREEN: '#029E73',
        PINK: '#CC78BC',
        BROWN: '#CA9161',
        PURPLE: '#7570B3',
        RED: '#D55E00'
    },
    
    // Game colors
    PLAYER: '#FF6B35',
    ENEMY: '#8B5A3C',
    PROJECTILE: '#4ECDC4',
    POWERUP: '#45B7D1',
    UI_BACKGROUND: 'rgba(0, 0, 0, 0.8)',
    HEALTH_BAR: '#4CAF50',
    HEALTH_BAR_LOW: '#F44336',
    
    // Missing colors for entities
    PRIMARY_GREEN: '#4CAF50',
    SECONDARY_GREEN: '#8BC34A',
    TOMATO_RED: '#FF4444',
    ONION_WHITE: '#F5F5F5',
    PEPPER_YELLOW: '#FFEB3B',
    BROCCOLI_GREEN: '#4CAF50',
    EGGPLANT_PURPLE: '#673AB7',
    HEALTH_LOW: '#F44336',
    ACCENT_ORANGE: '#FF9800',
    UI_TEXT: '#FFFFFF',
    ONION_PURPLE: '#800080',
    UI_BUTTON: '#4CAF50',
    HEALTH_MEDIUM: '#FFA500',
    HEALTH_FULL: '#00FF00',
    EXPLOSION: '#FF4500',
    MUZZLE_FLASH: '#FFFF00',
    POWER_UP: '#45B7D1'
};

export const INPUT_KEYS = {
    // Movement
    MOVE_LEFT: 'KeyA',
    MOVE_RIGHT: 'KeyD',
    MOVE_UP: 'KeyW',
    MOVE_DOWN: 'KeyS',
    
    // Combat
    SHOOT: 'Mouse0',
    AIM: 'Mouse1',
    DASH: 'Space',
    GRENADE: 'KeyQ',
    RELOAD: 'KeyR',
    
    // Weapons
    WEAPON_1: 'Digit1',
    WEAPON_2: 'Digit2',
    WEAPON_3: 'Digit3',
    WEAPON_PREV: 'KeyQ',
    WEAPON_NEXT: 'KeyE',
    
    // UI
    PAUSE: 'Escape',
    INVENTORY: 'Tab',
    MAP: 'KeyM',
    
    // Debug (development only)
    DEBUG_OVERLAY: 'F12',
    GOD_MODE: 'F1',
    SPAWN_ENEMY: 'F2'
};

export const AUDIO_KEYS = {
    // Music
    MUSIC: {
        MENU: 'music_menu',
        GAME: 'music_game',
        BOSS: 'music_boss',
        VICTORY: 'music_victory',
        GAME_OVER: 'music_game_over'
    },
    
    // SFX - Player
    PLAYER: {
        SHOOT_PEA: 'sfx_shoot_pea',
        SHOOT_CORN: 'sfx_shoot_corn',
        SHOOT_BEET: 'sfx_shoot_beet',
        DASH: 'sfx_dash',
        HIT: 'sfx_player_hit',
        DEATH: 'sfx_player_death',
        HEALTH_PICKUP: 'sfx_health_pickup',
        WEAPON_PICKUP: 'sfx_weapon_pickup',
        RELOAD: 'sfx_reload'
    },
    
    // SFX - Enemies
    ENEMIES: {
        TOMATO_ATTACK: 'sfx_tomato_attack',
        TOMATO_DEATH: 'sfx_tomato_death',
        ONION_ATTACK: 'sfx_onion_attack',
        ONION_DEATH: 'sfx_onion_death',
        PEPPER_SHOOT: 'sfx_pepper_shoot',
        PEPPER_DEATH: 'sfx_pepper_death',
        BROCCOLI_STOMP: 'sfx_broccoli_stomp',
        BROCCOLI_DEATH: 'sfx_broccoli_death',
        EGGPLANT_ATTACK: 'sfx_eggplant_attack',
        EGGPLANT_DEATH: 'sfx_eggplant_death'
    },
    
    // SFX - Environment
    ENVIRONMENT: {
        EXPLOSION: 'sfx_explosion',
        IMPACT: 'sfx_impact',
        POWERUP_SPAWN: 'sfx_powerup_spawn',
        WAVE_START: 'sfx_wave_start',
        WAVE_COMPLETE: 'sfx_wave_complete',
        BOSS_WARNING: 'sfx_boss_warning'
    },
    
    // SFX - UI
    UI: {
        BUTTON_CLICK: 'sfx_button_click',
        BUTTON_HOVER: 'sfx_button_hover',
        MENU_SELECT: 'sfx_menu_select',
        MENU_BACK: 'sfx_menu_back',
        ERROR: 'sfx_error',
        SUCCESS: 'sfx_success'
    },
    
    // Legacy SFX structure for backward compatibility
    SFX: {
        SHOOT_PEA: 'sfx_shoot_pea',
        SHOOT_CORN: 'sfx_shoot_corn',
        SHOOT_BEET: 'sfx_shoot_beet',
        DASH: 'sfx_dash',
        HIT: 'sfx_player_hit',
        EXPLOSION: 'sfx_explosion',
        POWER_UP: 'sfx_powerup_spawn',
        MENU_SELECT: 'sfx_menu_select',
        MENU_HOVER: 'sfx_button_hover'
    }
};

export const ASSET_KEYS = {
    // Sprites
    SPRITES: {
        PLAYER: 'player_carrot',
        ENEMIES: {
            TOMATO: 'enemy_tomato',
            ONION: 'enemy_onion',
            PEPPER: 'enemy_pepper',
            BROCCOLI: 'enemy_broccoli',
            EGGPLANT: 'boss_eggplant'
        },
        PROJECTILES: {
            PEA: 'projectile_pea',
            CORN: 'projectile_corn',
            BEET: 'projectile_beet',
            TOMATO_SEED: 'projectile_tomato_seed',
            PEPPER_BEAM: 'projectile_pepper_beam'
        },
        POWERUPS: {
            RANCH: 'powerup_ranch',
            OLIVE_OIL: 'powerup_olive_oil',
            FERTILIZER: 'powerup_fertilizer',
            COMPOST: 'powerup_compost_heart'
        }
    },
    
    // UI
    UI: {
        HEALTH_BAR: 'ui_health_bar',
        AMMO_COUNTER: 'ui_ammo_counter',
        WEAPON_ICONS: {
            PEA_SHOOTER: 'ui_weapon_pea',
            CORN_CANNON: 'ui_weapon_corn',
            BEET_BAZOOKA: 'ui_weapon_beet'
        },
        BUTTONS: {
            PLAY: 'ui_button_play',
            SETTINGS: 'ui_button_settings',
            QUIT: 'ui_button_quit',
            PAUSE: 'ui_button_pause',
            RESUME: 'ui_button_resume'
        },
        MOBILE: {
            JOYSTICK_BASE: 'ui_joystick_base',
            JOYSTICK_KNOB: 'ui_joystick_knob',
            SHOOT_BUTTON: 'ui_mobile_shoot',
            DASH_BUTTON: 'ui_mobile_dash'
        }
    },
    
    // Backgrounds
    BACKGROUNDS: {
        MENU: 'bg_menu',
        LEVEL_1: 'bg_garden_paths',
        LEVEL_2: 'bg_greenhouse',
        SURVIVAL: 'bg_arena'
    },
    
    // Particles
    PARTICLES: {
        MUZZLE_FLASH: 'particle_muzzle_flash',
        EXPLOSION: 'particle_explosion',
        IMPACT: 'particle_impact',
        PICKUP_SPARKLE: 'particle_pickup_sparkle',
        VEGGIE_CHUNKS: 'particle_veggie_chunks'
    }
};

/**
 * Phaser game configuration
 */
export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    backgroundColor: '#2E7D32',
    
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
            fps: GAME_CONFIG.PHYSICS_FPS
        }
    },
    
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 400,
            height: 300
        },
        max: {
            width: 1600,
            height: 1200
        }
    },
    
    render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true
    },
    
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false
    },
    
    audio: {
        disableWebAudio: false,
        context: undefined
    },
    
    fps: {
        target: GAME_CONFIG.TARGET_FPS,
        forceSetTimeOut: false,
        deltaHistory: 10,
        panicMax: 120,
        smoothStep: true
    },
    
    dom: {
        createContainer: false
    }
};

// Scene keys
export const SCENE_KEYS = {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    MENU: 'MenuScene',
    GAME: 'GameScene',
    RUNNER_GAME: 'RunnerGameScene',
    HUD: 'HUDScene',
    PAUSE: 'PauseScene',
    GAME_OVER: 'GameOverScene'
};

// Asset paths
export const ASSET_PATHS = {
    IMAGES: {
        SPRITES: 'images/sprites/',
        UI: 'images/ui/',
        BACKGROUNDS: 'images/backgrounds/',
        PARTICLES: 'images/particles/'
    },
    AUDIO: {
        MUSIC: 'audio/music/',
        SFX: 'audio/sfx/'
    },
    FONTS: 'fonts/',
    DATA: {
        LEVELS: 'src/game/data/levels/',
        BALANCE: 'src/game/data/balance/'
    }
};

// Game settings (alias for GAME_CONFIG for backward compatibility)
export const GAME_SETTINGS = {
    ...GAME_CONFIG,
    // Legacy property names for backward compatibility
    PLAYER_SPEED: GAME_CONFIG.PLAYER.SPEED,
    PLAYER_MAX_HEALTH: GAME_CONFIG.PLAYER.HEALTH,
    PLAYER_REGEN_RATE: GAME_CONFIG.PLAYER.HEALTH_REGEN_RATE,
    PLAYER_REGEN_DELAY: GAME_CONFIG.PLAYER.HEALTH_REGEN_DELAY,
    PLAYER_DASH_DISTANCE: 150,
    PLAYER_DASH_DURATION: GAME_CONFIG.PLAYER.DASH_DURATION,
    PLAYER_DASH_COOLDOWN: GAME_CONFIG.PLAYER.DASH_COOLDOWN,
    SCREEN_SHAKE_DURATION: 200,
    SCREEN_SHAKE_INTENSITY: GAME_CONFIG.COMBAT.SCREEN_SHAKE_INTENSITY,
    // World dimensions
    WORLD_WIDTH: 1600,
    WORLD_HEIGHT: 1200,
    // Enemy spawning
    ENEMY_SPAWN_RATE: 3000,
    ENEMY_MAX_COUNT: 15
};

export default GameConfig;
