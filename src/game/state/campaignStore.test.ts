import { beforeEach, describe, expect, it, vi } from "vitest";

const key = "ballistic-front:campaign";

describe("campaign persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("starts at 0/1, persists completion and does not write it twice", async () => {
    const { useCampaignStore } = await import("./campaignStore");
    expect(useCampaignStore.getState().completed).toBe(false);
    const write = vi.spyOn(Storage.prototype, "setItem");
    useCampaignStore.getState().complete();
    useCampaignStore.getState().complete();
    expect(write).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual({ version: 1, completed: true });
    vi.resetModules();
    const reloaded = await import("./campaignStore");
    expect(reloaded.useCampaignStore.getState().completed).toBe(true);
  });

  it("resets only campaign completion, preserving profiles", async () => {
    const profiles = JSON.stringify({ version: 2, profiles: { P1: { xp: 350, levels: { armor: 2 } } } });
    localStorage.setItem("ballistic-front:profiles", profiles);
    const { useCampaignStore } = await import("./campaignStore");
    useCampaignStore.getState().complete();
    useCampaignStore.getState().reset();
    expect(useCampaignStore.getState().completed).toBe(false);
    expect(localStorage.getItem("ballistic-front:profiles")).toBe(profiles);
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual({ version: 1, completed: false });
  });

  it.each(["broken json", '{"version":99,"completed":true}', '{"version":1,"completed":"yes"}'])(
    "reports invalid saves without overwriting them: %s",
    async (text) => {
      localStorage.setItem(key, text);
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const { useCampaignStore } = await import("./campaignStore");
      expect(useCampaignStore.getState().error).toBe("campaign.loadError");
      useCampaignStore.getState().complete();
      expect(localStorage.getItem(key)).toBe(text);
      expect(log).toHaveBeenCalledOnce();
      useCampaignStore.getState().reset();
      expect(useCampaignStore.getState().error).toBeNull();
    },
  );

  it("surfaces write failure, then retries without an additional reward", async () => {
    const { useCampaignStore } = await import("./campaignStore");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("quota");
    });
    useCampaignStore.getState().complete();
    expect(useCampaignStore.getState()).toMatchObject({ completed: true, error: "campaign.saveError" });
    expect(localStorage.getItem(key)).toBeNull();
    expect(log).toHaveBeenCalledOnce();
    useCampaignStore.getState().complete();
    expect(write).toHaveBeenCalledTimes(2);
    expect(useCampaignStore.getState().error).toBeNull();
  });
});
