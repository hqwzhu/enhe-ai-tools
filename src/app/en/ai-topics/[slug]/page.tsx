import {
  AiTopicDetailPageShell,
  generateAiTopicDetailMetadata,
  generateAiTopicStaticParams,
} from "@/app/ai-topics/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;
export const generateStaticParams = generateAiTopicStaticParams;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return generateAiTopicDetailMetadata({ slug, forceLocale: "en" });
}

export default async function EnglishAiTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PublicSiteChrome forceLocale="en">
      <AiTopicDetailPageShell slug={slug} forceLocale="en" />
    </PublicSiteChrome>
  );
}
