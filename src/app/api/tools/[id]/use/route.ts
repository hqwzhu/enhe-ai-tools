import { NextResponse } from "next/server";
import { assertOnlineToolAccess } from "@/lib/access";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = await assertOnlineToolAccess(id);
  if (!tool.onlineUrl) {
    return NextResponse.json({ message: "工具尚未配置在线地址。" }, { status: 404 });
  }
  return NextResponse.redirect(tool.onlineUrl);
}
