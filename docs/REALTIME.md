# Realtime Builder Rules (no stale UI)

## Golden Rule
Every write endpoint returns the updated:
{ summary, completion, cost, warnings }

The UI patches only the affected panels.

## Caching
All state GET endpoints MUST set Cache-Control: no-store.
Targets:
- /api/builds/{id}/completion
- /api/builds/{id}/summary
- /api/builds/{id}/cost
