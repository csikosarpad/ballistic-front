import { Assets, type Texture } from "pixi.js";
import fire1 from "../assets/fx/fire_01.png?url";
import fire2 from "../assets/fx/fire_02.png?url";
import smoke1 from "../assets/fx/smoke_02.png?url";
import smoke2 from "../assets/fx/smoke_04.png?url";
import debris1 from "../assets/fx/dirt_01.png?url";
import debris2 from "../assets/fx/dirt_02.png?url";
import ringUrl from "../assets/fx/circle_03.png?url";
import glowUrl from "../assets/fx/star_04.png?url";
import muzzleUrl from "../assets/fx/muzzle_01.png?url";

/** Kenney Particle Pack (CC0) sprite-ok; a licenc az assets/fx mappában van. */
export interface FxTextures {
  fire: Texture[];
  smoke: Texture[];
  debris: Texture[];
  ring: Texture;
  glow: Texture;
  muzzle: Texture;
}

export async function loadFxTextures(): Promise<FxTextures> {
  const [f1, f2, s1, s2, d1, d2, ring, glow, muzzle] = await Promise.all(
    [fire1, fire2, smoke1, smoke2, debris1, debris2, ringUrl, glowUrl, muzzleUrl].map((url) => Assets.load<Texture>(url)),
  );
  return { fire: [f1!, f2!], smoke: [s1!, s2!], debris: [d1!, d2!], ring: ring!, glow: glow!, muzzle: muzzle! };
}
