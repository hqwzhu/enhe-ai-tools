import { NextResponse } from "next/server";
import { getSecureCosMediaUrl } from "@/lib/storage";

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get("src")?.trim();
  if (!source) {
    return NextResponse.json({ message: "Missing product video source." }, { status: 400 });
  }

  try {
    const signedUrl = await getSecureCosMediaUrl(source);
    if (!signedUrl) {
      return NextResponse.json({ message: "Product video source is not available." }, { status: 404 });
    }

    const response = NextResponse.redirect(signedUrl);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return NextResponse.json({ message: "Product video source is not available." }, { status: 404 });
  }
}
