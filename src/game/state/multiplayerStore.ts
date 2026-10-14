import { create } from "zustand";
import { appendRoomEvent, createRoom, fetchRoom, joinRoom, MultiplayerApiError } from "../multiplayer/api";
import type { RoomCredentials, RoomEvent, RoomSession } from "../multiplayer/protocol";

const STORAGE_KEY = "ballistic-front:multiplayer-session";
const API_URL = import.meta.env.VITE_MULTIPLAYER_API_URL || "/api";

interface SavedSession {
  credentials: RoomCredentials;
  session: RoomSession;
}

interface MultiplayerState {
  credentials: RoomCredentials | null;
  session: RoomSession | null;
  events: RoomEvent[];
  busy: boolean;
  error: string | null;
  create: (playerName: string) => Promise<void>;
  join: (roomCode: string, playerName: string) => Promise<void>;
  refresh: () => Promise<void>;
  publish: (type: string, payload: Record<string, unknown>) => Promise<void>;
  leave: () => void;
}

function loadSession(): SavedSession | null {
  try {
    const serialized = sessionStorage.getItem(STORAGE_KEY);
    return serialized ? (JSON.parse(serialized) as SavedSession) : null;
  } catch {
    return null;
  }
}

function saveSession(credentials: RoomCredentials | null, session: RoomSession | null): void {
  try {
    if (credentials && session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ credentials, session }));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // A szoba csak a jelenlegi fül bezárásáig él, ha a sessionStorage nem elérhető.
  }
}

function mergeEvents(current: RoomEvent[], incoming: RoomEvent[]): RoomEvent[] {
  const byRevision = new Map(current.map((event) => [event.revision, event]));
  for (const event of incoming) byRevision.set(event.revision, event);
  return [...byRevision.values()].sort((a, b) => a.revision - b.revision);
}

const saved = loadSession();

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  credentials: saved?.credentials ?? null,
  session: saved ? { ...saved.session, revision: 0 } : null,
  events: [],
  busy: false,
  error: null,
  create: async (playerName) => {
    set({ busy: true, error: null });
    try {
      const access = await createRoom(API_URL, playerName);
      saveSession(access.credentials, access.update.session);
      set({ credentials: access.credentials, session: access.update.session, events: access.update.events });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Nem sikerült létrehozni a szobát." });
    } finally {
      set({ busy: false });
    }
  },
  join: async (roomCode, playerName) => {
    set({ busy: true, error: null });
    try {
      const access = await joinRoom(API_URL, roomCode.trim().toUpperCase(), playerName);
      saveSession(access.credentials, access.update.session);
      set({ credentials: access.credentials, session: access.update.session, events: access.update.events });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Nem sikerült csatlakozni a szobához." });
    } finally {
      set({ busy: false });
    }
  },
  refresh: async () => {
    const { credentials, session } = get();
    if (!credentials || !session) return;
    try {
      const update = await fetchRoom(API_URL, credentials, session.revision);
      const current = get();
      if (current.credentials !== credentials) return;
      const events = mergeEvents(current.events, update.events);
      saveSession(credentials, update.session);
      set({ session: update.session, events, error: null });
    } catch (error) {
      if (get().credentials === credentials) {
        set({ error: error instanceof Error ? error.message : "Nem sikerült frissíteni a szobát." });
      }
    }
  },
  publish: async (type, payload) => {
    const { credentials, session } = get();
    if (!credentials || !session) return;
    try {
      const update = await appendRoomEvent(API_URL, credentials, session.revision, type, payload);
      if (get().credentials !== credentials) return;
      const events = mergeEvents(get().events, update.events);
      saveSession(credentials, update.session);
      set({ session: update.session, events, error: null });
    } catch (error) {
      if (get().credentials !== credentials) return;
      set({ error: error instanceof Error ? error.message : "Nem sikerült elküldeni a játékeseményt." });
      if (error instanceof MultiplayerApiError && error.status === 409) void get().refresh();
    }
  },
  leave: () => {
    saveSession(null, null);
    set({ credentials: null, session: null, events: [], error: null, busy: false });
  },
}));
