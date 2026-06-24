import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const seedSource = readFileSync(join(process.cwd(), "prisma/seed-lumios.cjs"), "utf8");

describe("LumiOS seed idempotency", () => {
  it("reuses existing tags by generated slug before creating links", () => {
    expect(seedSource).toContain("findOrCreateToolTag");
    expect(seedSource).toContain("findOrCreateNewsTag");
    expect(seedSource).toContain("findUnique({ where: { slug } })");
    expect(seedSource).toContain("findAvailableToolTagSlug");
    expect(seedSource).toContain("findAvailableNewsTagSlug");
    expect(seedSource).toContain("toolId_tagId");
    expect(seedSource).toContain("articleId_tagId");
    expect(seedSource).not.toContain("prisma.toolTag.upsert");
    expect(seedSource).not.toContain("prisma.newsTag.upsert");
    expect(seedSource).not.toContain("prisma.toolTagLink.create");
    expect(seedSource).not.toContain("prisma.newsArticleTag.create");
  });
});
