import type { Metadata } from "next";
import "./globals.css";
import { InteractiveBackground } from "@/components/interactive-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "恩禾 ENHE AI工具站",
  description: "自研电脑软件与在线网页工具分享共研平台"
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <InteractiveBackground />
        <SiteHeader />
        <main className="fade-in">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
