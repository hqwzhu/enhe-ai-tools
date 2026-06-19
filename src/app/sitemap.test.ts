import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  tool: {
    findMany: vi.fn()
  },
  newsArticle: {
    findMany: vi.fn()
  }
};

vi.mock("@/lib/db", () => ({
  prisma: prismaMock
}));

describe("sitemap canonical URL contract", () => {
  beforeEach(() => {
    prismaMock.tool.findMany.mockReset();
    prismaMock.newsArticle.findMany.mockReset();
    process.env.APP_URL = "https://www.enhe-tech.com.cn";
    process.env.NEXT_PUBLIC_APP_URL = "https://www.enhe-tech.com.cn";
  });

  it("includes only public canonical routes and excludes private or legacy routes", async () => {
    prismaMock.tool.findMany.mockResolvedValue([
      {
        slug: "ai-ai",
        name: "AI Voice Generator Flexible Edition",
        englishName: "AI Voice Generator Flexible Edition",
        type: "software",
        updatedAt: new Date("2026-06-19T01:02:03.000Z")
      },
      {
        slug: "chatgpt-support",
        name: "ChatGPT Account Service",
        englishName: "ChatGPT Account Service",
        type: "online",
        updatedAt: new Date("2026-06-18T01:02:03.000Z")
      },
      {
        slug: "prompt-course",
        name: "Prompt Engineering Course",
        englishName: "Prompt Engineering Course",
        type: "skill_learning",
        updatedAt: new Date("2026-06-17T01:02:03.000Z")
      }
    ]);
    prismaMock.newsArticle.findMany.mockResolvedValue([
      {
        slug: "news-legacy",
        title: "AI Agents reshape daily workflows",
        englishTitle: "AI Agents reshape daily workflows",
        englishSummary: "A useful summary for English readers.",
        englishContent: "AI agents are changing how teams connect tools, accounts, tutorials, and workflow automation. ".repeat(3),
        updatedAt: new Date("2026-06-16T01:02:03.000Z")
      }
    ]);

    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://www.enhe-tech.com.cn/");
    expect(urls).toContain("https://www.enhe-tech.com.cn/ai-news");
    expect(urls).toContain("https://www.enhe-tech.com.cn/software");
    expect(urls).toContain("https://www.enhe-tech.com.cn/account-services");
    expect(urls).toContain("https://www.enhe-tech.com.cn/skill-learning");
    expect(urls).toContain("https://www.enhe-tech.com.cn/software/ai-voice-generator-flexible-edition");
    expect(urls).toContain("https://www.enhe-tech.com.cn/account-services/chatgpt-support");
    expect(urls).toContain("https://www.enhe-tech.com.cn/skill-learning/prompt-course");
    expect(urls).toContain("https://www.enhe-tech.com.cn/ai-news/ai-agents-reshape-daily-workflows");

    for (const forbidden of ["/admin", "/dashboard", "/user-center", "/login", "/register", "/checkout", "/orders", "/payment", "/api", "/online-tools", "/tools/"]) {
      expect(urls.some((url) => url.includes(forbidden)), forbidden).toBe(false);
    }
  });

  it("uses updatedAt as lastModified for database-backed tool and AI news URLs", async () => {
    const toolUpdatedAt = new Date("2026-06-19T03:04:05.000Z");
    const newsUpdatedAt = new Date("2026-06-18T03:04:05.000Z");

    prismaMock.tool.findMany.mockResolvedValue([
      {
        slug: "workflow-app",
        name: "Workflow AI App",
        englishName: "Workflow AI App",
        type: "software",
        updatedAt: toolUpdatedAt
      }
    ]);
    prismaMock.newsArticle.findMany.mockResolvedValue([
      {
        slug: "agent-news",
        title: "Agent News",
        englishTitle: "Agent workflow launch",
        englishSummary: "A useful summary for English readers.",
        englishContent: "Agent workflows connect daily tools, software, tutorials, and account services into practical automation. ".repeat(3),
        updatedAt: newsUpdatedAt
      }
    ]);

    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

    expect(byUrl.get("https://www.enhe-tech.com.cn/software/workflow-app")?.lastModified).toBe(toolUpdatedAt);
    expect(byUrl.get("https://www.enhe-tech.com.cn/ai-news/agent-news")?.lastModified).toBe(newsUpdatedAt);
  });
});
