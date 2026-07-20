import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Search Console indexing route contract", () => {
  it("permanently removes page=1 while preserving other AI news filters", () => {
    const pageShell = readFileSync(
      "src/app/ai-news/page-shell.tsx",
      "utf8",
    );
    const zhRoute = readFileSync(
      "src/app/(zh-public)/ai-news/page.tsx",
      "utf8",
    );
    const enRoute = readFileSync("src/app/en/ai-news/page.tsx", "utf8");

    expect(pageShell).toContain("getAiNewsPageOneRedirectPath");
    expect(zhRoute).toContain("permanentRedirect");
    expect(zhRoute).toContain("getAiNewsPageOneRedirectPath");
    expect(enRoute).toContain("permanentRedirect");
    expect(enRoute).toContain("getAiNewsPageOneRedirectPath");
  });
});
