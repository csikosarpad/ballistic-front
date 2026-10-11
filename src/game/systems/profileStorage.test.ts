import { describe, expect, it } from "vitest";
import { loadProfiles, saveProfiles } from "./profileStorage";

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
});
