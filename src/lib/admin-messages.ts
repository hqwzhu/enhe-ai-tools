export type AdminMessageType = "payment_review" | "refund_pending" | "upload_error" | "vip_expiring";
export type AdminMessageSeverity = "high" | "medium" | "low";

export type AdminMessage = {
  id: string;
  type: AdminMessageType;
  title: string;
  content?: string;
  href: string;
  severity: AdminMessageSeverity;
  createdAt: Date;
};

const severityRank: Record<AdminMessageSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1
};

const messageTypes: AdminMessageType[] = ["payment_review", "refund_pending", "upload_error", "vip_expiring"];

export const adminMessageTypeLabels: Record<AdminMessageType, string> = {
  payment_review: "待审核付款",
  refund_pending: "退款申请",
  upload_error: "异常上传",
  vip_expiring: "VIP 到期"
};

export function sortAdminMessages(messages: AdminMessage[]) {
  return [...messages].sort(
    (left, right) =>
      severityRank[right.severity] - severityRank[left.severity] || right.createdAt.getTime() - left.createdAt.getTime()
  );
}

export function countAdminMessagesByType(messages: AdminMessage[]) {
  return messageTypes.reduce<Record<AdminMessageType, number>>((counts, type) => {
    counts[type] = messages.filter((message) => message.type === type).length;
    return counts;
  }, {} as Record<AdminMessageType, number>);
}
