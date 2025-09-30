import { GameConfig } from '@/game/config';
import { Settings } from './Settings';

/**
 * Input Manager handles all input including keyboard, mouse, touch, and gamepad
 * Integrates with Settings system for key bindings and sensitivity
 */
export class InputManager {
    private static instance: InputManager;
    private scene: Phaser.Scene;
    private settings: Settings;
    
    // Input objects
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys: Map<string, Phaser.Input.Keyboard.Key> = new Map();
    private pointer!: Phaser.Input.Pointer;
    
    // Touch/Mobile input
    private touchJoystick: VirtualJoystick | null = null;
    private touchButtons: Map<string, TouchButton> = new Map();
    private isMobile: boolean = false;
    
    // Input state
    private inputEnabled: boolean = true;
    private mouseSensitivity: number = 1.0;
    private joystickDeadzone: number = 0.1;
    
    // Action mappings
    private actionMap: Map<string, string> = new Map();
    private actionStates: Map<string, boolean> = new Map();
    private actionJustPressed: Map<string, boolean> = new Map();
    private actionJustReleased: Map<string, boolean> = new Map();
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.settings = Settings.getInstance();
        this.isMobile = this.detectMobile();
        
        this.setupInput();
        this.loadKeyBindings();
        this.setupMobileControls();
        
