import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, LockKeyhole } from "lucide-react";
import { Badge, ButtonLink, Container, SectionTitle } from "@/components/ui";
import {
  buildAiTrendLoginUrl,
  getAiTrendBriefingByDateSlug,
  isValidAiTrendDateSlug,
  localizeAiTrendBriefingView,
  toAiTrendBriefingView
} from "@/lib/ai-trends";
import { getCurrentUser } from "@/lib/auth";
import { type Locale } from "@/lib/dictionaries";
import { absoluteUrl, buildLocalePath, buildMetaDescription, buildMetadataTitle, defaultOgImage, siteName } from "@/lib/seo";

const copy = {
  zh: {
    description: "AI 需求趋势每日分析详情页。公开展示摘要，登录后阅读完整视觉化 HTML 报告。",
    back: "返回分析归档",
    summary: "公开摘要",
    fullHtml: "完整 HTML 报告",
    loginVisible: "登录可见",
    loginTitle: "登录即可阅读完整报告",
    loginIntro:
      "完整报告包含视觉化 HTML、需求热度排行、方向分析、来源链接和机会优先级建议。这里不要求付费会员，登录账户即可查看。",
    loginButton: "登录看全文",
    sourceSignals: "来源信号",
    openSource: "打开来源",
    noSources: "本期暂无结构化来源信号。",
    trendOverview: "查看趋势总览"
  },
  en: {
    description: "Daily AI demand analysis detail page. Public readers see the summary, and signed-in users can read the full visual HTML report.",
    back: "Back to analysis archive",
    summary: "Public summary",
    fullHtml: "Full HTML report",
    loginVisible: "Visible after sign-in",
    loginTitle: "Log in to read the full report",
    loginIntro:
      "The full report includes visual HTML, demand heat rankings, directional analysis, source links, and opportunity priority notes. No paid membership is required here. A signed-in account is enough.",
    loginButton: "Log in for full access",
    sourceSignals: "Source signals",
    openSource: "Open source",
    noSources: "No structured source signals are available for this issue yet.",
    trendOverview: "View trend overview"
  }
} as const;

export function generateAiTrendDailyDetailMetadata(date: string, locale: Locale = "zh"): Metadata {
  const title = buildMetadataTitle({ pageTitle: `AI Trends Analysis ${date}`, brand: siteName });
  const description = buildMetaDescription(copy[locale].description);
  const path = buildLocalePath(`/ai-trends/daily/${date}`, locale);

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path)
    },
    robots: {
      index: false,
      follow: true
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName,
      images: [{ url: absoluteUrl(defaultOgImage), alt: `AI Trends Analysis ${date}` }],
      locale: locale === "en" ? "en_US" : "zh_CN",
      type: "article"
    }
  };
}

export async function AiTrendDailyDetailPageShell({
  date,
  forceLocale = "zh"
}: {
  date: string;
  forceLocale?: Locale;
}) {
  if (!isValidAiTrendDateSlug(date)) notFound();

  const [briefing, user] = await Promise.all([getAiTrendBriefingByDateSlug(date), getCurrentUser()]);
  if (!briefing) notFound();

  const isLoggedIn = Boolean(user);
  const view = localizeAiTrendBriefingView(toAiTrendBriefingView(briefing, isLoggedIn), forceLocale);
  const loginUrl = buildAiTrendLoginUrl(date, forceLocale);
  const text = copy[forceLocale];

  return (
    <Container className="py-14">
      <Link
        href={buildLocalePath("/ai-trends/daily", forceLocale)}
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--marketing-muted)] transition hover:text-[var(--marketing-accent)]"
      >
        <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
        {text.back}
      </Link>

      <article className="mt-6">
        <section className="surface-panel p-7 md:p-10">
          <div className="flex flex-wrap gap-2">
            <Badge className="text-[var(--marketing-accent)]">AI Demand Analysis</Badge>
            <Badge>{view.sourceCount} source signals</Badge>
            {!isLoggedIn ? <Badge>{text.summary}</Badge> : <Badge>{text.fullHtml}</Badge>}
          </div>
          <h1 className="mt-6 max-w-5xl text-4xl font-black leading-tight text-[var(--marketing-text)] md:text-5xl">{view.title}</h1>
          <time className="mt-4 block text-sm font-bold text-[var(--marketing-accent)]" dateTime={view.slug}>
            {view.slug}
          </time>
          <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-[var(--marketing-muted)]">{view.coreConclusion}</p>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-8">
            <section className="surface-panel-soft p-6">
              <SectionTitle title={text.summary} intro={view.summary} />
              {view.publicHighlights.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {view.publicHighlights.map((highlight) => (
                    <div key={highlight} className="rounded-xl border border-white/10 bg-white/7 p-4 text-sm leading-7 text-[var(--marketing-text)]">
                      {highlight}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            {view.fullHtml ? (
              <section className="surface-panel-soft overflow-hidden p-4 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-black text-[var(--marketing-text)]">{text.fullHtml}</h2>
                  <Badge className="text-[var(--marketing-accent)]">{text.loginVisible}</Badge>
                </div>
                <iframe
                  title={`${view.title} ${text.fullHtml}`}
                  srcDoc={buildAiTrendReportSrcDoc(view.fullHtml)}
                  sandbox="allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                  className="h-[78vh] min-h-[620px] w-full rounded-2xl border border-white/10 bg-white"
                />
              </section>
            ) : (
              <section className="surface-panel-soft p-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--marketing-accent)]/12 text-[var(--marketing-accent)]">
                      <LockKeyhole size={20} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-[var(--marketing-text)]">{text.loginTitle}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--marketing-muted)]">{text.loginIntro}</p>
                  </div>
                  <ButtonLink href={loginUrl}>{text.loginButton}</ButtonLink>
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <section className="surface-panel-soft p-5">
              <h2 className="text-lg font-black text-[var(--marketing-text)]">{text.sourceSignals}</h2>
              <div className="mt-4 grid gap-3">
                {view.sourceSignals.length ? (
                  view.sourceSignals.map((source) => (
                    <a
                      key={`${source.title}-${source.url}`}
                      href={source.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="rounded-xl border border-white/10 bg-white/7 p-4 transition hover:border-[var(--marketing-accent)]/45"
                    >
                      <span className="text-xs font-bold text-[var(--marketing-accent)]">{source.sourceType}</span>
                      <p className="mt-2 text-sm font-bold leading-6 text-[var(--marketing-text)]">{source.title}</p>
                      <p className="mt-2 text-xs leading-5 text-[var(--marketing-muted)]">{source.observedSignal}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--marketing-accent)]">
                        {text.openSource} <ExternalLink size={13} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                    </a>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[var(--marketing-muted)]">{text.noSources}</p>
                )}
              </div>
            </section>
            <ButtonLink href={buildLocalePath("/ai-trends", forceLocale)} variant="ghost" className="w-full">
              {text.trendOverview}
            </ButtonLink>
          </aside>
        </div>
      </article>
    </Container>
  );
}

export function buildAiTrendReportSrcDoc(fullHtml: string) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><base target="_blank"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:#fff;color:#111;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",Arial,sans-serif;}a{color:#c44725}</style></head><body>${fullHtml}</body></html>`;
}
