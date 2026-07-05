import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();
const assetDir = join(root, "docs", "ebos", "validation-assets");

const assetFiles = [
  "2026-07-03-ai-prompt-kit-minimum-product.md",
  "2026-07-03-ai-prompt-kit-landing-copy.md",
  "2026-07-03-ai-prompt-kit-marketplace-listings.md",
  "2026-07-03-faceswap-validation-copy.md",
  "2026-07-03-ai-video-studio-validation-copy.md",
  "2026-07-03-social-promotion-copy.md",
  "2026-07-03-three-day-validation-checklist.md",
  "2026-07-03-validation-input-fill-guide.md",
  "2026-07-03-codex-operator-summary.md"
];

describe("validation operator assets", () => {
  test("creates all Step 9.8 validation asset files", () => {
    for (const fileName of assetFiles) {
      expect(existsSync(join(assetDir, fileName)), fileName).toBe(true);
    }
  });

  test("documents non-fabrication rules and runnable validation commands", () => {
    const summary = readFileSync(join(assetDir, "2026-07-03-codex-operator-summary.md"), "utf8");
    const fillGuide = readFileSync(join(assetDir, "2026-07-03-validation-input-fill-guide.md"), "utf8");

    expect(summary).toContain("不能由 Codex 代填");
    expect(summary).toContain("validation_ai_prompt_kit_cta_click");
    expect(fillGuide).toContain("reports/ebos/validation/inputs/2026-07-03-validation-input.json");
    expect(fillGuide).toContain("npx tsx scripts/check-ebos-validation-input.ts --date 2026-07-03");
  });

  test("adds the bilingual AI Prompt Kit validation page with CTA tracking", () => {
    const sharedPage = readFileSync(join(root, "src", "components", "validation-ai-prompt-kit-page.tsx"), "utf8");

    expect(existsSync(join(root, "src", "app", "(zh-public)", "validation", "ai-prompt-kit", "page.tsx"))).toBe(true);
    expect(existsSync(join(root, "src", "app", "en", "validation", "ai-prompt-kit", "page.tsx"))).toBe(true);
    expect(sharedPage).toContain("validation_ai_prompt_kit_cta_click");
    expect(sharedPage).toContain("ENHE AI Prompt Kit");
  });
});
