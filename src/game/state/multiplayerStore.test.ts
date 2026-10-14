import { afterEach, describe, expect, it, vi } from "vitest";
import { useMultiplayerStore } from "./multiplayerStore";

const waitingRoom = {
  credentials: { roomCode: "AB12CD", playerId: "P1" as const, token: "secret" },
  update: {
    session: {
      code: "AB12CD",
      status: "waiting" as const,
      revision: 0,
      setup: { seed: 42, starterIndex: 0 },
      players: { P1: "Ada", P2: null },
    },
    events: [],
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
  useMultiplayerStore.getState().leave();
});

describe("multiplayer store", () => {
  it("stores room credentials for this browser session and merges polled events", async () => {
    const readyUpdate = {
      session: {
        ...waitingRoom.update.session,
        status: "ready" as const,
        revision: 1,
        players: { P1: "Ada", P2: "Grace" },
      },
      events: [
        { revision: 1, playerId: "P2" as const, type: "player_joined", payload: { name: "Grace" }, createdAt: "now" },
      ],
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(waitingRoom))
      .mockResolvedValueOnce(Response.json(readyUpdate));
    vi.stubGlobal("fetch", fetchMock);

    await useMultiplayerStore.getState().create("Ada");
    expect(sessionStorage.getItem("ballistic-front:multiplayer-session")).toContain("AB12CD");
    await useMultiplayerStore.getState().refresh();

    expect(useMultiplayerStore.getState().session).toMatchObject({ status: "ready", revision: 1 });
    expect(useMultiplayerStore.getState().events).toEqual(readyUpdate.events);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/rooms/AB12CD?since=0");
  });
});
