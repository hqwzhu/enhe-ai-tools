# 客服悬浮窗口实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在中英文公开页面加入右下角客服气泡、固定 FAQ 和邮件留言接口，不增加数据库、登录要求或实时聊天。

**Architecture:** 由现有 `PublicSiteChrome` 挂载一个客户端客服组件。组件只负责 UI 状态和提交；`POST /api/support` 在服务端完成校验、同源检查、内存限流和 SMTP 邮件发送。FAQ、校验、邮件构造和限流分别放在小型纯模块中，便于单元测试。

**Tech Stack:** Next.js App Router、React 19、TypeScript、Zod、Nodemailer、Vitest、Playwright、现有 Tailwind/CSS 体系。

---

## 文件地图

- Create: `src/lib/customer-support.ts`，FAQ、请求类型、Zod schema、输入规范化和安全文本辅助函数。
- Test: `src/lib/customer-support.test.ts`，FAQ 双语内容和请求校验测试。
- Create: `src/lib/customer-support-rate-limit.ts`，单进程 IP 限流器。
- Test: `src/lib/customer-support-rate-limit.test.ts`，窗口、上限和过期记录测试。
- Modify: `src/lib/admin-email-notifications.ts`，复用现有 SMTP 配置和 transporter，增加客服邮件构造/发送入口。
- Test: `src/lib/admin-email-notifications.test.ts`，增加客服主题、Reply-To、HTML 转义和 UTF-8 邮件断言。
- Create: `src/app/api/support/route.ts`，客服留言 POST 接口。
- Test: `src/app/api/support/route.test.ts`，HTTP 状态、同源校验、限流、SMTP 和敏感信息测试。
- Create: `src/components/customer-support-widget.tsx`，右下角客服气泡、FAQ、留言表单和状态提示。
- Modify: `src/components/public-site-chrome.tsx`，向公开页面挂载客服组件并传递 `forceLocale`。
- Create: `tests/e2e/customer-support.spec.ts`，公开页/英文页/移动端窗口交互验证；接口提交使用 Playwright 路由拦截，不发送真实邮件。

不会修改 `prisma/schema.prisma`，不会创建 migration，不会修改 `src/app/api/douyin/` 或 `prisma/seed-ai-news-topics-data.cjs`。

## Task 1: 固定 FAQ 与请求校验

**Files:**
- Create: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\lib\customer-support.ts`
- Test: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\lib\customer-support.test.ts`

- [ ] **Step 1: 写失败测试，锁定双语 FAQ 和请求规则**

在测试中覆盖这些行为：

```ts
import { describe, expect, it } from "vitest";
import {
  getCustomerSupportFaqs,
  supportMessageSchema,
  normalizeSupportMessageInput
} from "@/lib/customer-support";

describe("customer support content", () => {
  it("returns seven Chinese FAQs and seven English FAQs", () => {
    expect(getCustomerSupportFaqs("zh")).toHaveLength(7);
    expect(getCustomerSupportFaqs("en")).toHaveLength(7);
    expect(getCustomerSupportFaqs("zh")[0]).toMatchObject({
      id: "about-enhe",
      question: "ENHE AI 是什么？"
    });
    expect(getCustomerSupportFaqs("en")[0]).toMatchObject({
      id: "about-enhe",
      question: "What is ENHE AI?"
    });
  });

  it("requires a message and allows an empty optional email", () => {
    expect(supportMessageSchema.safeParse({ message: "  请问如何购买？  ", email: "", locale: "zh" }).success).toBe(true);
    expect(supportMessageSchema.safeParse({ message: "", email: "", locale: "zh" }).success).toBe(false);
    expect(supportMessageSchema.safeParse({ message: "问题", email: "bad-email", locale: "zh" }).success).toBe(false);
  });

  it("normalizes whitespace and defaults the page path", () => {
    expect(normalizeSupportMessageInput({ message: "  问题  ", email: "", locale: "zh" })).toEqual({
      message: "问题",
      email: undefined,
      locale: "zh",
      pagePath: "/",
      website: ""
    });
  });
});
```

- [ ] **Step 2: 运行测试确认当前失败**

运行：`npm test -- src/lib/customer-support.test.ts`

预期：失败，提示 `@/lib/customer-support` 尚不存在。

- [ ] **Step 3: 实现最小 FAQ 和 schema 模块**

导出以下稳定接口：

