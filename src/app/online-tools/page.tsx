import { generateOnlineToolsPageMetadata, OnlineToolsPageShell } from "@/app/online-tools/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateOnlineToolsPageMetadata("zh");
}

export default async function OnlineToolsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <PublicSiteChrome forceLocale="zh">
      <OnlineToolsPageShell searchParams={searchParams} forceLocale="zh" />
    </PublicSiteChrome>
  );
}
