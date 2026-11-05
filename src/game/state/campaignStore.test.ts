import { beforeEach, describe, expect, it, vi } from "vitest";

const key = "ballistic-front:campaign";

describe("campaign persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("starts at 0/5, persists completion and does not write it twice", async () => {
    const { useCampaignStore } = await import("./campaignStore");
    expect(useCampaignStore.getState().completedIds).toEqual([]);
    const write = vi.spyOn(Storage.prototype, "setItem");
    expect(useCampaignStore.getState().complete("alpha-01")).toEqual(["delta-08", "forge-17"]);
    expect(useCampaignStore.getState().complete("alpha-01")).toEqual([]);
    expect(write).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual({
      version: 2,
      contentVersion: 1,
      completedIds: ["alpha-01"],
      selectedId: "delta-08",
    });
    vi.resetModules();
    const reloaded = await import("./campaignStore");
    expect(reloaded.useCampaignStore.getState().completedIds).toEqual(["alpha-01"]);
  });

  it("resets only campaign completion, preserving profiles", async () => {
    const profiles = JSON.stringify({ version: 2, profiles: { P1: { xp: 350, levels: { armor: 2 } } } });
    localStorage.setItem("ballistic-front:profiles", profiles);
    const { useCampaignStore } = await import("./campaignStore");
    useCampaignStore.getState().complete("alpha-01");
    useCampaignStore.getState().reset();
    expect(useCampaignStore.getState().completedIds).toEqual([]);
    expect(localStorage.getItem("ballistic-front:profiles")).toBe(profiles);
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual({
      version: 2,
      contentVersion: 1,
      completedIds: [],
      selectedId: "alpha-01",
    });
  });

  it.each([
    "broken json",
    '{"version":99,"completed":true}',
    '{"version":1,"completed":"yes"}',
    '{"version":2,"contentVersion":99,"completedIds":[],"selectedId":"alpha-01"}',
    '{"version":2,"contentVersion":1,"completedIds":["unknown"],"selectedId":"alpha-01"}',
    '{"version":2,"contentVersion":1,"completedIds":["prime-00"],"selectedId":"prime-00"}',
    '{"version":2,"contentVersion":1,"completedIds":[],"selectedId":"prime-00"}',
    '{"version":2,"contentVersion":1,"completedIds":["alpha-01","alpha-01"],"selectedId":"alpha-01"}',
  ])("reports invalid saves without overwriting them: %s", async (text) => {
    localStorage.setItem(key, text);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { useCampaignStore } = await import("./campaignStore");
    expect(useCampaignStore.getState().error).toBe("campaign.loadError");
    useCampaignStore.getState().complete("alpha-01");
    expect(useCampaignStore.getState().select("alpha-01")).toBe(false);
    expect(localStorage.getItem(key)).toBe(text);
    expect(log).toHaveBeenCalledOnce();
    useCampaignStore.getState().reset();
    expect(useCampaignStore.getState().error).toBeNull();
  });

  it("surfaces write failure, then retries without an additional reward", async () => {
    const { useCampaignStore } = await import("./campaignStore");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("quota");
    });
    useCampaignStore.getState().complete("alpha-01");
    expect(useCampaignStore.getState()).toMatchObject({ completedIds: ["alpha-01"], error: "campaign.saveError" });
    expect(localStorage.getItem(key)).toBeNull();
    expect(log).toHaveBeenCalledOnce();
    expect(useCampaignStore.getState().complete("alpha-01")).toEqual([]);
    expect(write).toHaveBeenCalledTimes(2);
    expect(useCampaignStore.getState().error).toBeNull();
  });

  it.each([true, false])("migrates v1 completion %s without inventing other sector wins", async (completed) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, completed }));
    localStorage.setItem("ballistic-front:profiles", "untouched");
    const { useCampaignStore } = await import("./campaignStore");
    expect(useCampaignStore.getState().completedIds).toEqual(completed ? ["alpha-01"] : []);
    expect(useCampaignStore.getState().selectedId).toBe(completed ? "delta-08" : "alpha-01");
    expect(JSON.parse(localStorage.getItem(key)!).version).toBe(2);
    expect(localStorage.getItem("ballistic-front:profiles")).toBe("untouched");
  });

  it("keeps migrated progress in-session if writing v2 fails, and retries", async () => {
    localStorage.setItem(key, '{"version":1,"completed":true}');
    vi.spyOn(console, "error").mockImplementation(() => {});
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("quota");
    });
    const { useCampaignStore } = await import("./campaignStore");
    expect(useCampaignStore.getState()).toMatchObject({ completedIds: ["alpha-01"], error: "campaign.saveError" });
    expect(useCampaignStore.getState().complete("alpha-01")).toEqual([]);
    expect(write).toHaveBeenCalledTimes(2);
    expect(useCampaignStore.getState().error).toBeNull();
  });

  it.each(["delta-08", "forge-17"] as const)(
    "allows either branch, PRIME at 4/5, and the skipped branch afterwards: %s",
    async (branch) => {
      const { useCampaignStore } = await import("./campaignStore");
      const store = useCampaignStore.getState();
      store.complete("alpha-01");
      expect(store.complete(branch)).toEqual(["vanguard-12"]);
      expect(store.complete("vanguard-12")).toEqual(["prime-00"]);
      expect(store.complete("prime-00")).toEqual([]);
      expect(useCampaignStore.getState().completedIds).toHaveLength(4);
      const other = branch === "delta-08" ? "forge-17" : "delta-08";
      expect(store.select(other)).toBe(true);
      expect(store.complete(other)).toEqual([]);
      expect(useCampaignStore.getState().completedIds).toHaveLength(5);
      vi.resetModules();
      const loaded = await import("./campaignStore");
      expect(loaded.useCampaignStore.getState().completedIds).toHaveLength(5);
    },
  );

  it("blocks locked operations in both selection and completion", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { useCampaignStore } = await import("./campaignStore");
    expect(useCampaignStore.getState().select("prime-00")).toBe(false);
    expect(useCampaignStore.getState().complete("prime-00")).toEqual([]);
    expect(useCampaignStore.getState().completedIds).toEqual([]);
    expect(log).toHaveBeenCalledTimes(2);
  });
});
