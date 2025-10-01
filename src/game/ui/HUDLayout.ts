import Phaser from 'phaser';
import { GameState } from '../state/GameState';
import { settings } from '../systems/Settings';

export class HUDLayout {
  private scene: Phaser.Scene;
  private group: Phaser.GameObjects.Container;

  private hpIcon!: Phaser.GameObjects.Text;
  private hpBarBg!: Phaser.GameObjects.Rectangle;
  private hpBarFill!: Phaser.GameObjects.Rectangle;

  private scoreLabel!: Phaser.GameObjects.Text;
  private levelLabel!: Phaser.GameObjects.Text;

  private panel(x: number, y: number, w: number, h: number): Phaser.GameObjects.Rectangle {
    const bg = this.scene.add.rectangle(x, y, w, h, 0x000000, 0.35).setOrigin(0, 0);
    bg.setStrokeStyle(1, 0xffffff, 0.22);
    return bg;
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.group = scene.add.container(0, 0);

    const pad = 16;
    const topLeftW = 340, topLeftH = 68;
    const tlPanel = this.panel(pad, pad, topLeftW, topLeftH);

    this.hpIcon = scene.add.text(pad + 10, pad + 12, "♥", {
      fontFamily: 'Arial',
      fontSize: "28px",
      color: "#ff4d4d"
    });

    // Health bar
    this.hpBarBg = scene.add.rectangle(pad + 46, pad + 18, 240, 12, 0xffffff, 0.15).setOrigin(0, 0.5);
    this.hpBarFill = scene.add.rectangle(pad + 46, pad + 18, 240, 12, 0xff4d4d, 1).setOrigin(0, 0.5);

    // Health percentage text
    const gameState = GameState.getInstance();
    const healthPct = Math.round((gameState.playerHP / gameState.playerMaxHP) * 100);
    this.scoreLabel = scene.add.text(pad + 10, pad + 40, `Health: ${healthPct}%`, {
      fontFamily: 'Arial',
      fontSize: "20px",
      color: "#fff"
    });

    this.levelLabel = scene.add.text(pad + 200, pad + 40, `Score: ${gameState.score}`, {
      fontFamily: 'Arial',
      fontSize: "20px",
      color: "#fff"
    });

    this.group.add([tlPanel, this.hpIcon, this.hpBarBg, this.hpBarFill, this.scoreLabel, this.levelLabel]);
  }

  updateFromState(): void {
    const gameState = GameState.getInstance();
    const hpPct = Phaser.Math.Clamp(gameState.playerHP / gameState.playerMaxHP, 0, 1);
    this.hpBarFill.width = 240 * hpPct;

    // Update health percentage
    const healthPct = Math.round(gameState.playerHP / gameState.playerMaxHP * 100);
    this.scoreLabel.setText(`Health: ${healthPct}%`);

    this.levelLabel.setText(`Score: ${gameState.score}`);
  }

  resize(width: number, height: number): void {
    // Future: adjust positions and font sizes based on viewport
    // For now, clamp to minimum sizes for mobile compatibility
  }

  destroy(): void {
    this.group.destroy(true);
  }
}
