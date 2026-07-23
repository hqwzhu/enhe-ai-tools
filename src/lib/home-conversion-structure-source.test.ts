import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage conversion structure contract", () => {
  it("adds verifiable trust, task outcomes, a three-step workflow, and a final CTA", () => {
    const page = readFileSync(
      new URL("../app/page-shell.tsx", import.meta.url),
      "utf8",
    );
    const dictionaries = readFileSync(
      new URL("../lib/dictionaries.ts", import.meta.url),
      "utf8",
    );
    const css = readFileSync(
      new URL("../app/globals.css", import.meta.url),
      "utf8",
    ).replace(/\r\n/g, "\n");

    expect(dictionaries).toContain(
      "从工具选择、内容创作到技能学习与隐私更可控的工作流，按真实任务找到可执行的 AI 路径。",
    );
    expect(dictionaries).toContain(
      "Find practical AI paths for tool selection, content creation, skill learning, and privacy-conscious workflows.",
    );

    expect(page).toContain("const homeTrustSignals: Record<Locale, HomeTrustSignal[]> = {");
    expect(page).toContain('className="home-trust-shell"');
    expect(page).toContain('href: "/llms.txt"');
    expect(page).toContain('href: "/about"');
    expect(page).toContain('href: "/legal/privacy-policy"');

    expect(page).toContain("const homeTaskOutcomes: Record<Locale, HomeTaskOutcome[]> = {");
    expect(page).toContain('className="home-task-outcomes-shell"');
    expect(page.match(/className="home-task-outcome-link/g)).toHaveLength(1);
    expect(page).toContain('href: "/product-paths/work-efficiency"');
    expect(page).toContain('href: "/product-paths/media-generation"');
    expect(page).toContain('href: "/skill-learning"');
    expect(page).toContain('href: "/ai-news"');
    expect(page).not.toContain("<FlowingMenu");
    expect(page).not.toContain('className="home-flowing-menu-shell"');

    expect(page).toContain("const homeWorkflowSteps = {");
    expect(page).toContain('className="home-workflow-shell"');
    expect(page).toContain('className="home-workflow-list"');
    expect(page).toContain('className="home-final-cta-shell"');
    expect(page).toContain('data-analytics-meta-placement="home-final-cta"');

    expect(css).toContain(".home-trust-shell,");
    expect(css).toContain(".home-task-outcomes-shell,");
    expect(css).toContain(".home-final-cta-shell {");
    expect(css).toMatch(
      /\.home-hero-cta-primary\s*{[\s\S]*?background:\s*#41c5db\s*!important;[\s\S]*?color:\s*#07131a\s*!important;/,
    );
    expect(css).toContain("outline: 1px solid rgba(255, 255, 255, 0.1);");
    expect(css).toContain(".home-task-outcome-link:active {");
    expect(css).toContain("transform: scale(0.96);");
  });
});
