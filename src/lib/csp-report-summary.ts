import type { CspViolationEvent } from "@/lib/csp-report-log";

type CspReportWindowSummary = {
  eventCount: number;
  syntheticProbeCount: number;
  organicEventCount: number;
  invalidLineCount: number;
  directives: Record<string, number>;
  blockedOrigins: Record<string, number>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isCspViolationEvent(value: unknown): value is CspViolationEvent {
  return (
    isRecord(value) &&
    value.event === "csp_violation" &&
    typeof value.collectedAt === "string" &&
    typeof value.format === "string"
  );
}

function getUrlOrigin(value: unknown) {
  if (typeof value !== "string") return "unknown";
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : url.protocol;
  } catch {
    return value.slice(0, 120) || "unknown";
  }
}

function isSyntheticProbe(event: CspViolationEvent) {
  for (const value of [event.blockedUrl, event.documentUrl, event.sourceFile]) {
    if (typeof value !== "string") continue;
    try {
      if (new URL(value).hostname === "example.invalid") return true;
    } catch {
      // Relative and directive-only values cannot identify a synthetic host.
    }
  }
  return false;
}

function increment(target: Record<string, number>, key: string) {
  target[key] = (target[key] ?? 0) + 1;
}

export function summarizeCspReportLines(
  lines: string[],
  since?: Date,
): CspReportWindowSummary {
  const summary: CspReportWindowSummary = {
    eventCount: 0,
    syntheticProbeCount: 0,
    organicEventCount: 0,
    invalidLineCount: 0,
    directives: {},
    blockedOrigins: {},
  };

  for (const line of lines) {
    if (!line.trim()) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      summary.invalidLineCount += 1;
      continue;
    }
    if (!isCspViolationEvent(parsed)) {
      summary.invalidLineCount += 1;
      continue;
    }
    const collectedAt = new Date(parsed.collectedAt);
    if (Number.isNaN(collectedAt.getTime())) {
      summary.invalidLineCount += 1;
      continue;
    }
    if (since && collectedAt < since) continue;

    summary.eventCount += 1;
    if (isSyntheticProbe(parsed)) {
      summary.syntheticProbeCount += 1;
    } else {
      summary.organicEventCount += 1;
    }
    increment(
      summary.directives,
      parsed.effectiveDirective ?? parsed.violatedDirective ?? "unknown",
    );
    increment(summary.blockedOrigins, getUrlOrigin(parsed.blockedUrl));
  }

  return summary;
}
