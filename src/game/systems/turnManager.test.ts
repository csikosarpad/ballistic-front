import { describe, expect, it } from "vitest";
import { TurnManager } from "./turnManager";

describe("TurnManager", () => {
  it("lövés közben zárolja a bemenetet", () => {
    const tm = new TurnManager(["a", "b"]);
    expect(tm.inputLocked).toBe(false);
    expect(tm.fire()).toBe(true);
    expect(tm.inputLocked).toBe(true);
    expect(tm.fire()).toBe(false);
  });

  it("a lövés végén a következő játékos jön", () => {
    const tm = new TurnManager(["a", "b"]);
    tm.fire();
    tm.endShot(["a", "b"]);
    expect(tm.current).toBe("b");
    expect(tm.phase).toBe("aiming");
  });

  it("kiesett játékost átugrik", () => {
    const tm = new TurnManager(["a", "b", "c"]);
    tm.fire();
    tm.endShot(["a", "c"]);
    expect(tm.current).toBe("c");
  });

  it("megadott játékossal kezdődik, és onnan halad tovább", () => {
    const tm = new TurnManager(["a", "b"], 1);
    expect(tm.current).toBe("b");
    tm.fire();
    tm.endShot(["a", "b"]);
    expect(tm.current).toBe("a");
  });

  it("az utolsó túlélő nyer", () => {
    const tm = new TurnManager(["a", "b"]);
    tm.fire();
    tm.endShot(["a"]);
    expect(tm.phase).toBe("gameOver");
    expect(tm.winner).toBe("a");
  });
});
