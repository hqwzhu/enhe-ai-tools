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
  return generateAiNewsPageMetadata("en", await searchParams);
}

export default async function EnglishAiNewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const resolvedSearchParams = await searchParams;
  const redirectPath = getAiNewsPageOneRedirectPath(
    resolvedSearchParams,
    "en",
  );
  if (redirectPath) permanentRedirect(redirectPath);

  return (
    <PublicSiteChrome forceLocale="en">
      <AiNewsPageShell
        searchParams={Promise.resolve(resolvedSearchParams)}
        forceLocale="en"
      />
    </PublicSiteChrome>
  );
}
