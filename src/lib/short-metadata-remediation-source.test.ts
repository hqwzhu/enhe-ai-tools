import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("short metadata remediation source contracts", () => {
  it("keeps login, register, and user-center pages out of indexable landing pages", () => {
    for (const path of [
      "src/app/(auth)/layout.tsx",
      "src/app/en/(auth)/layout.tsx",
      "src/app/user/layout.tsx",
      "src/app/en/user/layout.tsx",
    ]) {
      const source = read(path);

      expect(source).toContain("robots");
      expect(source).toContain("index: false");
      expect(source).toContain("follow: true");
    }
  });

  it("redirects the stale account-service URL that was reported as a 404", () => {
    const nextConfig = read("next.config.ts");

    expect(nextConfig).toContain(
      "/account-services/your-ai-account-needs-covered-contact-customer-service-if-you-need-assistance",
    );
    expect(nextConfig).toContain('destination: "/account-services"');
    expect(nextConfig).toContain(
      "/en/account-services/your-ai-account-needs-covered-contact-customer-service-if-you-need-assistance",
    );
    expect(nextConfig).toContain('destination: "/en/account-services"');
  });

  it("uses listing metadata title and topic description helpers on short-title templates", () => {
    const seo = read("src/lib/seo.ts");

    expect(seo).toContain("buildListingMetadataTitle");
    expect(seo).toContain("buildTopicMetaDescription");

    for (const path of [
      "src/app/software/page-shell.tsx",
      "src/app/account-services/page-shell.tsx",
      "src/app/skill-learning/page-shell.tsx",
      "src/app/pricing/page-shell.tsx",
      "src/app/tutorials/page-shell.tsx",
      "src/app/ai-news/page-shell.tsx",
    ]) {
      expect(read(path)).toContain("buildListingMetadataTitle");
    }

    expect(read("src/app/ai-topics/page-shell.tsx")).toContain(
      "buildTopicMetaDescription",
    );
    expect(read("src/app/ai-news/topics/[slug]/page-shell.tsx")).toContain(
      "buildTopicMetaDescription",
    );
  });
});
