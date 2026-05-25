import Link from "next/link";
import { AdminSection, inputClass, selectClass } from "@/app/admin/admin-ui";
import { buildAdminRefundPageHref, buildAdminRefundWhere, parseAdminRefundListParams } from "@/lib/admin-list";
import { prisma } from "@/lib/db";
import { refundStatusLabels, getStatusLabel } from "@/lib/status-labels";
import { formatCurrency } from "@/lib/utils";

const refundStatusOptions = [
  ["pending", "Pending"],
  ["completed", "Refunded"],
  ["rejected", "Rejected"]
] as const;

type AdminRefundsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminRefundsPage({ searchParams }: AdminRefundsPageProps) {
  const params = await searchParams;
  const filters = parseAdminRefundListParams(params);
  const where = buildAdminRefundWhere(filters);
  const [refunds, total] = await Promise.all([
    prisma.orderRefundRecord.findMany({
      where,
      include: {
        admin: true,
        requester: true,
        order: { include: { user: true, plan: true, tool: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: filters.skip,
      take: filters.take
    }),
    prisma.orderRefundRecord.count({ where })
  ]);
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));

  return (
    <AdminSection
      title="Refund review"
      intro="Review user refund requests and backend after-sales records. Approved refunds revoke related VIP or software entitlements and record completion data."
    >
      <form className="glass mb-5 grid gap-3 rounded-2xl p-5 md:grid-cols-[1fr_220px_auto]" action="/admin/refunds">
        <input name="q" defaultValue={filters.q} placeholder="Search order, user, reason, or receiver info" className={inputClass} />
        <select name="status" defaultValue={filters.status ?? ""} className={selectClass}>
          <option value="">All statuses</option>
          {refundStatusOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-[#E8EEF8]">Filter</button>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#8B95A7]">
        <span>
          {total} refund records, page {filters.page} / {pageCount}
        </span>
        <div className="flex gap-2">
          <Link
            href={buildAdminRefundPageHref(filters, filters.page - 1)}
            aria-disabled={filters.page <= 1}
            className={`rounded-full border border-white/12 px-4 py-2 ${filters.page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            Previous
          </Link>
          <Link
            href={buildAdminRefundPageHref(filters, filters.page + 1)}
            aria-disabled={filters.page >= pageCount}
            className={`rounded-full border border-white/12 px-4 py-2 ${filters.page >= pageCount ? "pointer-events-none opacity-40" : ""}`}
          >
            Next
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/12 bg-white/6">
        <div className="grid min-w-[1120px] grid-cols-[1.15fr_1fr_0.95fr_0.65fr_0.7fr_0.85fr_0.55fr] gap-4 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-wide text-[#8B95A7]">
          <span>Order</span>
          <span>User</span>
          <span>Item</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Completed at</span>
          <span className="text-right">Action</span>
        </div>
        <div className="min-w-[1120px] divide-y divide-white/10">
          {refunds.map((refund) => (
            <div key={refund.id} className="grid grid-cols-[1.15fr_1fr_0.95fr_0.65fr_0.7fr_0.85fr_0.55fr] gap-4 px-5 py-4 text-sm transition hover:bg-white/5">
              <Link href={`/admin/orders/${refund.orderId}`} className="font-semibold text-[#E8EEF8] transition hover:text-[#48F5D3]">
                {refund.order.orderNo}
              </Link>
              <span className="truncate text-[#C5D0E2]">{refund.order.user.email ?? refund.order.user.phone ?? refund.order.user.id}</span>
              <span className="truncate text-[#C5D0E2]">{refund.order.plan?.name ?? refund.order.tool?.name ?? "Order item"}</span>
              <span className="text-[#FFB86B]">{formatCurrency(refund.amount.toString())}</span>
              <span>{getStatusLabel(refundStatusLabels, refund.status)}</span>
              <span className="text-[#8B95A7]">{refund.completedAt?.toLocaleString("en-US") ?? "-"}</span>
              <span className="text-right">
                <Link href={`/admin/refunds/${refund.id}`} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold transition hover:border-[#48F5D3]/50 hover:text-[#48F5D3]">
                  Review
                </Link>
              </span>
            </div>
          ))}
          {refunds.length === 0 ? <div className="px-5 py-10 text-center text-sm text-[#8B95A7]">No refund records found.</div> : null}
        </div>
      </div>
    </AdminSection>
  );
}
