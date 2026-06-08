import type { Metadata } from "next";

export const fallbackSiteBaseUrl = "https://www.enhe-tech.com.cn";
export const siteName = "恩禾 ENHE AI";
export const defaultSiteDescription =
  "恩禾 ENHE AI 提供本地应用与云端 AI 工具，覆盖内容创作、办公效率、文件处理和自动化工作流。";
export const defaultOgImage = "/images/enhe-logo.svg";

type PageMetadataInput = {
  title: string;
  description?: string | null;
  path?: string;
  image?: string | null;
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getSiteBaseUrl() {
  return (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? fallbackSiteBaseUrl).replace(/\/+$/, "");
}

export function buildPageMetadata({ title, description, path = "/", image }: PageMetadataInput): Metadata {
  const finalDescription = truncateDescription(description ?? defaultSiteDescription);
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image ?? defaultOgImage);

  return {
    title,
    description: finalDescription,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description: finalDescription,
      url: canonical,
      siteName,
      images: [
        {
          url: imageUrl,
          alt: title
        }
      ],
      locale: "zh_CN",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: finalDescription,
      images: [imageUrl]
    }
  };
}

export function truncateDescription(value: string, maxLength = 150) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}
