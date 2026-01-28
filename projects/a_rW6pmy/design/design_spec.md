Rotary Builder MVP – UX / UI Design Spec
=======================================

Project Context
---------------
EPIC: EPIC 02 – Rotary Builder MVP  
App Type: Blazor WebAssembly (UI changes inside `app/` only)

This spec defines the UX, layout, and interaction patterns for:

- Home (Rotary Builder landing) page – replaces existing home.
- Builder page `/builder/{buildId}` – 3-column layout:
  - Left: `CategoryTree`
  - Center: `PartsList`
  - Right: `SummaryRail` + `WarningsPanel`

Design Goals
------------

- Make “Create Build” the primary CTA on the home page.
- Keep the UI simple, grid-based, and easy to map to Blazor components.
- Provide “real-time-feeling” feedback (no full page reloads) when parts are selected.
- Keep new styles scoped to builder components to avoid impacting existing dashboard areas.

Global Visual Language (High-Level)
-----------------------------------

- Layout: Simple, responsive, single-page views with 12-column style mental model.
- Colors / Typography:
  - Reuse existing app base font and colors where possible (inherit from existing `app/wwwroot/` styles).
  - Introduce new styles via classnames scoped to builder components (e.g., `.rb-...`) to avoid global overrides.
- UI Density:
  - Medium density: tabular center panel, simple list in left rail, compact cards on right rail.
- Iconography:
  - Optional, not required by MVP. Prefer text labels; add icons only if existing icon set is already in use.

---

Home Page – Rotary Builder Landing
==================================

Route & Component Mapping
-------------------------

- File: `app/Pages/Index.razor` (or existing home page) becomes the Rotary Builder landing page.
- It should function as a simple, focused “start screen” for builds.

Layout Structure
----------------

Vertical layout (top to bottom):

1. **Header / Page Title**
   - Text: “Rotary Builder” (or “Rotary Engine Builder”).
   - Optional subtitle: Short description (e.g., “Configure a rotary engine build and see completion, cost, and warnings in real time.”).
   - Left-aligned, with spacing below.

2. **Engine Family Selector**
   - Label: “Engine family”
   - Control: Single-select dropdown (e.g., `<select>` or Blazor `InputSelect`).
   - Options: A small static set (e.g., “13B”, “20B”, “12A”, “Other”) — exact list to be defined by implementation, doesn’t affect UX.
   - Default behavior:
     - Default selection can be “Select an engine family…” (placeholder) or a sensible default.
     - If placeholder is used, “Create Build” should be disabled until a valid selection is chosen.
   - Visual behavior:
     - Standard input styling with clear focus/hover states following existing app conventions.

3. **Primary Action Area**
   - Primary button: “Create Build”
   - Visual prominence:
     - Solid, primary-colored button (use app’s existing primary button style).
     - Placed near the engine family selector (same row on wide screens, stacked on narrow).
   - Behavior:
     - On click, triggers `POST /api/builds` with selected engine family.
     - Disabled state:
       - Disabled if:
         - No engine family selected (if placeholder pattern used).
         - A request is in-flight (to prevent double submit).
     - Loading state:
       - Optional small spinner / text change (e.g., “Creating…”).
   - Secondary link or text (optional):
     - Short helper text like “You’ll be taken to the builder to choose parts” below the button.

4. **Informational Panel (Optional but Recommended)**
   - Below the primary action, a light panel/card that explains:
     - Step 1: Choose engine family & create a build.
     - Step 2: Select parts by category.
     - Step 3: Monitor completion, cost, and warnings.
   - Purpose: Onboard internal stakeholders quickly.

Interaction & Visual Behavior
-----------------------------

- **Create Build success**
  - On success, navigate to `/builder/{buildId}` using the id returned from `POST /api/builds`.
- **Create Build failure**
  - Show a non-intrusive error message near the button or at the top of the panel (e.g., a red text line).
  - Keep current selections; allow retry.
- **Responsiveness**
  - Desktop:
    - Engine family dropdown and “Create Build” button can sit in one row: dropdown (left, wider) and button (right).
  - Mobile / narrow width:
    - Stack vertically: engine family selector, then button, each full-width.

---

Builder Page – `/builder/{buildId}`
===================================

Route & Component Mapping
-------------------------

- Page-level component:
  - `app/Pages/BuilderPage.razor`
  - Routed as `/builder/{buildId}` via Blazor routing.
- Child components:
  - `CategoryTree` – left rail navigation.
  - `PartsList` – center content.
  - `SummaryRail` – right metrics.
  - `WarningsPanel` – right warnings list (stacked with SummaryRail).

High-Level Layout
-----------------

