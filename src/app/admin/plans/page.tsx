import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPlansPage() {
  const plans = await prisma.vipPlan.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="text-3xl font-semibold">会员套餐管理</h1>
      <p className="mt-3 text-[#8B95A7]">第一版已支持数据库层新增、编辑、启用、禁用、推荐字段，页面先展示管理视图。</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="glass rounded-2xl p-6">
            <p className="text-xl font-semibold">{plan.name}</p>
            <p className="mt-2 text-[#FFB86B]">{formatCurrency(plan.price.toString())}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">{plan.durationDays || "永久"} 天 · {plan.status} · {plan.isRecommended ? "推荐" : "普通"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
