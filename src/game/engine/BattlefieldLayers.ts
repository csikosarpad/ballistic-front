import { Assets, Container, Graphics, Sprite, type Texture } from "pixi.js";
import skyUrl from "../assets/backgrounds/siege-sky.jpg?url";
import cityGlowUrl from "../assets/backgrounds/siege-city-glow.jpg?url";
import cityLightsUrl from "../assets/backgrounds/siege-city-lights.jpg?url";
import { WindDustClouds } from "./WindDustClouds";
import { BattlefieldProps } from "./BattlefieldProps";
import { TRAINING_SECTOR, type Sector } from "../data/sectors";

const STAR_COUNT = 48;
/** A köd-háttér ennyivel nagyobb a pályánál, hogy a parallax mozgás ne mutasson szélet. */
const SKY_OVERSCAN = 1.08;
/** A háttér függőleges igazítása: a fölös magasság ekkora része vágódik le felül (a többi alul). */
const SKY_TOP_CROP = 0.55;
const SKY_DRIFT_PX = 22;
const STAR_DRIFT_PX = 9;
const DRIFT_SPEED = 0.07;
const CITY_GLOW_ALPHA = 0.4;
const CITY_LIGHTS_ALPHA = 0.6;
/** A városfények alpha-szorzója 0,85 és 1,0 között pulzál. */
const CITY_PULSE_MIN = 0.85;
const CITY_PULSE_SPEED = 0.35;
const SHAFT_COUNT = 4;
const SHAFT_PULSE_SPEED = 0.22;
const FOG_BLOBS = 9;
const FOG_OVERSCAN = 80;
const FOG_DRIFT_PX = 60;
const FOG_DRIFT_SPEED = 0.05;

function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function mountainPoints(
  width: number,
  baseY: number,
  amplitude: number,
  random: () => number,
  segments: number,
): number[] {
  const points = [0, baseY];
  const step = width / segments;

  for (let index = 0; index <= segments; index += 1) {
    const x = index * step;
    const y = baseY - amplitude * (0.25 + random() * 0.75);
    points.push(x, y);
  }

  points.push(width, baseY, 0, baseY);
  return points;
}

/** Statikus, újrarajzolható játéktér-háttér a terrain mögött; a köd és a csillagok lassan sodródnak (parallax). */
export class BattlefieldLayers extends Container {
  private readonly nebula = new Sprite();
  private readonly cityGlow = new Sprite();
  private readonly cityLights = new Sprite();
  private readonly skyShade = new Graphics();
  private readonly stars = new Graphics();
  private readonly farMountains = new Graphics();
  private readonly haze = new Graphics();
  private readonly midMountains = new Graphics();
  private readonly nearMountains = new Graphics();
  private readonly fog = new Graphics();
  private readonly shafts = new Graphics();
  private readonly atmosphere = new Graphics();
  private readonly props = new BattlefieldProps();
  private readonly windDustClouds = new WindDustClouds();
  private skyTexture: Texture | null = null;
  private cityGlowTexture: Texture | null = null;
  private cityLightsTexture: Texture | null = null;
  private nebulaBaseX = 0;
  private time = 0;
  private motionEnabled = true;
  private atmosphereStyle = TRAINING_SECTOR.atmosphere;

  public constructor() {
    super();
    this.nebula.visible = false;
    // A fekete háttérre komponált képek additív keveréssel csak a fényeket adják hozzá.
    for (const layer of [this.cityGlow, this.cityLights]) {
      layer.blendMode = "add";
      layer.visible = false;
    }
    this.shafts.blendMode = "add";
    this.addChild(
      this.nebula,
      this.cityGlow,
      this.cityLights,
      this.skyShade,
      this.shafts,
      this.stars,
      this.farMountains,
      this.haze,
      this.midMountains,
      this.nearMountains,
      this.fog,
      this.atmosphere,
      this.props,
      this.windDustClouds,
    );
  }

