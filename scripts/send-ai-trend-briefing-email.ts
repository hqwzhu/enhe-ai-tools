import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import nodemailer from "nodemailer";
import type { SendMailOptions, Transporter } from "nodemailer";
import "dotenv/config";
import {
  validateAiTrendBriefingInput,
  type AiTrendBriefingPublishInput
} from "@/lib/ai-trends";

const defaultRecipients = ["huqingwei5942@gmail.com", "ENHEAI.life@protonmail.com"];
const defaultSubject = "AI需求趋势HTML晨报";

type EnvLike = Record<string, string | undefined>;
type Mailer = Pick<Transporter, "sendMail">;

export type AiTrendBriefingEmailConfig = {
  enabled: boolean;
  recipients: string[];
  host?: string;
  port?: number;
  secure: boolean;
  user?: string;
  password?: string;
  from?: string;
  subject: string;
  skipReason?: string;
};

function readArg(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  const value = process.argv[index + 1] ?? null;
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}.`);
  }
  return value;
}

function hasFlag(name: string) {
  return process.argv.includes(name);
}

function stripUtf8Bom(value: string) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

function parseRecipients(value: string | undefined) {
  return String(value ?? "")
    .split(/[;,]/)
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function parsePort(value?: string) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : undefined;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

export function getAiTrendBriefingEmailConfig(env: EnvLike = process.env): AiTrendBriefingEmailConfig {
  const recipients =
    parseRecipients(env.AI_TRENDS_EMAIL_RECIPIENTS ?? env.AI_TREND_EMAIL_RECIPIENTS).length > 0
      ? parseRecipients(env.AI_TRENDS_EMAIL_RECIPIENTS ?? env.AI_TREND_EMAIL_RECIPIENTS)
      : defaultRecipients;
  const host = env.SMTP_HOST?.trim();
  const port = parsePort(env.SMTP_PORT);
  const user = env.SMTP_USER?.trim();
  const password = env.SMTP_PASSWORD;
  const from = env.SMTP_FROM?.trim() || user;
  const secure = parseBoolean(env.SMTP_SECURE, port === 465);
  const subject = env.AI_TRENDS_EMAIL_SUBJECT?.trim() || defaultSubject;

  if (env.AI_TRENDS_EMAIL_ENABLED === "false") {
    return { enabled: false, recipients, secure, subject, skipReason: "disabled by AI_TRENDS_EMAIL_ENABLED=false" };
  }

  if (!recipients.length) {
    return { enabled: false, recipients, secure, subject, skipReason: "missing AI trends email recipients" };
  }

  if (!host || !port || !from) {
    return {
      enabled: false,
      recipients,
      host,
      port,
      secure,
      user,
      password,
      from,
      subject,
      skipReason: "missing SMTP config"
    };
  }

  if (user && !password) {
    return {
      enabled: false,
      recipients,
      host,
      port,
      secure,
      user,
      from,
      subject,
      skipReason: "missing SMTP password"
    };
  }

  if (password && !user) {
    return {
      enabled: false,
      recipients,
      host,
      port,
      secure,
      password,
      from,
      subject,
      skipReason: "missing SMTP user"
    };
  }

  return { enabled: true, recipients, host, port, secure, user, password, from, subject };
}

export function buildAiTrendBriefingMailOptions(
  config: Pick<AiTrendBriefingEmailConfig, "from" | "recipients" | "subject">,
  input: AiTrendBriefingPublishInput
): SendMailOptions {
  const data = validateAiTrendBriefingInput(input);
  const publicUrl = `https://www.enhe-tech.com.cn/ai-trends/daily/${data.slug}`;
  const text = [
    data.title,
    "",
    data.coreConclusion,
    "",
    `查看网页简报：${publicUrl}`,
    data.videoUrl ? `观看视频简报：https://www.enhe-tech.com.cn${data.videoUrl}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return {
    from: config.from,
    to: config.recipients,
    subject: config.subject,
    text,
    html: data.fullHtml,
    encoding: "utf-8",
    textEncoding: "base64",
    headers: {
      "Content-Language": "zh-CN"
    }
  };
}

function createTransporter(config: AiTrendBriefingEmailConfig): Mailer {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
    connectionTimeout: parsePositiveInteger(process.env.SMTP_CONNECTION_TIMEOUT_MS, 8000),
    greetingTimeout: parsePositiveInteger(process.env.SMTP_GREETING_TIMEOUT_MS, 8000),
    socketTimeout: parsePositiveInteger(process.env.SMTP_SOCKET_TIMEOUT_MS, 12000)
  });
}

async function loadBriefingInput(htmlFile: string, summaryFile: string) {
  const [html, summaryText] = await Promise.all([
    readFile(resolve(htmlFile), "utf8"),
    readFile(resolve(summaryFile), "utf8")
  ]);
  const summary = JSON.parse(stripUtf8Bom(summaryText)) as AiTrendBriefingPublishInput;
  return {
    ...summary,
    fullHtml: stripUtf8Bom(html)
  } satisfies AiTrendBriefingPublishInput;
}

export async function sendAiTrendBriefingEmail(
  input: AiTrendBriefingPublishInput,
  options: {
    env?: EnvLike;
    mailer?: Mailer;
    dryRun?: boolean;
  } = {}
) {
  const config = getAiTrendBriefingEmailConfig(options.env);
  if (!config.enabled) {
    throw new Error(`AI trend briefing email is not configured: ${config.skipReason ?? "unknown reason"}.`);
  }

  const mailOptions = buildAiTrendBriefingMailOptions(config, input);
  if (options.dryRun) {
    return {
      sent: false,
      dryRun: true,
      recipients: config.recipients,
      subject: config.subject
    };
  }

  const mailer = options.mailer ?? createTransporter(config);
  const result = await mailer.sendMail(mailOptions);
  return {
    sent: true,
    dryRun: false,
    recipients: config.recipients,
    subject: config.subject,
    messageId: typeof result === "object" && result && "messageId" in result ? String(result.messageId) : null
  };
}

async function main() {
  const htmlFile = readArg("--file");
  const summaryFile = readArg("--summary-file");
  if (!htmlFile) throw new Error("Missing --file path to AI trend briefing HTML file.");
  if (!summaryFile) throw new Error("Missing --summary-file path to AI trend briefing summary JSON file.");

  const input = await loadBriefingInput(htmlFile, summaryFile);
  const result = await sendAiTrendBriefingEmail(input, { dryRun: hasFlag("--dry-run") });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && /send-ai-trend-briefing-email\.ts$/i.test(process.argv[1])) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
