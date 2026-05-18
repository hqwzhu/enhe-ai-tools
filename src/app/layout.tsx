import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "恩禾 ENHE AI工具站",
  description: "自研电脑软件与在线网页工具会员平台"
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <main className="fade-in">{children}</main>
      </body>
    </html>
  );
}
