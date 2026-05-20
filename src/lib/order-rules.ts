import type { OrderStatus } from "@prisma/client";

export const userCancellableOrderStatuses = ["pending_payment", "pending_review", "rejected"] as const;
export const adminDeleteRiskConfirmationToken = "DELETE_ACTIVATED_ORDER";

export function canUserCancelOrder(status: OrderStatus) {
  return userCancellableOrderStatuses.includes(status as (typeof userCancellableOrderStatuses)[number]);
}

export function canAdminDeleteOrderSafely(status: OrderStatus) {
  return status !== "activated" && status !== "paid" && status !== "refunded";
}

export function isAdminDeleteRiskConfirmed(value: string | null | undefined) {
  return value === adminDeleteRiskConfirmationToken;
}

export function assertAdminOrderStatusUpdateAllowed(status: OrderStatus) {
  if (status === "activated") {
    throw new Error("订单不能通过手动改状态开通权益，请使用支付审核通过或手动调整 VIP 功能。");
  }
}
