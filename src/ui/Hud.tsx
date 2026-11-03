import { useEffect, useState, type CSSProperties } from "react";
import { PowerDial, UnitGauge } from "./gauges";
import { MAX_ANGLE, MIN_ANGLE, MIN_POWER, useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useT } from "@/i18n";
import { gameRef } from "./gameRef";
import { RepeatButton } from "./RepeatButton";
import { WindIndicator } from "./WindIndicator";

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
    previewRemaining,
    previewActive,
    muted,
    toggleMuted,
    setAim,
  } = useGameStore();
  const online = useMultiplayerStore((state) => state.credentials !== null);
  const multiplayerError = useMultiplayerStore((state) => state.error);
  const locked = phase !== "aiming" || !canControl;
  const me = tanks.find((t) => t.id === currentId);
  // Érintőeszközön a billentyűkre utaló jelzések fölöslegesek.
  const touch = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  const soundState = muted ? t("hud.soundOff") : t("hud.soundOn");
  const soundLabel = t(touch ? "hud.soundTouch" : "hud.sound", { state: soundState });
  const [hintDismissed, setHintDismissed] = useState(false);

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
      className="hud battle-hud"
      style={{
        ...({ "--accent": toCss(me?.color) } as CSSProperties),
        color: "#fff",
        font: "600 15px var(--bf-font-data)",
      }}
    >
      <div className="hud-top">
        {tanks.map((unit) => (
          <section
            key={unit.id}
            className={`hud-unit hud-unit-${unit.id.toLowerCase()}${unit.id === currentId ? " is-active" : ""}`}
            style={{ "--unit-accent": toCss(unit.color) } as CSSProperties}
            aria-label={unit.id}
          >
            <div className="hud-unit-heading">
              <span style={{ fontWeight: unit.id === currentId ? "bold" : "normal" }}>
                {unit.id}: {unit.hp}/{unit.maxHp} HP
              </span>
            </div>
            <div className="hud-unit-meters">
              <UnitGauge
                hp={unit.hp}
                maxHp={unit.maxHp}
                shield={unit.shield}
                maxShield={unit.maxShield}
                armor={unit.armor}
                maxArmor={unit.maxArmor}
                labels={{ hp: "HP", shield: t("hud.shield"), armor: t("hud.armor") }}
              />
            </div>
          </section>
        ))}
        <div className="hud-top-center">
          <WindIndicator wind={wind} />
          <div className="hud-readout">
            {t("hud.turn")} <strong style={{ color: toCss(me?.color) }}>{currentId}</strong>
            <span aria-hidden="true">·</span>
            {t("hud.move", { value: me?.moveLeft ?? 0 })}
          </div>
          {online && (
            <div className="hud-status-message" role={multiplayerError ? "alert" : "status"}>
              {multiplayerError ??
                (phase === "flying"
                  ? t("hud.shotInFlight")
                  : canControl
                    ? t("hud.yourTurn")
                    : t("hud.opponentTurn", { id: currentId }))}
            </div>
          )}
        </div>
      </div>
      <div className="hud-command-dock">
        <div className="hud-controls">
          <div className="hud-control">
            <span id="hud-angle-label">{t("hud.angle", { value: angle })}</span>
            <div className="hud-stepper">
              <RepeatButton
                className="hud-step"
                aria-label={t("hud.angleDown")}
                disabled={locked}
                onPress={() => useGameStore.getState().nudgeAngle(-1)}
              >
                −
              </RepeatButton>
              <input
                type="range"
                aria-labelledby="hud-angle-label"
                min={MIN_ANGLE}
                max={MAX_ANGLE}
                value={angle}
                disabled={locked}
                onChange={(e) => setAim(+e.target.value, power)}
              />
              <RepeatButton
                className="hud-step"
                aria-label={t("hud.angleUp")}
                disabled={locked}
                onPress={() => useGameStore.getState().nudgeAngle(1)}
              >
                +
              </RepeatButton>
            </div>
          </div>
          <div className="hud-control">
            <div className="hud-control-label">
              <span id="hud-power-label">{t("hud.power", { value: power })}</span>
              <PowerDial value={power} min={MIN_POWER} max={maxPower} />
            </div>
            <div className="hud-stepper">
              <RepeatButton
                className="hud-step"
                aria-label={t("hud.powerDown")}
                disabled={locked}
                onPress={() => useGameStore.getState().nudgePower(-10)}
              >
                −
              </RepeatButton>
              <input
                type="range"
                aria-labelledby="hud-power-label"
                min={MIN_POWER}
                max={maxPower}
                value={power}
                disabled={locked}
                onChange={(e) => setAim(angle, +e.target.value)}
              />
              <RepeatButton
                className="hud-step"
                aria-label={t("hud.powerUp")}
                disabled={locked}
                onPress={() => useGameStore.getState().nudgePower(10)}
              >
                +
              </RepeatButton>
            </div>
          </div>
        </div>
        <div className="hud-actions">
          <RepeatButton
            aria-label={t("hud.moveLeft")}
            title={t("hud.moveLeft")}
            disabled={locked}
            intervalMs={140}
            onPress={() => gameRef.current?.move(-1)}
          >
            <span className="hud-action-icon" aria-hidden="true">
              ◀
            </span>
            <span>{t("hud.moveLeft")}</span>
          </RepeatButton>
          <RepeatButton
            aria-label={t("hud.moveRight")}
            title={t("hud.moveRight")}
            disabled={locked}
            intervalMs={140}
            onPress={() => gameRef.current?.move(1)}
          >
            <span className="hud-action-icon" aria-hidden="true">
              ▶
            </span>
            <span>{t("hud.moveRight")}</span>
          </RepeatButton>
          <button
            aria-pressed={previewActive}
            disabled={locked || !previewAvailable}
            onClick={() => gameRef.current?.requestPreview()}
          >
            <span className="hud-action-icon" aria-hidden="true">
              ⌖
            </span>
            <span>
              {previewActive
                ? t("hud.previewActive")
                : previewAvailable
                  ? t(touch ? "hud.previewAvailableTouch" : "hud.previewAvailable", { value: previewRemaining })
                  : t("hud.previewUsed")}
            </span>
          </button>
          <button className="hud-fire-button" disabled={locked} onClick={() => gameRef.current?.fire()}>
            <span className="hud-action-icon" aria-hidden="true">
              ➤
            </span>
            <span>{t("hud.fire")}</span>
          </button>
          <button aria-pressed={!muted} onClick={toggleMuted} title={soundLabel}>
            <span className="hud-action-icon" aria-hidden="true">
              ♫
            </span>
            <span>{soundLabel}</span>
          </button>
        </div>
      </div>
      {!hintDismissed && (
        <div className="orientation-hint" role="note">
          <span>{t("hud.rotateHint")}</span>
          <button onClick={() => setHintDismissed(true)}>{t("hud.rotateHintDismiss")}</button>
        </div>
      )}
    </div>
  );
}
