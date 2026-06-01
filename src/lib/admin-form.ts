export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveToolSlug({
  name,
  slugInput,
  fallbackSeed
}: {
  name: string;
  slugInput?: string | null;
  fallbackSeed: string;
}) {
  const manualSlug = slugInput ? slugify(slugInput) : "";
  if (manualSlug) return manualSlug;

  const nameSlug = slugify(name);
  if (nameSlug) return nameSlug;

  return `tool-${slugify(fallbackSeed) || "item"}`;
}

export function parseBooleanField(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

export function parseNumberField(value: FormDataEntryValue | null, fallback = 0) {
  if (value === null || String(value).trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseOptionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export function parseScreenshotsField(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildPublicUploadUrl(fileName: string, now = Date.now()) {
  const safeName = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `/uploads/${now}-${safeName || "file"}`;
}
