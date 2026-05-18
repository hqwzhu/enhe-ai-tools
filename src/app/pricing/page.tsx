import { Crown } from "lucide-react";
import { createOrderAction } from "@/app/actions";
import { Container, SectionTitle } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function PricingPage() {
  const plans = await prisma.vipPlan.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } });
  return (
    <Container className="py-14">
      <SectionTitle title="会员价格" intro="第一版采用个人收款码 + 订单号 + 上传付款截图 + 后台人工审核的方式开通 VIP。" />
      <div className="grid gap-5 lg:grid-cols-5">
        {plans.map((plan) => (
          <form key={plan.id} action={createOrderAction} className="glass relative rounded-2xl p-6">
            {plan.isRecommended ? <div className="absolute -top-3 left-5 rounded-full bg-[#FFB86B] px-3 py-1 text-xs font-semibold text-[#120904]">推荐</div> : null}
            <Crown className="mb-5 text-[#FFB86B]" />
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#8B95A7]">{plan.description}</p>
            <div className="mt-6">
              <span className="text-3xl font-semibold text-[#FFB86B]">{formatCurrency(plan.price.toString())}</span>
              {plan.originalPrice ? <span className="ml-2 text-sm text-[#8B95A7] line-through">{formatCurrency(plan.originalPrice.toString())}</span> : null}
            </div>
            <input type="hidden" name="planId" value={plan.id} />
            <select name="paymentMethod" className="mt-6 w-full rounded-xl border border-white/12 bg-[#111827] px-3 py-3 text-sm">
              <option value="alipay">支付宝</option>
              <option value="wechat">微信</option>
            </select>
            <button className="mt-4 w-full rounded-full bg-[#7AA7FF] px-5 py-3 font-semibold text-[#07101f]">创建订单</button>
          </form>
        ))}
      </div>
    </Container>
  );
}
