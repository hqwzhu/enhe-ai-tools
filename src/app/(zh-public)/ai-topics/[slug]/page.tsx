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
  return generateAiTopicDetailMetadata({ slug, forceLocale: "zh" });
}

export default async function AiTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PublicSiteChrome forceLocale="zh">
      <AiTopicDetailPageShell slug={slug} forceLocale="zh" />
    </PublicSiteChrome>
  );
}