        InputManager.instance = this;
    }

    public static getInstance(scene?: Phaser.Scene): InputManager {
        if (!InputManager.instance && scene) {
            InputManager.instance = new InputManager(scene);
        }
        return InputManager.instance;
    }

    private detectMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               'ontouchstart' in window ||
               navigator.maxTouchPoints > 0;
    }

    private setupInput(): void {
        // Setup cursor keys
        this.cursors = this.scene.input.keyboard!.createCursorKeys();
        
        // Setup common keys
        const commonKeys = ['W', 'A', 'S', 'D', 'Q', 'E', 'R', 'SPACE', 'ESC', 'SHIFT', 'CTRL'];
        commonKeys.forEach(key => {
            this.keys.set(key, this.scene.input.keyboard!.addKey(key));
        });
        
        // Setup mouse
        this.pointer = this.scene.input.activePointer;
        
        // Mouse sensitivity
        this.mouseSensitivity = this.settings.get('mouseSensitivity');
    }

    private loadKeyBindings(): void {
        const keyBindings = this.settings.get('keyBindings');
        this.actionMap.clear();
        
        // Load bindings from settings
        Object.entries(keyBindings).forEach(([action, key]) => {
            this.actionMap.set(action, key as string);
            this.actionStates.set(action, false);
            this.actionJustPressed.set(action, false);
            this.actionJustReleased.set(action, false);
        });
    }

    private setupMobileControls(): void {
        if (!this.isMobile) return;
        
        // Create virtual joystick
        this.touchJoystick = new VirtualJoystick(this.scene, {
            x: 120,
            y: this.scene.cameras.main.height - 120,
            radius: 50,
            base: 'joystick_base',
            thumb: 'joystick_thumb'
        });
        
        // Create touch buttons
        const buttonConfigs = [
            { action: 'shoot', x: this.scene.cameras.main.width - 80, y: this.scene.cameras.main.height - 120, texture: 'button_shoot' },
            { action: 'dash', x: this.scene.cameras.main.width - 80, y: this.scene.cameras.main.height - 200, texture: 'button_dash' },
            { action: 'reload', x: this.scene.cameras.main.width - 160, y: this.scene.cameras.main.height - 80, texture: 'button_reload' },
            { action: 'pause', x: this.scene.cameras.main.width - 40, y: 40, texture: 'button_pause' }
        ];
        
        buttonConfigs.forEach(config => {
            const button = new TouchButton(this.scene, config);
            this.touchButtons.set(config.action, button);
        });
    }

    public update(): void {
        if (!this.inputEnabled) return;
        
        // Reset just pressed/released states
        this.actionJustPressed.forEach((_, action) => {
            this.actionJustPressed.set(action, false);
            this.actionJustReleased.set(action, false);
        });
        
        // Update action states
        this.actionMap.forEach((keyBinding, action) => {
            const wasPressed = this.actionStates.get(action) || false;
            const isPressed = this.isKeyPressed(keyBinding);
            
            this.actionStates.set(action, isPressed);
            
            if (isPressed && !wasPressed) {
                this.actionJustPressed.set(action, true);
            } else if (!isPressed && wasPressed) {
                this.actionJustReleased.set(action, true);
            }
        });
        
        // Update mobile controls
        if (this.isMobile && this.touchJoystick) {
            this.touchJoystick.update();
        }
    }

    private isKeyPressed(keyBinding: string): boolean {
        if (keyBinding.startsWith('MOUSE_')) {
            const button = keyBinding.replace('MOUSE_', '').toLowerCase();
            switch (button) {
                case 'left':
                    return this.pointer.leftButtonDown();
                case 'right':
                    return this.pointer.rightButtonDown();
                case 'middle':
                    return this.pointer.middleButtonDown();
                default:
                    return false;
            }
        }
        
        const key = this.keys.get(keyBinding) || this.scene.input.keyboard!.addKey(keyBinding);
        return key.isDown;
    }

    // Action-based input queries
    public isActionPressed(action: string): boolean {
        return this.actionStates.get(action) || false;
    }

    public isActionJustPressed(action: string): boolean {
        return this.actionJustPressed.get(action) || false;
    }

    public isActionJustReleased(action: string): boolean {
        return this.actionJustReleased.get(action) || false;
    }

    // Movement input
    public getMovementInput(): { x: number; y: number } {
        let x = 0;
        let y = 0;
        
        if (this.isMobile && this.touchJoystick) {
            const joystickInput = this.touchJoystick.getInput();
            x = joystickInput.x;
            y = joystickInput.y;
        } else {
            // Keyboard input
            if (this.isActionPressed('moveLeft')) x -= 1;
            if (this.isActionPressed('moveRight')) x += 1;
            if (this.isActionPressed('moveUp')) y -= 1;
            if (this.isActionPressed('moveDown')) y += 1;
        }
        
        // Apply deadzone
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude < this.joystickDeadzone) {
            return { x: 0, y: 0 };
        }
        
        // Normalize diagonal movement
        if (magnitude > 1) {
            x /= magnitude;
            y /= magnitude;
        }
        
        return { x, y };
    }

    // Aim input
    public getAimInput(): { x: number; y: number; angle: number } {
        if (this.isMobile) {
            // Auto-aim on mobile or touch aim
            return this.getMobileAimInput();
        } else {
            // Mouse aim
            const worldPoint = this.scene.cameras.main.getWorldPoint(this.pointer.x, this.pointer.y);
            return {
                x: worldPoint.x,
                y: worldPoint.y,
                angle: Phaser.Math.Angle.Between(0, 0, worldPoint.x, worldPoint.y)
            };
        }
    }

    private getMobileAimInput(): { x: number; y: number; angle: number } {
        // Simple auto-aim for mobile - could be enhanced with target selection
        return { x: 0, y: 0, angle: 0 };
    }

    // Mouse/pointer queries
    public getPointerPosition(): { x: number; y: number } {
        const worldPoint = this.scene.cameras.main.getWorldPoint(this.pointer.x, this.pointer.y);
        return { x: worldPoint.x, y: worldPoint.y };
    }

    public getPointerWorldPosition(): { x: number; y: number } {
        return this.getPointerPosition();
    }

    public isPointerDown(): boolean {
        return this.pointer.isDown;
    }

    // Settings integration
    public updateKeyBinding(action: string, newKey: string): boolean {
        if (this.settings.rebindKey(action, newKey)) {
            this.loadKeyBindings();
            return true;
        }
        return false;
    }

    public setMouseSensitivity(sensitivity: number): void {
        this.mouseSensitivity = Phaser.Math.Clamp(sensitivity, 0.1, 3.0);
        this.settings.set('mouseSensitivity', this.mouseSensitivity);
    }

    public setJoystickDeadzone(deadzone: number): void {
        this.joystickDeadzone = Phaser.Math.Clamp(deadzone, 0.0, 0.5);
        this.settings.set('joystickDeadzone', this.joystickDeadzone);
    }

    // Input enable/disable
    public setInputEnabled(enabled: boolean): void {
        this.inputEnabled = enabled;
        
        if (this.isMobile) {
            this.touchButtons.forEach(button => {
                button.setEnabled(enabled);
            });
            
            if (this.touchJoystick) {
                this.touchJoystick.setEnabled(enabled);
            }
        }
    }

    public isInputEnabled(): boolean {
        return this.inputEnabled;
    }

    // Mobile detection
    public isMobileDevice(): boolean {
        return this.isMobile;
    }

    // Cleanup
    public destroy(): void {
        // Destroy mobile controls
        if (this.touchJoystick) {
            this.touchJoystick.destroy();
        }
        
        this.touchButtons.forEach(button => button.destroy());
        this.touchButtons.clear();
        
        // Clear maps
        this.keys.clear();
        this.actionMap.clear();
        this.actionStates.clear();
        this.actionJustPressed.clear();
        this.actionJustReleased.clear();
        
        // Clear reference
        if (InputManager.instance === this) {
            InputManager.instance = null as any;
        }
    }
}

