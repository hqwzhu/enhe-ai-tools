import { generateOnlineToolsPageMetadata, OnlineToolsPageShell } from "@/app/online-tools/page-shell";

export const revalidate = 300;

export async function generateMetadata() {
  return generateOnlineToolsPageMetadata("en");
}

export default async function EnglishOnlineToolsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <OnlineToolsPageShell searchParams={searchParams} forceLocale="en" />;
}
