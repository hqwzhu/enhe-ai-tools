import { describe, expect, it } from "vitest";
import { canAccessVipTool, canDownloadVipTool } from "@/lib/access-rules";

describe("access rules", () => {
  it("blocks ordinary users from downloading VIP software", () => {
    expect(canDownloadVipTool({ isVipRequired: true, hasVip: false })).toBe(false);
  });

  it("allows VIP users to download VIP software", () => {
    expect(canDownloadVipTool({ isVipRequired: true, hasVip: true })).toBe(true);
  });

  it("uses the same VIP gate for online tool usage", () => {
    expect(canAccessVipTool({ isVipRequired: true, hasVip: false })).toBe(false);
    expect(canAccessVipTool({ isVipRequired: true, hasVip: true })).toBe(true);
    expect(canAccessVipTool({ isVipRequired: false, hasVip: false })).toBe(true);
  });
});
