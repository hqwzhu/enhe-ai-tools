import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

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

async function main() {
  const date = readArg("--date");
  const summaryFile = readArg("--summary-file");
  const htmlFile = readArg("--file");
  const mode = readArg("--mode") ?? "published";

  if (!date) throw new Error("Missing --date.");
  if (!summaryFile) throw new Error("Missing --summary-file.");
  if (!htmlFile) throw new Error("Missing --file.");

  const node = process.execPath;
  const root = process.cwd();
  const videoResultFile = resolve(root, "logs", `${date}.video.result.json`);

  const renderArgs = [
    "--import",
    "tsx",
    resolve(root, "scripts", "generate-ai-trend-briefing-video.ts"),
    "--date",
    date,
    "--summary-file",
    resolve(root, summaryFile),
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
    resolve(root, htmlFile),
    "--summary-file",
    resolve(root, summaryFile),
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
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
