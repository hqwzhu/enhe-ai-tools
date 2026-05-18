import { prisma } from "@/lib/db";

export async function getActiveMembership(userId: string) {
  const now = new Date();
  return prisma.membership.findFirst({
    where: {
      userId,
      status: "active",
      OR: [{ isLifetime: true }, { endTime: { gt: now } }]
    },
    include: { plan: true },
    orderBy: [{ isLifetime: "desc" }, { endTime: "desc" }]
  });
}

export async function userHasVip(userId?: string | null) {
  if (!userId) return false;
  return Boolean(await getActiveMembership(userId));
}

export function calculateMembershipEnd(durationDays: number, start = new Date()) {
  if (durationDays <= 0) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + durationDays);
  return end;
}

export async function activateVipForOrder(orderId: string, reviewerId?: string, reviewNote?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { plan: true, paymentProof: true }
    });
    if (!order) throw new Error("订单不存在");
    if (order.orderStatus === "activated") return order;

    const start = new Date();
    const end = calculateMembershipEnd(order.plan.durationDays, start);

    await tx.membership.create({
      data: {
        userId: order.userId,
        planId: order.planId,
        vipType: order.plan.name,
        startTime: start,
        endTime: end,
        isLifetime: order.plan.durationDays <= 0,
        status: "active"
      }
    });

    await tx.paymentProof.updateMany({
      where: { orderId },
      data: {
        reviewStatus: "approved",
        reviewerId,
        reviewedAt: start,
        reviewNote
      }
    });

    return tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "activated",
        paidAt: order.paidAt ?? start,
        activatedAt: start
      }
    });
  });
}
