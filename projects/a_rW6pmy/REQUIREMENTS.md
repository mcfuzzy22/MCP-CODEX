# EPIC 02: Rotary Builder MVP (Concrete)

## Product Goal
Implement a functional Rotary Builder UI (replacing the current home page) connected to in-memory backend stubs. The builder lets users configure a rotary engine build by selecting parts, viewing completion, cost, and warnings in real time.

## Target Users
- Internal team members and stakeholders evaluating the Rotary Builder concept.
- Future end-users (e.g., engine builders/enthusiasts) as early prototype users.

## In-Scope
- Blazor WebAssembly app changes inside `app/` only.
- Frontend UI:
  - New Rotary Builder landing page as the home page.
  - Dedicated builder page at `/builder/{buildId}`.
  - Real-time UI state updates when selecting/deselecting parts.
- Backend (stubbed, in-memory only):
  - Build creation and retrieval.
  - Managing part selections for a build.
  - Returning computed metrics (summary, completion, cost, warnings).
- Documentation:
  - Update `docs/API.md` with example payloads for each new endpoint.
  - Update `logs/CHANGELOG.md` with a summary line for this run.
  - Add root-level `README.md` with setup and run instructions.
- Data:
  - Static category tree (10 categories).
  - Static parts JSON for each category.
  - Static warnings list is acceptable for MVP, but must update based on selection actions where appropriate.

## Out of Scope / Constraints
- NO authentication.
- NO scraping.
- NO 3D rendering.
- Do not modify unrelated dashboard simulation features.
- Do not create new `frontend/` or `backend/` folders.
- Work only inside the existing `app/` folder for the Blazor app implementation.
- Project structure constraints:
  - Use and update existing Blazor files such as:
    - `app/Program.cs`
    - `app/Pages/*`
    - `app/wwwroot/*`
- Must support running the Blazor app locally via `dotnet run` in `app/`.

## Key Features

### 1. Rotary Builder Landing (Home Page)
- The app’s home page becomes the Rotary Builder landing page.
- Displays:
  - Engine family selector (basic dropdown or similar control).
  - A prominent “Create Build” action.
- Behavior:
  - Clicking “Create Build” calls `POST /api/builds`.
  - On success, navigates to `/builder/{buildId}`.

### 2. Builder Page: `/builder/{buildId}`
Main layout:
- Left rail: CategoryTree
  - Shows 10 categories in a tree or flat list (static seeded list acceptable).
  - Selecting a category updates the center panel.
- Center panel: PartsList
  - Lists parts for the selected category from static JSON.
  - Allows selecting/deselecting parts.
- Right rail: SummaryRail + WarningsPanel
  - Displays:
    - Completion percentage (selected vs required parts).
    - Total build cost (sum of selected part prices).
    - Warnings list (static examples OK, but must respond to write actions data).

### 3. Real-time State Updates
- Selecting/deselecting parts:
  - Updates completion %, total cost, and warnings immediately without full page refresh.
  - Uses Blazor component state and/or API calls to stub endpoints.
- Write actions (selection changes) must return:
  - `{ summary, completion, cost, warnings }` (shape to be defined in API docs).

### 4. Backend Stub Endpoints
Stubbed, in-memory storage only (no external DB):

- `POST /api/builds`
  - Creates a new build with default state.
  - Returns build ID and initial summary/metrics.
- `GET /api/builds/:id`
  - Returns build details including:
    - Engine family.
    - Selected parts.
    - Available categories/parts (or references to static lists).
    - Summary, completion, cost, warnings.
- `POST /api/builds/:id/selections`
  - Accepts selection changes for parts (e.g., add/update).
  - Recomputes completion, cost, warnings.
  - Returns `{ summary, completion, cost, warnings }`.
- `DELETE /api/builds/:id/selections`
  - Accepts info to remove/reset selections.
  - Recomputes metrics.
  - Returns `{ summary, completion, cost, warnings }`.

## Non-Functional Requirements
- Local development:
  - Clear instructions in root `README.md` for:
    - Installing prerequisites.
    - Running via `dotnet run` inside `app/`.
- Performance:
  - Real-time feeling for part selection updates (no full-page reloads).
  - Reasonable responsiveness for UI state changes with in-memory data.
- Code Quality:
  - Clean separation of components:
    - `BuilderPage`
    - `CategoryTree`
    - `PartsList`
    - `SummaryRail`
    - `WarningsPanel`
  - Do not break or refactor unrelated dashboard functionality.
- Testing:
  - Define clear acceptance criteria and manual test steps in `TEST.md`.
  - Tester should be able to validate all acceptance criteria using the documented steps.

---
