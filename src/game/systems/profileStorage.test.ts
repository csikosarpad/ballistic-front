import { describe, expect, it } from "vitest";
import { loadProfiles, migrateProfiles, saveProfiles, STORAGE_VERSION } from "./profileStorage";

function keyedStorage(initial: Record<string, string>) {
  return {
    getItem: (k: string) => initial[k] ?? null,
    setItem: (k: string, v: string) => {
      initial[k] = v;
    },
  };
}

function fakeStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_k: string, v: string) => {
      value = v;
    },
  };
}

describe("profileStorage", () => {
  it("mentés után visszatölthető", () => {
    const s = fakeStorage();
    saveProfiles({ P1: { xp: 120, levels: { armor: 2 } } }, s);
    expect(loadProfiles(["P1", "P2"], s)).toEqual({
      P1: { xp: 120, levels: { armor: 2 } },
      P2: { xp: 0, levels: {} },
    });
  });

  it("sérült JSON-nál üres profilokat ad", () => {
    expect(loadProfiles(["P1"], fakeStorage("{nem json"))).toEqual({ P1: { xp: 0, levels: {} } });
  });

  it("érvénytelen értékeket kiszűri", () => {
    const bad = JSON.stringify({ P1: { xp: -5, levels: { armor: "x", engine: 2, blast: -1 } } });
    expect(loadProfiles(["P1"], fakeStorage(bad))).toEqual({ P1: { xp: 0, levels: { engine: 2 } } });
  });

  it("verziózott borítékban ment", () => {
    const s = fakeStorage();
    saveProfiles({ P1: { xp: 5, levels: {} } }, s);
    expect(JSON.parse(s.getItem()!)).toEqual({ version: STORAGE_VERSION, profiles: { P1: { xp: 5, levels: {} } } });
  });

  it("a régi (v1) kulcson lévő, verzió nélküli mentést átveszi", () => {
    const legacy = JSON.stringify({ P1: { xp: 80, levels: { armor: 3, engine: 1 } } });
    const s = keyedStorage({ "ballistic-front:profiles:v1": legacy });
    expect(loadProfiles(["P1"], s).P1).toEqual({ xp: 80, levels: { armor: 3, engine: 1 } });
  });

  it("az új kulcs elsőbbséget élvez a régivel szemben", () => {
    const s = keyedStorage({
      "ballistic-front:profiles": JSON.stringify({ version: STORAGE_VERSION, profiles: { P1: { xp: 9, levels: {} } } }),
      "ballistic-front:profiles:v1": JSON.stringify({ P1: { xp: 999, levels: {} } }),
    });
    expect(loadProfiles(["P1"], s).P1?.xp).toBe(9);
  });

  it("ismeretlen (újabb) verziójú mentést nem használ", () => {
    const future = JSON.stringify({ version: STORAGE_VERSION + 1, profiles: { P1: { xp: 50, levels: {} } } });
    expect(loadProfiles(["P1"], fakeStorage(future)).P1).toEqual({ xp: 0, levels: {} });
  });
});

describe("migrateProfiles", () => {
  it("nem objektumból üres rekordot csinál", () => {
    expect(migrateProfiles(null)).toEqual({});
    expect(migrateProfiles("x")).toEqual({});
  });
});
