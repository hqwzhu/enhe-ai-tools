import { existsSync, readFileSync } from "node:fs";
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

async function loadIcoPngFrames(path: string) {
  const { default: sharp } = await import("sharp");
  const buffer = readFileSync(join(root, path));
  const reserved = buffer.readUInt16LE(0);
  const type = buffer.readUInt16LE(2);
  const count = buffer.readUInt16LE(4);

  expect(reserved).toBe(0);
  expect(type).toBe(1);
  expect(count).toBeGreaterThan(0);

  const frames = [];
  for (let frame = 0; frame < count; frame += 1) {
    const entryOffset = 6 + frame * 16;
    const byteLength = buffer.readUInt32LE(entryOffset + 8);
    const imageOffset = buffer.readUInt32LE(entryOffset + 12);
    const imageBuffer = buffer.subarray(imageOffset, imageOffset + byteLength);
    const pngSignature = imageBuffer.subarray(0, 8).toString("hex");
    expect(pngSignature).toBe("89504e470d0a1a0a");

    const image = sharp(imageBuffer, { animated: false });
    const metadata = await image.metadata();
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    frames.push({ data, info, metadata });
  }

  return frames;
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

function edgeOpaqueRatio(data: Buffer, width: number, height: number, alphaThreshold = 16) {
  const insetX = Math.max(1, Math.ceil(width * 0.08));
  const insetY = Math.max(1, Math.ceil(height * 0.08));
  let edgePixels = 0;
  let opaqueEdgePixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x >= insetX && x < width - insetX && y >= insetY && y < height - insetY) continue;
      edgePixels += 1;
      const alpha = data[(y * width + x) * 4 + 3] ?? 0;
      if (alpha > alphaThreshold) opaqueEdgePixels += 1;
    }
  }

  return opaqueEdgePixels / Math.max(1, edgePixels);
}

function darkOpaqueRatio(data: Buffer, alphaThreshold = 16) {
  let opaquePixels = 0;
  let darkPixels = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] ?? 0;
    if (alpha <= alphaThreshold) continue;
    opaquePixels += 1;
    const red = data[index] ?? 0;
    const green = data[index + 1] ?? 0;
    const blue = data[index + 2] ?? 0;
    if (red < 32 && green < 32 && blue < 32) darkPixels += 1;
  }

  return darkPixels / Math.max(1, opaquePixels);
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
    expect(JSON.stringify(source.sharedRootMetadata.icons)).not.toContain("white-bg");
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

  it("keeps app icon edges transparent without dark tab backgrounds", async () => {
    const appIcon = await loadImageAsset("public/icon-192.png");
    const largeIcon = await loadImageAsset("public/icon-512.png");
    const appleIcon = await loadImageAsset("public/apple-icon.png");

    for (const icon of [appIcon, largeIcon, appleIcon]) {
      expect(edgeOpaqueRatio(icon.data, icon.info.width, icon.info.height)).toBeLessThan(0.05);
      expect(darkOpaqueRatio(icon.data)).toBeLessThan(0.01);
    }
  });

  it("keeps favicon ico frames transparent without dark tab backgrounds", async () => {
    const frames = await loadIcoPngFrames("public/favicon.ico");

    for (const frame of frames) {
      expect(frame.metadata.hasAlpha).toBe(true);
      expect(edgeOpaqueRatio(frame.data, frame.info.width, frame.info.height)).toBeLessThan(0.05);
      expect(darkOpaqueRatio(frame.data)).toBeLessThan(0.01);
    }
  });
});
