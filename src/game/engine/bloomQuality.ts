export interface BloomSettings {
  strength: number;
  blur: number;
}

/** Asztali gépen erősebb, érintőeszközön (FPS-érzékeny) gyengébb a bloom. */
export const DESKTOP_BLOOM: BloomSettings = { strength: 1.2, blur: 8 };
export const MOBILE_BLOOM: BloomSettings = { strength: 0.4, blur: 2 };

export function bloomSettings(coarsePointer: boolean): BloomSettings {
  return coarsePointer ? MOBILE_BLOOM : DESKTOP_BLOOM;
}
