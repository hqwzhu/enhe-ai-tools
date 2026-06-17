import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("global cursor glow source contract", () => {
  it("mounts the cursor glow from the shared root document", () => {
    const layoutSource = readFileSync(new URL("../app/root-layout-shared.tsx", import.meta.url), "utf8");

    expect(layoutSource).toContain('import { CursorGlow } from "@/components/cursor-glow";');
    expect(layoutSource).toContain("<CursorGlow />");
  });

  it("defines cursor glow styling and accessibility guards in globals.css", () => {
    const cssSource = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(cssSource).toContain(".cursor-glow-shell");
    expect(cssSource).toContain(".cursor-glow-orb");
    expect(cssSource).toContain("@media (pointer: coarse)");
    expect(cssSource).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
