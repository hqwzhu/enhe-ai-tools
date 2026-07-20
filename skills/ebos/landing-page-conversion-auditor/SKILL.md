---
name: landing-page-conversion-auditor
description: Audit ENHE product page conversion through headline, subheadline, CTA, FAQ, pricing, purchase path, trust elements, demo video, and schema. Use when Codex needs landing page improvement plans, A/B test ideas, or Codex UI tasks for conversion problems.
---

# Landing Page Conversion Auditor

## Purpose
Find product page changes that can improve buyer clarity, trust, purchase intent, and revenue validation.

## When to Use
- Product pages receive traffic but do not convert.
- Revenue is weak or unverified.
- A product page needs CTA, FAQ, pricing, demo, trust, or schema review.
- Codex needs UI tasks for product page improvements.

## Required Inputs
- EBOS evidence: `health_snapshot`.
- Optional evidence: `product_evidence`, `revenue_evidence`, `seo_evidence`.
- Project files: product page shells, product data, pricing, media, FAQ, checkout path.
- Human input: target buyer, primary offer, desired conversion action.

## Process
1. Read health evidence and available product or revenue evidence.
2. Identify the target page and desired conversion action.
3. Audit headline, subheadline, CTA, FAQ, pricing, purchase path, trust elements, demo video, and schema.
4. Separate evidence-backed issues from taste or strategy assumptions.
5. Rank fixes by clarity impact, buyer risk reduction, implementation effort, and testability.
6. Generate Codex UI tasks only when changes are specific and verifiable.

## Output Format
Return Markdown with:
- Evidence used.
- Conversion findings.
- Landing page improvement plan.
- A/B test ideas.
- Codex UI tasks.
- Confidence and missing evidence.

## Quality Checklist
- Target page and conversion action are explicit.
- Missing product or revenue evidence is marked.
- Each recommendation improves a specific buyer decision.
- UI tasks include verification criteria.
- No revenue uplift is promised.

## Guardrails
- Do not fabricate conversion metrics.
- Do not change pricing or checkout behavior unless explicitly authorized.
- Do not output secrets.
- Do not make broad redesign tasks when a targeted fix is enough.
- Mark confidence when revenue evidence is absent.

## Example Prompts
- Use EBOS landing-page-conversion-auditor to audit a product page.
- Create A/B test ideas for ENHE product pages from EBOS evidence.
- Turn conversion findings into Codex UI tasks.
