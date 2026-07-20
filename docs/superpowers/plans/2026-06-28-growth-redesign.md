# ENHE AI Growth Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the homepage into a creator growth hub that routes young AI users and creators to tools, trends, courses, account guidance, pricing, tutorials, and Build Your Own X.

**Architecture:** Keep the current App Router structure and reuse `src/app/page-shell.tsx` as the homepage server component. Add small data arrays inside that file, keep CSS in `src/app/globals.css`, and add source-level regression tests for the new internal-link and layout contracts.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Tailwind/global CSS, Vitest source-regression tests.

---

## File Structure

- Modify: `src/app/page-shell.tsx`
  - Owns homepage content, internal-link structure, metadata helpers, and structured data already in use.
  - Add creator outcome cards, workflow links, Build Your Own X CTA, and pricing/tutorial fallback links.
- Modify: `src/app/globals.css`
  - Owns current homepage visual system.
  - Add responsive styles for outcome, workflow, and Build Your Own X sections.
  - Tighten horizontal overflow clipping for hero glow/motion surfaces.
- Modify: `src/lib/home-redesign-source.test.ts`
  - Update outdated expectations from old hero CTA structure.
  - Add regression coverage for creator hub sections and Build Your Own X discovery.
- Modify: `src/lib/site-audit-regressions.test.ts`
  - Add homepage internal-link coverage for Phase 1 SEO/GEO link graph.

Do not modify route slugs, Prisma schema, admin, checkout, user center, account access rules, or structured-data helper contracts.

## Task 1: Add Homepage Growth Hub Content

**Files:**
- Modify: `src/app/page-shell.tsx`
- Test: `src/lib/home-redesign-source.test.ts`

- [ ] **Step 1: Write failing source assertions**

Add assertions to the first `homepage SaaS redesign source` test:

```ts
expect(page).toContain("const creatorOutcomeCards = {");
expect(page).toContain("const creatorWorkflowSteps = {");
expect(page).toContain("const buildYourOwnXSpotlight = {");
expect(page).toContain('href: "/build-your-own-x"');
expect(page).toContain('className="home-outcome-shell"');
expect(page).toContain('className="home-workflow-shell"');
expect(page).toContain('className="home-byox-spotlight"');
expect(page).toContain("t.home.softwareButton");
expect(page).toContain("t.home.aiNewsButton");
expect(page).toContain("t.home.skillLearningButton");
```

- [ ] **Step 2: Run test to verify failure**

Run:

```powershell
npm test -- src/lib/home-redesign-source.test.ts
```

Expected: FAIL because new constants and section classes do not exist.

- [ ] **Step 3: Add localized content arrays**

In `src/app/page-shell.tsx`, after `homeFaqItems`, add:

