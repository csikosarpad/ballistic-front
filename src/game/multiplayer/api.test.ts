import { afterEach, describe, expect, it, vi } from "vitest";
import { appendRoomEvent, createRoom, fetchRoom, joinRoom } from "./api";
import type { RoomAccess } from "./protocol";

const access: RoomAccess = {
  credentials: { roomCode: "AB12CD", playerId: "P1", token: "secret" },
  update: {
    session: {
      code: "AB12CD",
      status: "waiting",
      revision: 0,
      setup: { seed: 42, starterIndex: 0 },
      players: { P1: "Ada", P2: null },
    },
    events: [],
  },
};

afterEach(() => vi.unstubAllGlobals());

describe("multiplayer API", () => {
  it("creates a room with the configured base URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(access));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createRoom("https://game.example/api/", "Ada")).resolves.toEqual(access);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://game.example/api/rooms",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ playerName: "Ada" }),
      }),
    );
  });

  it("supports the production API path under the game subdirectory", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(access));
    vi.stubGlobal("fetch", fetchMock);

    await createRoom("https://delawer.hu/ballistic-front/api", "Ada");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://delawer.hu/ballistic-front/api/rooms",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("encodes a room code and authenticates incremental polling", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(access.update));
    vi.stubGlobal("fetch", fetchMock);

    await fetchRoom("/api", { ...access.credentials, roomCode: "A B" }, 4);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/rooms/A%20B?since=4",
      expect.objectContaining({
        headers: { Authorization: "Bearer secret" },
      }),
    );
  });

  it("posts join and revision-checked events", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(access));
    vi.stubGlobal("fetch", fetchMock);

    await joinRoom("/api", "AB12CD", "Grace");
    await appendRoomEvent("/api", access.credentials, 3, "move", { direction: -1 });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/rooms/AB12CD/join");
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      method: "POST",
      headers: { Authorization: "Bearer secret" },
      body: JSON.stringify({ expectedRevision: 3, type: "move", payload: { direction: -1 } }),
    });
  });

  it("returns API errors with their HTTP status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Room is full" }, { status: 409 })));

    await expect(joinRoom("/api", "AB12CD", "Grace")).rejects.toMatchObject({
      message: "Room is full",
      status: 409,
    });
  });
});
