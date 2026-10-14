import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PlayerId, RoomEvent, RoomSession, RoomStatus } from "../multiplayer/protocol";

type Store = typeof import("./multiplayerStore").useMultiplayerStore;

interface FakeRoom {
  code: string;
  status: RoomStatus;
  revision: number;
  names: Record<PlayerId, string | null>;
  tokens: Record<PlayerId, string | null>;
  events: RoomEvent[];
}

/** A PHP API szabályait (revision, státuszátmenetek, host-only események) memóriában tükröző álszerver. */
function createFakeServer() {
  const rooms = new Map<string, FakeRoom>();
  let counter = 0;

  const session = (room: FakeRoom): RoomSession => ({
    code: room.code,
    status: room.status,
    revision: room.revision,
    setup: { seed: 42, starterIndex: 0 },
    players: { ...room.names },
  });
  const update = (room: FakeRoom, since: number) => ({
    session: session(room),
    events: room.events.filter((event) => event.revision > since),
  });
  const reply = (status: number, body: unknown) => Response.json(body, { status });
  const push = (room: FakeRoom, playerId: PlayerId, type: string, payload: Record<string, unknown>) => {
    room.revision += 1;
    room.events.push({ revision: room.revision, playerId, type, payload, createdAt: "now" });
  };

  const handler = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(String(input), "http://test");
    const method = init?.method ?? "GET";
    const path = url.pathname.replace(/^\/api/, "");
    const body = typeof init?.body === "string" ? (JSON.parse(init.body) as Record<string, unknown>) : {};
    const bearer = new Headers(init?.headers).get("Authorization")?.replace(/^Bearer /, "");

    if (method === "POST" && path === "/rooms") {
      const code = `ROOM${String(++counter).padStart(2, "0")}`;
      const token = `token-${code}-P1`;
      const room: FakeRoom = {
        code,
        status: "waiting",
        revision: 0,
        names: { P1: String(body.playerName), P2: null },
        tokens: { P1: token, P2: null },
        events: [],
      };
      rooms.set(code, room);
      return reply(201, { credentials: { roomCode: code, playerId: "P1", token }, update: update(room, 0) });
    }

    const match = /^\/rooms\/([A-Z0-9]{6})(\/join|\/events)?$/.exec(path);
    const room = match ? rooms.get(match[1]!) : undefined;
    if (!match || !room) return reply(404, { error: "Room not found." });

    if (match[2] === "/join" && method === "POST") {
      if (room.status !== "waiting") return reply(409, { error: "Room is no longer waiting." });
      const token = `token-${room.code}-P2`;
      room.names.P2 = String(body.playerName);
      room.tokens.P2 = token;
      room.status = "ready";
      push(room, "P2", "player_joined", { name: room.names.P2 });
      return reply(200, { credentials: { roomCode: room.code, playerId: "P2", token }, update: update(room, 0) });
    }

    const playerId = (["P1", "P2"] as const).find((id) => room.tokens[id] === bearer);
    if (!playerId) return reply(401, { error: "Unauthorized." });

    if (!match[2] && method === "GET") return reply(200, update(room, Number(url.searchParams.get("since") ?? 0)));

    if (match[2] === "/events" && method === "POST") {
      const type = String(body.type);
      const allowed: Record<string, RoomStatus[]> = {
        move: ["playing"],
        fire: ["playing"],
        upgrade_purchased: ["finished"],
        match_started: ["ready", "finished"],
        match_finished: ["playing"],
      };
      if (!allowed[type]?.includes(room.status))
        return reply(409, { error: "Event is not allowed in the current room status." });
      if ((type === "match_started" || type === "match_finished") && playerId !== "P1") {
        return reply(403, { error: "Only the host may send this event." });
      }
      if (room.revision !== body.expectedRevision)
        return reply(409, { error: "Room revision conflict. Refresh before retrying." });
      push(room, playerId, type, body.payload as Record<string, unknown>);
      if (type === "match_started") room.status = "playing";
      if (type === "match_finished") room.status = "finished";
      return reply(200, update(room, Number(body.expectedRevision)));
    }

    return reply(404, { error: "Endpoint not found." });
  };

  return { handler, rooms };
}

/** Két független klienst ad: a modul újratöltése külön store-példányt ad mindegyiknek. */
async function loadClient(): Promise<Store> {
  vi.resetModules();
  return (await import("./multiplayerStore")).useMultiplayerStore;
}

