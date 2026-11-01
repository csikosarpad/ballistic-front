import type { Application, Container, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";
import type { HudFrame } from "../pixi/HudFrame";
import type { GlowLine } from "../pixi/GlowLine";
import { accentColor, PIXI_UI_THEME } from "../pixi/PixiUiTheme";
import type { ResultBackgroundEffects } from "../pixi/ResultBackgroundEffects";

interface ResultDecorCanvasProps {
  accent?: "cyan" | "gold" | "orange";
}

function drawGrid(graphics: Graphics, width: number, height: number) {
  const spacing = 32;

  for (let x = spacing; x < width; x += spacing) {
    graphics.moveTo(x, 0).lineTo(x, height);
  }
  for (let y = spacing; y < height; y += spacing) {
    graphics.moveTo(0, y).lineTo(width, y);
  }

  graphics.stroke({ color: PIXI_UI_THEME.colors.grid, alpha: PIXI_UI_THEME.alpha.grid, width: 1 });
}

function drawPanelFill(
  GraphicsClass: typeof Graphics,
  container: Container,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
) {
  const fill = new GraphicsClass()
    .roundRect(x, y, width, height, 12)
    .fill({ color: PIXI_UI_THEME.colors.panel, alpha: 0.22 });
  container.addChild(fill);

  const frame = new GraphicsClass()
    .roundRect(x, y, width, height, 12)
    .stroke({ color, alpha: 0.28, width: 1 });
  container.addChild(frame);
}

function drawVictoryFrame(
  GraphicsClass: typeof Graphics,
  HudFrameClass: typeof HudFrame,
  container: Container,
  width: number,
  color: number,
) {
  const bannerWidth = Math.min(540, width * 0.58);
  const bannerHeight = 78;
  const bannerX = (width - bannerWidth) / 2;
  const bannerY = 8;
  const banner = new HudFrameClass({
    width: bannerWidth,
    height: bannerHeight,
    color,
    alpha: 0.72,
    radius: 10,
  });
  banner.position.set(bannerX, bannerY);
  container.addChild(banner);

  const wing = new GraphicsClass()
    .moveTo(bannerX, bannerY + 22)
    .lineTo(bannerX - 42, bannerY + 8)
    .lineTo(bannerX - 24, bannerY + 38)
    .lineTo(bannerX - 52, bannerY + 48)
    .lineTo(bannerX, bannerY + 60)
    .stroke({ color, alpha: 0.62, width: 2 });
  container.addChild(wing);

  const mirroredWing = new GraphicsClass()
    .moveTo(width - bannerX, bannerY + 22)
    .lineTo(width - bannerX + 42, bannerY + 8)
    .lineTo(width - bannerX + 24, bannerY + 38)
    .lineTo(width - bannerX + 52, bannerY + 48)
    .lineTo(width - bannerX, bannerY + 60)
    .stroke({ color, alpha: 0.62, width: 2 });
  container.addChild(mirroredWing);
}

function drawDecorations(
  container: Container,
  width: number,
  height: number,
  accent: number,
  GraphicsClass: typeof Graphics,
  HudFrameClass: typeof HudFrame,
  GlowLineClass: typeof GlowLine,
  ResultBackgroundEffectsClass: typeof ResultBackgroundEffects,
  reducedMotion: boolean,
) {
  container.removeChildren().forEach((child) => child.destroy());

  const effects = new ResultBackgroundEffectsClass({
    width,
    height,
    accent,
    reducedMotion,
  });
  container.addChild(effects);

  const background = new GraphicsClass()
    .roundRect(1, 1, width - 2, height - 2, 18)
    .fill({ color: 0x041426, alpha: 0.18 });
  container.addChild(background);

  const grid = new GraphicsClass();
  drawGrid(grid, width, height);
  container.addChild(grid);

  const frame = new HudFrameClass({ width, height, color: accent });
  container.addChild(frame);

  const panelGap = 12;
  const panelY = 102;
  const panelHeight = Math.max(100, height - panelY - 14);
  const panelWidth = Math.max(100, (width - panelGap * 3) / 2);
  drawPanelFill(GraphicsClass, container, panelGap, panelY, panelWidth, panelHeight, PIXI_UI_THEME.colors.cyan);
  drawPanelFill(
    GraphicsClass,
    container,
    panelGap * 2 + panelWidth,
    panelY,
    panelWidth,
    panelHeight,
    PIXI_UI_THEME.colors.gold,
  );
  drawVictoryFrame(GraphicsClass, HudFrameClass, container, width, PIXI_UI_THEME.colors.gold);

  const headerLine = new GlowLineClass({
    x1: width * 0.2,
    y1: 76,
    x2: width * 0.8,
    y2: 76,
    color: accent,
    alpha: 0.24,
  });
  container.addChild(headerLine);

  return effects;
}

export function ResultDecorCanvas({ accent = "gold" }: ResultDecorCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.clientWidth === 0 || host.clientHeight === 0) return;

    let disposed = false;
    let app: Application | null = null;
    let disposePixi: (() => void) | undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    void Promise.all([
      import("pixi.js"),
      import("../pixi/HudFrame"),
      import("../pixi/GlowLine"),
      import("../pixi/ResultBackgroundEffects"),
    ]).then(([{ Application, Graphics }, { HudFrame }, { GlowLine }, { ResultBackgroundEffects }]) => {
      if (disposed) return;

      app = new Application();
      return app
        .init({
          antialias: true,
          backgroundAlpha: 0,
          resizeTo: host,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        })
        .then(() => {
          if (disposed || !app) {
            app?.destroy(false);
            return;
          }

          host.appendChild(app.canvas);
          let effects: ResultBackgroundEffects | undefined;
          const draw = () => {
            if (app) {
              if (effects && !reducedMotion) {
                app.ticker.remove(effects.update, effects);
              }
              effects = drawDecorations(
                app.stage,
                host.clientWidth,
                host.clientHeight,
                accentColor(accent),
                Graphics,
                HudFrame,
                GlowLine,
                ResultBackgroundEffects,
                reducedMotion,
              );
              if (!reducedMotion) {
                app.ticker.add(effects.update, effects);
              }
            }
          };

          draw();
          const observer = new ResizeObserver(draw);
          observer.observe(host);
          app.renderer.on("resize", draw);
          app.stage.eventMode = "none";
          disposePixi = () => {
            observer.disconnect();
            app?.renderer.off("resize", draw);
            if (effects && !reducedMotion) {
              app?.ticker.remove(effects.update, effects);
            }
          };

          return undefined;
        });
    });

    return () => {
      disposed = true;
      disposePixi?.();
      if (app) {
        app.canvas.remove();
        app.destroy(false);
      }
    };
  }, [accent]);

  return <div ref={hostRef} className="result-decor-canvas" aria-hidden="true" />;
}
