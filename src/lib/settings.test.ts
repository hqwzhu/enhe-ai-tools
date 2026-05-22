import { describe, expect, it } from "vitest";
import {
  getEffectiveHomeHeroIntro,
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
});
