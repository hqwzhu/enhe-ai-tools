# ENHE AI Growth Topic Clusters Design

Date: 2026-06-28
Status: Approved for implementation
Scope: Phase 2 SEO Topic Growth. Static topic cluster pages only.

## Goal

Add a lightweight, indexable topic cluster layer that captures young AI users and creators who search by outcome, workflow, and comparison intent rather than by product category.

The phase should increase search coverage and AI answer extractability without changing product data, route slugs, admin behavior, payment, or account access logic.

## Design Read

Reading this as: a Phase 2 SEO/GEO layer for an AI creator marketplace, with a premium dark ENHE AI language, leaning toward targeted Next.js App Router static routes and reusable topic data.

Design dials:

- Design variance: 5/10. The pages should feel consistent with current listing pages, not introduce another visual system.
- Motion intensity: 2/10. Topic pages should prioritize crawlable text and stable layout.
- Visual density: 6/10. These pages need answer blocks, tables, links, and FAQ without becoming dashboards.

## Information Architecture

Create a new topic hub:

- `/ai-topics`
- `/en/ai-topics`

Create six topic detail pages:

- `/ai-topics/ai-content-creation-tools`
- `/ai-topics/ai-video-image-creation`
- `/ai-topics/local-ai-deployment`
- `/ai-topics/ai-agent-automation`
- `/ai-topics/ai-skill-learning-path`
- `/ai-topics/ai-account-service-compliance`

English mirrors use `/en/ai-topics/[slug]`.

Do not rename existing routes. Topic pages are additive and should link back into existing conversion pages.

## Topic Model

Each topic must define:

- `slug`
- localized title and meta description
- extractable answer block
- three intent cards
- comparison rows
- FAQ items
- related internal links

Keep data static in a small library file. This avoids database migration risk and lets sitemap, route generation, and page rendering share one source.

## Content Strategy

The six first topics should cover current high-value intent:

1. AI content creation tools: writing, publishing, scripts, material preparation.
2. AI video and image creation: short video, cover art, visual assets.
3. Local AI deployment: privacy, offline workflows, local models, developer setup.
4. AI agent automation: repetitive tasks, agents, workflow automation.
5. AI skill learning path: prompt skills, courses, tutorials, project practice.
6. AI account service compliance: access guidance, platform rules, service boundaries.

Each page should answer practical questions directly, then guide users to:

- `/software`
- `/skill-learning`
- `/account-services`
- `/ai-news`
- `/ai-trends`
- `/build-your-own-x`
- `/pricing`
- `/tutorials`

## SEO/GEO Requirements

Topic pages must include:

- descriptive metadata via existing metadata helpers
- breadcrumb schema
- FAQ schema
- CollectionPage schema with ItemList-like topic content
- language alternates through existing metadata helpers
- sitemap entries for zh and en
- visible last-updated date
- stable semantic headings
- extractable answer block near top
- comparison table or mobile cards

Do not add schema that describes hidden content. Schema must match visible text.

## UI Requirements

Use existing dark ENHE components and CSS patterns:

- `Container`
- `StructuredData`
- `SectionTitle` where appropriate
- `surface-panel` / `surface-panel-soft` / `glass`
- existing accent color `#f05a35`

The hub should show a compact topic grid with clear internal links. Detail pages should use answer block, intent cards, comparison table, FAQ, and next-step links.

Avoid:

- new color palette
- decorative stock imagery
- new client-side animation
- horizontal scroll on mobile except inside intentionally scrollable tables; mobile should prefer cards
- changing primary nav labels without a specific reason

## Implementation Boundaries

Allowed files:

- `src/lib/ai-topic-clusters.ts`
- `src/app/ai-topics/page-shell.tsx`
- `src/app/(zh-public)/ai-topics/page.tsx`
- `src/app/(zh-public)/ai-topics/[slug]/page.tsx`
- `src/app/en/ai-topics/page.tsx`
- `src/app/en/ai-topics/[slug]/page.tsx`
- `src/app/sitemap.ts`
- homepage and selected listing pages for internal link entry points
- source regression tests

Do not touch:

- Prisma schema
- admin routes
- order, payment, auth, user center, download access
- existing product/category classification scripts unless needed only for imports

## Acceptance Criteria

Phase 2 is complete when:

- `/ai-topics` and `/en/ai-topics` render a topic hub.
- all six topic detail pages render in zh and en.
- invalid topic slugs return `notFound()`.
- pages use existing metadata helpers and structured data component.
- sitemap includes all topic hub and detail routes with language alternates.
- homepage links to `/ai-topics`.
- at least software, skill-learning, and account-services listing pages link to relevant topic hub/detail pages.
- source tests cover topic data, route files, sitemap entries, schema usage, and internal links.
- focused tests, lint, typecheck, and public smoke checks pass after deploy.

## Out Of Scope

Not part of this phase:

- programmatic pages from database categories
- AI-generated article creation
- keyword research automation
- analytics events
- search console submission automation
- checkout conversion redesign
- product detail redesign
