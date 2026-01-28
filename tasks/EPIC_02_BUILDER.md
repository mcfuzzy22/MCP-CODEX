# EPIC 02: Builder MVP (Concrete)

## Goal
Implement the actual rotary builder UI (not the dashboard demo) and wire it to stubbed endpoints.

## Scope
Frontend + backend stubs + working UI state updates.
NO auth. NO scraping. NO 3D.

## Acceptance Criteria (must all pass)
- [ ] Home page becomes Rotary Builder landing page (engine family selector + “Create Build”)
- [ ] New page: /builder/{buildId}
- [ ] Left rail category tree shows 10 categories (seeded static list OK for now)
- [ ] Center panel lists parts for selected category (static JSON OK for now)
- [ ] Right rail shows:
  - completion % (computed from selected vs required)
  - cost (sum of selected part prices)
  - warnings list (static examples OK for now)
- [ ] Selecting a part updates completion/cost/warnings instantly without refresh
- [ ] Write actions return {summary, completion, cost, warnings}

## Deliverables
- Frontend components/pages:
  - BuilderPage
  - CategoryTree
  - PartsList
  - SummaryRail
  - WarningsPanel
- Backend endpoints (stubbed in-memory OK):
  - POST /api/builds
  - GET /api/builds/:id
  - POST /api/builds/:id/selections
  - DELETE /api/builds/:id/selections
- Docs:
  - Update docs/API.md with payload examples
  - Update logs/CHANGELOG.md with run summary

## Hard Rules
- Don’t “describe” what you would do. Implement it.
- Don’t modify unrelated dashboard simulation features.
