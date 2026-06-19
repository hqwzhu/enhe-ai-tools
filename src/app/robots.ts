import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/uploads/"],
        disallow: ["/admin", "/dashboard", "/user-center", "/checkout", "/orders", "/payment", "/api"]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
