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

type AudioSettingsError = "audio.loadError" | "audio.saveError";
interface SavedAudioSettings {
  channels: AudioChannels;
  volume: number;
  error: AudioSettingsError | null;
}

function load(): SavedAudioSettings {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Invalid audio settings");
    }
    const channels = { ...DEFAULTS };
    for (const channel of AUDIO_CHANNELS) {
      if (channel in parsed) {
        const enabled: unknown = Reflect.get(parsed, channel);
        if (typeof enabled !== "boolean") throw new Error(`Invalid audio channel: ${channel}`);
        channels[channel] = enabled;
      }
    }
    const volume: unknown = "volume" in parsed ? parsed.volume : 1;
    if (typeof volume !== "number" || !Number.isFinite(volume) || volume < 0 || volume > 1) {
      throw new Error("Invalid audio volume");
    }
    return { channels, volume, error: null };
  } catch (error) {
    console.error("Audio settings could not be loaded", error);
    return { channels: { ...DEFAULTS }, volume: 1, error: "audio.loadError" };
  }
}

function save(channels: AudioChannels, volume: number): AudioSettingsError | null {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...channels, volume }));
    return null;
  } catch (error) {
    console.error("Audio settings could not be saved", error);
    return "audio.saveError";
  }
}

interface AudioSettingsState extends SavedAudioSettings {
  setChannel: (channel: AudioChannel, enabled: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useAudioSettings = create<AudioSettingsState>((set) => ({
  ...load(),
  setChannel: (channel, enabled) =>
    set((state) => {
      const channels = { ...state.channels, [channel]: enabled };
      return { channels, error: save(channels, state.volume) };
    }),
  setVolume: (value) => {
    if (!Number.isFinite(value)) throw new RangeError("Audio volume must be finite");
    const volume = Math.max(0, Math.min(1, value));
    set((state) => ({ volume, error: save(state.channels, volume) }));
  },
}));
