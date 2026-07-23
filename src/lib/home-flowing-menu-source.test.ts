import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8").replace(/\r\n/g, "\n");
}

describe("homepage task outcome source contract", () => {
  it("replaces the animated menu with four localized, descriptive internal routes", () => {
    const page = readSource("../app/page-shell.tsx");

    expect(page).not.toContain("FlowingMenu");
    expect(page).toContain('className="home-task-outcomes-shell"');
    expect(page).toContain('className="home-task-outcome-grid"');
    expect(page).toContain('className="home-task-outcome-link cursor-target"');

    for (const path of [
      'href: "/product-paths/work-efficiency"',
      'href: "/product-paths/media-generation"',
      'href: "/skill-learning"',
      'href: "/ai-news"',
    ]) {
      expect(page).toContain(path);
    }

    for (const title of [
      'title: "更快完成日常工作"',
      'title: "把创意变成内容成果"',
      'title: "把教程练成可复用技能"',
      'title: "把 AI 变化转成行动判断"',
      'title: "Finish everyday work faster"',
      'title: "Turn ideas into content outcomes"',
      'title: "Build reusable AI skills"',
      'title: "Turn AI change into decisions"',
    ]) {
      expect(page).toContain(title);
    }
  });

  it("uses static server-rendered cards with explicit transitions and neutral image outlines", () => {
    const css = readSource("../app/globals.css");

    expect(css).toContain(".home-task-outcome-grid {");
    expect(css).toContain("grid-template-columns: repeat(4, minmax(0, 1fr));");
    expect(css).toContain(".home-task-outcome-link:active {");
    expect(css).toContain("transform: scale(0.96);");
    expect(css).toContain("outline: 1px solid rgba(255, 255, 255, 0.1);");
    expect(css).toContain("transition:\n    background-color 180ms ease,\n    box-shadow 180ms ease,\n    transform 180ms ease;");
    expect(css).not.toContain(".home-flowing-menu-shell");
  });

  it("uses four compressed local WebP assets with recorded Pexels sources", () => {
    const assetNames = ["productivity", "content-creation", "ai-learning", "ai-news"];
    const sourceRecord = readSource("../../docs/asset-sources/home-flowing-menu.md");

    for (const assetName of assetNames) {
      const assetUrl = new URL(
        `../../public/images/home/flowing-menu/${assetName}.webp`,
        import.meta.url,
      );
      expect(existsSync(assetUrl)).toBe(true);
      expect(statSync(assetUrl).size).toBeLessThan(150_000);
      expect(sourceRecord).toContain(`flowing-menu/${assetName}.webp`);
    }

    expect(sourceRecord).toContain("https://www.pexels.com/license/");
  });
});
