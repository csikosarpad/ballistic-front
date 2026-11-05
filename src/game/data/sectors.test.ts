import { describe, expect, it } from "vitest";
import { SECTORS, sectorById, sectorStatus, validateSectorGraph } from "./sectors";

describe("campaign sector graph", () => {
  it("contains five unique sectors and a reachable PRIME endpoint", () => {
    expect(SECTORS).toHaveLength(5);
    expect(() => validateSectorGraph(SECTORS)).not.toThrow();
    expect(sectorStatus("alpha-01", [])).toBe("available");
    expect(sectorStatus("prime-00", [])).toBe("locked");
    expect(sectorStatus("vanguard-12", ["alpha-01", "delta-08"])).toBe("available");
    expect(sectorStatus("vanguard-12", ["alpha-01", "forge-17"])).toBe("available");
    expect(sectorStatus("forge-17", ["alpha-01", "delta-08", "vanguard-12", "prime-00"])).toBe("available");
  });

  it("rejects unknown IDs, missing references, cycles and duplicate IDs", () => {
    expect(() => sectorById("unknown")).toThrow("Unknown sector");
    expect(() => validateSectorGraph(SECTORS.slice(1))).toThrow("Missing");
    expect(() => validateSectorGraph([...SECTORS, SECTORS[0]!])).toThrow("Duplicate");
    expect(() =>
      validateSectorGraph(
        SECTORS.map((sector) => (sector.id === "alpha-01" ? { ...sector, prerequisites: ["prime-00"] } : sector)),
      ),
    ).toThrow("Cyclic");
  });
});
