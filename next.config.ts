import type { NextConfig } from "next";
import { adminFileUploadBodySizeLimit } from "./src/lib/upload-limits";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: adminFileUploadBodySizeLimit
    }
  }
};

export default nextConfig;
