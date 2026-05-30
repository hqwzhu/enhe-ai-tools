import Link from "next/link";
import { AdminSection } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";
import {
  countAdminMessagesByType,
  getAdminMessageTypeLabels,
  sortAdminMessages,
  type AdminMessage
} from "@/lib/admin-messages";
import { getCurrentLocale } from "@/lib/i18n";

export default async function AdminMessagesPage() {
  const locale = await getCurrentLocale();
  const labels = getAdminMessageTypeLabels(locale);
  const copy = messageCopy[locale];
  const dateLocale = locale === "en" ? "en-US" : "zh-CN";
  const now = new Date();
  const vipExpiringSoon = new Date(now);
  vipExpiringSoon.setDate(vipExpiringSoon.getDate() + 7);

  const [pendingProofs, pendingRefunds, uploadErrors, expiringMemberships] = await Promise.all([
    prisma.paymentProof.findMany({
      where: { reviewStatus: "pending" },
      include: { order: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.orderRefundRecord.findMany({
      where: { status: "pending" },
      include: { order: true, requester: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.adminAuditLog.findMany({
      where: { action: { in: ["file.upload.failed", "file.delete.cos_failed", "file.delete.local_failed"] } },
      include: { admin: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.membership.findMany({
      where: { status: "active", isLifetime: false, endTime: { gte: now, lte: vipExpiringSoon } },
      include: { user: true },
      orderBy: { endTime: "asc" },
      take: 20
    })
  ]);

  const messages: AdminMessage[] = [
    ...pendingProofs.map((proof) => ({
      id: `proof-${proof.id}`,
      type: "payment_review" as const,
      title: copy.paymentReviewTitle.replace("{orderNo}", proof.order.orderNo),
      content: `${proof.user.email ?? proof.user.phone ?? proof.userId} · ${proof.paymentMethod} · ${proof.createdAt.toLocaleString(dateLocale)}`,
      href: "/admin/payments",
      severity: "high" as const,
      createdAt: proof.createdAt
    })),
    ...pendingRefunds.map((refund) => ({
      id: `refund-${refund.id}`,
      type: "refund_pending" as const,
      title: copy.refundTitle.replace("{orderNo}", refund.order.orderNo),
      content: `${refund.requester?.email ?? refund.requester?.phone ?? copy.userFallback} · ¥${Number(refund.amount).toFixed(2)} · ${refund.reason}`,
      href: `/admin/orders?q=${encodeURIComponent(refund.order.orderNo)}`,
      severity: "high" as const,
      createdAt: refund.createdAt
    })),
    ...uploadErrors.map((audit) => ({
      id: `audit-${audit.id}`,
      type: "upload_error" as const,
      title: audit.action === "file.upload.failed" ? copy.uploadFailedTitle : copy.fileCleanupFailedTitle,
      content: `${localizeAuditSummary(audit.summary, locale)} · ${audit.createdAt.toLocaleString(dateLocale)}`,
      href: "/admin/files",
      severity: audit.action === "file.delete.cos_failed" ? "high" as const : "medium" as const,
      createdAt: audit.createdAt
    })),
    ...expiringMemberships.map((membership) => ({
      id: `vip-${membership.id}`,
      type: "vip_expiring" as const,
      title: copy.vipExpiringTitle.replace("{user}", membership.user.nickname ?? membership.user.email ?? membership.user.phone ?? membership.userId),
      content: copy.expiresAt.replace("{date}", membership.endTime?.toLocaleString(dateLocale) ?? "-"),
      href: `/admin/users/${membership.userId}`,
      severity: "medium" as const,
      createdAt: membership.endTime ?? membership.updatedAt
    }))
  ];
  const sortedMessages = sortAdminMessages(messages);
  const counts = countAdminMessagesByType(messages);

  return (
    <AdminSection title={copy.title} intro={copy.intro}>
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(labels).map(([type, label]) => (
          <div key={type} className="glass rounded-2xl p-5">
            <p className="text-sm text-[#8B95A7]">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#48F5D3]">{counts[type as keyof typeof counts]}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {sortedMessages.length ? sortedMessages.map((message) => (
          <Link key={message.id} href={message.href} className="glass block rounded-2xl p-5 transition hover:border-[#48F5D3]/40 hover:bg-[#48F5D3]/8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#E8EEF8]">{message.title}</p>
                {message.content ? <p className="mt-2 text-sm leading-6 text-[#8B95A7]">{message.content}</p> : null}
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${
                message.severity === "high"
                  ? "border-[#FFB86B]/30 bg-[#FFB86B]/10 text-[#FFB86B]"
                  : message.severity === "medium"
                    ? "border-[#7AA7FF]/30 bg-[#7AA7FF]/10 text-[#9BBCFF]"
                    : "border-white/10 bg-white/5 text-[#8B95A7]"
              }`}>
                {labels[message.type]}
              </span>
            </div>
          </Link>
        )) : (
          <div className="glass rounded-2xl p-8 text-sm text-[#8B95A7]">{copy.empty}</div>
        )}
      </div>
    </AdminSection>
  );
}

const messageCopy = {
  zh: {
    title: "管理员消息中心",
    intro: "集中查看待审核付款、退款申请、上传异常和 VIP 到期提醒，减少运营漏处理。",
    paymentReviewTitle: "付款待审核：{orderNo}",
    refundTitle: "退款申请：{orderNo}",
    uploadFailedTitle: "文件上传异常",
    fileCleanupFailedTitle: "文件删除清理异常",
    vipExpiringTitle: "VIP 即将到期：{user}",
    expiresAt: "到期时间：{date}",
    userFallback: "用户",
    empty: "当前没有待处理消息。"
  },
  en: {
    title: "Admin message center",
    intro: "Review pending payments, refund requests, upload issues, and VIP expiry reminders in one place.",
    paymentReviewTitle: "Payment pending review: {orderNo}",
    refundTitle: "Refund request: {orderNo}",
    uploadFailedTitle: "File upload issue",
    fileCleanupFailedTitle: "File cleanup issue",
    vipExpiringTitle: "VIP expiring soon: {user}",
    expiresAt: "Expires at: {date}",
    userFallback: "User",
    empty: "No pending messages."
  }
} as const;

function localizeAuditSummary(summary: string, locale: "zh" | "en") {
  if (locale === "zh") return summary;
  if (summary.includes("File upload failed before creating file record")) {
    return "File upload failed before creating a file record";
  }
  return summary
    .replace("文件记录已删除，但远程/物理文件清理失败", "File record was deleted, but remote or physical cleanup failed")
    .replace("上传失败", "Upload failed");
}
