import { describe, expect, it } from "vitest";
import {
  buildProductPathHref,
  getProductPathConfig,
  productPathConfigs,
  productPathSlugs,
} from "@/lib/product-paths";

describe("homepage demand product paths", () => {
  it("defines the three product display pages with the requested Chinese titles and categories", () => {
    expect(productPathSlugs).toEqual([
      "work-efficiency",
      "media-generation",
      "future-ai",
    ]);

    expect(getProductPathConfig("work-efficiency")?.zh).toMatchObject({
      title: "提升工作效率",
      categories: [
        "办公效率工具",
        "文件处理工具",
        "系统实用工具",
        "数据分析工具",
        "提升效率",
        "AI电脑软件",
      ],
    });

    expect(getProductPathConfig("media-generation")?.zh).toMatchObject({
      title: "生成图片/视频/音频",
      categories: [
        "AI视频工具",
        "AI图片工具",
        "AI音频工具",
        "视频生成",
        "语音生成",
        "视频/图片处理",
      ],
    });

    expect(getProductPathConfig("future-ai")?.zh).toMatchObject({
      title: "改变你未来的AI",
      categories: [
        "AI 智能体",
        "生活实用AI工具",
        "智能体",
        "账号订购",
        "升级订阅",
        "AI 提示词",
        "AI 副业变现",
      ],
    });
  });

  it("builds localized internal links for the homepage cards", () => {
    expect(buildProductPathHref("work-efficiency", "zh")).toBe(
      "/product-paths/work-efficiency",
    );
    expect(buildProductPathHref("media-generation", "en")).toBe(
      "/en/product-paths/media-generation",
    );
    expect(buildProductPathHref("future-ai", "zh")).toBe(
      "/product-paths/future-ai",
    );
  });

  it("keeps product path metadata descriptions long enough for snippets", () => {
    for (const config of Object.values(productPathConfigs)) {
      expect(config.zh.metaDescription.length).toBeGreaterThanOrEqual(80);
      expect(config.zh.metaDescription.length).toBeLessThanOrEqual(150);
      expect(config.en.metaDescription.length).toBeGreaterThanOrEqual(120);
      expect(config.en.metaDescription.length).toBeLessThanOrEqual(160);
    }
  });
});