  public draw(
    width: number,
    height: number,
    seed: number,
    style: Sector["atmosphere"] = TRAINING_SECTOR.atmosphere,
  ): void {
    this.atmosphereStyle = style;
    this.nebula.tint = style.tint;
    this.cityGlow.tint = style.tint;
    this.cityLights.tint = style.tint;
    const random = seededRandom(seed);
    this.windDustClouds.setBounds(width, height);
    this.props.draw(width, height, seed);
    this.layoutNebula(width, height);
    this.skyShade
      .clear()
      .rect(-SKY_DRIFT_PX, 0, width + SKY_DRIFT_PX * 2, height)
      .fill({ color: 0x030816, alpha: 0.2 });
    this.stars.clear();
    this.farMountains.clear();
    this.haze.clear();
    this.midMountains.clear();
    this.nearMountains.clear();
    this.atmosphere.clear();
    this.fog.clear();
    this.shafts.clear();

    for (let index = 0; index < STAR_COUNT; index += 1) {
      const x = random() * width;
      const y = random() * height * 0.42;
      const radius = 0.5 + random() * 1.2;
      this.stars
        .circle(x, y, radius)
        .fill({ color: random() > 0.82 ? 0x8beeff : 0xb9d7ff, alpha: 0.3 + random() * 0.45 });
    }

    // Három hegyréteg, egyre sötétebb és élesebb: a távoli a légköri homályba olvad.
    this.farMountains
      .poly(mountainPoints(width, height * 0.66, height * 0.14, random, 10))
      .fill({ color: 0x1d3358, alpha: 0.38 })
      .stroke({ color: 0x6aa6c8, alpha: 0.22, width: 2 });

    // Egymásra rakott sávok: a homály alulról fokozatosan sűrűsödik, éles szél nélkül.
    const hazeBands = 12;
    const hazeTop = height * 0.5;
    const hazeBandHeight = (height * 0.24) / hazeBands;
    for (let band = 0; band < hazeBands; band += 1) {
      this.haze
        .rect(0, hazeTop + band * hazeBandHeight, width, height - (hazeTop + band * hazeBandHeight))
        .fill({ color: 0x6fa8d0, alpha: 0.014 });
    }

    this.midMountains
      .poly(mountainPoints(width, height * 0.7, height * 0.12, random, 14))
      .fill({ color: style.mountain, alpha: 0.72 })
      .stroke({ color: 0x4a98b8, alpha: 0.32, width: 2 });

    this.nearMountains
      .poly(mountainPoints(width, height * 0.74, height * 0.1, random, 20))
      .fill({ color: 0x0a1a32, alpha: 0.92 })
      .stroke({ color: 0x2f8fb0, alpha: 0.5, width: 2 });

    this.atmosphere
      .moveTo(0, height * 0.58)
      .lineTo(width, height * 0.54)
      .moveTo(0, height * 0.62)
      .lineTo(width, height * 0.59)
      .stroke({ color: 0x65b7c8, alpha: 0.12, width: 1 });

    this.drawShafts(width, height);
    this.drawFog(width, height, seededRandom(seed ^ 0x5f0c));
  }

  /** A bolygó felől érkező, halvány additív fénysugarak; lassan pulzálnak (volumetrikus fény). */
  private drawShafts(width: number, height: number): void {
    for (let index = 0; index < SHAFT_COUNT; index += 1) {
      const topX = width * (0.78 + index * 0.07);
      const spread = width * (0.05 + index * 0.012);
      const bottomX = topX - width * (0.42 + index * 0.06);
      this.shafts
        .poly([
          topX - spread * 0.3,
          -10,
          topX + spread * 0.3,
          -10,
          bottomX + spread,
          height * 0.7,
          bottomX - spread,
          height * 0.7,
        ])
        .fill({ color: index % 2 === 0 ? 0xffc877 : 0x8fd0ff, alpha: 0.03 });
    }
  }

  /** Alacsony, kékes ködfoltok a terep fölött; a Terrain sprite eltakarja, ami a talaj alá esne. */
  private drawFog(width: number, height: number, random: () => number): void {
    for (let index = 0; index < FOG_BLOBS; index += 1) {
      const x = random() * (width + FOG_OVERSCAN * 2) - FOG_OVERSCAN;
      const y = height * (0.58 + random() * 0.14);
      const rx = width * (0.1 + random() * 0.14);
      const ry = height * (0.018 + random() * 0.03);
      // Három koncentrikus réteg: puha, éles szél nélküli folt.
      for (let layer = 0; layer < 3; layer += 1) {
        const scale = 1 - layer * 0.3;
        this.fog.ellipse(x, y, rx * scale, ry * scale).fill({ color: this.atmosphereStyle.fog, alpha: 0.035 });
      }
    }
  }

