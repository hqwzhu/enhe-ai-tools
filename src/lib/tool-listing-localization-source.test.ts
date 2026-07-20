import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("tool listing localization source", () => {
  it("localizes tool cards and english category labels through shared helpers", () => {
    const toolCardSource = readFileSync(join(process.cwd(), "src/components/tool-card.tsx"), "utf8");
    const softwareSource = readFileSync(join(process.cwd(), "src/app/software/page-shell.tsx"), "utf8");
    const onlineSource = readFileSync(join(process.cwd(), "src/app/online-tools/page-shell.tsx"), "utf8");

    expect(toolCardSource).toContain('from "@/lib/tool-localization"');
    expect(toolCardSource).toContain("resolveLocalizedToolCategoryName");
    expect(toolCardSource).toContain("resolveLocalizedToolIdentity");
    expect(toolCardSource).toContain("buildLocalizedToolPreviewText");
    expect(softwareSource).toContain("resolveLocalizedToolCategoryName");
    expect(onlineSource).toContain("resolveLocalizedToolCategoryName");
  });

  it("keeps P1 purchase decision strips above product grids and conversion metadata inside tool cards", () => {
    const toolCardSource = readFileSync(join(process.cwd(), "src/components/tool-card.tsx"), "utf8");
    const softwareSource = readFileSync(join(process.cwd(), "src/app/software/page-shell.tsx"), "utf8");
    const accountServicesSource = readFileSync(join(process.cwd(), "src/app/account-services/page-shell.tsx"), "utf8");
    const skillLearningSource = readFileSync(join(process.cwd(), "src/app/skill-learning/page-shell.tsx"), "utf8");
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    for (const source of [softwareSource, accountServicesSource]) {
      expect(source).toContain("<ListingGuidanceFold forceLocale={forceLocale} />");
      expect(source.indexOf("<ListingGuidanceFold")).toBeLessThan(source.indexOf("<FilterBar"));
      expect(source).toContain("<ListingDecisionStrip");
      expect(source).toContain('className="listing-grid mt-8 grid gap-5 md:grid-cols-3"');
    }
    expect(skillLearningSource).toContain("<ListingDecisionStrip");
    expect(skillLearningSource.indexOf("<ListingDecisionStrip")).toBeLessThan(
      skillLearningSource.indexOf("<FilterBar"),
    );
    expect(skillLearningSource).toContain('className="listing-grid mt-8 grid gap-5 md:grid-cols-3"');

    expect(toolCardSource).toContain("const commerceLabel =");
    expect(toolCardSource).toContain("const deliveryLabel =");
    expect(toolCardSource).toContain("tool-card-commerce");
    expect(toolCardSource).toContain("tool-card-primary-action");
    expect(toolCardSource).toContain("t.toolCard.compareBeforeBuy");
    expect(toolCardSource).toContain("t.toolCard.deliveryLabel");
    expect(css).toContain(".listing-decision-strip");
    expect(css).toContain(".tool-card-commerce");
    expect(css).toContain(".tool-card-primary-action");
  });

  it("keeps P2 trust notes compact and reachable before filtering", () => {
    const softwareSource = readFileSync(join(process.cwd(), "src/app/software/page-shell.tsx"), "utf8");
    const accountServicesSource = readFileSync(join(process.cwd(), "src/app/account-services/page-shell.tsx"), "utf8");
    const skillLearningSource = readFileSync(join(process.cwd(), "src/app/skill-learning/page-shell.tsx"), "utf8");
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    for (const source of [softwareSource, accountServicesSource]) {
      expect(source).toContain("<ListingGuidanceFold forceLocale={forceLocale} />");
      expect(source.indexOf("<ListingGuidanceFold")).toBeLessThan(source.indexOf("<FilterBar"));
      expect(source).toContain("ListingTrustNote");
      expect(source).toContain('className="listing-trust-note"');
    }
    expect(skillLearningSource).toContain("ListingTrustNote");
    expect(skillLearningSource).toContain('className="listing-trust-note"');
    expect(skillLearningSource.indexOf("<ListingTrustNote")).toBeGreaterThan(
      skillLearningSource.indexOf("<ListingDecisionStrip"),
    );
    expect(skillLearningSource.indexOf("<ListingTrustNote")).toBeLessThan(
      skillLearningSource.indexOf("<FilterBar"),
    );

    expect(softwareSource).toContain("Price and delivery are visible before purchase.");
    expect(accountServicesSource).toContain("Official platform rules remain the final source.");
    expect(skillLearningSource).toContain("Course pages should make the outcome and delivery clear before purchase.");
    expect(css).toContain(".listing-trust-note");
    expect(css).toContain(".listing-trust-note a");
  });
});
