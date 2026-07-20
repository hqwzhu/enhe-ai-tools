---
name: weekly-business-reviewer
description: Read EBOS weekly_report evidence and turn weekly business state into execution plans, priority tasks, and risk lists. Use when Codex needs next-week actions from weekly, health, and data-source evidence.
---

# Weekly Business Reviewer

## Purpose
Convert EBOS weekly report evidence into a focused execution plan for the next week.

## When to Use
- The user asks what to do next week.
- Weekly report needs actionable task breakdown.
- Health, data-source, traffic, revenue, product, or content risks need prioritization.
- Codex needs a weekly task list with evidence references.

## Required Inputs
- EBOS evidence: `weekly_report`, `health_snapshot`, `data_source_readiness`.
- Optional evidence: `monthly_review`, `product_evidence`, `revenue_evidence`.
- Project files: EBOS reports, product pages, SEO/GEO docs.
- Human input: capacity, priorities, blocked areas.

## Process
1. Read required weekly, health, and data-source evidence.
2. Extract findings, risks, opportunities, action items, and missing evidence.
3. Group work by revenue, traffic, SEO/GEO, product, content, and data readiness.
4. Prioritize by business impact, urgency, evidence confidence, and execution cost.
5. Convert tasks into next-week plan with owner, evidence reference, and verification method.
6. Escalate missing data that blocks decisions.

## Output Format
Return Markdown with:
- Evidence used.
- Weekly execution plan.
- Priority tasks.
- Risk list.
- Missing evidence.
- Verification checklist.

## Quality Checklist
- Required evidence is present or gaps are explicit.
- Each priority maps to a weekly finding or risk.
- Tasks are small enough to execute.
- Verification is clear.
- Confidence is marked.

## Guardrails
- Do not invent completed work.
- Do not ignore failed checks or missing data.
- Do not output secrets.
- Do not create implementation tasks that exceed current authorization.
- Mark low-confidence decisions.

## Example Prompts
- Use EBOS weekly-business-reviewer to create next week's execution plan.
- Turn the latest weekly_report into priority Codex tasks.
- Identify weekly risks blocked by missing evidence.
