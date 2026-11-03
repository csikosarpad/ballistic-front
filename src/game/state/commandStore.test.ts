import { beforeEach, describe, expect, it } from "vitest";
import { MAX_COMMAND_MESSAGES, useCommandStore } from "./commandStore";
import { pickVoice, voiceForSlot } from "../systems/speech";

const voice = (lang: string, localService = true, name = "") => ({ lang, localService, name }) as SpeechSynthesisVoice;

describe("commandStore", () => {
  beforeEach(() => useCommandStore.getState().clear());

  it("keeps only the latest messages", () => {
    for (let i = 0; i < MAX_COMMAND_MESSAGES + 3; i++) useCommandStore.getState().announce("command.fire");
    expect(useCommandStore.getState().messages).toHaveLength(MAX_COMMAND_MESSAGES);
  });

  it("stores key, params and tone", () => {
    useCommandStore.getState().announce("command.critical", { id: "P1" }, "critical");
    expect(useCommandStore.getState().messages[0]).toMatchObject({ key: "command.critical", tone: "critical" });
  });
});

describe("pickVoice", () => {
  it("prefers a local voice of the requested language", () => {
    const voices = [voice("en-US"), voice("hu-HU", false), voice("hu_HU")];
    expect(pickVoice(voices, "hu")).toBe(voices[2]);
    expect(pickVoice([voice("de-DE")], "en")).toBeNull();
  });

  it("prefers male voices and honours an explicit name", () => {
    const voices = [
      voice("en-US", true, "Microsoft Zira"),
      voice("en-GB", true, "Microsoft George"),
      voice("en-US", true, "Other"),
    ];
    expect(pickVoice(voices, "en")).toBe(voices[1]);
    expect(pickVoice(voices, "en", "Other")).toBe(voices[2]);
    expect(pickVoice([voice("en-US", true, "Microsoft Zira")], "en")?.name).toBe("Microsoft Zira");
  });
});

describe("voiceForSlot", () => {
  it("két megfelelő hangnál a játékosok külön hangot kapnak", () => {
    const voices = [voice("en-US", true, "Microsoft George"), voice("en-US", true, "Microsoft David")];
    const first = voiceForSlot(voices, "en", 0);
    const second = voiceForSlot(voices, "en", 1);
    expect(first.voice).not.toBe(second.voice);
    expect(second.voice).not.toBeNull();
  });

  it("egyetlen hangnál ugyanaz a hang, de más magassággal és tempóval", () => {
    const voices = [voice("hu-HU", true, "Microsoft Szabolcs")];
    const first = voiceForSlot(voices, "hu", 0);
    const second = voiceForSlot(voices, "hu", 1);
    expect(second.voice).toBe(first.voice);
    expect(second.pitch).toBeGreaterThan(first.pitch);
    expect(second.rate).not.toBe(first.rate);
  });
});
