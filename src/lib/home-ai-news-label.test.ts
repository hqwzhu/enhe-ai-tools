import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/i18n";

describe("home AI news label contracts", () => {
  it("uses the AI frontier news naming on Chinese public surfaces", () => {
    expect(dictionaries.zh.nav.aiNews).toBe("AI前沿资讯");
    expect(dictionaries.zh.home.aiNewsButton).toBe("AI前沿资讯");
    expect(dictionaries.zh.aiNews.title).toBe("AI前沿资讯与趋势洞察");
  });

  it("keeps AI news discoverable from the simplified homepage support links", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(page).toContain("homeSupportLinks");
    expect(page).toContain('label: "AI 前沿资讯", href: "/ai-news"');
    expect(page).toContain('label: "AI News", href: "/ai-news"');
    expect(page).toContain('href={buildLocalePath(item.href, forceLocale)}');
    expect(page).toContain('className="home-support-link"');
    expect(page).toContain('href={buildLocalePath("/software", forceLocale)}');
    expect(page).toContain('href={buildLocalePath("/pricing", forceLocale)}');
    expect(page).not.toContain("HomeGooeyNav");
  });
});
