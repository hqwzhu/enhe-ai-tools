import { describe, expect, it } from "vitest";
import { isImagePath, normalizeImageSrc } from "@/lib/media";

describe("media helpers", () => {
  it("detects image paths so QR codes render as images instead of text", () => {
    expect(isImagePath("/images/payment/alipay-qr.jpg")).toBe(true);
    expect(isImagePath("https://example.com/qr.png")).toBe(true);
    expect(isImagePath("plain payment note")).toBe(false);
  });

  it("normalizes relative image paths for Next image rendering", () => {
    expect(normalizeImageSrc("uploads/proof.jpg")).toBe("/uploads/proof.jpg");
    expect(normalizeImageSrc("/images/qr.jpg")).toBe("/images/qr.jpg");
  });
});
