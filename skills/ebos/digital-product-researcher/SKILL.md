---
name: digital-product-researcher
description: Research ENHE AI digital product opportunities such as AI agents, AI video, AI voice, SEO tools, automation templates, prompt kits, and workflow packs. Use when Codex needs opportunity lists, product opportunity scores, or product candidates.
---

# Digital Product Researcher

## Purpose
Identify and score AI digital product opportunities that ENHE can validate or launch.

## When to Use
- The user asks what AI digital product opportunity to pursue.
- Monthly review needs market opportunity expansion.
- ENHE needs candidates for workflow packs, prompt kits, automation templates, or AI tools.
- Product strategy needs evidence-backed research framing.

## Required Inputs
- EBOS evidence: `monthly_review`.
- Optional evidence: `market_evidence`, `competitor_evidence`, `product_evidence`.
- Project files: product pages, AI trends, AI news, tutorials.
- Human input: target audience, price range, shipping constraints.

## Process
1. Read monthly review evidence and optional market or competitor evidence.
2. Extract opportunity themes and target user jobs.
3. Generate product candidates only from evidence-backed or clearly labeled assumptions.
4. Score each candidate by demand signal, fit, speed to ship, differentiation, and revenue testability.
5. Recommend validation steps before full build.
6. Create Codex tasks for PRD, landing page draft, or evidence generation when concrete.

## Output Format
Return Markdown or JSON with:
- Opportunity list.
- Product opportunity score.
- Product candidates.
- Evidence and assumptions.
- Validation tasks.

## Quality Checklist
- Monthly evidence is cited.
- Optional market evidence is labeled if missing.
- Each candidate has a user problem.
- Scores explain tradeoffs.
- No demand is invented.

## Guardrails
- Do not claim market demand without evidence.
- Do not scrape external sources unless authorized.
- Do not output secrets.
- Do not turn speculative ideas into build tasks without validation.
- Mark confidence for each candidate.

## Example Prompts
- Use EBOS digital-product-researcher to find AI product opportunities for ENHE.
- Score AI Agent, AI video, AI voice, SEO tool, and workflow pack ideas.
- Create product candidates from monthly review evidence.
