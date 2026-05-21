export function canDownloadVipTool(input: { isVipRequired: boolean; hasVip: boolean }) {
  return !input.isVipRequired || input.hasVip;
}

export function canAccessVipTool(input: { isVipRequired: boolean; hasVip: boolean }) {
  return !input.isVipRequired || input.hasVip;
}
