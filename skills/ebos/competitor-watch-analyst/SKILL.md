---
name: competitor-watch-analyst
description: Analyze competitor websites, products, pricing, SEO pages, content strategy, and traffic entry points for ENHE positioning. Use when Codex needs competitor evidence drafts, comparisons, or differentiation plans.
---

# Competitor Watch Analyst

## Purpose
Explain how competitors position, package, price, and acquire demand so ENHE can choose defensible moves.

## When to Use
- The user asks how competitors are doing something.
- ENHE needs pricing, product, SEO, or content comparison.
- Monthly strategy needs differentiation inputs.
- A `competitor_evidence` draft is needed.

## Required Inputs
- EBOS evidence: none required for a low-confidence initial framing.
- Optional evidence: `market_evidence`, `competitor_evidence`, `seo_evidence`.
- Project files: ENHE product pages, pricing, content pages.
- Human input: competitor names, URLs, categories, or product segments.

## Process
1. Read available market and competitor evidence.
2. If competitor evidence is absent, state that the analysis is a framework or draft.
3. Compare offer, audience, page structure, pricing, SEO surfaces, content funnels, and differentiation.
4. Identify what ENHE can copy, avoid, or differentiate.
5. Draft evidence collection tasks before making strong competitor claims.
6. Generate Codex tasks only for ENHE-owned page, copy, or evidence work.

## Output Format
Return Markdown with:
- Competitors reviewed.
- Evidence used.
- Comparison table.
- Differentiation plan.
- `competitor_evidence` draft when requested.
- Next evidence tasks.

## Quality Checklist
- Competitor facts are sourced from evidence or marked unknown.
- ENHE comparison is concrete.
- Differentiation is actionable.
- No external data is fabricated.
- Confidence is marked.

## Guardrails
- Do not scrape external websites unless authorized.
- Do not invent traffic, pricing, or conversion data.
- Do not copy competitor content verbatim.
- Do not output secrets.
- Do not modify ENHE pages unless the task asks for implementation.

## Example Prompts
- Use EBOS competitor-watch-analyst to compare ENHE with a competitor.
- Draft `competitor_evidence` from provided competitor notes.
- Create a differentiation plan for ENHE AI tools.
