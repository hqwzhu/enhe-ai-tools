import {
  AiTopicsHubPageShell,
  generateAiTopicsHubMetadata,
} from "@/app/ai-topics/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateAiTopicsHubMetadata("en");
}

export default function EnglishAiTopicsPage() {
  return (
    <PublicSiteChrome forceLocale="en">
      <AiTopicsHubPageShell forceLocale="en" />
    </PublicSiteChrome>
  );
}
