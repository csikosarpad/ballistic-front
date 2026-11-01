import { Container, Graphics } from "pixi.js";
import { WindDustClouds } from "./WindDustClouds";
import { BattlefieldProps } from "./BattlefieldProps";

const STAR_COUNT = 72;

function seededRandom(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function mountainPoints(width: number, baseY: number, amplitude: number, random: () => number): number[] {
  const points = [0, baseY];
  const step = width / 14;

  for (let index = 0; index <= 14; index += 1) {
    const x = index * step;
    const y = baseY - amplitude * (0.25 + random() * 0.75);
    points.push(x, y);
  }

  points.push(width, baseY, 0, baseY);
  return points;
}

/** Statikus, újrarajzolható játéktér-háttér a terrain mögött. */
export class BattlefieldLayers extends Container {
  private readonly stars = new Graphics();
  private readonly distantMountains = new Graphics();
  private readonly nearMountains = new Graphics();
  private readonly atmosphere = new Graphics();
  private readonly props = new BattlefieldProps();
  private readonly windDustClouds = new WindDustClouds();

  public constructor() {
    super();
    this.addChild(this.stars, this.distantMountains, this.nearMountains, this.atmosphere, this.props, this.windDustClouds);
  }

  public draw(width: number, height: number, seed: number): void {
    const random = seededRandom(seed);
    this.windDustClouds.setBounds(width, height);
    this.props.draw(width, height, seed);
    this.stars.clear();
    this.distantMountains.clear();
    this.nearMountains.clear();
    this.atmosphere.clear();

    for (let index = 0; index < STAR_COUNT; index += 1) {
      const x = random() * width;
      const y = random() * height * 0.42;
      const radius = 0.5 + random() * 1.2;
      this.stars.circle(x, y, radius).fill({ color: random() > 0.82 ? 0x8beeff : 0xb9d7ff, alpha: 0.3 + random() * 0.45 });
    }

    this.distantMountains
      .poly(mountainPoints(width, height * 0.64, height * 0.16, random))
      .fill({ color: 0x101d3c, alpha: 0.92 })
      .stroke({ color: 0x29466d, alpha: 0.48, width: 2 });

    this.nearMountains
      .poly(mountainPoints(width, height * 0.72, height * 0.13, random))
      .fill({ color: 0x132746, alpha: 0.98 })
      .stroke({ color: 0x39708a, alpha: 0.55, width: 2 });

    this.atmosphere
      .rect(0, height * 0.47, width, height * 0.2)
      .fill({ color: 0x1b5b78, alpha: 0.08 })
      .moveTo(0, height * 0.58)
      .lineTo(width, height * 0.54)
      .moveTo(0, height * 0.62)
      .lineTo(width, height * 0.59)
      .stroke({ color: 0x65b7c8, alpha: 0.12, width: 1 });
  }

  public setWind(wind: number): void {
    this.windDustClouds.setWind(wind);
  }

  public loadAssets(): Promise<void> {
    return this.props.loadAssets();
  }

  public setMotionEnabled(enabled: boolean): void {
    this.props.setMotionEnabled(enabled);
    this.windDustClouds.setMotionEnabled(enabled);
  }

  public update(dt: number): void {
    this.props.update(dt);
    this.windDustClouds.update(dt);
  }

  public reactToImpact(intensity: number): void {
    this.props.reactToImpact(intensity);
  }
}
