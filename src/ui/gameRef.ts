import type { Game } from "@/game/engine/Game";

/** A UI így éri el az engine-t (pl. lövés gomb) anélkül, hogy Reactből futtatná a logikát. */
export const gameRef: { current: Game | null } = { current: null };
