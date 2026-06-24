import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const privateDisallow = [
  "/admin",
  "/dashboard",
  "/user-center",
  "/checkout",
  "/orders",
  "/payment",
  "/api",
];

const publicAllow = ["/", "/api/uploads/"];

const answerEngineUserAgents = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "Googlebot",
  "GoogleOther",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "Baiduspider",
  "Bytespider",
  "Doubaobot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...answerEngineUserAgents.map((userAgent) => ({
        userAgent,
        allow: publicAllow,
        disallow: privateDisallow,
      })),
      {
        userAgent: "*",
        allow: publicAllow,
        disallow: [
          "/admin",
          "/dashboard",
          "/user-center",
          "/checkout",
          "/orders",
          "/payment",
          "/api",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
