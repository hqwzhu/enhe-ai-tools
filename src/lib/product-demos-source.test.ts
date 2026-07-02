import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("product demo feature source contract", () => {
  it("renders homepage product demos from cached backend data with muted autoplay videos", () => {
    const home = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const productDemos = readFileSync(new URL("./product-demos.ts", import.meta.url), "utf8");
    const card = readFileSync(new URL("../components/product-demo-card.tsx", import.meta.url), "utf8");

    expect(home).toContain("getHomeProductDemos");
    expect(home).toContain("homeProductDemos.length");
    expect(home).toContain("ProductDemoCard");
    expect(home).toContain("AI应用功能演示");
    expect(home).toContain("Tool Function Demos");
    expect(home).toContain("快速了解 AI 工具的真实使用效果");
    expect(home).not.toContain("产品工作流视频");
    expect(home).not.toContain("Product workflow videos");
    expect(home).not.toContain("先看工作流，再选择适合自己的产品");
    expect(productDemos).toContain("take: 3");
    expect(productDemos).toContain('status: "published"');
    expect(productDemos).toContain("isFeaturedOnHome: true");
    expect(card).toContain("next/image");
    expect(card).toContain("getProductDemoVideoUrl");
    expect(card).toContain("<video");
    expect(card).toContain("autoPlay");
    expect(card).toContain("muted");
    expect(card).toContain("loop");
    expect(card).toContain("playsInline");
    expect(card).not.toContain('controls');
  });

  it("adds admin CRUD actions and local video upload for managed product demos", () => {
    const actions = readFileSync(new URL("../app/admin/actions.ts", import.meta.url), "utf8");
    const editor = readFileSync(new URL("../app/admin/product-demo-editor.tsx", import.meta.url), "utf8");
    const uploadField = readFileSync(new URL("../app/admin/product-demo-video-upload-field.tsx", import.meta.url), "utf8");
    const adminLayout = readFileSync(new URL("../app/admin/layout.tsx", import.meta.url), "utf8");

    expect(adminLayout).toContain('["productDemos", "/admin/product-demos"]');
    expect(actions).toContain("export async function upsertProductDemoAction");
    expect(actions).toContain("export async function archiveProductDemoAction");
    expect(actions).toContain("export async function deleteProductDemoAction");
    expect(actions).toContain("productDemoSlugSchema");
    expect(actions).not.toContain('formData.get("videoFile")');
    expect(uploadField).toContain("product-demo-videos/${slug ||");
    expect(editor).toContain("ProductDemoVideoUploadField");
    expect(editor).not.toContain('<input name="videoUrl" defaultValue={demo?.videoUrl ?? ""}');
    expect(uploadField).not.toContain('name="videoFile"');
    expect(uploadField).toContain('name="videoUrl"');
    expect(uploadField).toContain('type="hidden"');
    expect(editor).toContain('name="coverImageFile"');
    expect(editor).not.toContain("封面 Alt 文案");
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

  it("keeps product demo cards localized and avoids back-navigation overlap", () => {
    const productDemos = readFileSync(new URL("./product-demos.ts", import.meta.url), "utf8");
    const card = readFileSync(new URL("../components/product-demo-card.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(productDemos).toContain("getLocalizedProductDemoTitle");
    expect(productDemos).toContain("getLocalizedProductDemoDescription");
    expect(productDemos).toContain("getLocalizedProductDemoCoverAlt");
    expect(productDemos).toContain("getProductDemoSchemaUploadDate");
    expect(card).toContain("getLocalizedProductDemoTitle");
    expect(card).toContain("getLocalizedProductDemoDescription");
    expect(card).toContain("getLocalizedProductDemoCoverAlt");
    expect(card).toContain("getLocalizedProductDemoTags");
    expect(card).not.toContain("alt={demo.coverAlt}");
    expect(css).toContain(".product-demo-card-media video");
    expect(css).toContain(".site-back-nav");
    expect(css).toContain("position: relative");
    expect(css).toContain("padding: calc(72px + 1rem) 1rem 0");
    expect(css).toContain(".product-demo-card p");
    expect(css).toContain("font-weight: 400");
  });
});
