import { describe, expect, it } from "vitest";
import { dictionaries, normalizeLocale } from "@/lib/i18n";

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

describe("homepage and navigation copy", () => {
  it("uses the new Chinese local-app and cloud-tool naming", () => {
    expect(dictionaries.zh.nav.software).toBe("本地应用");
    expect(dictionaries.zh.nav.onlineTools).toBe("云端工具");
    expect(dictionaries.zh.home.softwareButton).toBe("本地应用");
    expect(dictionaries.zh.home.onlineButton).toBe("云端工具");
    expect(dictionaries.zh.home.featuredSoftwareEyebrow).toBe("Desktop Apps");
    expect(dictionaries.zh.home.featuredSoftwareTitle).toBe("精选本地应用");
    expect(dictionaries.zh.home.onlineToolsEyebrow).toBe("Web Tools");
    expect(dictionaries.zh.home.onlineToolsTitle).toBe("精选云端工具");
  });

  it("uses matching English naming for the same surfaces", () => {
    expect(dictionaries.en.nav.software).toBe("Desktop Apps");
    expect(dictionaries.en.nav.onlineTools).toBe("Web Tools");
    expect(dictionaries.en.home.softwareButton).toBe("Desktop Apps");
    expect(dictionaries.en.home.onlineButton).toBe("Web Tools");
    expect(dictionaries.en.home.featuredSoftwareEyebrow).toBe("Desktop Apps");
    expect(dictionaries.en.home.onlineToolsEyebrow).toBe("Web Tools");
  });
});
