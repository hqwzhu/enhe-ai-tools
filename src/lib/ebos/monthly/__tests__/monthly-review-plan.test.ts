import { describe, expect, test } from "vitest";
import type { EbosEvidenceCatalogEntry } from "../../evidence";
import { generateMonthlyReviewPlan } from "../monthly-review-plan";

function entry(kind: EbosEvidenceCatalogEntry["evidenceKind"], overrides: Partial<EbosEvidenceCatalogEntry> = {}): EbosEvidenceCatalogEntry {
  return {
    id: `${kind}:2026-07-03:file.json`,
    filePath: `reports/ebos/evidence/${kind}/file.json`,
    fileName: "file.json",
    evidenceKind: kind,
    contractVersion: "ebos-evidence-v1",
    targetDate: "2026-07-03",
    generatedAt: "2026-07-03T00:00:00.000Z",
    generator: "unit-test",
    score: 80,
    confidence: "partial",
    warningsCount: 0,
    errorsCount: 0,
    actionItemsCount: 0,
    validationStatus: "valid",
    ...overrides
  };
}

describe("generateMonthlyReviewPlan", () => {
  test("adds revenue evidence OKR when revenue_evidence is missing", () => {
    const plan = generateMonthlyReviewPlan({
      evidenceEntries: [entry("weekly_report")],
      missingKinds: ["revenue_evidence"],
      openActionItemsCount: 0,
      sampleIsThin: false
    });

    expect(plan.nextMonthOKRs.some((okr) => okr.objective.includes("收入数据证据"))).toBe(true);
  });

  test("adds product conversion OKR when product_evidence is missing", () => {
    const plan = generateMonthlyReviewPlan({
      evidenceEntries: [entry("weekly_report")],
      missingKinds: ["product_evidence"],
      openActionItemsCount: 0,
      sampleIsThin: false
    });

    expect(plan.nextMonthOKRs.some((okr) => okr.objective.includes("产品转化证据"))).toBe(true);
  });

  test("adds SEO/GEO data-source tasks when seo or geo evidence is missing", () => {
    const plan = generateMonthlyReviewPlan({
      evidenceEntries: [entry("weekly_report")],
      missingKinds: ["seo_evidence", "geo_evidence"],
      openActionItemsCount: 0,
      sampleIsThin: false
    });

    expect(plan.codexTasks.some((task) => task.title.includes("SEO/GEO"))).toBe(true);
  });

  test("adds market evidence OKR when market_evidence is missing", () => {
    const plan = generateMonthlyReviewPlan({
      evidenceEntries: [entry("weekly_report")],
      missingKinds: ["market_evidence"],
      openActionItemsCount: 0,
      sampleIsThin: false
    });

    expect(plan.nextMonthOKRs.some((okr) => okr.objective.includes("市场机会证据"))).toBe(true);
  });

  test("assigns high priority to backlog reduction action items", () => {
    const plan = generateMonthlyReviewPlan({
      evidenceEntries: [entry("weekly_report")],
      missingKinds: [],
      openActionItemsCount: 25,
      sampleIsThin: false
    });

    expect(plan.actionItems).toContainEqual(expect.objectContaining({
      title: expect.stringContaining("减少执行积压"),
      priority: "high"
    }));
  });

  test("creates specific monthly SEO and GEO tasks when evidence exists", () => {
    const plan = generateMonthlyReviewPlan({
      evidenceEntries: [
        entry("seo_evidence", {
          score: 64,
          actionItemsCount: 1,
          actionItems: [{
            id: "seo-1",
            title: "Add Product schema to software pages",
            description: "Improve structured data coverage.",
            priority: "high",
            owner: "codex",
            status: "open"
          }]
        }),
        entry("geo_evidence", {
          score: 59,
          actionItemsCount: 1,
          actionItems: [{
            id: "geo-1",
            title: "Add FAQ sections for AI answerability",
            description: "Improve answer-engine readiness.",
            priority: "medium",
            owner: "codex",
            status: "open"
          }]
        })
      ],
      missingKinds: [],
      openActionItemsCount: 0,
      sampleIsThin: false
    });

    expect(plan.codexTasks).toContainEqual(expect.objectContaining({
      title: expect.stringContaining("SEO evidence")
    }));
    expect(plan.codexTasks).toContainEqual(expect.objectContaining({
      title: expect.stringContaining("GEO evidence")
    }));
  });

  test("creates specific monthly product tasks when product evidence exists", () => {
    const plan = generateMonthlyReviewPlan({
      evidenceEntries: [
        entry("product_evidence", {
          score: 62,
          actionItemsCount: 1,
          actionItems: [{
            id: "product-1",
            title: "Add delivery and support copy to product pages",
            description: "Improve product conversion readiness.",
            priority: "high",
            owner: "codex",
            status: "open"
          }]
        })
      ],
      missingKinds: [],
      openActionItemsCount: 0,
      sampleIsThin: false
    });

    expect(plan.codexTasks).toContainEqual(expect.objectContaining({
      title: expect.stringContaining("Product evidence")
    }));
  });

  test("creates first revenue OKR when revenue evidence exists but first revenue is not achieved", () => {
    const plan = generateMonthlyReviewPlan({
      evidenceEntries: [
        entry("revenue_evidence", {
          score: 42,
          actionItemsCount: 1,
          payloadSummary: {
            firstRevenueAchieved: false,
            paidOrders: 0,
            netRevenue: 0
          },
          actionItems: [{
            id: "revenue-1",
            title: "选择 1-2 个高 readiness 产品进行首批收入验证",
            description: "Complete first paid validation.",
            priority: "high",
            owner: "codex",
            status: "open"
          }]
        })
      ],
      missingKinds: [],
      openActionItemsCount: 0,
      sampleIsThin: false
    });

    expect(plan.nextMonthOKRs.some((okr) => okr.objective.includes("第一批真实收入"))).toBe(true);
    expect(plan.codexTasks).toContainEqual(expect.objectContaining({
      title: expect.stringContaining("Revenue evidence")
    }));
  });

  test("creates concrete market opportunity tasks when market evidence exists", () => {
    const plan = generateMonthlyReviewPlan({
      evidenceEntries: [
        entry("revenue_evidence", {
          payloadSummary: {
            firstRevenueAchieved: false,
            paidOrders: 1,
            netRevenue: 0
          }
        }),
        entry("market_evidence", {
          score: 76,
          actionItemsCount: 1,
          payloadSummary: {
            recommendedProductDirectionsCount: 2,
            topProductDirections: [
              {
                productDirection: "AI 视频工作流包",
                priorityScore: 82,
                recommendedAction: "validate_first"
              }
            ]
          },
          actionItems: [{
            id: "market-1",
            title: "验证市场机会：AI 视频工作流包",
            description: "Run a low-cost validation offer.",
            priority: "high",
            owner: "codex",
            status: "open"
          }]
        })
      ],
      missingKinds: [],
      openActionItemsCount: 0,
      sampleIsThin: false
    });

    expect(plan.codexTasks).toContainEqual(expect.objectContaining({
      title: expect.stringContaining("Market evidence")
    }));
    expect(plan.codexTasks).toContainEqual(expect.objectContaining({
      title: expect.stringContaining("低成本验证市场机会")
    }));
  });
});
