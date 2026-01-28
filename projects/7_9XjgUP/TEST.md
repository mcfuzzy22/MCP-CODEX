# Test Plan – EPIC 00: Repo Retrofit

## 1. Repository Structure

### 1.1 Root folders exist
- [Owner: Backend]

**Tasks**
- Ensure the following directories exist at the repository root:
  - `docs/`
  - `agents/`
  - `tasks/`
  - `logs/`
  - `db/`

**Acceptance Criteria**
- Each directory is present at the root of the repository.
- Directories are committed to version control (e.g., contain at least one file or `.gitkeep` if necessary).
- No `frontend/` or `backend/` directories have been added anywhere in the project for the UI.

---

## 2. README Content & Accuracy

### 2.1 Root README created
- [Owner: Designer]

**Tasks**
- Create or update `README.md` in the repository root.
- Document:
  - Short description of the project.
  - Explanation of the repository structure, specifically:
    - `app/` (Blazor WebAssembly app)
    - `docs/`, `agents/`, `tasks/`, `logs/`, `db/`
  - Prerequisites for running the app (e.g., .NET SDK).
  - Instructions to run the Blazor app locally.

**Acceptance Criteria**
- `README.md` exists in the repository root.
- It clearly states that the Blazor app lives in `app/`.
- It includes a “Getting Started” or “Run Locally” section with steps similar to:
  1. `cd app`
  2. `dotnet run`
  3. Open the documented URL in a browser.
- All mentioned directories (`docs`, `agents`, `tasks`, `logs`, `db`) are accurately described and present.
- There is no mention of new `frontend/` or `backend/` directories for the UI.

---

## 3. Blazor App Execution

### 3.1 Local run via `dotnet run`
- [Owner: Frontend]

**Tasks**
- Validate that the Blazor WebAssembly app runs successfully from inside `app/`.
- Update any necessary wiring in:
  - `app/Program.cs`
  - `app/Pages/*`
  - `app/wwwroot/*`
- Ensure no code changes break existing navigation or build.

**Acceptance Criteria**
- From the project root, the following works:
  - `cd app`
  - `dotnet run`
- The project builds without errors.
- The app starts and is accessible at the URL shown in the console output (commonly `https://localhost:xxxx` or `http://localhost:xxxx`).
- Basic navigation through existing pages works without runtime errors in the browser console.
- No new `frontend/` or `backend/` folders have been created inside `app/`.

---

## 4. Changelog Update

### 4.1 CHANGELOG entry for this run
- [Owner: Backend]

**Tasks**
- Open or create `logs/CHANGELOG.md`.
- Add a new summary entry for this EPIC 00 run.

**Acceptance Criteria**
- `logs/CHANGELOG.md` exists.
- It includes at least one new entry for this work, containing:
  - A date or version marker.
  - A brief description, e.g., “EPIC 00: Repo retrofit – added docs/agents/tasks/logs/db structure and root README with Blazor run instructions.”
- Entry formatting is consistent with any pre-existing entries (if they exist), or uses a simple, readable style if none.

---

## 5. Roster & Agent Alignment

### 5.1 Agents and tasks layout
- [Owner: Backend]

**Tasks**
- Organize agent and task files to align with the “rotary builder” project’s structure conventions as much as possible.
- Ensure `/agents` is used for agent-related configurations.
- Ensure `/tasks` is used for EPIC/task definition files.

**Acceptance Criteria**
- `/agents` directory contains at least one placeholder or configuration file (or is clearly prepared to host such files) consistent with the rotary builder style.
- `/tasks` directory contains EPIC/task files (e.g., `EPIC_00_MVP.md`) or clearly documented placeholders.
- Any references in `README.md` or comments indicate that this layout matches or is intended to match the rotary builder project conventions.

---

## 6. Testing & Validation

### 6.1 Smoke test of Blazor app
- [Owner: Tester]

**Tasks**
- Follow the `README.md` instructions to run the Blazor app.
- Perform a basic smoke test of core pages and navigation.

**Acceptance Criteria**
- Following the steps in `README.md` leads to a successful app run.
- At least the home page (and any obvious main pages) load without:
  - HTTP 404/500 errors.
  - Unhandled exceptions in the browser console.
- The app’s title and basic content are visible and as expected.
- Any changes related to EPIC 00 did not introduce visible UI regressions on load.

### 6.2 Documentation validation
- [Owner: Tester]

**Tasks**
- Validate that the repository layout described in `README.md` matches the actual structure on disk.

**Acceptance Criteria**
- All directories documented in the README exist and are correctly named.
- The documented run instructions (paths and commands) are accurate and complete.
- No contradictions between README, actual code structure, and project constraints (e.g., no mention or presence of `frontend/`/`backend/` for UI).

---
