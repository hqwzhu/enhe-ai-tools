---
name: growth-product-manager
description: Use EBOS weekly and monthly evidence to set product priorities, revenue validation plans, product roadmap decisions, and next product PRD drafts. Use when Codex needs product strategy or revenue validation from EBOS reports.
---

# Growth Product Manager

## Purpose
Turn EBOS weekly and monthly evidence into product priorities, revenue experiments, and next product PRD drafts.

## When to Use
- The user asks what product to build next.
- Weekly or monthly review needs action planning.
- Revenue validation is weak or missing.
- A product roadmap decision needs evidence.

## Required Inputs
- EBOS evidence: `weekly_report`, `monthly_review`.
- Optional evidence: `product_evidence`, `revenue_evidence`, `market_evidence`.
- Project files: product pages, pricing, account services, AI news or trend content.
- Human input: constraints, target customer, preferred product categories.

## Process
1. Read required weekly and monthly evidence.
2. Identify revenue, traffic, product, and data confidence gaps.
3. Group opportunities by user problem, time to ship, evidence strength, and revenue testability.
4. Rank product bets with explicit assumptions.
5. Draft validation steps before recommending large implementation work.
6. Generate Codex tasks only for concrete PRD, page, copy, or measurement work.

## Output Format
Return Markdown with:
- Evidence used.
- Product priority ranking.
- Revenue validation plan.
- Risks and assumptions.
- Next product PRD draft.
- Codex tasks when concrete.

## Quality Checklist
- Weekly and monthly evidence are cited or marked missing.
- Product bets include validation paths.
- Revenue claims are evidence-backed.
- Assumptions are labeled.
- Recommendations are small enough to execute.

## Guardrails
- Do not promise revenue.
- Do not fabricate market demand or user data.
- Do not modify pricing, payments, or production product pages unless explicitly asked.
- Do not output secrets.
- Missing revenue evidence must lower confidence.

## Example Prompts
- Use EBOS growth-product-manager to decide next week's product priority.
- Use EBOS growth-product-manager to draft a revenue validation plan.
- Use EBOS growth-product-manager to create the next AI product PRD draft.
