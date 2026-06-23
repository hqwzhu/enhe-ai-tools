import { readFile, stat } from "node:fs/promises";
import { extname } from "node:path";
import { NextResponse } from "next/server";
import { getUploadDiskPath } from "@/lib/upload-path";

const uploadMimeTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

function getUploadContentType(fileName: string) {
  return uploadMimeTypes[extname(fileName).toLowerCase()] ?? "application/octet-stream";
}

function isSafeUploadPath(parts: string[]) {
  return Boolean(parts.length && parts.every((part) => part && !part.includes("\\") && part !== "." && part !== ".."));
}

export async function GET(_: Request, { params }: { params: Promise<{ fileName: string[] }> }) {
  const { fileName } = await params;
  const decodedParts = fileName.map((part) => decodeURIComponent(part));

  if (!isSafeUploadPath(decodedParts)) {
    return NextResponse.json({ message: "Invalid upload file name." }, { status: 400 });
  }

  const uploadPath = decodedParts.join("/");
  const diskPath = getUploadDiskPath(`/uploads/${uploadPath}`);

  try {
    const fileStat = await stat(diskPath);
    if (!fileStat.isFile()) return NextResponse.json({ message: "Upload file not found." }, { status: 404 });

    const body = await readFile(diskPath);
    return new Response(body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(fileStat.size),
        "Content-Type": getUploadContentType(uploadPath)
      }
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ message: "Upload file not found." }, { status: 404 });
    }
    throw error;
  }
}
