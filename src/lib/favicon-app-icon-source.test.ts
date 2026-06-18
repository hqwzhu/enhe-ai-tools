import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("favicon and app icon source contract", () => {
  it("exposes standard icon files and a web app manifest", () => {
    expect(existsSync(join(root, "public/favicon.ico"))).toBe(true);
    expect(existsSync(join(root, "public/icon-192.png"))).toBe(true);
    expect(existsSync(join(root, "public/icon-512.png"))).toBe(true);
    expect(existsSync(join(root, "public/apple-icon.png"))).toBe(true);
    expect(existsSync(join(root, "src/app/manifest.ts"))).toBe(true);
  });

  it("links favicon, apple icon, and manifest from shared root metadata", async () => {
    const source = await import("@/app/root-layout-shared");

    expect(source.sharedRootMetadata.manifest).toBe("/manifest.webmanifest");
    expect(source.sharedRootMetadata.icons).toMatchObject({
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }]
    });
  });
});
