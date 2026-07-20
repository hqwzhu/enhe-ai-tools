import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "ENHE AI user center for orders, downloads, courses, and account settings",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function EnglishUserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader forceLocale="en" />
      <div className="fade-in">{children}</div>
      <SiteFooter forceLocale="en" />
    </>
  );
}
