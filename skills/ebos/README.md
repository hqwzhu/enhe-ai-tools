# EBOS Codex Skill Library

EBOS Skill Library is the operating capability library for Codex inside ENHE Business OS. It is not a normal documentation folder. Each skill defines a repeatable way to turn EBOS evidence, project files, and human goals into business execution outputs.

Use this library when Codex needs to plan or execute SEO/GEO work, product opportunity research, competitor analysis, landing page conversion audits, digital product launches, weekly execution plans, monthly strategy reviews, or evidence gap analysis.

Every skill must define:

- When to use it.
- Required inputs.
- Expected outputs.
- Step-by-step process.
- Quality checklist.
- Guardrails.
- When to reference the EBOS Evidence Catalog.
- When to generate Codex tasks.

Core rules:

- Do not fabricate data.
- Do not read or print secret values.
- Do not modify business code unless the active task explicitly authorizes implementation.
- Mark confidence when evidence is incomplete.
- Prefer EBOS evidence files over memory or assumptions.
- Convert recommendations into Codex tasks only when the next action is concrete and testable.

Registry:

- JSON registry: `skills/ebos/skill-registry.json`
- TypeScript registry: `src/lib/ebos/skills/skill-registry.ts`
- Selection rules: `skills/ebos/skill-selection-rules.md`
