import { describe, expect, it } from "vitest";
import { canAccessVipTool, canDownloadVipTool } from "@/lib/access-rules";
import { canUserCancelOrder } from "@/lib/order-rules";

describe("critical commercial flow rules", () => {
  it("keeps order cancellation limited to non-final states", () => {
    expect(canUserCancelOrder("pending_payment")).toBe(true);
    expect(canUserCancelOrder("pending_review")).toBe(true);
    expect(canUserCancelOrder("rejected")).toBe(true);
    expect(canUserCancelOrder("paid")).toBe(false);
    expect(canUserCancelOrder("activated")).toBe(false);
    expect(canUserCancelOrder("refunded")).toBe(false);
  });

  it("blocks ordinary users from paid VIP download and online usage gates", () => {
    expect(canDownloadVipTool({ isVipRequired: true, hasVip: false })).toBe(false);
    expect(canAccessVipTool({ isVipRequired: true, hasVip: false })).toBe(false);
  });

  it("allows VIP users through download and online usage gates", () => {
    expect(canDownloadVipTool({ isVipRequired: true, hasVip: true })).toBe(true);
    expect(canAccessVipTool({ isVipRequired: true, hasVip: true })).toBe(true);
  });
});
