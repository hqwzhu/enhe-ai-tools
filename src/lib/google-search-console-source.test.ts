import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Google Search Console SEO source contract", () => {
  it("publishes typed canonical detail routes for software, courses, and account services", () => {
    const routeFiles = [
      "src/app/(zh-public)/software/[slug]/page.tsx",
      "src/app/en/software/[slug]/page.tsx",
      "src/app/(zh-public)/skill-learning/[slug]/page.tsx",
      "src/app/en/skill-learning/[slug]/page.tsx",
      "src/app/(zh-public)/account-services/[slug]/page.tsx",
      "src/app/en/account-services/[slug]/page.tsx"
    ];

    for (const routeFile of routeFiles) {
      expect(existsSync(join(root, routeFile)), routeFile).toBe(true);
    }

    const publicSlugs = read("src/lib/public-slugs.ts");
    expect(publicSlugs).toContain('"/software"');
    expect(publicSlugs).toContain('"/skill-learning"');
    expect(publicSlugs).toContain('"/account-services"');
    expect(publicSlugs).not.toContain('`/tools/${getCanonicalToolSlug(tool)}`');
  });

  it("keeps sitemap on canonical public URLs and excludes private or legacy paths", () => {
    const sitemap = read("src/app/sitemap.ts");

    expect(sitemap).toContain("buildCanonicalToolPath");
    expect(sitemap).toContain("shouldIndexEnglishToolPage");
    expect(sitemap).toContain('"/software"');
    expect(sitemap).toContain('"/skill-learning"');
    expect(sitemap).toContain('"/account-services"');
    expect(sitemap).not.toContain('const toolDetailBasePath = "/tools";');
    expect(sitemap).not.toContain('"/online-tools"');
    expect(sitemap).not.toContain('"/en/online-tools"');
    expect(sitemap).not.toContain('"/admin"');
    expect(sitemap).not.toContain('"/dashboard"');
    expect(sitemap).not.toContain('"/user-center"');
    expect(sitemap).not.toContain('"/checkout"');
    expect(sitemap).not.toContain('"/orders"');
    expect(sitemap).not.toContain('"/payment"');
  });

  it("blocks non-public surfaces in robots while exposing the sitemap", () => {
    const robots = read("src/app/robots.ts");

    expect(robots).toContain('absoluteUrl("/sitemap.xml")');
    for (const blockedPath of ["/admin", "/dashboard", "/user-center", "/checkout", "/orders", "/payment", "/api"]) {
      expect(robots).toContain(blockedPath);
    }

    for (const publicPath of ["/ai-news", "/software", "/skill-learning", "/account-services"]) {
      expect(robots).not.toContain(`"${publicPath}"`);
    }
  });

  it("keeps legacy public routes as permanent redirects instead of sitemap targets", () => {
    const zhOnline = read("src/app/(zh-public)/online-tools/page.tsx");
    const zhOnlineDetail = read("src/app/(zh-public)/online-tools/[slug]/page.tsx");
    const enOnline = read("src/app/en/online-tools/page.tsx");
    const enOnlineDetail = read("src/app/en/online-tools/[slug]/page.tsx");
    const zhToolsDetail = read("src/app/(zh-public)/tools/[slug]/page.tsx");
    const enToolsDetail = read("src/app/en/tools/[slug]/page.tsx");
    const toolShell = read("src/app/tools/[slug]/page-shell.tsx");

    expect(zhOnline).toContain("permanentRedirect");
    expect(zhOnline).toContain('"/account-services"');
    expect(zhOnlineDetail).toContain("permanentRedirect");
    expect(zhOnlineDetail).toContain("`/account-services/${slug}`");
    expect(enOnline).toContain("permanentRedirect");
    expect(enOnline).toContain('"/en/account-services"');
    expect(enOnlineDetail).toContain("permanentRedirect");
    expect(enOnlineDetail).toContain("`/en/account-services/${slug}`");
    expect(zhToolsDetail).toContain("redirectLegacyToolDetailPage");
    expect(enToolsDetail).toContain("redirectLegacyToolDetailPage");
    expect(toolShell).toContain("permanentRedirect(buildCanonicalToolPath(tool, forceLocale))");
  });
});