```ts
export type CustomerSupportLocale = "zh" | "en";

export type CustomerSupportFaq = {
  id: string;
  question: string;
  answer: string;
  links?: Array<{ label: string; href: string }>;
};

export const supportMessageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  email: z.string().trim().max(254).email().optional().or(z.literal("")),
  locale: z.enum(["zh", "en"]),
  pagePath: z.string().trim().max(300).optional(),
  website: z.string().max(100).optional()
});

export function normalizeSupportMessageInput(input: unknown) {
  const parsed = supportMessageSchema.parse(input);
  return {
    message: parsed.message,
    email: parsed.email || undefined,
    locale: parsed.locale,
    pagePath: normalizeSupportPagePath(parsed.pagePath),
    website: parsed.website ?? ""
  };
}
```

FAQ 必须包含 `about-enhe`、`choose-product`、`pricing-purchase`、`free-vs-paid`、`tutorial-access`、`account-service`、`leave-message` 七个稳定 id，并为 `zh`/`en` 提供各自问题、答案和站内链接。`normalizeSupportPagePath` 只允许以 `/` 开头的相对路径，其他值归一化为 `/`。

- [ ] **Step 4: 运行测试确认通过**

运行：`npm test -- src/lib/customer-support.test.ts`

预期：该文件全部通过。

## Task 2: 单进程 IP 限流

**Files:**
- Create: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\lib\customer-support-rate-limit.ts`
- Test: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\lib\customer-support-rate-limit.test.ts`

- [ ] **Step 1: 写失败测试，锁定每小时 3 次规则**

测试调用一个可注入当前时间的纯函数，避免依赖真实时钟：

```ts
import { afterEach, describe, expect, it } from "vitest";
import { clearCustomerSupportRateLimit, consumeCustomerSupportRateLimit } from "@/lib/customer-support-rate-limit";

afterEach(() => clearCustomerSupportRateLimit());

describe("customer support rate limit", () => {
  it("allows three submissions and rejects the fourth within one hour", () => {
    expect(consumeCustomerSupportRateLimit("ip-1", 1_000)).toBe(true);
    expect(consumeCustomerSupportRateLimit("ip-1", 2_000)).toBe(true);
    expect(consumeCustomerSupportRateLimit("ip-1", 3_000)).toBe(true);
    expect(consumeCustomerSupportRateLimit("ip-1", 4_000)).toBe(false);
  });

  it("allows a submission after the oldest attempt leaves the one-hour window", () => {
    consumeCustomerSupportRateLimit("ip-1", 1_000);
    consumeCustomerSupportRateLimit("ip-1", 2_000);
    consumeCustomerSupportRateLimit("ip-1", 3_000);
    expect(consumeCustomerSupportRateLimit("ip-1", 3_600_001)).toBe(true);
  });

  it("tracks different keys separately", () => {
    consumeCustomerSupportRateLimit("ip-1", 1_000);
    consumeCustomerSupportRateLimit("ip-1", 2_000);
    consumeCustomerSupportRateLimit("ip-1", 3_000);
    expect(consumeCustomerSupportRateLimit("ip-2", 4_000)).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试确认当前失败**

运行：`npm test -- src/lib/customer-support-rate-limit.test.ts`

预期：失败，提示限流模块和导出函数不存在。

- [ ] **Step 3: 实现内存限流器**

使用 `Map<string, number[]>` 保存每个 key 最近一小时的时间戳。每次调用先过滤 `now - 3_600_000` 之前的时间戳；少于 3 次则追加当前时间并返回 `true`，否则返回 `false`。导出 `clearCustomerSupportRateLimit()` 供测试清理。不要引入数据库、Redis 或新的环境变量。

- [ ] **Step 4: 运行测试确认通过**

运行：`npm test -- src/lib/customer-support-rate-limit.test.ts`

预期：该文件全部通过。

## Task 3: 客服邮件构造与发送

**Files:**
- Modify: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\lib\admin-email-notifications.ts`
- Test: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\lib\admin-email-notifications.test.ts`

- [ ] **Step 1: 写失败测试，锁定主题、Reply-To 和转义**

增加测试：

```ts
it("builds a support email with Reply-To and escaped visitor content", () => {
  const email = buildCustomerSupportEmail({
    message: "<script>alert(1)</script>",
    email: "visitor@example.com",
    locale: "zh",
    pagePath: "/software/demo"
  });

  expect(email.subject).toBe("[ENHE AI] 新客服留言 - /software/demo");
  expect(email.text).toContain("<script>alert(1)</script>");
  expect(email.html).not.toContain("<script>alert(1)</script>");
  expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(email.replyTo).toBe("visitor@example.com");
});

