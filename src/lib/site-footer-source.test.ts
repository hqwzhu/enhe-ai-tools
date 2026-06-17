import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site footer source", () => {
  it("places help support in the footer navigation", () => {
    const footer = readFileSync(new URL("../components/site-footer.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");

    expect(footer).toContain("t.footer.helpSupport");
    expect(footer).toContain('href="/legal/user-agreement"');
    expect(header).not.toContain("帮助支持");
  });
});
