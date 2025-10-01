import Phaser from 'phaser';
import { GameState, WeaponData } from '../state/GameState';

export class WeaponChip {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private panel: Phaser.GameObjects.Rectangle;
  private icon: Phaser.GameObjects.Text;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.panel = scene.add.rectangle(0, 0, 320, 54, 0x000000, 0.35).setOrigin(1, 0);
    this.panel.setStrokeStyle(1, 0xffffff, 0.22);

    // Using text icon instead of image asset
    this.icon = scene.add.text(-290, 8, "●", {
      fontFamily: 'Arial',
      fontSize: "22px",
      color: "#ffd166"
    });

    this.label = scene.add.text(-250, 12, "", {
      fontFamily: 'Arial',
      fontSize: "20px",
      color: "#fff"
    });

    this.root = scene.add.container(x, y, [this.panel, this.icon, this.label]);
  }

  update(): void {
    const gameState = GameState.getInstance();
    const weapon = gameState.currentWeapon;

    if (!weapon) {
      this.label.setText("No Weapon");
      return;
    }

    const ammoText = weapon.hasInfiniteAmmo ? "∞" : weapon.ammo.toString();
    this.label.setText(`${weapon.name} — ${ammoText}`);

    // Update icon color based on weapon type
    const weaponColors: Record<string, string> = {
      "Pea Shooter": "#32cd32",
      "Corn Cannon": "#ffb347",
      "Beet Bazooka": "#dc143c"
    };

    this.icon.setColor(weaponColors[weapon.name] || "#ffd166");
  }

  resize(x: number, y: number): void {
    this.root.setPosition(x, y);
  }

  destroy(): void {
    this.root.destroy(true);
  }
}
