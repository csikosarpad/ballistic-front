import { useEffect } from "react";
import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { GameCanvas } from "@/ui/GameCanvas";
import { Hud } from "@/ui/Hud";
import { MainMenu } from "@/ui/main-menu/MainMenu";
import { ResultScreen } from "@/ui/ResultScreen";
import { CampaignMap } from "@/ui/CampaignMap";

export function App() {
  const screen = useGameStore((s) => s.screen);
  const phase = useGameStore((s) => s.phase);
  const credentials = useMultiplayerStore((s) => s.credentials);
  const refreshRoom = useMultiplayerStore((s) => s.refresh);

  useEffect(() => {
    if (!credentials) return;
    let active = true;
    let timeout: number;
    const poll = async () => {
      await refreshRoom();
      if (active) timeout = window.setTimeout(() => void poll(), 1000);
    };
    void poll();
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [credentials, refreshRoom]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <GameCanvas />
      {screen === "menu" && <MainMenu />}
      {screen === "campaignMap" && <CampaignMap />}
      {screen === "playing" && (phase === "gameOver" ? <ResultScreen /> : <Hud />)}
    </div>
  );
}