  private layoutNebula(width: number, height: number): void {
    const texture = this.skyTexture;
    if (!texture) return;
    const scale = Math.max((width * SKY_OVERSCAN) / texture.width, (height * SKY_OVERSCAN) / texture.height);
    const w = texture.width * scale;
    const h = texture.height * scale;
    this.nebulaBaseX = (width - w) / 2;
    const y = -(h - height) * SKY_TOP_CROP;
    const layers: [Sprite, Texture | null][] = [
      [this.nebula, texture],
      [this.cityGlow, this.cityGlowTexture],
      [this.cityLights, this.cityLightsTexture],
    ];
    for (const [sprite, spriteTexture] of layers) {
      if (!spriteTexture) continue;
      sprite.texture = spriteTexture;
      sprite.scale.set(scale);
      sprite.position.set(this.nebulaBaseX, y);
      sprite.visible = true;
    }
    this.applyCityPulse(1);
  }

  private applyCityPulse(pulse: number): void {
    this.cityGlow.alpha = CITY_GLOW_ALPHA * pulse * this.atmosphereStyle.cityIntensity;
    this.cityLights.alpha =
      CITY_LIGHTS_ALPHA * (CITY_PULSE_MIN + (1 - CITY_PULSE_MIN) * pulse) * this.atmosphereStyle.cityIntensity;
  }

  public setWind(wind: number): void {
    this.windDustClouds.setWind(wind);
  }

  public async loadAssets(): Promise<void> {
    const sky = Assets.load<Texture>(skyUrl)
      .then((texture) => {
        this.skyTexture = texture;
      })
      .catch((error) => {
        // A vektoros égbolt (Game háttérszíne és csillagok) hiba esetén is használható marad.
        console.error("Battlefield sky texture could not be loaded.", error);
      });
    // A városfény-rétegek díszek: hiányuk esetén a háttérkép önmagában is jó.
    const city = Promise.all([Assets.load<Texture>(cityGlowUrl), Assets.load<Texture>(cityLightsUrl)])
      .then(([glow, lights]) => {
        this.cityGlowTexture = glow;
        this.cityLightsTexture = lights;
      })
      .catch((error) => {
        console.error("City light textures could not be loaded.", error);
      });
    await Promise.all([this.props.loadAssets(), sky, city]);
  }

  public setMotionEnabled(enabled: boolean): void {
    this.motionEnabled = enabled;
    this.props.setMotionEnabled(enabled);
    this.windDustClouds.setMotionEnabled(enabled);
    if (!enabled) {
      this.applyDrift(0);
      this.applyCityPulse(1);
      this.applyAtmosphere(0, 1);
    }
  }

  public update(dt: number): void {
    this.props.update(dt);
    this.windDustClouds.update(dt);
    if (!this.motionEnabled) return;
    this.time += dt;
    this.applyDrift(Math.sin(this.time * DRIFT_SPEED));
    this.applyCityPulse(0.5 + 0.5 * Math.sin(this.time * CITY_PULSE_SPEED));
    this.applyAtmosphere(Math.sin(this.time * FOG_DRIFT_SPEED), 0.5 + 0.5 * Math.sin(this.time * SHAFT_PULSE_SPEED));
  }

  /** A köd és a csillagok ellentétesen, eltérő sebességgel mozdulnak: ez adja a mélységérzetet. */
  private applyDrift(phase: number): void {
    const x = this.nebulaBaseX + phase * SKY_DRIFT_PX;
    this.nebula.x = x;
    this.cityGlow.x = x;
    this.cityLights.x = x;
    this.stars.x = -phase * STAR_DRIFT_PX;
  }

  /** A földi köd lassan ide-oda úszik; a fénysugarak alpha-ja lassan pulzál. */
  private applyAtmosphere(fogPhase: number, shaftPulse: number): void {
    this.fog.x = fogPhase * FOG_DRIFT_PX;
    this.shafts.alpha = 0.55 + 0.45 * shaftPulse;
  }

  public reactToImpact(intensity: number): void {
    this.props.reactToImpact(intensity);
  }
}
