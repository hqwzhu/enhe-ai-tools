import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site footer source", () => {
  it("places help support and updates in the footer navigation and keeps the user chip sized like user center", () => {
    const footer = readFileSync(new URL("../components/site-footer.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(footer).toContain("t.footer.helpSupport");
    expect(footer).toContain("t.nav.updates");
    expect(footer).toContain('buildLocalePath("/#updates", locale)');
    expect(footer).toContain('buildLocalePath("/legal/user-agreement", locale)');
    expect(header).not.toContain("甯姪鏀寔");
    expect(css).toContain(".site-user-chip");
    expect(css).toContain("min-height: 32px");
    expect(css).toContain("padding: 0 13px");
  });
});
