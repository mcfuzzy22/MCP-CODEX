# EPIC 02: Builder MVP – Test Plan

## Legend
- [Designer] – UX / visual checks
- [Frontend] – UI behavior checks
- [Backend] – API / data checks
- [Tester] – Main owner executing and validating

---

## 1. Home Page Becomes Rotary Builder Landing

### 1.1 Home page layout and content
- [Designer][Tester]
- Steps:
  1. Run the app (`dotnet run` in `app/`).
  2. Open the app root URL in a browser.
- Acceptance Criteria:
  - The initial page is clearly a “Rotary Builder” landing page.
  - The page contains an “Engine family” selector (dropdown or equivalent).
  - There is a prominent “Create Build” button or CTA.
  - No previous dashboard-only landing page is visible or conflicting.

### 1.2 Create Build navigation behavior
- [Frontend][Backend][Tester]
- Steps:
  1. On the landing page, choose an engine family (if required).
  2. Click “Create Build”.
- Acceptance Criteria:
  - A `POST /api/builds` request is sent.
  - The app navigates to `/builder/{buildId}` where `buildId` is the ID returned by the API.
  - No full browser refresh is required for navigation (Blazor routing).

---

## 2. Builder Page Routing: `/builder/{buildId}`

### 2.1 Route configuration and rendering
- [Frontend][Tester]
- Steps:
  1. Manually navigate to `/builder/test-id` in the browser (after app is running).
- Acceptance Criteria:
  - The URL `/builder/{buildId}` is recognized by Blazor routing.
  - `BuilderPage` component is rendered without runtime errors.
  - If `buildId` is invalid, the UI displays an appropriate error or “build not found” message.

### 2.2 Loading initial build data
- [Frontend][Backend][Tester]
- Steps:
  1. Create a build via the landing page.
  2. Confirm that `/builder/{buildId}` loads initial build data.
- Acceptance Criteria:
  - `GET /api/builds/:id` is called when `BuilderPage` loads.
  - The UI shows initial selections, completion %, cost, and warnings consistent with stubbed data.

---

## 3. Left Rail Category Tree (10 Categories)

### 3.1 Category tree presence and count
- [Designer][Frontend][Tester]
- Steps:
  1. On `/builder/{buildId}`, inspect the left rail.
- Acceptance Criteria:
  - There is a clearly defined CategoryTree component or equivalent.
  - Exactly 10 categories are visible (static seeded list is acceptable).
  - Category labels are readable and visually distinct as a list or tree.
  - Selecting a category indicates active state (highlight, selected styling, or similar).

### 3.2 Category selection behavior
- [Frontend][Tester]
- Steps:
  1. Click on multiple different categories in the left rail.
- Acceptance Criteria:
  - The active category state visually updates as categories are clicked.
  - The center panel’s parts list updates to show the selected category’s parts.
  - No full page reload occurs.

---

## 4. Center Panel PartsList

### 4.1 Static parts data display
- [Frontend][Backend][Tester]
- Steps:
  1. With various categories selected, inspect the center panel.
- Acceptance Criteria:
  - The PartsList component renders parts for the active category.
  - Data is sourced from static JSON or static in-memory data (as implemented).
  - Each part displays at least:
    - Name
    - Price
    - Any selection control (checkbox, radio, button, etc.).

### 4.2 Part selection/deselection
- [Frontend][Tester]
- Steps:
  1. For multiple parts in the visible list, toggle their selection status.
- Acceptance Criteria:
  - UI clearly shows selected vs unselected states per part.
  - Selected parts remain selected when interacting with other UI regions.
  - Selections survive simple UI re-render events (e.g., changing category and returning, if supported by data model).

---

## 5. Right Rail: SummaryRail and WarningsPanel

### 5.1 Summary metrics display
- [Designer][Frontend][Tester]
- Steps:
  1. On the builder page, inspect the right rail.
- Acceptance Criteria:
  - SummaryRail shows:
    - Completion percentage.
    - Total cost of the build.
  - WarningsPanel shows a list of warnings (can be static examples at first).
  - Layout is visually coherent with clear labels.

### 5.2 Metric and warnings behavior on selection changes
- [Frontend][Backend][Tester]
- Steps:
  1. Select and deselect parts across one or more categories.
  2. Observe right rail metrics.
