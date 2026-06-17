import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routeFiles = [
  "../app/en/page.tsx",
  "../app/en/legal/[slug]/page.tsx",
  "../app/en/online-tools/page.tsx",
  "../app/en/pricing/page.tsx",
  "../app/en/skill-learning/page.tsx",
  "../app/en/software/page.tsx",
  "../app/en/tools/[slug]/page.tsx",
  "../app/en/tutorials/page.tsx",
  "../app/legal/[slug]/page.tsx",
  "../app/online-tools/page.tsx",
  "../app/pricing/page.tsx",
  "../app/skill-learning/page.tsx",
  "../app/software/page.tsx",
  "../app/tools/[slug]/page.tsx",
  "../app/tutorials/page.tsx"
];

describe("route revalidate source contract", () => {
  it("uses statically analyzable revalidate literals on public app routes", () => {
    for (const relativePath of routeFiles) {
      const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");

      expect(source).toContain("export const revalidate = 300;");
      expect(source).not.toMatch(/export const revalidate = [A-Za-z_][A-Za-z0-9_]*/);
      expect(source).not.toMatch(/,\s*[A-Za-z]+PageRevalidate\s*}/);
    }
  });
});
