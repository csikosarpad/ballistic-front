import { describe, expect, it } from "vitest";
import { barrelTip, createTank } from "../entities/tank";
import { DEFAULT_WORLD } from "../physics/ballistics";
import { TerrainMask } from "../terrain/mask";
import { newProfile, profileStars } from "./upgrades";
import { UPGRADES } from "../data/upgrades";
import {
  AiBrain,
  chooseUpgrades,
  experienceStrength,
  planShot,
  planPreciseShot,
  rankStars,
  simulateImpact,
  skillFromMemory,
} from "./ai";

const WIDTH = 1000;
const HEIGHT = 500;
const flat = () => TerrainMask.fromHeightmap(new Array(WIDTH).fill(400), HEIGHT);

function setup() {
  const mask = flat();
  const shooter = createTank("P2", 450, 0, 135);
  const target = createTank("P1", 120, 0, 45);
  shooter.y = 400;
  target.y = 400;
  return { mask, shooter, target };
}

/** Determinisztikus, ismétlődő sorozat a teszteknek. */
const sequence = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length]!;
};

describe("skillFromMemory", () => {
  it("új gépnél alacsony, tapasztalattal nő, de nem tökéletes", () => {
    const fresh = skillFromMemory({ matches: 0, wins: 0, shots: 0, hits: 0 });
    const veteran = skillFromMemory({ matches: 100, wins: 80, shots: 500, hits: 500 });
    expect(fresh).toBeLessThan(veteran);
    expect(veteran).toBeLessThan(1);
  });
});

describe("rankStars", () => {
  it("újoncnál 0, a maximális tapasztalatnál 5 csillag, közben nő", () => {
    const rank = (matches: number, shots: number, hits: number) => rankStars({ matches, wins: 0, shots, hits });
    expect(rank(0, 0, 0)).toBeLessThanOrEqual(1);
    expect(rank(100, 500, 500)).toBe(5);
    expect(rank(6, 60, 30)).toBeGreaterThan(rank(0, 0, 0));
    expect(experienceStrength({ matches: 100, wins: 0, shots: 500, hits: 500 })).toBeLessThanOrEqual(1);
  });
});

describe("profileStars", () => {
  it("a megvásárolt fejlesztések arányában nő 0-tól 5-ig", () => {
    expect(profileStars(newProfile())).toBe(0);
    const maxed = {
      xp: 0,
      levels: Object.fromEntries(UPGRADES.map((d) => [d.id, d.maxLevel])),
    };
    expect(profileStars(maxed)).toBe(5);
    expect(profileStars({ xp: 0, levels: { armor: 5, shield: 5, warhead: 5, blast: 5 } })).toBeGreaterThan(0);
  });
});

describe("planShot", () => {
  it("sík terepen közel talál a célponthoz", () => {
    const { mask, shooter, target } = setup();
    const plan = planShot({ shooter, target, mask, wind: 0, gravity: DEFAULT_WORLD.gravity, correctionX: 0 });
    expect(plan).not.toBeNull();
    expect(plan!.error).toBeLessThan(25);
  });

  it("a számolt lövés tényleg a célpont közelében csapódik be", () => {
    const { mask, shooter, target } = setup();
    const plan = planShot({ shooter, target, mask, wind: 20, gravity: DEFAULT_WORLD.gravity, correctionX: 0 })!;
    const tip = { x: shooter.x, y: shooter.y - 10 };
    const impact = simulateImpact(tip, plan.angle, plan.power, { gravity: DEFAULT_WORLD.gravity, wind: 20 }, mask);
    expect(impact).not.toBeNull();
    expect(Math.abs(impact!.pos.x - target.x)).toBeLessThan(60);
  });
});

describe("planPreciseShot", () => {
  it("olyan lövést választ, amelyet a játék fizikája közvetlen találatként szimulál", () => {
    const { mask, shooter, target } = setup();
    const plan = planPreciseShot(shooter, target, mask, 0, DEFAULT_WORLD.gravity);

    expect(plan?.hit).toBe(true);
    const impact = simulateImpact(
      barrelTip({ ...shooter, angle: plan!.angle }),
      plan!.angle,
      plan!.power,
      { gravity: DEFAULT_WORLD.gravity, wind: 0 },
      mask,
      target,
    );
    expect(impact?.hitTarget).toBe(true);
  });
});

