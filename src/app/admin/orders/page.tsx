import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ include: { user: true, plan: true, paymentProof: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-3xl font-semibold">订单管理</h1>
      <div className="mt-8 space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="glass rounded-2xl p-5">
            <p className="font-semibold">{order.orderNo}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">{order.user.email} · {order.plan.name} · {formatCurrency(order.amount.toString())} · {order.orderStatus}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
