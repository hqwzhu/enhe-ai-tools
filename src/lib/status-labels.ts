export const orderStatusLabels: Record<string, string> = {
  pending_payment: "Pending payment",
  pending_review: "Pending review",
  paid: "Paid",
  activated: "Activated",
  rejected: "Rejected",
  cancelled: "Cancelled",
  refunded: "Refunded"
};

export const proofStatusLabels: Record<string, string> = {
  not_submitted: "Not submitted",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected"
};

export const refundStatusLabels: Record<string, string> = {
  pending: "Pending",
  completed: "Refunded",
  rejected: "Rejected"
};

export function getStatusLabel(map: Record<string, string>, status?: string | null) {
  if (!status) return "Not submitted";
  return map[status] ?? status;
}
