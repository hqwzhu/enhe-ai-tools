import { describe, expect, it } from "vitest";
import { releaseLayerLabels, summarizeReleaseLayers } from "@/lib/release-layer";

describe("release layer helpers", () => {
  it("names the three release layers clearly", () => {
    expect(releaseLayerLabels).toEqual({
      development: "开发版本",
      product: "产品版本",
      tool: "工具版本"
    });
  });

  it("summarizes release layer counts", () => {
    expect(summarizeReleaseLayers({ developmentVersions: 2, productReleases: 1, toolChangelogs: 5 })).toEqual([
      { key: "development", label: "开发版本", count: 2 },
      { key: "product", label: "产品版本", count: 1 },
      { key: "tool", label: "工具版本", count: 5 }
    ]);
  });
});
