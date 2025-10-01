/**
 * Veggie Clash - Game State Management
 * Central state management for game data persistence across scenes
 */

export interface EnemyPosition {
    x: number;
    y: number;
    id: string;
}

export interface WeaponData {
    name: string;
    ammo: number;
    hasInfiniteAmmo: boolean;
}

export interface GameStateData {
    score: number;
    level: number;
    playerHP: number;
    playerMaxHP: number;
    inventory: Record<string, any>;
    flags: Record<string, any>;
    lastMode: string;
    playerX: number;
    playerY: number;
    enemies: EnemyPosition[];
    currentWeapon: WeaponData | null;
}

export class GameState {
    private static instance: GameState;
    private data: GameStateData;

    constructor() {
        this.reset();
    }

    static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    reset(): void {
        this.data = {
            score: 0,
            level: 1,
            playerHP: 100,
            playerMaxHP: 100,
            inventory: {},
            flags: {},
            lastMode: 'campaign',
            playerX: 0,
            playerY: 0,
            enemies: [],
            currentWeapon: {
                name: "Pea Shooter",
                ammo: -1, // Infinite
                hasInfiniteAmmo: true
            }
        };
    }

    getData(): GameStateData {
        return { ...this.data };
    }

    setData(data: Partial<GameStateData>): void {
        this.data = { ...this.data, ...data };
    }

    updateScore(points: number): void {
        this.data.score += points;
    }

    setScore(score: number): void {
        this.data.score = score;
    }

    setLevel(level: number): void {
        this.data.level = level;
    }

    setPlayerHP(hp: number): void {
        this.data.playerHP = Math.max(0, Math.min(hp, this.data.playerMaxHP));
    }

    setPlayerMaxHP(maxHP: number): void {
        this.data.playerMaxHP = maxHP;
        this.data.playerHP = Math.min(this.data.playerHP, maxHP);
    }

    get score(): number {
        return this.data.score;
    }

    get level(): number {
        return this.data.level;
    }

    get playerHP(): number {
        return this.data.playerHP;
    }

    get playerMaxHP(): number {
        return this.data.playerMaxHP;
    }

    set lastMode(mode: string) {
        this.data.lastMode = mode;
    }

    get lastMode(): string {
        return this.data.lastMode;
    }

    // New HUD properties
    setPlayerPosition(x: number, y: number): void {
        this.data.playerX = x;
        this.data.playerY = y;
    }

    get playerX(): number {
        return this.data.playerX;
    }

    get playerY(): number {
        return this.data.playerY;
    }

    setEnemies(enemies: EnemyPosition[]): void {
        this.data.enemies = enemies;
    }

    get enemies(): EnemyPosition[] {
        return this.data.enemies;
    }

    setCurrentWeapon(weapon: WeaponData | null): void {
        this.data.currentWeapon = weapon;
    }

    get currentWeapon(): WeaponData | null {
        return this.data.currentWeapon;
    }

    // Inventory management
    addItem(key: string, value: any): void {
        this.data.inventory[key] = value;
    }

    getItem(key: string): any {
        return this.data.inventory[key];
    }

    removeItem(key: string): void {
        delete this.data.inventory[key];
    }

    // Flags management (tutorial shown, achievements, etc.)
    setFlag(key: string, value: boolean): void {
        this.data.flags[key] = value;
    }

    getFlag(key: string): boolean {
        return this.data.flags[key] || false;
    }

    // Persistence
    saveToStorage(): void {
        const key = 'vc_game_state_v1';
        try {
            localStorage.setItem(key, JSON.stringify(this.data));
        } catch (error) {
            console.warn('Failed to save game state:', error);
        }
    }

    loadFromStorage(): boolean {
        const key = 'vc_game_state_v1';
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                this.data = { ...this.data, ...JSON.parse(saved) };
                return true;
            }
        } catch (error) {
            console.warn('Failed to load game state:', error);
        }
        return false;
    }
}
