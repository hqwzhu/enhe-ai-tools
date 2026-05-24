import Link from "next/link";
import { prisma } from "@/lib/db";
import { getStatusLabel, proofStatusLabels } from "@/lib/status-labels";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const proofs = await prisma.paymentProof.findMany({
    include: { order: { include: { plan: true, tool: true } }, user: true, reviewer: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold">支付审核</h1>
      <p className="mt-3 text-sm text-[#8B95A7]">付款凭证以清单方式展示。点击订单号进入订单详情，点击查看付款记录进入单独审核页。</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/12 bg-white/6">
        <div className="grid min-w-[1080px] grid-cols-[1.15fr_1fr_0.9fr_0.65fr_0.7fr_0.8fr_0.55fr] gap-4 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-wide text-[#8B95A7]">
          <span>订单号</span>
          <span>用户</span>
          <span>项目</span>
          <span>金额</span>
          <span>方式</span>
          <span>凭证状态</span>
          <span className="text-right">操作</span>
        </div>
        <div className="min-w-[1080px] divide-y divide-white/10">
          {proofs.map((proof) => (
            <div key={proof.id} className="grid grid-cols-[1.15fr_1fr_0.9fr_0.65fr_0.7fr_0.8fr_0.55fr] gap-4 px-5 py-4 text-sm transition hover:bg-white/5">
              <Link href={`/admin/orders/${proof.order.id}`} className="font-semibold text-[#E8EEF8] transition hover:text-[#48F5D3]">
                {proof.order.orderNo}
              </Link>
              <span className="truncate text-[#C5D0E2]">{proof.user.email ?? proof.user.phone ?? proof.user.id}</span>
              <span className="truncate text-[#C5D0E2]">{proof.order.plan?.name ?? proof.order.tool?.name ?? "订单项目"}</span>
              <span className="text-[#FFB86B]">{formatCurrency(proof.order.amount.toString())}</span>
              <span>{proof.paymentMethod === "alipay" ? "支付宝" : "微信"}</span>
              <span className="text-[#FFB86B]">{getStatusLabel(proofStatusLabels, proof.reviewStatus)}</span>
              <span className="text-right">
                <Link href={`/admin/payments/${proof.id}`} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold transition hover:border-[#48F5D3]/50 hover:text-[#48F5D3]">
                  查看付款记录
                </Link>
              </span>
            </div>
          ))}
          {proofs.length === 0 ? <div className="px-5 py-10 text-center text-sm text-[#8B95A7]">暂无付款凭证。</div> : null}
        </div>
      </div>
    </div>
  );
}
