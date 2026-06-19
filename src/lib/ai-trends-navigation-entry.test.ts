import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("AI trends navigation entry", () => {
  it("exposes the AI trends briefing from the public header and footer", () => {
    const header = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const footer = readFileSync(new URL("../components/site-footer.tsx", import.meta.url), "utf8");

    expect(header).toContain("t.nav.aiTrends");
    expect(header).toContain('buildLocalePath("/ai-trends", locale)');
    expect(footer).toContain("t.nav.aiTrends");
    expect(footer).toContain('buildLocalePath("/ai-trends", locale)');
  });
});
