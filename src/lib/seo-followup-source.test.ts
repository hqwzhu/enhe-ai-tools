import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("SEO follow-up source contracts", () => {
  it("keeps admin access session-driven in the header instead of hard-removing it", () => {
    const header = read("src/components/site-header.tsx");
    const mobileNav = read("src/components/mobile-nav-menu.tsx");
    const accountControls = read("src/components/header-account-controls.tsx");
    const adminNav = read("src/components/header-admin-nav-link.tsx");
    const sessionGate = read("src/components/header-session-gate.tsx");

    expect(header).toContain("t.nav.admin");
    expect(mobileNav).toContain("showAdmin");
    expect(header).toContain("HeaderSessionGate");
    expect(sessionGate).toContain('showAdmin={user?.role === "admin"}');
    expect(adminNav).toContain('className="site-nav-link"');
    expect(accountControls).toContain("site-user-chip");
  });

  it("adds AI news detail pages to the public cache header rules", () => {
    const nextConfig = read("next.config.ts");

    expect(nextConfig).toContain('source: "/ai-news/:slug*"');
    expect(nextConfig).toContain('source: "/en/ai-news/:slug*"');
  });

  it("introduces canonical slug helpers for tools and AI news", () => {
    const adminForm = read("src/lib/admin-form.ts");
    const aiNews = read("src/lib/ai-news.ts");
    const toolDetail = read("src/app/tools/[slug]/page-shell.tsx");
    const newsDetail = read("src/app/ai-news/[slug]/page-shell.tsx");

    expect(adminForm).toContain("buildSeoFriendlySlug");
    expect(aiNews).toContain("resolveAiNewsCanonicalSlug");
    expect(toolDetail).toContain("buildSeoFriendlySlug");
    expect(toolDetail).toContain("redirect(");
    expect(newsDetail).toContain("getCanonicalAiNewsSlug");
    expect(newsDetail).toContain("redirect(");
  });
});
