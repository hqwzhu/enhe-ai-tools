import { NextResponse } from "next/server";
import { assertDownloadAccess } from "@/lib/access";
import { getSecureFileDownloadUrl } from "@/lib/storage";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await assertDownloadAccess(id);
  if (!file) {
    return NextResponse.json({ message: "文件已记录权限，但尚未配置下载地址。" }, { status: 404 });
  }
  try {
    return NextResponse.redirect(await getSecureFileDownloadUrl(file, request.url));
  } catch {
    return NextResponse.json({ message: "文件已记录权限，但尚未配置下载地址。" }, { status: 404 });
  }
}
