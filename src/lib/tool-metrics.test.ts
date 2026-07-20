import { describe, expect, it } from "vitest";
import { getVisibleToolMetrics } from "@/lib/tool-metrics";

describe("tool metrics", () => {
  it("hides zero download and usage counts without replacement content", () => {
    expect(getVisibleToolMetrics({ downloadCount: 0, usageCount: 0 })).toEqual(
      [],
    );
  });

  it("keeps only positive counts visible", () => {
    expect(getVisibleToolMetrics({ downloadCount: 12, usageCount: 0 })).toEqual(
      [{ type: "download", count: 12 }],
    );
    expect(getVisibleToolMetrics({ downloadCount: 0, usageCount: 8 })).toEqual([
      { type: "usage", count: 8 },
    ]);
  });
});
