export const orderStatusLabels: Record<string, string> = {
  pending_payment: "待支付",
  pending_review: "待审核",
  paid: "已支付",
  activated: "已开通",
  rejected: "审核失败",
  cancelled: "已取消",
  refunded: "已退款"
};

export const proofStatusLabels: Record<string, string> = {
  not_submitted: "未提交",
  pending: "待审核",
  approved: "审核通过",
  rejected: "审核驳回"
};

export function getStatusLabel(map: Record<string, string>, status?: string | null) {
  if (!status) return "未提交";
  return map[status] ?? status;
}
