import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8").replace(/\r\n/g, "\n");
}

describe("search Strands experience source contract", () => {
  it("keeps the existing localized search behavior and adds one client-only effect", () => {
    const dialog = readSource("../components/public-search-dialog.tsx");
    const shell = readSource("../app/search/page-shell.tsx");

    expect(shell).toContain("normalizePublicSearchQuery");
    expect(shell).toContain("searchPublicContent(query, forceLocale)");
    expect(dialog).toContain('name="q"');
    expect(dialog).toContain("new URLSearchParams({ q: nextQuery })");
    expect(dialog).toContain('event.key === "Escape"');
    expect(dialog).toContain('event.key === "Tab"');
    expect(dialog).toContain('role="dialog"');
    expect(dialog).toContain('<h1 id="public-search-title" className="sr-only">');
    expect(dialog).not.toContain('className="public-search-header"');
    expect(dialog).toContain('ssr: false');
    expect(dialog.match(/<SearchStrands \/>/g)).toHaveLength(1);
  });

  it("implements pointer parallax without React state updates on pointermove", () => {
    const dialog = readSource("../components/public-search-dialog.tsx");
    const pointerHandler = dialog.slice(
      dialog.indexOf("const handlePointerMove"),
      dialog.indexOf("const resetPointer"),
    );

    expect(dialog).toContain('page.addEventListener("pointermove"');
    expect(dialog).toContain('page.addEventListener("pointerleave"');
    expect(dialog).toContain("window.requestAnimationFrame(renderPointer)");
    expect(dialog).toContain('style.setProperty("--search-pointer-x"');
    expect(dialog).toContain('style.setProperty("--search-parallax-x"');
    expect(dialog).toContain("(prefers-reduced-motion: no-preference)");
    expect(pointerHandler).not.toContain("setState");
    expect(pointerHandler).not.toContain("useState");
  });

  it("uses restrained ENHE colors with mobile and reduced-motion fallbacks", () => {
    const loader = readSource("../components/search/search-strands.client.tsx");

    expect(loader).toContain('["#56bfd0", "#41c5db", "#20bbd6", "#d8f9fb"]');
    expect(loader).toContain("count={mobile ? 2 : 3}");
    expect(loader).toContain("speed={mobile ? 0.32 : 0.38}");
    expect(loader).toContain("opacity={mobile ? 0.64 : 0.82}");
    expect(loader).toContain('glass={false}');
    expect(loader).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(loader).toContain('return <div className="public-search-strands-static" />');
  });

  it("pauses offscreen rendering and releases WebGL resources", () => {
    const strands = readSource("../components/search/strands.client.tsx");

    expect(strands).toContain("new Renderer({");
    expect(strands).toContain("new ResizeObserver(resize)");
    expect(strands).toContain("new IntersectionObserver(");
    expect(strands).toContain("window.cancelAnimationFrame(frameId)");
    expect(strands).toContain("resizeObserver.disconnect()");
    expect(strands).toContain("intersectionObserver.disconnect()");
    expect(strands).toContain("container.removeChild(gl.canvas)");
    expect(strands).toContain('gl.getExtension("WEBGL_lose_context")?.loseContext()');
    expect(strands).toContain("Math.min(window.devicePixelRatio || 1");
  });

  it("removes the old card styling while keeping accessible focus feedback", () => {
    const css = readSource("../app/globals.css");
    const dialogBlock = css.slice(
      css.indexOf(".public-search-dialog"),
      css.indexOf(".public-search-toolbar"),
    );
    const formBlock = css.slice(
      css.indexOf(".public-search-form {"),
      css.indexOf(".public-search-form::after"),
    );

    expect(dialogBlock).toContain("background: transparent");
    expect(dialogBlock).toContain("border: 0");
    expect(dialogBlock).toContain("box-shadow: none");
    expect(formBlock).toContain("background: transparent");
    expect(formBlock).toContain("border: 0");
    expect(css).toContain(".public-search-form:focus-within::after");
    expect(css).toContain(".public-search-submit:focus-visible");
    expect(css).toContain(".public-search-strands-stage");
    expect(css).toContain("pointer-events: none");
    expect(css).not.toContain(".public-search-header");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
