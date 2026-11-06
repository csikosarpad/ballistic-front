import { Container, Graphics } from "pixi.js";
import { PIXI_UI_THEME } from "./PixiUiTheme";

interface Star {
  graphic: Graphics;
  x: number;
  y: number;
  depth: number;
}

const FAR_DEPTH = 2.4;
const NEAR_DEPTH = 0.4;
const DRIFT_PER_SECOND = 0.025;

export class CampaignStarfield extends Container {
  private readonly stars: Star[] = [];
  private fieldWidth = 0;
  private fieldHeight = 0;
  private warpUntil = 0;

  triggerWarp(now = performance.now()): void {
    this.warpUntil = now + 1500;
  }

  stopWarp(): void {
    this.warpUntil = 0;
  }

  constructor() {
    super();
    this.eventMode = "none";
    for (let index = 0; index < 160; index += 1) {
      const graphic = new Graphics()
        .circle(0, 0, index % 9 === 0 ? 1.4 : 0.8)
        .fill(index % 4 === 0 ? PIXI_UI_THEME.colors.cyanBright : 0xe4f7ff);
      this.addChild(graphic);
      this.stars.push({
        graphic,
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        depth: NEAR_DEPTH + Math.random() * (FAR_DEPTH - NEAR_DEPTH),
      });
    }
  }

  resize(width: number, height: number): void {
    this.fieldWidth = width;
    this.fieldHeight = height;
    this.update(0);
  }

  update(dt: number, now = performance.now()): void {
    const speed = now < this.warpUntil ? 45 : 1;
    for (const star of this.stars) {
      star.depth -= Math.min(dt, 0.1) * DRIFT_PER_SECOND * speed;
      if (star.depth < NEAR_DEPTH) star.depth += FAR_DEPTH - NEAR_DEPTH;
      const proximity = (FAR_DEPTH - star.depth) / (FAR_DEPTH - NEAR_DEPTH);
      star.graphic.position.set(
        this.fieldWidth * (0.5 + (star.x * 0.8) / star.depth),
        this.fieldHeight * (0.5 + (star.y * 0.8) / star.depth),
      );
      star.graphic.scale.set(0.55 + proximity * 0.7);
      star.graphic.alpha = 0.18 + proximity * 0.4;
    }
  }
}
