import { describe, expect, it } from "vitest";
import { buildPublicUploadUrl, parseBooleanField, parseNumberField, parseScreenshotsField, slugify } from "@/lib/admin-form";

describe("admin form helpers", () => {
  it("creates stable lowercase slugs from names", () => {
    expect(slugify("ENHE Batch Tool 1.0")).toBe("enhe-batch-tool-1-0");
    expect(slugify("  ---Copy Cleaner---  ")).toBe("copy-cleaner");
  });

  it("parses checkbox-style boolean fields", () => {
    expect(parseBooleanField("on")).toBe(true);
    expect(parseBooleanField("true")).toBe(true);
    expect(parseBooleanField(null)).toBe(false);
  });

  it("parses optional number fields with fallback", () => {
    expect(parseNumberField("12.5", 0)).toBe(12.5);
    expect(parseNumberField("", 7)).toBe(7);
  });

  it("splits screenshot fields by line and comma", () => {
    expect(parseScreenshotsField("a.png, b.png\nc.png")).toEqual(["a.png", "b.png", "c.png"]);
  });

  it("builds browser-safe upload urls", () => {
    expect(buildPublicUploadUrl("proof image.png")).toMatch(/^\/uploads\/\d+-proof-image\.png$/);
  });
});