it("omits Reply-To when no visitor email is provided", () => {
  expect(buildCustomerSupportEmail({
    message: "没有邮箱",
    locale: "zh",
    pagePath: "/"
  }).replyTo).toBeUndefined();
});
```

- [ ] **Step 2: 运行现有邮件测试确认新增断言失败**

运行：`npm test -- src/lib/admin-email-notifications.test.ts`

预期：新增导出不存在，现有邮件测试仍保持通过。

- [ ] **Step 3: 增加客服邮件类型和构造函数**

在现有邮件模块中导出：

```ts
export type CustomerSupportEmailInput = {
  message: string;
  email?: string;
  locale: "zh" | "en";
  pagePath: string;
};

export function buildCustomerSupportEmail(input: CustomerSupportEmailInput): {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export async function sendCustomerSupportAdminEmail(input: CustomerSupportEmailInput): Promise<void>;
```

邮件使用现有 `getAdminAlertEmailConfig` 和 transporter，不重复创建 SMTP 配置。将内部邮件类型扩展为支持可选 `replyTo`，并让 `buildAdminMailOptions` 在有值时写入 Nodemailer 的 `replyTo` 字段。HTML 使用现有转义函数；纯文本保留原始留言但不加入额外 HTML。邮件正文包含留言、可选邮箱、页面路径、语言和提交时间。`sendCustomerSupportAdminEmail` 直接抛出发送异常，让 API 能返回失败，而不是使用现有运营通知的静默 `safeSend` 包装。

- [ ] **Step 4: 运行邮件测试确认通过**

运行：`npm test -- src/lib/admin-email-notifications.test.ts`

预期：现有管理员邮件测试和客服邮件测试全部通过，且不进行真实 SMTP 连接。

## Task 4: 客服留言 API

**Files:**
- Create: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\app\api\support\route.ts`
- Test: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\app\api\support\route.test.ts`

- [ ] **Step 1: 写失败测试，覆盖 HTTP 契约**

测试必须覆盖这些完整场景。测试文件顶部统一 mock 邮件模块和限流模块，并用下面的 helper 构造 JSON 请求：

```ts
import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { getAdminAlertEmailConfig } from "@/lib/admin-email-notifications";
import { POST } from "./route";

const { sendMailMock, consumeRateLimitMock } = vi.hoisted(() => ({
  sendMailMock: vi.fn(),
  consumeRateLimitMock: vi.fn(() => true)
}));

vi.mock("@/lib/admin-email-notifications", () => ({
  getAdminAlertEmailConfig: vi.fn(() => ({ enabled: true, recipients: ["admin@example.com"] })),
  sendCustomerSupportAdminEmail: (...args: unknown[]) => sendMailMock(...args)
}));

vi.mock("@/lib/customer-support-rate-limit", () => ({
  consumeCustomerSupportRateLimit: (...args: unknown[]) => consumeRateLimitMock(...args)
}));

beforeEach(() => {
  vi.clearAllMocks();
  consumeRateLimitMock.mockReturnValue(true);
  sendMailMock.mockResolvedValue(undefined);
});

function createSupportRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("https://www.enhe-tech.com.cn/api/support", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
}

it("returns 400 for an empty message and does not send mail", async () => {
  const response = await POST(createSupportRequest({ message: "", locale: "zh" }));
  expect(response.status).toBe(400);
  expect(sendMailMock).not.toHaveBeenCalled();
});

it("returns 400 for a non-empty honeypot field", async () => {
  const response = await POST(createSupportRequest({ message: "问题", locale: "zh", website: "bot" }));
  expect(response.status).toBe(400);
});

it("returns 400 for an invalid email", async () => {
  const response = await POST(createSupportRequest({ message: "问题", email: "bad", locale: "zh" }));
  expect(response.status).toBe(400);
});

it("rejects an explicit foreign Origin", async () => {
  const response = await POST(
    createSupportRequest({ message: "问题", locale: "zh" }, { Origin: "https://attacker.example" })
  );
  expect(response.status).toBe(403);
  expect(sendMailMock).not.toHaveBeenCalled();
});

it("returns 429 after the rate limiter rejects the visitor", async () => {
  consumeRateLimitMock.mockReturnValueOnce(false);
  const response = await POST(createSupportRequest({ message: "问题", locale: "zh" }));
  expect(response.status).toBe(429);
});

it("returns 503 when SMTP configuration is disabled", async () => {
  vi.mocked(getAdminAlertEmailConfig).mockReturnValueOnce({
    enabled: false,
    recipients: [],
    host: "smtp.example.com",
    port: 587,
    secure: false,
    from: "admin@example.com",
    skipReason: "missing SMTP config"
  });
  const response = await POST(createSupportRequest({ message: "问题", locale: "zh" }));
  expect(response.status).toBe(503);
});

it("sends a valid message and never exposes admin recipients", async () => {
  const response = await POST(createSupportRequest({
    message: "请问如何购买？",
    email: "visitor@example.com",
    locale: "zh",
    pagePath: "/pricing"
  }));
  expect(response.status).toBe(200);
  const payload = await response.json();
  expect(payload).toEqual({ ok: true });
  expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ email: "visitor@example.com" }));
  expect(JSON.stringify(payload)).not.toContain("admin@example.com");
});

