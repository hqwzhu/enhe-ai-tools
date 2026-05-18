import { reviewPaymentProofAction } from "@/app/actions";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const proofs = await prisma.paymentProof.findMany({
    include: { order: { include: { plan: true } }, user: true, reviewer: true },
    orderBy: { createdAt: "desc" }
  });
  return (
    <div>
      <h1 className="text-3xl font-semibold">支付审核</h1>
      <div className="mt-8 space-y-4">
        {proofs.map((proof) => (
          <div key={proof.id} className="glass rounded-2xl p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{proof.order.orderNo}</p>
                <p className="mt-2 text-sm text-[#8B95A7]">{proof.user.email} · {proof.order.plan.name} · {formatCurrency(proof.order.amount.toString())}</p>
                <p className="mt-2 text-sm text-[#8B95A7]">方式：{proof.paymentMethod} · 凭证：{proof.proofImage}</p>
              </div>
              <span className="h-fit rounded-full border border-white/12 px-3 py-1 text-sm text-[#FFB86B]">{proof.reviewStatus}</span>
            </div>
            <form action={reviewPaymentProofAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_120px_120px]">
              <input type="hidden" name="orderId" value={proof.orderId} />
              <input name="reviewNote" placeholder="审核备注 / 驳回原因" className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none" />
              <button name="decision" value="approved" className="rounded-full bg-[#48F5D3] px-5 py-3 font-semibold text-[#05110e]">通过</button>
              <button name="decision" value="rejected" className="rounded-full border border-white/12 px-5 py-3">驳回</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
