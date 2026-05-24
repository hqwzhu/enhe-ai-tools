import { describe, expect, it } from "vitest";
import {
  getEffectiveHomeHeroIntro,
  getEffectiveLocalizedHomeHeroIntro,
  getEffectiveLocalizedHomeHeroSubtitle,
  getEffectiveHomeHeroSubtitle,
  getEffectiveHomeHeroTitle,
  getEffectiveSiteLogo,
  getEffectiveSiteName
} from "@/lib/settings";

describe("public site settings", () => {
  it("uses explicit site settings when present", () => {
    const settings = {
      site_name: "Custom Site",
      site_logo: "/uploads/custom-logo.png",
      home_hero_title: "Custom Hero",
      home_hero_subtitle: "Custom Subtitle",
      home_hero_intro: "Custom intro"
    };

    expect(getEffectiveSiteName(settings, "Fallback")).toBe("Custom Site");
    expect(getEffectiveSiteLogo(settings, "/images/fallback.svg")).toBe("/uploads/custom-logo.png");
    expect(getEffectiveHomeHeroTitle(settings, "Fallback Hero")).toBe("Custom Hero");
    expect(getEffectiveHomeHeroSubtitle(settings, "Fallback Subtitle")).toBe("Custom Subtitle");
    expect(getEffectiveHomeHeroIntro(settings, "Fallback intro")).toBe("Custom intro");
  });

  it("ignores stale seed defaults that would revert the current branding", () => {
    const settings = {
      site_logo: "ENHE",
      home_hero_title: "恩禾 ENHE AI工具站",
      home_hero_subtitle: "自研电脑软件与在线网页工具会员平台"
    };

    expect(getEffectiveSiteLogo(settings, "/images/enhe-logo.svg")).toBe("/images/enhe-logo.svg");
    expect(getEffectiveHomeHeroTitle(settings, "ENHE AI Tools")).toBe("ENHE AI Tools");
    expect(getEffectiveHomeHeroSubtitle(settings, "自研电脑软件与在线网页工具分享共研平台")).toBe(
      "自研电脑软件与在线网页工具分享共研平台"
    );
  });

  it("does not leak Chinese homepage settings into the English homepage", () => {
    const settings = {
      home_hero_subtitle: "自研电脑软件与在线网页工具分享共研平台",
      home_hero_intro: "下载实用软件，使用在线工具，把重复工作交给自动化，把复杂流程变成一个按钮。"
    };

    expect(getEffectiveLocalizedHomeHeroSubtitle(settings, "en", "A co-creation platform for desktop software and online tools")).toBe(
      "A co-creation platform for desktop software and online tools"
    );
    expect(getEffectiveLocalizedHomeHeroIntro(settings, "en", "Download practical software and use browser-based tools.")).toBe(
      "Download practical software and use browser-based tools."
    );
    expect(getEffectiveLocalizedHomeHeroSubtitle(settings, "zh", "fallback")).toBe("自研电脑软件与在线网页工具分享共研平台");
    expect(getEffectiveLocalizedHomeHeroIntro(settings, "zh", "fallback")).toBe(
      "下载实用软件，使用在线工具，把重复工作交给自动化，把复杂流程变成一个按钮。"
    );
  });

  it("uses explicit English homepage settings when configured", () => {
    const settings = {
      home_hero_subtitle: "中文副标题",
      home_hero_intro: "中文介绍",
      home_hero_subtitle_en: "Custom English subtitle",
      home_hero_intro_en: "Custom English intro"
    };

    expect(getEffectiveLocalizedHomeHeroSubtitle(settings, "en", "fallback")).toBe("Custom English subtitle");
    expect(getEffectiveLocalizedHomeHeroIntro(settings, "en", "fallback")).toBe("Custom English intro");
  });
});
