import { AboutPageShell, generateAboutPageMetadata } from "@/app/about/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateAboutPageMetadata("zh");
}

export default function AboutPage() {
  return (
    <PublicSiteChrome forceLocale="zh">
      <AboutPageShell forceLocale="zh" />
    </PublicSiteChrome>
  );
}
