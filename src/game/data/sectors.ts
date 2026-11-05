import type { MessageKey } from "@/i18n";
import { DEFAULT_THEME, type Theme } from "../theme";

export interface TerrainProfile {
  points: readonly (readonly [number, number])[];
  amplitude: number;
}

export interface Sector {
  id: SectorId;
  code: string;
  name: string;
  briefing: MessageKey;
  terrain: TerrainProfile | null;
  colors: Theme["terrain"];
  atmosphere: { tint: number; mountain: number; fog: number; cityIntensity: number };
  prerequisites: readonly SectorId[];
  position: { x: number; y: number };
}

export type SectorId = "alpha-01" | "delta-08" | "forge-17" | "vanguard-12" | "prime-00";
export const CAMPAIGN_CONTENT_VERSION = 1;

export const TRAINING_SECTOR: Sector = {
  id: "alpha-01",
  code: "SECTOR ALPHA-01",
  name: "Training Grounds",
  briefing: "sector.trainingBrief",
  terrain: null,
  colors: DEFAULT_THEME.terrain,
  atmosphere: { tint: 0xffffff, mountain: 0x122644, fog: 0x7fb4d8, cityIntensity: 1 },
  prerequisites: [],
  position: { x: 50, y: 85 },
};

export const SECTORS: readonly Sector[] = [
  TRAINING_SECTOR,
  {
    id: "delta-08",
    code: "SECTOR DELTA-08",
    name: "Crystal Basin",
    briefing: "sector.deltaBrief",
    terrain: {
      points: [
        [0, 0.58],
        [0.12, 0.58],
        [0.22, 0.6],
        [0.34, 0.71],
        [0.5, 0.76],
      ],
      amplitude: 0.015,
    },
    colors: { ...DEFAULT_THEME.terrain, fill: 0x26384c, grass: 0x36b8bc, surfaceHighlight: 0xb2fbf2 },
    atmosphere: { tint: 0xb4e9ef, mountain: 0x173949, fog: 0x9591c9, cityIntensity: 0.3 },
    prerequisites: ["alpha-01"],
    position: { x: 25, y: 60 },
  },
  {
    id: "forge-17",
    code: "SECTOR FORGE-17",
    name: "Industrial Expanse",
    briefing: "sector.forgeBrief",
    terrain: {
      points: [
        [0, 0.62],
        [0.2, 0.62],
        [0.28, 0.58],
        [0.4, 0.58],
        [0.48, 0.63],
        [0.5, 0.63],
      ],
      amplitude: 0.006,
    },
    colors: { ...DEFAULT_THEME.terrain, fill: 0x34343b, grass: 0xb87843, surfaceHighlight: 0xffd0a0 },
    atmosphere: { tint: 0xffd4ab, mountain: 0x3b2b30, fog: 0xb18d79, cityIntensity: 1 },
    prerequisites: ["alpha-01"],
    position: { x: 75, y: 60 },
  },
  {
    id: "vanguard-12",
    code: "SECTOR VANGUARD-12",
    name: "Defense Grid",
    briefing: "sector.vanguardBrief",
    terrain: {
      points: [
        [0, 0.62],
        [0.2, 0.62],
        [0.28, 0.67],
        [0.4, 0.52],
        [0.5, 0.49],
      ],
      amplitude: 0.012,
    },
    colors: { ...DEFAULT_THEME.terrain, fill: 0x243347, grass: 0x477ea8, surfaceHighlight: 0xa8ddff },
    atmosphere: { tint: 0xc1deff, mountain: 0x152f50, fog: 0x7ea7c5, cityIntensity: 0.5 },
    prerequisites: ["delta-08", "forge-17"],
    position: { x: 50, y: 35 },
  },
  {
    id: "prime-00",
    code: "SECTOR PRIME-00",
    name: "Capital Perimeter",
    briefing: "sector.primeBrief",
    terrain: {
      points: [
        [0, 0.62],
        [0.2, 0.62],
        [0.3, 0.56],
        [0.4, 0.65],
        [0.5, 0.63],
      ],
      amplitude: 0.01,
    },
    colors: { ...DEFAULT_THEME.terrain, fill: 0x293447, grass: 0xb49a52, surfaceHighlight: 0xffe4a3 },
    atmosphere: { tint: 0xffebbf, mountain: 0x303345, fog: 0xb8ac83, cityIntensity: 1 },
    prerequisites: ["vanguard-12"],
    position: { x: 50, y: 10 },
  },
];

export function isSectorId(id: unknown): id is SectorId {
  return typeof id === "string" && SECTORS.some((sector) => sector.id === id);
}

export function sectorById(id: string): Sector {
  const sector = SECTORS.find((entry) => entry.id === id);
  if (!sector) throw new Error(`Unknown sector: ${id}`);
  return sector;
}

export function sectorStatus(id: SectorId, completed: readonly SectorId[]): "completed" | "available" | "locked" {
  if (completed.includes(id)) return "completed";
  const { prerequisites } = sectorById(id);
  return !prerequisites.length || prerequisites.some((required) => completed.includes(required))
    ? "available"
    : "locked";
}

export function nextOperation(completed: readonly SectorId[]): SectorId {
  return SECTORS.find((sector) => sectorStatus(sector.id, completed) === "available")?.id ?? "prime-00";
}

export function validateSectorGraph(sectors: readonly Sector[]): void {
  const byId = new Map(sectors.map((sector) => [sector.id, sector]));
  if (byId.size !== sectors.length) throw new Error("Duplicate campaign sector");
  const visiting = new Set<SectorId>();
  const visited = new Set<SectorId>();
  const visit = (id: SectorId) => {
    if (visiting.has(id)) throw new Error("Cyclic campaign graph");
    if (visited.has(id)) return;
    const sector = byId.get(id);
    if (!sector) throw new Error(`Missing campaign sector: ${id}`);
    visiting.add(id);
    sector.prerequisites.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  };
  sectors.forEach((sector) => visit(sector.id));
  const reachable = new Set<SectorId>();
  for (let pass = 0; pass < sectors.length; pass++) {
    for (const sector of sectors) {
      if (!sector.prerequisites.length || sector.prerequisites.some((id) => reachable.has(id)))
        reachable.add(sector.id);
    }
  }
  if (reachable.size !== sectors.length || !reachable.has("prime-00")) throw new Error("Unreachable campaign endpoint");
}

validateSectorGraph(SECTORS);
