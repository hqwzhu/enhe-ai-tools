import Image from "next/image";
import Link from "next/link";
import { Crown, LayoutDashboard, UserRound } from "lucide-react";
import { setLocaleAction } from "@/app/language-actions";
import { getCurrentUser } from "@/lib/auth";
import { ButtonLink, Container } from "@/components/ui";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";
import { normalizeImageSrc } from "@/lib/media";
import { getActiveMembership } from "@/lib/membership";
import { getEffectiveSiteLogo, getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

export async function SiteHeader() {
  const [user, locale, settings] = await Promise.all([getCurrentUser(), getCurrentLocale(), getSettingsMap()]);
  const membership = user ? await getActiveMembership(user.id) : null;
  const t = getDictionary(locale);
  const brand = getEffectiveSiteName(settings, t.brand);
  const logoSrc = normalizeImageSrc(getEffectiveSiteLogo(settings, "/images/enhe-logo.svg")) ?? "/images/enhe-logo.svg";
  const navItems = [
    [t.nav.home, "/"],
    [t.nav.software, "/software"],
    [t.nav.onlineTools, "/online-tools"],
    [t.nav.pricing, "/pricing"],
    [t.nav.tutorials, "/tutorials"],
    [t.nav.user, "/user"]
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(239,228,197,0.14)] bg-[#04100E]/78 backdrop-blur-2xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-[rgba(239,228,197,0.16)] bg-[rgba(244,238,218,0.08)] shadow-[0_0_24px_rgba(245,198,107,0.12)]">
            <Image src={logoSrc} alt={brand} width={34} height={34} priority unoptimized />
          </span>
          <span className="font-semibold text-[#F4EEDA]">{brand}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 text-sm text-[#8E9B91] hover:bg-[rgba(244,238,218,0.08)] hover:text-[#F4EEDA]">
              {label}
            </Link>
          ))}
          {user?.role === "admin" ? (
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#F5C66B] hover:bg-[rgba(245,198,107,0.12)]">
              <LayoutDashboard size={16} />
              {t.nav.admin}
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} labels={t.language} />
          {user ? (
            <Link href="/user" className="inline-flex items-center gap-2 rounded-full border border-[rgba(239,228,197,0.16)] bg-[rgba(244,238,218,0.05)] px-3 py-2 text-sm text-[#F4EEDA]">
              <span className="relative inline-flex">
                <UserRound size={16} />
                {membership ? (
                  <Crown className="absolute -right-2 -top-2 text-[#F5C66B]" size={12} fill="currentColor" />
                ) : null}
              </span>
              {user.nickname ?? user.email ?? t.nav.userFallback}
            </Link>
          ) : (
            <>
              <span className="hidden sm:inline-flex"><ButtonLink href="/login" variant="ghost">{t.nav.login}</ButtonLink></span>
              <ButtonLink href="/register" variant="ghost">{t.nav.register}</ButtonLink>
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
    <form action={setLocaleAction} className="hidden items-center rounded-full border border-[rgba(239,228,197,0.16)] bg-[rgba(244,238,218,0.06)] p-1 text-xs sm:flex" aria-label={labels.label}>
      {(["zh", "en"] as const).map((item) => (
        <button
          key={item}
          name="locale"
          value={item}
          className={`rounded-full px-3 py-1.5 transition ${locale === item ? "bg-[#F5C66B] text-[#04100E]" : "text-[#8E9B91] hover:text-[#F4EEDA]"}`}
        >
          {labels[item]}
        </button>
      ))}
    </form>
  );
}
