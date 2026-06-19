import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, LockKeyhole, Signal } from "lucide-react";
import { Badge, ButtonLink, Container, EmptyState, SectionTitle } from "@/components/ui";
import { buildAiTrendLoginUrl, getAiTrendBriefingSummaries } from "@/lib/ai-trends";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl, buildMetaDescription, buildMetadataTitle, defaultOgImage, siteName } from "@/lib/seo";

const archivePath = "/ai-trends/daily";

export function generateAiTrendDailyArchiveMetadata(): Metadata {
  const title = buildMetadataTitle({ pageTitle: "AI 需求趋势每日分析", brand: siteName });
  const description = buildMetaDescription("AI 需求趋势每日分析归档。公开用户可阅读摘要，登录用户可阅读完整 HTML 报告。");

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(archivePath)
    },
    robots: {
      index: false,
      follow: true
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(archivePath),
      siteName,
      images: [{ url: absoluteUrl(defaultOgImage), alt: "AI 需求趋势每日分析" }],
      locale: "zh_CN",
      type: "website"
    }
  };
}

export async function AiTrendDailyArchivePageShell() {
  const [briefings, user] = await Promise.all([getAiTrendBriefingSummaries(30), getCurrentUser()]);
  const isLoggedIn = Boolean(user);

  return (
    <Container className="py-14">
      <section className="surface-panel p-7 md:p-10">
        <Badge className="text-[var(--marketing-accent)]">Daily Analysis</Badge>
        <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--marketing-text)] md:text-5xl">AI 需求趋势每日分析</h1>
        <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-[var(--marketing-muted)]">
          每日追踪公开趋势信号，整理“人类最渴望用 AI 解决哪些问题”。公开用户可浏览摘要，登录后可阅读完整视觉化 HTML 报告。
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/ai-trends">返回趋势总览</ButtonLink>
          {!isLoggedIn ? <ButtonLink href={buildAiTrendLoginUrl(new Date().toISOString().slice(0, 10))} variant="ghost">登录查看完整报告</ButtonLink> : null}
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle title="分析归档" intro="这些日更页用于用户分享和阅读，不进入 sitemap，并通过 robots metadata 设置 noindex, follow。" />
        {briefings.length ? (
          <div className="grid gap-5">
            {briefings.map((briefing) => (
              <article key={briefing.id} className="surface-panel-soft p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--marketing-muted)]">
                      <span className="inline-flex items-center gap-2 text-[var(--marketing-accent)]">
                        <CalendarDays size={15} strokeWidth={1.8} aria-hidden="true" />
                        <time dateTime={briefing.slug}>{briefing.slug}</time>
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Signal size={15} strokeWidth={1.8} aria-hidden="true" />
                        {briefing.sourceCount} 个来源信号
                      </span>
                      {!isLoggedIn ? (
                        <span className="inline-flex items-center gap-2">
                          <LockKeyhole size={15} strokeWidth={1.8} aria-hidden="true" />
                          登录后看全文
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-2xl font-black leading-snug text-[var(--marketing-text)]">{briefing.title}</h2>
                    <p className="mt-3 text-base leading-8 text-[var(--marketing-muted)]">{briefing.coreConclusion}</p>
                    {briefing.publicHighlights.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {briefing.publicHighlights.slice(0, 5).map((highlight) => (
                          <Badge key={highlight}>{highlight}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Link href={`/ai-trends/daily/${briefing.slug}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--marketing-accent)]/40 px-5 py-3 text-sm font-bold text-[var(--marketing-accent)] transition hover:border-[var(--marketing-accent)]">
                    {isLoggedIn ? "阅读全文" : "阅读摘要"}
                    <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无分析" text="自动化发布第一份 AI 需求趋势分析后，这里会显示公开摘要。" />
        )}
      </section>
    </Container>
  );
}
