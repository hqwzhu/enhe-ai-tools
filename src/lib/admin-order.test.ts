import { describe, expect, it } from "vitest";
import { getOrderTimestampPatch } from "@/lib/admin-order";

describe("getOrderTimestampPatch", () => {
  it("sets paidAt for paid orders", () => {
    expect(getOrderTimestampPatch("paid", null, null).paidAt).toBeInstanceOf(Date);
  });

  it("sets paidAt and activatedAt for activated orders", () => {
    const patch = getOrderTimestampPatch("activated", null, null);

    expect(patch.paidAt).toBeInstanceOf(Date);
    expect(patch.activatedAt).toBeInstanceOf(Date);
  });

  it("keeps existing timestamps", () => {
    const paidAt = new Date("2026-01-01T00:00:00Z");
    const activatedAt = new Date("2026-01-02T00:00:00Z");

    expect(getOrderTimestampPatch("activated", paidAt, activatedAt)).toEqual({ paidAt, activatedAt });
  });

  it("does not set timestamps for cancelled orders", () => {
    expect(getOrderTimestampPatch("cancelled", null, null)).toEqual({});
  });
});
