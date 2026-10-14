import { useEffect, useRef, useState } from "react";
import type { MatchSetup } from "@/game/systems/seededRandom";
import type { Profile } from "@/game/systems/upgrades";
import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";

interface MultiplayerLobbyProps {
  onBack: () => void;
  onStartMatch: (setup: MatchSetup, profiles: Record<string, Profile>, revision: number) => void;
}

export function MultiplayerLobby({ onBack, onStartMatch }: MultiplayerLobbyProps) {
  const credentials = useMultiplayerStore((state) => state.credentials);
  const session = useMultiplayerStore((state) => state.session);
  const events = useMultiplayerStore((state) => state.events);
  const busy = useMultiplayerStore((state) => state.busy);
  const error = useMultiplayerStore((state) => state.error);
  const create = useMultiplayerStore((state) => state.create);
  const join = useMultiplayerStore((state) => state.join);
  const publish = useMultiplayerStore((state) => state.publish);
  const leave = useMultiplayerStore((state) => state.leave);
  const [playerName, setPlayerName] = useState("Player");
  const [roomCode, setRoomCode] = useState("");
  const startedRevision = useRef<number | null>(null);

  useEffect(() => {
    if (!credentials || !session || !["playing", "finished"].includes(session.status)) {
      if (!credentials) startedRevision.current = null;
      return;
    }
    const startEvent = events.filter((event) => event.type === "match_started").at(-1);
    if (!startEvent || startedRevision.current === startEvent.revision) return;
    const profiles = startEvent.payload.profiles;
    if (!profiles || typeof profiles !== "object") return;
    const setup = startEvent.payload.setup;
    startedRevision.current = startEvent.revision;
    onStartMatch(
      setup && typeof setup === "object" ? (setup as MatchSetup) : session.setup,
      profiles as Record<string, Profile>,
      startEvent.revision,
    );
  }, [credentials, events, onStartMatch, session]);

  const back = () => {
    if (credentials) leave();
    onBack();
  };

  const startMatch = () => {
    if (!session) return;
    void publish("match_started", { setup: session.setup, profiles: useGameStore.getState().profiles });
  };

  return (
    <div className="panel multiplayer-panel">
      <h2>Online multiplayer</h2>
      {!credentials || !session ? (
        <>
          <label className="lobby-field">
            Játékosnév
            <input maxLength={24} value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
          </label>
          <button className="btn" disabled={busy || !playerName.trim()} onClick={() => void create(playerName.trim())}>
            Szoba létrehozása
          </button>
          <div className="lobby-divider" />
          <label className="lobby-field">
            Szobakód
            <input
              autoCapitalize="characters"
              maxLength={6}
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            />
          </label>
          <button
            className="btn secondary"
            disabled={busy || !playerName.trim() || roomCode.trim().length !== 6}
            onClick={() => void join(roomCode, playerName.trim())}
          >
            Csatlakozás
          </button>
        </>
      ) : (
        <div className="lobby-room" aria-live="polite">
          <p className="lobby-code-label">Szobakód</p>
          <strong className="lobby-code">{session.code}</strong>
          <p>{session.status === "waiting" ? "Várakozás a másik játékosra…" : "Mindkét játékos csatlakozott."}</p>
          <p className="lobby-players">
            {session.players.P1 ?? "P1: várakozik"} <span>vs.</span> {session.players.P2 ?? "P2: várakozik"}
          </p>
          {session.status === "ready" && credentials.playerId === "P1" && (
            <button className="btn" disabled={busy} onClick={startMatch}>
              Meccs indítása
            </button>
          )}
          {session.status === "ready" && credentials.playerId === "P2" && (
            <small>Várakozás a szoba létrehozójára…</small>
          )}
          {session.status === "playing" && <small>Meccs indítása…</small>}
          {session.status === "finished" && <small>A lezárt meccs visszaállítása…</small>}
        </div>
      )}
      {error && (
        <p className="lobby-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn secondary" onClick={back}>
        Vissza
      </button>
    </div>
  );
}
