import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { summarizeCspReportLines } from "../src/lib/csp-report-summary";

function getArgument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const file = getArgument("--file") ?? process.env.CSP_REPORT_LOG_PATH;
  if (!file) {
    throw new Error("Provide --file or CSP_REPORT_LOG_PATH");
  }

  const sinceValue = getArgument("--since");
  const since = sinceValue ? new Date(sinceValue) : undefined;
  if (since && Number.isNaN(since.getTime())) {
    throw new Error("--since must be an ISO 8601 timestamp");
  }

  const logPath = resolve(file);
  const content = await readFile(logPath, "utf8").catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return "";
      throw error;
    },
  );
  const output = {
    reportType: "csp_report_observation_summary",
    generatedAt: new Date().toISOString(),
    since: since?.toISOString() ?? null,
    logPath,
    ...summarizeCspReportLines(content.split(/\r?\n/), since),
  };
  const serialized = `${JSON.stringify(output, null, 2)}\n`;
  const outputPath = getArgument("--output");
  if (outputPath) {
    await writeFile(resolve(outputPath), serialized, "utf8");
  }
  process.stdout.write(serialized);
}

void main();
