import { beforeEach, describe, expect, it } from "vitest";
import { useAudioSettings } from "./audioSettings";

describe("audioSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    useAudioSettings.setState({ channels: { music: true, voice: true, effects: true } });
  });

  it("toggles channels independently and persists them", () => {
    useAudioSettings.getState().setChannel("music", false);
    expect(useAudioSettings.getState().channels).toEqual({ music: false, voice: true, effects: true });
    expect(JSON.parse(localStorage.getItem("ballistic-front:audio-settings")!)).toMatchObject({ music: false });
  });
});
