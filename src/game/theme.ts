/** A játéktér (Pixi) színei egy helyen; a skin ezt cseréli. Tisztán vizuális, a szimulációt nem érinti. */
export interface Theme {
  /** CSS szín, a Pixi háttérnek. */
  background: string;
  sky: number;
  terrain: { fill: number; grass: number; scorch: number };
  /** Játékosonkénti színek, a csapatindex szerint. */
  players: readonly number[];
  hud: { hpBack: number; hpFill: number; shieldFill: number; turnMarker: number; previewLine: number };
  shell: { core: number; glow: number };
  fx: {
    shockwave: number;
    fire: readonly [number, number];
    debris: number;
    smoke: number;
    muzzle: number;
    trail: number;
  };
}

export const DEFAULT_THEME: Theme = {
  background: "#0b1020",
  sky: 0x16224a,
  terrain: { fill: 0x6b4a2b, grass: 0x3d7a3a, scorch: 0x14100a },
  players: [0x4da3ff, 0xff6b5a],
  hud: { hpBack: 0x222222, hpFill: 0x55dd66, shieldFill: 0x4dd0ff, turnMarker: 0xffffff, previewLine: 0xffffff },
  shell: { core: 0xfff2c0, glow: 0xffd070 },
  fx: {
    shockwave: 0xffb870,
    fire: [0xff7a20, 0xffa030],
    debris: 0x7a5530,
    smoke: 0x777777,
    muzzle: 0xffe0a0,
    trail: 0xcccccc,
  },
};
