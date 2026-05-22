import Image from "next/image";
import { reviewPaymentProofAction } from "@/app/actions";
import { prisma } from "@/lib/db";
import { getPaymentProofImageSrc, isRenderablePaymentProofImage } from "@/lib/payment-proof-image";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const proofs = await prisma.paymentProof.findMany({
    include: { order: { include: { plan: true, tool: true } }, user: true, reviewer: true },
    orderBy: { createdAt: "desc" }
  });
  return (
    <div>
      <h1 className="text-3xl font-semibold">支付审核</h1>
      <div className="mt-8 space-y-4">
        {proofs.map((proof) => {
          const proofImage = getPaymentProofImageSrc(proof);

          return (
          <div key={proof.id} className="glass rounded-2xl p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{proof.order.orderNo}</p>
                <p className="mt-2 text-sm text-[#8B95A7]">{proof.user.email} · {proof.order.plan?.name ?? proof.order.tool?.name ?? "订单项目"} · {formatCurrency(proof.order.amount.toString())}</p>
                <p className="mt-2 text-sm text-[#8B95A7]">方式：{proof.paymentMethod} · 凭证：{proof.proofImage}</p>
              </div>
              <span className="h-fit rounded-full border border-white/12 px-3 py-1 text-sm text-[#FFB86B]">{proof.reviewStatus}</span>
            </div>
            {proofImage ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="mb-3 text-sm text-[#8B95A7]">付款截图预览</p>
                {isRenderablePaymentProofImage(proofImage) ? (
                  <Image src={proofImage} alt="付款截图" width={520} height={360} className="max-h-80 w-full rounded-xl object-contain" unoptimized />
                ) : (
                  <a href={proofImage} target="_blank" rel="noreferrer" className="break-all text-sm text-[#48F5D3]">
                    打开付款截图
                  </a>
                )}
              </div>
            ) : null}
            <form action={reviewPaymentProofAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_120px_120px]">
              <input type="hidden" name="orderId" value={proof.orderId} />
              <input name="reviewNote" placeholder="审核备注 / 驳回原因" className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none" />
              <button name="decision" value="approved" className="rounded-full bg-[#48F5D3] px-5 py-3 font-semibold text-[#05110e]">通过</button>
              <button name="decision" value="rejected" className="rounded-full border border-white/12 px-5 py-3">驳回</button>
            </form>
          </div>
          );
        })}
      </div>
    </div>
  );
}
