import { describe, expect, it } from "vitest";
import {
  buildCanonicalAiNewsPath,
  buildCanonicalToolPath,
  getCanonicalAiNewsSlug,
  getCanonicalToolSlug
} from "@/lib/public-slugs";

describe("public slug helpers", () => {
  it("builds canonical tool slugs and localized paths", () => {
    const tool = {
      slug: "ai-ai",
      name: "AI语音生成",
      englishName: "AI Voice Generator - Flexible Edition",
      type: "software" as const
    };

    expect(getCanonicalToolSlug(tool)).toBe("ai-voice-generator-flexible-edition");
    expect(buildCanonicalToolPath(tool, "zh")).toBe("/tools/ai-voice-generator-flexible-edition");
    expect(buildCanonicalToolPath(tool, "en")).toBe("/en/tools/ai-voice-generator-flexible-edition");
  });

  it("builds canonical AI news slugs and localized paths", () => {
    const article = {
      slug: "ai-news-trend-insights-launch",
      title: "中文标题",
      englishTitle: "OpenAI Agent Workflow Update"
    };

    expect(getCanonicalAiNewsSlug(article)).toBe("openai-agent-workflow-update");
    expect(buildCanonicalAiNewsPath(article, "zh")).toBe("/ai-news/openai-agent-workflow-update");
    expect(buildCanonicalAiNewsPath(article, "en")).toBe("/en/ai-news/openai-agent-workflow-update");
  });

  it("uses account-services for online tool canonical paths", () => {
    const tool = {
      slug: "premium-agent-pass",
      name: "AI account service",
      englishName: "Premium Agent Pass",
      type: "online" as const
    };

    expect(getCanonicalToolSlug(tool)).toBe("premium-agent-pass");
    expect(buildCanonicalToolPath(tool, "zh")).toBe("/account-services/premium-agent-pass");
    expect(buildCanonicalToolPath(tool, "en")).toBe("/en/account-services/premium-agent-pass");
  });
});
