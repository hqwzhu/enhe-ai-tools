import { generateOnlineToolsPageMetadata, OnlineToolsPageShell } from "@/app/online-tools/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateOnlineToolsPageMetadata("en");
}

export default async function EnglishOnlineToolsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <PublicSiteChrome forceLocale="en">
      <OnlineToolsPageShell searchParams={searchParams} forceLocale="en" />
    </PublicSiteChrome>
  );
}
