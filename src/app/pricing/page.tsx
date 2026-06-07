import { Crown } from "lucide-react";
import { createOrderAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Container, SectionTitle } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export default async function PricingPage() {
  const [plans, locale] = await Promise.all([
    prisma.vipPlan.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } }),
    getCurrentLocale()
  ]);
  const t = getDictionary(locale);

  return (
    <Container className="py-14">
      <SectionTitle title={t.pricing.title} intro={t.pricing.intro} />
      <div className="grid gap-5 lg:grid-cols-5">
        {plans.map((plan) => (
          <form key={plan.id} action={createOrderAction} className="glass relative rounded-2xl p-6">
            {plan.isRecommended ? <div className="absolute -top-3 left-5 rounded-full bg-[#FFB86B] px-3 py-1 text-xs font-semibold text-[#120904]">{t.pricing.recommended}</div> : null}
            <Crown className="mb-5 text-[#FFB86B]" />
            <h2 className="text-xl font-semibold">{formatPlanName(plan.name, plan.durationDays, locale)}</h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#8B95A7]">
              {formatPlanDescription(plan.description, plan.durationDays, locale)}
            </p>
            <div className="mt-6">
              <span className="text-3xl font-semibold text-[#FFB86B]">{formatCurrency(plan.price.toString())}</span>
              {plan.originalPrice ? <span className="ml-2 text-sm text-[#8B95A7] line-through">{formatCurrency(plan.originalPrice.toString())}</span> : null}
            </div>
            <input type="hidden" name="planId" value={plan.id} />
            <select name="paymentMethod" className="mt-6 w-full rounded-xl border border-white/12 bg-[#111827] px-3 py-3 text-sm">
              <option value="alipay">{t.pricing.alipay}</option>
              <option value="wechat">{t.pricing.wechat}</option>
            </select>
            <FormSubmitButton className="mt-4 w-full bg-[#7AA7FF] text-base text-[#07101f]" pendingLabel="创建订单中...">{t.pricing.createOrder}</FormSubmitButton>
          </form>
        ))}
      </div>
    </Container>
  );
}

function formatPlanName(name: string, durationDays: number, locale: Locale) {
  if (locale === "zh") return name;
  if (!durationDays || durationDays >= 36500) return "Lifetime VIP";
  if (durationDays % 30 === 0) return `${durationDays / 30}-Month VIP`;
  return `${durationDays}-Day VIP`;
}

function formatPlanDescription(description: string | null, durationDays: number, locale: Locale) {
  const t = getDictionary(locale);
  if (locale === "zh") return description ?? t.pricing.planDescription;
  const duration = !durationDays || durationDays >= 36500
    ? t.pricing.lifetimeNote
    : t.pricing.durationNote.replace("{days}", String(durationDays));
  return `${duration}. ${t.pricing.planDescription}`;
}
