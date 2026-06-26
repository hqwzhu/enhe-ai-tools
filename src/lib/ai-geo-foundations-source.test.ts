import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function exists(path: string) {
  return existsSync(join(root, path));
}

describe("AI GEO foundations", () => {
  it("ships agent-readable discovery files for AI search systems", () => {
    expect(exists("public/llms.txt")).toBe(true);
    expect(exists("public/pricing.md")).toBe(true);
    expect(exists("public/okf/index.md")).toBe(true);
    expect(exists("public/okf/enhe-ai-overview.md")).toBe(true);

    const llms = read("public/llms.txt");
    expect(llms).toContain("# 恩禾ENHE AI");
    expect(llms).toContain("https://www.enhe-tech.com.cn/ai-news");
    expect(llms).toContain("https://www.enhe-tech.com.cn/about");
    expect(llms).toContain("https://www.enhe-tech.com.cn/okf/index.md");
    expect(llms).toContain("AI agents");
    expect(llms).toContain("AI account service guidance");

    const pricing = read("public/pricing.md");
    expect(pricing).toContain("AI software apps");
    expect(pricing).toContain("AI account service guidance");
    expect(pricing).toContain("AI skill courses");

    const okfIndex = read("public/okf/index.md");
    expect(okfIndex).toContain("type: KnowledgeBundle");
    expect(okfIndex).toContain("[ENHE AI overview](./enhe-ai-overview.md)");
    expect(okfIndex).toContain("GEO Query Coverage");
    expect(okfIndex).toContain("Content-to-Action Map");

    const softwareOkf = read("public/okf/software/index.md");
    expect(softwareOkf).toContain("AI Agent Tool Recommendation Answer");
    expect(softwareOkf).toContain("Recommendation Dimensions");
    expect(softwareOkf).toContain("FAQ For Answer Engines");
    expect(softwareOkf).toContain("Source And Schema Notes");
    expect(softwareOkf).toContain("https://schema.org/FAQPage");
  });

  it("allows AI answer-engine crawlers while keeping private surfaces blocked", () => {
    const robots = read("src/app/robots.ts");

    for (const bot of [
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
      "KimiBot",
      "MoonshotBot",
      "DeepSeekBot",
      "BingPreview",
    ]) {
      expect(robots).toContain(`"${bot}"`);
    }

    expect(robots).toContain('"/about"');
    expect(robots).toContain('"/llms.txt"');
    expect(robots).toContain('"/ai-news"');
    expect(robots).toContain('"/ai-trends"');
    expect(robots).toContain('"/software"');
    expect(robots).toContain('"/account-services"');
    expect(robots).toContain('"/skill-learning"');
    expect(robots).toContain('"/api/uploads/"');
    expect(robots).toContain("allow: publicAllow");
    for (const privatePath of ["/admin", "/dashboard", "/user-center", "/checkout", "/orders", "/payment", "/api"]) {
      expect(robots).toContain(`"${privatePath}"`);
    }
  });

  it("adds answer-style GEO sections and internal links to core listing pages", () => {
    const software = read("src/app/software/page-shell.tsx");
    const accountServices = read("src/app/account-services/page-shell.tsx");
    const aiNews = read("src/app/ai-news/page-shell.tsx");
    const aiTrends = read("src/app/ai-trends/page-shell.tsx");
    const skillLearning = read("src/app/skill-learning/page-shell.tsx");

    expect(software).toContain("softwareGeoSections");
    expect(software).toContain("softwareAnswerBlock");
    expect(software).toContain("softwareFaqItems");
    expect(software).toContain("softwareComparisonRows");
    expect(software).toContain("softwareSourceLinks");
    expect(software).toContain("buildSoftwareCollectionSchema");
    expect(software).toContain("buildFaqSchema");
    expect(software).toContain("AI智能体工具推荐");
    expect(software).toContain('"@type": "ItemList"');
    expect(software).toContain("citation:");
    expect(software).toContain("如何选择AI软件应用");
    expect(software).toContain(
      'buildLocalePath("/skill-learning", forceLocale)',
    );
    expect(software).toContain('buildLocalePath("/ai-news", forceLocale)');

    expect(accountServices).toContain("accountServicesGeoSections");
    expect(accountServices).toContain("AI账号服务如何合规使用");
    expect(accountServices).toContain(
      'buildLocalePath("/software", forceLocale)',
    );
    expect(accountServices).toContain(
      'buildLocalePath("/skill-learning", forceLocale)',
    );

    expect(aiNews).toContain("aiNewsGeoSections");
    expect(aiNews).toContain("AI资讯对用户有什么用");
    expect(aiNews).toContain('buildLocalePath("/ai-trends", forceLocale)');
    expect(aiNews).toContain('buildLocalePath("/software", forceLocale)');

    expect(aiTrends).toContain("aiTrendsGeoSections");
    expect(aiTrends).toContain("如何用趋势判断下一步行动");
    expect(aiTrends).toContain('buildLocalePath("/ai-news", forceLocale)');
    expect(aiTrends).toContain(
      'buildLocalePath("/skill-learning", forceLocale)',
    );

    expect(skillLearning).toContain("skillLearningOutcomeSections");
    expect(skillLearning).toContain("skillLearningFaqItems");
    expect(skillLearning).toContain("buildFaqSchema");
    expect(skillLearning).toContain("From AI skills to repeatable workflows");
  });

  it("keeps machine-readable GEO files publicly cached and publishes them in the sitemap", () => {
    const sitemap = read("src/app/sitemap.ts");
    const nextConfig = read("next.config.ts");

    for (const path of [
      "/llms.txt",
      "/pricing.md",
      "/okf/index.md",
      "/okf/enhe-ai-overview.md",
      "/okf/ai-news/index.md",
      "/okf/software/index.md",
      "/okf/account-services/index.md",
      "/okf/skill-learning/index.md",
    ]) {
      expect(sitemap).toContain(`path: "${path}"`);
      expect(nextConfig).toContain(`source: "${path}"`);
    }

    expect(nextConfig).toContain('source: "/okf"');
    expect(nextConfig).toContain('destination: "/okf/index.md"');

    expect(sitemap).toContain('"/about"');
    expect(sitemap).toContain('"/en/about"');
    expect(sitemap).toContain('"/en/ai-trends"');
  });

  it("keeps account services answer-engine extractable with FAQ and Service schema", () => {
    const accountServices = read("src/app/account-services/page-shell.tsx");

    expect(accountServices).toContain("accountServicesFaqItems");
    expect(accountServices).toContain("buildFaqSchema");
    expect(accountServices).toContain("buildAccountServicesCollectionSchema");
    expect(accountServices).toContain('"@type": "Service"');
    expect(accountServices).toContain("AI账号服务适合解决什么问题？");
    expect(accountServices).toContain("What does AI account service guidance help with?");
  });

  it("keeps homepage language signals separate for Chinese and English indexation", () => {
    const middleware = read("src/middleware.ts");
    const localeRouting = read("src/lib/locale-routing.ts");
    const pageShell = read("src/app/page-shell.tsx");
    const dictionaries = read("src/lib/dictionaries.ts");

    expect(localeRouting).toContain("shouldRedirectRootToEnglish");
    expect(localeRouting).toContain("localeDetectionVaryHeader");
    expect(middleware).toContain('isChinesePublicPath ? "zh"');
    expect(middleware).toContain('"x-enhe-locale"');
    expect(middleware).toContain('"Vary", localeDetectionVaryHeader');
    expect(pageShell).toContain("const heroVelocityTexts =");
    expect(pageShell).toContain('forceLocale === "en"');
    expect(pageShell).toContain("[t.home.titleSecondLineEn]");
    expect(dictionaries).toContain('titleSecondLine: "与 AI 共生，在变化中觉醒，用创造重塑未来"');
    expect(dictionaries).toContain('titleSecondLineEn: "Coexist with AI. Awaken through change. Create the future"');
  });
});
