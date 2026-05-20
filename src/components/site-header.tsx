import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, UserRound } from "lucide-react";
import { setLocaleAction } from "@/app/language-actions";
import { getCurrentUser } from "@/lib/auth";
import { ButtonLink, Container } from "@/components/ui";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";

export async function SiteHeader() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCurrentLocale()]);
  const t = getDictionary(locale);
  const navItems = [
    [t.nav.home, "/"],
    [t.nav.software, "/software"],
    [t.nav.onlineTools, "/online-tools"],
    [t.nav.pricing, "/pricing"],
    [t.nav.tutorials, "/tutorials"],
    [t.nav.user, "/user"]
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080B12]/72 backdrop-blur-2xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-white/6 shadow-[0_0_24px_rgba(72,245,211,0.16)]">
            <Image src="/images/enhe-logo.svg" alt={t.brand} width={34} height={34} priority />
          </span>
          <span className="font-semibold">{t.brand}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 text-sm text-[#8B95A7] hover:bg-white/8 hover:text-white">
              {label}
            </Link>
          ))}
          {user?.role === "admin" ? (
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#48F5D3] hover:bg-white/8">
              <LayoutDashboard size={16} />
              {t.nav.admin}
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} labels={t.language} />
          {user ? (
            <Link href="/user" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-2 text-sm">
              <UserRound size={16} />
              {user.nickname ?? user.email ?? t.nav.userFallback}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm text-[#8B95A7] sm:inline-flex">
                {t.nav.login}
              </Link>
              <ButtonLink href="/register">{t.nav.register}</ButtonLink>
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
    <form action={setLocaleAction} className="hidden items-center rounded-full border border-white/12 bg-white/5 p-1 text-xs sm:flex" aria-label={labels.label}>
      {(["zh", "en"] as const).map((item) => (
        <button
          key={item}
          name="locale"
          value={item}
          className={`rounded-full px-3 py-1.5 transition ${locale === item ? "bg-[#48F5D3] text-[#07101f]" : "text-[#8B95A7] hover:text-white"}`}
        >
          {labels[item]}
        </button>
      ))}
    </form>
  );
}
