import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site header navigation", () => {
  it("keeps the homepage nav first, moves admin into the main nav, and removes updates from the header nav", () => {
    const source = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const accountControlsSource = readFileSync(new URL("../components/header-account-controls.tsx", import.meta.url), "utf8");
    const adminNavIndex = source.indexOf("t.nav.admin");
    const updatesNavIndex = source.indexOf("t.nav.updates");

    expect(source).toContain("nav.home");
    expect(source).toContain("nav.software");
    expect(source).toContain("nav.onlineTools");
    expect(source).toContain("nav.skillLearning");
    expect(source).toContain("nav.aiNews");
    expect(source).toContain("nav.admin");
    expect(source).toContain('href: buildLocalePath("/ai-news", locale)');
    expect(source).toContain('href: buildLocalePath("/admin", locale)');
    expect(source).toContain("t.nav.login");
    expect(source).toContain("showAdmin={false}");
    expect(source).not.toContain("showAdmin={true}");
    expect(source).not.toContain('"/tutorials"');
    expect(source).not.toContain("t.nav.tutorials");
    expect(source).not.toContain('href: buildLocalePath("/#updates", locale)');
    expect(adminNavIndex).toBeGreaterThan(source.indexOf("t.nav.skillLearning"));
    expect(updatesNavIndex).toBe(-1);
    expect(accountControlsSource).not.toContain("className=\"site-admin-link hidden items-center gap-2 lg:inline-flex\"");
    expect(accountControlsSource).not.toContain("labels.admin");
  });
});