```ts
const creatorOutcomeCards = {
  zh: [
    {
      title: "写作与内容发布",
      description: "从选题、资料、脚本到发布，先找到能直接进入产出的 AI 工具。",
      href: "/software",
      action: "找内容工具",
    },
    {
      title: "视频与图像创作",
      description: "为短视频、封面、素材处理和视觉生产选择合适的 AI 工作流。",
      href: "/software",
      action: "看创作工具",
    },
    {
      title: "本地部署与开发",
      description: "用项目路线补齐工程能力，把 AI 学习落到可展示作品里。",
      href: "/build-your-own-x",
      action: "选项目路线",
    },
    {
      title: "自动化与 Agent",
      description: "学习提示词、自动化流程和实战课程，把重复任务交给 AI。",
      href: "/skill-learning",
      action: "学工作流",
    },
    {
      title: "效率工具与账号访问",
      description: "确认工具价格、访问方式、服务边界和使用前注意事项。",
      href: "/account-services",
      action: "查服务说明",
    },
  ],
  en: [
    {
      title: "Writing and publishing",
      description: "Move from idea, research, script, and publishing with AI tools that reach output faster.",
      href: "/software",
      action: "Find content tools",
    },
    {
      title: "Video and image creation",
      description: "Choose practical AI workflows for short video, covers, assets, and visual production.",
      href: "/software",
      action: "Explore creator tools",
    },
    {
      title: "Local AI and development",
      description: "Use project routes to build engineering skill and turn AI learning into portfolio work.",
      href: "/build-your-own-x",
      action: "Choose a project route",
    },
    {
      title: "Automation and agents",
      description: "Learn prompts, automation flows, and practical courses for repetitive AI-powered work.",
      href: "/skill-learning",
      action: "Learn workflows",
    },
    {
      title: "Productivity and access",
      description: "Review pricing, access paths, service boundaries, and usage notes before choosing tools.",
      href: "/account-services",
      action: "Check service notes",
    },
  ],
} as const;

const creatorWorkflowSteps = {
  zh: [
    { title: "先看趋势", description: "用 AI 资讯和趋势日报判断机会窗口。", href: "/ai-news", action: "看 AI 资讯" },
    { title: "再选工具", description: "按任务选择软件、插件和本地部署工具。", href: "/software", action: "选 AI 工具" },
    { title: "学习方法", description: "用课程和教程把工具变成稳定流程。", href: "/skill-learning", action: "学 AI 技能" },
    { title: "确认访问", description: "购买前检查账号服务、价格和交付规则。", href: "/pricing", action: "看价格说明" },
    { title: "动手构建", description: "从 Build Your Own X 选择项目，做成可展示作品。", href: "/build-your-own-x", action: "开始构建" },
  ],
  en: [
    { title: "Read the signal", description: "Use AI news and trend briefings to find useful timing.", href: "/ai-news", action: "Read AI news" },
    { title: "Choose tools", description: "Pick software, plugins, and local AI tools by task.", href: "/software", action: "Choose AI tools" },
    { title: "Learn methods", description: "Turn tools into repeatable workflows with courses and tutorials.", href: "/skill-learning", action: "Learn AI skills" },
    { title: "Check access", description: "Review account services, pricing, delivery, and purchase rules first.", href: "/pricing", action: "Review pricing" },
    { title: "Build projects", description: "Use Build Your Own X to choose a project and create portfolio proof.", href: "/build-your-own-x", action: "Start building" },
  ],
} as const;

const buildYourOwnXSpotlight = {
  zh: {
    title: "免费项目导航：Build Your Own X",
    description: "从 300+ 开源项目教程里筛选适合你的路线，用 AI 生成学习计划，把收藏变成可执行任务。",
    primary: "打开项目导航器",
    secondary: "继续看实用教程",
  },
  en: {
    title: "Free project navigator: Build Your Own X",
    description: "Filter 300+ open-source project tutorials, generate an AI learning plan, and turn bookmarks into executable tasks.",
    primary: "Open navigator",
    secondary: "Read tutorials",
  },
} as const;
```

- [ ] **Step 4: Add sections after hero and before featured preview**

Inside `HomePageShell`, after the hero section and before `<section id="updates"...>`, render:

```tsx
      <section className="home-outcome-shell" aria-labelledby="home-outcome-title">
        <Container className="home-hero-reference-frame">
          <div className="home-section-heading">
            <h2 id="home-outcome-title">{forceLocale === "en" ? "Start by outcome" : "按目标开始"}</h2>
            <p>
              {forceLocale === "en"
                ? "Choose the job you want AI to help with, then enter the right ENHE AI path."
                : "先选你想完成的任务，再进入对应的 ENHE AI 路径。"}
            </p>
          </div>
          <div className="home-outcome-grid">
            {creatorOutcomeCards[forceLocale].map((item) => (
              <Link key={item.title} href={buildLocalePath(item.href, forceLocale)} className="home-outcome-card">
                <span>{item.action}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="home-workflow-shell" aria-labelledby="home-workflow-title">
        <Container className="home-hero-reference-frame">
          <div className="home-workflow-panel">
            <div className="home-section-heading">
              <h2 id="home-workflow-title">{forceLocale === "en" ? "From signal to shipped work" : "从趋势信号到交付成果"}</h2>
              <p>
                {forceLocale === "en"
                  ? "ENHE AI connects discovery, selection, learning, access checks, and practice into one creator workflow."
                  : "ENHE AI 把趋势发现、工具选择、方法学习、访问确认和项目练习连成一条创作者工作流。"}
              </p>
            </div>
            <div className="home-workflow-grid">
              {creatorWorkflowSteps[forceLocale].map((item) => (
                <Link key={item.title} href={buildLocalePath(item.href, forceLocale)} className="home-workflow-step">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                  <em>{item.action}</em>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="home-byox-shell" aria-labelledby="home-byox-title">
        <Container className="home-hero-reference-frame">
          <div className="home-byox-spotlight">
            <div>
              <h2 id="home-byox-title">{buildYourOwnXSpotlight[forceLocale].title}</h2>
              <p>{buildYourOwnXSpotlight[forceLocale].description}</p>
            </div>
            <div className="home-byox-actions">
              <ButtonLink href={buildLocalePath("/build-your-own-x", forceLocale)} variant="primary">
                {buildYourOwnXSpotlight[forceLocale].primary}
              </ButtonLink>
              <ButtonLink href={buildLocalePath("/tutorials", forceLocale)} variant="ghost">
                {buildYourOwnXSpotlight[forceLocale].secondary}
                <ArrowUpRight size={16} />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
```

- [ ] **Step 5: Run source test**

Run:

```powershell
npm test -- src/lib/home-redesign-source.test.ts
```

Expected: existing old expectations may fail. Update only expectations that contradict the new approved design.

## Task 2: Style Growth Hub Sections And Prevent Overflow

**Files:**
- Modify: `src/app/globals.css`
- Test: `src/lib/home-redesign-source.test.ts`

- [ ] **Step 1: Add failing CSS assertions**

Add to `home-redesign-source.test.ts`:

```ts
expect(css).toContain(".home-outcome-shell");
expect(css).toContain(".home-outcome-grid");
expect(css).toContain(".home-workflow-shell");
expect(css).toContain(".home-workflow-grid");
expect(css).toContain(".home-byox-spotlight");
expect(css).toContain("overflow-x: clip");
expect(css).toContain(".home-hero-title-emphasis {\n  width: min(100%, 1404px);");
```

- [ ] **Step 2: Run test to verify failure**

Run:

```powershell
npm test -- src/lib/home-redesign-source.test.ts
```

Expected: FAIL for new CSS selectors.

- [ ] **Step 3: Add CSS**

In `src/app/globals.css`, after `.home-featured-shell`, add:

```css
.home-outcome-shell,
.home-workflow-shell,
.home-byox-shell {
  position: relative;
  overflow-x: clip;
  padding: clamp(1.25rem, 3vw, 2.25rem) 0;
}

.home-section-heading {
  max-width: 760px;
  margin: 0 auto clamp(1rem, 2vw, 1.5rem);
  text-align: center;
}

.home-section-heading h2 {
  margin: 0;
  color: var(--marketing-text);
  font-size: clamp(1.85rem, 3.2vw, 3rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.08;
}

.home-section-heading p {
  margin: 0.85rem auto 0;
  color: var(--marketing-muted);
  font-size: clamp(0.95rem, 1.18vw, 1.05rem);
  font-weight: 650;
  line-height: 1.8;
}

.home-outcome-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.home-outcome-card {
  display: flex;
  min-height: 238px;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background:
    radial-gradient(circle at 20% 0%, rgba(240, 90, 53, 0.13), transparent 58%),
    rgba(255, 255, 255, 0.058);
  padding: clamp(1rem, 1.7vw, 1.25rem);
  color: var(--marketing-text);
  text-decoration: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition:
    border-color 180ms ease,
    transform 180ms ease,
    background 180ms ease;
}

.home-outcome-card:hover {
  border-color: rgba(240, 90, 53, 0.52);
  background:
    radial-gradient(circle at 20% 0%, rgba(240, 90, 53, 0.2), transparent 60%),
    rgba(255, 255, 255, 0.078);
  transform: translateY(-2px);
}

.home-outcome-card span {
  color: var(--marketing-accent);
  font-size: 0.78rem;
  font-weight: 900;
}

.home-outcome-card h3 {
  margin: auto 0 0.75rem;
  color: var(--marketing-text);
  font-size: clamp(1.08rem, 1.45vw, 1.3rem);
  font-weight: 900;
  line-height: 1.22;
}

.home-outcome-card p {
  margin: 0;
  color: var(--marketing-muted);
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.68;
}

.home-workflow-panel,
.home-byox-spotlight {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.095), rgba(255, 255, 255, 0.038)),
    rgba(28, 31, 39, 0.58);
  box-shadow:
    0 26px 88px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.home-workflow-panel {
  padding: clamp(1.1rem, 2.3vw, 1.8rem);
}

.home-workflow-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.home-workflow-step {
  display: grid;
  min-height: 190px;
  align-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.045);
  padding: 1rem;
  color: var(--marketing-text);
  text-decoration: none;
}

.home-workflow-step strong {
  color: var(--marketing-text);
  font-size: 1rem;
  line-height: 1.25;
}

.home-workflow-step span {
  color: var(--marketing-muted);
  font-size: 0.9rem;
  line-height: 1.68;
}

.home-workflow-step em {
  color: var(--marketing-accent);
  font-size: 0.86rem;
  font-style: normal;
  font-weight: 900;
}

.home-byox-spotlight {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: clamp(1rem, 2vw, 1.5rem);
  align-items: center;
  padding: clamp(1.25rem, 2.8vw, 2rem);
}

.home-byox-spotlight h2 {
  margin: 0;
  color: var(--marketing-text);
  font-size: clamp(1.75rem, 3vw, 2.7rem);
  font-weight: 900;
  line-height: 1.08;
}

.home-byox-spotlight p {
  max-width: 680px;
  margin: 0.8rem 0 0;
  color: var(--marketing-muted);
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.78;
}

.home-byox-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}
```

Also change `.home-hero-title-emphasis` width to:

```css
width: min(100%, 1404px);
```

- [ ] **Step 4: Add responsive CSS**

In the existing mobile media blocks, add:

```css
@media (max-width: 1120px) {
  .home-outcome-grid,
  .home-workflow-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .home-outcome-grid,
  .home-workflow-grid,
  .home-byox-spotlight {
    grid-template-columns: 1fr;
  }

  .home-outcome-card,
  .home-workflow-step {
    min-height: auto;
  }

  .home-byox-actions {
    justify-content: stretch;
  }

  .home-byox-actions > * {
    width: 100%;
  }
}
```

- [ ] **Step 5: Run CSS/source test**

Run:

```powershell
npm test -- src/lib/home-redesign-source.test.ts
```

Expected: PASS after updating outdated exact-string expectations.

## Task 3: Add SEO/GEO Internal Link Regression

**Files:**
- Modify: `src/lib/site-audit-regressions.test.ts`

- [ ] **Step 1: Add failing internal-link test**

Add test:

```ts
it("keeps the homepage growth hub linked to major SEO and conversion paths", () => {
  const homeShell = read("src/app/page-shell.tsx");

  for (const path of [
    '"/ai-news"',
    '"/ai-trends"',
    '"/software"',
    '"/skill-learning"',
    '"/account-services"',
    '"/pricing"',
    '"/tutorials"',
    '"/build-your-own-x"',
  ]) {
    expect(homeShell).toContain(path);
  }

  expect(homeShell).toContain("creatorOutcomeCards");
  expect(homeShell).toContain("creatorWorkflowSteps");
  expect(homeShell).toContain("buildYourOwnXSpotlight");
});
```

