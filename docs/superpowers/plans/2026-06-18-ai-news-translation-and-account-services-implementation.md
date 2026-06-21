# AI News Translation and Account Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-click English generation for AI news articles in the admin editor and migrate public account service URLs from `/online-tools` to `/account-services` with redirects and SEO updates.

**Architecture:** Keep the AI news translation feature as a server-backed editor enhancement that generates structured English draft values without directly saving to Prisma. Keep account service migration limited to the public routing and SEO layer by reusing existing `online` tool data and admin flows while introducing new public route helpers, redirects, and canonical paths.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Prisma, Vitest, Next Metadata API

---

### Task 1: Lock translation behavior with tests

**Files:**
- Create: `C:\Users\HU\Documents\New project 2\src\lib\ai-news-translation.test.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\admin\actions.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\admin\ai-news-editor.tsx`
- Create: `C:\Users\HU\Documents\New project 2\src\lib\ai-news-translation.ts`

- [ ] **Step 1: Write the failing translation service tests**

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("ai news translation service", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL;
  });

  it("rejects translation when API config is missing", async () => {
    const { generateAiNewsEnglishDraft } = await import("@/lib/ai-news-translation");

    await expect(
      generateAiNewsEnglishDraft({
        title: "中文标题",
        summary: "中文摘要",
        content: "## 标题\n\n正文",
        keyTakeaways: ["要点一"],
        seoTitle: "SEO 标题",
        seoDescription: "SEO 描述",
        keywords: "关键词"
      })
    ).rejects.toThrow("OPENAI_API_KEY");
  });

  it("returns structured english fields from a valid model response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_BASE_URL = "https://example.com/v1";
    process.env.OPENAI_MODEL = "gpt-test";

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                englishTitle: "English title",
                englishSubtitle: "English subtitle",
                englishSummary: "English summary",
                englishContent: "## Heading\n\nEnglish body",
                englishKeyTakeaways: ["Takeaway 1"],
                englishImpactNotes: "Impact note",
                englishConclusion: "Conclusion",
                englishSeoTitle: "SEO title",
                englishSeoDescription: "SEO description",
                englishKeywords: "ai tools, account service"
              })
            }
          }
        ]
      })
    });

    const { generateAiNewsEnglishDraft } = await import("@/lib/ai-news-translation");

    await expect(
      generateAiNewsEnglishDraft({
        title: "中文标题",
        subtitle: "中文副标题",
        summary: "中文摘要",
        content: "## 标题\n\n正文",
        keyTakeaways: ["要点一"],
        impactNotes: "影响说明",
        conclusion: "结论",
        seoTitle: "SEO 标题",
        seoDescription: "SEO 描述",
        keywords: "关键词"
      })
    ).resolves.toMatchObject({
      englishTitle: "English title",
      englishSummary: "English summary",
      englishContent: "## Heading\n\nEnglish body",
      englishKeyTakeaways: ["Takeaway 1"]
    });
  });

  it("rejects invalid JSON model responses", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_BASE_URL = "https://example.com/v1";
    process.env.OPENAI_MODEL = "gpt-test";

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "not-json" } }]
      })
    });

    const { generateAiNewsEnglishDraft } = await import("@/lib/ai-news-translation");

    await expect(
      generateAiNewsEnglishDraft({
        title: "中文标题",
        summary: "中文摘要",
        content: "## 标题\n\n正文",
        keyTakeaways: ["要点一"],
        seoTitle: "SEO 标题",
        seoDescription: "SEO 描述",
        keywords: "关键词"
      })
    ).rejects.toThrow("translation response");
  });
});
```

- [ ] **Step 2: Run translation tests to verify they fail**

Run: `npm test -- src/lib/ai-news-translation.test.ts`

Expected: FAIL with module-not-found or missing implementation errors for `@/lib/ai-news-translation`.

- [ ] **Step 3: Write the minimal translation service**

```typescript
import { z } from "zod";

const translationInputSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  summary: z.string().min(1),
  content: z.string().min(1),
  keyTakeaways: z.array(z.string()).default([]),
  impactNotes: z.string().optional(),
  conclusion: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  keywords: z.string().optional()
});

const translationOutputSchema = z.object({
  englishTitle: z.string().min(1),
  englishSubtitle: z.string().optional().default(""),
  englishSummary: z.string().min(1),
  englishContent: z.string().min(1),
  englishKeyTakeaways: z.array(z.string()).default([]),
  englishImpactNotes: z.string().optional().default(""),
  englishConclusion: z.string().optional().default(""),
  englishSeoTitle: z.string().optional().default(""),
  englishSeoDescription: z.string().optional().default(""),
  englishKeywords: z.string().optional().default("")
});

export type AiNewsTranslationInput = z.input<typeof translationInputSchema>;
export type AiNewsTranslationDraft = z.output<typeof translationOutputSchema>;

function getTranslationConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  if (!baseUrl) throw new Error("OPENAI_BASE_URL is not configured");
  if (!model) throw new Error("OPENAI_MODEL is not configured");

  return { apiKey, baseUrl: baseUrl.replace(/\/+$/, ""), model };
}

export async function generateAiNewsEnglishDraft(input: AiNewsTranslationInput): Promise<AiNewsTranslationDraft> {
  const payload = translationInputSchema.parse(input);
  const { apiKey, baseUrl, model } = getTranslationConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Translate Chinese AI news into concise, publication-ready English. Preserve meaning, keep Markdown structure, and return JSON only."
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`translation request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("translation response missing content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("translation response is not valid JSON");
  }

  return translationOutputSchema.parse(parsed);
}
```

- [ ] **Step 4: Run translation tests to verify they pass**

Run: `npm test -- src/lib/ai-news-translation.test.ts`

Expected: PASS with 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai-news-translation.ts src/lib/ai-news-translation.test.ts
git commit -m "feat: add ai news translation service"
```

### Task 2: Add a server action and editor integration for one-click English generation

**Files:**
- Modify: `C:\Users\HU\Documents\New project 2\src\app\admin\actions.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\admin\ai-news-editor.tsx`
- Create: `C:\Users\HU\Documents\New project 2\src\app\admin\ai-news-translation-panel.tsx`
- Test: `C:\Users\HU\Documents\New project 2\src\lib\ai-news-translation-action.test.ts`

- [ ] **Step 1: Write the failing server action test**

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateDraft = vi.fn();
const requireAdmin = vi.fn();

vi.mock("@/lib/ai-news-translation", () => ({
  generateAiNewsEnglishDraft: generateDraft
}));

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    requireAdmin
  };
});

describe("generateAiNewsEnglishDraftAction", () => {
  beforeEach(() => {
    requireAdmin.mockReset();
    generateDraft.mockReset();
    requireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
  });

  it("returns generated english fields without persisting the article", async () => {
    generateDraft.mockResolvedValue({
      englishTitle: "English title",
      englishSubtitle: "",
      englishSummary: "English summary",
      englishContent: "## Heading\n\nBody",
      englishKeyTakeaways: ["Takeaway"],
      englishImpactNotes: "",
      englishConclusion: "",
      englishSeoTitle: "SEO",
      englishSeoDescription: "SEO description",
      englishKeywords: "ai tools"
    });

    const { generateAiNewsEnglishDraftAction } = await import("@/app/admin/actions");
    const formData = new FormData();
    formData.set("title", "中文标题");
    formData.set("summary", "中文摘要");
    formData.set("content", "## 标题\n\n正文");
    formData.set("keyTakeaways", "要点一");
    formData.set("seoTitle", "SEO 标题");
    formData.set("seoDescription", "SEO 描述");
    formData.set("keywords", "关键词");

    await expect(generateAiNewsEnglishDraftAction(null, formData)).resolves.toMatchObject({
      ok: true,
      data: {
        englishTitle: "English title",
        englishSummary: "English summary",
        englishContent: "## Heading\n\nBody",
        englishKeyTakeaways: ["Takeaway"]
      }
    });
  });
});
```

- [ ] **Step 2: Run the action test to verify it fails**

Run: `npm test -- src/lib/ai-news-translation-action.test.ts`

Expected: FAIL because `generateAiNewsEnglishDraftAction` does not exist yet.

- [ ] **Step 3: Add the action state contract and client panel**

```typescript
// src/app/admin/ai-news-translation-panel.tsx
"use client";

import { useActionState, useEffect } from "react";
import { generateAiNewsEnglishDraftAction } from "@/app/admin/actions";

export type AiNewsTranslationActionState = {
  ok: boolean;
  message: string;
  data?: {
    englishTitle: string;
    englishSubtitle: string;
    englishSummary: string;
    englishContent: string;
    englishKeyTakeaways: string[];
    englishImpactNotes: string;
    englishConclusion: string;
    englishSeoTitle: string;
    englishSeoDescription: string;
    englishKeywords: string;
  };
};

const initialState: AiNewsTranslationActionState = {
  ok: false,
  message: ""
};

export function AiNewsTranslationPanel({
  onTranslated
}: {
  onTranslated: (data: NonNullable<AiNewsTranslationActionState["data"]>) => void;
}) {
  const [state, formAction, pending] = useActionState(generateAiNewsEnglishDraftAction, initialState);

  useEffect(() => {
    if (state.ok && state.data) {
      onTranslated(state.data);
    }
  }, [state, onTranslated]);

  return (
    <div className="rounded-2xl border border-white/12 bg-white/6 p-4 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--marketing-text)]">English Content</p>
          <p className="mt-1 text-xs text-[var(--marketing-muted)]">Generate English title, summary, content, takeaways, and SEO fields from the current Chinese draft.</p>
        </div>
        <button
          type="submit"
          formAction={formAction}
          className="rounded-full border border-white/14 px-4 py-2 text-sm font-semibold text-[var(--marketing-text)] transition hover:border-[var(--marketing-accent)] hover:text-[var(--marketing-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "Generating..." : "Generate English Content"}
        </button>
      </div>
      {state.message ? (
        <p className={`mt-3 rounded-xl border px-4 py-3 text-sm ${state.ok ? "border-[#5EF1C7]/30 bg-[#5EF1C7]/10 text-[#5EF1C7]" : "border-red-400/30 bg-red-400/10 text-red-100"}`}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Implement the server action and wire it into the editor**

```typescript
// add inside src/app/admin/actions.ts
export async function generateAiNewsEnglishDraftAction(
  _prevState: AiNewsTranslationActionState | null,
  formData: FormData
): Promise<AiNewsTranslationActionState> {
  await requireAdmin();

  try {
    const draft = await generateAiNewsEnglishDraft({
      title: z.string().min(1).parse(formData.get("title")),
      subtitle: parseOptionalString(formData.get("subtitle")) ?? "",
      summary: z.string().min(1).parse(formData.get("summary")),
      content: z.string().min(1).parse(formData.get("content")),
      keyTakeaways: parseMultilineItems(formData.get("keyTakeaways")),
      impactNotes: parseOptionalString(formData.get("impactNotes")) ?? "",
      conclusion: parseOptionalString(formData.get("conclusion")) ?? "",
      seoTitle: parseOptionalString(formData.get("seoTitle")) ?? "",
      seoDescription: parseOptionalString(formData.get("seoDescription")) ?? "",
      keywords: parseOptionalString(formData.get("keywords")) ?? ""
    });

    return {
      ok: true,
      message: "English content generated successfully.",
      data: draft
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to generate English content."
    };
  }
}
```

```typescript
// inside src/app/admin/ai-news-editor.tsx
const [englishTitle, setEnglishTitle] = useState(article?.englishTitle ?? "");
const [englishSubtitle, setEnglishSubtitle] = useState(article?.englishSubtitle ?? "");
const [englishSummary, setEnglishSummary] = useState(article?.englishSummary ?? "");
const [englishContent, setEnglishContent] = useState(article?.englishContent ?? "");
const [englishKeyTakeaways, setEnglishKeyTakeaways] = useState(article?.englishKeyTakeaways.join("\n") ?? "");
const [englishImpactNotes, setEnglishImpactNotes] = useState(article?.englishImpactNotes ?? "");
const [englishConclusion, setEnglishConclusion] = useState(article?.englishConclusion ?? "");
const [englishSeoTitle, setEnglishSeoTitle] = useState(article?.englishSeoTitle ?? "");
const [englishSeoDescription, setEnglishSeoDescription] = useState(article?.englishSeoDescription ?? article?.englishDescription ?? "");
const [englishKeywords, setEnglishKeywords] = useState(article?.englishKeywords ?? "");

<AiNewsTranslationPanel
  onTranslated={(data) => {
    setEnglishTitle(data.englishTitle);
    setEnglishSubtitle(data.englishSubtitle);
    setEnglishSummary(data.englishSummary);
    setEnglishContent(data.englishContent);
    setEnglishKeyTakeaways(data.englishKeyTakeaways.join("\n"));
    setEnglishImpactNotes(data.englishImpactNotes);
    setEnglishConclusion(data.englishConclusion);
    setEnglishSeoTitle(data.englishSeoTitle);
    setEnglishSeoDescription(data.englishSeoDescription);
    setEnglishKeywords(data.englishKeywords);
  }}
/>
```

- [ ] **Step 5: Run the targeted tests**

Run: `npm test -- src/lib/ai-news-translation.test.ts src/lib/ai-news-translation-action.test.ts`

Expected: PASS with action and service tests green.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/actions.ts src/app/admin/ai-news-editor.tsx src/app/admin/ai-news-translation-panel.tsx src/lib/ai-news-translation-action.test.ts
git commit -m "feat: add ai news english generation action"
```

### Task 3: Lock the route migration with regression tests

**Files:**
- Create: `C:\Users\HU\Documents\New project 2\src\lib\account-services-routing.test.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\lib\site-header-nav.test.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\lib\technical-seo-phase-one-source.test.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\lib\public-slugs.test.ts`

- [ ] **Step 1: Write the failing route tests**

```typescript
import { describe, expect, it } from "vitest";
import { buildCanonicalToolPath } from "@/lib/public-slugs";

describe("account service canonical routing", () => {
  it("uses account-services for online tools", () => {
    const tool = {
      slug: "service-slug",
      name: "账号服务",
      englishName: "Account Service",
      type: "online" as const
    };

    expect(buildCanonicalToolPath(tool, "zh")).toBe("/account-services/account-service");
    expect(buildCanonicalToolPath(tool, "en")).toBe("/en/account-services/account-service");
  });
});
```

```typescript
// in source tests
expect(source).toContain('href: buildLocalePath("/account-services", locale)');
expect(source).not.toContain('href: buildLocalePath("/online-tools", locale)');
expect(sitemap).toContain('"/account-services"');
expect(sitemap).toContain('"/en/account-services"');
expect(sitemap).not.toContain('"/online-tools"');
expect(sitemap).not.toContain('"/en/online-tools"');
```

- [ ] **Step 2: Run the route tests to verify they fail**

Run: `npm test -- src/lib/public-slugs.test.ts src/lib/site-header-nav.test.ts src/lib/technical-seo-phase-one-source.test.ts`

Expected: FAIL because the old `/online-tools` route family is still present.

- [ ] **Step 3: Implement minimal helper-aware route expectations**

```typescript
// src/lib/public-slugs.ts
function buildToolBasePath(
  tool: { type?: "software" | "online" | "skill_learning" },
  locale: Locale
) {
  if (tool.type === "online") {
    return buildLocalePath(`/account-services/${getCanonicalToolSlug(tool)}`, locale);
  }

  return buildLocalePath(`/tools/${getCanonicalToolSlug(tool)}`, locale);
}
```

Update the tests to pass the `type` field where needed.

- [ ] **Step 4: Re-run the targeted tests**

Run: `npm test -- src/lib/public-slugs.test.ts src/lib/site-header-nav.test.ts src/lib/technical-seo-phase-one-source.test.ts`

Expected: still FAIL in source tests until the actual route files and headers are migrated.

- [ ] **Step 5: Commit**

```bash
git add src/lib/public-slugs.test.ts src/lib/site-header-nav.test.ts src/lib/technical-seo-phase-one-source.test.ts src/lib/account-services-routing.test.ts
git commit -m "test: lock account service public route migration"
```

### Task 4: Implement public route migration and redirects

**Files:**
- Create: `C:\Users\HU\Documents\New project 2\src\app\account-services\page-shell.tsx`
- Create: `C:\Users\HU\Documents\New project 2\src\app\account-services\page.tsx`
- Create: `C:\Users\HU\Documents\New project 2\src\app\account-services\[slug]\page.tsx`
- Create: `C:\Users\HU\Documents\New project 2\src\app\en\account-services\page.tsx`
- Create: `C:\Users\HU\Documents\New project 2\src\app\en\account-services\[slug]\page.tsx`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\online-tools\page-shell.tsx`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\(zh-public)\online-tools\page.tsx`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\en\online-tools\page.tsx`
- Create: `C:\Users\HU\Documents\New project 2\src\app\(zh-public)\account-services\page.tsx`
- Create: `C:\Users\HU\Documents\New project 2\src\app\(zh-public)\account-services\[slug]\page.tsx`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\page-shell.tsx`
- Modify: `C:\Users\HU\Documents\New project 2\src\components\site-header.tsx`
- Modify: `C:\Users\HU\Documents\New project 2\src\lib\seo.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\lib\public-slugs.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\tools\[slug]\page-shell.tsx`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\sitemap.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\robots.ts`
- Modify: `C:\Users\HU\Documents\New project 2\next.config.ts`
- Modify: `C:\Users\HU\Documents\New project 2\middleware.ts`

- [ ] **Step 1: Implement the new listing shell and route pages**

```typescript
// src/app/account-services/page-shell.tsx
export { onlineToolsPageRevalidate as accountServicesPageRevalidate } from "@/app/online-tools/page-shell";
export {
  generateOnlineToolsPageMetadata as generateAccountServicesPageMetadata,
  OnlineToolsPageShell as AccountServicesPageShell
} from "@/app/online-tools/page-shell";
```

```typescript
// src/app/(zh-public)/account-services/page.tsx
import { AccountServicesPageShell, generateAccountServicesPageMetadata } from "@/app/account-services/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateAccountServicesPageMetadata("zh");
}