Three-column responsive layout:

- Left Rail: `CategoryTree` (fixed-ish width, e.g., 20–25% on desktop).
- Center Panel: `PartsList` (flexible width, primary focus).
- Right Rail: `SummaryRail` (top) + `WarningsPanel` (bottom), sized ~25–30% on desktop.

On desktop, layout is side-by-side:
- [CategoryTree] | [PartsList] | [Summary + Warnings]

On mobile/tablet, collapse into vertical sections in this order:
1. Summary + Warnings (so high-level status is visible first).
2. CategoryTree (as a horizontal segment or toggleable section).
3. PartsList.

Page Header
-----------

- At the top of the builder page, above the three columns:
  - Title: “Build #<id>” or “Rotary Build”.
  - Secondary text: engine family name (if available from backend).
  - Optional: A subtle “Status: In Progress” label.
- Layout:
  - Align left; use similar styling to landing page title but slightly smaller.

Loading & Error States
----------------------

- Initial load (`GET /api/builds/:id`):
  - Show a centered loader/spinner in the center panel, while a light grey skeleton or placeholder is shown for side rails.
  - Hide parts list until data is ready.
- Error (e.g., invalid build ID or API failure):
  - Display an error banner at top of builder area:
    - Example text: “Unable to load this build. Please check the URL or try again.”
  - Optionally show a “Back to home” link.

---

Left Rail – CategoryTree Component
==================================

Purpose
-------

- Display the static list/tree of 10 categories.
- Allow user to switch between categories, which updates the `PartsList`.

Visual Structure
----------------

- Container:
  - A vertical panel with a title “Categories”.
  - Light background or border to distinguish from center panel.
- Category Items:
  - 10 items total; flat list is acceptable for MVP.
  - Each item shows:
    - Category name (e.g., “Core”, “Intake”, “Exhaust”, etc. – names defined by implementation).
    - Optional small indicator for completion in that category (recommended but not required):
      - E.g., a small dot or check icon if all required parts for that category are selected.
  - Text alignment: left.
  - Visual spacing: 8–12px vertical padding between items.

Interaction Behavior
--------------------

- Selection:
  - Clicking a category sets it as the “active category”.
  - The active category:
    - Has a distinct visual style (e.g., highlight background, bold label, left border accent).
- Hover / focus:
  - Hover state (desktop): subtle background highlight.
  - Focus outline (keyboard navigation) for accessibility.
- Initial State:
  - On first load, auto-select:
    - The first category in the static list, or
    - The last active category from build (if the API provides this – optional).
- Scrolling:
  - If the list height exceeds viewport height, the left rail should be scrollable vertically independent of the center panel.

Communication with Other Components
-----------------------------------

- `CategoryTree` notifies `BuilderPage` or shared state when:
  - Active category changes.
- `BuilderPage` passes to `PartsList`:
  - The current selected category ID or key.

---

Center Panel – PartsList Component
==================================

Purpose
-------

- Show parts available for the currently selected category.
- Allow users to select / deselect parts.
- Trigger recalculation of completion, cost, and warnings in real time.

Data & Layout
-------------

- Input data:
  - Category identifier (current selection).
  - Parts for that category (from static JSON or equivalent).
  - Current build selections (to mark which parts are already chosen).
- Visual structure:
  - Panel header:
    - Title: current category name.
    - Optional count: “X parts available”.
  - Main content:
    - Tabular layout or card list.
    - Suggested table columns:
      - Part Name
      - Description (short)
      - Price
      - Required (yes/no or indicator)
      - Selection control (checkbox or radio, depending on part rules).
    - Alternatively, cards if table styling is not available, but a table is preferred for clarity.

Selection Controls
------------------

- Common Pattern:
  - Use checkboxes for multi-select within category.
  - If certain categories require exactly one selected (like “core type”), use radio buttons for that category.
  - implementation can choose a simplified rule (e.g., all checkboxes) if business logic is not strict yet.
- Visual cues:
  - Selected row should be visually distinct:
    - Slightly shaded background.
    - Left border or check icon.
  - Required parts:
    - Indicator, e.g., “Required” badge or an asterisk near name.
- Price:
  - Right-aligned numeric values.
  - Include currency symbol (e.g., “$1,200.00”) if consistent with existing app patterns.

Interaction & API Behavior
--------------------------

- Selecting / Deselecting a Part:
  - Immediate local UI update:
    - Selection state (checkbox / radio) toggles instantly.
    - Row styling reflects selection state.
  - Then call appropriate endpoint:
    - Add/update selection: `POST /api/builds/:id/selections`
    - Remove selection: `DELETE /api/builds/:id/selections` (or reuse POST with appropriate payload – implementation choice).
  - On response:
    - Update:
      - Completion percentage (SummaryRail).
      - Total cost (SummaryRail).
      - Warnings list (WarningsPanel).
