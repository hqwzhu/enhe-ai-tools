import Image from "next/image";
import Link from "next/link";
import { HeaderAccountControls } from "@/components/header-account-controls";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { Container } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getCurrentLocale } from "@/lib/i18n";
import { buildLocalePath } from "@/lib/seo";
import { getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

export async function SiteHeader({ forceLocale }: { forceLocale?: Locale }) {
  const [locale, settings] = await Promise.all([forceLocale ? Promise.resolve(forceLocale) : getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  const brand = getEffectiveSiteName(settings, t.brand);
  const brandWordmark = brand.includes("ENHE") ? "ENHE AI" : brand;
  const navItems = [
    { label: t.nav.home, href: buildLocalePath("/", locale) },
    { label: t.nav.aiNews, href: buildLocalePath("/ai-news", locale) },
    { label: t.nav.software, href: buildLocalePath("/software", locale) },
    { label: t.nav.onlineTools, href: buildLocalePath("/account-services", locale) },
    { label: t.nav.skillLearning, href: buildLocalePath("/skill-learning", locale) }
  ] as const;

  return (
    <header className="site-header-transparent sticky top-0 z-50">
      <Container className="site-header-inner flex max-w-none items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href={buildLocalePath("/", locale)} className="site-brand group" aria-label={brand}>
          <span className="site-brand-mark" aria-hidden="true">
            <Image
              src="/images/brand/enhe-icon-gradient-transparent-cropped.png"
              alt=""
              width={92}
              height={60}
              className="site-brand-logo site-brand-logo-dark"
              priority
              unoptimized
            />
          </span>
          <span className="site-brand-wordmark">{brandWordmark}</span>
        </Link>

        <nav className="site-primary-nav hidden items-center lg:flex" aria-label="Primary navigation">
          {navItems.map(({ label, href }) => (
            <Link key={href} href={href} className="site-nav-link">
              {label}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions flex items-center gap-2">
          <HeaderAccountControls
            labels={{ login: t.nav.login, userFallback: t.nav.userFallback }}
            locale={locale}
          />
          <Link href={buildLocalePath("/login", locale)} className="sr-only">
            {t.nav.login}
          </Link>
          <Link href={buildLocalePath("/user", locale)} className="site-user-center-cta">
            {t.nav.user}
          </Link>
          <LanguageSwitcher locale={locale} labels={t.language} />
          <MobileNavMenu
            labels={{ menu: t.nav.menu }}
            navItems={navItems}
            showAdmin={false}
            loginItem={[t.nav.login, buildLocalePath("/login", locale)]}
            userCenterItem={[t.nav.user, buildLocalePath("/user", locale)]}
          />
        </div>
      </Container>
    </header>
  );
}
