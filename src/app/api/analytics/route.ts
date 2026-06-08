import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { isAnalyticsEventName, toPrismaJson } from "@/lib/analytics";
import { prisma } from "@/lib/db";

const analyticsPayloadSchema = z.object({
  eventName: z.string(),
  path: z.string().max(300).optional().nullable(),
  entityType: z.string().max(80).optional().nullable(),
  entityId: z.string().max(120).optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable()
});

export async function POST(request: Request) {
  const payload = analyticsPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success || !isAnalyticsEventName(payload.data.eventName)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const user = await getCurrentUser();
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await prisma.analyticsEvent.create({
    data: {
      eventName: payload.data.eventName,
      path: payload.data.path,
      entityType: payload.data.entityType,
      entityId: payload.data.entityId,
      userId: user?.id,
      metadata: toPrismaJson(payload.data.metadata),
      ip: forwardedFor,
      userAgent: request.headers.get("user-agent")
    }
  });

  return NextResponse.json({ ok: true });
}