- Acceptance Criteria:
  - Completion percentage updates immediately after part selection changes.
  - Total cost updates immediately based on selected parts’ prices.
  - Warnings list updates in response to selection changes where implemented, or otherwise remains consistent with stubbed logic.
  - No full page reload occurs during these updates.

---

## 6. Real-time Updates & API Contracts

### 6.1 UI updates without full refresh
- [Frontend][Tester]
- Steps:
  1. Perform several rapid part selections and deselections.
- Acceptance Criteria:
  - UI remains responsive.
  - No browser-level full page reloads occur.
  - Only relevant components re-render (Blazor behavior).

### 6.2 Write actions response shape
- [Backend][Tester]
- Steps:
  1. Using browser dev tools or a REST client, call:
     - `POST /api/builds/:id/selections`
     - `DELETE /api/builds/:id/selections`
  2. Make valid payload requests according to `docs/API.md`.
- Acceptance Criteria:
  - Both endpoints respond with a JSON object containing:
    - `summary`
    - `completion`
    - `cost`
    - `warnings`
  - Fields are present and data types are consistent with API documentation.

---

## 7. Backend Stub Endpoints

### 7.1 POST /api/builds
- [Backend][Tester]
- Steps:
  1. Send `POST /api/builds` without body or with minimal required payload (per docs).
- Acceptance Criteria:
  - Endpoint returns HTTP 200 or 201 (as designed).
  - Response includes:
    - A unique `id` (buildId).
    - Initial summary/metrics consistent with defaults.
  - In-memory structures allow subsequent `GET /api/builds/:id`.

### 7.2 GET /api/builds/:id
- [Backend][Tester]
- Steps:
  1. Create a build.
  2. Call `GET /api/builds/{id}`.
- Acceptance Criteria:
  - Endpoint returns HTTP 200 for valid ID.
  - Payload includes:
    - Engine family.
    - Current selected parts.
    - Completion percentage, cost, warnings.
  - Returns 404 or clear error for unknown build ID.

### 7.3 POST /api/builds/:id/selections
- [Backend][Tester]
- Steps:
  1. For a known build ID, send a POST with part selection changes.
- Acceptance Criteria:
  - Endpoint returns success (HTTP 200/204 with body).
  - Selections are persisted in in-memory storage for that build.
  - Response body includes correct `{summary, completion, cost, warnings}`.
  - Subsequent `GET /api/builds/:id` reflects updated selections and metrics.

### 7.4 DELETE /api/builds/:id/selections
- [Backend][Tester]
- Steps:
  1. For a build with existing selections, send `DELETE /api/builds/:id/selections`.
- Acceptance Criteria:
  - Endpoint resets or removes selections according to spec.
  - Response includes updated `{summary, completion, cost, warnings}`.
  - Subsequent `GET /api/builds/:id` shows cleared or reduced selections.

---

## 8. Documentation Updates

### 8.1 API documentation
- [Backend][Tester]
- Steps:
  1. Open `docs/API.md`.
- Acceptance Criteria:
  - New endpoints are documented:
    - `POST /api/builds`
    - `GET /api/builds/:id`
    - `POST /api/builds/:id/selections`
    - `DELETE /api/builds/:id/selections`
  - Each has at least one request and response payload example.
  - Documentation matches actual behavior and field names.

### 8.2 CHANGELOG entry
- [Tester]
- Steps:
  1. Open `logs/CHANGELOG.md`.
- Acceptance Criteria:
  - A new summary line is added describing this EPIC 02 Builder MVP run.
  - Entry includes date or identifying version/tag as per existing format.
  - No unrelated previous entries are modified.

### 8.3 Root README
- [Designer][Frontend][Tester]
- Steps:
  1. Open root-level `README.md`.
- Acceptance Criteria:
  - README exists in project root.
  - Contains clear setup instructions:
    - Prerequisites (e.g., .NET SDK version).
    - How to run the Blazor app locally via `dotnet run` in `app/`.
  - Mentions the Rotary Builder home page and `/builder/{buildId}` behavior.

---

## 9. Regression: Dashboard Simulation Isolation

### 9.1 Unrelated dashboard features unchanged
- [Frontend][Tester]
- Steps:
  1. Navigate to previous dashboard-related routes/pages.
  2. Execute any existing simulations or interactions.
- Acceptance Criteria:
  - Existing dashboard functionality works as before.
  - No unexpected UI or logic regressions.
  - No obvious coupling between the new Builder MVP and dashboard-only features.

---
