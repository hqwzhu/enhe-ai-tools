import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("launch readiness source coverage", () => {
  it("ships crawlable SEO endpoints and metadata foundations", () => {
    expect(existsSync(join(root, "src/app/robots.ts"))).toBe(true);
    expect(existsSync(join(root, "src/app/sitemap.ts"))).toBe(true);
    expect(read("src/app/sitemap.ts")).toContain("force-dynamic");

    const layout = read("src/app/layout.tsx");
    expect(layout).toContain("metadataBase");
    expect(layout).toContain("buildPageMetadata");

    const seo = read("src/lib/seo.ts");
    expect(seo).toContain("openGraph");
    expect(seo).toContain("twitter");

    const toolDetail = read("src/app/tools/[slug]/page.tsx");
    expect(toolDetail).toContain("generateMetadata");
    expect(toolDetail).toContain("canonical");
  });

  it("makes paid downloads, home cards, mobile nav, and tool detail more conversion-ready", () => {
    const pricing = read("src/app/pricing/page.tsx");
    expect(pricing).toContain("Paid downloads");
    expect(pricing).toContain('href="/software"');
    expect(pricing).not.toContain("createOrderAction");

    const toolCard = read("src/components/tool-card.tsx");
    expect(toolCard).toContain("buildCardHighlights");
    expect(toolCard).toContain("audienceLabel");

    const header = read("src/components/site-header.tsx");
    expect(header).toContain("MobileNavMenu");

    const mobileNav = read("src/components/mobile-nav-menu.tsx");
    expect(mobileNav).toContain("details");
    expect(mobileNav).toContain("menu");

    const toolDetail = read("src/app/tools/[slug]/page.tsx");
    expect(toolDetail).toContain("faqs");
    expect(toolDetail).toContain("trustTitle");
    expect(toolDetail).toContain("supportEmail");
    expect(toolDetail).toContain("/legal/membership-refund");
  });

  it("captures the commercial funnel and ships operations scripts", () => {
    const schema = read("prisma/schema.prisma");
    expect(schema).toContain("model AnalyticsEvent");

    const actions = read("src/app/actions.ts");
    expect(actions).toContain("trackAnalyticsEvent");
    expect(actions).toContain("sendAdminLoginSecurityEmail");

    const adminDashboard = read("src/app/admin/page.tsx");
    expect(adminDashboard).toContain("analyticsFunnel");

    expect(existsSync(join(root, "deploy/enhe-ai-tools/scripts/enhe-backup-db.sh"))).toBe(true);
    expect(existsSync(join(root, "deploy/enhe-ai-tools/scripts/enhe-health-watch.sh"))).toBe(true);
    expect(existsSync(join(root, "deploy/enhe-ai-tools/scripts/enhe-install-cron.sh"))).toBe(true);
  });
});
