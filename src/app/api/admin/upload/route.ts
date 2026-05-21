import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveUploadedFile } from "@/lib/storage";

const maxUploadBytes = 500 * 1024 * 1024;

export async function POST(request: Request) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "请选择文件" }, { status: 400 });
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json({ message: "文件超过 500MB，请使用 COS 或分片上传方案。" }, { status: 413 });
  }

  const stored = await saveUploadedFile(file, {
    folder: "files",
    maxBytes: maxUploadBytes
  });
  const record = await prisma.file.create({
    data: {
      fileName: stored.fileName,
      filePath: stored.filePath,
      fileUrl: stored.fileUrl,
      fileSize: BigInt(stored.fileSize),
      mimeType: stored.mimeType
    }
  });

  return NextResponse.json({
    id: record.id,
    fileName: record.fileName,
    filePath: record.filePath,
    fileUrl: record.fileUrl,
    fileSize: record.fileSize?.toString(),
    mimeType: record.mimeType,
    storage: stored.storage,
    message: "上传成功，已自动创建文件记录。"
  });
}
