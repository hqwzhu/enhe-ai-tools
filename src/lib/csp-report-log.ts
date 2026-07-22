import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { SanitizedCspReport } from "@/lib/csp-report";

export type CspViolationEvent = SanitizedCspReport & {
  event: "csp_violation";
  collectedAt: string;
};

export function createCspViolationEvents(
  reports: SanitizedCspReport[],
  collectedAt = new Date().toISOString(),
): CspViolationEvent[] {
  return reports.map((report) => ({
    event: "csp_violation",
    collectedAt,
    ...report,
  }));
}

export async function writeCspViolationEvents(
  events: CspViolationEvent[],
  logPath = process.env.CSP_REPORT_LOG_PATH,
) {
  const lines = events.map((event) => JSON.stringify(event));
  for (const line of lines) {
    console.warn(line);
  }

  const configuredPath = logPath?.trim();
  if (!configuredPath || lines.length === 0) {
    return { persisted: false, eventCount: lines.length };
  }

  const absolutePath = resolve(configuredPath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await appendFile(absolutePath, `${lines.join("\n")}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  return { persisted: true, eventCount: lines.length };
}
