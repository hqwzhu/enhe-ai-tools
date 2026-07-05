import Image from "next/image";
import Link from "next/link";
import { StructuredData } from "@/components/structured-data";
import { Badge, Container, SectionTitle } from "@/components/ui";
import type { Locale } from "@/lib/dictionaries";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildLocalePath,
  buildPageMetadata
} from "@/lib/seo";

const supportEmail = "ENHEAI.life@protonmail.com";

const content = {
  zh: {
    metaTitle: "ENHE AI Prompt Kit｜AI工具站运营提示词包",
    metaDescription: "面向 AI 工具站运营者、独立开发者和数字产品卖家的运营提示词包验证页，包含产品页、SEO/GEO、上架、竞品分析和周复盘 Prompt。",
    eyebrow: "Validation Offer",
    title: "ENHE AI Prompt Kit｜AI工具站运营提示词包",
    subtitle: "把产品页文案、SEO/GEO、平台上架、竞品分析和每周复盘整理成可复制的 Prompt 文档，先用最小交付验证真实需求。",
    primaryCta: "邮件咨询交付内容",
    secondaryCta: "查看现有工具",
    tertiaryCta: "了解价格测试",
    summaryTitle: "不是自动赚钱工具，是运营交付模板",
    summary:
      "这个验证页用于确认是否有人需要一套可直接复制、可按产品场景改写的 AI 工具站运营 Prompt。当前不承诺排名、收入或自动增长，只验证点击、咨询和预售意向。",
    audiences: ["AI 工具站运营者", "独立开发者", "数字产品卖家", "内容创作者", "SEO/GEO 运营者"],
    deliverables: [
      "产品页文案 Prompt",
      "SEO 标题/描述 Prompt",
      "FAQ 生成 Prompt",
      "小红书/闲鱼/淘宝/Whop 上架 Prompt",
      "AI 产品需求挖掘 Prompt",
      "竞品分析 Prompt",
      "每周复盘 Prompt"
    ],
    scenarios: [
      "为一个新 AI 小工具快速整理产品页和 FAQ",
      "把已有工具改成更清晰的价格、交付和咨询入口",
      "为小红书、闲鱼、淘宝或 Whop 准备合规上架草稿",
      "每周复盘流量、点击、咨询和收入信号"
    ],
    prices: ["￥19 体验版", "￥29 标准版", "￥39 带复盘版"],
    faq: [
      ["这套 Prompt 包适合谁？", "适合已经有 AI 工具、数字产品或内容方向，但缺少产品页、上架文案、SEO/GEO 结构和复盘模板的人。"],
      ["交付形式是什么？", "最小交付为 Markdown、PDF 和可复制 Prompt 文档。正式交付范围以咨询确认后的版本为准。"],
      ["会承诺排名或收入吗？", "不会。它只提供运营提示词和文案结构，不承诺搜索排名、平台流量、订单或收入。"],
      ["可以用于哪些平台？", "可用于官网产品页、小红书笔记、闲鱼/淘宝详情页、Whop listing、私域介绍和每周复盘。"],
      ["是否包含定制服务？", "当前验证版优先验证标准化模板需求。定制改写可以作为后续版本单独确认。"],
      ["购买前可以先看目录吗？", "可以通过邮件咨询目录、适用场景和交付边界。"],
      ["是否适合非技术用户？", "适合。文档会尽量用可复制、可替换变量的方式组织，不要求写代码。"],
      ["如何判断这次验证是否成功？", "观察页面浏览、CTA 点击、咨询、预售意向和真实付款，不用主观感觉判断。"]
    ],
    compliance: "合规提示：不承诺收益、不承诺排名、不承诺自动赚钱；所有真实点击、咨询、订单和收入都需要实际发生后再记录。",
    contactNote: "邮件咨询时建议说明：你的产品类型、准备发布的平台、希望先解决的文案问题。"
  },
  en: {
    metaTitle: "ENHE AI Prompt Kit | AI Tool Site Operations Prompt Pack",
    metaDescription: "A validation landing page for an AI tool-site operations prompt pack covering product copy, SEO/GEO, marketplace listings, competitor analysis, and weekly review prompts.",
    eyebrow: "Validation Offer",
    title: "ENHE AI Prompt Kit | AI Tool Site Operations Prompt Pack",
    subtitle: "Reusable prompts for product pages, SEO/GEO, marketplace listings, competitor review, and weekly operating reviews. This page validates real demand before a heavier product build.",
    primaryCta: "Ask about the deliverables",
    secondaryCta: "Browse existing tools",
    tertiaryCta: "Review price test",
    summaryTitle: "Operations prompts, not an income promise",
    summary:
      "This validation page checks whether operators need a copy-ready prompt document for AI tool sites. It does not promise ranking, traffic, orders, revenue, or automatic growth.",
    audiences: ["AI tool-site operators", "Independent developers", "Digital product sellers", "Content creators", "SEO/GEO operators"],
    deliverables: [
      "Product page copy prompt",
      "SEO title and description prompt",
      "FAQ generation prompt",
      "Marketplace listing prompt",
      "AI product demand-mining prompt",
      "Competitor analysis prompt",
      "Weekly review prompt"
    ],
    scenarios: [
      "Draft a clear product page and FAQ for a new AI tool",
      "Improve offer, pricing, delivery, and consultation entry for an existing tool",
      "Prepare compliant drafts for marketplaces and social notes",
      "Review weekly views, clicks, leads, revenue, and next actions"
    ],
    prices: ["CNY 19 starter", "CNY 29 standard", "CNY 39 review pack"],
    faq: [
      ["Who is this for?", "It is for builders and operators who have an AI tool, digital product, or content offer but need clearer copy, listing structure, SEO/GEO prompts, and review templates."],
      ["What is delivered?", "The minimum delivery is Markdown, PDF, and copy-ready prompt documents. The final scope is confirmed before delivery."],
      ["Does it promise rankings or revenue?", "No. It provides operating prompts and copy structure only. It does not promise search ranking, traffic, orders, or revenue."],
      ["Which platforms can it support?", "It can support website product pages, social posts, Xianyu/Taobao-style listings, Whop listings, private messages, and weekly reviews."],
      ["Is customization included?", "The validation version focuses on standardized templates. Custom rewriting can be scoped separately later."],
      ["Can I review the outline first?", "Yes. Email ENHE with your product type, target platform, and current copy problem."],
      ["Is it suitable for non-technical users?", "Yes. The prompts are organized as copy-ready blocks with replaceable variables."],
      ["How will this validation be judged?", "By observed page views, CTA clicks, inquiries, presale intent, and real payments, not by assumptions."]
    ],
    compliance: "Compliance note: no income, ranking, or automatic-growth promise. Real clicks, inquiries, orders, and revenue must be recorded only after they happen.",
    contactNote: "When emailing, include your product type, target platform, and the copy problem you want to solve first."
  }
} as const;

