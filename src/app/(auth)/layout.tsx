import "../globals.css";
import type { Metadata } from "next";
import { RootDocument, sharedRootMetadata } from "@/app/root-layout-shared";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  ...sharedRootMetadata,
  title: "ENHE AI account access",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale();

  return (
    <RootDocument lang={locale === "en" ? "en-US" : "zh-CN"}>
      <SiteHeader />
      <div className="fade-in">{children}</div>
      <SiteFooter />
    </RootDocument>
  );
}
