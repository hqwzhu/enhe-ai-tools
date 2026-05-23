import { describe, expect, it } from "vitest";
import { calculateGrowthPercent, formatDashboardAmount, rankPopularTools } from "@/lib/admin-dashboard";

describe("admin dashboard helpers", () => {
  it("calculates user growth with safe zero handling", () => {
    expect(calculateGrowthPercent(15, 10)).toBe(50);
    expect(calculateGrowthPercent(3, 0)).toBe(100);
    expect(calculateGrowthPercent(0, 0)).toBe(0);
    expect(calculateGrowthPercent(5, 10)).toBe(-50);
  });

  it("formats dashboard amount without losing cents", () => {
    expect(formatDashboardAmount("1288.5")).toBe("¥1288.50");
    expect(formatDashboardAmount(null)).toBe("¥0.00");
  });

  it("ranks popular tools by combined download and usage counts", () => {
    const ranked = rankPopularTools([
      { name: "A", downloadCount: 10, usageCount: 1 },
      { name: "B", downloadCount: 3, usageCount: 20 },
      { name: "C", downloadCount: 3, usageCount: 4 }
    ]);

    expect(ranked.map((tool) => tool.name)).toEqual(["B", "A", "C"]);
    expect(ranked[0].score).toBe(23);
  });
});
