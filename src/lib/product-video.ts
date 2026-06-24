import { normalizeMediaSrc } from "@/lib/media";
import { parseCosFilePath, parseCosPublicUrl } from "@/lib/storage";

type ProductVideoEnv = Parameters<typeof parseCosPublicUrl>[1];

type ProductVideoInput = {
  url?: string | null;
  title?: string | null;
  description?: string | null;
};

export type ResolvedProductVideo = {
  src: string;
  title: string | null;
  description: string | null;
};

export function resolveProductVideoSrc(value?: string | null, env?: ProductVideoEnv) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (parseCosFilePath(trimmed) || parseCosPublicUrl(trimmed, env)) {
    return `/api/tool-videos?src=${encodeURIComponent(trimmed)}`;
  }

  return normalizeMediaSrc(trimmed);
}

export function resolveProductVideos(videos: ProductVideoInput[], env?: ProductVideoEnv): ResolvedProductVideo[] {
  const resolved: ResolvedProductVideo[] = [];

  for (const video of videos) {
    const src = resolveProductVideoSrc(video.url, env);
    if (!src) continue;

    resolved.push({
      src,
      title: String(video.title ?? "").trim() || null,
      description: String(video.description ?? "").trim() || null
    });

    if (resolved.length >= 2) break;
  }

  return resolved.slice(0, 2);
}
