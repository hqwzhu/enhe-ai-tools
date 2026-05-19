import { describe, expect, it } from "vitest";
import { parseTagNames, tagSlug } from "@/lib/tool-content";

describe("tool content helpers", () => {
  it("creates stable tag slugs", () => {
    expect(tagSlug("AI 自动化 Tool")).toBe("ai-tool");
    expect(tagSlug("Batch Rename")).toBe("batch-rename");
  });

  it("splits and deduplicates tag names", () => {
    expect(parseTagNames("AI, 自动化\nAI,效率")).toEqual(["AI", "自动化", "效率"]);
  });
});
