import { deleteOrderAdminAction, updateOrderAdminAction } from "@/app/admin/actions";
import { AdminSection, Field, inputClass, selectClass, SubmitButton } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

const orderStatusOptions = [
  ["pending_payment", "待支付"],
  ["pending_review", "待审核"],
  ["paid", "已支付"],
  ["activated", "已开通"],
  ["rejected", "审核失败"],
  ["cancelled", "已取消"],
  ["refunded", "已退款"]
] as const;

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, plan: true, tool: true, paymentProof: true, toolPurchase: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminSection title="订单管理" intro="可编辑订单状态、金额和支付方式。用户不要订单时可改为已取消；确实需要清理时可删除订单及其支付凭证。">
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="glass rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{order.orderNo}</p>
                <p className="mt-2 text-sm text-[#8B95A7]">
                  {order.user.email ?? order.user.phone ?? order.user.id} · {order.plan?.name ?? order.tool?.name ?? "订单项目"} ·{" "}
                  {formatCurrency(order.amount.toString())} · {statusLabel(order.orderStatus)}
                </p>
                <p className="mt-1 text-xs text-[#8B95A7]">
                  类型：{order.orderType === "vip" ? "会员订单" : "软件下载订单"} · 凭证：{order.paymentProof?.reviewStatus ?? "未提交"} · 创建：{order.createdAt.toLocaleString("zh-CN")}
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
                <p className="pb-3 text-xs leading-5 text-[#8B95A7]">取消订单请选择“已取消”；退款完成后可标记为“已退款”。</p>
              </div>
            </form>

            <form action={deleteOrderAdminAction} className="mt-4 border-t border-white/10 pt-4">
              <input type="hidden" name="id" value={order.id} />
              <button className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200">
                删除订单
              </button>
              <span className="ml-3 text-xs text-[#8B95A7]">会同时删除该订单的支付凭证和软件下载购买记录。</span>
            </form>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}

function statusLabel(status: string) {
  return orderStatusOptions.find(([value]) => value === status)?.[1] ?? status;
}
