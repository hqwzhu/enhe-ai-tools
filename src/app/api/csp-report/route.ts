import {
  CspReportBodyTooLargeError,
  parseCspReportPayload,
  readCspReportBody,
} from "@/lib/csp-report";
import {
  createCspViolationEvents,
  writeCspViolationEvents,
} from "@/lib/csp-report-log";

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
    await writeCspViolationEvents(createCspViolationEvents(reports));

    return noStoreResponse(204);
  } catch (error) {
    if (error instanceof CspReportBodyTooLargeError) {
      return noStoreResponse(413, "CSP report body is too large");
    }
    if (error instanceof SyntaxError) {
      return noStoreResponse(400, "Invalid CSP report payload");
    }
    if (error instanceof Error && error.message === "Invalid CSP report payload") {
      return noStoreResponse(400, "Invalid CSP report payload");
    }
    console.error(
      JSON.stringify({
        event: "csp_report_persistence_error",
        collectedAt: new Date().toISOString(),
      }),
    );
    return noStoreResponse(503, "CSP report storage is unavailable");
  }
}
