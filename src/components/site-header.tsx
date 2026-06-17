import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, UserRound } from "lucide-react";
import { setLocaleAction } from "@/app/language-actions";
import { getCurrentUser } from "@/lib/auth";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { Container } from "@/components/ui";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

const primaryNavItems = [
  ["AI软件应用", "/software"],
  ["AI账号服务", "/online-tools"],
  ["AI技能学习", "/skill-learning"],
  ["更新日志", "/#updates"]
] as const;

const userCenterItem = ["用户中心", "/user"] as const;

export async function SiteHeader() {
  const [user, locale, settings] = await Promise.all([getCurrentUser(), getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  const brand = getEffectiveSiteName(settings, t.brand);
  const brandWordmark = brand.includes("ENHE") ? "ENHE AI" : brand;
  const navItems = primaryNavItems;

  return (
    <header className="site-header-transparent sticky top-0 z-50">
      <Container className="site-header-inner flex max-w-none items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="site-brand group" aria-label={brand}>
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
          {primaryNavItems.map(([label, href]) => (
            <Link key={href} href={href} className="site-nav-link">
              {label}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions flex items-center gap-2">
          {user?.role === "admin" ? (
            <Link href="/admin" className="site-admin-link hidden items-center gap-2 lg:inline-flex">
              <LayoutDashboard size={16} />
              {t.nav.admin}
            </Link>
          ) : null}
          {user ? (
            <Link href={userCenterItem[1]} className="site-user-chip hidden sm:inline-flex">
              <UserRound size={16} />
              <span className="truncate">{user.nickname ?? user.email ?? t.nav.userFallback}</span>
            </Link>
          ) : (
            <Link href="/login" className="site-login-link hidden sm:inline-flex">
              登录
            </Link>
          )}
          <Link href={userCenterItem[1]} className="site-user-center-cta">
            {userCenterItem[0]}
          </Link>
          <LanguageSwitcher locale={locale} labels={t.language} />
          <MobileNavMenu
            labels={{ menu: t.nav.menu, admin: t.nav.admin }}
            navItems={navItems}
            showAdmin={user?.role === "admin"}
            userCenterItem={userCenterItem}
          />
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
    <form action={setLocaleAction} className="site-language-switcher hidden items-center sm:flex" aria-label={labels.label}>
      {(["zh", "en"] as const).map((item) => (
        <button key={item} name="locale" value={item} className={locale === item ? "is-active" : ""}>
          {labels[item]}
        </button>
      ))}
    </form>
  );
}
