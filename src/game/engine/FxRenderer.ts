import { Container, Sprite, type Texture } from "pixi.js";
import type { Particle, ParticleKind } from "../systems/particles";
import type { FxTextures } from "./fxTextures";

/** A tűz, a gyűrű és a torkolattűz additív keverést kap, így "izzik". */
const ADDITIVE: ReadonlySet<ParticleKind> = new Set(["fire", "ring", "muzzle"]);

/** Sprite-készletet újrahasznosító renderer a ParticleSystem részecskéihez. */
export class FxRenderer {
  readonly layer = new Container();
  private pool: Sprite[] = [];

  constructor(private textures: FxTextures) {}

  private textureFor(p: Particle): Texture {
    const t = this.textures;
    switch (p.kind) {
      case "fire":
        return t.fire[p.variant % t.fire.length]!;
      case "smoke":
        return t.smoke[p.variant % t.smoke.length]!;
      case "debris":
        return t.debris[p.variant % t.debris.length]!;
      case "ring":
        return t.ring;
      case "muzzle":
        return t.muzzle;
    }
  }

  render(particles: readonly Particle[]): void {
    while (this.pool.length < particles.length) {
      const sprite = new Sprite();
      this.layer.addChild(sprite);
      this.pool.push(sprite);
    }
    this.pool.forEach((sprite, i) => {
      const p = particles[i];
      sprite.visible = !!p;
      if (!p) return;
      const texture = this.textureFor(p);
      sprite.texture = texture;
      // A torkolattűz a csővégtől indul, a többi a középpontja körül forog.
      sprite.anchor.set(0.5, p.kind === "muzzle" ? 1 : 0.5);
      sprite.scale.set(p.size / texture.width);
      sprite.position.set(p.x, p.y);
      sprite.rotation = p.rotation;
      sprite.tint = p.color;
      sprite.alpha = p.opacity * Math.max(0, Math.min(1, p.life / p.maxLife));
      sprite.blendMode = ADDITIVE.has(p.kind) ? "add" : "normal";
    });
  }

  destroy(): void {
    this.layer.destroy({ children: true });
  }
}
