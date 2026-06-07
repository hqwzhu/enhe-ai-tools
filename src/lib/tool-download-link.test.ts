import { describe, expect, it } from "vitest";
import {
  canOpenProtectedDownloadEntry,
  canShowDownloadLinkArea,
  getDownloadLinkContent,
  resolveSoftwareDownloadCtaHref
} from "@/lib/tool-download-link";

describe("tool download link visibility", () => {
  it("shows public download links to every visitor", () => {
    expect(canShowDownloadLinkArea({ isDownloadLinkVipOnly: false, hasVip: false })).toBe(true);
  });

  it("shows VIP-only download links only to VIP users", () => {
    expect(canShowDownloadLinkArea({ isDownloadLinkVipOnly: true, hasVip: false })).toBe(false);
    expect(canShowDownloadLinkArea({ isDownloadLinkVipOnly: true, hasVip: true })).toBe(true);
  });

  it("keeps arbitrary download link content as display text", () => {
    expect(getDownloadLinkContent({ filePath: "中文下载说明：联系管理员获取", fileUrl: "中文下载说明：联系管理员获取" })).toBe(
      "中文下载说明：联系管理员获取"
    );
  });

  it("only opens protected download entries for real locators", () => {
    expect(canOpenProtectedDownloadEntry("中文下载说明：联系管理员获取")).toBe(false);
    expect(canOpenProtectedDownloadEntry("/uploads/app.zip")).toBe(true);
    expect(canOpenProtectedDownloadEntry("https://example.com/app.zip")).toBe(true);
    expect(canOpenProtectedDownloadEntry("cos://bucket/app.zip")).toBe(true);
  });

  it("routes VIP users to the download-link section and ordinary users to pricing", () => {
    expect(
      resolveSoftwareDownloadCtaHref({
        hasDownloadLink: true,
        showDownloadLinkArea: true,
        isVipRequired: true,
        hasVip: true,
        protectedDownloadHref: "/api/tools/tool-1/download"
      })
    ).toBe("#download-links");

    expect(
      resolveSoftwareDownloadCtaHref({
        hasDownloadLink: true,
        showDownloadLinkArea: false,
        isVipRequired: true,
        hasVip: false,
        protectedDownloadHref: "/api/tools/tool-1/download"
      })
    ).toBe("/pricing");

    expect(
      resolveSoftwareDownloadCtaHref({
        hasDownloadLink: false,
        showDownloadLinkArea: false,
        isVipRequired: false,
        hasVip: false,
        protectedDownloadHref: "/api/tools/tool-1/download"
      })
    ).toBe("/api/tools/tool-1/download");
  });
});