export function generateValidationAiPromptKitMetadata(locale: Locale) {
  const copy = content[locale];
  return buildPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/validation/ai-prompt-kit",
    locale: locale === "en" ? "en_US" : "zh_CN",
    localeKey: locale
  });
}

export function ValidationAiPromptKitPage({ locale }: { locale: Locale }) {
  const copy = content[locale];
  const validationPath = buildLocalePath("/validation/ai-prompt-kit", locale);
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: locale === "en" ? "Home" : "首页", path: buildLocalePath("/", locale) },
      { name: copy.title, path: validationPath }
    ]
  });
  const faqSchema = buildFaqSchema({
    items: copy.faq.map(([question, answer]) => ({ question, answer }))
  });
  const mailHref = `mailto:${supportEmail}?subject=${encodeURIComponent(copy.title)}`;

  return (
    <main>
      <Container className="py-14">
        <StructuredData data={[breadcrumbSchema, faqSchema]} />

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge>{copy.eyebrow}</Badge>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-normal text-[var(--marketing-text)] md:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--marketing-muted)] md:text-lg">
              {copy.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={mailHref}
                className="cursor-target inline-flex min-h-11 items-center justify-center rounded-full border border-[#050505] bg-[#050505] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition hover:bg-[#161616]"
                data-analytics-event="validation_ai_prompt_kit_cta_click"
                data-analytics-entity-type="validation_offer"
                data-analytics-entity-id="ai-prompt-kit"
                data-analytics-meta-surface="hero_primary"
              >
                {copy.primaryCta}
              </Link>
              <Link
                href={buildLocalePath("/software", locale)}
                className="cursor-target inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/7 px-5 py-3 text-sm font-bold text-[var(--marketing-text)] transition hover:border-[var(--marketing-accent)] hover:text-[var(--marketing-accent)]"
                data-analytics-event="validation_ai_prompt_kit_cta_click"
                data-analytics-entity-type="validation_offer"
                data-analytics-entity-id="ai-prompt-kit"
                data-analytics-meta-surface="hero_software"
              >
                {copy.secondaryCta}
              </Link>
              <Link
                href="#price-test"
                className="cursor-target inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/7 px-5 py-3 text-sm font-bold text-[var(--marketing-text)] transition hover:border-[var(--marketing-accent)] hover:text-[var(--marketing-accent)]"
                data-analytics-event="validation_ai_prompt_kit_cta_click"
                data-analytics-entity-type="validation_offer"
                data-analytics-entity-id="ai-prompt-kit"
                data-analytics-meta-surface="hero_price"
              >
                {copy.tertiaryCta}
              </Link>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Image
                src="/images/brand/enhe-icon-gradient-white-bg-cropped.png"
                alt="ENHE AI"
                width={64}
                height={64}
                className="rounded-2xl"
                unoptimized
              />
              <div>
                <p className="text-sm font-bold text-[var(--marketing-accent)]">Prompt Pack Preview</p>
                <p className="mt-1 text-sm text-[var(--marketing-muted)]">Markdown / PDF / Copy-ready document</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {copy.deliverables.slice(0, 5).map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/8 p-4 text-sm font-semibold text-[var(--marketing-text)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass mt-10 rounded-2xl p-7">
          <SectionTitle title={copy.summaryTitle} intro={copy.summary} />
          <div className="grid gap-4 md:grid-cols-2">
            <InfoList title={locale === "en" ? "Best-fit users" : "适合人群"} items={copy.audiences} />
            <InfoList title={locale === "en" ? "Use cases" : "使用场景"} items={copy.scenarios} />
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div id="price-test" className="glass scroll-mt-24 rounded-2xl p-7">
            <SectionTitle title={locale === "en" ? "Price test" : "价格测试"} intro={locale === "en" ? "The prices are validation options, not a fixed public checkout." : "以下价格用于验证意向，不代表已经开通自动支付。"} />
            <div className="grid gap-3">
              {copy.prices.map((price) => (
                <div key={price} className="rounded-xl border border-white/10 bg-white/8 p-4 text-base font-black text-[var(--marketing-text)]">
                  {price}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-7">
            <SectionTitle title={locale === "en" ? "Deliverables" : "交付内容"} />
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.deliverables.map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/8 p-4 text-sm leading-6 text-[var(--marketing-muted)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass mt-10 rounded-2xl p-7">
          <SectionTitle title="FAQ" />
          <div className="grid gap-4 md:grid-cols-2">
            {copy.faq.map(([question, answer]) => (
              <article key={question} className="rounded-xl border border-white/10 bg-white/8 p-5">
                <h2 className="text-base font-black text-[var(--marketing-text)]">{question}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">{answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact-note" className="glass mt-10 rounded-2xl p-7">
          <SectionTitle title={locale === "en" ? "Compliance and next step" : "合规提示与下一步"} intro={copy.compliance} />
          <p className="text-sm leading-7 text-[var(--marketing-muted)]">{copy.contactNote}</p>
          <Link
            href={mailHref}
            className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[#050505] bg-[#050505] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#161616]"
            data-analytics-event="validation_ai_prompt_kit_cta_click"
            data-analytics-entity-type="validation_offer"
            data-analytics-entity-id="ai-prompt-kit"
            data-analytics-meta-surface="bottom_contact"
          >
            {copy.primaryCta}
          </Link>
        </section>
      </Container>
    </main>
  );
}

function InfoList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
      <h2 className="text-lg font-black text-[var(--marketing-text)]">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--marketing-muted)]">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
