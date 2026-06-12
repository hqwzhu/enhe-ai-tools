import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("tool detail service purchase source", () => {
  it("renders account services with service copy and a paid purchase form", () => {
    const source = readFileSync(join(process.cwd(), "src/app/tools/[slug]/page.tsx"), "utf8");

    expect(source).toContain("isPurchasableAccountService");
    expect(source).toContain("shouldShowPurchaseForm");
    expect(source).toContain("td.serviceIntroTitle");
    expect(source).toContain("td.serviceProductImagesIntro");
    expect(source).toContain("td.buyService");
    expect(source).toContain('name="priceSpecId"');
  });

  it("does not render product screenshots inside black image frames", () => {
    const source = readFileSync(join(process.cwd(), "src/app/tools/[slug]/page.tsx"), "utf8");

    expect(source).not.toContain("tool-detail-product-image-frame overflow-hidden rounded-2xl border border-white/10 bg-[#07101E] p-3");
    expect(source).not.toContain('className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#030A14]"');
  });
});
