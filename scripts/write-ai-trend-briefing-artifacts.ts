import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  validateAiTrendBriefingInput,
  type AiTrendBriefingPublishData,
  type AiTrendBriefingPublishInput
} from "@/lib/ai-trends";

export type MaterializedAiTrendBriefingArtifacts = {
  date: string;
  htmlFile: string;
  summaryFile: string;
  summaryWithHtmlFile: string;
};

type MaterializeOptions = {
  outputDir?: string;
  baseName?: string;
};

function stripUtf8Bom(value: string) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

function readArg(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  const value = process.argv[index + 1] ?? null;
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}.`);
  }
  return value;
}

function toSerializableInput(
  data: AiTrendBriefingPublishData,
  includeFullHtml: boolean
): AiTrendBriefingPublishInput {
  return {
    date: data.slug,
    title: data.title,
    summary: data.summary,
    coreConclusion: data.coreConclusion,
    publicHighlights: data.publicHighlights,
    ...(includeFullHtml ? { fullHtml: data.fullHtml } : { fullHtml: "" }),
    sourceSignals: data.sourceSignals,
    demandBreakdowns: data.demandBreakdowns,
    ...(data.videoUrl ? { videoUrl: data.videoUrl } : {}),
    ...(data.videoTitle ? { videoTitle: data.videoTitle } : {}),
    ...(data.videoDescription ? { videoDescription: data.videoDescription } : {}),
    ...(data.videoPosterUrl ? { videoPosterUrl: data.videoPosterUrl } : {}),
    ...(typeof data.videoDurationSeconds === "number"
      ? { videoDurationSeconds: data.videoDurationSeconds }
      : {}),
    status: data.status,
    publishedAt: data.publishedAt ? data.publishedAt.toISOString() : null,
    isIncludedInTopicPage: data.isIncludedInTopicPage
  };
}

function buildSummaryObject(data: AiTrendBriefingPublishData) {
  const { fullHtml: _fullHtml, ...serializable } = toSerializableInput(data, true);
  return serializable;
}

function buildSummaryWithHtmlObject(data: AiTrendBriefingPublishData) {
  return toSerializableInput(data, true);
}

export async function materializeAiTrendBriefingArtifacts(
  input: AiTrendBriefingPublishInput,
  options: MaterializeOptions = {}
): Promise<MaterializedAiTrendBriefingArtifacts> {
  const data = validateAiTrendBriefingInput(input);
  const outputDir = resolve(options.outputDir ?? join(process.cwd(), "output", "ai-trends"));
  const baseName = options.baseName?.trim() || `ai-trend-${data.slug}`;
  const htmlFile = join(outputDir, `${baseName}.html`);
  const summaryFile = join(outputDir, `${baseName}.summary.json`);
  const summaryWithHtmlFile = join(outputDir, `${baseName}.summary-with-html.json`);

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(htmlFile, data.fullHtml, "utf8"),
    writeFile(summaryFile, `${JSON.stringify(buildSummaryObject(data), null, 2)}\n`, "utf8"),
    writeFile(
      summaryWithHtmlFile,
      `${JSON.stringify(buildSummaryWithHtmlObject(data), null, 2)}\n`,
      "utf8"
    )
  ]);

  return {
    date: data.slug,
    htmlFile,
    summaryFile,
    summaryWithHtmlFile
  };
}

async function main() {
  const inputFile = readArg("--input-file");
  if (!inputFile) {
    throw new Error("Missing --input-file.");
  }

  const outputDir = readArg("--output-dir") ?? undefined;
  const baseName = readArg("--base-name") ?? undefined;
  const inputText = stripUtf8Bom(await readFile(resolve(inputFile), "utf8"));
  const input = JSON.parse(inputText) as AiTrendBriefingPublishInput;
  const result = await materializeAiTrendBriefingArtifacts(input, { outputDir, baseName });

  await mkdir(dirname(result.summaryWithHtmlFile), { recursive: true });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && /write-ai-trend-briefing-artifacts\.ts$/i.test(process.argv[1])) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