- [ ] **Step 2: Run test**

Run:

```powershell
npm test -- src/lib/site-audit-regressions.test.ts
```

Expected: PASS if Task 1 added all paths. If `/ai-trends` is missing, add it to the hero path strip or workflow arrays with descriptive text.

- [ ] **Step 3: Run focused tests**

Run:

```powershell
npm test -- src/lib/home-redesign-source.test.ts src/lib/site-audit-regressions.test.ts src/lib/seo.test.ts
```

Expected: PASS.

## Task 4: Verify Build, Visual Behavior, Push, Deploy

**Files:**
- No source changes unless verification exposes a bug.

- [ ] **Step 1: Run static checks**

Run:

```powershell
npm run lint
npm run typecheck
git diff --check
```

Expected: all pass.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: Next.js build succeeds.

- [ ] **Step 3: Commit implementation**

Run:

```powershell
git status --short
git add src/app/page-shell.tsx src/app/globals.css src/lib/home-redesign-source.test.ts src/lib/site-audit-regressions.test.ts docs/superpowers/plans/2026-06-28-growth-redesign.md
git commit -m "feat: turn homepage into creator growth hub"
```

- [ ] **Step 4: Push to GitHub main**

Run:

```powershell
git fetch origin
git push origin HEAD:main
```

Expected: push succeeds. If remote advanced, fetch and rebase or fast-forward only after reviewing incoming commits.

- [ ] **Step 5: Deploy Tencent Cloud**

Run direct deploy:

```powershell
ssh -i "$HOME\.ssh\enhe-ai-tools-tencent.pem" -p 22 -o StrictHostKeyChecking=accept-new ubuntu@111.229.135.3 'set -e; cd /opt/enhe-ai-tools; git pull --ff-only origin main; chmod +x deploy.sh; ./deploy.sh'
```

If GitHub TLS/network fails on server, use bundle deploy:

```powershell
$sha = git rev-parse --short origin/main
$bundle = "$env:TEMP\enhe-main-$sha.bundle"
git bundle create $bundle origin/main
scp -i "$HOME\.ssh\enhe-ai-tools-tencent.pem" -P 22 -o StrictHostKeyChecking=accept-new $bundle ubuntu@111.229.135.3:/tmp/enhe-main-$sha.bundle
ssh -i "$HOME\.ssh\enhe-ai-tools-tencent.pem" -p 22 -o StrictHostKeyChecking=accept-new ubuntu@111.229.135.3 "set -e; cd /opt/enhe-ai-tools; git fetch /tmp/enhe-main-$sha.bundle refs/remotes/origin/main:refs/remotes/origin/main; git reset --hard origin/main; chmod +x deploy.sh; SKIP_GIT_PULL=1 ./deploy.sh"
```

- [ ] **Step 6: Public checks**

Run:

```powershell
curl.exe -sS -o NUL -w "%{http_code}`n" https://www.enhe-tech.com.cn/
curl.exe -sS -o NUL -w "%{http_code}`n" https://www.enhe-tech.com.cn/api/health
curl.exe -sS https://www.enhe-tech.com.cn/ | Select-String "Build Your Own X|按目标开始|从趋势信号到交付成果|Start by outcome|From signal to shipped work"
```

Expected:

- `/` returns `200`.
- `/api/health` returns `200`.
- Homepage HTML contains growth hub copy or its localized equivalent.

## Self-Review

Spec coverage:

- Creator growth hub: Task 1 and Task 2.
- Build Your Own X integration: Task 1 and Task 3.
- SEO/GEO internal links: Task 3.
- Overflow clipping and responsive layout: Task 2.
- Verification, push, deploy: Task 4.

No planned task changes route slugs, data models, admin, payment, or account access rules.

