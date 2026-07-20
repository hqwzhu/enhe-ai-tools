# ENHE AI Homepage BorderGlow Design

## Goal

Add a restrained cyan directional border glow to exactly five homepage elements:

- the "Popular AI Tools" / "热门AI工具" hero CTA
- the "Claim Free" / "免费领取" hero CTA
- the three cards in the "Choose by need" / "按需求选择" section

The change must preserve all copy, localized routes, analytics attributes, dimensions, glass backgrounds, and click behavior. It must not alter the particle background, ASCII title, navigation, authentication, admin, payments, APIs, database, or SEO behavior.

## Architecture

Create a dedicated client component at `src/components/home/border-glow.tsx` with styles in `src/components/home/border-glow.module.css`. The component is adapted from the supplied React Bits TypeScript source and owns only its local pointer tracking and optional intro sweep.

The existing global `BorderGlowController` remains unchanged. It serves a broader orange-themed card treatment and does not target the five homepage elements in this task. Keeping the homepage component isolated avoids changing unrelated cards or adding the homepage cyan theme to global selectors.

The component wraps, but does not replace, the existing `ButtonLink` and `Link` elements. This keeps their route prefetching, keyboard behavior, analytics attributes, and accessible names intact. Decorative glow layers use `pointer-events: none`.

## Visual Behavior

Hero buttons use the lighter configuration from the approved brief: edge sensitivity 34, glow radius 24, intensity 0.55, cone spread 18, and a restrained cyan palette. Their current size, nine-pixel radius, transparent glass surface, and centered text remain unchanged.

Demand cards use edge sensitivity 28, glow radius 42, intensity 0.75, cone spread 22, and the same cyan palette. Their existing background, padding, minimum height, and two-pixel hover lift remain unchanged. Only the first card plays one subtle intro sweep; the other two are pointer-driven only.

On fine-pointer desktop devices, proximity and angle update from pointer movement over each component. On coarse-pointer devices, tracking is disabled and a static low-opacity border remains. With `prefers-reduced-motion: reduce`, the intro sweep and movement transitions are disabled while the static border remains visible.

## Styling Boundaries

All new effect styles live in the component CSS Module. Selectors may target the existing homepage CTA and card classes only through a locally scoped wrapper. The inner container never uses `overflow: auto`; it clips decorative layers without introducing scrollbars. The wrapper exposes stable button and card variants so it does not change the homepage grid or mobile wrapping behavior.

No remote assets or new runtime dependencies are required. The supplied TypeScript source is ported manually to avoid registry-generated project churn.

## Tests And Verification

Add a focused source-contract test that verifies:

- the component remains a client leaf and retains React Bits attribution
- pointer calculations, requestAnimationFrame cleanup, coarse-pointer handling, and reduced-motion handling exist
- the homepage wraps both CTA links and the mapped three-card group
- only the first card enables the intro sweep
- the original routes, analytics attributes, copy, and link elements remain present
- scoped CSS contains static mobile/reduced-motion fallbacks and no `overflow: auto`

Run the focused tests first, then the full test suite, lint, typecheck, and production build. Finally, inspect desktop and mobile screenshots, confirm there is no horizontal overflow, verify the links remain clickable, and check the browser console for errors.

## Acceptance Criteria

The two hero CTAs and all three demand cards show the approved cyan BorderGlow treatment without layout shifts. Desktop glow follows pointer direction near the edge, mobile retains a subtle static border and active feedback, and reduced-motion users receive no intro sweep. Chinese and English homepages preserve their current content and routes, and all automated checks pass.
