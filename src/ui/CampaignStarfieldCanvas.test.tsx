import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render as renderComponent, waitFor } from "@testing-library/react";
import { Application } from "pixi.js";
import { CampaignStarfieldCanvas } from "./CampaignStarfieldCanvas";

vi.mock("pixi.js", () => {
  const init = vi.fn<() => Promise<void>>();
  const destroy = vi.fn();
  return {
    Application: class {
      canvas = document.createElement("canvas");
      stage = { addChild: vi.fn(), eventMode: "auto" };
      ticker = { add: vi.fn(), maxFPS: 0 };
      renderer = { resize: vi.fn() };
      init = init;
      destroy = destroy;
      render = vi.fn();
      start = vi.fn();
      stop = vi.fn();
    },
  };
});

const app = new Application();
const pixi = {
  init: vi.mocked(app.init),
  destroy: vi.mocked(app.destroy),
  disconnect: vi.fn(),
};

vi.mock("./pixi/CampaignStarfield", () => ({
  CampaignStarfield: class {
    resize = vi.fn();
    update = vi.fn();
    triggerWarp = vi.fn();
    stopWarp = vi.fn();
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  pixi.init.mockResolvedValue(undefined);
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal("ResizeObserver", class {
    observe = vi.fn();
    disconnect = pixi.disconnect;
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CampaignStarfieldCanvas lifecycle", () => {
  it("only destroys its own renderer when the campaign map closes", async () => {
    const { container, unmount } = renderComponent(<CampaignStarfieldCanvas />);
    await waitFor(() => expect(container.querySelector("canvas")).not.toBeNull());
    unmount();
    expect(pixi.disconnect).toHaveBeenCalledOnce();
    expect(pixi.destroy).toHaveBeenCalledExactlyOnceWith({ removeView: true }, { children: true });
  });

  it("cleans up a late initialization without releasing another canvas's global resources", async () => {
    let finishInit!: () => void;
    pixi.init.mockImplementation(() => new Promise<void>((resolve) => {
      finishInit = resolve;
    }));
    const { container, unmount } = renderComponent(<CampaignStarfieldCanvas />);
    await waitFor(() => expect(pixi.init).toHaveBeenCalledOnce());
    unmount();
    expect(pixi.destroy).not.toHaveBeenCalled();
    await act(async () => finishInit());
    expect(pixi.destroy).toHaveBeenCalledExactlyOnceWith({ removeView: true }, { children: true });
    expect(container.querySelector("canvas")).toBeNull();
  });
});
