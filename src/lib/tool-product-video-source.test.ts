import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function videoMigrationSource() {
  const migrationsDir = join(root, "prisma/migrations");
  return readdirSync(migrationsDir)
    .filter((name) => name.includes("tool_video"))
    .sort()
    .map((videoMigration) => {
      const migrationPath = join(migrationsDir, videoMigration, "migration.sql");
      return existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";
    })
    .join("\n");
}

describe("tool product video source", () => {
  it("adds product-level video fields to Tool and the database migration", () => {
    const schema = readProjectFile("prisma/schema.prisma");
    const toolModel = schema.slice(schema.indexOf("model Tool {"), schema.indexOf("model ToolTag {"));
    const migration = videoMigrationSource();

    expect(toolModel).toMatch(/videoUrl\s+String\?\s+@map\("video_url"\)/);
    expect(toolModel).toMatch(/videoTitle\s+String\?\s+@map\("video_title"\)/);
    expect(toolModel).toMatch(/videoDescription\s+String\?\s+@map\("video_description"\)/);
    expect(toolModel).toMatch(/videoUrl2\s+String\?\s+@map\("video_url_2"\)/);
    expect(toolModel).toMatch(/videoTitle2\s+String\?\s+@map\("video_title_2"\)/);
    expect(toolModel).toMatch(/videoDescription2\s+String\?\s+@map\("video_description_2"\)/);
    expect(migration).toContain('ADD COLUMN "video_url" TEXT');
    expect(migration).toContain('ADD COLUMN "video_title" TEXT');
    expect(migration).toContain('ADD COLUMN "video_description" TEXT');
    expect(migration).toContain('ADD COLUMN "video_url_2" TEXT');
    expect(migration).toContain('ADD COLUMN "video_title_2" TEXT');
    expect(migration).toContain('ADD COLUMN "video_description_2" TEXT');
  });

  it("lets admins upload, keep, title, and describe up to two product videos", () => {
    const editor = readProjectFile("src/app/admin/tool-admin-list.tsx");
    const guard = readProjectFile("src/app/admin/tool-media-upload-guard.tsx");
    const actions = readProjectFile("src/app/admin/actions.ts");

    expect(editor).toContain('name="videoUrl"');
    expect(editor).toContain('name="videoFile"');
    expect(editor).toContain('name="videoTitle"');
    expect(editor).toContain('name="videoDescription"');
    expect(editor).toContain('name="videoUrl2"');
    expect(editor).toContain('name="videoFile2"');
    expect(editor).toContain('name="videoTitle2"');
    expect(editor).toContain('name="videoDescription2"');
    expect(guard).toContain('"videoFile"');
    expect(guard).toContain('"videoFile2"');
    expect(guard).toContain("maxVideoBytes");
    expect(guard).toContain("video/mp4");
    expect(guard).toContain("video/webm");
    expect(guard).toContain("video/quicktime");
    expect(actions).toContain('formData.get("videoFile")');
    expect(actions).toContain('formData.get("videoFile2")');
    expect(actions).toContain('formData.get("videoUrl")');
    expect(actions).toContain('formData.get("videoUrl2")');
    expect(actions).toContain("saveAdminVideoUpload");
    expect(actions).toContain("videoUrl:");
    expect(actions).toContain("videoTitle:");
    expect(actions).toContain("videoDescription:");
    expect(actions).toContain("videoUrl2:");
    expect(actions).toContain("videoTitle2:");
    expect(actions).toContain("videoDescription2:");
  });

  it("renders up to two product videos before the product image gallery on public detail pages", () => {
    const detail = readProjectFile("src/app/tools/[slug]/page-shell.tsx");
    const helper = readProjectFile("src/lib/product-video.ts");

    expect(detail).toContain("resolveProductVideos");
    expect(detail).toContain("tool-detail-product-video");
    expect(detail).toContain("<video");
    expect(detail).toContain("autoPlay");
    expect(detail).toContain("controls");
    expect(detail).toContain("muted");
    expect(detail).toContain('preload="auto"');
    expect(detail.indexOf("tool-detail-product-video")).toBeLessThan(detail.indexOf("tool-detail-product-gallery"));
    expect(helper).toContain("resolveProductVideos");
    expect(helper).toContain("resolveProductVideoSrc");
    expect(helper).toContain("slice(0, 2)");
  });

  it("proxies private COS product videos instead of rendering forbidden public URLs", () => {
    const helper = readProjectFile("src/lib/product-video.ts");
    const route = readProjectFile("src/app/api/tool-videos/route.ts");
    const actions = readProjectFile("src/app/admin/actions.ts");

    expect(helper).toContain("parseCosFilePath");
    expect(helper).toContain("parseCosPublicUrl");
    expect(helper).toContain("/api/tool-videos?src=");
    expect(route).toContain("getSecureCosMediaUrl");
    expect(route).toContain("NextResponse.redirect");
    expect(actions).toContain('stored.storage === "cos" ? stored.filePath : stored.fileUrl');
  });

  it("serves uploaded videos with byte ranges for browser playback", () => {
    const uploadRoute = readProjectFile("src/app/api/uploads/[...fileName]/route.ts");

    expect(uploadRoute).toContain("parseRangeHeader");
    expect(uploadRoute).toContain("createReadStream");
    expect(uploadRoute).toContain("Accept-Ranges");
    expect(uploadRoute).toContain("Content-Range");
    expect(uploadRoute).toContain("status: 206");
    expect(uploadRoute).toContain('".mp4": "video/mp4"');
  });
});
