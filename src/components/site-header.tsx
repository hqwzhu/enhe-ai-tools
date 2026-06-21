import Image from "next/image";
import { getHeaderUserSnapshot } from "@/lib/auth";
import { HeaderAdminNavLink } from "@/components/header-admin-nav-link";
import { HeaderAccountControls } from "@/components/header-account-controls";
import { HeaderSessionGate } from "@/components/header-session-gate";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PrefetchLink } from "@/components/prefetch-link";
import { Container } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getCurrentLocale } from "@/lib/i18n";
import { buildLocalePath } from "@/lib/seo";
import { getEffectiveLocalizedSiteName, getSettingsMap } from "@/lib/settings";

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
    { label: t.nav.software, href: buildLocalePath("/software", locale) },
    { label: t.nav.onlineTools, href: buildLocalePath("/account-services", locale) },
    { label: t.nav.skillLearning, href: buildLocalePath("/skill-learning", locale) }
  ] as const;

  return (
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
          {navItems.map(({ label, href }) => (
            <PrefetchLink key={href} href={href} className="site-nav-link cursor-target">
              {label}
            </PrefetchLink>
          ))}
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
          <PrefetchLink href={buildLocalePath("/user", locale)} className="site-user-center-cta cursor-target">
            {t.nav.user}
          </PrefetchLink>
          <LanguageSwitcher locale={locale} labels={t.language} />
          <HeaderSessionGate
            locale={locale}
            labels={{ admin: t.nav.admin, login: t.nav.login, menu: t.nav.menu, user: t.nav.user }}
            navItems={navItems}
            initialUser={headerUser}
          />
        </div>
      </Container>
    </header>
  );
}
