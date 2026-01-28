# README.md Wireframe – EPIC 00: Repo Retrofit (Blazor WebAssembly)

## 1. Title & Summary

- `# EPIC 00: Repo Retrofit (Blazor WebAssembly)`
- One-sentence summary:
  - Blazor WebAssembly app + agent-driven repo structure.

---

## 2. Overview

- Short paragraph:
  - Repo hosts a Blazor WebAssembly app under `app/`.
  - Root-level folders prepared for agents, tasks, logs, docs, and data.
  - EPIC 00 focuses on structure + onboarding, not new app features.
- Explicit statement:
  - “All Blazor WebAssembly application code lives in the `app/` directory.”
  - “No `frontend/` or `backend/` directory is used for the UI.”

---

## 3. Repository Layout

- Intro sentence: “High-level directory layout:”
- Bullet or pseudo-tree:

  - `app/` – Blazor WebAssembly application (source, pages, configuration, assets).
  - `agents/` – Agent definitions and configuration placeholders.
  - `tasks/` – EPIC/task definition files (e.g., `EPIC_00_MVP.md`).
  - `logs/` – Log artifacts and `CHANGELOG.md` for project history.
  - `docs/` – Additional project documentation and reference materials.
  - `db/` – Data storage and local database files (as needed).

- Short note about placeholder files being acceptable for now.

---

## 4. Running the Blazor WebAssembly App Locally

### 4.1 Prerequisites (inline or referenced section)

- `.NET SDK` (version compatible with the Blazor WebAssembly project in `app/`).
- Modern web browser.
- Note about checking `TargetFramework` in `app/*.csproj` if unsure of SDK version.

### 4.2 Steps

Numbered list:

1. From the repo root, change into the Blazor app directory:

   ```bash
   cd app
   ```

2. Run the app:

   ```bash
   dotnet run
   ```

3. When the app starts, open a browser and navigate to the URL shown in the console output  
   - Mention: typically a `http://localhost:xxxx` or `https://localhost:xxxx` address.

4. Note:
   - The app must be run from within `app/`.
   - This is a Blazor WebAssembly project; no separate UI under `frontend/` or `backend/`.

---

## 5. Prerequisites (if separated from section 4.1)

- Heading: `## Prerequisites`
- Bullets:
  - Installed .NET SDK (version compatible with project’s target framework).
  - A supported OS (implicit) and terminal/shell.
  - Web browser.

- Short note on:
  - “If the exact .NET SDK version is not specified here, inspect the project file in `app/` to determine the `TargetFramework` and install a matching SDK.”

---

## 6. Agents & Tasks

- Heading: `## Agents & Tasks`
- Subsection `### agents/`
  - One or two sentences:
    - Reserved for agent definitions and configuration files.
    - Intended to align with rotary builder agent roster conventions.

- Subsection `### tasks/`
  - One or two sentences:
    - Reserved for EPIC and task definitions (e.g., `EPIC_00_MVP.md`).
    - Organizes high-level work items and specifications.

- Optional short note:
  - “These directories currently provide scaffolding; future EPICs and agents should be added here.”

---

## 7. Logs & Changelog

- Heading: `## Logs & Changelog`
- Content bullets:
  - `logs/` holds project logs and history.
  - `logs/CHANGELOG.md` records high-level changes to the repo, including this EPIC 00 retrofit.
  - Expected usage pattern:
    - Add a new dated entry describing changes whenever meaningful work is committed.

---

## 8. Documentation & Data

- Heading: `## Documentation and Data`
- Subsection or bullets:

  - `docs/`:
    - For additional project documentation.
    - May include structure diagrams, design notes, or references (e.g., `STRUCTURE.md` if created).

  - `db/`:
    - For data and local database-related files.
    - Currently may be empty or placeholder-only; reserved for future use.

---

## 9. Notes & Assumptions

- Heading: `## Notes & Assumptions`
- Bullet list:

  - All Blazor WebAssembly code stays under `app/`.
  - No `frontend/` or `backend/` folders are used for the UI or app hosting.
  - Any runtime or configuration changes must be applied inside `app/`.
  - Keep this README in sync with:
    - Root directory structure,
    - Actual run instructions (`cd app`, `dotnet run`),
    - `logs/CHANGELOG.md` entries.

- Optional final line:
  - “For additional structural details or alignment with the rotary builder project, see `docs/` (if present).”
