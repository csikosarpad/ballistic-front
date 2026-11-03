/** A játéktér (Pixi) színei egy helyen; a skin ezt cseréli. Tisztán vizuális, a szimulációt nem érinti. */
export interface Theme {
  /** CSS szín, a Pixi háttérnek. */
  background: string;
  sky: number;
  terrain: {
    fill: number;
    grass: number;
    surfaceHighlight: number;
    soilDeep: number;
    soilLight: number;
    scorch: number;
  };
  /** Játékosonkénti színek, a csapatindex szerint. */
  players: readonly number[];
  hud: {
    hpBack: number;
    hpFill: number;
    shieldFill: number;
    armorFill: number;
    turnMarker: number;
    lockOn: number;
    previewLine: number;
  };
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
  background: "#060b1a",
  sky: 0x0c1633,
  terrain: {
    fill: 0x2a3a4f,
    grass: 0x2399ad,
    surfaceHighlight: 0x8beeff,
    soilDeep: 0x121b2a,
    soilLight: 0x4f6c88,
    scorch: 0x04070d,
  },
  players: [0x4da3ff, 0xff6b5a],
  hud: {
    hpBack: 0x222222,
    hpFill: 0x55dd66,
    shieldFill: 0x4dd0ff,
    armorFill: 0xffb347,
    turnMarker: 0xffffff,
    lockOn: 0xff3b3b,
    previewLine: 0xffffff,
  },
  shell: { core: 0xeafcff, glow: 0x5fe0ff },
  fx: {
    shockwave: 0x7fe9ff,
    fire: [0xff8a3c, 0x7fe9ff],
    debris: 0x5b7189,
    smoke: 0x6b7b8f,
    muzzle: 0xbff6ff,
    trail: 0x9fdcff,
  },
};