- Pending State:
  - While an update call is in-flight:
    - Option 1 (simple): keep UI interactive; handle last-write-wins behavior.
    - Option 2 (safer): temporarily disable controls for the affected row, show a tiny inline spinner.
  - Errors:
    - If selection update fails:
      - Revert the UI state for the affected part to its previous value.
      - Show a small inline error message (e.g., “Couldn’t update selection. Try again.”) or a toast.

Empty / Edge States
-------------------

- No parts for category:
  - Show a centered message: “No parts available for this category yet.”
- No selections:
  - All rows unselected; SummaryRail and WarningsPanel still visible but reflect empty state (e.g., 0% completion, $0.00 cost, “No warnings”).

---

Right Rail – SummaryRail & WarningsPanel
========================================

Layout
------

- Right rail container:
  - Fixed-width-ish column with vertical stack:
    1. SummaryRail (top)
    2. WarningsPanel (bottom)
  - Scroll behavior:
    - If content exceeds viewport height, right rail can scroll independently OR allow page-level scrolling with right rail pinned at top.

SummaryRail Component
---------------------

Purpose
- Present key metrics:
  - Completion percentage.
  - Total cost.
  - High-level summary text.

Visual Structure
- Container:
  - Card-style box with border and small shadow (if consistent with app style).
  - Title text: “Build Summary”.
- Inside content:
  1. **Completion**
     - Label: “Completion”
     - Value: “X% complete”
     - Visual bar:
       - Horizontal progress bar showing completion percentage (0–100%).
       - Use a simple colored filled bar with a neutral background track.
  2. **Total Cost**
     - Label: “Total Cost”
     - Value: `$X,XXX.XX`
     - Emphasized with larger font than labels.
  3. **Summary Text**
     - Short, dynamic sentence, e.g.,
       - “Selected 5 of 8 required parts.”
       - “Engine family: 13B | 12 parts selected.”

Interaction / Update Behavior
- Updated whenever selection API returns new metrics:
  - `completion`: updates the progress bar and displayed percentage.
  - `cost`: updates the total cost figure.
  - `summary`: updates the descriptive text.
- Loading state:
  - While waiting for initial `GET /api/builds/:id`:
    - Show skeleton placeholders or “Loading summary…”.
- Empty state:
  - If no selections yet:
    - completion: 0%
    - cost: $0.00
    - summary: e.g., “No parts selected yet. Start with a category on the left.”

WarningsPanel Component
-----------------------

Purpose
- Show warnings that reflect the current build’s state.

Visual Structure
- Container:
  - Card-style box below SummaryRail.
  - Title: “Warnings”.
- Content:
  - Warnings list:
    - Each warning as a bullet or row:
      - Icon or colored marker (optional) to indicate severity (e.g., warning vs info).
      - Short warning message text (1–2 lines).
  - Examples:
    - “Critical: Required apex seals not selected.”
    - “Info: You have selected multiple intake configurations.”

Interaction / Update Behavior
- Updates whenever the backend returns a new `warnings` list:
  - From:
    - Initial `GET /api/builds/:id`.
    - Any `POST`/`DELETE` to `/api/builds/:id/selections`.
- Empty state:
  - If there are no warnings:
    - Show low-key text: “No current warnings.” (or “All checks passed so far.”).
- Long list:
  - If warnings exceed a certain count (e.g., >5):
    - Limit visible height and allow scroll within panel.
    - Optionally show count in title: “Warnings (5)”.

Visual Severity Cues (optional but recommended)
- Color-coding:
  - Critical / Error: red border or icon.
  - Warning: amber.
  - Info: neutral/blue.
- If severity is not in API, assume single warning style (e.g., amber).

---

Real-Time State & Interaction Summary
=====================================

State Flow
----------

1. **Home Page**
   - User picks engine family.
   - User clicks “Create Build”.
   - App calls `POST /api/builds` and navigates to `/builder/{buildId}` on success.

2. **Builder Page Initial Load**
   - On navigation to `/builder/{buildId}`:
     - Call `GET /api/builds/:id` to fetch:
       - Engine family
       - Categories (or references)
       - Parts and existing selections
       - Initial summary, completion, cost, warnings.
   - UI populates:
     - Header: engine family & build label.
     - CategoryTree: 10 static categories.
     - PartsList: parts for default category.
     - SummaryRail & WarningsPanel: metrics and warnings.

