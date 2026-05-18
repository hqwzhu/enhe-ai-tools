import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [users, tools, orders, pendingProofs] = await Promise.all([
    prisma.user.count(),
    prisma.tool.count(),
    prisma.order.count(),
    prisma.paymentProof.count({ where: { reviewStatus: "pending" } })
  ]);
  return (
    <div>
      <h1 className="text-3xl font-semibold">数据看板</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="用户数" value={users} />
        <Stat label="工具数" value={tools} />
        <Stat label="订单数" value={orders} />
        <Stat label="待审核支付" value={pendingProofs} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-sm text-[#8B95A7]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#48F5D3]">{value}</p>
    </div>
  );
}
