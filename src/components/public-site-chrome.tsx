import { StructuredData } from "@/components/structured-data";
import { CustomerSupportWidget } from "@/components/customer-support-widget";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCustomerSupportFaqs } from "@/lib/customer-support";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import {
  absoluteUrl,
  buildLanguageAlternates,
  buildLocalePath,
  buildOrganizationSchema,
  buildWebsiteSchema
} from "@/lib/seo";
import {
  getEffectiveLocalizedHomeHeroIntro,
  getEffectiveLocalizedSiteName,
  getEffectiveSiteLogo,
  getSettingsMap
} from "@/lib/settings";

export async function PublicSiteChrome({
  children,
  forceLocale
}: React.PropsWithChildren<{ forceLocale: Locale }>) {
  const settings = await getSettingsMap();
  const t = getDictionary(forceLocale);
  const languageAlternates = buildLanguageAlternates("/");
  const inLanguage = forceLocale === "en" ? "en-US" : "zh-CN";
  const siteDisplayName = getEffectiveLocalizedSiteName(settings, forceLocale, t.footer.siteName);
  const siteLogo = getEffectiveSiteLogo(settings, "/images/brand/enhe-icon-gradient-white-bg-cropped.png");
  const siteDescription = getEffectiveLocalizedHomeHeroIntro(settings, forceLocale, t.home.intro);
  const organizationId = absoluteUrl("/#organization");
  const websiteId = absoluteUrl("/#website");

  // Emit locale-aware WebSite, Organization, and SearchAction schema on public pages only.
  const websiteSchema = buildWebsiteSchema({
    schemaType: "WebSite",
    id: websiteId,
    name: siteDisplayName,
    description: siteDescription,
    url: languageAlternates[inLanguage],
    inLanguage: forceLocale === "en" ? "en-US" : "zh-CN",
    searchPathTemplate: buildLocalePath("/search?q={search_term_string}", forceLocale),
    publisherId: organizationId
  });
  const organizationSchema = buildOrganizationSchema({
    schemaType: "Organization",
    id: organizationId,
    name: siteDisplayName,
    alternateName: ["恩禾 ENHE AI", "恩禾AI"],
    description: siteDescription,
    logo: siteLogo,
    url: absoluteUrl("/"),
    sameAs: ["https://github.com/hqwzhu/enhe-ai-tools"],
    knowsAbout: [
      "AI tools",
      "AI productivity workflows",
      "AI skill learning",
      "local AI deployment",
      "AI account service guidance"
    ],
    subjectOf: [
      {
        name: "ENHE AI brand profile",
        url: absoluteUrl("/about"),
        encodingFormat: "text/html"
      },
      {
        name: "ENHE AI LLM guidance",
        url: absoluteUrl("/llms.txt"),
        encodingFormat: "text/plain"
      }
    ],
    contactPoint: {
      email: "ENHEAI.life@protonmail.com",
      contactType: "customer support",
      availableLanguage: ["zh-CN", "en-US"]
    }
  });

  return (
    <>
      <StructuredData data={[websiteSchema, organizationSchema]} />
      <SiteHeader forceLocale={forceLocale} />
      <div className="fade-in">{children}</div>
      <CustomerSupportWidget locale={forceLocale} faqs={getCustomerSupportFaqs(forceLocale)} />
      <SiteFooter forceLocale={forceLocale} />
    </>
  );
}
