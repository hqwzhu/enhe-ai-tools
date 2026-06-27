# ENHE AI Growth Redesign Design

Date: 2026-06-28
Status: Approved for Phase 1 design direction
Scope: Homepage growth redesign only. Phase 2 and Phase 3 are reserved as follow-up layers.

## 1. Goal

Reframe the ENHE AI homepage from a brand-first landing page into a creator growth hub for young AI users, creators, and hands-on builders.

The homepage should make the first visit answer four questions quickly:

- What can I do here today?
- Which path fits my current AI creation goal?
- Where should I click first?
- Why should I trust ENHE AI enough to continue browsing?

The business goal is to improve search traffic, click-through rate, exposure, conversion rate, and user experience without risking the existing SEO/GEO foundation.

## 2. Design Read

Reading this as: a growth-oriented redesign of an AI tools and learning marketplace for young AI users and creators, with a premium dark-tech language, leaning toward targeted evolution of the existing Next.js + Tailwind system.

Design dials:

- Design variance: 7/10. More distinctive and workflow-led than the current homepage, but not a full IA rewrite.
- Motion intensity: 5/10. Use purposeful entrance, hover, and soft ambient effects only. No scroll hijack in Phase 1.
- Visual density: 5/10. Enough structure for scanning and conversion, but not a dashboard.

## 3. Phase Strategy

### Phase 1: Creator Growth Hub

Phase 1 is the current implementation target.

The homepage becomes an outcome-led entry point. It should connect these existing surfaces into one creator workflow:

- AI News: know what changed.
- Software: find the right tool.
- Skill Learning: learn the workflow.
- Account Services: check access and service notes.
- Build Your Own X: choose a hands-on building path.
- Pricing: understand purchase and delivery expectations.

### Phase 2: SEO Topic Growth

Phase 2 is not implemented in this pass. It should add topic clusters, comparison pages, ranking pages, and "best AI tools" content paths.

Phase 1 should leave room for these pages by using wording and internal links that can later expand into clusters.

### Phase 3: Premium Marketplace Conversion

Phase 3 is not implemented in this pass. It should strengthen pricing, trust, product/service detail conversion, purchase flow clarity, and sticky purchase CTAs.

Phase 1 should not redesign checkout or account logic.

## 4. Preservation Rules

Do not change:

- Existing route slugs.
- Primary public nav labels unless the current code already changed them.
- Login, user center, admin, order, or payment flow behavior.
- Existing structured data helpers.
- Existing product, course, account service, and news data models.
- Legal, support, refund, delivery, or compliance copy.

Preserve the brand system:

- Keep the dark premium ENHE AI visual base.
- Keep `#f05a35` as the primary accent.
- Avoid generic AI-purple gradients.
- Keep the existing logo and wordmark treatment.
- Keep desktop navigation within a single line.

## 5. Homepage Content Model

The homepage should be organized around creator intent, not only product categories.

Recommended top-level blocks:

1. Hero: creator outcome positioning.
2. Start by outcome: a compact path selector for creator jobs.
3. Creator workflow: know trend, choose tool, learn workflow, confirm service, build project.
4. Featured content: preserve current featured tools/news/courses where available.
5. Build Your Own X entry: promote the free project navigator as a trust and traffic asset.
6. Conversion bridge: route users to software, skill learning, account services, and pricing.

## 6. Hero Design

Hero job:

- Replace brand manifesto emphasis with creator workflow clarity.
- Communicate "from idea to deliverable output".
- Make the main action obvious.

Hero copy direction:

- Primary headline: focus on turning AI ideas into usable outputs.
- Supporting copy: mention tools, trends, courses, account guidance, and building routes.
- Primary CTA: find AI tools.
- Secondary CTA: choose a building path or open Build Your Own X.

Constraints:

- Hero must fit above the fold at common desktop sizes.
- CTA buttons must not wrap at desktop.
- Avoid more than one eyebrow-style label in the hero.
- Keep any ambient light container horizontally clipped to prevent overflow.

## 7. Start By Outcome Section

Add a section that lets users self-identify by goal:

- Write and publish content.
- Create video or image assets.
- Run local AI or developer workflows.
- Build automation or Agent workflows.
- Improve daily productivity.

