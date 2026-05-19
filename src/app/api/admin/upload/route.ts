import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { buildPublicUploadUrl } from "@/lib/admin-form";
import { requireAdmin } from "@/lib/auth";

const maxUploadBytes = 50 * 1024 * 1024;

export async function POST(request: Request) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "请选择文件" }, { status: 400 });
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json({ message: "文件超过 50MB，本地开发上传被拒绝" }, { status: 413 });
  }

  const publicUrl = buildPublicUploadUrl(file.name);
  const uploadDir = join(process.cwd(), "public", "uploads");
  const diskPath = join(process.cwd(), "public", publicUrl);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({
    fileName: file.name,
    filePath: diskPath,
    fileUrl: publicUrl,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
    storage: "local",
    cosReady: Boolean(process.env.TENCENT_COS_BUCKET && process.env.TENCENT_COS_REGION)
  });
}
