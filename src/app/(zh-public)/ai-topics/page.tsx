import {
  AiTopicsHubPageShell,
  generateAiTopicsHubMetadata,
} from "@/app/ai-topics/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateAiTopicsHubMetadata("zh");
}

export default function AiTopicsPage() {
  return (
    <PublicSiteChrome forceLocale="zh">
      <AiTopicsHubPageShell forceLocale="zh" />
    </PublicSiteChrome>
  );
}
