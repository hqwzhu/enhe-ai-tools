import Link from "next/link";
import { AdminSection } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";
import {
  adminMessageTypeLabels,
  countAdminMessagesByType,
  sortAdminMessages,
  type AdminMessage
} from "@/lib/admin-messages";

export default async function AdminMessagesPage() {
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
      title: `付款待审核：${proof.order.orderNo}`,
      content: `${proof.user.email ?? proof.user.phone ?? proof.userId} · ${proof.paymentMethod} · ${proof.createdAt.toLocaleString("zh-CN")}`,
      href: "/admin/payments",
      severity: "high" as const,
      createdAt: proof.createdAt
    })),
    ...pendingRefunds.map((refund) => ({
      id: `refund-${refund.id}`,
      type: "refund_pending" as const,
      title: `退款申请：${refund.order.orderNo}`,
      content: `${refund.requester?.email ?? refund.requester?.phone ?? "用户"} · ¥${Number(refund.amount).toFixed(2)} · ${refund.reason}`,
      href: `/admin/orders?q=${encodeURIComponent(refund.order.orderNo)}`,
      severity: "high" as const,
      createdAt: refund.createdAt
    })),
    ...uploadErrors.map((audit) => ({
      id: `audit-${audit.id}`,
      type: "upload_error" as const,
      title: audit.action === "file.upload.failed" ? "文件上传异常" : "文件删除清理异常",
      content: `${audit.summary} · ${audit.createdAt.toLocaleString("zh-CN")}`,
      href: "/admin/files",
      severity: audit.action === "file.delete.cos_failed" ? "high" as const : "medium" as const,
      createdAt: audit.createdAt
    })),
    ...expiringMemberships.map((membership) => ({
      id: `vip-${membership.id}`,
      type: "vip_expiring" as const,
      title: `VIP 即将到期：${membership.user.nickname ?? membership.user.email ?? membership.user.phone ?? membership.userId}`,
      content: `到期时间：${membership.endTime?.toLocaleString("zh-CN")}`,
      href: `/admin/users/${membership.userId}`,
      severity: "medium" as const,
      createdAt: membership.endTime ?? membership.updatedAt
    }))
  ];
  const sortedMessages = sortAdminMessages(messages);
  const counts = countAdminMessagesByType(messages);

  return (
    <AdminSection title="管理员消息中心" intro="集中查看待审核付款、退款申请、上传异常和 VIP 到期提醒，减少运营漏处理。">
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(adminMessageTypeLabels).map(([type, label]) => (
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
                {adminMessageTypeLabels[message.type]}
              </span>
            </div>
          </Link>
        )) : (
          <div className="glass rounded-2xl p-8 text-sm text-[#8B95A7]">当前没有待处理消息。</div>
        )}
      </div>
    </AdminSection>
  );
}
