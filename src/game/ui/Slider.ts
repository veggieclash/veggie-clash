import Phaser from 'phaser';

type SliderOptions = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width?: number;
  value: number; // 0..1
  label?: string;
  onChange: (value: number) => void;
};

export class Slider {
  container: Phaser.GameObjects.Container;
  private fill: Phaser.GameObjects.Rectangle;
  private track: Phaser.GameObjects.Rectangle;
  private handle: Phaser.GameObjects.Ellipse;
  private dragging = false;
  private width: number;
  private value: number; // 0..1
  private onChange: (value: number) => void;

  constructor(options: SliderOptions) {
    const { scene, x, y, value, onChange } = options;
    this.width = options.width ?? 240;
    this.value = Phaser.Math.Clamp(value, 0, 1);
    this.onChange = onChange;

    // Track (background)
    this.track = scene.add.rectangle(0, 0, this.width, 10, 0x2b2b2b, 0.85).setOrigin(0, 0.5);

    // Fill (foreground)
    this.fill = scene.add.rectangle(0, 0, this.width * this.value, 10, 0x66ccff, 1).setOrigin(0, 0.5);

    // Handle
    this.handle = scene.add.ellipse(this.width * this.value, 0, 18, 18, 0xffffff, 1)
      .setStrokeStyle(2, 0x1d9bf0);

    // Label
    const label = options.label
      ? scene.add.text(0, -24, options.label, {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#ffffff'
        }).setOrigin(0, 1)
      : null;

    // Container with interactive area
    this.container = scene.add.container(x, y, [label, this.track, this.fill, this.handle].filter(Boolean) as any[])
      .setSize(this.width, 28)
      .setInteractive(new Phaser.Geom.Rectangle(0, -14, this.width, 28), Phaser.Geom.Rectangle.Contains);

    // Pointer events
    this.container.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.seekToPointer(pointer));
    scene.input.on('pointerup', () => this.dragging = false);
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging) return;
      this.seekToPointer(pointer);
    });
  }

  private seekToPointer(pointer: Phaser.Input.Pointer) {
    const localPoint = this.container.pointToContainer({ x: pointer.x, y: pointer.y });
    const clampedX = Phaser.Math.Clamp(localPoint.x, 0, this.width);
    this.value = clampedX / this.width;
    this.fill.width = clampedX;
    this.handle.x = clampedX;
    this.dragging = true;
    this.onChange(this.value);
  }

  setValue(value: number) {
    this.value = Phaser.Math.Clamp(value, 0, 1);
    const pixelX = this.width * this.value;
    this.fill.width = pixelX;
    this.handle.x = pixelX;
  }

  destroy() {
    this.container.destroy(true);
  }
}
