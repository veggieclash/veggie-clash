import Phaser from 'phaser';
import { EnemyPosition } from '../state/GameState';

export type RadarSource = () => {
  player: Phaser.Math.Vector2;
  enemies: EnemyPosition[];
  radius: number; // world radius scale
};

export class Radar {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private size: number;
  private bg: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;

  private playerDot: Phaser.GameObjects.Arc;
  private enemyDots: Phaser.GameObjects.Arc[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, size = 220) {
    this.scene = scene;
    this.size = size;
    this.root = scene.add.container(x, y);

    this.bg = scene.add.rectangle(0, 0, size, size, 0x000000, 0.35).setOrigin(1, 1);
    this.border = scene.add.rectangle(0, 0, size, size, 0xffffff, 0).setOrigin(1, 1)
      .setStrokeStyle(1, 0xffffff, 0.22);
    this.playerDot = scene.add.circle(-size + size/2, -size + size/2, 6, 0xffffff, 1)
      .setStrokeStyle(1, 0x000000, 0.7);

    this.root.add([this.bg, this.border, this.playerDot]);
  }

  update(src: RadarSource): void {
    const { player, enemies, radius } = src();
    const half = this.size / 2;

    // Player at center
    this.playerDot.setPosition(-this.size + half, -this.size + half);

    // Rebuild enemy dots pool sized to enemies length
    while (this.enemyDots.length < enemies.length) {
      const dot = this.scene.add.circle(0, 0, 4, 0xffcc00, 1)
        .setStrokeStyle(1, 0x000000, 0.6);
      this.enemyDots.push(dot);
      this.root.add(dot);
    }

    // Hide extra dots
    for (let i = enemies.length; i < this.enemyDots.length; i++) {
      this.enemyDots[i].setVisible(false);
    }

    // Update active enemy dots
    enemies.forEach((enemy, index) => {
      if (index >= this.enemyDots.length) return;

      const dot = this.enemyDots[index];

      // Calculate relative position to player
      const deltaX = enemy.x - player.x;
      const deltaY = enemy.y - player.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only show enemies within range
      if (distance > radius) {
        dot.setVisible(false);
        return;
      }

      // Scale position to radar size
      const nx = Phaser.Math.Clamp(deltaX / radius, -1, 1);
      const ny = Phaser.Math.Clamp(deltaY / radius, -1, 1);

      dot.setPosition(-this.size + half + nx * half * 0.9, -this.size + half + ny * half * 0.9);
      dot.setVisible(true);
    });
  }

  destroy(): void {
    this.root.destroy(true);
    this.enemyDots.length = 0;
  }
}
