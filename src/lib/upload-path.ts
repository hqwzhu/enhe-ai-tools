import { join, resolve, sep } from "node:path";

export function getUploadPublicUrl(fileUrlOrName: string) {
  const clean = fileUrlOrName.replace(/\\/g, "/").replace(/^\/+/, "");
  if (clean.startsWith("uploads/")) return `/${clean}`;
  return `/uploads/${clean}`;
}

export function getUploadDiskPath(publicUrl: string, cwd = process.cwd(), uploadDir = process.env.UPLOAD_DIR) {
  const uploadRoot = uploadDir ? resolve(uploadDir) : resolve(cwd, "public", "uploads");
  const normalized = publicUrl.replace(/\\/g, "/").split("?")[0]?.split("#")[0] ?? "";
  const relativePath = normalized
    .replace(/^\/+/, "")
    .replace(/^uploads\/?/, "")
    .split("/")
    .filter(Boolean)
    .join("/");
  const candidate = resolve(uploadRoot, relativePath || "file");
  if (candidate === uploadRoot || candidate.startsWith(`${uploadRoot}${sep}`)) return candidate;
  return join(uploadRoot, "file");
}
