import { AboutPageShell, generateAboutPageMetadata } from "@/app/about/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateAboutPageMetadata("en");
}

export default function EnglishAboutPage() {
  return (
    <PublicSiteChrome forceLocale="en">
      <AboutPageShell forceLocale="en" />
    </PublicSiteChrome>
  );
}
