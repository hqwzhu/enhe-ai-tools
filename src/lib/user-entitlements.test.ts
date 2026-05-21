import { describe, expect, it } from "vitest";
import { buildUserToolEntitlements } from "@/lib/user-entitlements";

const softwareBase = {
  type: "software" as const,
  downloadFileId: "file-1",
  onlineUrl: null
};

const onlineBase = {
  type: "online" as const,
  downloadFileId: null,
  onlineUrl: "https://example.com"
};

describe("buildUserToolEntitlements", () => {
  it("requires both VIP and purchase for paid VIP software downloads", () => {
    const tools = [
      { ...softwareBase, id: "vip-paid", name: "VIP Paid", slug: "vip-paid", isVipRequired: true, isDownloadPaid: true },
      { ...softwareBase, id: "free", name: "Free", slug: "free", isVipRequired: false, isDownloadPaid: false }
    ];

    expect(buildUserToolEntitlements({ hasVip: false, purchasedToolIds: ["vip-paid"], tools }).downloadableSoftware.map((tool) => tool.id)).toEqual(["free"]);
    expect(buildUserToolEntitlements({ hasVip: true, purchasedToolIds: [], tools }).downloadableSoftware.map((tool) => tool.id)).toEqual(["free"]);
    expect(buildUserToolEntitlements({ hasVip: true, purchasedToolIds: ["vip-paid"], tools }).downloadableSoftware.map((tool) => tool.id)).toEqual(["vip-paid", "free"]);
  });

  it("lists purchased software separately even when it still needs VIP to download", () => {
    const tools = [
      { ...softwareBase, id: "vip-paid", name: "VIP Paid", slug: "vip-paid", isVipRequired: true, isDownloadPaid: true }
    ];

    const summary = buildUserToolEntitlements({ hasVip: false, purchasedToolIds: ["vip-paid"], tools });

    expect(summary.purchasedSoftware.map((tool) => tool.id)).toEqual(["vip-paid"]);
    expect(summary.downloadableSoftware).toHaveLength(0);
  });

  it("only exposes online tools the user can access", () => {
    const tools = [
      { ...onlineBase, id: "vip-online", name: "VIP Online", slug: "vip-online", isVipRequired: true, isDownloadPaid: false },
      { ...onlineBase, id: "free-online", name: "Free Online", slug: "free-online", isVipRequired: false, isDownloadPaid: false }
    ];

    expect(buildUserToolEntitlements({ hasVip: false, purchasedToolIds: [], tools }).availableOnlineTools.map((tool) => tool.id)).toEqual(["free-online"]);
    expect(buildUserToolEntitlements({ hasVip: true, purchasedToolIds: [], tools }).availableOnlineTools.map((tool) => tool.id)).toEqual(["vip-online", "free-online"]);
  });
});
