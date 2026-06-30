import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function hasValidToken(request: Request) {
  const expectedToken = process.env.AI_TRENDS_REVALIDATE_TOKEN?.trim();
  if (!expectedToken) {
    return process.env.NODE_ENV !== "production";
  }

  const headerToken = request.headers.get("x-revalidate-token")?.trim();
  return headerToken === expectedToken;
}

export async function POST(request: Request) {
  if (!hasValidToken(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  revalidateTag("public-ai-trends");
  revalidatePath("/ai-trends");
  revalidatePath("/en/ai-trends");
  revalidatePath("/ai-trends/daily");
  revalidatePath("/en/ai-trends/daily");

  return NextResponse.json({ ok: true });
}
