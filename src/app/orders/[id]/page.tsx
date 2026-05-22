import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createRefundRequestAction } from "@/app/actions";
import { Container, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrderBenefitExpiry } from "@/lib/order-view";
import { canUserRequestRefundForOrder } from "@/lib/order-rules";
import { getPaymentProofImageSrc, isRenderablePaymentProofImage } from "@/lib/payment-proof-image";
import { getStatusLabel, orderStatusLabels, proofStatusLabels } from "@/lib/status-labels";
import { formatCurrency } from "@/lib/utils";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const user = await requireUser();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      plan: true,
      tool: true,
      paymentProof: true,
      refundRecords: { orderBy: { createdAt: "desc" } }
    }
  });
  if (!order) notFound();

  const proofImage = getPaymentProofImageSrc(order.paymentProof);
  const expiry = getOrderBenefitExpiry({
    orderType: order.orderType,
    activatedAt: order.activatedAt,
    plan: order.plan
  });
  const hasPendingRefundRequest = order.refundRecords.some((refund) => refund.status === "pending");
  const canRequestRefund = canUserRequestRefundForOrder(order.orderStatus, hasPendingRefundRequest);

  return (
    <Container className="py-14">
      <SectionTitle title="订单详情" intro="查看订单状态、付款凭证、审核结果和权益有效期。" />
      {query.uploaded ? (
        <div className="mb-6 rounded-2xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-5 py-4 text-sm font-semibold text-[#48F5D3]">
          上传成功，订单已进入待审核状态。
        </div>
      ) : null}
      {query.refund === "requested" ? (
        <div className="mb-6 rounded-2xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-5 py-4 text-sm font-semibold text-[#48F5D3]">
          售后/退款申请已提交，等待后台处理。
        </div>
      ) : null}
      <div className="glass rounded-2xl p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="订单号" value={order.orderNo} />
          <Info label={order.orderType === "software_download" ? "软件" : "套餐"} value={order.plan?.name ?? order.tool?.name ?? "订单项目"} />
          <Info label="金额" value={formatCurrency(order.amount.toString())} />
          <Info label="订单状态" value={getStatusLabel(orderStatusLabels, order.orderStatus)} />
          <Info label="付款方式" value={order.paymentMethod ?? "未选择"} />
          <Info label="凭证状态" value={getStatusLabel(proofStatusLabels, order.paymentProof?.reviewStatus)} />
          <Info label="创建时间" value={order.createdAt.toLocaleString("zh-CN")} />
          <Info label="开通时间" value={order.activatedAt?.toLocaleString("zh-CN") ?? "未开通"} />
          <Info label="到期日期" value={expiry} />
        </div>

        {proofImage ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-5">
            <p className="mb-3 text-sm text-[#8B95A7]">付款截图预览</p>
            {isRenderablePaymentProofImage(proofImage) ? (
              <Image
                src={proofImage}
                alt="付款截图"
                width={720}
                height={460}
                className="max-h-[460px] w-full rounded-xl object-contain"
                unoptimized
              />
            ) : (
              <p className="break-all text-sm text-[#8B95A7]">{proofImage}</p>
            )}
          </div>
        ) : null}

        {order.paymentProof?.reviewNote ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-5">
            <p className="text-sm text-[#8B95A7]">审核备注</p>
            <p className="mt-2 leading-7">{order.paymentProof.reviewNote}</p>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">售后/退款</h2>
              <p className="mt-2 text-sm text-[#8B95A7]">已支付或已开通订单可以提交售后/退款申请，后台会人工处理。</p>
            </div>
            {hasPendingRefundRequest ? (
              <span className="rounded-full border border-[#FFB86B]/30 px-3 py-1 text-xs text-[#FFB86B]">待处理</span>
            ) : null}
          </div>
          {order.refundRecords.length ? (
            <div className="mt-4 space-y-3">
              {order.refundRecords.map((refund) => (
                <div key={refund.id} className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-[#8B95A7]">
                  <span className="font-semibold text-[#E8EEF8]">{formatCurrency(refund.amount.toString())}</span>
                  <span> · {refund.status} · {refund.reason}</span>
                  <span> · {refund.createdAt.toLocaleString("zh-CN")}</span>
                  {refund.note ? <p className="mt-2 leading-6">{refund.note}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
          {canRequestRefund ? (
            <form action={createRefundRequestAction} className="mt-5 grid gap-3">
              <input type="hidden" name="orderId" value={order.id} />
              <input name="reason" required minLength={2} maxLength={500} placeholder="申请原因，例如：重复付款 / 无法使用 / 售后协商" className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]" />
              <textarea name="note" maxLength={1000} placeholder="补充说明，可填写付款账号、沟通记录或退款方式" className="min-h-24 rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]" />
              <button className="w-fit rounded-full border border-[#FFB86B]/40 px-5 py-3 text-sm font-semibold text-[#FFB86B] transition hover:bg-[#FFB86B]/10">
                提交售后/退款申请
              </button>
            </form>
          ) : !hasPendingRefundRequest && !order.refundRecords.length ? (
            <p className="mt-4 text-sm text-[#8B95A7]">当前订单状态暂不支持提交售后/退款申请。</p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {["pending_payment", "rejected"].includes(order.orderStatus) ? (
            <Link href={`/orders/${order.id}/pay`} className="rounded-full bg-[#7AA7FF] px-5 py-3 text-sm font-semibold text-[#07101f]">
              去付款 / 重新提交凭证
            </Link>
          ) : null}
          <Link href="/user" className="rounded-full border border-white/12 px-5 py-3 text-sm">返回用户中心</Link>
        </div>
      </div>
    </Container>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/8 p-4">
      <p className="text-xs text-[#8B95A7]">{label}</p>
      <p className="mt-2 break-all font-semibold">{value}</p>
    </div>
  );
}
