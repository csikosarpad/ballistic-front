import type { RoomAccess, RoomCredentials, RoomUpdate } from "./protocol";

export class MultiplayerApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "MultiplayerApiError";
  }
}

function endpoint(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...(init?.body === undefined ? {} : { "Content-Type": "application/json" }), ...init?.headers },
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new MultiplayerApiError(body.error ?? `HTTP ${response.status}`, response.status);
  return body;
}

export async function createRoom(baseUrl: string, playerName: string): Promise<RoomAccess> {
  return request(endpoint(baseUrl, "/rooms"), {
    method: "POST",
    body: JSON.stringify({ playerName }),
  });
}

export async function joinRoom(baseUrl: string, roomCode: string, playerName: string): Promise<RoomAccess> {
  return request(endpoint(baseUrl, `/rooms/${encodeURIComponent(roomCode)}/join`), {
    method: "POST",
    body: JSON.stringify({ playerName }),
  });
}

export async function fetchRoom(
  baseUrl: string,
  credentials: RoomCredentials,
  sinceRevision: number,
): Promise<RoomUpdate> {
  const query = new URLSearchParams({ since: String(sinceRevision) });
  return request(endpoint(baseUrl, `/rooms/${encodeURIComponent(credentials.roomCode)}?${query}`), {
    headers: { Authorization: `Bearer ${credentials.token}` },
  });
}

export async function appendRoomEvent(
  baseUrl: string,
  credentials: RoomCredentials,
  expectedRevision: number,
  type: string,
  payload: Record<string, unknown>,
): Promise<RoomUpdate> {
  return request(endpoint(baseUrl, `/rooms/${encodeURIComponent(credentials.roomCode)}/events`), {
    method: "POST",
    headers: { Authorization: `Bearer ${credentials.token}` },
    body: JSON.stringify({ expectedRevision, type, payload }),
  });
}
