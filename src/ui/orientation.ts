type LockableOrientation = ScreenOrientation & { lock?: (orientation: string) => Promise<void> };

/**
 * Érintőeszközön teljes képernyőre vált és fekvő tájolást kér. A böngészők ezt csak felhasználói
 * gesztusból engedik, és az iOS Safari egyáltalán nem támogatja; hiba esetén a tipp marad.
 */
export async function requestLandscape(): Promise<void> {
  if (typeof window.matchMedia !== "function" || !window.matchMedia("(pointer: coarse)").matches) return;
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    await (screen.orientation as LockableOrientation | undefined)?.lock?.("landscape");
  } catch {
    // Nem támogatott vagy megtagadott: a játék álló módban is használható marad.
  }
}
