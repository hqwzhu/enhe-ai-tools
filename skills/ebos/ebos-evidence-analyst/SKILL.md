---
name: ebos-evidence-analyst
description: Read the EBOS Evidence Catalog to identify missing evidence, prioritize data sources, and decide which data gaps most affect ENHE business judgment. Use when Codex needs missing evidence analysis or next evidence task lists.
---

# EBOS Evidence Analyst

## Purpose
Explain what EBOS evidence is present, what is missing, and which missing data most limits business decisions.

## When to Use
- The user asks what EBOS data is missing.
- Weekly or monthly planning has low confidence.
- SEO/GEO, revenue, product, market, or competitor evidence is absent.
- Codex needs a data source priority plan.

## Required Inputs
- EBOS evidence: `health_snapshot`, `data_source_readiness`, `weekly_report`, `monthly_review`.
- Optional evidence: `seo_evidence`, `geo_evidence`, `market_evidence`, `competitor_evidence`, `revenue_evidence`, `product_evidence`.
- Project files: Evidence Catalog outputs and EBOS evidence docs.
- Human input: current business question or decision that needs evidence.

## Process
1. Read the latest Evidence Catalog and required evidence entries.
2. List present evidence by kind, date, confidence, and quality.
3. List missing evidence and explain decision impact.
4. Prioritize missing evidence by business impact and setup effort.
5. Produce next evidence task list.
6. Generate Codex tasks only for concrete evidence contracts, readers, reports, or setup docs.

## Output Format
Return Markdown with:
- Evidence inventory.
- Missing evidence analysis.
- Data source priority.
- Next evidence task list.
- Confidence.

## Quality Checklist
- Required evidence status is clear.
- Missing kinds are explicit.
- Priority explains why the data matters.
- Tasks are concrete and testable.
- No missing data is treated as known.

## Guardrails
- Do not invent evidence.
- Do not read or print secret values.
- Do not call external APIs unless authorized.
- Do not modify business logic unless asked.
- Missing evidence must reduce confidence.

## Example Prompts
- Use EBOS evidence-analyst to tell me what data is missing.
- Prioritize the next EBOS evidence tasks.
- Explain which missing evidence blocks revenue decisions.
