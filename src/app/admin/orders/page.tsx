import { deleteOrderAdminAction, updateOrderAdminAction } from "@/app/admin/actions";
import { AdminSection, Field, inputClass, selectClass, SubmitButton } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";
import { adminDeleteRiskConfirmationToken, canAdminDeleteOrderSafely } from "@/lib/order-rules";
import { getStatusLabel, orderStatusLabels, proofStatusLabels } from "@/lib/status-labels";
import { formatCurrency } from "@/lib/utils";

const orderStatusOptions = [
  ["pending_payment", "待支付"],
  ["pending_review", "待审核"],
  ["paid", "已支付"],
  ["rejected", "审核失败"],
  ["cancelled", "已取消"],
  ["refunded", "已退款"]
] as const;

type AdminOrdersPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const orders = await prisma.order.findMany({
    include: { user: true, plan: true, tool: true, paymentProof: true, toolPurchase: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminSection
      title="订单管理"
      intro="订单状态可用于取消、退款和标记支付；权益开通必须通过支付审核或手动调整 VIP，不能直接把订单改为已开通。"
    >
      {params.error ? (
        <p className="mb-5 rounded-xl border border-[#FFB86B]/30 bg-[#FFB86B]/10 px-4 py-3 text-sm text-[#FFB86B]">
          {params.error}
        </p>
      ) : null}
      {params.deleted ? (
        <p className="mb-5 rounded-xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-3 text-sm text-[#48F5D3]">
          订单已删除。
        </p>
      ) : null}

      <div className="space-y-4">
        {orders.map((order) => {
          const deleteIsSafe = canAdminDeleteOrderSafely(order.orderStatus);

          return (
            <div key={order.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{order.orderNo}</p>
                  <p className="mt-2 text-sm text-[#8B95A7]">
                    {order.user.email ?? order.user.phone ?? order.user.id} · {order.plan?.name ?? order.tool?.name ?? "订单项目"} ·{" "}
                    {formatCurrency(order.amount.toString())} · {getStatusLabel(orderStatusLabels, order.orderStatus)}
                  </p>
                  <p className="mt-1 text-xs text-[#8B95A7]">
                    类型：{order.orderType === "vip" ? "会员订单" : "软件下载订单"} · 凭证：
                    {getStatusLabel(proofStatusLabels, order.paymentProof?.reviewStatus)} · 创建：{order.createdAt.toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#8B95A7]">
                  {order.toolPurchase ? "已生成购买记录" : order.activatedAt ? `开通于 ${order.activatedAt.toLocaleString("zh-CN")}` : "未开通"}
                </div>
              </div>

              <form action={updateOrderAdminAction} className="mt-5 grid gap-4 md:grid-cols-[180px_160px_160px_1fr]">
                <input type="hidden" name="id" value={order.id} />
                <Field label="订单状态">
                  <select name="orderStatus" defaultValue={order.orderStatus} className={selectClass}>
                    {order.orderStatus === "activated" ? <option value="activated">已开通（不可手动设置）</option> : null}
                    {orderStatusOptions.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="订单金额">
                  <input name="amount" type="number" step="0.01" min="0" defaultValue={order.amount.toString()} className={inputClass} />
                </Field>
                <Field label="支付方式">
                  <select name="paymentMethod" defaultValue={order.paymentMethod ?? ""} className={selectClass}>
                    <option value="">未选择</option>
                    <option value="alipay">支付宝</option>
                    <option value="wechat">微信</option>
                  </select>
                </Field>
                <div className="flex items-end gap-3">
                  <SubmitButton>保存订单</SubmitButton>
                  <p className="pb-3 text-xs leading-5 text-[#8B95A7]">如需开通权益，请到支付审核通过，或在用户管理中手动调整 VIP。</p>
                </div>
              </form>

              <form action={deleteOrderAdminAction} className="mt-4 border-t border-white/10 pt-4">
                <input type="hidden" name="id" value={order.id} />
                {!deleteIsSafe ? (
                  <label className="mb-3 flex gap-3 rounded-xl border border-[#FFB86B]/30 bg-[#FFB86B]/10 px-4 py-3 text-xs leading-6 text-[#FFB86B]">
                    <input
                      name="confirmRisk"
                      type="checkbox"
                      required
                      value={adminDeleteRiskConfirmationToken}
                      className="mt-1"
                    />
                    <span>
                      该订单已支付或已开通权益。删除订单不会自动撤销会员权益或售后记录，我已确认完成售后处理并承担删除风险。
                    </span>
                  </label>
                ) : null}
                <button className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200">
                  删除订单
                </button>
                <span className="ml-3 text-xs text-[#8B95A7]">会同时删除该订单的支付凭证和软件购买记录。</span>
              </form>
            </div>
          );
        })}
      </div>
    </AdminSection>
  );
}
