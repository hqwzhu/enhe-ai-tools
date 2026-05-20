import { describe, expect, it } from "vitest";
import { assertAdminOrderStatusUpdateAllowed, canAdminDeleteOrderSafely, canUserCancelOrder } from "@/lib/order-rules";

describe("order business rules", () => {
  it("allows users to cancel only pending or rejected orders", () => {
    expect(canUserCancelOrder("pending_payment")).toBe(true);
    expect(canUserCancelOrder("pending_review")).toBe(true);
    expect(canUserCancelOrder("rejected")).toBe(true);
    expect(canUserCancelOrder("paid")).toBe(false);
    expect(canUserCancelOrder("activated")).toBe(false);
    expect(canUserCancelOrder("refunded")).toBe(false);
  });

  it("blocks admin status edits that would bypass entitlement activation", () => {
    expect(() => assertAdminOrderStatusUpdateAllowed("activated")).toThrow("不能通过手动改状态");
    expect(() => assertAdminOrderStatusUpdateAllowed("cancelled")).not.toThrow();
  });

  it("marks activated, paid, and refunded orders as risky to delete", () => {
    expect(canAdminDeleteOrderSafely("activated")).toBe(false);
    expect(canAdminDeleteOrderSafely("paid")).toBe(false);
    expect(canAdminDeleteOrderSafely("refunded")).toBe(false);
    expect(canAdminDeleteOrderSafely("cancelled")).toBe(true);
  });
});
