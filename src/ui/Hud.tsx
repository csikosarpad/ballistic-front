import { useEffect } from "react";
import { MAX_ANGLE, MIN_ANGLE, MIN_POWER, useGameStore } from "@/game/state/gameStore";
import { gameRef } from "./gameRef";

export function Hud() {
  const { angle, power, maxPower, wind, phase, currentId, tanks, previewAvailable, previewActive, setAim } = useGameStore();
  const locked = phase !== "aiming";
  const me = tanks.find((t) => t.id === currentId);

  // Bal/jobb: mozgás, Ctrl+bal/jobb: szög (Shift: x5), fel/le: erő (Shift: x5), szóköz: tűz.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { phase, nudgePower, nudgeAngle } = useGameStore.getState();
      if (phase !== "aiming") return;
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
    <div style={{ position: "absolute", top: 12, left: 12, color: "#fff", font: "14px sans-serif" }}>
      <div>
        {tanks.map((t) => (
          <span key={t.id} style={{ marginRight: 12, fontWeight: t.id === currentId ? "bold" : "normal" }}>
            {t.id}: {t.hp}/{t.maxHp} HP
          </span>
        ))}
      </div>
      <div>Soron: {currentId} | Mozgás: {me?.moveLeft ?? 0}px | Szél: {wind}</div>
      <label>
        Szög: {angle}°
        <input type="range" min={MIN_ANGLE} max={MAX_ANGLE} value={angle} disabled={locked} onChange={(e) => setAim(+e.target.value, power)} />
      </label>
      <br />
      <label>
        Erő: {power}
        <input type="range" min={MIN_POWER} max={maxPower} value={power} disabled={locked} onChange={(e) => setAim(angle, +e.target.value)} />
      </label>
      <br />
      <button disabled={locked} onClick={() => gameRef.current?.move(-1)}>◀</button>
      <button disabled={locked} onClick={() => gameRef.current?.move(1)}>▶</button>
      <button disabled={locked} onClick={() => gameRef.current?.fire()}>Tűz!</button>
      <button disabled={locked || !previewAvailable} onClick={() => gameRef.current?.requestPreview()}>
        {previewActive ? "Röppálya (aktív)" : previewAvailable ? "Röppálya (T, 1x/meccs)" : "Röppálya (elhasználva)"}
      </button>
    </div>
  );
}