describe("AiBrain", () => {
  it("hatótávolságon kívül az ellenfél felé indul, közelről marad", () => {
    const { mask, target } = setup();
    const far = createTank("P2", 960, 0, 135);
    far.y = 400;
    const near = createTank("P2", 450, 0, 135);
    near.y = 400;
    const brain = new AiBrain({ skill: 0.9 });
    expect(brain.planMove(far, target, mask, 0, DEFAULT_WORLD.gravity)).toBeGreaterThan(0);
    expect(brain.planMove(near, target, mask, 0, DEFAULT_WORLD.gravity)).toBe(0);
  });

  it("alacsony tudásnál a zaj miatt eltér a tökéletes lövéstől", () => {
    const { mask, shooter, target } = setup();
    const brain = new AiBrain({ skill: 0.3, random: sequence([0.2, 0.7, 0.4, 0.9, 0.1]) });
    const perfect = planShot({ shooter, target, mask, wind: 0, gravity: DEFAULT_WORLD.gravity, correctionX: 0 })!;
    const shot = brain.decide(shooter, target, mask, 0, DEFAULT_WORLD.gravity)!;
    expect(shot.angle !== perfect.angle || shot.power !== perfect.power).toBe(true);
  });

  it("Smart Aim esetén nem ad zajt a található, pontos lövéshez", () => {
    const { mask, shooter, target } = setup();
    const brain = new AiBrain({ skill: 0.3, random: sequence([0.2, 0.7, 0.4, 0.9, 0.1]) });
    const shot = brain.decide(shooter, target, mask, 0, DEFAULT_WORLD.gravity, true)!;
    const impact = simulateImpact(
      barrelTip({ ...shooter, angle: shot.angle }),
      shot.angle,
      shot.power,
      { gravity: DEFAULT_WORLD.gravity, wind: 0 },
      mask,
      target,
    );

    expect(impact?.hitTarget).toBe(true);
  });

  it("a mellélövésből tanul: a korrekció az ellenkező irányba tolja a célpontot", () => {
    const { mask, shooter, target } = setup();
    const brain = new AiBrain({ skill: 0.5, random: sequence([0.3, 0.6]) });
    brain.decide(shooter, target, mask, 0, DEFAULT_WORLD.gravity);
    brain.observe(target.x + 50);
    expect(brain.correction).toBeLessThan(0);
  });

  it("a szög és az erő a megengedett tartományban marad", () => {
    const { mask, shooter, target } = setup();
    const brain = new AiBrain({ skill: 0 });
    for (let i = 0; i < 5; i++) {
      const shot = brain.decide(shooter, target, mask, 40, DEFAULT_WORLD.gravity)!;
      expect(shot.angle).toBeGreaterThanOrEqual(0);
      expect(shot.angle).toBeLessThanOrEqual(180);
      expect(shot.power).toBeLessThanOrEqual(shooter.stats.maxPower);
    }
  });
});

describe("chooseUpgrades", () => {
  const summary = { shots: 6, damageDealt: 20, damageTaken: 90, won: false };

  it("a rendelkezésre álló XP-t költi, és nem megy mínuszba", () => {
    const { profile, bought } = chooseUpgrades({ ...newProfile(), xp: 200 }, summary, () => 0.5);
    expect(bought.length).toBeGreaterThan(0);
    expect(profile.xp).toBeGreaterThanOrEqual(0);
    expect(profile.xp).toBeLessThan(200);
  });

  it("sok elszenvedett sebzés után védelmet választ", () => {
    const { bought } = chooseUpgrades({ ...newProfile(), xp: 55 }, summary, () => 0.5);
    expect(["armor", "shield"]).toContain(bought[0]);
  });

  it("XP nélkül semmit nem vesz", () => {
    const { profile, bought } = chooseUpgrades(newProfile(), summary, () => 0.5);
    expect(bought).toEqual([]);
    expect(profile).toEqual(newProfile());
  });
});
