import { NextResponse } from "next/server";
import {
  getAdminAlertEmailConfig,
  sendCustomerSupportAdminEmail
} from "@/lib/admin-email-notifications";
import { consumeCustomerSupportRateLimit } from "@/lib/customer-support-rate-limit";
import { normalizeSupportMessageInput } from "@/lib/customer-support";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store"
};

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return jsonError("UNSUPPORTED_MEDIA_TYPE", 415);
  }

  if (!isAllowedRequestOrigin(request)) {
    return jsonError("CROSS_SITE_REQUEST", 403);
  }

  let input: ReturnType<typeof normalizeSupportMessageInput>;
  try {
    input = normalizeSupportMessageInput(await request.json());
  } catch {
    return jsonError("INVALID_REQUEST", 400);
  }

  if (input.website.trim()) {
    return jsonError("INVALID_REQUEST", 400);
  }

  const visitorKey = getVisitorKey(request);
  if (!consumeCustomerSupportRateLimit(visitorKey)) {
    return jsonError("RATE_LIMITED", 429);
  }

  const config = getAdminAlertEmailConfig();
  if (!config.enabled) {
    console.warn(`[support-email] unavailable: ${config.skipReason ?? "missing email configuration"}`);
    return jsonError("EMAIL_UNAVAILABLE", 503);
  }

  try {
    await sendCustomerSupportAdminEmail({
      message: input.message,
      email: input.email,
      locale: input.locale,
      pagePath: input.pagePath
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    console.error(`[support-email] failed: ${reason}`);
    return jsonError("EMAIL_UNAVAILABLE", 503);
  }

  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}

function jsonError(code: string, status: number) {
  return NextResponse.json({ ok: false, code }, { status, headers: noStoreHeaders });
}

function isAllowedRequestOrigin(request: Request) {
  const allowedOrigins = new Set<string>([new URL(request.url).origin]);
  for (const configuredUrl of [process.env.NEXT_PUBLIC_APP_URL, process.env.APP_URL]) {
    const configuredOrigin = readOrigin(configuredUrl);
    if (configuredOrigin) allowedOrigins.add(configuredOrigin);
  }

  const origin = request.headers.get("origin")?.trim();
  if (origin) return allowedOrigins.has(readOrigin(origin) ?? "");

  const referer = request.headers.get("referer")?.trim();
  if (referer) return allowedOrigins.has(readOrigin(referer) ?? "");

  return true;
}

function readOrigin(value: string | undefined) {
  if (!value) return undefined;

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function getVisitorKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "anonymous"
  );
}
