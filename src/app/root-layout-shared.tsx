import type { Metadata } from "next";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { CursorGlow } from "@/components/cursor-glow";
import { InteractiveBackground } from "@/components/interactive-background";
import {
  defaultSiteDescription,
  getSiteBaseUrl,
  siteName
} from "@/lib/seo";

export const sharedRootMetadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  applicationName: siteName,
  title: siteName,
  description: defaultSiteDescription,
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: [{ url: "/images/brand/enhe-icon-gradient-white-bg-cropped.png", type: "image/png" }],
    shortcut: "/images/brand/enhe-icon-gradient-white-bg-cropped.png",
    apple: [{ url: "/images/brand/enhe-icon-gradient-white-bg-cropped.png", type: "image/png" }]
  }
};

export function RootDocument({
  lang,
  children
}: Readonly<{ lang: "zh-CN" | "en-US"; children: React.ReactNode }>) {
  return (
    <html lang={lang}>
      <body>
        <InteractiveBackground />
        <CursorGlow />
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
