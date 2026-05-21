import { describe, expect, it } from "vitest";
import {
  canAccessVipTool,
  canDownloadVipTool,
  getDownloadRateLimitConfig,
  isDownloadRateLimitExceeded
} from "@/lib/access-rules";

describe("access rules", () => {
  it("blocks ordinary users from downloading VIP software", () => {
    expect(canDownloadVipTool({ isVipRequired: true, hasVip: false })).toBe(false);
  });

  it("allows VIP users to download VIP software", () => {
    expect(canDownloadVipTool({ isVipRequired: true, hasVip: true })).toBe(true);
  });

  it("uses the same VIP gate for online tool usage", () => {
    expect(canAccessVipTool({ isVipRequired: true, hasVip: false })).toBe(false);
    expect(canAccessVipTool({ isVipRequired: true, hasVip: true })).toBe(true);
    expect(canAccessVipTool({ isVipRequired: false, hasVip: false })).toBe(true);
  });

  it("parses download rate limit settings with safe defaults", () => {
    expect(getDownloadRateLimitConfig({ DOWNLOAD_RATE_LIMIT_MAX: "5", DOWNLOAD_RATE_LIMIT_WINDOW_SECONDS: "30" })).toEqual({
      max: 5,
      windowSeconds: 30
    });
    expect(getDownloadRateLimitConfig({ DOWNLOAD_RATE_LIMIT_MAX: "0", DOWNLOAD_RATE_LIMIT_WINDOW_SECONDS: "-1" })).toEqual({
      max: 10,
      windowSeconds: 60
    });
  });

  it("detects when download attempts exceed the configured window limit", () => {
    expect(isDownloadRateLimitExceeded(9, 10)).toBe(false);
    expect(isDownloadRateLimitExceeded(10, 10)).toBe(true);
  });
});
