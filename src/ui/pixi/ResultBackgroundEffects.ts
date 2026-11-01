import { Container, Graphics, type Ticker } from "pixi.js";
import { PIXI_UI_THEME } from "./PixiUiTheme";

interface Particle {
  sprite: Graphics;
  x: number;
  y: number;
  speed: number;
  phase: number;
}

export interface ResultBackgroundEffectsOptions {
  width: number;
  height: number;
  accent: number;
  reducedMotion: boolean;
}

export class ResultBackgroundEffects extends Container {
  private readonly particles: Particle[] = [];
  private readonly reducedMotion: boolean;
  private canvasWidth = 0;
  private canvasHeight = 0;

  public constructor(options: ResultBackgroundEffectsOptions) {
    super();
    this.reducedMotion = options.reducedMotion;
    this.canvasWidth = options.width;
    this.canvasHeight = options.height;
    this.createParticles(options.accent);
  }

  public resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;

    for (const particle of this.particles) {
      particle.x = Math.min(particle.x, width);
      particle.y = Math.min(particle.y, height);
      particle.sprite.position.set(particle.x, particle.y);
    }
  }

  public update(ticker: Ticker): void {
    if (this.reducedMotion) return;
    const deltaTime = ticker.deltaTime;

    for (const particle of this.particles) {
      particle.phase += deltaTime * 0.015;
      particle.y -= particle.speed * deltaTime;
      particle.sprite.alpha = 0.16 + (Math.sin(particle.phase) + 1) * 0.08;

      if (particle.y < -4) {
        particle.y = this.canvasHeight + 4;
      }

      particle.sprite.position.set(particle.x, particle.y);
    }
  }

  private createParticles(accent: number): void {
    const count = this.reducedMotion ? 12 : 28;

    for (let index = 0; index < count; index += 1) {
      const x = ((index * 97) % 1000) / 1000;
      const y = ((index * 173) % 1000) / 1000;
      const sprite = new Graphics()
        .circle(0, 0, index % 4 === 0 ? 1.5 : 0.8)
        .fill({ color: index % 5 === 0 ? accent : PIXI_UI_THEME.colors.cyanBright, alpha: 0.2 });

      const particle: Particle = {
        sprite,
        x: x * this.canvasWidth,
        y: y * this.canvasHeight,
        speed: 0.08 + (index % 5) * 0.035,
        phase: index * 0.7,
      };

      sprite.position.set(particle.x, particle.y);
      this.particles.push(particle);
      this.addChild(sprite);
    }
  }
}
