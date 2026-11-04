import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManager } from "./AudioManager";
import { useAudioSettings } from "@game/state/audioSettings";
import { useGameStore } from "@game/state/gameStore";

describe("AudioManager volume", () => {
  const gain = { gain: { value: 0 }, connect: vi.fn() };
  const music = { volume: 0, loop: false, play: vi.fn().mockResolvedValue(undefined), pause: vi.fn() };
  const cancel = vi.fn();
  let manager: AudioManager;

  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({ muted: false });
    useAudioSettings.setState({ channels: { music: true, voice: true, effects: true }, volume: 0.4, error: null });
    vi.stubGlobal(
      "Audio",
      class {
        constructor() {
          return music;
        }
      },
    );
    vi.stubGlobal(
      "AudioContext",
      class {
        state = "running";
        destination = {};
        createGain = () => gain;
        resume = vi.fn().mockResolvedValue(undefined);
        close = vi.fn().mockResolvedValue(undefined);
        decodeAudioData = vi.fn().mockResolvedValue({});
      },
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(0) }));
    vi.stubGlobal("SpeechSynthesisUtterance", class {});
    vi.stubGlobal("speechSynthesis", { cancel });
    manager = new AudioManager();
    window.dispatchEvent(new Event("click"));
  });

  afterEach(() => {
    manager.destroy();
    vi.unstubAllGlobals();
  });

  it("applies saved volume at unlock and adjusts music and the live effects bus immediately", () => {
    expect(gain.gain.value).toBeCloseTo(0.6 * 0.4);
    expect(music.volume).toBeCloseTo(0.25 * 0.4);
    useAudioSettings.getState().setVolume(0.7);
    expect(gain.gain.value).toBeCloseTo(0.6 * 0.7);
    expect(music.volume).toBeCloseTo(0.25 * 0.7);
    expect(cancel).toHaveBeenCalledOnce();
    useAudioSettings.getState().setVolume(0);
    expect(gain.gain.value).toBe(0);
    expect(music.volume).toBe(0);
  });

  it("retains volume while muted and restores it without enabling disabled channels", () => {
    useGameStore.getState().toggleMuted();
    expect(gain.gain.value).toBe(0);
    expect(music.pause).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledOnce();
    useAudioSettings.getState().setVolume(0.3);
    expect(gain.gain.value).toBe(0);
    useGameStore.getState().toggleMuted();
    expect(gain.gain.value).toBeCloseTo(0.18);
    useAudioSettings.getState().setChannel("music", false);
    useAudioSettings.getState().setChannel("effects", false);
    useAudioSettings.getState().setVolume(0.9);
    expect(gain.gain.value).toBe(0);
    expect(useAudioSettings.getState().channels.music).toBe(false);
    expect(music.pause).toHaveBeenCalled();
  });

  it("cancels ongoing narration when its channel is disabled", () => {
    useAudioSettings.getState().setChannel("voice", false);
    expect(cancel).toHaveBeenCalledOnce();
  });
});
