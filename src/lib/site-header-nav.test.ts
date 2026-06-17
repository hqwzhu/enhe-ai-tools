import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site header navigation", () => {
  it("keeps the update log nav item on the homepage instead of exposing tutorials", () => {
    const source = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");

    expect(source).not.toContain('"/tutorials"');
    expect(source).not.toContain("t.nav.tutorials");
    expect(source).toContain('"/#updates"');
    expect(source).toContain("更新日志");
  });
});
