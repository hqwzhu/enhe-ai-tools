import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildPublicUploadUrl } from "@/lib/admin-form";
import { getUploadDiskPath } from "@/lib/upload-path";

type StorageEnv = Record<string, string | undefined>;

export type StoredUpload = {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  storage: "local" | "cos";
  objectKey: string;
};

type SaveUploadOptions = {
  folder: string;
  maxBytes: number;
  accept?: (file: File) => boolean;
  invalidTypeMessage?: string;
};

export function isCosStorageConfigured(env: StorageEnv = process.env) {
  return Boolean(
    env.TENCENT_COS_SECRET_ID?.trim() &&
      env.TENCENT_COS_SECRET_KEY?.trim() &&
      env.TENCENT_COS_BUCKET?.trim() &&
      env.TENCENT_COS_REGION?.trim()
  );
}

function sanitizeFileName(fileName: string) {
  const lower = fileName.trim().toLowerCase();
  const extension = lower.includes(".") ? lower.slice(lower.lastIndexOf(".")) : "";
  const baseName = lower
    .replace(extension, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${baseName || "file"}${extension.replace(/[^a-z0-9.]/g, "")}`;
}

export function createStorageObjectKey(folder: string, fileName: string, now: () => string = () => String(Date.now())) {
  const safeFolder = folder
    .trim()
    .toLowerCase()
    .replace(/\\/g, "/")
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/^\/+|\/+$/g, "");
  const safeName = sanitizeFileName(fileName);
  return [safeFolder, `${now()}-${safeName}`].filter(Boolean).join("/");
}

export async function saveUploadedFile(file: File, options: SaveUploadOptions): Promise<StoredUpload> {
  if (file.size > options.maxBytes) throw new Error(`文件超过 ${Math.floor(options.maxBytes / 1024 / 1024)}MB，请压缩后重新上传。`);
  if (options.accept && !options.accept(file)) throw new Error(options.invalidTypeMessage ?? "文件格式不支持。");

  const objectKey = createStorageObjectKey(options.folder, file.name);
  const mimeType = file.type || "application/octet-stream";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isCosStorageConfigured()) {
    return saveToCos(file, buffer, objectKey, mimeType);
  }

  const publicUrl = buildPublicUploadUrl(objectKey);
  const uploadDir = process.env.UPLOAD_DIR ?? join(process.cwd(), "public", "uploads");
  const diskPath = getUploadDiskPath(publicUrl, process.cwd(), process.env.UPLOAD_DIR);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(diskPath, buffer);

  return {
    fileName: file.name,
    filePath: diskPath,
    fileUrl: publicUrl,
    fileSize: file.size,
    mimeType,
    storage: "local",
    objectKey
  };
}

async function saveToCos(file: File, buffer: Buffer, objectKey: string, mimeType: string): Promise<StoredUpload> {
  const secretId = process.env.TENCENT_COS_SECRET_ID;
  const secretKey = process.env.TENCENT_COS_SECRET_KEY;
  const bucket = process.env.TENCENT_COS_BUCKET;
  const region = process.env.TENCENT_COS_REGION;
  if (!secretId || !secretKey || !bucket || !region) throw new Error("腾讯云 COS 配置不完整。");

  const COSModule = await import("cos-nodejs-sdk-v5");
  const COS = COSModule.default ?? COSModule;
  const cos = new COS({
    SecretId: secretId,
    SecretKey: secretKey
  });

  const result = await new Promise<{ Location?: string }>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: bucket,
        Region: region,
        Key: objectKey,
        Body: buffer,
        ContentLength: buffer.length,
        ContentType: mimeType
      },
      (error: unknown, data: { Location?: string }) => {
        if (error) reject(error);
        else resolve(data);
      }
    );
  });

  const location = result.Location ?? `${bucket}.cos.${region}.myqcloud.com/${objectKey}`;
  const fileUrl = location.startsWith("http") ? location : `https://${location}`;

  return {
    fileName: file.name,
    filePath: `cos://${bucket}/${objectKey}`,
    fileUrl,
    fileSize: file.size,
    mimeType,
    storage: "cos",
    objectKey
  };
}
