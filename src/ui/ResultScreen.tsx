import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useT } from "@/i18n";
import { gameRef } from "./gameRef";
import { Shop } from "./Shop";

/** Meccs végén: győztes, statisztika, bolt és továbblépés. */
export function ResultScreen() {
  const t = useT();
  const { winner, matchStats, setScreen } = useGameStore();
  const credentials = useMultiplayerStore((state) => state.credentials);
  const session = useMultiplayerStore((state) => state.session);
  const multiplayerError = useMultiplayerStore((state) => state.error);
  const onlineMatch = credentials !== null;
  const matchFinished = session?.status === "finished";

  return (
    <div className="overlay">
      <div className="panel">
        <h2 className="winner">{winner ? t("result.wins", { name: winner }) : t("result.draw")}</h2>
        <table className="stats">
          <thead>
            <tr>
              <th>{t("result.player")}</th>
              <th>{t("result.shots")}</th>
              <th>{t("result.damage")}</th>
              <th>{t("result.xp")}</th>
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
        {onlineMatch ? <Shop editablePlayerId={credentials.playerId} disabled={!matchFinished} /> : <Shop />}
        {onlineMatch && !matchFinished && <p role="status">{t("result.syncing")}</p>}
        {multiplayerError && onlineMatch && (
          <p className="lobby-error" role="alert">
            {multiplayerError}
          </p>
        )}
        <div style={{ marginTop: 12 }}>
          {!onlineMatch ? (
            <button className="btn" onClick={() => gameRef.current?.restart()}>
              {t("result.rematch")}
            </button>
          ) : credentials.playerId === "P1" ? (
            <button
              className="btn"
              disabled={!matchFinished}
              onClick={() => gameRef.current?.requestMultiplayerRematch()}
            >
              {t("result.rematch")}
            </button>
          ) : (
            <p role="status">{t("result.waitingRematch")}</p>
          )}
          <button
            className="btn secondary"
            onClick={() => {
              if (onlineMatch) useMultiplayerStore.getState().leave();
              setScreen("menu");
            }}
          >
            {t("result.mainMenu")}
          </button>
        </div>
      </div>
    </div>
  );
}
