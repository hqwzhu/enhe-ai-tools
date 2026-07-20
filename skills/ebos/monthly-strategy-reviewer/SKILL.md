---
name: monthly-strategy-reviewer
description: Read EBOS monthly_review evidence and generate next-month strategy plans, stop keep start decisions, and OKRs. Use when Codex needs monthly strategic planning from EBOS monthly and weekly evidence.
---

# Monthly Strategy Reviewer

## Purpose
Turn monthly review evidence into strategic choices, next-month OKRs, and stop/keep/start decisions.

## When to Use
- The user asks for a monthly plan or strategy review.
- Monthly review needs a next-month operating plan.
- Product, revenue, traffic, SEO/GEO, or evidence priorities need a strategic frame.
- Codex needs OKRs derived from EBOS evidence.

## Required Inputs
- EBOS evidence: `monthly_review`, `weekly_report`.
- Optional evidence: `market_evidence`, `revenue_evidence`, `product_evidence`.
- Project files: monthly reports, weekly reports, EBOS docs.
- Human input: constraints, capacity, strategic focus.

## Process
1. Read monthly review and relevant weekly evidence.
2. Identify persistent patterns, improvements, regressions, and evidence gaps.
3. Decide what to stop, keep, and start.
4. Draft OKRs with measurable key results and evidence requirements.
5. Create strategic themes and next-month task groups.
6. Generate Codex tasks only for concrete artifacts, evidence, or implementation plans.

## Output Format
Return Markdown with:
- Evidence used.
- Monthly strategy plan.
- Stop/keep/start decisions.
- Next month OKR.
- Risks and missing evidence.
- Codex task candidates.

## Quality Checklist
- Monthly and weekly evidence are cited or marked missing.
- OKRs are measurable.
- Stop/keep/start decisions are tied to evidence.
- Data gaps are not hidden.
- Strategy is scoped to the next month.

## Guardrails
- Do not invent revenue, traffic, or market outcomes.
- Do not create broad roadmaps without validation.
- Do not output secrets.
- Do not modify business code unless explicitly asked.
- Mark assumptions and confidence.

## Example Prompts
- Use EBOS monthly-strategy-reviewer to create next month's strategy.
- Generate stop/keep/start decisions from monthly review evidence.
- Draft next month OKRs for ENHE Business OS.
