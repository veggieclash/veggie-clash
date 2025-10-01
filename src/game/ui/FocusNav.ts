import Phaser from 'phaser';

export class FocusNav {
  private index = 0;
  private keyboard?: Phaser.Input.Keyboard.KeyboardPlugin;

  constructor(private buttons: Phaser.GameObjects.Text[], private scene: Phaser.Scene) {
    this.keyboard = scene.input.keyboard;
    this.updateFocus();

    if (this.keyboard) {
      this.keyboard.on('keydown-UP', this.handleUp, this);
      this.keyboard.on('keydown-DOWN', this.handleDown, this);
      this.keyboard.on('keydown-ENTER', this.handleEnter, this);
      this.keyboard.on('keydown-SPACE', this.handleEnter, this);
    }
  }

  private handleUp() {
    this.index = (this.index - 1 + this.buttons.length) % this.buttons.length;
    this.updateFocus();
  }

  private handleDown() {
    this.index = (this.index + 1) % this.buttons.length;
    this.updateFocus();
  }

  private handleEnter() {
    if (this.buttons[this.index]) {
      this.buttons[this.index].emit('pointerup');
    }
  }

  private updateFocus() {
    this.buttons.forEach((button, i) => {
      if (i === this.index) {
        // Focused style
        button.setStyle({
          backgroundColor: 'rgba(255,255,255,0.25)',
          color: '#ffffff'
        });
        button.setScale(1.05);
      } else {
        // Normal style
        button.setStyle({
          backgroundColor: 'rgba(255,255,255,0.08)',
          color: '#ffffff'
        });
        button.setScale(1.0);
      }
    });
  }

  setFocusIndex(index: number) {
    this.index = Phaser.Math.Clamp(index, 0, this.buttons.length - 1);
    this.updateFocus();
  }

  getFocusIndex(): number {
    return this.index;
  }

  destroy() {
    if (this.keyboard) {
      this.keyboard.off('keydown-UP', this.handleUp, this);
      this.keyboard.off('keydown-DOWN', this.handleDown, this);
      this.keyboard.off('keydown-ENTER', this.handleEnter, this);
      this.keyboard.off('keydown-SPACE', this.handleEnter, this);
    }
  }
}