3. **Part Selection / Deselection**
   - User toggles selection in `PartsList`.
   - UI immediately reflects the new selection state.
   - App calls selection endpoint to update backend.
   - On response:
     - `SummaryRail` updates completion %, total cost, summary text.
     - `WarningsPanel` updates warnings list.
   - In case of error:
     - Revert selection to previous state.
     - Show inline or rail-level error message.

Visual Behavior Notes (Specific Interactions)
=============================================

Engine Family Selector & “Create Build”
---------------------------------------

- Disabled “Create Build” when:
  - No engine family selected (if using placeholder).
  - A request is in progress.
- If engine family changes while on home:
  - It just updates local selection; no immediate API calls.
- On click:
  - Immediate feedback (button disabled or text changes).
  - On success: transition to builder page without showing intermediate blank page (Blazor navigation).
  - On failure: enable button again and show error text.

Category Selection
------------------

- Active category always clearly marked (highlight).
- Switching categories:
  - Updates `PartsList` to show the new category’s parts.
  - Does *not* change current summary/warnings unless a selection changes.
- Keyboard navigation:
  - Up/Down arrow to move between categories (if possible in Blazor; recommended but not required).
  - Enter/Space to activate a category.

Part Selection
--------------

- Click row or the specific checkbox/radio:
  - Toggling the control should:
    - Change the row style instantly.
    - Mark it as selected/unselected.
- Hover state:
  - Light highlight to indicate clickability.
- Required but unselected parts:
  - Could include a subtle “!” indicator or italic text in the row, but minimal for MVP.
- If a part is disabled (e.g., due to incompatible combination; future enhancement):
  - Greyed out, no hover highlight, tooltip explaining why – optional for MVP.

Summary & Warnings Visibility
-----------------------------

- Right rail should always be visible (on desktop) while user scrolls through parts:
  - Either:
    - Entire builder area scrolls and right rail scrolls with it, or
    - Right rail is sticky at top within viewport.
- Warnings:
  - For critical warnings, consider slightly stronger styling so they stand out, but avoid modal/popup.
- No automatic scrolling:
  - Selecting parts does not auto-scroll to warnings; they are visible in the right rail.

Responsive Behavior
===================

Desktop (≥ ~1024px)
--------------------

- Layout: Three-column:
  - Left rail: ~20–25%
  - Center panel: ~45–55%
  - Right rail: ~25–30%
- Scrolling:
  - Entire page scrollable, or independent scrolling columns where needed.

Tablet (~768–1023px)
--------------------

- Two-row layout for builder:
  - Row 1: SummaryRail + WarningsPanel (full width or side-by-side).
  - Row 2: CategoryTree (left) and PartsList (right) stacked or split:
    - Option A: CategoryTree on top of PartsList (full width each).
    - Option B: Reduced-width left rail beside a narrower PartsList.
- Ensure tap targets are at least ~40px tall.

Mobile (< ~768px)
-----------------

- Single-column stack:
  1. SummaryRail
  2. WarningsPanel
  3. CategoryTree
  4. PartsList
- CategoryTree:
  - Could be collapsible/accordion labeled “Categories” to save vertical space.
- PartsList:
  - Table converts to card-like layout:
    - Each part card shows:
      - Name
      - Price
      - Required indicator
      - Checkbox/radio
      - Short description below.

Implementation Alignment Notes
==============================

- Styles:
  - Use CSS classes prefixed (for example) with `rb-` to scope new styles:
    - `.rb-builder-layout`, `.rb-category-rail`, `.rb-parts-list`, `.rb-summary-rail`, `.rb-warnings-panel`.
  - Add new CSS in a way that doesn’t override global `body`, `table`, etc., unless coordinated with existing styles.
- Components:
  - `BuilderPage.razor`:
    - Responsible for:
      - Route.
      - Data fetching for build.
      - Providing data/state to child components.
  - `CategoryTree.razor`:
    - Purely presentational for categories; raises events on selection change.
  - `PartsList.razor`:
    - Presentational + interaction for parts.
    - Emits events for part selection changes.
  - `SummaryRail.razor` & `WarningsPanel.razor`:
    - Stateless UI bound to props/parameters for summary, completion, cost, warnings.

Acceptance-Impacting UX Clarifications
======================================

- Completion calculation:
  - UX expects a single numeric percentage (0–100) and a short summary line.
  - Visual progress bar and label must update on every selection change.
- Warnings:
  - List must visually change when parts are added or removed if backend updates warnings.
- No blocking modals:
  - Errors should be inline (message near where they occur) and must not block all interactions.

This spec should provide enough detail for the frontend and backend implementers to map endpoints, state, and component structure into a coherent, testable UI without modifying unrelated dashboard features.
