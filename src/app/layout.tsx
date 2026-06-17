import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { InteractiveBackground } from "@/components/interactive-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StructuredData } from "@/components/structured-data";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { buildOrganizationSchema, buildPageMetadata, buildWebsiteSchema, getSiteBaseUrl } from "@/lib/seo";
import { getEffectiveLocalizedHomeHeroIntro, getEffectiveSiteLogo, getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, settings] = await Promise.all([getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  const siteDisplayName = getEffectiveSiteName(settings, t.footer.siteName);
  return {
    metadataBase: new URL(getSiteBaseUrl()),
    applicationName: siteDisplayName,
    robots: {
      index: true,
      follow: true
    },
    ...buildPageMetadata({
      title: siteDisplayName,
      description: getEffectiveLocalizedHomeHeroIntro(settings, locale, t.home.intro),
      path: "/",
      locale: locale === "en" ? "en_US" : "zh_CN"
    })
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, settings] = await Promise.all([getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  const siteDisplayName = getEffectiveSiteName(settings, t.footer.siteName);
  const siteLogo = getEffectiveSiteLogo(settings, "/images/enhe-logo.svg");
  const siteDescription = getEffectiveLocalizedHomeHeroIntro(settings, locale, t.home.intro);
  const websiteSchema = buildWebsiteSchema({
    schemaType: "WebSite",
    name: siteDisplayName,
    description: siteDescription,
    inLanguage: locale === "en" ? "en-US" : "zh-CN"
  });
  const organizationSchema = buildOrganizationSchema({
    schemaType: "Organization",
    name: siteDisplayName,
    logo: siteLogo
  });
  return (
    <html lang={locale === "en" ? "en" : "zh-CN"}>
      <body>
        <StructuredData data={[websiteSchema, organizationSchema]} />
        <InteractiveBackground />
        <SiteHeader />
        <AnalyticsTracker />
        <main className="fade-in">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
