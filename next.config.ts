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

    return [
      { source: "/", headers: zhPublicCacheHeaders },
      { source: "/en", headers: enPublicCacheHeaders },
      { source: "/software", headers: zhPublicCacheHeaders },
      { source: "/en/software", headers: enPublicCacheHeaders },
      { source: "/online-tools", headers: zhPublicCacheHeaders },
      { source: "/en/online-tools", headers: enPublicCacheHeaders },
      { source: "/skill-learning", headers: zhPublicCacheHeaders },
      { source: "/en/skill-learning", headers: enPublicCacheHeaders },
      { source: "/pricing", headers: zhPublicCacheHeaders },
      { source: "/en/pricing", headers: enPublicCacheHeaders },
      { source: "/tutorials", headers: zhPublicCacheHeaders },
      { source: "/en/tutorials", headers: enPublicCacheHeaders },
      { source: "/legal/:slug*", headers: zhPublicCacheHeaders },
      { source: "/en/legal/:slug*", headers: enPublicCacheHeaders },
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
