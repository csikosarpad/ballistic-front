import { newProfile, type Profile } from "./upgrades";

const KEY = "ballistic-front:profiles";
/** A verzió nélküli, közvetlenül `{ [id]: Profile }` alakú régi mentés kulcsa. */
const LEGACY_KEY = "ballistic-front:profiles:v1";
/**
 * 1: verzió nélküli rekord (legacy kulcs).
 * 2: `{ version, profiles }` boríték; az „armor” fejlesztés a fizikai páncélt növeli (az azonosító és a szintek érvényesek).
 */
export const STORAGE_VERSION = 2;

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

function readJson(storage: StorageLike, key: string): unknown {
  try {
    const text = storage.getItem(key);
    return text ? JSON.parse(text) : null;
  } catch {
    // Sérült JSON vagy elérhetetlen tároló: üres profilokkal indulunk.
    return null;
  }
}

/** Bármely ismert verziójú mentést a jelenlegi `{ [id]: nyers profil }` alakra hoz; ismeretlen (újabb) verziót nem használ. */
export function migrateProfiles(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null) return {};
  const data = raw as { version?: unknown; profiles?: unknown };
  if (typeof data.version === "number") {
    if (data.version !== STORAGE_VERSION) return {};
    return typeof data.profiles === "object" && data.profiles !== null
      ? (data.profiles as Record<string, unknown>)
      : {};
  }
  return raw as Record<string, unknown>;
}

/** Hibás vagy hiányzó mentésnél üres profilokat ad; a mentett adatot nem bízzuk vakon. */
export function loadProfiles(ids: string[], storage: StorageLike = localStorage): Record<string, Profile> {
  const current = readJson(storage, KEY);
  const saved = migrateProfiles(current ?? readJson(storage, LEGACY_KEY));
  return Object.fromEntries(ids.map((id) => [id, sanitize(saved[id])]));
}

export function saveProfiles(profiles: Record<string, Profile>, storage: StorageLike = localStorage): void {
  try {
    storage.setItem(KEY, JSON.stringify({ version: STORAGE_VERSION, profiles }));
  } catch {
    // Pl. betelt a kvóta vagy privát mód: a játék mentés nélkül is működik.
  }
}
