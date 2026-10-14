import type { MatchSetup } from "../systems/seededRandom";

export type RoomStatus = "waiting" | "ready" | "playing" | "finished";
export type PlayerId = "P1" | "P2";

export interface RoomSession {
  code: string;
  status: RoomStatus;
  revision: number;
  setup: MatchSetup;
  players: Record<PlayerId, string | null>;
}

export interface RoomCredentials {
  roomCode: string;
  playerId: PlayerId;
  token: string;
}

export interface RoomEvent {
  revision: number;
  playerId: PlayerId;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface RoomUpdate {
  session: RoomSession;
  events: RoomEvent[];
}

export interface RoomAccess {
  credentials: RoomCredentials;
  update: RoomUpdate;
}
