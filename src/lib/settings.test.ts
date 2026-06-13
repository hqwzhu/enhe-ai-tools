import { describe, expect, it } from "vitest";
import {
  getEffectiveHomeHeroIntro,
  getEffectiveLocalizedHomeHeroIntro,
  getEffectiveLocalizedHomeHeroSubtitle,
  getEffectiveHomeHeroSubtitle,
  getEffectiveHomeHeroTitle,
  getEffectivePaymentQrCode,
  getEffectiveSiteLogo,
  getEffectiveSiteName
} from "@/lib/settings";

describe("public site settings", () => {
  const currentHeroSubtitle = "驾驭 AI 智能，重塑你的人生";
  const currentHeroIntro = "我们都想变得更好，只是常常被重复工作、琐碎流程和生活难题占满时间。\n让 AI 成为你的智能助手，帮你减少消耗、提升效率，把更多精力留给成长、创造和真正想做的事。";
  const currentHeroSubtitleEn = "Master AI intelligence and reshape your life";
  const currentHeroIntroEn = "Use AI software apps and AI account services to amplify your execution, hand repetitive work to AI automation, and reclaim time for growth and creation.";

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
    expect(getEffectiveHomeHeroSubtitle(settings, currentHeroSubtitle)).toBe(currentHeroSubtitle);
  });

  it("does not leak Chinese homepage settings into the English homepage", () => {
    const settings = {
      home_hero_subtitle: "自研电脑软件与在线网页工具分享共研平台",
      home_hero_intro: "下载实用软件，使用在线工具，把重复工作交给自动化，把复杂流程变成一个按钮。"
    };

    expect(getEffectiveLocalizedHomeHeroSubtitle(settings, "en", currentHeroSubtitleEn)).toBe(currentHeroSubtitleEn);
    expect(getEffectiveLocalizedHomeHeroIntro(settings, "en", currentHeroIntroEn)).toBe(currentHeroIntroEn);
    expect(getEffectiveLocalizedHomeHeroSubtitle(settings, "zh", currentHeroSubtitle)).toBe(currentHeroSubtitle);
    expect(getEffectiveLocalizedHomeHeroIntro(settings, "zh", currentHeroIntro)).toBe(currentHeroIntro);
  });

  it("ignores stale localized homepage settings", () => {
    const settings = {
      home_hero_subtitle_zh: "驾驭 AI 工具，重塑你的工作与人生",
      home_hero_intro_zh: "我们都想变得更好，只是常常被重复工作、琐碎流程和生活难题占满时间。\n让 AI 成为你的智能助手，帮你减少消耗、提升效率，把更多精力留给成长、创造和真正想做的事。",
      home_hero_subtitle_en: "Master AI tools and reshape your work, growth, and life",
      home_hero_intro_en: "Use desktop apps and web tools to amplify your execution, hand repetitive work to AI automation, and reclaim time for growth and creation."
    };

    expect(getEffectiveLocalizedHomeHeroSubtitle(settings, "zh", currentHeroSubtitle)).toBe(currentHeroSubtitle);
    expect(getEffectiveLocalizedHomeHeroIntro(settings, "zh", currentHeroIntro)).toBe(currentHeroIntro);
    expect(getEffectiveLocalizedHomeHeroSubtitle(settings, "en", currentHeroSubtitleEn)).toBe(currentHeroSubtitleEn);
    expect(getEffectiveLocalizedHomeHeroIntro(settings, "en", currentHeroIntroEn)).toBe(currentHeroIntroEn);
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

  it("resolves payment QR code settings with default fallbacks", () => {
    expect(getEffectivePaymentQrCode(undefined, "/images/payment/alipay-qr.jpg", "/images/alipay-qr.svg")).toBe(
      "/images/payment/alipay-qr.jpg"
    );
    expect(getEffectivePaymentQrCode("/images/alipay-qr.svg", "/images/payment/alipay-qr.jpg", "/images/alipay-qr.svg")).toBe(
      "/images/payment/alipay-qr.jpg"
    );
    expect(getEffectivePaymentQrCode("/uploads/alipay-new.png", "/images/payment/alipay-qr.jpg", "/images/alipay-qr.svg")).toBe(
      "/uploads/alipay-new.png"
    );
  });
});
