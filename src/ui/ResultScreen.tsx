import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { gameRef } from "./gameRef";
import { Shop } from "./Shop";

/** Meccs végén: győztes, statisztika, bolt és továbblépés. */
export function ResultScreen() {
  const { winner, matchStats, setScreen } = useGameStore();
  const credentials = useMultiplayerStore((state) => state.credentials);
  const session = useMultiplayerStore((state) => state.session);
  const multiplayerError = useMultiplayerStore((state) => state.error);
  const onlineMatch = credentials !== null;
  const matchFinished = session?.status === "finished";

  return (
    <div className="overlay">
      <div className="panel">
        <h2 className="winner">{winner ? `${winner} nyert!` : "Döntetlen"}</h2>
        <table className="stats">
          <thead>
            <tr>
              <th>Játékos</th>
              <th>Lövés</th>
              <th>Sebzés</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(matchStats).map(([id, s]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{s.shots}</td>
                <td>{s.damage}</td>
                <td>+{s.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {onlineMatch ? (
          <Shop editablePlayerId={credentials.playerId} disabled={!matchFinished} />
        ) : (
          <Shop />
        )}
        {onlineMatch && !matchFinished && <p role="status">A meccs lezárása és az eredmény szinkronizálása…</p>}
        {multiplayerError && onlineMatch && <p className="lobby-error" role="alert">{multiplayerError}</p>}
        <div style={{ marginTop: 12 }}>
          {!onlineMatch ? (
            <button className="btn" onClick={() => gameRef.current?.restart()}>
              Visszavágó
            </button>
          ) : credentials.playerId === "P1" ? (
            <button className="btn" disabled={!matchFinished} onClick={() => gameRef.current?.requestMultiplayerRematch()}>
              Visszavágó
            </button>
          ) : (
            <p role="status">Várakozás a szoba létrehozójára a visszavágóhoz.</p>
          )}
          <button className="btn secondary" onClick={() => {
            if (onlineMatch) useMultiplayerStore.getState().leave();
            setScreen("menu");
          }}>
            Főmenü
          </button>
        </div>
      </div>
    </div>
  );
}
