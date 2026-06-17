import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { CursorGlow } from "@/components/cursor-glow";
import { InteractiveBackground } from "@/components/interactive-background";
import { StructuredData } from "@/components/structured-data";
import { getDictionary } from "@/lib/dictionaries";
import {
  absoluteUrl,
  buildLanguageAlternates,
  buildOrganizationSchema,
  buildWebsiteSchema,
  defaultSiteDescription,
  getSiteBaseUrl,
  siteName
} from "@/lib/seo";
import { getEffectiveLocalizedHomeHeroIntro, getEffectiveSiteLogo, getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  applicationName: siteName,
  title: siteName,
  description: defaultSiteDescription,
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: absoluteUrl("/"),
    languages: buildLanguageAlternates("/")
  },
  icons: {
    icon: [{ url: "/images/brand/enhe-icon-gradient-white-bg-cropped.png", type: "image/png" }],
    shortcut: "/images/brand/enhe-icon-gradient-white-bg-cropped.png",
    apple: [{ url: "/images/brand/enhe-icon-gradient-white-bg-cropped.png", type: "image/png" }]
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettingsMap();
  const t = getDictionary("zh");
  const siteDisplayName = getEffectiveSiteName(settings, t.footer.siteName);
  const siteLogo = getEffectiveSiteLogo(settings, "/images/enhe-logo.svg");
  const siteDescription = getEffectiveLocalizedHomeHeroIntro(settings, "zh", t.home.intro);
  const websiteSchema = buildWebsiteSchema({
    schemaType: "WebSite",
    name: siteDisplayName,
    description: siteDescription,
    inLanguage: "zh-CN"
  });
  const organizationSchema = buildOrganizationSchema({
    schemaType: "Organization",
    name: siteDisplayName,
    logo: siteLogo
  });

  return (
    <html lang="zh-CN">
      <body>
        <StructuredData data={[websiteSchema, organizationSchema]} />
        <InteractiveBackground />
        <CursorGlow />
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
