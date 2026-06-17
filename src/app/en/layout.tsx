import { PublicSiteChrome } from "@/components/public-site-chrome";

export default async function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <PublicSiteChrome forceLocale="en">{children}</PublicSiteChrome>;
}
