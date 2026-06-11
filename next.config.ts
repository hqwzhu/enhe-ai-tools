import type { NextConfig } from "next";
import { adminFileUploadBodySizeLimit } from "./src/lib/upload-limits";

const nextConfig: NextConfig = {
  output: "standalone",
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
