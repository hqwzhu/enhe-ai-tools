import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  FileSearch,
  GraduationCap,
  HeartHandshake,
  LineChart,
  Scale,
  Sparkles,
  Video,
  WalletCards
} from "lucide-react";
import { StructuredData } from "@/components/structured-data";
import { Badge, ButtonLink, Container, SectionTitle } from "@/components/ui";
import { getAiTrendBriefingSummaries, localizeAiTrendBriefingView } from "@/lib/ai-trends";
import { type Locale } from "@/lib/dictionaries";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildLocalePath,
  buildMetaDescription,
  buildMetadataTitle,
  defaultOgImage,
  siteName
} from "@/lib/seo";

const topicPath = "/ai-trends";

const content = {
  zh: {
    title: "人类最渴望用 AI 解决哪些问题",
    description:
      "ENHE AI 持续整理公开趋势信号，观察用户最希望用 AI 解决的工作效率、视频生成、内容创作、编程、学习、搜索研究、营销销售和生活辅助问题。",
    hero:
      "核心结论：用户最渴望 AI 解决的不是抽象智能问题，而是把高频、耗时、需要专业判断的任务变成可复用、可验证、可交付的工作流。",
    demandTitle: "需求热度排行",
    demandIntro:
      "热度不是单一搜索量，而是综合公开趋势信号、产品更新密度、创作者和开发者讨论、商业化成熟度后的判断。",
    prioritiesTitle: "机会优先级建议",
    prioritiesIntro: "优先做高频、低合规风险、能明确节省时间或增加收入的任务型产品。",
    recentTitle: "近期分析",
    recentIntro:
      "每日自动化报告公开摘要可分享，完整 HTML 报告登录后阅读；日更页不会进入 sitemap，也不会参与索引竞争。",
    dailyButton: "查看每日分析",
    newsButton: "查看 AI 前沿资讯",
    readSummary: "阅读摘要",
    emptyRecent: "还没有已发布的每日分析。自动化发布后，这里会显示最近的公开摘要。",
    home: "首页",
    aiTrends: "AI 趋势分析"
  },
  en: {
    title: "What People Most Want AI To Solve",
    description:
      "ENHE AI tracks public demand signals to understand where people most want AI to help across productivity, video, content, coding, learning, research, sales, and everyday assistance.",
    hero:
      "Core conclusion: people do not mainly want abstract intelligence. They want AI to turn high-frequency, time-consuming, judgment-heavy work into repeatable, verifiable, deliverable workflows.",
    demandTitle: "Demand heat ranking",
    demandIntro:
      "Heat is not just search volume. It combines public demand signals, release cadence, creator discussion, developer momentum, and commercial maturity.",
    prioritiesTitle: "Opportunity priorities",
    prioritiesIntro:
      "Prioritize task-shaped products with frequent use, lower compliance risk, and clear time-saving or revenue impact.",
    recentTitle: "Recent analysis",
    recentIntro:
      "Daily automated reports publish public summaries for sharing. Full HTML reports are available after sign-in. Daily pages stay out of sitemap and do not compete for indexing.",
    dailyButton: "View daily analysis",
    newsButton: "View AI news",
    readSummary: "Read summary",
    emptyRecent: "No published daily analysis yet. Recent public summaries will appear here after automated publishing runs.",
    home: "Home",
    aiTrends: "AI Trends"
  }
} as const;

