# EPIC 02: Builder MVP – Agent Tasks

---

## Designer

### Project Name
Rotary Builder MVP (EPIC 02)

### Required Deliverables
- `README.md` (root)
  - Clear description of the Rotary Builder MVP.
  - Setup and run instructions for local development.
- UX Specifications (embedded as comments / notes or in existing docs as appropriate)
  - High-level layout guidance for:
    - Home (Rotary Builder landing) page.
    - `/builder/{buildId}` page layout: left rail, center, right rail.
- Visual Behavior Notes
  - Interaction/visual cues for:
    - Engine family selector and “Create Build”.
    - Category selection.
    - Part selection.
    - Summary and warnings visibility.

### Key Technical Notes & Constraints
- Blazor WebAssembly project; no separate design system introduction unless aligns with existing styles in `app/wwwroot/`.
- Must preserve the look and behavior of existing dashboard features; new builder styles should not globally override them.
- Ensure designs map cleanly to the following components:
  - `BuilderPage` (page-level layout and responsive behavior).
  - `CategoryTree` (left rail navigation).
  - `PartsList` (center panel).
  - `SummaryRail` (metrics panel).
  - `WarningsPanel` (warnings list).
- Keep structure simple and consistent with Blazor component conventions used in `app/Pages/*`.

---

## Frontend

### Project Name
Rotary Builder MVP (EPIC 02)

### Required Deliverables
- Blazor Components/Pages (in `app/`):
  - `app/Pages/BuilderPage.razor`
    - Handles routing for `/builder/{buildId}`.
    - Or integrates into existing routing file (e.g., `App.razor` / router setup).
  - `app/Components/CategoryTree.razor` (or `app/Pages/...` if components folder not used)
    - Left rail category list/tree with 10 static categories.
  - `app/Components/PartsList.razor`
    - Center panel listing parts for the selected category, using static JSON or equivalent.
  - `app/Components/SummaryRail.razor`
    - Right panel summarizing completion percentage and cost.
  - `app/Components/WarningsPanel.razor`
    - Right panel showing warnings list.
- Static Data (if stored client-side):
  - JSON file(s) in `app/wwwroot/` for categories and parts, or equivalent C# static seed.
- Home Page Updates:
  - Modify the existing home page (e.g., `Index.razor` or equivalent) into the Rotary Builder landing page.
- Documentation:
  - Contribute to `README.md` for how to run the app and basic feature overview.

### Key Technical Notes & Constraints
- Blazor WebAssembly app:
  - Use standard Blazor routing to map `/builder/{buildId}` to `BuilderPage`.
  - Use dependency injection and HttpClient for API calls to the stubbed backend endpoints.
- State Management:
  - Keep selected engine family, categories, and parts in appropriate component or cascading state.
  - Ensure part selections update UI instantly: use local state updates plus API calls as needed.
- API Integration:
  - Connect UI interactions to backend stubs:
    - `POST /api/builds` from home “Create Build” button.
    - `GET /api/builds/:id` when loading `BuilderPage`.
    - `POST /api/builds/:id/selections` and `DELETE /api/builds/:id/selections` for selections updates.
- Constraints:
  - Work only within `app/` for code changes.
  - Do not create `frontend/` or `backend/` subfolders.
  - Do not break or refactor unrelated dashboard simulation features.

---

## Backend

### Project Name
Rotary Builder MVP (EPIC 02)

### Required Deliverables
- Stubbed API Endpoints (in Blazor host / server or appropriate API project linked to `app/`):
  - `POST /api/builds`
    - Creates an in-memory build entity.
    - Returns build ID and initial metrics.
  - `GET /api/builds/:id`
    - Returns build details for the given ID.
  - `POST /api/builds/:id/selections`
    - Accepts part selection changes and updates in-memory build data.
    - Returns `{summary, completion, cost, warnings}`.
  - `DELETE /api/builds/:id/selections`
    - Clears or updates selections.
    - Returns `{summary, completion, cost, warnings}`.
- In-Memory Data Model:
  - Structures to store:
    - Builds (ID, engine family, selections).
    - Part catalog (categories, parts, prices, required flags).
  - Logic to compute:
    - Completion % = (selected required parts / total required parts) * 100 (or defined rule).
    - Total cost = sum of selected parts’ prices.
    - Warnings = static + any selection-based logic.
- Documentation:
  - Update `docs/API.md`:
    - Endpoint descriptions.
    - Request/response examples with JSON payloads.
  - Update `logs/CHANGELOG.md`:
    - Summary line describing this Builder MVP implementation.

### Key Technical Notes & Constraints
- Implementation should align with the existing Blazor architecture:
  - If there is a hosted ASP.NET Core backend, add controllers or minimal APIs for the routes under `/api/`.
  - Ensure endpoints are reachable from the Blazor WebAssembly front-end.
- In-Memory Only:
  - No external database; store data in static or scoped in-memory collections.
  - Keep it simple but deterministic enough for tests.
- Response Schema:
  - `summary`: short textual or structured overview of current build.
  - `completion`: numeric value or object representing completion %.
  - `cost`: numeric total.
  - `warnings`: array/list of warning messages/objects.
- Maintain compatibility:
  - Do not alter or break existing dashboard endpoints or logic.
  - Keep new logic isolated to builder-related namespaces/files where possible.

---

## Tester

### Project Name
Rotary Builder MVP (EPIC 02)

### Required Deliverables
- Validation of all criteria in `TEST.md`:
  - Mark or track pass/fail status for each test case.
- Confirmed Documentation:
  - Verify `README.md` has correct run instructions.
  - Verify `docs/API.md` matches actual behavior.
  - Verify `logs/CHANGELOG.md` contains a new summary line for this run.
- Test Artifacts (optional but recommended):
  - Notes or screenshots for critical flows (home page, builder page, error cases).

### Key Technical Notes & Constraints
- Environment Setup:
  - Use `dotnet run` inside the `app/` directory to run the application.
  - Test using supported browsers for Blazor WebAssembly (e.g., latest Chrome/Edge/Firefox).
- Scope of Testing:
  - Focus on:
    - New Rotary Builder landing page and `/builder/{buildId}`.
    - API correctness for the four new endpoints.
    - Real-time UI updates for selections, completion, cost, warnings.
  - Also confirm that existing dashboard simulation features are not regressed.
- How to Test Endpoints:
  - Use browser dev tools, `curl`, or a REST client (e.g., Postman) to inspect API traffic.
  - Validate the presence and behavior of:
    - `POST /api/builds`
    - `GET /api/builds/:id`
    - `POST /api/builds/:id/selections`
    - `DELETE /api/builds/:id/selections`
