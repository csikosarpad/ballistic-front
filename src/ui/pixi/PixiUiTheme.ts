export const PIXI_UI_THEME = {
  colors: {
    background: 0x041426,
    panel: 0x07182b,
    cyan: 0x24d8ff,
    cyanBright: 0x8beeff,
    cyanDark: 0x087fa7,
    gold: 0xffc52e,
    goldBright: 0xffeb78,
    orange: 0xff851f,
    grid: 0x1b5b78,
  },
  alpha: {
    panel: 0.18,
    frame: 0.32,
    grid: 0.11,
    glow: 0.24,
  },
  geometry: {
    cornerSize: 28,
    inset: 12,
    radius: 18,
  },
} as const;

export type PixiUiAccent = "cyan" | "gold" | "orange";

export function accentColor(accent: PixiUiAccent): number {
  return PIXI_UI_THEME.colors[accent];
}
