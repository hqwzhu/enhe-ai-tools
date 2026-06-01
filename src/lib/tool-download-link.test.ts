import { describe, expect, it } from "vitest";
import { canShowDownloadLinkArea } from "@/lib/tool-download-link";

describe("tool download link visibility", () => {
  it("shows public download links to every visitor", () => {
    expect(canShowDownloadLinkArea({ isDownloadLinkVipOnly: false, hasVip: false })).toBe(true);
  });

  it("shows VIP-only download links only to VIP users", () => {
    expect(canShowDownloadLinkArea({ isDownloadLinkVipOnly: true, hasVip: false })).toBe(false);
    expect(canShowDownloadLinkArea({ isDownloadLinkVipOnly: true, hasVip: true })).toBe(true);
  });
});