it("returns 503 when the mail transporter throws", async () => {
  sendMailMock.mockRejectedValueOnce(new Error("SMTP unavailable"));
  const response = await POST(createSupportRequest({ message: "问题", locale: "zh" }));
  expect(response.status).toBe(503);
});
```

测试使用 `NextRequest`、`vi.mock("@/lib/admin-email-notifications")` 和 `vi.mock("@/lib/customer-support-rate-limit")`，不读取真实数据库或 SMTP。有效请求必须设置 `Content-Type: application/json`；外部 Origin 使用 `https://attacker.example`，同源 Origin 使用 `https://www.enhe-tech.com.cn`。

- [ ] **Step 2: 运行测试确认当前失败**

运行：`npm test -- src/app/api/support/route.test.ts`

预期：失败，提示 route 文件不存在。

- [ ] **Step 3: 实现 route handler**

实现 `export const dynamic = "force-dynamic"` 和 `POST(request: Request)`：

1. 检查 `content-type` 是否以 `application/json` 开头，不符合则返回 415。
2. 检查 `Origin`；若没有则检查 `Referer`，明确来自其他 origin 时返回 403；两者都缺失时允许非浏览器测试/隐私场景继续走字段校验。
3. 安全解析 JSON，调用 `normalizeSupportMessageInput`；失败返回 400。
4. `website` 非空返回 400。
5. 取 `x-forwarded-for` 第一个地址，回退到 `x-real-ip`，再回退到 `anonymous`，调用限流器；被拒绝返回 429。
6. 调用 `getAdminAlertEmailConfig()`，未启用或缺少 SMTP 配置返回 503。
7. 调用 `sendCustomerSupportAdminEmail()`；异常只记录 `[support-email] failed` 和错误摘要，返回 503。
8. 成功返回 `{ ok: true }`，所有响应带 `Cache-Control: no-store`。

响应只能包含 `ok`、`message` 和必要的错误 code，不返回管理员收件人、SMTP 配置、完整异常或内部堆栈。

- [ ] **Step 4: 运行 API 测试确认通过**

运行：`npm test -- src/app/api/support/route.test.ts`

预期：所有 API 场景通过，真实 SMTP 未被调用。

## Task 5: 客服客户端组件

**Files:**
- Create: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\components\customer-support-widget.tsx`
- Modify: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\src\components\public-site-chrome.tsx`

- [ ] **Step 1: 实现组件状态和可访问结构**

组件声明为客户端组件，props 为 `{ locale: "zh" | "en" }`，初始 `isOpen` 为 `false`。使用 `MessageCircle`、`X`、`Send`、`ChevronRight` 和 `LoaderCircle` 等现有 `lucide-react` 图标。

状态只包含：`isOpen`、`selectedFaqId`、`showMessageForm`、`message`、`email`、`status`。状态值为 `idle`、`submitting`、`success`、`error`、`rate_limited`。

入口要求：

```tsx
<button type="button" aria-expanded={isOpen} aria-controls="customer-support-panel">
  <MessageCircle aria-hidden="true" />
  <span>{copy.launcherLabel}</span>
</button>
```

面板使用 `role="dialog"`、`aria-labelledby`、`id="customer-support-panel"`，关闭按钮带 `aria-label`。FAQ 使用 `type="button"`，表单提交按钮在 `submitting` 时禁用并显示加载状态。成功和错误提示使用 `role="status"` 与 `aria-live="polite"`。

- [ ] **Step 2: 实现固定 FAQ 交互**

首次打开只显示欢迎语和 FAQ 按钮。点击 FAQ 后显示对应答案和链接，并保留“继续查看常见问题”“提交其他问题”操作。点击“提交留言”才显示输入框，不自动弹出。

- [ ] **Step 3: 实现留言提交**

提交时发送：

```ts
await fetch("/api/support", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: message.trim(),
    email: email.trim(),
    locale,
    pagePath: window.location.pathname,
    website: ""
  })
});
```

