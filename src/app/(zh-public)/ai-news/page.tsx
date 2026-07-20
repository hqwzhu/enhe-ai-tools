import { permanentRedirect } from "next/navigation";
import {
  AiNewsPageShell,
  generateAiNewsPageMetadata,
  getAiNewsPageOneRedirectPath,
} from "@/app/ai-news/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return generateAiNewsPageMetadata("zh", await searchParams);
}

export default async function AiNewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const resolvedSearchParams = await searchParams;
  const redirectPath = getAiNewsPageOneRedirectPath(
    resolvedSearchParams,
    "zh",
  );
  if (redirectPath) permanentRedirect(redirectPath);

  return (
    <PublicSiteChrome forceLocale="zh">
      <AiNewsPageShell
        searchParams={Promise.resolve(resolvedSearchParams)}
        forceLocale="zh"
      />
    </PublicSiteChrome>
  );
}
