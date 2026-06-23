import { normalizeMediaSrc } from "@/lib/media";
import { parseCosFilePath, parseCosPublicUrl } from "@/lib/storage";

type ProductVideoEnv = Parameters<typeof parseCosPublicUrl>[1];

export function resolveProductVideoSrc(value?: string | null, env?: ProductVideoEnv) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (parseCosFilePath(trimmed) || parseCosPublicUrl(trimmed, env)) {
    return `/api/tool-videos?src=${encodeURIComponent(trimmed)}`;
  }

  return normalizeMediaSrc(trimmed);
}
