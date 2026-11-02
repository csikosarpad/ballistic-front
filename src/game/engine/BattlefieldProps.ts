import { Assets, Container, Graphics, Sprite, type Texture } from "pixi.js";
import rockUrl from "../assets/battlefield-rock.svg?url";

function seededRandom(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** Dekoratív, collision nélküli tereptárgyak a terrain mögött. */
export class BattlefieldProps extends Container {
  private readonly graphics = new Graphics();
  private assetSprites: Sprite[] = [];
  private textures: { rock: Texture } | null = null;
  private time = 0;
  private reaction = 0;
  private motionEnabled = true;

  public constructor() {
    super();
    this.addChild(this.graphics);
  }

  public async loadAssets(): Promise<void> {
    try {
      const rock = await Assets.load<Texture>(rockUrl);
      this.textures = { rock };
    } catch (error) {
      this.textures = null;
      console.error("Battlefield prop assets could not be loaded; using vector fallback.", error);
    }
  }

  public draw(width: number, height: number, seed: number): void {
    const random = seededRandom(seed + 11);
    this.graphics.clear();
    this.assetSprites.forEach((sprite) => this.removeChild(sprite));
    this.assetSprites = [];

    for (let index = 0; index < 8; index += 1) {
      const x = random() * width;
      const y = height * (0.74 + random() * 0.09);
      if (this.textures) this.addAsset(this.textures.rock, x, y, 0.22 + random() * 0.16, 0.7);
      else {
        this.graphics
          .ellipse(x, y, 14 + random() * 18, 5 + random() * 5)
          .fill({ color: 0x263646, alpha: 0.72 })
          .stroke({ color: 0x527080, alpha: 0.34, width: 1 });
      }
    }

  }

  public update(dt: number): void {
    if (!this.motionEnabled) return;
    this.time += dt;
    this.reaction = Math.max(0, this.reaction - dt * 3.5);
    const shake = Math.sin(this.time * 38) * this.reaction * 1.5;
    this.graphics.position.x = shake;
  }

  public reactToImpact(intensity: number): void {
    this.reaction = Math.max(this.reaction, Math.min(1, intensity));
  }

  public setMotionEnabled(enabled: boolean): void {
    this.motionEnabled = enabled;
    if (!enabled) {
      this.reaction = 0;
      this.graphics.position.x = 0;
    }
  }

  private addAsset(texture: Texture, x: number, y: number, scale: number, alpha: number): void {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 1);
    sprite.position.set(x, y);
    sprite.scale.set(scale);
    sprite.alpha = alpha;
    this.assetSprites.push(sprite);
    this.addChild(sprite);
  }

}
