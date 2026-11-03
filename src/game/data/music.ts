import neonCityUrl from "@game/assets/audio/music/energysound-cyberpunk-neon-city-505278.mp3?url";

export interface MusicTrack {
  id: string;
  url: string;
}

/** Elérhető számok; a későbbi választó a beállításokban ebből dolgozik. */
export const MUSIC_TRACKS: readonly MusicTrack[] = [{ id: "neon-city", url: neonCityUrl }];
export const DEFAULT_TRACK_ID = "neon-city";

export const trackById = (id: string): MusicTrack => MUSIC_TRACKS.find((track) => track.id === id) ?? MUSIC_TRACKS[0]!;
