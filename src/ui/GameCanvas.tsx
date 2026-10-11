import { useEffect, useRef } from "react";
import { Game } from "@/game/engine/Game";
import { gameRef } from "./gameRef";

/** A Pixi canvas életciklusát kezeli; a játéklogika nem Reactben fut. */
export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = new Game();
    gameRef.current = game;
    void game.init(hostRef.current!);
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  return <div ref={hostRef} style={{ width: "100%", height: "100%" }} />;
}