根据状态码显示中文/英文对应提示。成功后清空留言和邮箱，保留客服窗口打开；失败时保留输入内容，允许重试。不要在客户端显示管理员邮箱或服务端错误详情。

- [ ] **Step 4: 完成响应式样式**

桌面端使用 `fixed bottom-4 right-4`，面板宽度不超过 360px；移动端使用 `w-[calc(100vw-2rem)]`、`max-h-[calc(100dvh-2rem)]` 和内部滚动，确保输入框获得焦点时不被键盘遮挡。组件 z-index 必须高于普通内容但低于已有全局异常提示层。

- [ ] **Step 5: 在公开外壳挂载组件**

在 `PublicSiteChrome` 中导入并渲染：

```tsx
<SiteHeader forceLocale={forceLocale} />
<div className="fade-in">{children}</div>
<CustomerSupportWidget locale={forceLocale} />
<SiteFooter forceLocale={forceLocale} />
```

不要把组件挂到 `RootDocument`，这样可保持认证、支付和后台布局不显示客服。

## Task 6: 单元与端到端验证

**Files:**
- Create: `C:\Users\HU\Documents\enhe-ai-tools-content-deploy\tests\e2e\customer-support.spec.ts`

- [ ] **Step 1: 添加公开页面交互测试**

使用现有 Playwright 配置，覆盖：

```ts
test("opens, answers FAQ, and closes the Chinese support widget", async ({ page }) => {
  await page.goto("/");
  const launcher = page.getByRole("button", { name: /客服/ });
  await expect(launcher).toBeVisible();
  await launcher.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "如何找到适合我的产品？" }).click();
  await expect(page.getByRole("dialog")).toContainText("工作效率");
  await page.getByRole("button", { name: /关闭客服/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(launcher).toBeVisible();
});

test("renders English FAQ copy", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: /Customer support/ }).click();
  await expect(page.getByRole("dialog")).toContainText("What is ENHE AI?");
});
```

用 `page.route("**/api/support", ...)` 模拟成功、400、429 响应，验证留言表单提交后的成功和错误状态，不发送真实邮件。

- [ ] **Step 2: 验证认证/后台页面不显示组件**

访问 `/login` 和 `/admin`；断言不存在客服 launcher。后台页面如果重定向到登录，仍断言最终页面没有客服 launcher。

- [ ] **Step 3: 验证移动端布局**

使用 `page.setViewportSize({ width: 390, height: 844 })`，打开客服窗口，断言窗口可见、宽度不超过视口、留言按钮可点击，页面无水平滚动条。

- [ ] **Step 4: 运行完整验证命令**

依次运行：

```text
npm test
npm run lint
npm run typecheck
npm run test:e2e -- tests/e2e/customer-support.spec.ts
```

预期：所有单元测试、Lint、TypeScript 检查和客服端到端测试通过。真实 SMTP 测试只在明确配置测试邮箱后进行，不在自动化测试中发送生产邮件。

## Task 7: 发布前检查与提交

- [ ] **Step 1: 检查变更范围**

运行 `git status --short` 和 `git diff --stat`，确认只包含客服组件、API、邮件/纯逻辑模块、测试、`.env.example`（如确有必要）和本实施计划；保留用户已有的 `prisma/seed-ai-news-topics-data.cjs` 与抖音回调未提交改动，不重置、不混入提交。

- [ ] **Step 2: 手工验证 SMTP 配置**

在本地使用测试 SMTP 或现有环境变量完成一次真实留言，确认管理员收件人收到邮件、中文正文正常显示、`Reply-To` 指向访客邮箱；测试完成后不把凭证写入仓库。

- [ ] **Step 3: 提交客服实现**

提交前再次运行 `git diff --check`，然后只暂存客服相关文件，使用提交信息：

```text
feat: add public customer support widget
```

不执行 push 或生产部署，除非用户另行要求。

## 计划自检

- 规格覆盖：公开页范围、右下角入口、关闭后保留图标、双语 FAQ、可选邮箱、管理员邮件、Reply-To、HTML 转义、同源检查、隐藏字段、限流、SMTP 错误和验收命令均有对应任务。
- 占位检查：本文没有 `TODO`、`TBD`、未定义任务或依赖人工补全的步骤。
- 类型一致性：API 使用 `normalizeSupportMessageInput` 的 `{ message, email, locale, pagePath, website }`；邮件使用同名 `CustomerSupportEmailInput`；组件向 API 发送相同字段。
- 范围检查：无 Prisma migration、无第三方客服、无实时聊天、无 AI 自由回答，符合已确认的方案 A。
