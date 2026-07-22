import {
  CspReportBodyTooLargeError,
  parseCspReportPayload,
  readCspReportBody,
} from "@/lib/csp-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const acceptedContentTypes = [
  "application/csp-report",
  "application/reports+json",
] as const;

type AcceptedContentType = (typeof acceptedContentTypes)[number];

function noStoreResponse(status: number, message?: string) {
  const headers = { "Cache-Control": "no-store" };
  return message
    ? Response.json({ message }, { status, headers })
    : new Response(null, { status, headers });
}

export async function POST(request: Request) {
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();

  if (!acceptedContentTypes.includes(contentType as AcceptedContentType)) {
    return noStoreResponse(415, "Unsupported CSP report content type");
  }

  try {
    const rawBody = await readCspReportBody(request);
    const payload: unknown = JSON.parse(rawBody);
    const reports = parseCspReportPayload(payload, contentType as AcceptedContentType);

    for (const report of reports) {
      console.warn(
        JSON.stringify({
          event: "csp_violation",
          collectedAt: new Date().toISOString(),
          ...report,
        }),
      );
    }

    return noStoreResponse(204);
  } catch (error) {
    if (error instanceof CspReportBodyTooLargeError) {
      return noStoreResponse(413, "CSP report body is too large");
    }
    return noStoreResponse(400, "Invalid CSP report payload");
  }
}
