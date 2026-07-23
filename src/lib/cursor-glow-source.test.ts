import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("global cursor glow source contract", () => {
  it("mounts the cursor glow without the React Bits target cursor from the shared root document", () => {
    const layoutSource = readFileSync(new URL("../app/root-layout-shared.tsx", import.meta.url), "utf8");

    expect(layoutSource).toContain('import { CursorGlow } from "@/components/cursor-glow";');
    expect(layoutSource).toContain("<CursorGlow />");
    expect(layoutSource).not.toContain('import { TargetCursor } from "@/components/target-cursor";');
    expect(layoutSource).not.toContain("<TargetCursor");
  });

  it("defines cursor glow styling with accessibility guards in globals.css", () => {
    const cssSource = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(cssSource).toContain(".cursor-glow-shell");
    expect(cssSource).toContain(".cursor-glow-orb");
    expect(cssSource).toContain("@media (pointer: coarse)");
    expect(cssSource).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("extends the footer pointer glow across every homepage section", () => {
    const pageSource = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const cssSource = readFileSync(
      new URL("../app/globals.css", import.meta.url),
      "utf8",
    ).replace(/\r\n/g, "\n");

    expect(pageSource.match(/className="home-pointer-glow"/g)).toHaveLength(1);
    expect(pageSource).toMatch(
      /<main className="home-page-shell">[\s\S]*?<div className="home-pointer-glow" aria-hidden="true" \/>[\s\S]*?<section className="home-hero-shell">/
    );
    expect(cssSource).toContain(".home-pointer-glow {");
    expect(cssSource).toContain("radial-gradient(360px circle at var(--mouse-x) var(--mouse-y)");
    expect(cssSource).toContain("background-attachment: fixed;");
    expect(cssSource).toMatch(/\.home-pointer-glow\s*{[^}]*z-index: 3;/);
    expect(cssSource).toMatch(/\.home-hero-reference-frame\s*{[^}]*z-index: 4;/);
    expect(cssSource).toContain(".home-pointer-glow,\n  .site-footer::after");
    expect(cssSource).toContain("animation: home-fade-in 0.45s ease both;");
    expect(cssSource).toContain("@keyframes home-fade-in");
  });
});
