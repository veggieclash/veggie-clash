//// src/systems/BackgroundManager.ts
import Phaser from 'phaser';
import { Settings } from './Settings';

type Layers = {
  skyImg?: Phaser.GameObjects.Image;
  skyGrad?: Phaser.GameObjects.Graphics;
  hills?: Phaser.GameObjects.TileSprite;
  treesFar?: Phaser.GameObjects.TileSprite;
  treesMid?: Phaser.GameObjects.TileSprite;
  ground?: Phaser.GameObjects.TileSprite;
};

export default class BackgroundManager {
  private scene: Phaser.Scene;
  private settings!: Settings;
  private cam!: Phaser.Cameras.Scene2D.Camera;
  private L: Layers = {};
  private groundHeight = 220; // at 720p; scales proportionally on other heights

  // Visual effects
  private vignette!: Phaser.GameObjects.Graphics;
  private ambientFog!: Phaser.GameObjects.RenderTexture;
  private playerLight!: Phaser.GameObjects.Graphics;
  private grassTweens: Phaser.Tweens.Tween[] = [];
  private lastPlayerPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.settings = Settings.getInstance();
  }

  preload() {
    const L = this.scene.load;
    const tryImg = (k: string, p: string) => { if (!this.scene.textures.exists(k)) L.image(k, p); };
    tryImg('bg_sky', 'assets/bg/sky.png'); // optional
    tryImg('bg_hills', 'assets/bg/hills.png'); // optional
    tryImg('bg_trees_far', 'assets/bg/trees_far.png'); // optional
    tryImg('bg_trees_mid', 'assets/bg/trees_mid.png'); // optional
    tryImg('bg_ground', 'assets/bg/ground_tile.png'); // use tileable texture if available
  }

  create() {
    this.cam = this.scene.cameras.main;
    this.cam.setBackgroundColor(0x2e7d32); // no black clears

    // SKY: prefer image; else gradient
    if (this.scene.textures.exists('bg_sky')) {
      this.L.skyImg = this.scene.add.image(0, 0, 'bg_sky')
        .setOrigin(0).setScrollFactor(0).setDepth(-220);
    } else {
      this.L.skyGrad = this.scene.add.graphics().setScrollFactor(0).setDepth(-220);
    }

    // TileSprite helper
    const makeTile = (key: string, depth: number) =>
      this.scene.textures.exists(key)
        ? this.scene.add.tileSprite(0, 0, this.cam.width, this.cam.height, key)
            .setOrigin(0).setScrollFactor(0).setDepth(depth)
        : undefined;

    this.L.hills     = makeTile('bg_hills',     -200);
    this.L.treesFar  = makeTile('bg_trees_far', -180);
    this.L.treesMid  = makeTile('bg_trees_mid', -160);

    // GROUND: always anchored to bottom with fixed camera-relative height
    const gh = Math.round(this.groundHeight * (this.cam.height / 720));
    if (this.scene.textures.exists('bg_ground')) {
      this.L.ground = this.scene.add.tileSprite(0, this.cam.height - gh, this.cam.width, gh, 'bg_ground')
        .setOrigin(0).setScrollFactor(0).setDepth(-140);
    } else {
      // fallback solid ground using a 1x1 texture (generate if needed)
      const g = this.scene.add.graphics().setDepth(-140).setScrollFactor(0);
      g.fillStyle(0x2e6b2e, 1).fillRect(0, this.cam.height - gh, this.cam.width, gh);
      // Promote to a render texture so it doesn't redraw per frame (optional)
    }

    // Initialize visual effects
    this.createVisualEffects();
    this.createAmbientFog();
    this.createPlayerLight();
    this.createGrassDecals();

    this.resizeToCamera();
    this.scene.scale.on('resize', this.onResize, this);
  }

  update() {
    const sx = this.cam.scrollX, sy = this.cam.scrollY;
    if (this.L.hills)     { this.L.hills.tilePositionX = sx * 0.10; this.L.hills.tilePositionY = sy * 0.02; }
    if (this.L.treesFar)  { this.L.treesFar.tilePositionX = sx * 0.18; this.L.treesFar.tilePositionY = sy * 0.05; }
    if (this.L.treesMid)  { this.L.treesMid.tilePositionX = sx * 0.28; this.L.treesMid.tilePositionY = sy * 0.08; }
    if (this.L.ground)    { this.L.ground.tilePositionX = sx * 0.40; this.L.ground.tilePositionY = sy * 0.12; }

    // Update grass decals swaying
    if (this.grassTweens) {
      this.updateGrassAnimation();
    }
  }

  private onResize(size: Phaser.Structs.Size) {
    this.cam.setViewport(0, 0, size.width, size.height);
    this.resizeToCamera();
  }

  private resizeToCamera() {
    const cam = this.cam;
    const gh = Math.round(this.groundHeight * (cam.height / 720));

    // Sky: covers entire camera
    if (this.L.skyImg) {
      const scaleX = cam.width / this.L.skyImg.width;
      const scaleY = cam.height / this.L.skyImg.height;
      this.L.skyImg.setScale(Math.max(scaleX, scaleY));
    } else if (this.L.skyGrad) {
      this.L.skyGrad.clear();
      for (let i = 0; i < cam.height; i++) {
        const alpha = 1 - (i / cam.height) * 0.3;
        const color = Phaser.Display.Color.GetColor32(alpha, 135, 206, 250);
        this.L.skyGrad.lineStyle(1, color, alpha);
        this.L.skyGrad.lineBetween(0, i, cam.width, i);
      }
    }

    // Layers: resize to camera dimensions
    [this.L.hills, this.L.treesFar, this.L.treesMid].forEach(layer => {
      if (layer) layer.setSize(cam.width, cam.height);
    });

    // Ground: resize and reposition to bottom
    if (this.L.ground) {
      this.L.ground.setSize(cam.width, gh);
      this.L.ground.setPosition(0, cam.height - gh);
    }
  }

  // Visual Effects Creation
  private createVisualEffects(): void {
    // Vignette - only if enabled
    if (this.settings.get('enableVignette')) {
      this.vignette = this.scene.add.graphics().setScrollFactor(0).setDepth(999);
    }
  }

  private createAmbientFog(): void {
    if (!this.settings.get('enableAmbientFog')) return;

    // Create ambient fog as a gradient overlay
    const fogGraphics = this.scene.add.graphics();
    fogGraphics.clear();
    for (let y = 0; y < this.cam.height; y += 2) {
      const alpha = Math.sin(y / this.cam.height * Math.PI) * 0.1;
      if (alpha > 0.01) {
        fogGraphics.lineStyle(2, 0x7EC8E3, alpha);
        fogGraphics.lineBetween(0, y, this.cam.width, y);
      }
    }

    // Create render texture from graphics to avoid per-frame redraw
    const fogTexture = this.scene.add.renderTexture(0, 0, this.cam.width, this.cam.height);
    fogTexture.draw(fogGraphics, 0, 0);
    fogGraphics.destroy();

    fogTexture.setScrollFactor(0).setDepth(990).setAlpha(0.8);
    this.ambientFog = fogTexture;
  }

  private createPlayerLight(): void {
    // Create simple graphics for player light
    this.playerLight = this.scene.add.graphics().setScrollFactor(0).setDepth(900);

    if (!this.settings.get('enableBloom')) {
      this.playerLight.setVisible(false);
    }
  }

  private createGrassDecals(): void {
    if (this.settings.get('reduceMotion')) return;

    // Create scattered grass decals on ground
    const decalCount = 15;
    for (let i = 0; i < decalCount; i++) {
      const x = Phaser.Math.Between(100, this.cam.width - 100);
      const y = this.cam.height - this.groundHeight + Phaser.Math.Between(10, 50);

      // Create grass decal
      const grass = this.scene.add.circle(x, y, 8, 0x3C8C45);
      grass.setScrollFactor(0.5).setDepth(-135); // Slightly above ground

      // Animate sway
      const tween = this.scene.tweens.add({
        targets: grass,
        rotation: Phaser.Math.DegToRad(Phaser.Math.Between(-15, 15)),
        duration: Phaser.Math.Between(1500, 3000),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });

      this.grassTweens.push(tween);
    }
  }

  private updateGrassAnimation(): void {
    // Grass animates automatically via tweens
    // Additional wind simulation could go here
  }

  // Update player light position
  updatePlayerLight(playerX: number, playerY: number): void {
    if (!this.playerLight || this.settings.get('reduceMotion')) return;

    this.playerLight.clear();

    if (this.settings.get('enableBloom')) {
      const lightRadius = 100;
      const alpha = 0.4;

      // Draw radial gradient softness (larger circles with decreasing alpha)
      for (let r = lightRadius; r > 0; r -= 10) {
        const currentAlpha = alpha * (r / lightRadius);
        this.playerLight.fillStyle(0xffffff, currentAlpha)
          .fillCircle(playerX - this.cam.scrollX, playerY - this.cam.scrollY, r);
      }
    }
  }

  destroy() {
    // Clean up visual effects
    if (this.vignette) this.vignette.destroy();
    if (this.ambientFog) this.ambientFog.destroy();
    if (this.playerLight) this.playerLight.destroy();

    this.grassTweens.forEach(tween => tween.destroy());
    this.grassTweens = [];

    Object.values(this.L).forEach(layer => {
      if (layer) layer.destroy();
    });
    this.scene.scale.off('resize', this.onResize, this);
  }
}
