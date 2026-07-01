import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import {
  buildAiTrendBriefingMailOptions,
  getAiTrendBriefingEmailConfig,
  sendAiTrendBriefingEmail
} from "./send-ai-trend-briefing-email";

const execFileAsync = promisify(execFile);
const scriptPath = join(process.cwd(), "scripts", "send-ai-trend-briefing-email.ts");

const validInput = {
  date: "2026-07-01",
  title: "AI趋势分析：人类最渴望用 AI 解决哪些问题",
  summary: "公开摘要",
  coreConclusion: "下一阶段最值得做的 AI 产品，是能直接接管会议、邮件、资料、表格、代码、搜索与内容生产链路的任务闭环助手。",
  publicHighlights: ["工作效率", "视频生成"],
  fullHtml: "<article><h1>AI趋势分析</h1><p>完整 HTML 简报</p></article>",
  sourceSignals: [
    {
      title: "Google Trends",
      url: "https://trends.google.com/trends/",
      sourceType: "search trend",
      observedSignal: "AI demand remains visible."
    }
  ],
  demandBreakdowns: [
    {
      direction: "工作效率",
      heat: 96,
      summary: "高频工作流需求最明确。",
      scenarios: [
        {
          name: "会议纪要",
          heat: 92,
          urgency: "A",
          typicalUsers: ["运营"],
          painPoint: "会后整理耗时。",
          representativeScenarios: ["录音转纪要"],
          aiValue: "自动整理和分发。",
          productOpportunity: "会议助手",
          developmentPriority: "A",
          evidenceSignals: ["search trend"]
        }
      ]
    }
  ],
  videoUrl: "/api/uploads/ai-trends/2026-07-01/briefing.mp4",
  status: "published" as const,
  isIncludedInTopicPage: true
};

async function createFiles() {
  const dir = await mkdtemp(join(tmpdir(), "send-ai-trend-briefing-email-"));
  const htmlFile = join(dir, "briefing.html");
  const summaryFile = join(dir, "briefing.summary.json");
  const { fullHtml: _fullHtml, ...summary } = validInput;
  await writeFile(htmlFile, `\uFEFF${validInput.fullHtml}`, "utf8");
  await writeFile(summaryFile, JSON.stringify(summary), "utf8");
  return { htmlFile, summaryFile };
}

describe("send-ai-trend-briefing-email script helpers", () => {
  it("reports missing SMTP config without silently skipping email", () => {
    const config = getAiTrendBriefingEmailConfig({});

    expect(config.enabled).toBe(false);
    expect(config.skipReason).toBe("missing SMTP config");
    expect(config.recipients).toEqual(["huqingwei5942@gmail.com", "ENHEAI.life@protonmail.com"]);
  });

  it("accepts explicit recipients and SMTP config", () => {
    const config = getAiTrendBriefingEmailConfig({
      AI_TRENDS_EMAIL_RECIPIENTS: "a@example.com;b@example.com",
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "465",
      SMTP_SECURE: "true",
      SMTP_USER: "sender@example.com",
      SMTP_PASSWORD: "secret",
      SMTP_FROM: "ENHE AI <sender@example.com>"
    });

    expect(config).toMatchObject({
      enabled: true,
      recipients: ["a@example.com", "b@example.com"],
      host: "smtp.example.com",
      port: 465,
      secure: true,
      from: "ENHE AI <sender@example.com>"
    });
  });

  it("builds HTML email options with UTF-8 headers and fallback text", () => {
    const options = buildAiTrendBriefingMailOptions(
      {
        from: "ENHE AI <sender@example.com>",
        recipients: ["huqingwei5942@gmail.com"],
        subject: "AI需求趋势HTML晨报"
      },
      validInput
    );

    expect(options.html).toBe(validInput.fullHtml);
    expect(options.subject).toBe("AI需求趋势HTML晨报");
    expect(options.text).toContain(validInput.coreConclusion);
    expect(options.headers).toMatchObject({ "Content-Language": "zh-CN" });
  });

  it("dry-runs without calling the mailer", async () => {
    const result = await sendAiTrendBriefingEmail(validInput, {
      dryRun: true,
      env: {
        SMTP_HOST: "smtp.example.com",
        SMTP_PORT: "465",
        SMTP_USER: "sender@example.com",
        SMTP_PASSWORD: "secret",
        SMTP_FROM: "sender@example.com"
      },
      mailer: {
        sendMail: async () => {
          throw new Error("should not send");
        }
      }
    });

    expect(result).toMatchObject({
      sent: false,
      dryRun: true,
      recipients: ["huqingwei5942@gmail.com", "ENHEAI.life@protonmail.com"]
    });
  });

  it("fails clearly from CLI when SMTP is not configured", async () => {
    const { htmlFile, summaryFile } = await createFiles();

    await expect(
      execFileAsync(process.execPath, ["--import", "tsx", scriptPath, "--file", htmlFile, "--summary-file", summaryFile], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          SMTP_HOST: "",
          SMTP_PORT: "",
          SMTP_USER: "",
          SMTP_PASSWORD: "",
          SMTP_FROM: ""
        },
        timeout: 10000
      })
    ).rejects.toMatchObject({
      stderr: expect.stringContaining("AI trend briefing email is not configured: missing SMTP config.")
    });
  });

  it("prints a dry-run result from CLI when SMTP config is present", async () => {
    const { htmlFile, summaryFile } = await createFiles();
    const result = await execFileAsync(
      process.execPath,
      ["--import", "tsx", scriptPath, "--file", htmlFile, "--summary-file", summaryFile, "--dry-run"],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          SMTP_HOST: "smtp.example.com",
          SMTP_PORT: "465",
          SMTP_USER: "sender@example.com",
          SMTP_PASSWORD: "secret",
          SMTP_FROM: "sender@example.com"
        },
        timeout: 10000
      }
    );

    expect(result.stdout).toContain('"dryRun": true');
    expect(result.stdout).toContain("huqingwei5942@gmail.com");
  });
});
