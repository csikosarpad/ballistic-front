import type { UnitAccent } from "./result.types";

export interface UpgradePresentation {
  glyph: string;
  accent: UnitAccent;
  iconSet: string;
}

const DEFAULT_UPGRADE_PRESENTATION: UpgradePresentation = {
  glyph: "◆",
  accent: "cyan",
  iconSet: "ground-combat",
};

export const UPGRADE_PRESENTATIONS: Record<string, UpgradePresentation> = {
  armor: DEFAULT_UPGRADE_PRESENTATION,
  shield: { glyph: "ϟ", accent: "cyan", iconSet: "ground-combat" },
  warhead: { glyph: "✦", accent: "orange", iconSet: "ground-combat" },
  blast: { glyph: "✹", accent: "gold", iconSet: "ground-combat" },
  barrel: { glyph: "◎", accent: "gold", iconSet: "ground-combat" },
  engine: { glyph: "▣", accent: "cyan", iconSet: "ground-combat" },
  smartAim: { glyph: "⌖", accent: "gold", iconSet: "ground-combat" },
};

export function getUpgradePresentation(id: string, iconSet = "ground-combat"): UpgradePresentation {
  const presentation = UPGRADE_PRESENTATIONS[id] || DEFAULT_UPGRADE_PRESENTATION;
  return { ...presentation, iconSet };
}
