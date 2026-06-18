import type { NextConfig } from "next";
import { adminFileUploadBodySizeLimit } from "./src/lib/upload-limits";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    const zhPublicCacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, s-maxage=300, stale-while-revalidate=86400"
      },
      {
        key: "Content-Language",
        value: "zh-CN"
      }
    ];

    const enPublicCacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, s-maxage=300, stale-while-revalidate=86400"
      },
      {
        key: "Content-Language",
        value: "en-US"
      }
    ];
    const publicAssetCacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, s-maxage=300, stale-while-revalidate=86400"
      }
    ];

    return [
      { source: "/robots.txt", headers: publicAssetCacheHeaders },
      { source: "/sitemap.xml", headers: publicAssetCacheHeaders },
      { source: "/", headers: zhPublicCacheHeaders },
      { source: "/en", headers: enPublicCacheHeaders },
      { source: "/software", headers: zhPublicCacheHeaders },
      { source: "/en/software", headers: enPublicCacheHeaders },
      { source: "/account-services", headers: zhPublicCacheHeaders },
      { source: "/en/account-services", headers: enPublicCacheHeaders },
      { source: "/skill-learning", headers: zhPublicCacheHeaders },
      { source: "/en/skill-learning", headers: enPublicCacheHeaders },
      { source: "/pricing", headers: zhPublicCacheHeaders },
      { source: "/en/pricing", headers: enPublicCacheHeaders },
      { source: "/tutorials", headers: zhPublicCacheHeaders },
      { source: "/en/tutorials", headers: enPublicCacheHeaders },
      { source: "/ai-news", headers: zhPublicCacheHeaders },
      { source: "/en/ai-news", headers: enPublicCacheHeaders },
      { source: "/ai-news/:slug*", headers: zhPublicCacheHeaders },
      { source: "/en/ai-news/:slug*", headers: enPublicCacheHeaders },
      { source: "/legal/:slug*", headers: zhPublicCacheHeaders },
      { source: "/en/legal/:slug*", headers: enPublicCacheHeaders },
      { source: "/account-services/:slug*", headers: zhPublicCacheHeaders },
      { source: "/en/account-services/:slug*", headers: enPublicCacheHeaders },
      { source: "/tools/:slug*", headers: zhPublicCacheHeaders },
      { source: "/en/tools/:slug*", headers: enPublicCacheHeaders }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "zpayz.cn" },
      { protocol: "https", hostname: "*.zpayz.cn" },
      { protocol: "https", hostname: "7-pay.cn" },
      { protocol: "https", hostname: "*.7-pay.cn" }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: adminFileUploadBodySizeLimit
    }
  }
};

export default nextConfig;
