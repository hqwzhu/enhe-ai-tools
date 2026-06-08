import type { Metadata } from "next";
import { CheckCircle2, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { createOrderAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Container, SectionTitle } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    title: `${t.pricing.title} - ${t.brand}`,
    description: t.pricing.intro,
    path: "/pricing"
  });
}

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
            <FormSubmitButton
              className="mt-4 w-full bg-[#7AA7FF] text-base text-[#07101f]"
              pendingLabel={t.pricing.pending}
              data-analytics-event="click_open_vip"
              data-analytics-entity-type="vip_plan"
              data-analytics-entity-id={plan.id}
            >
              {t.pricing.primaryCta}
            </FormSubmitButton>
          </form>
        ))}
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="glass rounded-2xl p-7">
          <div className="flex items-center gap-3">
            <Sparkles className="text-[#7DD3FC]" />
            <h2 className="text-2xl font-semibold">{t.pricing.benefitsTitle}</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8B95A7]">{t.pricing.benefitsIntro}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {t.pricing.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/6 p-4 text-sm leading-6 text-[#C5D0E2]">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#5EF1C7]" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-7">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[#FFB86B]" />
            <h2 className="text-2xl font-semibold">{t.pricing.processTitle}</h2>
          </div>
          <div className="mt-6 grid gap-3">
            {t.pricing.processSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/6 p-4 text-sm text-[#C5D0E2]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7DD3FC] text-sm font-semibold text-[#030611]">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass mt-10 rounded-2xl p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">{t.pricing.benefitComparisonTitle}</h2>
          <span className="inline-flex items-center gap-2 text-sm text-[#8B95A7]">
            <ShieldCheck size={16} />
            {t.pricing.serviceTitle}
          </span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr>
                {t.pricing.comparisonHeaders.map((header) => (
                  <th key={header} className="border-b border-white/10 px-4 py-3 text-[#8B95A7]">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.pricing.comparisonRows.map((row) => (
                <tr key={row[0]} className="border-b border-white/8 last:border-b-0">
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${index}`} className={`px-4 py-4 ${index === 0 ? "font-semibold text-[#F6FAFF]" : "text-[#C5D0E2]"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {t.pricing.serviceItems.map((item) => (
            <p key={item} className="rounded-xl border border-white/10 bg-white/6 p-4 text-sm leading-6 text-[#8B95A7]">{item}</p>
          ))}
        </div>
      </section>
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
