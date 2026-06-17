import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function PublicSiteChrome({ children, forceLocale }: React.PropsWithChildren<{ forceLocale?: "zh" | "en" }>) {
  return (
    <>
      <SiteHeader forceLocale={forceLocale} />
      <div className="fade-in">{children}</div>
      <SiteFooter forceLocale={forceLocale} />
    </>
  );
}
