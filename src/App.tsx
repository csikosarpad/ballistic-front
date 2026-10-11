import { useGameStore } from "@/game/state/gameStore";
import { GameCanvas } from "@/ui/GameCanvas";
import { Hud } from "@/ui/Hud";
import { MainMenu } from "@/ui/MainMenu";
import { ResultScreen } from "@/ui/ResultScreen";

export function App() {
  const screen = useGameStore((s) => s.screen);
  const phase = useGameStore((s) => s.phase);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <GameCanvas />
      {screen === "menu" && <MainMenu />}
      {screen === "playing" && (phase === "gameOver" ? <ResultScreen /> : <Hud />)}
    </div>
  );
}
