import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Build Your Own X public SEO surfaces", () => {
  it("ships localized public routes", () => {
    const zhRoute = readFileSync("src/app/(zh-public)/build-your-own-x/page.tsx", "utf8");
    const enRoute = readFileSync("src/app/en/build-your-own-x/page.tsx", "utf8");

    expect(zhRoute).toContain('generateBuildYourOwnXPageMetadata("zh")');
    expect(enRoute).toContain('generateBuildYourOwnXPageMetadata("en")');
    expect(zhRoute).toContain('<BuildYourOwnXPageShell forceLocale="zh" />');
    expect(enRoute).toContain('<BuildYourOwnXPageShell forceLocale="en" />');
  });

  it("exposes sitemap, llms, and OKF entries", () => {
    const sitemap = readFileSync("src/app/sitemap.ts", "utf8");
    const llms = readFileSync("public/llms.txt", "utf8");
    const okf = readFileSync("public/okf/build-your-own-x/index.md", "utf8");

    expect(sitemap).toContain('"/build-your-own-x"');
    expect(sitemap).toContain('"/en/build-your-own-x"');
    expect(sitemap).toContain('"/okf/build-your-own-x/index.md"');
    expect(llms).toContain("https://www.enhe-tech.com.cn/build-your-own-x");
    expect(llms).toContain("https://www.enhe-tech.com.cn/okf/build-your-own-x/index.md");
    expect(okf).toContain("Source repository: https://github.com/codecrafters-io/build-your-own-x");
  });
});