/**
 * Virtual Joystick for mobile touch controls
 */
class VirtualJoystick {
    private scene: Phaser.Scene;
    private base!: Phaser.GameObjects.Image;
    private thumb!: Phaser.GameObjects.Image;
    private config: any;
    private isDragging: boolean = false;
    private enabled: boolean = true;
    
    constructor(scene: Phaser.Scene, config: any) {
        this.scene = scene;
        this.config = config;
        this.create();
    }
    
    private create(): void {
        // Create base (will use procedural texture if sprite not available)
        this.base = this.scene.add.image(this.config.x, this.config.y, this.config.base)
            .setScrollFactor(0)
            .setAlpha(0.7)
            .setScale(0.8);
        
        // Create thumb
        this.thumb = this.scene.add.image(this.config.x, this.config.y, this.config.thumb)
            .setScrollFactor(0)
            .setAlpha(0.8)
            .setScale(0.6);
        
        // Make interactive
        this.base.setInteractive();
        this.setupEvents();
    }
    
    private setupEvents(): void {
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.enabled) return;
            
            const distance = Phaser.Math.Distance.Between(
                this.config.x, this.config.y, pointer.x, pointer.y
            );
            
            if (distance <= this.config.radius * 1.5) {
                this.isDragging = true;
                this.updateThumbPosition(pointer);
            }
        });
        
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                this.updateThumbPosition(pointer);
            }
        });
        
        this.scene.input.on('pointerup', () => {
            this.isDragging = false;
            this.resetThumb();
        });
    }
    
    private updateThumbPosition(pointer: Phaser.Input.Pointer): void {
        const distance = Phaser.Math.Distance.Between(
            this.config.x, this.config.y, pointer.x, pointer.y
        );
        
        if (distance <= this.config.radius) {
            this.thumb.setPosition(pointer.x, pointer.y);
        } else {
            const angle = Phaser.Math.Angle.Between(
                this.config.x, this.config.y, pointer.x, pointer.y
            );
            const clampedX = this.config.x + Math.cos(angle) * this.config.radius;
            const clampedY = this.config.y + Math.sin(angle) * this.config.radius;
            this.thumb.setPosition(clampedX, clampedY);
        }
    }
    
    private resetThumb(): void {
        this.thumb.setPosition(this.config.x, this.config.y);
    }
    
    public update(): void {
        // Called each frame if needed
    }
    
    public getInput(): { x: number; y: number } {
        if (!this.enabled) return { x: 0, y: 0 };
        
        const deltaX = this.thumb.x - this.config.x;
        const deltaY = this.thumb.y - this.config.y;
        
        return {
            x: deltaX / this.config.radius,
            y: deltaY / this.config.radius
        };
    }
    
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        this.base.setVisible(enabled);
        this.thumb.setVisible(enabled);
        
        if (!enabled) {
            this.isDragging = false;
            this.resetThumb();
        }
    }
    
    public destroy(): void {
        this.base.destroy();
        this.thumb.destroy();
    }
}

/**
 * Touch Button for mobile controls
 */
class TouchButton {
    private scene: Phaser.Scene;
    private button!: Phaser.GameObjects.Image;
    private config: any;
    private isPressed: boolean = false;
    private enabled: boolean = true;
    
    constructor(scene: Phaser.Scene, config: any) {
        this.scene = scene;
        this.config = config;
        this.create();
    }
    
    private create(): void {
        this.button = this.scene.add.image(this.config.x, this.config.y, this.config.texture)
            .setScrollFactor(0)
            .setAlpha(0.7)
            .setScale(0.8)
            .setInteractive();
            
        this.setupEvents();
    }
    
    private setupEvents(): void {
        this.button.on('pointerdown', () => {
            if (!this.enabled) return;
            this.isPressed = true;
            this.button.setAlpha(1.0);
            this.button.setScale(0.9);
        });
        
        this.button.on('pointerup', () => {
            this.isPressed = false;
            this.button.setAlpha(0.7);
            this.button.setScale(0.8);
        });
        
        this.button.on('pointerout', () => {
            this.isPressed = false;
            this.button.setAlpha(0.7);
            this.button.setScale(0.8);
        });
    }
    
    public isDown(): boolean {
        return this.enabled && this.isPressed;
    }
    
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        this.button.setVisible(enabled);
        
        if (!enabled) {
            this.isPressed = false;
            this.button.setAlpha(0.7);
            this.button.setScale(0.8);
        }
    }
    
    public destroy(): void {
        this.button.destroy();
    }
}
