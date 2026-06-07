export function canShowDownloadLinkArea(input: { isDownloadLinkVipOnly: boolean; hasVip: boolean }) {
  return !input.isDownloadLinkVipOnly || input.hasVip;
}

export function getDownloadLinkContent(file?: { filePath?: string | null; fileUrl?: string | null } | null) {
  return (file?.fileUrl ?? file?.filePath ?? "").trim();
}

export function canOpenProtectedDownloadEntry(content: string) {
  return content.startsWith("/") || content.startsWith("cos://") || /^https?:\/\//i.test(content);
}

export function resolveSoftwareDownloadCtaHref(input: {
  hasDownloadLink: boolean;
  showDownloadLinkArea: boolean;
  isVipRequired: boolean;
  hasVip: boolean;
  protectedDownloadHref: string;
}) {
  if (input.hasDownloadLink && input.showDownloadLinkArea) return "#download-links";
  if (input.isVipRequired && !input.hasVip) return "/pricing";
  return input.protectedDownloadHref;
}
