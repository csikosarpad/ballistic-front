import { useEffect, type CSSProperties } from "react";
import { MAX_ANGLE, MIN_ANGLE, MIN_POWER, useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useT } from "@/i18n";
import { gameRef } from "./gameRef";

const toCss = (color?: number) => (color === undefined ? "#ffffff" : `#${color.toString(16).padStart(6, "0")}`);

export function Hud() {
  const t = useT();
  const {
    angle,
    power,
    maxPower,
    wind,
    phase,
    currentId,
    canControl,
    tanks,
    previewAvailable,
    previewActive,
    muted,
    toggleMuted,
    setAim,
  } = useGameStore();
  const online = useMultiplayerStore((state) => state.credentials !== null);
  const multiplayerError = useMultiplayerStore((state) => state.error);
  const locked = phase !== "aiming" || !canControl;
  const me = tanks.find((t) => t.id === currentId);

  // Bal/jobb: mozgás, Ctrl+bal/jobb: szög (Shift: x5), fel/le: erő (Shift: x5), szóköz: tűz.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { phase, canControl, nudgePower, nudgeAngle } = useGameStore.getState();
      if (e.key === "m" || e.key === "M") {
        useGameStore.getState().toggleMuted();
        return;
      }
      if (phase !== "aiming" || !canControl) return;
      const step = e.shiftKey ? 50 : 10;
      const angleStep = e.shiftKey ? 5 : 1;
      switch (e.key) {
        case "ArrowLeft":
          // A 0° jobbra, a 180° balra mutat: balra forgatás növeli a szöget.
          if (e.ctrlKey) nudgeAngle(angleStep);
          else gameRef.current?.move(-1);
          break;
        case "ArrowRight":
          if (e.ctrlKey) nudgeAngle(-angleStep);
          else gameRef.current?.move(1);
          break;
        case "ArrowUp":
          nudgePower(step);
          break;
        case "ArrowDown":
          nudgePower(-step);
          break;
        case "t":
        case "T":
          gameRef.current?.requestPreview();
          break;
        case " ":
          gameRef.current?.fire();
          break;
        default:
          return;
      }
      // Megakadályozza, hogy a fókuszban lévő csúszó vagy az oldal is reagáljon.
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="hud"
      style={{
        ...({ "--accent": toCss(me?.color) } as CSSProperties),
        position: "absolute",
        top: 12,
        left: 12,
        color: "#fff",
        font: "14px sans-serif",
      }}
    >
      <div>
        {tanks.map((unit) => (
          <span
            key={unit.id}
            style={{ marginRight: 12, color: toCss(unit.color), fontWeight: unit.id === currentId ? "bold" : "normal" }}
          >
            {unit.id}: {unit.hp}/{unit.maxHp} HP
            {unit.maxShield > 0 && ` · ${t("hud.shield")} ${unit.shield}/${unit.maxShield}`}
            {unit.armor > 0 && ` · ${t("hud.armor")} ${Math.round(unit.armor * 100)}%`}
          </span>
        ))}
      </div>
      <div>
        {t("hud.turn")} <strong style={{ color: toCss(me?.color) }}>{currentId}</strong> |{" "}
        {t("hud.move", { value: me?.moveLeft ?? 0 })} | {t("hud.wind")} {wind}
      </div>
      {online && (
        <div role={multiplayerError ? "alert" : "status"}>
          {multiplayerError ??
            (phase === "flying"
              ? t("hud.shotInFlight")
              : canControl
                ? t("hud.yourTurn")
                : t("hud.opponentTurn", { id: currentId }))}
        </div>
      )}
      <label>
        {t("hud.angle", { value: angle })}
        <input
          type="range"
          min={MIN_ANGLE}
          max={MAX_ANGLE}
          value={angle}
          disabled={locked}
          onChange={(e) => setAim(+e.target.value, power)}
        />
      </label>
      <br />
      <label>
        {t("hud.power", { value: power })}
        <input
          type="range"
          min={MIN_POWER}
          max={maxPower}
          value={power}
          disabled={locked}
          onChange={(e) => setAim(angle, +e.target.value)}
        />
      </label>
      <br />
      <button disabled={locked} onClick={() => gameRef.current?.move(-1)}>
        ◀
      </button>
      <button disabled={locked} onClick={() => gameRef.current?.move(1)}>
        ▶
      </button>
      <button disabled={locked} onClick={() => gameRef.current?.fire()}>
        {t("hud.fire")}
      </button>
      <button disabled={locked || !previewAvailable} onClick={() => gameRef.current?.requestPreview()}>
        {previewActive ? t("hud.previewActive") : previewAvailable ? t("hud.previewAvailable") : t("hud.previewUsed")}
      </button>
      <button onClick={toggleMuted}>{t("hud.sound", { state: muted ? t("hud.soundOff") : t("hud.soundOn") })}</button>
    </div>
  );
}
