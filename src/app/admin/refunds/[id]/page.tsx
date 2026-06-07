import Link from "next/link";
import { notFound } from "next/navigation";
import { processRefundRecordAdminAction } from "@/app/admin/actions";
import { AdminSection, Field, SubmitButton, inputClass, textareaClass } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";
import { getRefundRecordActorLabel } from "@/lib/order-rules";
import { getStatusLabel, orderStatusLabels, refundStatusLabels } from "@/lib/status-labels";
import { formatCurrency } from "@/lib/utils";

type AdminRefundDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminRefundDetailPage({ params, searchParams }: AdminRefundDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const refund = await prisma.orderRefundRecord.findUnique({
    where: { id },
    include: {
      admin: true,
      requester: true,
      order: {
        include: {
          user: true,
          plan: true,
          tool: true,
          toolPurchase: true,
          paymentProof: true
        }
      }
    }
  });
  if (!refund) notFound();

  const scopedToolFilter = refund.order.toolId ? { toolId: refund.order.toolId } : {};
  const [downloadCount, usageCount, activeMembership] = await Promise.all([
    prisma.downloadLog.count({ where: { userId: refund.order.userId, ...scopedToolFilter } }),
    prisma.toolUsageLog.count({ where: { userId: refund.order.userId, ...scopedToolFilter } }),
    prisma.membership.findFirst({
      where: {
        userId: refund.order.userId,
        status: "active",
        OR: [{ isLifetime: true }, { endTime: { gt: new Date() } }]
      },
      orderBy: [{ isLifetime: "desc" }, { endTime: "desc" }]
    })
  ]);

  return (
    <AdminSection title="Refund detail" intro="Review the refund request, store refund proof, and revoke related entitlements when the refund is completed.">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/admin/refunds" className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:border-[#48F5D3]/50 hover:text-[#48F5D3]">
          Back to refunds
        </Link>
        <Link href={`/admin/orders/${refund.orderId}`} className="rounded-full border border-[#48F5D3]/30 px-4 py-2 text-sm text-[#48F5D3]">
          View order
        </Link>
      </div>

      {query.processed ? (
        <p className="mb-5 rounded-xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-3 text-sm text-[#48F5D3]">
          Refund decision saved. Entitlements were synchronized according to the selected status.
        </p>
      ) : null}

      <div className="glass rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Info label="Order number" value={refund.order.orderNo} />
          <Info label="Order status" value={getStatusLabel(orderStatusLabels, refund.order.orderStatus)} />
          <Info label="Refund status" value={getStatusLabel(refundStatusLabels, refund.status)} />
          <Info label="User" value={refund.order.user.email ?? refund.order.user.phone ?? refund.order.user.id} />
          <Info label="Item" value={refund.order.plan?.name ?? refund.order.tool?.name ?? "Order item"} />
          <Info label="Refund amount" value={formatCurrency(refund.amount.toString())} />
          <Info label="Created by" value={getRefundRecordActorLabel({ adminEmail: refund.admin?.email, requesterEmail: refund.requester?.email })} />
          <Info label="Created at" value={refund.createdAt.toLocaleString("en-US")} />
          <Info label="Completed at" value={refund.completedAt?.toLocaleString("en-US") ?? "-"} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Reason" value={refund.reason} />
          <Info label="Receiver QR / receiver info" value={refund.refundReceiverQr ?? "Not submitted"} />
          <Info label="Refund proof" value={refund.refundProofImage ?? "Not submitted"} />
          <Info label="Review note" value={refund.note ?? "-"} />
        </div>

        <div className="mt-6 rounded-2xl border border-[#FFB86B]/25 bg-[#FFB86B]/10 p-4 text-sm leading-6 text-[#FFD6A5]">
          <p className="font-semibold text-[#FFB86B]">Entitlement second check</p>
          <p className="mt-2">
            Download logs: {downloadCount}. Online usage logs: {usageCount}. Active VIP:{" "}
            {activeMembership ? `${activeMembership.vipType} / ${activeMembership.isLifetime ? "Lifetime" : activeMembership.endTime?.toLocaleString("en-US") ?? "-"}` : "None"}.
          </p>
          <p className="mt-1">
            If the status is changed to Refunded, the system revokes the related active VIP membership or software purchase entitlement again.
          </p>
        </div>

        {refund.status === "pending" ? (
          <form action={processRefundRecordAdminAction} className="mt-6 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2">
            <input type="hidden" name="refundId" value={refund.id} />
            <Field label="Refund proof URL">
              <input name="refundProofImage" placeholder="Receipt screenshot, transfer confirmation, or transaction URL" className={inputClass} />
            </Field>
            <Field label="Review note">
              <input name="note" placeholder="Refund transaction id, communication note, or rejection reason" className={inputClass} />
            </Field>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <SubmitButton name="status" value="completed" variant="success" pendingLabel="Processing..." className="px-5 py-3 text-sm">
                Mark refunded and revoke access
              </SubmitButton>
              <SubmitButton name="status" value="rejected" variant="secondary" pendingLabel="Processing..." className="px-5 py-3 text-sm">
                Reject refund
              </SubmitButton>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2">
            <Field label="Refund proof URL">
              <input defaultValue={refund.refundProofImage ?? ""} className={inputClass} disabled />
            </Field>
            <Field label="Review note">
              <textarea defaultValue={refund.note ?? ""} className={textareaClass} disabled />
            </Field>
            <div className="text-sm text-[#8B95A7] md:col-span-2">This refund record has already been processed and cannot be reviewed again.</div>
          </div>
        )}
      </div>
    </AdminSection>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-[#8B95A7]">{label}</p>
      <p className="mt-2 break-all font-semibold text-[#E8EEF8]">{value}</p>
    </div>
  );
}
