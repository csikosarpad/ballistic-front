import type { UnitPresentation } from "./result.types";
import tankBodyUrl from "@/game/assets/tank-body.svg?url";
import tankBarrelUrl from "@/game/assets/tank-barrel.svg?url";

const GROUND_PRESENTATION: UnitPresentation = {
  domain: "ground",
  displayName: "Tank",
  silhouetteAsset: tankBodyUrl,
  secondaryAsset: tankBarrelUrl,
  primaryColor: 0x24d8ff,
  secondaryColor: 0x087fa7,
  iconSet: "ground-combat",
  accent: "cyan",
};

const SPACE_PRESENTATION: UnitPresentation = {
  domain: "space",
  displayName: "Space fighter",
  primaryColor: 0x24d8ff,
  secondaryColor: 0x087fa7,
  iconSet: "space-combat",
  accent: "cyan",
};

const PRESENTATIONS: Record<string, UnitPresentation> = {
  P1: GROUND_PRESENTATION,
  P2: {
    ...GROUND_PRESENTATION,
    primaryColor: 0xffc52e,
    secondaryColor: 0xb86a12,
    accent: "gold",
  },
};

const SPACE_PRESENTATIONS: Record<string, UnitPresentation> = {
  P1: SPACE_PRESENTATION,
  P2: {
    ...SPACE_PRESENTATION,
    primaryColor: 0xffc52e,
    secondaryColor: 0xb86a12,
    accent: "gold",
  },
};

export function getUnitPresentation(id: string, domain: UnitPresentation["domain"] = "ground"): UnitPresentation {
  const presentations = domain === "space" ? SPACE_PRESENTATIONS : PRESENTATIONS;
  return presentations[id] ?? (domain === "space" ? SPACE_PRESENTATION : GROUND_PRESENTATION);
}
