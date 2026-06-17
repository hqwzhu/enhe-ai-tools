import type { NextConfig } from "next";
import { adminFileUploadBodySizeLimit } from "./src/lib/upload-limits";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    const publicCacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, s-maxage=300, stale-while-revalidate=86400"
      }
    ];

    return [
      { source: "/", headers: publicCacheHeaders },
      { source: "/en", headers: publicCacheHeaders },
      { source: "/software", headers: publicCacheHeaders },
      { source: "/en/software", headers: publicCacheHeaders },
      { source: "/online-tools", headers: publicCacheHeaders },
      { source: "/en/online-tools", headers: publicCacheHeaders },
      { source: "/skill-learning", headers: publicCacheHeaders },
      { source: "/en/skill-learning", headers: publicCacheHeaders },
      { source: "/pricing", headers: publicCacheHeaders },
      { source: "/en/pricing", headers: publicCacheHeaders },
      { source: "/tutorials", headers: publicCacheHeaders },
      { source: "/en/tutorials", headers: publicCacheHeaders },
      { source: "/legal/:slug*", headers: publicCacheHeaders },
      { source: "/en/legal/:slug*", headers: publicCacheHeaders },
      { source: "/tools/:slug*", headers: publicCacheHeaders },
      { source: "/en/tools/:slug*", headers: publicCacheHeaders }
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
