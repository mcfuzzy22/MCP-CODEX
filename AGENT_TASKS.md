# AGENT TASKS (Rotary Engine Builder)

## Product Architect (PM)
Deliverables:
- /docs/VISION.md (why/what)
- /docs/ROADMAP.md (epics with milestones)
- /docs/SCOPE_GUARDRAILS.md
- /docs/DECISIONS.md entries for scope changes

## Domain Expert (Rotary)
Deliverables:
- /docs/DOMAIN_ROTARY.md with:
  - subsystem list
  - minimum required components per subsystem
  - common failure modes + warnings text
- seed “truth tables” for required counts (especially anything formula-based)

## Data Modeler
Deliverables:
- /docs/DATA_MODEL.md expanded with columns + indexes
- /docs/RULES_ENGINE.md expanded with rule DSL + examples
- /db/migrations with runnable schema
- /db/seeds with a minimal dataset

## Backend Engineer
Deliverables:
- /docs/API.md expanded with endpoint list + payloads
- Implement endpoints:
  - build CRUD
  - add/remove selection
  - summary/completion/cost/warnings
- Ensure write endpoints return {summary, completion, cost, warnings}

## Frontend Engineer
Deliverables:
- /docs/UI_UX.md expanded with component map + states
- Implement builder page:
  - category tree
  - parts list + filters
  - summary rail
  - warnings panel

## Ingestion Agent
Deliverables:
- /docs/INGESTION.md expanded with CSV templates + validation rules
- scripts to import parts and vendor offerings
- normalization rules

## QA Agent
Deliverables:
- /docs/RUNBOOK.md expanded with “how to verify”
- tests/TEST_PLAN.md + acceptance tests
