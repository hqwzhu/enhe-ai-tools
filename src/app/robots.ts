import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const privateDisallow = ["/admin", "/dashboard", "/user-center", "/checkout", "/orders", "/payment", "/api"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "GPTBot",
        allow: ["/"],
        disallow: privateDisallow
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/"],
        disallow: privateDisallow
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/"],
        disallow: privateDisallow
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/"],
        disallow: privateDisallow
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/"],
        disallow: privateDisallow
      },
      {
        userAgent: "Google-Extended",
        allow: ["/"],
        disallow: privateDisallow
      },
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: privateDisallow
      },
      {
        userAgent: "Baiduspider",
        allow: ["/"],
        disallow: privateDisallow
      },
      {
        userAgent: "*",
        allow: ["/", "/api/uploads/"],
        disallow: ["/admin", "/dashboard", "/user-center", "/checkout", "/orders", "/payment", "/api"]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
