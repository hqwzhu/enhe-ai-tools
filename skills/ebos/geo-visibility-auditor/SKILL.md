---
name: geo-visibility-auditor
description: Audit and plan ENHE generative engine visibility across ChatGPT, Perplexity, Gemini, Claude, Bing Copilot, Kimi, Doubao, and other answer engines. Use when Codex needs GEO evidence drafts, AI search probe tasks, or AI search visibility planning.
---

# GEO Visibility Auditor

## Purpose
Assess how ENHE can become visible in AI answer engines and define evidence-backed GEO content and probe tasks.

## When to Use
- The user asks about AI search visibility.
- Weekly report identifies GEO as a weak area.
- Step 5 needs a `geo_evidence` draft.
- ENHE needs ChatGPT, Perplexity, Gemini, Claude, Bing Copilot, Kimi, or Doubao visibility planning.

## Required Inputs
- EBOS evidence: `data_source_readiness`, `weekly_report`.
- Optional evidence: `geo_evidence`, `seo_evidence`, `market_evidence`.
- Project files: public content, product pages, AI news, tutorials, sitemap.
- Human input: target products, priority queries, target languages.

## Process
1. Read Evidence Catalog entries for required evidence.
2. Identify missing AI search data sources or probe infrastructure.
3. Map priority ENHE entities, products, and query intents.
4. Separate answer-engine visibility assumptions from evidence.
5. Draft probe tasks for each answer engine without calling external APIs.
6. Create GEO content plan and Codex tasks only for concrete page or evidence work.

## Output Format
Return Markdown with:
- Evidence used.
- Confidence.
- Priority AI search queries.
- GEO gaps.
- GEO content plan.
- AI search probe setup tasks.
- `geo_evidence` draft when requested.

## Quality Checklist
- Required evidence is present or marked missing.
- AI answer-engine claims are not fabricated.
- Query targets are concrete.
- Probe setup tasks are safe and read-only.
- Confidence is lowered when no actual probe results exist.

## Guardrails
- Do not scrape or call external services unless the user explicitly authorizes it.
- Do not invent ChatGPT, Perplexity, Gemini, Claude, Bing Copilot, Kimi, or Doubao results.
- Do not output secrets.
- Do not modify business code unless implementation is explicitly requested.
- Data gaps must be explicit.

## Example Prompts
- Use EBOS geo-visibility-auditor to plan AI search visibility probes.
- Use EBOS geo-visibility-auditor to draft `geo_evidence` for ENHE.
- Use EBOS geo-visibility-auditor to create GEO content tasks from the weekly report.
