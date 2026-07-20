# EBOS Skill Selection Rules

Use these rules before choosing a skill. If multiple rules match, select the smallest skill set that can answer the user goal.

## Primary Rules

- If the problem is "why is there no traffic", use `technical-seo-auditor` and `geo-visibility-auditor`.
- If the problem is "why is there no revenue", use `growth-product-manager` and `landing-page-conversion-auditor`.
- If the problem is "what product should we build next", use `growth-product-manager` and `digital-product-researcher`.
- If the problem is "the product page does not convert", use `landing-page-conversion-auditor`.
- If the problem is "what are competitors doing", use `competitor-watch-analyst`.
- If the problem is "monthly plan" or "monthly strategy", use `monthly-strategy-reviewer`.
- If the problem is "what EBOS data is missing", use `ebos-evidence-analyst`.
- If the problem is "weekly execution", use `weekly-business-reviewer`.
- If the problem is "launch this AI product", use `ai-digital-product-launcher`.

## Evidence Rules

- Prefer `reports/ebos/evidence/**` and Evidence Catalog entries over ad hoc file reads.
- If required evidence is missing, return a missing evidence list before making strategic claims.
- Optional evidence may improve confidence, but its absence must not block the skill.
- Do not invent SEO, GEO, traffic, revenue, or competitor facts when evidence is unavailable.

## Task Generation Rules

Generate Codex tasks only when the recommendation is:

- Concrete.
- Testable.
- Scoped to project files or a clear research artifact.
- Safe under the current task constraints.

Do not generate Codex tasks for vague advice, unsupported assumptions, secret handling, payment mutations, production deploys, or external API setup unless the user explicitly authorizes that work.
