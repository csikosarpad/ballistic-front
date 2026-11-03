import { create } from "zustand";
import { t, useLocaleStore, type MessageKey, type Params } from "@/i18n";
import { cancelSpeech, speak } from "../systems/speech";
import { useGameStore } from "./gameStore";

export type CommandTone = "info" | "warning" | "critical";

export interface CommandMessage {
  id: number;
  key: MessageKey;
  params?: Params;
  tone: CommandTone;
  time: string;
}

export const MAX_COMMAND_MESSAGES = 6;

const clock = () => new Date().toLocaleTimeString("hu-HU", { hour12: false });

interface CommandState {
  messages: CommandMessage[];
  /** Megjeleníti a parancsot a konzolon, és az aktuális nyelven fel is mondja (némítva csak kiírja). */
  announce: (key: MessageKey, params?: Params, tone?: CommandTone) => void;
  clear: () => void;
}

let nextId = 1;

export const useCommandStore = create<CommandState>((set) => ({
  messages: [],
  announce: (key, params, tone = "info") => {
    set((s) => ({
      messages: [...s.messages, { id: nextId++, key, params, tone, time: clock() }].slice(-MAX_COMMAND_MESSAGES),
    }));
    if (!useGameStore.getState().muted) speak(t(key, params), useLocaleStore.getState().locale);
  },
  clear: () => {
    cancelSpeech();
    set({ messages: [] });
  },
}));
