export function canShowDownloadLinkArea(input: { isDownloadLinkVipOnly: boolean; hasVip: boolean }) {
  return !input.isDownloadLinkVipOnly || input.hasVip;
}
