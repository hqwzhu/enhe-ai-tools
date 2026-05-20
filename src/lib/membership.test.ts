import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  tx: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    membership: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    paymentProof: {
      updateMany: vi.fn()
    },
    toolPurchase: {
      upsert: vi.fn()
    },
    vipAdjustmentLog: {
      create: vi.fn()
    }
  },
  prisma: {
    $transaction: vi.fn()
  }
}));

vi.mock("@/lib/db", () => ({
  prisma: db.prisma
}));

describe("membership service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.prisma.$transaction.mockImplementation((callback: (tx: typeof db.tx) => unknown) => callback(db.tx));
    db.tx.order.update.mockImplementation(({ data }) => ({ id: "order-1", ...data }));
    db.tx.membership.create.mockImplementation(({ data }) => ({ id: "membership-1", ...data }));
    db.tx.membership.update.mockImplementation(({ data }) => ({ id: "membership-1", ...data }));
  });

  it("creates membership when a VIP order is approved", async () => {
    const { activateVipForOrder } = await import("@/lib/membership");
    db.tx.order.findUnique.mockResolvedValue({
      id: "order-1",
      userId: "user-1",
      planId: "plan-1",
      orderType: "vip",
      orderStatus: "pending_review",
      paidAt: null,
      plan: { id: "plan-1", name: "7天VIP", durationDays: 7 },
      paymentProof: null
    });
    db.tx.membership.findFirst.mockResolvedValue(null);

    await activateVipForOrder("order-1", "admin-1", "ok");

    expect(db.tx.membership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          planId: "plan-1",
          vipType: "7天VIP",
          isLifetime: false,
          status: "active"
        })
      })
    );
    expect(db.tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ orderStatus: "activated" }) })
    );
  });

  it("creates software purchase authorization when a paid software order is approved", async () => {
    const { activateVipForOrder } = await import("@/lib/membership");
    db.tx.order.findUnique.mockResolvedValue({
      id: "order-2",
      userId: "user-1",
      toolId: "tool-1",
      orderType: "software_download",
      orderStatus: "pending_review",
      paidAt: null,
      amount: 19,
      plan: null,
      paymentProof: null
    });

    await activateVipForOrder("order-2", "admin-1", "ok");

    expect(db.tx.toolPurchase.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_toolId: { userId: "user-1", toolId: "tool-1" } },
        create: expect.objectContaining({ userId: "user-1", toolId: "tool-1", orderId: "order-2" })
      })
    );
  });

  it("records an audit log when admin manually grants VIP", async () => {
    const { manuallyAdjustVip } = await import("@/lib/membership");
    db.tx.membership.findFirst.mockResolvedValue(null);

    await manuallyAdjustVip({
      userId: "user-1",
      adminId: "admin-1",
      actionType: "grant",
      vipType: "1个月VIP",
      durationDays: 30,
      reason: "线下补单"
    });

    expect(db.tx.membership.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-1", vipType: "1个月VIP" }) })
    );
    expect(db.tx.vipAdjustmentLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          adminId: "admin-1",
          actionType: "grant",
          reason: "线下补单"
        })
      })
    );
  });
});
