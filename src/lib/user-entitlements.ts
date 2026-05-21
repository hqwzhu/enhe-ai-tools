export type UserEntitlementTool = {
  id: string;
  name: string;
  slug: string;
  type: "software" | "online";
  isVipRequired: boolean;
  isDownloadPaid: boolean;
  downloadFileId: string | null;
  onlineUrl: string | null;
};

type BuildUserToolEntitlementsInput<TTool extends UserEntitlementTool> = {
  hasVip: boolean;
  purchasedToolIds: Iterable<string>;
  tools: TTool[];
};

export function buildUserToolEntitlements<TTool extends UserEntitlementTool>({
  hasVip,
  purchasedToolIds,
  tools
}: BuildUserToolEntitlementsInput<TTool>) {
  const purchased = new Set(purchasedToolIds);
  const software = tools.filter((tool) => tool.type === "software");

  return {
    downloadableSoftware: software.filter((tool) => canDownloadToolFromUserCenter(tool, hasVip, purchased)),
    purchasedSoftware: software.filter((tool) => purchased.has(tool.id)),
    availableOnlineTools: tools.filter((tool) => tool.type === "online" && canUseOnlineToolFromUserCenter(tool, hasVip))
  };
}

function canDownloadToolFromUserCenter(tool: UserEntitlementTool, hasVip: boolean, purchased: Set<string>) {
  if (!tool.downloadFileId) return false;
  if (tool.isVipRequired && !hasVip) return false;
  if (tool.isDownloadPaid && !purchased.has(tool.id)) return false;
  return true;
}

function canUseOnlineToolFromUserCenter(tool: UserEntitlementTool, hasVip: boolean) {
  if (!tool.onlineUrl) return false;
  if (tool.isVipRequired && !hasVip) return false;
  return true;
}
