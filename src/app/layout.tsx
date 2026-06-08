import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { InteractiveBackground } from "@/components/interactive-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { buildPageMetadata, getSiteBaseUrl } from "@/lib/seo";
import { getEffectiveLocalizedHomeHeroSubtitle, getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, settings] = await Promise.all([getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(getSiteBaseUrl()),
    applicationName: getEffectiveSiteName(settings, t.footer.siteName),
    robots: {
      index: true,
      follow: true
    },
    ...buildPageMetadata({
      title: locale === "en" ? t.footer.siteName : getEffectiveSiteName(settings, t.footer.siteName),
      description: getEffectiveLocalizedHomeHeroSubtitle(settings, locale, t.home.eyebrow),
      path: "/"
    })
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getCurrentLocale();
  return (
    <html lang={locale === "en" ? "en" : "zh-CN"}>
      <body>
        <InteractiveBackground />
        <SiteHeader />
        <AnalyticsTracker />
        <main className="fade-in">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
