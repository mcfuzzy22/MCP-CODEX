# AGENT TASKS – EPIC 00: Repo Retrofit

---

## Designer

**Project Name:** EPIC 00: Repo Retrofit (Blazor WebAssembly)

### Required Deliverables

1. `README.md` (project root)
   - Purpose: Provide a concise, accurate entry point for developers:
     - Overview of the project and repo layout.
     - Clear “Run Locally” instructions for the Blazor WebAssembly app.
     - Brief explanation of the purpose of `/docs`, `/agents`, `/tasks`, `/logs`, `/db`.

2. Optional helper docs (if needed, under `docs/`)
   - Example: `docs/STRUCTURE.md` (only if required by the team).
   - Purpose: Expand on repository conventions and how they’ll align with the rotary builder project.

### Key Technical Notes & Constraints

- The Blazor WebAssembly app is contained entirely in `app/`. Do not describe or imply other UI locations.
- Running the app must be described with these steps (or equivalent):
  - `cd app`
  - `dotnet run`
- Do not introduce new `frontend/` or `backend/` directories in documentation; they must not exist for the UI.
- Clearly call out the purpose of:
  - `agents/` (agent definitions/configurations)
  - `tasks/` (EPIC/task files like `EPIC_00_MVP.md`)
  - `logs/` (including `logs/CHANGELOG.md`)
  - `docs/` and `db/` (documentation and data storage, respectively).
- Keep instructions minimal but unambiguous—assume readers are comfortable with .NET but new to this repo.

---

## Frontend

**Project Name:** EPIC 00: Repo Retrofit (Blazor WebAssembly)

### Required Deliverables

1. Updated Blazor wiring
   - Files:
     - `app/Program.cs`
     - `app/Pages/*`
     - `app/wwwroot/*`
   - Purpose: Ensure the Blazor WebAssembly app builds and runs cleanly with `dotnet run` from `app/`, and that any necessary UI or configuration tweaks for EPIC 00 are applied without breaking existing behavior.

2. (If needed) UI indicators/placeholders
   - Example: Minor text or links in key pages to reference documentation/logs if desired (optional, only if it supports the retrofit and doesn’t expand scope).

### Key Technical Notes & Constraints

- Only modify files inside the `app/` directory:
  - Never move the Blazor project out of `app/`.
  - Do not create new top-level `frontend/` or `backend/` folders for the UI.
- Maintain a working Blazor WebAssembly configuration:
  - `dotnet run` executed inside `app/` must succeed.
- Any changes to routing or startup must preserve existing pages and navigation.
- Avoid introducing dependencies that require server-side Blazor or backend hosting changes unless already present.

---

## Backend

**Project Name:** EPIC 00: Repo Retrofit (Blazor WebAssembly)

### Required Deliverables

1. Repository structure setup
   - Directories at repo root:
     - `docs/`
     - `agents/`
     - `tasks/`
     - `logs/`
     - `db/`
   - Purpose: Establish a standard structure compatible with the rotary builder project and agent-based workflows.

2. `logs/CHANGELOG.md`
   - Purpose: Capture a summary entry describing the work done in this run for EPIC 00.
   - Requirements:
     - Add a new dated or versioned line summarizing the repo retrofit (directories created, README added/updated, etc.).

3. Agent/roster alignment scaffolding
   - Location: `agents/`, `tasks/`
   - Purpose: Prepare file/folder layout so it aligns conceptually with the rotary builder project (e.g., where agents are defined vs. where EPICs/tasks live).
   - Example content:
     - Agent configuration placeholders in `agents/`.
     - EPIC/task definition files like `EPIC_00_MVP.md` in `tasks/`.

### Key Technical Notes & Constraints

- All app runtime changes must be applied under `app/`; the root-level structure is for organization, config, and documentation.
- No new server-side/backend service folders such as `backend/` should be introduced for the UI portion.
- Ensure `logs/CHANGELOG.md` format is consistent with existing entries (if they exist); if not, establish a simple, readable convention.
- Coordinate directory naming and basic file layout with the rotary builder project for easy cross-repo comparison.

---

## Tester

**Project Name:** EPIC 00: Repo Retrofit (Blazor WebAssembly)

### Required Deliverables

1. Execution and verification notes (can be informal or in a shared doc)
   - Purpose: Document the results of:
     - Running the Blazor app using the README instructions.
     - Verifying repo structure matches documentation and requirements.

2. Validation of CHANGELOG and structure
   - Files/Areas:
     - `logs/CHANGELOG.md`
     - Root directories: `docs/`, `agents/`, `tasks/`, `logs/`, `db/`
     - Root `README.md`

### Key Technical Notes & Constraints

- Test the app only via the documented method:
  - From repo root: `cd app`
  - Then: `dotnet run`
- Confirm:
  - The app builds successfully with no errors.
  - The app is reachable at the URL output by `dotnet run`.
  - Basic navigation in the Blazor UI works and shows no obvious regressions.
- Verify project structure:
  - All required directories (`docs`, `agents`, `tasks`, `logs`, `db`) exist.
  - There are **no** `frontend/` or `backend/` folders used for the app UI.
- Cross-check `README.md`:
  - Paths and commands match actual behavior.
  - Descriptions of directories and app location are accurate.
- Report any deviations from the constraints, especially:
  - Blazor app not running via `dotnet run` in `app/`.
  - Incorrect or missing directories.
  - Documentation that does not match actual behavior.
