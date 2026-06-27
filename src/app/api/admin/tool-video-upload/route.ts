import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isLikelyUploadableVideo } from "@/lib/media";
import { saveUploadedFile } from "@/lib/storage";
import { adminFileUploadMaxBytes } from "@/lib/upload-limits";

function normalizeFolderSlug(value: FormDataEntryValue | null) {
  return String(value ?? "tool")
    .trim()
    .toLowerCase()
    .replace(/\\/g, "/")
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/^\/+|\/+$/g, "")
    .slice(0, 120) || "tool";
}

export async function POST(request: Request) {
  await requireAdmin();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "视频上传请求解析失败，请确认文件未超过 500MB 后重试。" }, { status: 413 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "请选择要上传的视频文件。" }, { status: 400 });
  }

  try {
    const stored = await saveUploadedFile(file, {
      folder: `tool-videos/${normalizeFolderSlug(formData.get("toolSlug"))}`,
      maxBytes: adminFileUploadMaxBytes,
      accept: isLikelyUploadableVideo,
      invalidTypeMessage: "请上传 MP4、WebM 或 MOV 等视频文件。"
    });

    const videoUrl = stored.storage === "cos" ? stored.filePath : stored.fileUrl;
    return NextResponse.json({
      videoUrl,
      fileName: stored.fileName,
      fileSize: String(stored.fileSize),
      mimeType: stored.mimeType,
      storage: stored.storage,
      message: "视频上传成功，请保存产品信息。"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "视频上传失败，请稍后重试。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
