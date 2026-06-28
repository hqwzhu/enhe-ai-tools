import { describe, expect, it } from "vitest";
import {
  aiTopicClusters,
  aiTopicClusterSlugs,
  buildAiTopicBreadcrumbSchema,
  buildAiTopicCollectionSchema,
  getAiTopicCluster,
} from "@/lib/ai-topic-clusters";

describe("ai topic clusters", () => {
  it("defines six stable topic clusters", () => {
    expect(aiTopicClusterSlugs).toEqual([
      "ai-content-creation-tools",
      "ai-video-image-creation",
      "local-ai-deployment",
      "ai-agent-automation",
      "ai-skill-learning-path",
      "ai-account-service-compliance",
    ]);
    expect(aiTopicClusters).toHaveLength(6);
  });

  it("returns localized topic content by slug", () => {
    const topic = getAiTopicCluster("local-ai-deployment");

    expect(topic?.slug).toBe("local-ai-deployment");
    expect(topic?.content.zh.title).toContain("本地 AI");
    expect(topic?.content.en.title).toContain("Local AI");
    expect(topic?.content.zh.faqs.length).toBeGreaterThanOrEqual(3);
    expect(topic?.content.en.relatedLinks.map((link) => link.href)).toContain(
      "/build-your-own-x",
    );
  });

  it("builds visible-content-aligned schemas", () => {
    const topic = getAiTopicCluster("ai-agent-automation");
    expect(topic).toBeDefined();
    if (!topic) throw new Error("missing topic");

    const collection = buildAiTopicCollectionSchema(topic, "zh");
    const breadcrumb = buildAiTopicBreadcrumbSchema(topic, "en");

    expect(collection["@type"]).toBe("CollectionPage");
    expect(collection.name).toBe(topic.content.zh.title);
    expect(collection.mainEntity["@type"]).toBe("ItemList");
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(JSON.stringify(breadcrumb)).toContain(
      "/en/ai-topics/ai-agent-automation",
    );
  });
});
