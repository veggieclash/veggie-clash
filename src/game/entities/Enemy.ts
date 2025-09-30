/**
 * Veggie Clash - Enemy Entity
 * Various vegetable enemies with different behaviors
 */

import Phaser from 'phaser';
import { COLORS, AUDIO_KEYS } from '../config.js';
import { Projectile } from './Projectile';

export type EnemyType = 'tomato' | 'onion' | 'pepper' | 'broccoli' | 'eggplant';

export class Enemy extends Phaser.GameObjects.Sprite {
    public health: number;
    public maxHealth: number;
    public enemyType: EnemyType;
    public damage: number;
    public speed: number;
    
    private target?: any; // Using any to avoid GameObject x/y property issues
    private lastAttackTime: number = 0;
    private attackCooldown: number;
    private attackRange: number;
    public state: 'idle' | 'seeking' | 'attacking' | 'stunned' = 'idle'; // Changed to public to match Sprite
    private stateTimer: number = 0;
    private projectiles: Phaser.GameObjects.Group;
    
    constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType) {
        super(scene, x, y, `enemy_${type}`);
        
        this.enemyType = type;
        this.setupStats();
        
        // Set up physics
        scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setSize(this.width * 0.8, this.height * 0.8);
        
        // Create projectiles group for ranged enemies
        this.projectiles = scene.add.group();
        
        // Visual setup
        this.setDepth(10);
        this.setOrigin(0.5, 0.5);
        
        // Start in seeking state
        this.state = 'seeking';
    }

    update(delta: number): void {
        this.updateState(delta);
        this.updateAI();
        this.updateAnimation();
    }

    private setupStats(): void {
        switch (this.enemyType) {
            case 'tomato':
                this.health = 20;
                this.speed = 80;
                this.damage = 8;
                this.attackCooldown = 2000;
                this.attackRange = 200;
                break;
                
            case 'onion':
                this.health = 15;
                this.speed = 120;
                this.damage = 12;
                this.attackCooldown = 1500;
                this.attackRange = 50;
                break;
                
            case 'pepper':
                this.health = 12;
                this.speed = 60;
                this.damage = 15;
                this.attackCooldown = 3000;
                this.attackRange = 300;
                break;
                
            case 'broccoli':
                this.health = 40;
                this.speed = 40;
                this.damage = 20;
                this.attackCooldown = 2500;
                this.attackRange = 80;
                break;
                
            case 'eggplant': // Boss
                this.health = 200;
                this.speed = 30;
                this.damage = 25;
                this.attackCooldown = 1000;
                this.attackRange = 250;
                break;
                
            default:
                this.health = 20;
                this.speed = 80;
                this.damage = 10;
                this.attackCooldown = 2000;
                this.attackRange = 150;
                break;
        }
        
        this.maxHealth = this.health;
    }

    private updateState(delta: number): void {
        this.stateTimer -= delta;
        
        switch (this.state) {
            case 'stunned':
                if (this.stateTimer <= 0) {
                    this.state = 'seeking';
                }
                break;
                
            case 'seeking':
                this.findTarget();
                if (this.target && this.isInRange()) {
                    this.state = 'attacking';
                }
                break;
                
            case 'attacking':
                if (!this.target || !this.isInRange()) {
                    this.state = 'seeking';
                } else {
                    this.attemptAttack();
                }
                break;
        }
    }

    private updateAI(): void {
        const body = this.body as Phaser.Physics.Arcade.Body;
        
        if (this.state === 'stunned') {
            body.setVelocity(0, 0);
            return;
        }
        
        if (!this.target) {
            body.setVelocity(0, 0);
            return;
        }
        
        if (this.state === 'seeking') {
            // Move towards target
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            
            if (distance > 5) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
                body.setVelocity(
                    Math.cos(angle) * this.speed,
                    Math.sin(angle) * this.speed
                );
                
                // Face movement direction
                this.setFlipX(Math.cos(angle) < 0);
            } else {
                body.setVelocity(0, 0);
            }
        } else if (this.state === 'attacking') {
            // Stop moving when attacking
            body.setVelocity(0, 0);
        }
    }

    private updateAnimation(): void {
        // Simple animation logic based on state and movement
        const body = this.body as Phaser.Physics.Arcade.Body;
        const isMoving = Math.abs(body.velocity.x) > 10 || Math.abs(body.velocity.y) > 10;
        
        if (this.state === 'attacking') {
            const attackAnim = `${this.enemyType}-attack`;
            if (this.anims.exists(attackAnim)) {
                this.play(attackAnim, true);
            }
        } else if (isMoving) {
            const walkAnim = `${this.enemyType}-walk`;
            if (this.anims.exists(walkAnim)) {
                this.play(walkAnim, true);
            }
        } else {
            const idleAnim = `${this.enemyType}-idle`;
            if (this.anims.exists(idleAnim)) {
                this.play(idleAnim, true);
            }
        }
    }

    private findTarget(): void {
        // Find player in the scene
        const gameScene = this.scene as any;
        if (gameScene.player) {
            this.target = gameScene.player;
        }
    }

    private isInRange(): boolean {
        if (!this.target) return false;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        return distance <= this.attackRange;
    }

    private attemptAttack(): void {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) {
            return;
        }
        
        this.lastAttackTime = now;
        
        switch (this.enemyType) {
            case 'tomato':
                this.rangedAttack();
                break;
                
            case 'onion':
                this.meleeAttack();
                break;
                
            case 'pepper':
                this.laserAttack();
                break;
                
            case 'broccoli':
                this.areaAttack();
                break;
                
            case 'eggplant':
                this.bossAttack();
                break;
        }
    }

    private rangedAttack(): void {
        if (!this.target) return;
        
        // Lob projectile in arc
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        
        const projectile = new Projectile(
            this.scene,
            this.x,
            this.y,
            'projectile-enemy',
            angle,
            this.damage,
            false
        );
        
        this.projectiles.add(projectile);
        this.scene.add.existing(projectile);
        this.scene.physics.add.existing(projectile);
    }

    private meleeAttack(): void {
        // Rush attack - handled in collision detection
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!this.target) return;
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const rushSpeed = this.speed * 3;
        
        // Quick rush towards target
        this.scene.tweens.add({
            targets: this,
            x: this.x + Math.cos(angle) * 100,
            y: this.y + Math.sin(angle) * 100,
            duration: 300,
            ease: 'Power2'
        });
    }

    private laserAttack(): void {
        // Laser beam attack
        if (!this.target) return;
        
        // Create visual laser effect
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const endX = this.x + Math.cos(angle) * this.attackRange;
        const endY = this.y + Math.sin(angle) * this.attackRange;
        
        const laser = this.scene.add.line(0, 0, this.x, this.y, endX, endY, 0xFFEB3B);
        laser.setLineWidth(4);
        laser.setOrigin(0);
        
        // Laser duration
        this.scene.time.delayedCall(200, () => {
            laser.destroy();
        });
    }

    private areaAttack(): void {
        // Stomp area attack
        const explosion = this.scene.add.circle(this.x, this.y, this.attackRange, 0x228B22, 0.3);
        
        this.scene.tweens.add({
            targets: explosion,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 500,
            onComplete: () => explosion.destroy()
        });
    }

    private bossAttack(): void {
        if (!this.target) return;
        
        // Multi-projectile attack
        for (let i = 0; i < 5; i++) {
            const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
            const angle = baseAngle + (i - 2) * 0.3; // Spread shots
            
            const projectile = new Projectile(
                this.scene,
                this.x,
                this.y,
                'projectile-enemy',
                angle,
                this.damage,
                false
            );
            
            this.projectiles.add(projectile);
            this.scene.add.existing(projectile);
            this.scene.physics.add.existing(projectile);
        }
    }

    takeDamage(amount: number): void {
        this.health = Math.max(0, this.health - amount);
        
        // Visual feedback
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        // Stun briefly
        this.state = 'stunned';
        this.stateTimer = 200;
        
        // Knockback
        if (this.target) {
            const angle = Phaser.Math.Angle.Between(this.target.x, this.target.y, this.x, this.y);
            this.scene.tweens.add({
                targets: this,
                x: this.x + Math.cos(angle) * 20,
                y: this.y + Math.sin(angle) * 20,
                duration: 150,
                ease: 'Power2'
            });
        }
    }

    getProjectiles(): Phaser.GameObjects.Group {
        return this.projectiles;
    }

    destroy(fromScene?: boolean): void {
        if (this.projectiles) {
            this.projectiles.destroy(true);
        }
        super.destroy(fromScene);
    }
}
