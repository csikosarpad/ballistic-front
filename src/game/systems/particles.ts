import { DEFAULT_THEME, type Theme } from "../theme";

export type ParticleKind = "fire" | "smoke" | "debris" | "ring" | "muzzle";

export interface Particle {
  kind: ParticleKind;
  /** A kind textúrái közül melyiket használja a renderer. */
  variant: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  /** Megjelenített átmérő (px). */
  size: number;
  /** Az átmérő változása px/s-ban. */
  grow: number;
  rotation: number;
  spin: number;
  color: number;
  /** Lefelé gyorsulás px/s²; a füst negatív értékkel felfelé száll. */
  gravity: number;
  opacity: number;
}

/** Pixi-független részecskerendszer; a rajzolást a FxRenderer végzi a `particles` tömb alapján. */
export class ParticleSystem {
  particles: Particle[] = [];

  constructor(
    private rng: () => number = Math.random,
    private colors: Theme["fx"] = DEFAULT_THEME.fx,
  ) {}

  private between(min: number, max: number): number {
    return min + (max - min) * this.rng();
  }

  private add(p: Partial<Particle> & Pick<Particle, "kind" | "x" | "y" | "size" | "life">): void {
    this.particles.push({
      variant: Math.floor(this.rng() * 2),
      vx: 0,
      vy: 0,
      maxLife: p.life,
      grow: 0,
      rotation: this.between(0, Math.PI * 2),
      spin: 0,
      color: 0xffffff,
      gravity: 0,
      opacity: 1,
      ...p,
    });
  }

  spawnExplosion(x: number, y: number, radius: number): void {
    const r = radius;
    // Lökéshullám-gyűrű.
    this.add({ kind: "ring", x, y, size: r, grow: r * 7, life: 0.25, color: this.colors.shockwave, opacity: 0.45 });

    for (let i = 0; i < 6; i++) {
      const a = this.between(0, Math.PI * 2);
      const speed = this.between(0, r * 2);
      this.add({
        kind: "fire",
        x: x + this.between(-0.4, 0.4) * r,
        y: y + this.between(-0.4, 0.4) * r,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        size: r * this.between(1.4, 2.2),
        grow: r * 1.2,
        life: this.between(0.25, 0.45),
        spin: this.between(-2, 2),
        color: this.rng() < 0.5 ? this.colors.fire[0] : this.colors.fire[1],
        gravity: -40,
        opacity: 0.7,
      });
    }

    for (let i = 0; i < 5; i++) {
      const a = this.between(Math.PI, Math.PI * 2);
      const speed = this.between(r * 3, r * 8);
      this.add({
        kind: "debris",
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        size: r * this.between(0.8, 1.3),
        life: this.between(0.6, 1),
        spin: this.between(-4, 4),
        color: this.colors.debris,
        gravity: 600,
      });
    }

    for (let i = 0; i < 8; i++) {
      this.add({
        kind: "smoke",
        x: x + this.between(-0.5, 0.5) * r,
        y: y + this.between(-0.3, 0.3) * r,
        vx: this.between(-15, 15),
        vy: this.between(-50, -20),
        size: r * this.between(1.3, 2),
        grow: r * 0.6,
        life: this.between(1.2, 2.2),
        spin: this.between(-0.5, 0.5),
        color: this.colors.smoke,
        gravity: -12,
        opacity: 0.55,
      });
    }
  }

  /** Torkolattűz a csővégen; a lángsprite felfelé néz, ezért a cső irányába forgatjuk. */
  spawnMuzzleFlash(x: number, y: number, angleDeg: number): void {
    this.add({
      kind: "muzzle",
      x,
      y,
      size: 36,
      life: 0.12,
      rotation: ((90 - angleDeg) * Math.PI) / 180,
      color: this.colors.muzzle,
    });
  }

  /** Halvány füstcsík a repülő lövedék mögött. */
  spawnTrail(x: number, y: number): void {
    this.add({
      kind: "smoke",
      x,
      y,
      size: 8,
      grow: 14,
      life: 0.6,
      spin: this.between(-1, 1),
      color: this.colors.trail,
      opacity: 0.3,
    });
  }

  update(dt: number): void {
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.size += p.grow * dt;
      p.rotation += p.spin * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }
}
