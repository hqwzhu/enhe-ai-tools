import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { materializeAiTrendBriefingArtifacts } from "./write-ai-trend-briefing-artifacts";
import type { AiTrendBriefingPublishInput } from "@/lib/ai-trends";
import { readFile } from "node:fs/promises";

const execFileAsync = promisify(execFile);

function readArg(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  const value = process.argv[index + 1] ?? null;
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}.`);
  }
  return value;
}

function readBooleanArg(name: string) {
  const value = readArg(name);
  if (value === null) return false;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Invalid ${name} ${value}. Expected true or false.`);
}

async function main() {
  const inputFile = readArg("--input-file");
  const date = readArg("--date");
  const summaryFileArg = readArg("--summary-file");
  const htmlFileArg = readArg("--file");
  const mode = readArg("--mode") ?? "published";
  const outputDir = readArg("--output-dir");
  const baseName = readArg("--base-name");
  const sendEmail = readBooleanArg("--send-email");

  const node = process.execPath;
  const root = process.cwd();
  let resolvedDate = date;
  let summaryFile = summaryFileArg ? resolve(root, summaryFileArg) : null;
  let htmlFile = htmlFileArg ? resolve(root, htmlFileArg) : null;

  if (inputFile) {
    const inputText = await readFile(resolve(root, inputFile), "utf8");
    const input = JSON.parse(inputText) as AiTrendBriefingPublishInput;
    const artifacts = await materializeAiTrendBriefingArtifacts(input, {
      outputDir: outputDir ? resolve(root, outputDir) : undefined,
      baseName: baseName ?? undefined
    });
    resolvedDate = artifacts.date;
    summaryFile = artifacts.summaryFile;
    htmlFile = artifacts.htmlFile;
  }

  if (!resolvedDate) throw new Error("Missing --date.");
  if (!summaryFile) throw new Error("Missing --summary-file.");
  if (!htmlFile) throw new Error("Missing --file.");

  const videoResultFile = resolve(root, "logs", `${resolvedDate}.video.result.json`);

  const renderArgs = [
    "--import",
    "tsx",
    resolve(root, "scripts", "generate-ai-trend-briefing-video.ts"),
    "--date",
    resolvedDate,
    "--summary-file",
    summaryFile,
    "--output-file",
    videoResultFile
  ];

  const renderResult = await execFileAsync(node, renderArgs, {
    cwd: root,
    maxBuffer: 10 * 1024 * 1024
  });

  const parsed = JSON.parse(renderResult.stdout.trim()) as {
    success: boolean;
    video: {
      videoUrl: string;
      videoTitle: string;
      videoDescription: string;
      videoPosterUrl: string | null;
      videoDurationSeconds: number | null;
    } | null;
  };

  const publishArgs = [
    "--import",
    "tsx",
    resolve(root, "scripts", "publish-ai-trend-briefing-html.ts"),
    "--file",
    htmlFile,
    "--summary-file",
    summaryFile,
    "--mode",
    mode,
    "--include-in-topic-page",
    "true"
  ];

  if (parsed.video?.videoUrl) {
    publishArgs.push("--video-url", parsed.video.videoUrl);
  }
  if (parsed.video?.videoPosterUrl) {
    publishArgs.push("--video-poster-url", parsed.video.videoPosterUrl);
  }
  if (parsed.video?.videoTitle) {
    publishArgs.push("--video-title", parsed.video.videoTitle);
  }
  if (parsed.video?.videoDescription) {
    publishArgs.push("--video-description", parsed.video.videoDescription);
  }
  if (typeof parsed.video?.videoDurationSeconds === "number") {
    publishArgs.push("--video-duration-seconds", String(parsed.video.videoDurationSeconds));
  }

  const publishResult = await execFileAsync(node, publishArgs, {
    cwd: root,
    maxBuffer: 10 * 1024 * 1024
  });

  process.stdout.write(renderResult.stdout);
  process.stdout.write(publishResult.stdout);

  if (sendEmail) {
    const emailArgs = [
      "--import",
      "tsx",
      resolve(root, "scripts", "send-ai-trend-briefing-email.ts"),
      "--file",
      htmlFile,
      "--summary-file",
      summaryFile
    ];
    const emailResult = await execFileAsync(node, emailArgs, {
      cwd: root,
      maxBuffer: 10 * 1024 * 1024
    });
    process.stdout.write(emailResult.stdout);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