const demandDirections = [
  {
    zhName: "工作效率",
    enName: "Work productivity",
    heat: 96,
    zhSignal: "搜索趋势 / SaaS 产品发布 / 企业预算",
    enSignal: "Search trends / SaaS releases / enterprise budgets",
    icon: BriefcaseBusiness
  },
  {
    zhName: "视频生成",
    enName: "Video generation",
    heat: 92,
    zhSignal: "创作者社区 / 模型更新 / 工具榜单",
    enSignal: "Creator communities / model updates / tool rankings",
    icon: Video
  },
  {
    zhName: "内容创作",
    enName: "Content creation",
    heat: 89,
    zhSignal: "社媒讨论 / 模板市场 / 自媒体需求",
    enSignal: "Social discussion / template markets / creator demand",
    icon: Sparkles
  },
  {
    zhName: "编程开发",
    enName: "Coding and development",
    heat: 86,
    zhSignal: "开发者工具 / GitHub 生态 / IDE 集成",
    enSignal: "Developer tools / GitHub ecosystem / IDE integration",
    icon: Code2
  },
  {
    zhName: "学习教育",
    enName: "Learning and education",
    heat: 81,
    zhSignal: "课程产品 / 家庭学习 / 语言学习",
    enSignal: "Course products / family learning / language learning",
    icon: GraduationCap
  },
  {
    zhName: "搜索研究",
    enName: "Search and research",
    heat: 79,
    zhSignal: "AI 搜索 / 知识库 / 研究助手",
    enSignal: "AI search / knowledge bases / research assistants",
    icon: FileSearch
  },
  {
    zhName: "营销销售",
    enName: "Marketing and sales",
    heat: 75,
    zhSignal: "CRM / 广告素材 / 客户触达",
    enSignal: "CRM / ad assets / customer outreach",
    icon: LineChart
  },
  {
    zhName: "办公自动化",
    enName: "Office automation",
    heat: 72,
    zhSignal: "文档表格 / 会议纪要 / 流程编排",
    enSignal: "Docs and sheets / meeting notes / workflow orchestration",
    icon: WalletCards
  },
  {
    zhName: "情感陪伴",
    enName: "Companion experiences",
    heat: 66,
    zhSignal: "消费应用 / 社区反馈 / 长时互动",
    enSignal: "Consumer apps / community feedback / long sessions",
    icon: HeartHandshake
  },
  {
    zhName: "财务法律辅助",
    enName: "Finance and legal support",
    heat: 61,
    zhSignal: "高风险咨询 / 合同审阅 / 合规工具",
    enSignal: "Higher-risk advisory / contract review / compliance tools",
    icon: Scale
  }
] as const;

const opportunityPriorities = [
  {
    level: "A",
    zhTitle: "可量化省时的工作流",
    enTitle: "Quantifiable time-saving workflows",
    zhDetail: "最适合先做工具化和服务化，用户愿意为稳定交付、模板和流程集成付费。",
    enDetail:
      "Best for productization and service packaging. Users are willing to pay for reliable delivery, templates, and workflow integration."
  },
  {
    level: "A",
    zhTitle: "视频与多模态内容生产",
    enTitle: "Video and multimodal production",
    zhDetail: "需求热但竞争强，机会在垂直场景、素材管理、版权合规和批量生产。",
    enDetail:
      "Demand is hot but competition is strong. Opportunity sits in vertical use cases, asset management, rights compliance, and batch production."
  },
  {
    level: "B",
    zhTitle: "搜索研究与学习助手",
    enTitle: "Research and learning assistants",
    zhDetail: "适合做可信来源、任务型研究包和教育陪练，重点是引用透明与结果可复核。",
    enDetail:
      "Good for trustworthy-source workflows, task-shaped research packs, and education companions where transparent sourcing matters."
  },
  {
    level: "C",
    zhTitle: "情感、健康、财务与法律辅助",
    enTitle: "Emotional, health, finance, and legal assistance",
    zhDetail: "用户痛点真实，但需要更强边界、免责声明、人工转介和合规设计。",
    enDetail:
      "The pain points are real, but these areas need stronger guardrails, disclaimers, human escalation, and compliance design."
  }
] as const;

export function generateAiTrendTopicMetadata(locale: Locale = "zh"): Metadata {
  const copy = content[locale];
  const title = buildMetadataTitle({ pageTitle: copy.title, brand: siteName });
  const description = buildMetaDescription(copy.description);
  const canonicalPath = buildLocalePath(topicPath, locale);

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(canonicalPath)
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonicalPath),
      siteName,
      images: [{ url: absoluteUrl(defaultOgImage), alt: copy.title }],
      locale: locale === "en" ? "en_US" : "zh_CN",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(defaultOgImage)]
    }
  };
}

