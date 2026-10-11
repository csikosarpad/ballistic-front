import { useGameStore } from "@/game/state/gameStore";
import { gameRef } from "./gameRef";

export function MainMenu() {
  const setScreen = useGameStore((s) => s.setScreen);

  const start = () => {
    gameRef.current?.restart();
    setScreen("playing");
  };

  const reset = () => {
    if (window.confirm("Biztosan törlöd az összes XP-t és fejlesztést?")) gameRef.current?.resetProgress();
  };

  return (
    <div className="overlay">
      <div className="panel">
        <h1>Ballistic Front</h1>
        <p>Két játékos, egy gép. Lődd ki az ellenfeled tankját!</p>
        <p>
          <small>◀ ▶ mozgás · csúszkák: szög és erő · szóköz: tűz</small>
        </p>
        <button className="btn" onClick={start}>
          Játék indítása
        </button>
        <br />
        <button className="btn secondary" onClick={reset}>
          Haladás törlése
        </button>
      </div>
    </div>
  );
}
