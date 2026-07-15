import {
  AiPromptManagementPageShell,
  generateAiPromptManagementMetadata,
} from "@/app/skill-learning/ai-prompt-management/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateAiPromptManagementMetadata("en");
}

export default function EnglishAiPromptManagementPage() {
  return (
    <PublicSiteChrome forceLocale="en">
      <AiPromptManagementPageShell forceLocale="en" />
    </PublicSiteChrome>
  );
}