export async function AiTrendTopicPageShell({ forceLocale = "zh" }: { forceLocale?: Locale } = {}) {
  const copy = content[forceLocale];
  const recentBriefings = (await getAiTrendBriefingSummaries(3)).map((briefing) => localizeAiTrendBriefingView(briefing, forceLocale));
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: copy.home, path: buildLocalePath("/", forceLocale) },
      { name: copy.aiTrends, path: buildLocalePath(topicPath, forceLocale) }
    ]
  });
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.title,
    description: copy.description,
    url: absoluteUrl(buildLocalePath(topicPath, forceLocale)),
    inLanguage: forceLocale === "en" ? "en-US" : "zh-CN"
  };

  return (
    <Container className="py-14">
      <StructuredData data={[breadcrumbSchema, collectionSchema]} />
      <section className="surface-panel overflow-hidden p-7 md:p-10">
        <div className="max-w-4xl">
          <Badge className="text-[var(--marketing-accent)]">AI Demand Trends</Badge>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-[var(--marketing-text)] md:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-[var(--marketing-muted)] md:text-lg">
            {copy.hero}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href={buildLocalePath("/ai-trends/daily", forceLocale)}>{copy.dailyButton}</ButtonLink>
            <ButtonLink href={buildLocalePath("/ai-news", forceLocale)} variant="ghost">
              {copy.newsButton}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <Badge className="text-[var(--marketing-accent)]">TOP</Badge>
        <SectionTitle title={copy.demandTitle} intro={copy.demandIntro} />
        <div className="grid gap-4 md:grid-cols-2">
          {demandDirections.map((item) => (
            <article key={item.zhName} className="surface-panel-soft p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--marketing-accent)]/12 text-[var(--marketing-accent)]">
                    <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-black text-[var(--marketing-text)]">
                      {forceLocale === "en" ? item.enName : item.zhName}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--marketing-muted)]">
                      {forceLocale === "en" ? item.enSignal : item.zhSignal}
                    </p>
                  </div>
                </div>
                <strong className="text-2xl font-black text-[var(--marketing-accent)]">{item.heat}</strong>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/8">
                <div className="h-full rounded-full bg-[var(--marketing-accent)]" style={{ width: `${item.heat}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle title={copy.prioritiesTitle} intro={copy.prioritiesIntro} />
        <div className="grid gap-4 lg:grid-cols-4">
          {opportunityPriorities.map((item) => (
            <article key={`${item.level}-${item.zhTitle}`} className="surface-panel-soft p-5">
              <Badge className="text-[var(--marketing-accent)]">Priority {item.level}</Badge>
              <h2 className="mt-4 text-lg font-black leading-snug text-[var(--marketing-text)]">
                {forceLocale === "en" ? item.enTitle : item.zhTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">
                {forceLocale === "en" ? item.enDetail : item.zhDetail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle title={copy.recentTitle} intro={copy.recentIntro} />
        {recentBriefings.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recentBriefings.map((briefing) => (
              <Link
                key={briefing.id}
                href={buildLocalePath(`/ai-trends/daily/${briefing.slug}`, forceLocale)}
                className="surface-panel-soft group block p-5 transition hover:border-[var(--marketing-accent)]/45"
              >
                <time className="text-xs font-bold text-[var(--marketing-accent)]" dateTime={briefing.slug}>
                  {briefing.slug}
                </time>
                <h2 className="mt-3 text-lg font-black leading-snug text-[var(--marketing-text)]">{briefing.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--marketing-muted)]">{briefing.coreConclusion}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--marketing-accent)]">
                  {copy.readSummary} <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="surface-panel-soft p-7">
            <p className="text-sm leading-7 text-[var(--marketing-muted)]">{copy.emptyRecent}</p>
          </div>
        )}
      </section>
    </Container>
  );
}
