import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n";

export type SettingsMap = Record<string, string | undefined>;

const legacyHomeHeroTitle = "恩禾 ENHE AI工具站";
const legacyHomeHeroSubtitles = [
  "自研电脑软件与在线网页工具会员平台",
  "自研电脑软件与在线网页工具分享共研平台",
  "驾驭 AI 工具，重塑你的工作与人生"
];
const legacyHomeHeroSubtitlesEn = [
  "Master AI tools and reshape your work, growth, and life"
];
const legacyHomeHeroIntros = [
  "用本地应用和云端工具放大你的行动力，把重复工作交给 AI 自动化，把时间留给成长、创造和更好的自己。",
  "下载实用软件，使用在线工具，把重复工作交给自动化，把复杂流程变成一个按钮。"
];
const legacyHomeHeroIntrosEn = [
  "Use desktop apps and web tools to amplify your execution, hand repetitive work to AI automation, and reclaim time for growth and creation."
];
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
  if (!value || legacyHomeHeroSubtitles.includes(value)) return fallback;
  return value;
}

export function getEffectiveHomeHeroIntro(settings: SettingsMap, fallback: string) {
  const value = cleanSettingValue(settings.home_hero_intro);
  if (!value || legacyHomeHeroIntros.includes(value)) return fallback;
  return value;
}

export function getEffectiveLocalizedHomeHeroSubtitle(settings: SettingsMap, locale: Locale, fallback: string) {
  const localized = cleanSettingValue(settings[`home_hero_subtitle_${locale}`]);
  if (locale === "en" && localized && legacyHomeHeroSubtitlesEn.includes(localized)) return fallback;
  if (locale === "zh" && localized && legacyHomeHeroSubtitles.includes(localized)) return fallback;
  if (localized) return localized;
  if (locale === "en") return fallback;
  return getEffectiveHomeHeroSubtitle(settings, fallback);
}

export function getEffectiveLocalizedHomeHeroIntro(settings: SettingsMap, locale: Locale, fallback: string) {
  const localized = cleanSettingValue(settings[`home_hero_intro_${locale}`]);
  if (locale === "en" && localized && legacyHomeHeroIntrosEn.includes(localized)) return fallback;
  if (locale === "zh" && localized && legacyHomeHeroIntros.includes(localized)) return fallback;
  if (localized) return localized;
  if (locale === "en") return fallback;
  return getEffectiveHomeHeroIntro(settings, fallback);
}

export function getEffectiveFooterCopyright(settings: SettingsMap, fallback: string) {
  return cleanSettingValue(settings.footer_copyright) ?? fallback;
}

export function getEffectivePaymentQrCode(value: string | undefined, fallback: string, legacyPlaceholder: string) {
  const qrCode = cleanSettingValue(value);
  if (!qrCode || qrCode === legacyPlaceholder) return fallback;
  return qrCode;
}
