# EPIC 00: Repo Retrofit – MVP REQUIREMENTS

## Product Overview

This epic retrofits the existing repository to support an agent-driven workflow and prepares the Blazor WebAssembly app for consistent local development and logging.

## Goals

1. Add standard project structure folders to the repo root:
   - `/docs`
   - `/agents`
   - `/tasks`
   - `/logs`
   - `/db`
2. Align the agent/roster structure with the existing “rotary builder” project conventions (folder naming, key files, and basic layout).
3. Provide clear, minimal developer onboarding for running the existing Blazor WebAssembly app.
4. Capture this work in the project changelog.

## Target Users

- Internal developers working on the Blazor WebAssembly app.
- Tooling/agent developers integrating with the `/agents`, `/tasks`, and `/db` structures.
- QA/Tester roles needing a predictable place for logs (`/logs`) and documentation (`/docs`).

## Key Functional Requirements

1. **Repository structure**
   - The following directories exist at the repository root:
     - `docs/`
     - `agents/`
     - `tasks/`
     - `logs/`
     - `db/`
   - Directories may initially contain placeholder files (e.g., `.gitkeep`) if needed to commit them.

2. **Blazor WebAssembly constraints**
   - The Blazor WebAssembly app lives in the existing `app/` directory.
   - All application code changes must occur under `app/`:
     - `app/Program.cs`
     - `app/Pages/*`
     - `app/wwwroot/*`
     - Other existing `app/` subfolders as needed.
   - **Do NOT** create separate `frontend/` or `backend/` directories for the UI or API under the project root or `app/`.

3. **README**
   - A `README.md` must exist in the **project root**.
   - It must include:
     - Brief description of the project and the repo structure (mentioning `/docs`, `/agents`, `/tasks`, `/logs`, `/db`, and `app/`).
     - Prerequisites to run the Blazor WebAssembly app (e.g., required .NET SDK version if known or a generic note).
     - Clear, step-by-step instructions to run the app locally, including:
       1. Navigating into the `app/` directory.
       2. Running `dotnet run` from within `app/`.
       3. How to access the app in a browser (e.g., default URL).

4. **Changelog**
   - A `logs/CHANGELOG.md` file must be updated.
   - It must contain at least one new summary line describing the work done in this run (e.g., date, “EPIC 00 repo retrofit,” short description).
   - Format should be consistent with any existing style in `CHANGELOG.md` (if present), or use a simple bullet or dated entry if none exists.

5. **Roster alignment**
   - The `/agents` and `/tasks` directories must be structured so they can be aligned later with the “rotary builder” project’s conventions.
   - At a minimum:
     - `/agents` is reserved for agent definitions / configurations.
     - `/tasks` is reserved for task/EPIC definition files (e.g., `EPIC_00_MVP.md`).
   - Any existing or new roster/agent-related files should be organized to be easily comparable to the rotary builder project structure (naming, placement, and clear comments where alignment matters).

## Non-Functional Requirements & Constraints

- **Scope limitation**
  - Do not reorganize the Blazor app beyond what is required to support local running and minimal documentation.
  - No new major features or APIs should be added inside `app/` beyond what’s needed for basic wiring or placeholders.

- **Performance & stability**
  - The app must still build and run successfully using `dotnet run` in the `app/` directory.
  - No breaking changes to existing working pages or routing.

- **Developer experience**
  - File paths and commands in `README.md` must be accurate and copy-pasteable.
  - Any assumptions (e.g., minimum .NET version if not discoverable) should be clearly labeled as such.

- **Compliance with constraints**
  - Do not create `frontend/` or `backend/` directories for the UI.
  - All runtime and configuration changes must be compatible with a Blazor WebAssembly project layout.

---
