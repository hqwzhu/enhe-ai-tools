---
name: technical-seo-auditor
description: Audit ENHE technical SEO for traffic problems, including robots, sitemap, canonical, metadata, schema, hreflang, 404s, page structure, and Core Web Vitals readiness. Use when Codex needs SEO evidence drafts, SEO fix tasks, or technical SEO diagnosis from EBOS evidence.
---

# Technical SEO Auditor

## Purpose
Find technical SEO blockers that affect ENHE discovery, crawling, indexing, snippets, and traffic quality.

## When to Use
- Organic traffic is weak or declining.
- Sitemap, robots, canonical, metadata, schema, hreflang, or 404 behavior needs review.
- Step 5 needs a `seo_evidence` draft.
- Weekly or monthly review asks for SEO implementation tasks.

## Required Inputs
- EBOS evidence: `health_snapshot`, `data_source_readiness`.
- Optional evidence: `seo_evidence`, `product_evidence`.
- Project files: sitemap, robots, metadata builders, route files, public page shells.
- Human input: target market, priority products, and known SEO concerns.

## Process
1. Read available EBOS Evidence Catalog entries for `health_snapshot` and `data_source_readiness`.
2. List missing required evidence and mark confidence before making claims.
3. Inspect robots, sitemap, canonical, metadata, schema, hreflang, 404, and page structure evidence.
4. Separate verified defects from improvement opportunities.
5. Rank tasks by expected discovery impact, implementation risk, and testability.
6. Generate Codex tasks only for concrete file-level fixes or testable evidence generation.

## Output Format
Return Markdown with:
- Evidence used.
- Confidence.
- Findings.
- Risks.
- SEO fix task list.
- Codex technical tasks.
- `seo_evidence` draft when requested.

## Quality Checklist
- Required evidence is cited or marked missing.
- No SEO fact is invented.
- Each fix has a verification command or inspection method.
- Canonical, sitemap, robots, metadata, schema, hreflang, 404, and route coverage are considered.
- Confidence reflects missing data.

## Guardrails
- Do not modify business code unless the user asks for implementation.
- Do not read or print secret values.
- Do not claim GSC, GA, Bing, or Core Web Vitals data exists unless evidence proves it.
- Do not turn broad advice into Codex tasks.
- Data gaps must be labeled as partial or unknown confidence.

## Example Prompts
- Use EBOS technical-seo-auditor to explain why ENHE has no organic traffic.
- Use EBOS technical-seo-auditor to draft `seo_evidence` from the latest health snapshot.
- Use EBOS technical-seo-auditor to create SEO fix tasks for product pages.
