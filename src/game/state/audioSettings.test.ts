import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAudioSettings } from "./audioSettings";

describe("audioSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    useAudioSettings.setState({ channels: { music: true, voice: true, effects: true }, volume: 1, error: null });
  });

  afterEach(() => vi.restoreAllMocks());

  it("toggles channels independently and persists them", () => {
    useAudioSettings.getState().setChannel("music", false);
    expect(useAudioSettings.getState().channels).toEqual({ music: false, voice: true, effects: true });
    expect(JSON.parse(localStorage.getItem("ballistic-front:audio-settings")!)).toMatchObject({ music: false });
  });

  it("persists volume and keeps channel preferences in both update directions", () => {
    useAudioSettings.getState().setChannel("voice", false);
    useAudioSettings.getState().setVolume(0.37);
    expect(JSON.parse(localStorage.getItem("ballistic-front:audio-settings")!)).toEqual({
      music: true,
      voice: false,
      effects: true,
      volume: 0.37,
    });
    useAudioSettings.getState().setChannel("music", false);
    expect(JSON.parse(localStorage.getItem("ballistic-front:audio-settings")!).volume).toBe(0.37);
  });

  it("clamps volume to 0–1 and rejects non-finite input", () => {
    useAudioSettings.getState().setVolume(-1);
    expect(useAudioSettings.getState().volume).toBe(0);
    useAudioSettings.getState().setVolume(2);
    expect(useAudioSettings.getState().volume).toBe(1);
    expect(() => useAudioSettings.getState().setVolume(NaN)).toThrow(RangeError);
  });

  it("reloads saved volume and migrates channel-only settings without changing their preferences", async () => {
    useAudioSettings.getState().setVolume(0.42);
    vi.resetModules();
    const saved = await import("./audioSettings");
    expect(saved.useAudioSettings.getState().volume).toBe(0.42);
    localStorage.setItem("ballistic-front:audio-settings", '{"music":false,"voice":true,"effects":false}');
    vi.resetModules();
    const legacy = await import("./audioSettings");
    expect(legacy.useAudioSettings.getState()).toMatchObject({
      channels: { music: false, voice: true, effects: false },
      volume: 1,
      error: null,
    });
  });

  it("reports invalid saves and does not silently overwrite them", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const invalid of ['{"volume":2}', '{"volume":"quiet"}', "null", "{"]) {
      localStorage.setItem("ballistic-front:audio-settings", invalid);
      vi.resetModules();
      const loaded = await import("./audioSettings");
      expect(loaded.useAudioSettings.getState()).toMatchObject({ volume: 1, error: "audio.loadError" });
      expect(localStorage.getItem("ballistic-front:audio-settings")).toBe(invalid);
    }
    expect(log).toHaveBeenCalledTimes(4);
  });

  it("reports storage failure, keeps session volume, and retries on the next change", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const save = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("Storage unavailable");
    });
    useAudioSettings.getState().setVolume(0.2);
    expect(useAudioSettings.getState()).toMatchObject({ volume: 0.2, error: "audio.saveError" });
    expect(log).toHaveBeenCalledOnce();
    save.mockRestore();
    useAudioSettings.getState().setVolume(0.3);
    expect(useAudioSettings.getState().error).toBeNull();
  });
});