export default async function AccountServicesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <PublicSiteChrome forceLocale="zh">
      <AccountServicesPageShell searchParams={searchParams} forceLocale="zh" />
    </PublicSiteChrome>
  );
}
```

- [ ] **Step 2: Implement permanent redirects for old listing pages**

```typescript
// src/app/(zh-public)/online-tools/page.tsx
import { permanentRedirect } from "next/navigation";

export default function OnlineToolsRedirectPage() {
  permanentRedirect("/account-services");
}
```

```typescript
// src/app/en/online-tools/page.tsx
import { permanentRedirect } from "next/navigation";

export default function EnglishOnlineToolsRedirectPage() {
  permanentRedirect("/en/account-services");
}
```

- [ ] **Step 3: Add dedicated account service detail aliases and old detail redirects**

```typescript
// src/app/(zh-public)/account-services/[slug]/page.tsx
import { generateToolDetailPageMetadata, ToolDetailPageShell } from "@/app/tools/[slug]/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return generateToolDetailPageMetadata("zh", slug);
}

export default async function AccountServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PublicSiteChrome forceLocale="zh">
      <ToolDetailPageShell slug={slug} forceLocale="zh" />
    </PublicSiteChrome>
  );
}
```

```typescript
// create old detail redirect pages in src/app/online-tools/[slug]/page.tsx and src/app/en/online-tools/[slug]/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function LegacyDetailRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/account-services/${slug}`);
}
```

- [ ] **Step 4: Update helpers, metadata, and SEO route tables**

```typescript
// src/lib/public-slugs.ts
export function buildCanonicalToolPath(
  tool: {
    slug: string;
    name: string;
    englishName?: string | null;
    type?: "software" | "online" | "skill_learning";
  },
  locale: Locale
) {
  const slug = getCanonicalToolSlug(tool);
  if (tool.type === "online") {
    return buildLocalePath(`/account-services/${slug}`, locale);
  }
  return buildLocalePath(`/tools/${slug}`, locale);
}
```

```typescript
// src/lib/seo.ts
const localizedPublicRoutePatterns = [
  /^\/$/,
  /^\/software$/,
  /^\/account-services$/,
  /^\/account-services\/.+$/,
  /^\/skill-learning$/,
  /^\/ai-news$/,
  /^\/ai-news\/.+$/,
  /^\/pricing$/,
  /^\/tutorials$/,
  /^\/tools\/.+$/,
  /^\/legal\/.+$/
] as const;
```

Update `sitemap.ts`, `next.config.ts`, and `middleware.ts` to swap `/online-tools` for `/account-services` in public route lists and header cache rules.

- [ ] **Step 5: Re-run the routing tests**

Run: `npm test -- src/lib/public-slugs.test.ts src/lib/site-header-nav.test.ts src/lib/technical-seo-phase-one-source.test.ts`

Expected: PASS with the new route family and no public `/online-tools` references in those tested sources.

- [ ] **Step 6: Commit**

```bash
git add src/app/account-services src/app/en/account-services src/app/(zh-public)/account-services src/app/(zh-public)/online-tools/page.tsx src/app/en/online-tools/page.tsx src/lib/public-slugs.ts src/lib/seo.ts src/app/sitemap.ts src/app/robots.ts next.config.ts middleware.ts src/app/page-shell.tsx src/components/site-header.tsx src/app/tools/[slug]/page-shell.tsx
git commit -m "feat: migrate public account service routes"
```

### Task 5: Finish source cleanup and full verification

**Files:**
- Modify: `C:\Users\HU\Documents\New project 2\src\lib\access.ts`
- Modify: `C:\Users\HU\Documents\New project 2\src\app\admin\actions.ts`
- Modify: any remaining public-facing source files flagged by targeted search
- Test: existing targeted tests plus full suite

- [ ] **Step 1: Replace remaining public-facing route strings**

```typescript
// src/lib/access.ts
if (!canUsePaidOnlineTool({ servicePrice, hasToolPurchase: Boolean(purchase) })) {
  redirect(`/account-services/${getCanonicalToolSlug(tool)}?service=pay-required`);
}
```

```typescript
// src/app/admin/actions.ts
revalidatePath("/account-services");
```

Keep `/admin/online-tools` references intact.

- [ ] **Step 2: Run a final source search for public `/online-tools` leftovers**

Run: `powershell -Command "Get-ChildItem src -Recurse -File | Select-String -Pattern '/online-tools|\"/online-tools|buildLocalePath\\(\"/online-tools' | ForEach-Object { \"{0}:{1}:{2}\" -f $_.Path, $_.LineNumber, $_.Line.Trim() }"`

Expected: only admin management paths such as `/admin/online-tools` remain.

- [ ] **Step 3: Run focused verification**

Run:
- `npm test -- src/lib/ai-news-translation.test.ts src/lib/ai-news-translation-action.test.ts src/lib/public-slugs.test.ts src/lib/site-header-nav.test.ts src/lib/technical-seo-phase-one-source.test.ts`
- `npm run typecheck`

Expected:
- All targeted tests PASS
- TypeScript exits with code 0

- [ ] **Step 4: Run full verification**

Run:
- `npm test`
- `npm run build`

Expected:
- Full test suite PASS
- Production build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/lib/access.ts src/app/admin/actions.ts
git commit -m "chore: verify translation and account service migration"
```
