import { describe, expect, it } from "vitest";
import { ParticleSystem } from "./particles";

const make = () => new ParticleSystem(() => 0.5);

describe("ParticleSystem", () => {
  it("a robbanás tüzet, füstöt, törmeléket és lökéshullámot is létrehoz", () => {
    const ps = make();
    ps.spawnExplosion(0, 0, 30);
    const kinds = new Set(ps.particles.map((p) => p.kind));
    expect(kinds).toEqual(new Set(["ring", "fire", "debris", "smoke"]));
  });

  it("a torkolattűz a cső irányába fordul (90° = felfelé = 0 forgatás)", () => {
    const ps = make();
    ps.spawnMuzzleFlash(0, 0, 90);
    ps.spawnMuzzleFlash(0, 0, 0);
    expect(ps.particles[0]!.rotation).toBeCloseTo(0);
    expect(ps.particles[1]!.rotation).toBeCloseTo(Math.PI / 2);
  });

  it("a lökéshullám-gyűrű nő, a füst felfelé száll", () => {
    const ps = make();
    ps.spawnExplosion(0, 0, 30);
    const ring = ps.particles.find((p) => p.kind === "ring")!;
    const smoke = ps.particles.find((p) => p.kind === "smoke")!;
    const [size, y] = [ring.size, smoke.y];
    ps.update(0.1);
    expect(ring.size).toBeGreaterThan(size);
    expect(smoke.y).toBeLessThan(y);
  });

  it("a lövedék csóvája halvány füst", () => {
    const ps = make();
    ps.spawnTrail(5, 5);
    expect(ps.particles[0]).toMatchObject({ kind: "smoke", x: 5, y: 5 });
    expect(ps.particles[0]!.opacity).toBeLessThan(0.5);
  });

  it("a lejárt részecskék törlődnek", () => {
    const ps = make();
    ps.spawnExplosion(0, 0, 30);
    ps.update(10);
    expect(ps.particles).toHaveLength(0);
  });
});
