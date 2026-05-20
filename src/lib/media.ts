export function isImagePath(value?: string | null) {
  if (!value) return false;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(value.split("?")[0] ?? "");
}

export function normalizeImageSrc(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  return `/${trimmed.replace(/^\/+/, "")}`;
}

export function isLikelyUploadableImage(file: File | null | undefined) {
  return Boolean(file && file.size > 0 && file.type.startsWith("image/"));
}
