import Link from "next/link";
import { LayoutDashboard, UserRound } from "lucide-react";
import { setLocaleAction } from "@/app/language-actions";
import { FlatEnheLogoSvg } from "@/components/hero-logo-mark";
import { getCurrentUser } from "@/lib/auth";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { ButtonLink, Container } from "@/components/ui";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

export async function SiteHeader() {
  const [user, locale, settings] = await Promise.all([getCurrentUser(), getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  const brand = getEffectiveSiteName(settings, t.brand);
  const brandWordmark = brand.includes("ENHE") ? "ENHE AI" : brand;
  const navItems = [
    [t.nav.home, "/"],
    [t.nav.software, "/software"],
    [t.nav.onlineTools, "/online-tools"],
    [t.nav.skillLearning, "/skill-learning"],
    [t.nav.user, "/user"]
  ] as const;

  return (
    <header className="site-header-transparent sticky top-0 z-50">
      <Container className="site-header-inner flex h-20 max-w-none items-center justify-between gap-4 px-10 sm:px-12 lg:px-12">
        <Link href="/" className="site-brand group" aria-label={brand}>
          <span className="site-brand-mark" aria-hidden="true">
            <FlatEnheLogoSvg className="site-brand-logo" decorative />
          </span>
          <span className="site-brand-wordmark">{brandWordmark}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 text-sm text-[#8F9DB2] hover:bg-[rgba(238,246,255,0.08)] hover:text-[#F6FAFF]">
              {label}
            </Link>
          ))}
          {user?.role === "admin" ? (
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#7DD3FC] hover:bg-[rgba(125,211,252,0.12)]">
              <LayoutDashboard size={16} />
              {t.nav.admin}
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <MobileNavMenu labels={{ menu: t.nav.menu, admin: t.nav.admin }} navItems={navItems} showAdmin={user?.role === "admin"} />
          <LanguageSwitcher locale={locale} labels={t.language} />
          {user ? (
            <Link href="/user" className="inline-flex max-w-[136px] items-center gap-2 truncate rounded-full border border-[rgba(210,230,255,0.16)] bg-[rgba(238,246,255,0.05)] px-3 py-2 text-sm text-[#F6FAFF] sm:max-w-none">
              <span className="relative inline-flex">
                <UserRound size={16} />
              </span>
              <span className="truncate">{user.nickname ?? user.email ?? t.nav.userFallback}</span>
            </Link>
          ) : (
            <>
              <span className="hidden sm:inline-flex"><ButtonLink href="/login" variant="ghost">{t.nav.login}</ButtonLink></span>
              <span className="hidden sm:inline-flex"><ButtonLink href="/register" variant="ghost">{t.nav.register}</ButtonLink></span>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}

function LanguageSwitcher({
  locale,
  labels
}: {
  locale: Locale;
  labels: { label: string; zh: string; en: string };
}) {
  return (
    <form action={setLocaleAction} className="hidden items-center rounded-full border border-[rgba(210,230,255,0.16)] bg-[rgba(238,246,255,0.06)] p-1 text-xs sm:flex" aria-label={labels.label}>
      {(["zh", "en"] as const).map((item) => (
        <button
          key={item}
          name="locale"
          value={item}
          className={`rounded-full px-3 py-1.5 transition ${locale === item ? "bg-[#7DD3FC] text-[#030611]" : "text-[#8F9DB2] hover:text-[#F6FAFF]"}`}
        >
          {labels[item]}
        </button>
      ))}
    </form>
  );
}
