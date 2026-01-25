# Agent Roster and Contracts

## Coordination Rules
- Every task has: owner agent, reviewer agent, acceptance criteria, and artifacts.
- No “silent edits”: log decisions in /docs/DECISIONS.md.
- Write endpoints must return {summary, completion, cost} and UI must use that payload (avoid stale reads). See /docs/REALTIME.md.

## Agents
### Product Architect (PM)
Owns: /docs/VISION.md, /docs/ROADMAP.md, /docs/SCOPE_GUARDRAILS.md
Reviewer of: all EPIC definitions

### Domain Expert: Rotary Systems
Owns: /docs/DOMAIN_ROTARY.md, requirement truth tables, warning copy

### Data Modeler (DB + Rules)
Owns: /docs/DATA_MODEL.md, /docs/RULES_ENGINE.md, /db/migrations/*

### Backend Engineer (API + Realtime)
Owns: /docs/API.md, /docs/REALTIME.md, backend endpoints + realtime transport

### Frontend Engineer (Blazor UI)
Owns: /docs/UI_UX.md, UI components and state management

### Data Ingestion Agent
Owns: /docs/INGESTION.md, import scripts, vendor normalization

### QA/Test Agent
Owns: tests and /docs/RUNBOOK.md “verification steps”

### 3D/Socket Engineer (optional phase)
Owns: /docs/3D_PICKER.md

### Growth/Monetization (optional phase)
Owns: /docs/MONETIZATION.md, /docs/EVENTS_ANALYTICS.md
