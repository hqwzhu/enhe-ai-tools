import { describe, expect, it } from "vitest";
import { canDownloadVipTool } from "@/lib/access-rules";

describe("access rules", () => {
  it("blocks ordinary users from downloading VIP software", () => {
    expect(canDownloadVipTool({ isVipRequired: true, hasVip: false })).toBe(false);
  });

  it("allows VIP users to download VIP software", () => {
    expect(canDownloadVipTool({ isVipRequired: true, hasVip: true })).toBe(true);
  });
});
