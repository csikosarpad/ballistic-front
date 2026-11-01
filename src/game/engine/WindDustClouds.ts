import { Container, Graphics } from "pixi.js";

const CLOUD_COUNT = 10;

/** Talajközeli, visszafogott porfelhők a szél atmoszferikus visszajelzéséhez. */
export class WindDustClouds extends Container {
  private readonly clouds: Graphics[] = [];
  private worldWidth = 1280;
  private worldHeight = 720;
  private wind = 0;
  private motionEnabled = true;

  public constructor() {
    super();
    for (let index = 0; index < CLOUD_COUNT; index += 1) {
      const cloud = new Graphics()
        .ellipse(0, 0, 24 + (index % 3) * 8, 4 + (index % 2) * 2)
        .fill({ color: 0xb18a5a, alpha: 0.16 })
        .ellipse(22, -2, 16, 3)
        .fill({ color: 0xc3a16f, alpha: 0.12 })
        .ellipse(-20, 2, 14, 3)
        .fill({ color: 0x8f704d, alpha: 0.1 });
      this.clouds.push(cloud);
      this.addChild(cloud);
    }
    this.setBounds(this.worldWidth, this.worldHeight);
    this.setWind(0);
  }

  public setBounds(width: number, height: number): void {
    this.worldWidth = width;
    this.worldHeight = height;
    this.clouds.forEach((cloud, index) => {
      cloud.position.set(
        (index * 149) % width,
        height * (0.56 + ((index * 17) % 22) / 100),
      );
    });
  }

  public setWind(wind: number): void {
    this.wind = Math.max(-60, Math.min(60, wind));
    const strength = Math.abs(this.wind) / 60;
    this.visible = strength > 0.02;
    this.clouds.forEach((cloud, index) => {
      cloud.alpha = 0.35 + strength * (index % 3 === 0 ? 0.35 : 0.22);
      cloud.scale.set(0.65 + strength * 0.55, 0.7 + strength * 0.3);
    });
  }

  public update(dt: number): void {
    if (!this.motionEnabled || !this.visible) return;
    const direction = Math.sign(this.wind);
    const speed = direction * (8 + Math.abs(this.wind) * 1.1);
    for (const cloud of this.clouds) {
      cloud.x += speed * dt;
      if (direction > 0 && cloud.x > this.worldWidth + 70) cloud.x = -70;
      if (direction < 0 && cloud.x < -70) cloud.x = this.worldWidth + 70;
    }
  }

  public setMotionEnabled(enabled: boolean): void {
    this.motionEnabled = enabled;
    if (!enabled) {
      this.visible = false;
    }
  }
}
