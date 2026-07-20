# Homepage BorderGlow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved cyan React Bits BorderGlow effect to two homepage hero CTAs and three demand cards without changing their content, routes, analytics, or layout.

**Architecture:** Add one isolated client component and one colocated CSS Module under `src/components/home`. Keep the existing links as children, use local pointer events for the five instances, and leave the global orange BorderGlow controller unchanged.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS Modules, Vitest, Playwright

---

### Task 1: Lock The Homepage Integration Contract

**Files:**
- Create: `src/lib/home-border-glow-source.test.ts`
- Read: `src/app/page-shell.tsx`
- Read: `src/components/home/border-glow.tsx`
- Read: `src/components/home/border-glow.module.css`

- [ ] **Step 1: Write the failing source-contract test**

Create tests that read the homepage, component, and CSS source. Assert the component import, two button variants, mapped three-card variant, `animated={index === 0}`, unchanged routes and analytics attributes, React Bits attribution, fine-pointer/reduced-motion checks, animation cleanup, scoped mobile fallback, and absence of `overflow: auto`.

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage BorderGlow source contract", () => {
  it("wraps only the approved homepage links", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    expect(page).toContain('import BorderGlow from "@/components/home/border-glow";');
    expect(page).toContain('variant="button"');
    expect(page).toContain('variant="card"');
    expect(page).toContain("animated={index === 0}");
    expect(page).toContain('data-analytics-event="home_hot_ai_tools_cta_click"');
    expect(page).toContain('data-analytics-event="home_free_claim_cta_click"');
    expect(page).toContain('href={buildLocalePath("/software", forceLocale)}');
    expect(page).toContain('href={buildLocalePath("/skill-learning", forceLocale)}');
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/lib/home-border-glow-source.test.ts`

Expected: FAIL because the source-contract test and BorderGlow component do not yet exist.

- [ ] **Step 3: Commit the failing contract test with the implementation in Task 3**

The test remains uncommitted until its minimal implementation is green, avoiding a knowingly broken intermediate commit.

### Task 2: Implement The Isolated BorderGlow Component

**Files:**
- Create: `src/components/home/border-glow.tsx`
- Create: `src/components/home/border-glow.module.css`
- Test: `src/lib/home-border-glow-source.test.ts`

- [ ] **Step 1: Port the supplied TypeScript component**

Implement the supplied prop surface with a homepage-specific `variant`:

```ts
type BorderGlowProps = PropsWithChildren<{
  animated?: boolean;
  backgroundColor?: string;
  borderRadius?: number;
  className?: string;
  colors?: string[];
  coneSpread?: number;
  edgeSensitivity?: number;
  fillOpacity?: number;
  glowColor?: string;
  glowIntensity?: number;
  glowRadius?: number;
  variant: "button" | "card";
}>;
```

Use local `onPointerMove` and `onPointerLeave` handlers to set `--edge-proximity`, `--border-glow-strength`, and `--cursor-angle`. Track media queries in a ref so coarse pointers and reduced-motion users do not run pointer animation.

- [ ] **Step 2: Add one cancellable intro sweep**

For `animated`, run one requestAnimationFrame timeline that increases edge strength, sweeps the angle, then fades. The effect cleanup must cancel the frame, remove the active class, and restore neutral custom properties.

```ts
return () => {
  window.cancelAnimationFrame(frameId);
  card.classList.remove(styles.sweepActive);
  resetGlow(card);
};
```

- [ ] **Step 3: Add scoped visual and responsive styles**

Use CSS Module classes for the wrapper, inner clipping layer, edge light, button sizing, and card sizing. Decorative layers use `pointer-events: none`; `.inner` uses `overflow: hidden`; cards retain the existing two-pixel lift; coarse pointer and reduced-motion media queries retain a static border.

```css
.inner {
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  min-height: 100%;
  overflow: hidden;
  border-radius: inherit;
}

@media (pointer: coarse) {
  .card::before { opacity: 0.34; }
  .edgeLight { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .card, .card * { transition-duration: 0.01ms; }
  .edgeLight { display: none; }
}
```

### Task 3: Wrap The Five Existing Homepage Links

**Files:**
- Modify: `src/app/page-shell.tsx:1-10`
- Modify: `src/app/page-shell.tsx:242-280`
- Test: `src/lib/home-border-glow-source.test.ts`

- [ ] **Step 1: Import the dedicated component**

```tsx
import BorderGlow from "@/components/home/border-glow";
```

- [ ] **Step 2: Wrap both existing ButtonLink elements**

Use the approved light parameters. Keep each `ButtonLink`, its href, variant, classes, analytics attributes, and localized text unchanged inside the wrapper.

```tsx
<BorderGlow
  variant="button"
  edgeSensitivity={34}
  glowColor="190 80 72"
  borderRadius={9}
  glowRadius={24}
  glowIntensity={0.55}
  coneSpread={18}
  colors={["#56bfd0", "#41c5db", "#20bbd6"]}
  fillOpacity={0.18}
>
  <ButtonLink
    href={buildLocalePath("/software", forceLocale)}
    variant="primary"
    className="home-hero-cta home-hero-cta-primary"
    data-analytics-event="home_hot_ai_tools_cta_click"
    data-analytics-meta-target="software"
    data-analytics-meta-placement="home-hero"
  >
    {forceLocale === "en" ? "Popular AI Tools" : "热门AI工具"}
  </ButtonLink>
</BorderGlow>
```

Wrap the second CTA independently with the same light effect values and its original behavior:

```tsx
<BorderGlow
  variant="button"
  edgeSensitivity={34}
  glowColor="190 80 72"
  borderRadius={9}
  glowRadius={24}
  glowIntensity={0.55}
  coneSpread={18}
  colors={["#56bfd0", "#41c5db", "#20bbd6"]}
  fillOpacity={0.18}
>
  <ButtonLink
    href={buildLocalePath("/skill-learning", forceLocale)}
    variant="ghost"
    className="home-hero-cta home-hero-cta-accent"
    data-analytics-event="home_free_claim_cta_click"
    data-analytics-meta-target="skill-learning"
    data-analytics-meta-placement="home-hero"
  >
    {forceLocale === "en" ? "Claim Free" : "免费领取"}
  </ButtonLink>
</BorderGlow>
```

- [ ] **Step 3: Wrap the three mapped card links**

Change the map callback to receive `index`, apply the approved card parameters, and set `animated={index === 0}`. Keep the `Link` and its title, description, href, and class unchanged.

```tsx
{homeProductPaths[forceLocale].map((item, index) => (
  <BorderGlow
    key={item.title}
    variant="card"
    animated={index === 0}
    edgeSensitivity={28}
    glowColor="190 85 70"
    borderRadius={18}
    glowRadius={42}
    glowIntensity={0.75}
    coneSpread={22}
    colors={["#56bfd0", "#41c5db", "#20bbd6"]}
    fillOpacity={0.16}
  >
    <Link href={buildLocalePath(item.href, forceLocale)} className="home-outcome-card">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </Link>
  </BorderGlow>
))}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/lib/home-border-glow-source.test.ts src/lib/home-redesign-source.test.ts`

Expected: both test files pass.

- [ ] **Step 5: Commit the component and homepage integration**

```bash
git add src/components/home/border-glow.tsx src/components/home/border-glow.module.css src/app/page-shell.tsx src/lib/home-border-glow-source.test.ts
git commit -m "feat: add homepage BorderGlow interactions"
```

### Task 4: Verify Behavior And Production Readiness

**Files:**
- Verify: `src/app/page-shell.tsx`
- Verify: `src/components/home/border-glow.tsx`
- Verify: `src/components/home/border-glow.module.css`

- [ ] **Step 1: Run automated verification**

Run these commands and require exit code 0 from each:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

- [ ] **Step 2: Run the local production-compatible page**

Start the existing dev server on an available port and open both `/` and `/en`.

- [ ] **Step 3: Inspect desktop behavior at 1440 by 1000**

Confirm the two CTA links and three cards retain their positions and dimensions, pointer movement changes the directional edge glow, the first card intro sweep runs once, all five links navigate correctly, and the console has no errors.

- [ ] **Step 4: Inspect mobile behavior at 390 by 844**

Confirm the CTAs wrap as before, cards remain one column, static borders remain visible, taps work, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 5: Inspect reduced motion**

Emulate `prefers-reduced-motion: reduce`, reload the homepage, and confirm the intro sweep does not run while static borders and all links remain usable.

- [ ] **Step 6: Review the final diff and commit any verification-only fixes**

Run `git diff --check` and `git status --short`. Any required fix must receive a failing regression test before production code changes, followed by rerunning the complete verification set.
