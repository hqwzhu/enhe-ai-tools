import type { OrderStatus } from "@prisma/client";

export function getOrderTimestampPatch(
  status: OrderStatus,
  paidAt: Date | null,
  activatedAt: Date | null
) {
  const now = new Date();

  if (status === "activated") {
    return {
      paidAt: paidAt ?? now,
      activatedAt: activatedAt ?? now
    };
  }

  if (status === "paid") {
    return {
      paidAt: paidAt ?? now
    };
  }

  return {};
}
