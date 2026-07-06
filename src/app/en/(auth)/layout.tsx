import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "ENHE AI account access",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function EnglishAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader forceLocale="en" />
      <div className="fade-in">{children}</div>
      <SiteFooter forceLocale="en" />
    </>
  );
}
