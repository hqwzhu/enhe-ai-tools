import { notFound } from "next/navigation";
import { submitPaymentProofAction } from "@/app/actions";
import { Container, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettingsMap } from "@/lib/settings";
import { formatCurrency } from "@/lib/utils";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findFirst({ where: { id, userId: user.id }, include: { plan: true, paymentProof: true } }),
    getSettingsMap()
  ]);
  if (!order) notFound();

  return (
    <Container className="py-14">
      <SectionTitle title="订单支付" intro="请付款时备注订单号，付款后上传截图并提交凭证，后台审核通过后自动开通会员。" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="glass rounded-2xl p-7">
          <p className="text-sm text-[#8B95A7]">订单号</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#48F5D3]">{order.orderNo}</h1>
          <p className="mt-6 text-sm text-[#8B95A7]">套餐</p>
          <p className="mt-2 text-xl">{order.plan.name} · {formatCurrency(order.amount.toString())}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <QrBox title="支付宝收款码" value={settings.alipay_qr} />
            <QrBox title="微信收款码" value={settings.wechat_qr} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-7">
            <h2 className="text-lg font-semibold">上传付款截图</h2>
            <p className="mt-2 text-sm text-[#8B95A7]">上传后页面会返回 JSON，复制其中 fileUrl 到下方“付款截图地址”。</p>
            <form action="/api/uploads/payment-proof" method="post" encType="multipart/form-data" className="mt-4 grid gap-3">
              <input name="file" type="file" accept="image/*" required className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm" />
              <button className="rounded-full bg-[#48F5D3] px-5 py-3 text-sm font-semibold text-[#05110e]">上传截图</button>
            </form>
          </div>

          <form action={submitPaymentProofAction} className="glass rounded-2xl p-7">
            <input type="hidden" name="orderId" value={order.id} />
            <label className="block text-sm">付款方式</label>
            <select name="paymentMethod" defaultValue={order.paymentMethod ?? "alipay"} className="mt-2 w-full rounded-xl border border-white/12 bg-[#111827] px-4 py-3">
              <option value="alipay">支付宝</option>
              <option value="wechat">微信</option>
            </select>
            <label className="mt-5 block text-sm">付款备注</label>
            <input name="paymentRemark" defaultValue={order.orderNo} className="mt-2 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none" />
            <label className="mt-5 block text-sm">付款截图地址</label>
            <input name="proofImage" defaultValue={order.paymentProof?.proofImage ?? ""} placeholder="/uploads/proof.png 或 COS URL" required className="mt-2 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none" />
            {order.paymentProof?.reviewNote ? <p className="mt-3 text-xs leading-6 text-[#FFB86B]">上次审核备注：{order.paymentProof.reviewNote}</p> : null}
            <p className="mt-3 text-xs leading-6 text-[#8B95A7]">第二版支持本地上传；正式上线可替换为腾讯云 COS 直传，字段保持不变。</p>
            <button className="mt-8 w-full rounded-full bg-[#7AA7FF] px-5 py-3 font-semibold text-[#07101f]">提交付款截图</button>
          </form>
        </div>
      </div>
    </Container>
  );
}

function QrBox({ title, value }: { title: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-5 text-center">
      <div className="mx-auto flex aspect-square max-w-48 items-center justify-center rounded-xl bg-white p-4 text-sm text-slate-900">
        {value ? <span className="break-all">{value}</span> : "后台设置收款码"}
      </div>
      <p className="mt-4 text-sm">{title}</p>
    </div>
  );
}
