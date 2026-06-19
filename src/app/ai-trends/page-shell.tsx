import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Code2, FileSearch, GraduationCap, HeartHandshake, LineChart, Scale, Sparkles, Video, WalletCards } from "lucide-react";
import { StructuredData } from "@/components/structured-data";
import { Badge, ButtonLink, Container, SectionTitle } from "@/components/ui";
import { getAiTrendBriefingSummaries } from "@/lib/ai-trends";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildMetaDescription,
  buildMetadataTitle,
  defaultOgImage,
  siteName
} from "@/lib/seo";

const topicPath = "/ai-trends";
const topicTitle = "人类最渴望用 AI 解决哪些问题";
const topicDescription =
  "ENHE AI 持续整理公开趋势信号，观察用户最希望用 AI 解决的工作效率、视频生成、内容创作、编程、学习、搜索研究、营销销售和生活辅助问题。";

const demandDirections = [
  { name: "工作效率", heat: 96, signal: "搜索趋势 / SaaS 产品发布 / 企业预算", icon: BriefcaseBusiness },
  { name: "视频生成", heat: 92, signal: "创作者社区 / 模型更新 / 工具榜单", icon: Video },
  { name: "内容创作", heat: 89, signal: "社媒讨论 / 模板市场 / 自媒体需求", icon: Sparkles },
  { name: "编程开发", heat: 86, signal: "开发者工具 / GitHub 生态 / IDE 集成", icon: Code2 },
  { name: "学习教育", heat: 81, signal: "课程产品 / 家庭学习 / 语言学习", icon: GraduationCap },
  { name: "搜索研究", heat: 79, signal: "AI 搜索 / 知识库 / 研究助手", icon: FileSearch },
  { name: "营销销售", heat: 75, signal: "CRM / 广告素材 / 客户触达", icon: LineChart },
  { name: "办公自动化", heat: 72, signal: "文档表格 / 会议纪要 / 流程编排", icon: WalletCards },
  { name: "情感陪伴", heat: 66, signal: "消费者应用 / 社区反馈 / 长时互动", icon: HeartHandshake },
  { name: "财务法律辅助", heat: 61, signal: "高风险咨询 / 合同审阅 / 合规工具", icon: Scale }
] as const;

const opportunityPriorities = [
  {
    level: "优先级 A",
    title: "可量化省时的工作流",
    detail: "最适合先做工具化和服务化，用户愿意为稳定交付、模板和流程集成付费。"
  },
  {
    level: "优先级 A",
    title: "视频与多模态内容生产",
    detail: "需求热但竞争强，机会在垂直场景、素材管理、版权合规和批量生产。"
  },
  {
    level: "优先级 B",
    title: "搜索研究与学习助手",
    detail: "适合做可信来源、任务型研究包和教育陪练，重点是引用透明与结果可复核。"
  },
  {
    level: "优先级 C",
    title: "情感、健康、财务和法律辅助",
    detail: "用户痛点真实，但需要更强边界、免责声明、人工转介和合规设计。"
  }
] as const;

export function generateAiTrendTopicMetadata(): Metadata {
  const title = buildMetadataTitle({ pageTitle: topicTitle, brand: siteName });
  const description = buildMetaDescription(topicDescription);

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(topicPath)
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(topicPath),
      siteName,
      images: [{ url: absoluteUrl(defaultOgImage), alt: topicTitle }],
      locale: "zh_CN",
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

export async function AiTrendTopicPageShell() {
  const recentBriefings = await getAiTrendBriefingSummaries(3);
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: "首页", path: "/" },
      { name: topicTitle, path: topicPath }
    ]
  });
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topicTitle,
    description: topicDescription,
    url: absoluteUrl(topicPath),
    inLanguage: "zh-CN"
  };

  return (
    <Container className="py-14">
      <StructuredData data={[breadcrumbSchema, collectionSchema]} />
      <section className="surface-panel overflow-hidden p-7 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-end">
          <div>
            <Badge className="text-[var(--marketing-accent)]">AI Demand Trends</Badge>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-[var(--marketing-text)] md:text-6xl">
              {topicTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-[var(--marketing-muted)] md:text-lg">
              核心结论：用户最渴望 AI 解决的不是抽象智能问题，而是把高频、耗时、需要专业判断的任务变成可复用、可验证、可交付的工作流。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/ai-trends/daily">查看每日晨报</ButtonLink>
              <ButtonLink href="/ai-news" variant="ghost">查看 AI 前沿资讯</ButtonLink>
            </div>
          </div>
          <div className="grid gap-3">
            {demandDirections.slice(0, 5).map((item, index) => (
              <div key={item.name} className="rounded-2xl border border-white/10 bg-white/7 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--marketing-accent)]/14 text-[var(--marketing-accent)]">
                      <item.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-bold text-[var(--marketing-text)]">#{index + 1} {item.name}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--marketing-muted)]">{item.signal}</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[var(--marketing-accent)]">{item.heat}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-[var(--marketing-accent)]" style={{ width: `${item.heat}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle
          title="需求热度排行"
          intro="热度不是单一搜索量，而是综合公开趋势信号、产品更新密度、创作者和开发者讨论、商业化成熟度后的判断。"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {demandDirections.map((item) => (
            <article key={item.name} className="surface-panel-soft p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--marketing-accent)]/12 text-[var(--marketing-accent)]">
                    <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-black text-[var(--marketing-text)]">{item.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--marketing-muted)]">{item.signal}</p>
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
        <SectionTitle title="机会优先级建议" intro="优先做高频、低合规风险、能明确节省时间或增加收入的任务型产品。" />
        <div className="grid gap-4 lg:grid-cols-4">
          {opportunityPriorities.map((item) => (
            <article key={`${item.level}-${item.title}`} className="surface-panel-soft p-5">
              <Badge className="text-[var(--marketing-accent)]">{item.level}</Badge>
              <h2 className="mt-4 text-lg font-black leading-snug text-[var(--marketing-text)]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle title="近期晨报" intro="每日自动化报告公开摘要可分享，完整 HTML 报告登录后阅读；日更页不会进入 sitemap，也不会参与索引竞争。" />
        {recentBriefings.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recentBriefings.map((briefing) => (
              <Link key={briefing.id} href={`/ai-trends/daily/${briefing.slug}`} className="surface-panel-soft group block p-5 transition hover:border-[var(--marketing-accent)]/45">
                <time className="text-xs font-bold text-[var(--marketing-accent)]" dateTime={briefing.slug}>
                  {briefing.slug}
                </time>
                <h2 className="mt-3 text-lg font-black leading-snug text-[var(--marketing-text)]">{briefing.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--marketing-muted)]">{briefing.coreConclusion}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--marketing-accent)]">
                  阅读摘要 <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="surface-panel-soft p-7">
            <p className="text-sm leading-7 text-[var(--marketing-muted)]">
              还没有已发布的每日晨报。自动化发布后，这里会显示最近的公开摘要。
            </p>
          </div>
        )}
      </section>
    </Container>
  );
}
