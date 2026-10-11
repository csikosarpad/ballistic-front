import { newProfile, type Profile } from "./upgrades";

const KEY = "ballistic-front:profiles:v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function sanitize(raw: unknown): Profile {
  if (typeof raw !== "object" || raw === null) return newProfile();
  const { xp, levels } = raw as Partial<Profile>;
  const safeLevels: Record<string, number> = {};
  if (typeof levels === "object" && levels !== null) {
    for (const [id, lvl] of Object.entries(levels)) {
      if (Number.isInteger(lvl) && lvl > 0) safeLevels[id] = lvl;
    }
  }
  return { xp: Number.isFinite(xp) && xp! >= 0 ? Math.floor(xp!) : 0, levels: safeLevels };
}

/** Hibás vagy hiányzó mentésnél üres profilokat ad; a mentett adatot nem bízzuk vakon. */
export function loadProfiles(ids: string[], storage: StorageLike = localStorage): Record<string, Profile> {
  let saved: Record<string, unknown> = {};
  try {
    const text = storage.getItem(KEY);
    if (text) saved = JSON.parse(text) as Record<string, unknown>;
  } catch {
    // Sérült JSON vagy elérhetetlen tároló: üres profilokkal indulunk.
  }
  return Object.fromEntries(ids.map((id) => [id, sanitize(saved?.[id])]));
}

export function saveProfiles(profiles: Record<string, Profile>, storage: StorageLike = localStorage): void {
  try {
    storage.setItem(KEY, JSON.stringify(profiles));
  } catch {
    // Pl. betelt a kvóta vagy privát mód: a játék mentés nélkül is működik.
  }
}
