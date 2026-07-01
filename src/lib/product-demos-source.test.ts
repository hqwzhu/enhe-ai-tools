import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("product demo feature source contract", () => {
  it("renders homepage product demos from cached backend data without loading videos", () => {
    const home = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const productDemos = readFileSync(new URL("./product-demos.ts", import.meta.url), "utf8");
    const card = readFileSync(new URL("../components/product-demo-card.tsx", import.meta.url), "utf8");

    expect(home).toContain("getHomeProductDemos");
    expect(home).toContain("homeProductDemos.length");
    expect(home).toContain("ProductDemoCard");
    expect(productDemos).toContain("take: 3");
    expect(productDemos).toContain('status: "published"');
    expect(productDemos).toContain("isFeaturedOnHome: true");
    expect(card).toContain("next/image");
    expect(card).not.toContain("<video");
  });

  it("adds admin CRUD actions and validation for managed product demos", () => {
    const actions = readFileSync(new URL("../app/admin/actions.ts", import.meta.url), "utf8");
    const editor = readFileSync(new URL("../app/admin/product-demo-editor.tsx", import.meta.url), "utf8");
    const adminLayout = readFileSync(new URL("../app/admin/layout.tsx", import.meta.url), "utf8");

    expect(adminLayout).toContain('["productDemos", "/admin/product-demos"]');
    expect(actions).toContain("export async function upsertProductDemoAction");
    expect(actions).toContain("export async function archiveProductDemoAction");
    expect(actions).toContain("export async function deleteProductDemoAction");
    expect(actions).toContain("productDemoSlugSchema");
    expect(actions).toContain("已发布状态必须填写视频地址");
    expect(actions).toContain("已发布状态必须有关联产品");
    expect(editor).toContain('name="coverImageFile"');
    expect(editor).toContain('name="isFeaturedOnHome"');
    expect(editor).toContain('name="relatedProductId"');
  });

  it("keeps product demo public routes indexable and structured for SEO/GEO", () => {
    const listing = readFileSync(new URL("../app/product-demos/page-shell.tsx", import.meta.url), "utf8");
    const detail = readFileSync(new URL("../app/product-demos/[slug]/page-shell.tsx", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
    const robots = readFileSync(new URL("../app/robots.ts", import.meta.url), "utf8");
    const seo = readFileSync(new URL("./seo.ts", import.meta.url), "utf8");

    expect(listing).toContain("ProductDemoListingPageShell");
    expect(detail).toContain("VideoObject");
    expect(detail).toContain("buildFaqSchema");
    expect(detail).toContain("buildBreadcrumbSchema");
    expect(detail).toContain("buildProductStructuredData");
    expect(detail).toContain('preload="metadata"');
    expect(sitemap).toContain("prisma.productDemo");
    expect(sitemap).toContain('where: { status: "published" }');
    expect(robots).toContain('"/product-demos"');
    expect(seo).toContain("^\\/product-demos$");
    expect(seo).toContain("^\\/product-demos\\/.+$");
  });
});
