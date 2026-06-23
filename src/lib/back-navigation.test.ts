import { describe, expect, it } from "vitest";
import { getBackNavigationParentHref, shouldShowBackNavigation } from "@/lib/back-navigation";

describe("back navigation", () => {
  it("hides only on localized home pages", () => {
    expect(shouldShowBackNavigation("/")).toBe(false);
    expect(shouldShowBackNavigation("/en")).toBe(false);
    expect(shouldShowBackNavigation("/software")).toBe(true);
    expect(shouldShowBackNavigation("/en/software")).toBe(true);
    expect(shouldShowBackNavigation("/ai-news")).toBe(true);
  });

  it("resolves top-level pages to their localized home pages", () => {
    expect(getBackNavigationParentHref("/software")).toBe("/");
    expect(getBackNavigationParentHref("/en/software")).toBe("/en");
    expect(getBackNavigationParentHref("/login")).toBe("/");
    expect(getBackNavigationParentHref("/en/user")).toBe("/en");
    expect(getBackNavigationParentHref("/admin")).toBe("/");
  });

  it("resolves public detail pages to their localized parent sections", () => {
    expect(getBackNavigationParentHref("/software/ai-voice-generator-flexible-edition")).toBe("/software");
    expect(getBackNavigationParentHref("/en/software/ai-voice-generator-flexible-edition")).toBe("/en/software");
    expect(getBackNavigationParentHref("/account-services/chatgpt-plus")).toBe("/account-services");
    expect(getBackNavigationParentHref("/skill-learning/prompt-course")).toBe("/skill-learning");
    expect(getBackNavigationParentHref("/ai-news/ai-task-scheduling")).toBe("/ai-news");
    expect(getBackNavigationParentHref("/en/ai-news/topics/local-ai")).toBe("/en/ai-news");
    expect(getBackNavigationParentHref("/ai-trends/daily/2026-06-24")).toBe("/ai-trends/daily");
    expect(getBackNavigationParentHref("/legal/privacy-policy")).toBe("/");
  });

  it("resolves admin and account pages to stable parent pages", () => {
    expect(getBackNavigationParentHref("/admin/software/cm123")).toBe("/admin/software");
    expect(getBackNavigationParentHref("/admin/ai-news/import")).toBe("/admin/ai-news");
    expect(getBackNavigationParentHref("/admin/ai-news/keywords")).toBe("/admin/ai-news");
    expect(getBackNavigationParentHref("/admin/orders/cm123")).toBe("/admin/orders");
    expect(getBackNavigationParentHref("/orders/cm123/pay")).toBe("/orders/cm123");
    expect(getBackNavigationParentHref("/orders/cm123")).toBe("/user");
  });
});
