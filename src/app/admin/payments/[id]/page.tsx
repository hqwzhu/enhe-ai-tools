import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { reviewPaymentProofAction } from "@/app/actions";
import { AdminSection, inputClass } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";
import { getPaymentProofImageSrc, isRenderablePaymentProofImage } from "@/lib/payment-proof-image";
import { getStatusLabel, orderStatusLabels, proofStatusLabels } from "@/lib/status-labels";
import { formatCurrency } from "@/lib/utils";

type AdminPaymentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPaymentDetailPage({ params }: AdminPaymentDetailPageProps) {
  const { id } = await params;
  const proof = await prisma.paymentProof.findUnique({
    where: { id },
    include: { order: { include: { plan: true, tool: true } }, user: true, reviewer: true }
  });
  if (!proof) notFound();
  const proofImage = getPaymentProofImageSrc(proof);

  return (
    <AdminSection title="付款记录详情" intro="查看付款截图、订单信息和审核状态。审核通过后系统会自动开通 VIP 或创建软件购买授权。">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/admin/payments" className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:border-[#48F5D3]/50 hover:text-[#48F5D3]">
          返回支付审核
        </Link>
        <Link href={`/admin/orders/${proof.order.id}`} className="rounded-full border border-[#48F5D3]/30 px-4 py-2 text-sm text-[#48F5D3]">
          查看订单详情
        </Link>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Info label="订单号" value={proof.order.orderNo} />
          <Info label="用户" value={proof.user.email ?? proof.user.phone ?? proof.user.id} />
          <Info label="项目" value={proof.order.plan?.name ?? proof.order.tool?.name ?? "订单项目"} />
          <Info label="金额" value={formatCurrency(proof.order.amount.toString())} />
          <Info label="支付方式" value={proof.paymentMethod} />
          <Info label="订单状态" value={getStatusLabel(orderStatusLabels, proof.order.orderStatus)} />
          <Info label="凭证状态" value={getStatusLabel(proofStatusLabels, proof.reviewStatus)} />
          <Info label="付款备注" value={proof.paymentRemark ?? "-"} />
          <Info label="审核人" value={proof.reviewer?.email ?? "-"} />
        </div>

        {proofImage ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4">
            <p className="mb-3 text-sm text-[#8B95A7]">付款截图预览</p>
            {isRenderablePaymentProofImage(proofImage) ? (
              <Image src={proofImage} alt="付款截图" width={820} height={520} className="max-h-[520px] w-full rounded-xl object-contain" unoptimized />
            ) : (
              <a href={proofImage} target="_blank" rel="noreferrer" className="break-all text-sm text-[#48F5D3]">打开付款截图</a>
            )}
          </div>
        ) : null}

        <form action={reviewPaymentProofAction} className="mt-6 grid gap-3 border-t border-white/10 pt-6 md:grid-cols-[1fr_120px_120px]">
          <input type="hidden" name="orderId" value={proof.orderId} />
          <input name="reviewNote" placeholder="审核备注 / 驳回原因" className={inputClass} />
          <button name="decision" value="approved" className="rounded-full bg-[#48F5D3] px-5 py-3 font-semibold text-[#05110e]">通过</button>
          <button name="decision" value="rejected" className="rounded-full border border-white/12 px-5 py-3">驳回</button>
        </form>
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
