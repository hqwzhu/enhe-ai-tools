import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildLanguageSwitcherHref } from "@/lib/seo";

describe("buildLanguageSwitcherHref", () => {
  it("keeps localized public routes on the matching page", () => {
    expect(buildLanguageSwitcherHref("/", "en")).toBe("/en");
    expect(buildLanguageSwitcherHref("/en", "zh")).toBe("/");
    expect(buildLanguageSwitcherHref("/software", "en")).toBe("/en/software");
    expect(buildLanguageSwitcherHref("/en/software", "zh")).toBe("/software");
    expect(buildLanguageSwitcherHref("/software/demo-tool", "en")).toBe("/en/software/demo-tool");
    expect(buildLanguageSwitcherHref("/skill-learning/demo-course", "en")).toBe("/en/skill-learning/demo-course");
    expect(buildLanguageSwitcherHref("/account-services/demo-service", "en")).toBe("/en/account-services/demo-service");
    expect(buildLanguageSwitcherHref("/en/legal/privacy-policy", "zh")).toBe("/legal/privacy-policy");
  });

  it("falls back to the locale homepage for non-localized routes", () => {
    expect(buildLanguageSwitcherHref("/admin", "en")).toBe("/en");
    expect(buildLanguageSwitcherHref("/admin/orders", "zh")).toBe("/");
    expect(buildLanguageSwitcherHref("/orders", "en")).toBe("/en");
    expect(buildLanguageSwitcherHref("/relay", "zh")).toBe("/");
  });
});

describe("language switcher source", () => {
  it("uses link-friendly styles and locale-aware fallback href generation", () => {
    const component = readFileSync(new URL("../components/language-switcher.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(component).toContain("buildLanguageSwitcherHref");
    expect(component).not.toContain("buildLocalePath(normalizedPath, item)");

    expect(css).toContain(".site-language-switcher a");
    expect(css).toContain(".site-language-switcher a.is-active");
    expect(css).not.toContain(".site-language-switcher button");
    expect(css).not.toContain(".site-language-switcher button.is-active");
  });
});
