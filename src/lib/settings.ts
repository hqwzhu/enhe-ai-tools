import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n";

export type SettingsMap = Record<string, string | undefined>;

const legacyHomeHeroTitle = "恩禾 ENHE AI工具站";
const legacyHomeHeroSubtitle = "自研电脑软件与在线网页工具会员平台";
const legacyTextLogo = "ENHE";

export async function getSettingsMap() {
  const settings = await prisma.siteSetting.findMany();
  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
}

function cleanSettingValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function getEffectiveSiteName(settings: SettingsMap, fallback: string) {
  return cleanSettingValue(settings.site_name) ?? fallback;
}

export function getEffectiveSiteLogo(settings: SettingsMap, fallback: string) {
  const value = cleanSettingValue(settings.site_logo);
  if (!value || value === legacyTextLogo) return fallback;
  if (/^https?:\/\//i.test(value) || value.startsWith("/") || /\.(svg|png|jpe?g|webp|gif)$/i.test(value)) {
    return value;
  }
  return fallback;
}

export function getEffectiveHomeHeroTitle(settings: SettingsMap, fallback: string) {
  const value = cleanSettingValue(settings.home_hero_title);
  if (!value || value === legacyHomeHeroTitle) return fallback;
  return value;
}

export function getEffectiveHomeHeroSubtitle(settings: SettingsMap, fallback: string) {
  const value = cleanSettingValue(settings.home_hero_subtitle);
  if (!value || value === legacyHomeHeroSubtitle) return fallback;
  return value;
}

export function getEffectiveHomeHeroIntro(settings: SettingsMap, fallback: string) {
  return cleanSettingValue(settings.home_hero_intro) ?? fallback;
}

export function getEffectiveLocalizedHomeHeroSubtitle(settings: SettingsMap, locale: Locale, fallback: string) {
  const localized = cleanSettingValue(settings[`home_hero_subtitle_${locale}`]);
  if (localized) return localized;
  if (locale === "en") return fallback;
  return getEffectiveHomeHeroSubtitle(settings, fallback);
}

export function getEffectiveLocalizedHomeHeroIntro(settings: SettingsMap, locale: Locale, fallback: string) {
  const localized = cleanSettingValue(settings[`home_hero_intro_${locale}`]);
  if (localized) return localized;
  if (locale === "en") return fallback;
  return getEffectiveHomeHeroIntro(settings, fallback);
}

export function getEffectiveFooterCopyright(settings: SettingsMap, fallback: string) {
  return cleanSettingValue(settings.footer_copyright) ?? fallback;
}
