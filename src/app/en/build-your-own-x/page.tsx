import {
  BuildYourOwnXPageShell,
  generateBuildYourOwnXPageMetadata,
} from "@/app/build-your-own-x/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateBuildYourOwnXPageMetadata("en");
}

export default function EnglishBuildYourOwnXPage() {
  return (
    <PublicSiteChrome forceLocale="en">
      <BuildYourOwnXPageShell forceLocale="en" />
    </PublicSiteChrome>
  );
}
