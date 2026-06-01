import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site header navigation", () => {
  it("does not expose tutorials in the primary header nav", () => {
    const source = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");

    expect(source).not.toContain('"/tutorials"');
    expect(source).not.toContain("t.nav.tutorials");
  });
});
