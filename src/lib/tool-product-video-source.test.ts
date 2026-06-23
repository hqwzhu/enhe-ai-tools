import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function latestVideoMigrationSource() {
  const migrationsDir = join(root, "prisma/migrations");
  const videoMigration = readdirSync(migrationsDir)
    .filter((name) => name.includes("tool_video"))
    .sort()
    .at(-1);
  if (!videoMigration) return "";
  const migrationPath = join(migrationsDir, videoMigration, "migration.sql");
  return existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";
}

describe("tool product video source", () => {
  it("adds product-level video fields to Tool and the database migration", () => {
    const schema = readProjectFile("prisma/schema.prisma");
    const toolModel = schema.slice(schema.indexOf("model Tool {"), schema.indexOf("model ToolTag {"));
    const migration = latestVideoMigrationSource();

    expect(toolModel).toMatch(/videoUrl\s+String\?\s+@map\("video_url"\)/);
    expect(toolModel).toMatch(/videoTitle\s+String\?\s+@map\("video_title"\)/);
    expect(toolModel).toMatch(/videoDescription\s+String\?\s+@map\("video_description"\)/);
    expect(migration).toContain('ADD COLUMN "video_url" TEXT');
    expect(migration).toContain('ADD COLUMN "video_title" TEXT');
    expect(migration).toContain('ADD COLUMN "video_description" TEXT');
  });

  it("lets admins upload, keep, title, and describe a product video", () => {
    const editor = readProjectFile("src/app/admin/tool-admin-list.tsx");
    const guard = readProjectFile("src/app/admin/tool-media-upload-guard.tsx");
    const actions = readProjectFile("src/app/admin/actions.ts");

    expect(editor).toContain('name="videoUrl"');
    expect(editor).toContain('name="videoFile"');
    expect(editor).toContain('name="videoTitle"');
    expect(editor).toContain('name="videoDescription"');
    expect(guard).toContain('"videoFile"');
    expect(guard).toContain("maxVideoBytes");
    expect(guard).toContain("video/mp4");
    expect(guard).toContain("video/webm");
    expect(guard).toContain("video/quicktime");
    expect(actions).toContain('formData.get("videoFile")');
    expect(actions).toContain('formData.get("videoUrl")');
    expect(actions).toContain("saveAdminVideoUpload");
    expect(actions).toContain("videoUrl:");
    expect(actions).toContain("videoTitle:");
    expect(actions).toContain("videoDescription:");
  });

  it("renders product video before the product image gallery on public detail pages", () => {
    const detail = readProjectFile("src/app/tools/[slug]/page-shell.tsx");

    expect(detail).toContain("normalizeMediaSrc");
    expect(detail).toContain("tool.videoUrl");
    expect(detail).toContain("tool-detail-product-video");
    expect(detail).toContain("<video");
    expect(detail).toContain("controls");
    expect(detail).toContain('preload="metadata"');
    expect(detail.indexOf("tool-detail-product-video")).toBeLessThan(detail.indexOf("tool-detail-product-gallery"));
  });
});
