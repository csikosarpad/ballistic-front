import { create } from "zustand";

const STORAGE_KEY = "ballistic-front:audio-settings";

/** Külön kapcsolható hangcsoportok; a globális némítás (`muted`) mindegyiket felülírja. */
export interface AudioChannels {
  music: boolean;
  /** Parancsnoki felolvasás. */
  voice: boolean;
  /** Lövés, robbanás és tankmozgás hangja. */
  effects: boolean;
}

export type AudioChannel = keyof AudioChannels;
export const AUDIO_CHANNELS: readonly AudioChannel[] = ["music", "voice", "effects"];

const DEFAULTS: AudioChannels = { music: true, voice: true, effects: true };

function load(): AudioChannels {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (typeof parsed !== "object" || parsed === null) return { ...DEFAULTS };
    const saved = parsed as Partial<Record<AudioChannel, unknown>>;
    return Object.fromEntries(
      AUDIO_CHANNELS.map((channel) => [
        channel,
        typeof saved[channel] === "boolean" ? saved[channel] : DEFAULTS[channel],
      ]),
    ) as unknown as AudioChannels;
  } catch {
    return { ...DEFAULTS };
  }
}

interface AudioSettingsState {
  channels: AudioChannels;
  setChannel: (channel: AudioChannel, enabled: boolean) => void;
}

export const useAudioSettings = create<AudioSettingsState>((set) => ({
  channels: load(),
  setChannel: (channel, enabled) =>
    set((state) => {
      const channels = { ...state.channels, [channel]: enabled };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
      } catch {
        // Mentés nélkül is érvényes az aktuális munkamenetben.
      }
      return { channels };
    }),
}));
