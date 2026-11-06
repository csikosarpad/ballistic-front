import { useEffect, useRef } from "react";
import type { CampaignStarfield } from "./pixi/CampaignStarfield";

export function CampaignStarfieldCanvas({ warpSequence = 0 }: { warpSequence?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<CampaignStarfield | null>(null);
  const warpStartedRef = useRef<number | null>(null);

  useEffect(() => {
    if (warpSequence === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const now = performance.now();
    warpStartedRef.current = now;
    fieldRef.current?.triggerWarp(now);
  }, [warpSequence]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function init(host: HTMLDivElement) {
      try {
        const [{ Application }, { CampaignStarfield }] = await Promise.all([
          import("pixi.js"),
          import("./pixi/CampaignStarfield"),
        ]);
        if (disposed) return;
        const app = new Application();
        await app.init({
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
          autoStart: false,
          preference: "webgl",
        });
        if (disposed) {
          app.destroy({ removeView: true }, { children: true });
          return;
        }

        cleanup = () => app.destroy({ removeView: true }, { children: true });
        const field = new CampaignStarfield();
        fieldRef.current = field;
        if (warpStartedRef.current !== null) field.triggerWarp(warpStartedRef.current);
        app.stage.addChild(field);
        app.stage.eventMode = "none";
        app.ticker.maxFPS = 30;
        app.ticker.add((ticker) => field.update(ticker.deltaMS / 1000));

        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const syncAnimation = () => {
          if (document.hidden || motion.matches) {
            field.stopWarp();
            app.stop();
          } else {
            app.start();
          }
          app.render();
        };
        const resize = () => {
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          app.renderer.resize(width, height);
          field.resize(width, height);
          app.render();
        };
        const observer = new ResizeObserver(resize);
        cleanup = () => {
          fieldRef.current = null;
          observer.disconnect();
          motion.removeEventListener("change", syncAnimation);
          document.removeEventListener("visibilitychange", syncAnimation);
          delete host.dataset.ready;
          app.destroy({ removeView: true }, { children: true });
        };
        observer.observe(host);
        motion.addEventListener("change", syncAnimation);
        document.addEventListener("visibilitychange", syncAnimation);
        host.appendChild(app.canvas);
        resize();
        host.dataset.ready = "true";
        syncAnimation();
      } catch (error) {
        cleanup?.();
        cleanup = undefined;
        if (!disposed) console.error("Campaign starfield initialization failed; retaining CSS background.", error);
      }
    }

    void init(host);
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div ref={hostRef} className="campaign-starfield" aria-hidden="true" />;
}
