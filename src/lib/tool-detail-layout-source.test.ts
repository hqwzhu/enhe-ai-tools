import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");

describe("tool detail layout source", () => {
  it("stacks media above text and preserves full image visibility", () => {
    const source = readFileSync(resolve(root, "src/app/tools/[slug]/page.tsx"), "utf8");

    expect(source).toContain("tool-detail-hero-stack");
    expect(source).toContain("tool-detail-cover-frame");
    expect(source).toContain("tool-detail-product-gallery");
    expect(source).toContain("tool-detail-copy-card");
    expect(source).toContain("tool-detail-product-image-frame");
    expect(source).toContain("resolveSoftwareDownloadCtaHref");
    expect(source).toContain('id="download-links"');
    expect(source).toContain("href={softwareDownloadCtaHref}");
    expect(source).toContain("object-contain");
    expect(source).not.toContain("lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]");
    expect(source).not.toContain("lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]");

    expect(source.indexOf("tool-detail-product-gallery")).toBeLessThan(source.indexOf("tool-detail-copy-card"));
  });
});
