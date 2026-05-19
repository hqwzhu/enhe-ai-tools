import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStatusLabel, orderStatusLabels, proofStatusLabels } from "@/lib/status-labels";
import { formatCurrency } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { plan: true, tool: true, paymentProof: true }
  });
  if (!order) notFound();

  return (
    <Container className="py-14">
      <SectionTitle title="订单详情" intro="查看订单状态、付款凭证审核结果和会员开通时间。" />
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
        </div>
        {order.paymentProof?.reviewNote ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-5">
            <p className="text-sm text-[#8B95A7]">审核备注</p>
            <p className="mt-2 leading-7">{order.paymentProof.reviewNote}</p>
          </div>
        ) : null}
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
