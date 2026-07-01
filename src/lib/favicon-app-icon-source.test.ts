import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

async function loadImageAsset(path: string) {
  const { default: sharp } = await import("sharp");
  const image = sharp(join(root, path), { animated: false });
  const metadata = await image.metadata();
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, info, metadata };
}

function averageOpaqueColor(data: Buffer, alphaThreshold = 16) {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] ?? 0;
    if (alpha <= alphaThreshold) continue;
    r += data[index] ?? 0;
    g += data[index + 1] ?? 0;
    b += data[index + 2] ?? 0;
    count += 1;
  }

  return {
    r: Math.round(r / Math.max(1, count)),
    g: Math.round(g / Math.max(1, count)),
    b: Math.round(b / Math.max(1, count))
  };
}

function hasGradientColorRange(data: Buffer, alphaThreshold = 16) {
  let minR = 255;
  let maxR = 0;
  let minG = 255;
  let maxG = 0;
  let minB = 255;
  let maxB = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] ?? 0;
    if (alpha <= alphaThreshold) continue;
    const red = data[index] ?? 0;
    const green = data[index + 1] ?? 0;
    const blue = data[index + 2] ?? 0;
    minR = Math.min(minR, red);
    maxR = Math.max(maxR, red);
    minG = Math.min(minG, green);
    maxG = Math.max(maxG, green);
    minB = Math.min(minB, blue);
    maxB = Math.max(maxB, blue);
  }

  return maxR - minR > 80 && maxG - minG > 80 && maxB - minB > 80;
}

describe("favicon and app icon source contract", () => {
  it("exposes standard icon files and a web app manifest", () => {
    expect(existsSync(join(root, "public/favicon.ico"))).toBe(true);
    expect(existsSync(join(root, "public/icon-192.png"))).toBe(true);
    expect(existsSync(join(root, "public/icon-512.png"))).toBe(true);
    expect(existsSync(join(root, "public/apple-icon.png"))).toBe(true);
    expect(existsSync(join(root, "public/images/brand/enhe-favicon-source.png"))).toBe(true);
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

  it("keeps favicon and app icons aligned to the approved ENHE gradient source", async () => {
    const brand = await loadImageAsset("public/images/brand/enhe-favicon-source.png");
    const appIcon = await loadImageAsset("public/icon-192.png");
    const appleIcon = await loadImageAsset("public/apple-icon.png");

    expect(averageOpaqueColor(brand.data)).not.toMatchObject({
      r: expect.closeTo(240, 14),
      g: expect.closeTo(90, 14),
      b: expect.closeTo(53, 14)
    });
    expect(hasGradientColorRange(appIcon.data)).toBe(true);
    expect(hasGradientColorRange(appleIcon.data)).toBe(true);
    expect(appIcon.metadata.width).toBe(192);
    expect(appIcon.metadata.height).toBe(192);
    expect(appleIcon.metadata.width).toBe(180);
    expect(appleIcon.metadata.height).toBe(180);
    expect(appIcon.metadata.hasAlpha).toBe(true);
    expect(appleIcon.metadata.hasAlpha).toBe(true);
  });
});
