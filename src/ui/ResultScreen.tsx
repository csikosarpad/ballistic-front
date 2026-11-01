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
        <table className="stats" cellPadding={0} cellSpacing={0} border={0}>
            {/* <colgroup>
              <col width="25%" />
              <col width="15%" />
              <col width="15%" />
              <col width="15%" />
            </colgroup> */}
          <thead>
            <tr>
              <th colSpan={4}>
                <div className="grid grid-flow-col gap-2">                  
                  <span className="col-wide">{t("result.player")}</span>
                  <span className="col-narrow">{t("result.shots")}</span>
                  <span className="col-narrow">{t("result.damage")}</span>
                  <span className="col-narrow">{t("result.xp")}</span>
                </div>
              </th>
              {/* <th align="left">{t("result.shots")}</th>
              <th>{t("result.damage")}</th>
              <th align="left">{t("result.xp")}</th> */}
            </tr>
          </thead>
          <tbody>
            {Object.entries(matchStats).map(([id, s]) => (
              <tr key={id}>
                <td colSpan={4} align="left">
                  <div className="grid grid-flow-col gap-2">
                    <span><u>{id}</u>:</span>
                    <span>{s.shots}</span>
                    <span>{s.damage}</span>
                    <span>+{s.xp}</span>
                  </div>
                </td>
                {/* <td>{s.shots}</td>
                <td>{s.damage}</td>
                <td align="left">+{s.xp}</td> */}
              </tr>
            ))}
          </tbody>
        
          <tbody className="shop">
            {onlineMatch ? <Shop editablePlayerId={credentials.playerId} disabled={!matchFinished} /> : <Shop />}
          </tbody>
        </table>
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
