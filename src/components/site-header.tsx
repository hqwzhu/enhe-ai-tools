import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { getHeaderUserSnapshot } from "@/lib/auth";
import { HeaderAdminNavLink } from "@/components/header-admin-nav-link";
import { HeaderAccountControls } from "@/components/header-account-controls";
import { HeaderSessionGate } from "@/components/header-session-gate";
import { BackNavigationBar } from "@/components/back-navigation-bar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PrefetchLink } from "@/components/prefetch-link";
import { Container } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getCurrentLocale } from "@/lib/i18n";
import { buildLocalePath } from "@/lib/seo";
import { getEffectiveLocalizedSiteName, getSettingsMap } from "@/lib/settings";

function softwareSearchHref(query: string, locale: Locale) {
  return buildLocalePath(`/software?q=${encodeURIComponent(query)}`, locale);
}

export async function SiteHeader({ forceLocale }: { forceLocale?: Locale }) {
  const [locale, settings, headerUser] = await Promise.all([
    forceLocale ? Promise.resolve(forceLocale) : getCurrentLocale(),
    getSettingsMap(),
    getHeaderUserSnapshot()
  ]);
  const t = getDictionary(locale);
  const brand = getEffectiveLocalizedSiteName(settings, locale, t.brand);
  const brandWordmark = brand.includes("ENHE") ? "ENHE AI" : brand;
  const navItems = [
    { label: t.nav.home, href: buildLocalePath("/", locale) },
    { label: t.nav.aiNews, href: buildLocalePath("/ai-news", locale) },
    { label: t.nav.aiTrends, href: buildLocalePath("/ai-trends", locale) },
    {
      label: t.nav.software,
      href: buildLocalePath("/software", locale),
      children: [
        {
          label: locale === "en" ? "AI video generation" : "AI视频生成",
          href: softwareSearchHref(locale === "en" ? "AI video generation" : "AI视频生成", locale),
          description: locale === "en" ? "Video creation and generation tools" : "视频创作与生成工具"
        },
        {
          label: locale === "en" ? "AI voice generation" : "AI语音生成",
          href: softwareSearchHref(locale === "en" ? "AI voice generation" : "AI语音生成", locale),
          description: locale === "en" ? "Voice, narration, and audio generation" : "语音、旁白与音频生成"
        },
        {
          label: locale === "en" ? "AI agents" : "AI智能体",
          href: softwareSearchHref(locale === "en" ? "AI agent" : "AI智能体", locale),
          description: locale === "en" ? "Agent tools and workflow automation" : "智能体工具与自动化流程"
        },
        {
          label: locale === "en" ? "AI video/image processing" : "AI 视频/图片处理",
          href: softwareSearchHref(locale === "en" ? "AI video image processing" : "AI视频图片处理", locale),
          description: locale === "en" ? "Media editing, enhancement, and repair" : "视频图片编辑、增强与修复"
        },
        {
          label: locale === "en" ? "AI productivity" : "AI提升效率",
          href: softwareSearchHref(locale === "en" ? "AI productivity" : "AI提升效率", locale),
          description: locale === "en" ? "Tools for daily work and productivity" : "提升日常工作效率的工具"
        }
      ]
    },
    {
      label: t.nav.onlineTools,
      href: buildLocalePath("/account-services", locale),
      children: [
        {
          label: t.nav.onlineTools,
          href: buildLocalePath("/account-services", locale),
          description: locale === "en" ? "Account access guidance and service notes" : "账号使用支持与服务说明"
        },
        {
          label: locale === "en" ? "Pricing" : "价格与购买说明",
          href: buildLocalePath("/pricing", locale),
          description: locale === "en" ? "Review payment, delivery, and refund rules" : "查看付费、交付与退款规则"
        }
      ]
    },
    {
      label: t.nav.skillLearning,
      href: buildLocalePath("/skill-learning", locale),
      children: [
        {
          label: t.nav.skillLearning,
          href: buildLocalePath("/skill-learning", locale),
          description: locale === "en" ? "AI workflows, prompts, and practical courses" : "AI 工作流、提示词与实战课程"
        },
        {
          label: locale === "en" ? "Build Your Own X Navigator" : "Build Your Own X 项目导航器",
          href: buildLocalePath("/build-your-own-x", locale),
          description: locale === "en" ? "Free project selector for hands-on developers" : "免费项目筛选器，适合动手提升工程能力"
        },
        {
          label: t.nav.tutorials,
          href: buildLocalePath("/tutorials", locale),
          description: locale === "en" ? "Implementation guides and tool walkthroughs" : "工具教程与落地操作指南"
        }
      ]
    }
  ] as const;

  return (
    <>
      <header className="site-header-transparent sticky top-0 z-50">
        <Container className="site-header-inner flex max-w-none items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <PrefetchLink href={buildLocalePath("/", locale)} className="site-brand cursor-target group" aria-label={brand}>
            <span className="site-brand-mark" aria-hidden="true">
              <Image
                src="/images/brand/enhe-icon-gradient-transparent-cropped.png"
                alt={`${brandWordmark} logo`}
                width={92}
                height={60}
                className="site-brand-logo site-brand-logo-dark"
                priority
                unoptimized
              />
            </span>
            <span className="site-brand-wordmark">{brandWordmark}</span>
          </PrefetchLink>

          <nav className="site-primary-nav hidden items-center lg:flex" aria-label="Primary navigation">
            {navItems.map((item) =>
              "children" in item ? (
                <details key={item.href} className="site-nav-dropdown">
                  <summary className="site-nav-link site-nav-dropdown-trigger cursor-target">
                    <span>{item.label}</span>
                    <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
                  </summary>
                  <div className="site-nav-dropdown-panel">
                    {item.children.map((child) => (
                      <PrefetchLink key={child.href} href={child.href} className="site-nav-dropdown-link cursor-target">
                        <span>{child.label}</span>
                        <small>{child.description}</small>
                      </PrefetchLink>
                    ))}
                  </div>
                </details>
              ) : (
                <PrefetchLink key={item.href} href={item.href} className="site-nav-link cursor-target">
                  {item.label}
                </PrefetchLink>
              )
            )}
            <HeaderAdminNavLink locale={locale} label={t.nav.admin} initialUser={headerUser} />
          </nav>

          <div className="site-header-actions flex items-center gap-2">
            <HeaderAccountControls
              labels={{ login: t.nav.login, userFallback: t.nav.userFallback }}
              locale={locale}
              initialUser={headerUser}
            />
            <PrefetchLink href={buildLocalePath("/login", locale)} className="sr-only">
              {t.nav.login}
            </PrefetchLink>
            <PrefetchLink href={buildLocalePath("/user", locale)} className="site-user-center-cta cursor-target hidden sm:inline-flex">
              {t.nav.user}
            </PrefetchLink>
            <LanguageSwitcher locale={locale} labels={t.language} />
            <HeaderSessionGate
              locale={locale}
              labels={{ admin: t.nav.admin, login: t.nav.login, menu: t.nav.menu, user: t.nav.user, zh: t.language.zh, en: t.language.en }}
              navItems={navItems}
              initialUser={headerUser}
            />
          </div>
        </Container>
      </header>
      <BackNavigationBar locale={locale} />
    </>
  );
}