describe("két klienses multiplayer szinkron", () => {
  let server: ReturnType<typeof createFakeServer>;
  let host: Store;
  let guest: Store;

  beforeEach(async () => {
    server = createFakeServer();
    vi.stubGlobal("fetch", vi.fn(server.handler));
    sessionStorage.clear();
    host = await loadClient();
    guest = await loadClient();
  });

  afterEach(() => {
    host.getState().leave();
    guest.getState().leave();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  async function startMatch(): Promise<void> {
    await host.getState().create("Ada");
    await guest.getState().join(host.getState().credentials!.roomCode, "Grace");
    await host.getState().refresh();
    await host.getState().publish("match_started", { setup: { seed: 42, starterIndex: 0 }, profiles: {} });
    await guest.getState().refresh();
  }

  it("a csatlakozás után mindkét kliens ugyanazt a szobaállapotot látja", async () => {
    await host.getState().create("Ada");
    expect(host.getState().session?.status).toBe("waiting");

    await guest.getState().join(host.getState().credentials!.roomCode.toLowerCase(), "Grace");
    // A kliens nagybetűsíti a kódot, ezért a kisbetűs bevitel is csatlakozik.
    await host.getState().refresh();

    expect(guest.getState().credentials?.playerId).toBe("P2");
    for (const store of [host, guest]) {
      expect(store.getState().session).toMatchObject({
        status: "ready",
        revision: 1,
        players: { P1: "Ada", P2: "Grace" },
      });
      expect(store.getState().events.map((event) => event.type)).toEqual(["player_joined"]);
    }
  });

  it("a host indítása és a játékosok eseményei azonos sorrendben jutnak el mindkét klienshez", async () => {
    await startMatch();
    expect(guest.getState().session?.status).toBe("playing");

    await host.getState().publish("move", { direction: 1 });
    await host.getState().publish("fire", { angle: 45, power: 300 });
    await guest.getState().refresh();
    await guest.getState().publish("move", { direction: -1 });
    await host.getState().refresh();
    await guest.getState().refresh();

    const log = (store: Store) => store.getState().events.map((e) => `${e.revision}:${e.playerId}:${e.type}`);
    expect(log(host)).toEqual(log(guest));
    expect(log(host)).toEqual(["1:P2:player_joined", "2:P1:match_started", "3:P1:move", "4:P1:fire", "5:P2:move"]);
    expect(host.getState().session?.revision).toBe(5);
    expect(guest.getState().session?.revision).toBe(5);
  });

  it("az ütköző írás 409-et kap, majd frissítés után az esemény nem vész el és nem duplázódik", async () => {
    await startMatch();

    // A vendég elavult revisionnel ír: előbb a host ír, a vendég még nem kérte le.
    await host.getState().publish("move", { direction: 1 });
    await guest.getState().publish("move", { direction: -1 });

    expect(guest.getState().error).toContain("revision conflict");
    // A 409 után a kliens maga frissít, így a host eseménye megérkezik.
    await vi.waitFor(() =>
      expect(guest.getState().events.some((e) => e.type === "move" && e.playerId === "P1")).toBe(true),
    );
    expect(server.rooms.size).toBe(1);
    const room = [...server.rooms.values()][0]!;
    expect(room.events.filter((e) => e.type === "move")).toHaveLength(1);

    await guest.getState().publish("move", { direction: -1 });
    await host.getState().refresh();
    const revisions = host.getState().events.map((e) => e.revision);
    expect(revisions).toEqual([...new Set(revisions)].sort((a, b) => a - b));
    expect(host.getState().events).toEqual(guest.getState().events);
  });

  it("ismételt lekérdezés nem duplikál eseményt", async () => {
    await startMatch();
    await host.getState().publish("move", { direction: 1 });
    await guest.getState().refresh();
    const before = guest.getState().events;
    await guest.getState().refresh();
    await guest.getState().refresh();
    expect(guest.getState().events).toEqual(before);
  });

  it("csak a host indíthat és fejezhet be meccset, és csak a megfelelő állapotban lehet eseményt küldeni", async () => {
    await host.getState().create("Ada");
    await guest.getState().join(host.getState().credentials!.roomCode, "Grace");

    await guest.getState().publish("match_started", { setup: { seed: 1, starterIndex: 0 }, profiles: {} });
    expect(guest.getState().error).toBeTruthy();
    await host.getState().refresh();
    expect(host.getState().session?.status).toBe("ready");

    await host.getState().publish("move", { direction: 1 });
    expect(host.getState().error).toContain("not allowed");

    await host.getState().publish("match_started", { setup: { seed: 1, starterIndex: 0 }, profiles: {} });
    await guest.getState().refresh();
    await guest.getState().publish("match_finished", { winner: "P2" });
    expect(guest.getState().error).toBeTruthy();
    await host.getState().refresh();
    await host.getState().publish("match_finished", { winner: "P1" });
    await guest.getState().refresh();
    expect(guest.getState().session?.status).toBe("finished");
  });

  it("meccs után mindkét játékos fejleszthet, és a host visszavágót indíthat", async () => {
    await startMatch();
    await host.getState().publish("match_finished", { winner: "P1" });
    await guest.getState().refresh();

    await guest.getState().publish("upgrade_purchased", { upgradeId: "armor" });
    await host.getState().refresh();
    await host.getState().publish("match_started", { setup: { seed: 7, starterIndex: 1 }, profiles: {} });
    await guest.getState().refresh();

    expect(guest.getState().session?.status).toBe("playing");
    expect(host.getState().events).toEqual(guest.getState().events);
    expect(guest.getState().events.at(-1)).toMatchObject({ type: "match_started", payload: { setup: { seed: 7 } } });
  });

  it("a kliens új sessionStorage-ból visszaállítva a lekérdezést az elejéről indítja és ugyanazt az eseménynaplót kapja", async () => {
    await startMatch();
    await host.getState().publish("move", { direction: 1 });
    await guest.getState().refresh();
    const expected = guest.getState().events;

    const reconnected = await loadClient();
    expect(reconnected.getState().credentials).not.toBeNull();
    await reconnected.getState().refresh();

    const restored = reconnected.getState().credentials?.playerId;
    expect(["P1", "P2"]).toContain(restored);
    expect(reconnected.getState().events).toEqual(expected);
    reconnected.getState().leave();
  });
});
