import { describe, expect, it } from "vitest";
import { normalizeLocale } from "@/lib/i18n";

describe("normalizeLocale", () => {
  it("keeps supported locales", () => {
    expect(normalizeLocale("zh")).toBe("zh");
    expect(normalizeLocale("en")).toBe("en");
  });

  it("falls back to Chinese for unknown values", () => {
    expect(normalizeLocale("ja")).toBe("zh");
    expect(normalizeLocale(undefined)).toBe("zh");
  });
});
