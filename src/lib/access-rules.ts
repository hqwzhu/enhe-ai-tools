export function canDownloadVipTool(input: { isVipRequired: boolean; hasVip: boolean }) {
  return !input.isVipRequired || input.hasVip;
}
