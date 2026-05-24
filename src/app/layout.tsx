import type { Metadata } from "next";
import "./globals.css";
import { InteractiveBackground } from "@/components/interactive-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getEffectiveLocalizedHomeHeroSubtitle, getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, settings] = await Promise.all([getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  return {
    title: locale === "en" ? t.footer.siteName : getEffectiveSiteName(settings, t.footer.siteName),
    description: getEffectiveLocalizedHomeHeroSubtitle(settings, locale, t.home.eyebrow)
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getCurrentLocale();
  return (
    <html lang={locale === "en" ? "en" : "zh-CN"}>
      <body>
        <InteractiveBackground />
        <SiteHeader />
        <main className="fade-in">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
