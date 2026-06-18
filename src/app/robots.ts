import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/uploads/"],
        disallow: ["/admin", "/api/", "/orders"]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