Each path should have:

- A short title.
- One plain sentence explaining the outcome.
- A link to the most relevant existing page.

This section should not create new routes in Phase 1.

## 8. Workflow Section

Represent ENHE AI as a practical flow:

1. Track the signal through AI News and AI Trends.
2. Pick a tool through Software.
3. Learn the method through Skill Learning and Tutorials.
4. Confirm access or service notes through Account Services and Pricing.
5. Practice with Build Your Own X.

This section is the main bridge between SEO pages and conversion pages.

## 9. Build Your Own X Integration

The recently added `/build-your-own-x` page should become a visible homepage path.

Purpose:

- Attract young builders and technical AI users.
- Provide a free high-value entry point.
- Improve internal linking to a topical page with search potential.
- Give creators a concrete path after reading trends or browsing tools.

The homepage should link to it as a free creator/project navigator, not as a secondary hidden nav item.

## 10. Visual System

Use targeted evolution of the current dark ENHE style:

- Base: dark neutral surface, not pure black.
- Accent: `#f05a35`.
- Secondary surfaces: subtle borders, soft glass, low-opacity warm light.
- Radius: use one consistent soft radius system.
- Cards: use only when they represent actual choices or repeated items.
- Motion: use CSS or existing Motion components for reveal/hover only, with reduced-motion support.

Avoid:

- AI-purple gradients.
- Three equal generic feature cards as the main section.
- Decorative status dots.
- Div-based fake product screenshots.
- New stock imagery without a clear purpose.
- Horizontal overflow from light or motion containers.

The existing `lucide-react` dependency is acceptable because the project already uses it.

## 11. SEO/GEO Considerations

Phase 1 should support traffic growth by improving internal linking and intent clarity.

Required SEO/GEO safeguards:

- Keep homepage metadata helpers intact.
- Preserve existing canonical and language alternate behavior.
- Add natural links to `/software`, `/ai-news`, `/ai-trends`, `/skill-learning`, `/account-services`, `/pricing`, `/tutorials`, and `/build-your-own-x`.
- Use descriptive anchor text instead of vague "learn more" links.
- Do not add schema types that duplicate existing global website or organization schema unless current homepage already supports them.
- Keep visible copy concrete enough for search snippets and AI citation.

## 12. Accessibility and UX

The redesign must maintain:

- Keyboard-visible focus states.
- Contrast suitable for dark surfaces.
- Real headings in logical order.
- Descriptive link and button text.
- Mobile single-column fallbacks for all multi-column layouts.
- No horizontal scrolling on mobile.
- Reduced motion behavior for any animated layer.

## 13. Implementation Boundaries

Expected implementation area:

- Homepage route shell or public homepage component.
- Shared homepage-specific UI sections if the current code already separates them.
- Minimal CSS additions in `src/app/globals.css` or colocated styles that match current patterns.
- Tests or regression checks for homepage links and key copy.

Do not touch:

- Prisma schema.
- Admin routes.
- Payment and order code.
- Tool detail access rules.
- Account service sanitization logic.
- Existing SEO quick-fix code unless the homepage requires a direct import.

## 14. Acceptance Criteria

Phase 1 is complete when:

- Homepage presents ENHE AI as a creator growth hub in the first viewport.
- Primary CTA routes to AI tools or software discovery.
- Secondary CTA routes to Build Your Own X or a creator path selector.
- Existing major public pages are linked from the homepage with descriptive anchor text.
- `/build-your-own-x` is clearly discoverable from the homepage.
- Homepage has no horizontal overflow on desktop or mobile.
- Dark visual language remains consistent with ENHE AI.
- CTA labels fit on desktop and mobile.
- Lint and typecheck pass.
- Relevant unit/regression tests pass or are added where useful.
- Public deployment health check passes after push and Tencent Cloud deploy.

## 15. Out Of Scope

Not part of Phase 1:

- Creating new SEO comparison routes.
- Creating ranking pages.
- Redesigning pricing page UI.
- Redesigning product detail pages.
- Rebuilding purchase flow.
- Adding analytics instrumentation.
- Changing CMS/admin behavior.
- Changing article publishing automation.

