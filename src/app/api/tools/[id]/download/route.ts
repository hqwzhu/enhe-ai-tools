import { NextResponse } from "next/server";
import { assertDownloadAccess } from "@/lib/access";
import { resolveRedirectUrl } from "@/lib/redirect-url";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await assertDownloadAccess(id);
  if (!file?.fileUrl) {
    return NextResponse.json({ message: "文件已记录权限，但尚未配置下载地址。" }, { status: 404 });
  }
  return NextResponse.redirect(resolveRedirectUrl(file.fileUrl, request.url));
}
