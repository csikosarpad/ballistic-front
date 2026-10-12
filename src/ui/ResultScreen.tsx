import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { gameRef } from "./gameRef";
import { Shop } from "./Shop";

/** Meccs végén: győztes, statisztika, bolt és továbblépés. */
export function ResultScreen() {
  const { winner, matchStats, setScreen } = useGameStore();
  const onlineMatch = useMultiplayerStore((state) => state.credentials !== null);

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
        {!onlineMatch && <Shop />}
        <div style={{ marginTop: 12 }}>
          {!onlineMatch && (
            <button className="btn" onClick={() => gameRef.current?.restart()}>
              Visszavágó
            </button>
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
