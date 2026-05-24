import Image from "next/image";
import { notFound } from "next/navigation";
import { Container, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isImagePath, normalizeImageSrc } from "@/lib/media";
import { getSettingsMap } from "@/lib/settings";
import { formatCurrency } from "@/lib/utils";

type PayPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PayPage({ params, searchParams }: PayPageProps) {
  const user = await requireUser();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [order, settings] = await Promise.all([
    prisma.order.findFirst({ where: { id, userId: user.id }, include: { plan: true, tool: true, paymentProof: true } }),
    getSettingsMap()
  ]);
  if (!order) notFound();

  const alipayQr = resolveQrSetting(settings.alipay_qr, "/images/payment/alipay-qr.jpg", "/images/alipay-qr.svg");
  const wechatQr = resolveQrSetting(settings.wechat_qr, "/images/payment/wechat-qr.jpg", "/images/wechat-qr.svg");

  return (
    <Container className="py-14">
      <SectionTitle title="订单支付" intro="付款时请备注订单号，上传付款截图后订单会自动进入待审核状态。" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="glass rounded-2xl p-7">
          <p className="text-sm text-[#8B95A7]">订单号</p>
          <h1 className="mt-2 break-all text-2xl font-semibold text-[#48F5D3]">{order.orderNo}</h1>
          <p className="mt-6 text-sm text-[#8B95A7]">{order.orderType === "software_download" ? "软件" : "套餐"}</p>
          <p className="mt-2 text-xl">{order.plan?.name ?? order.tool?.name ?? "订单项目"} · {formatCurrency(order.amount.toString())}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <QrBox title="支付宝收款码" value={alipayQr} />
            <QrBox title="微信收款码" value={wechatQr} />
          </div>
        </div>

        <div className="glass rounded-2xl p-7">
          <h2 className="text-lg font-semibold">上传付款截图</h2>
          <p className="mt-2 text-sm leading-6 text-[#8B95A7]">
            上传成功后将进入独立订单详情页，显示待审核状态、付款截图预览和订单信息。
          </p>

          <p className="mt-3 rounded-xl border border-[#FFB86B]/30 bg-[#FFB86B]/10 px-4 py-3 text-sm leading-6 text-[#FFD6A5]">
            退款提示：订单开通后，如果账号已经下载过工具或使用过 1 次在线工具，将不再支持退款申请。付款前请确认套餐、工具和金额无误。
          </p>

          {query.error ? (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {query.error}
            </p>
          ) : null}

          <form action="/api/uploads/payment-proof" method="post" encType="multipart/form-data" className="mt-6 grid gap-4">
            <input type="hidden" name="orderId" value={order.id} />
            <label className="block text-sm">付款方式</label>
            <select name="paymentMethod" defaultValue={order.paymentMethod ?? "alipay"} className="rounded-xl border border-white/12 bg-[#111827] px-4 py-3">
              <option value="alipay">支付宝</option>
              <option value="wechat">微信</option>
            </select>
            <label className="block text-sm">付款备注</label>
            <input name="paymentRemark" defaultValue={order.paymentProof?.paymentRemark ?? order.orderNo} className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none" />
            <label className="block text-sm">付款截图</label>
            <input name="file" type="file" accept="image/*" required className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm" />
            <button className="rounded-full bg-[#7AA7FF] px-5 py-3 font-semibold text-[#07101f]">上传并提交审核</button>
          </form>
        </div>
      </div>
    </Container>
  );
}

function resolveQrSetting(value: string | undefined, fallback: string, legacyPlaceholder: string) {
  if (!value || value === legacyPlaceholder) return fallback;
  return value;
}

function QrBox({ title, value }: { title: string; value?: string }) {
  const src = normalizeImageSrc(value);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-5 text-center">
      <div className="relative mx-auto flex aspect-[3/4] max-w-56 items-center justify-center overflow-hidden rounded-xl bg-white p-2 text-sm text-slate-900">
        {src && isImagePath(src) ? (
          <Image src={src} alt={title} width={360} height={480} className="h-full w-full object-contain" unoptimized />
        ) : value ? (
          <span className="break-all">{value}</span>
        ) : (
          "后台设置收款码"
        )}
      </div>
      <p className="mt-4 text-sm">{title}</p>
    </div>
  );
}
