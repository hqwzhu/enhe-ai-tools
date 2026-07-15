import {
  AiPromptManagementPageShell,
  generateAiPromptManagementMetadata,
} from "@/app/skill-learning/ai-prompt-management/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateAiPromptManagementMetadata("zh");
}

export default function AiPromptManagementPage() {
  return (
    <PublicSiteChrome forceLocale="zh">
      <AiPromptManagementPageShell forceLocale="zh" />
    </PublicSiteChrome>
  );
}
