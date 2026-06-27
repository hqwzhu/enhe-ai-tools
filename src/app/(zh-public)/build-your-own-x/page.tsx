import {
  BuildYourOwnXPageShell,
  generateBuildYourOwnXPageMetadata,
} from "@/app/build-your-own-x/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateBuildYourOwnXPageMetadata("zh");
}

export default function BuildYourOwnXPage() {
  return (
    <PublicSiteChrome forceLocale="zh">
      <BuildYourOwnXPageShell forceLocale="zh" />
    </PublicSiteChrome>
  );
}
