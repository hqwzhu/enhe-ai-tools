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
    expect(okf).toContain("适合新手的 Build Your Own X 项目有哪些？");
    expect(okf).toContain("适合后端作品集的项目有哪些？");
    expect(okf).toContain("如何把 GitHub 教程变成 7 天或 14 天计划？");
    expect(okf).toContain("https://www.enhe-tech.com.cn/software");
    expect(llms).toContain("technical interview project planning");
  });

  it("keeps the Build Your Own X page optimized for conversion and AI extraction", () => {
    const pageShell = readFileSync("src/app/build-your-own-x/page-shell.tsx", "utf8");

    expect(pageShell).toContain("按目标快速开始");
    expect(pageShell).toContain("新手入门");
    expect(pageShell).toContain("面试准备");
    expect(pageShell).toContain("作品集项目");
    expect(pageShell).toContain("AI 工程");
    expect(pageShell).toContain("适合哪些人使用？");
    expect(pageShell).toContain("你最终应该带走什么？");
    expect(pageShell).toContain("适合新手的 Build Your Own X 项目有哪些？");
    expect(pageShell).toContain('href: "/software"');
  });
});
