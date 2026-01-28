EPIC 00: Repo Retrofit (Blazor WebAssembly)  
Designer – Documentation & DX “UI” Spec

## 1. Overview

This design spec treats the primary “user interface” for this epic as the repository’s top-level documentation, especially `README.md`. The goal is to provide a clear, minimal, and accurate experience for developers who are:

- Familiar with .NET and Blazor,
- New to this specific repo and its agent-oriented structure.

The spec defines:

- The structure and content of `README.md` in the project root.
- Optional supporting documentation under `docs/` (only if later deemed necessary).
- Terminology and constraints that must be reflected in the docs.

There is no visual web UI change required by the Designer; instead, this design focuses on the information architecture and clarity of the developer-facing documentation.

---

## 2. Primary Deliverable: Root `README.md`

### 2.1 Audience & Tone

- **Audience**: Internal developers; .NET/Blazor experienced but new to this repository.
- **Tone**: 
  - Direct, concise, matter-of-fact.
  - Avoids tutorial-level Blazor explanations.
  - Uses imperative instructions for commands (e.g., “Run `dotnet run` from `app/`.”).

### 2.2 High-Level Structure

The `README.md` must contain the following sections, in this approximate order:

1. **Project Title & One-line Summary**
2. **Overview**
3. **Repository Layout**
4. **Running the Blazor WebAssembly App Locally**
5. **Prerequisites**
6. **Agents & Tasks (Roster Alignment Context)**
7. **Logs & Changelog**
8. **Notes & Assumptions**

Sections can be merged or renamed slightly as long as all required content is present and easy to scan.

---

### 2.3 Detailed Section Specifications

#### 2.3.1 Project Title & One-line Summary

- Title: “EPIC 00: Repo Retrofit (Blazor WebAssembly)” or “[Project Name] – EPIC 00: Repo Retrofit”.
- Immediately below, a short description, e.g.:

  > This repository hosts a Blazor WebAssembly app and supporting structure for agent-driven workflows (agents, tasks, logs, and documentation).

- Purpose: set context that:
  - This is a Blazor WebAssembly app.
  - The repo is organized to support agent-based automation and EPIC/task definitions.

#### 2.3.2 Overview

- Brief description of:
  - The **Blazor WebAssembly app** living entirely under `app/`.
  - The existence and purpose of the **root-level structure** for:
    - Agents (`agents/`)
    - Tasks/EPICs (`tasks/`)
    - Documentation (`docs/`)
    - Logs (`logs/`)
    - Data (`db/`)
- Emphasize that EPIC 00 is primarily about **repository structure and documentation**, not feature development.

Content requirements:

- Call out clearly: “All application code and Blazor configuration live under `app/`.”
- Explicitly state that there is **no `frontend/` or `backend/` directory used for the UI**.

#### 2.3.3 Repository Layout

This is the core “information architecture” section.

- Present a short tree-like layout of the repo, high level only. For example:

  - `app/` – Blazor WebAssembly application (code, pages, assets).
  - `agents/` – Agent definitions and configuration placeholders.
  - `tasks/` – EPIC/task definition files (e.g., `EPIC_00_MVP.md`).
  - `logs/` – Log files and `CHANGELOG.md` for tracking changes.
  - `docs/` – Additional project documentation.
  - `db/` – Data storage and local database files (if/when used).

- For each directory, provide a **one-sentence** purpose statement that:

  - Matches the wording in REQUIREMENTS and AGENT_TASKS.
  - Aligns conceptually with “rotary builder” conventions (agents vs tasks separation).

- Requirements to reflect:

  - It’s acceptable for some directories to initially contain placeholder files.
  - The reader should understand where to add:
    - New documentation,
    - New agent configuration,
    - New task/EPIC specs,
    - New logs/changelog entries.

#### 2.3.4 Running the Blazor WebAssembly App Locally

This section is the practical “Run Locally” UX. It must be:

- Short, step-by-step, and copy-pasteable.
- Explicitly show commands and the typical URL.

Mandatory elements:

1. A short intro sentence, e.g.:

   - “To run the Blazor WebAssembly app locally:”

2. A step list containing exactly or very close to:

   - **Step 1**: From the repo root, change into the `app/` directory.
     - Show the command: `cd app`
   - **Step 2**: Run the app:
     - Show the command: `dotnet run`
   - **Step 3**: Mention how to access the app in a browser:
     - Note: Use a generic description like “Open the URL printed in the console output (commonly `https://localhost:xxxx` or `http://localhost:xxxx`).”
     - Do **not** assume a specific port; actual port may vary depending on environment.

3. A note that **the app must be run from within `app/`**, not from the repo root.

4. Affirmation that the project is a **Blazor WebAssembly** app and not a server-side app.

Constraints:

- No references to separate frontend or backend directories.
- Do not imply any server process outside `dotnet run` in `app/`.

#### 2.3.5 Prerequisites

- Provide a concise list of requirements to run the app:
  - `.NET SDK` version:
    - If the exact version is not known from the repo, use wording like:
      - “.NET SDK (version consistent with the Blazor WebAssembly app in `app/`; if unsure, check the `TargetFramework` in `app/*.csproj`).”
    - Clearly label any assumptions.
  - A modern web browser.

- The wording must acknowledge possible uncertainty:

  - For example: “If the specific .NET SDK version is not documented here, inspect the `TargetFramework` in the Blazor project (`app/*.csproj`) and ensure a compatible SDK is installed.”

- Do not list irrelevant tools.

#### 2.3.6 Agents & Tasks (Roster Alignment Context)

- Short explanation of the conceptual split:

  - `agents/`:
    - Reserved for **agent definitions and configurations**.
    - Future home for agent roster files that align with rotary builder conventions.
  - `tasks/`:
    - Reserved for **EPIC and task specification files**, including this epic (e.g., `EPIC_00_MVP.md`).
    - Intended to mirror task/EPIC structures from the rotary builder project.

- Clarify that:

  - These directories are **organizational scaffolding** at this stage.
  - Implementers can look here when adding new EPICs or agents in the future.

- Keep this section informative but brief; it shouldn’t try to fully explain rotary builder itself.

#### 2.3.7 Logs & Changelog

- Directly mention `logs/CHANGELOG.md`:

  - Explain that it tracks changes in the repo, including the EPIC 00 retrofit.
  - Clarify expected format briefly:
    - Simple dated entries or a versioned heading with bullet points.

- Provide guidance such as:

  - “For subsequent work, add a new dated entry to `logs/CHANGELOG.md` summarizing your changes.”

- State that `logs/` can also hold other log artifacts as needed (e.g., QA/test notes, automation logs), but the key requirement is `CHANGELOG.md`.

#### 2.3.8 Notes & Assumptions

- Brief list of key constraints and assumptions:

  - The Blazor WebAssembly app **must remain under `app/`**.
  - **Do not create** `frontend/` or `backend/` directories for the UI.
  - Runtime changes for the app must be done under `app/`.
  - Documentation may evolve, but must stay synchronized with:
    - The actual directory structure,
    - The actual run instructions.

- Optional note: If the team later standardizes further with rotary builder, this README should be updated accordingly.

---

## 3. Optional Supporting Document: `docs/STRUCTURE.md` (If Created)

This document is **optional**, to be created only if the team needs more detail than the README can reasonably hold. If created, it should:

- Expand on:

  - Alignment with rotary builder conventions (without over-specifying things not in REQUIREMENTS/AGENT_TASKS).
  - Expected future use of `agents/` and `tasks/`.
  - Guidelines for contributing new EPICs and agents.

- Provide:

  - A more detailed directory tree, including example file names.
  - Examples of how a future EPIC might be documented in `tasks/`.

- It must not contradict:

  - The requirement that the UI/blazor app stays in `app/`.
  - The prohibition on `frontend/` and `backend/` folders for the UI.

If no additional structure guidance is needed immediately, omit this file and keep all mandatory information in `README.md`.

---

## 4. Documentation UX Principles

To ensure the documentation feels coherent and is easy to use:

1. **Single Source of Truth for Running the App**
   - All run instructions must live in the root `README.md`.
   - Other docs (if any) should link back to that section rather than duplicating instructions.

2. **Consistency with File System**
   - Directory names in the docs must match exactly:
     - `app/`, `docs/`, `agents/`, `tasks/`, `logs/`, `db/`.
   - If a directory is optional or currently mostly empty, state that clearly.

3. **Minimalism**
   - Avoid extra narrative; prioritize:
     - Clear section headings,
     - Bullet lists,
     - Short command/code blocks.

4. **Scannability**
   - Use headings like “Run Locally”, “Repo Layout”, “Agents & Tasks”, etc., so readers can quickly find what they need.

---

## 5. Acceptance Criteria Mapping

The README produced from this design must:

- Mention and briefly explain:
  - `/docs`, `/agents`, `/tasks`, `/logs`, `/db`, and `app/`.
- Provide clear run instructions:
  - Explicit `cd app` and `dotnet run`.
  - Browser access guidance.
- Respect all constraints:
  - No mention of `frontend/` or `backend/` as UI locations.
  - No implication of moving the Blazor app out of `app/`.
- Acknowledge `logs/CHANGELOG.md` as the place for summarized changes for EPIC 00 and beyond.

If all above are implemented, the documentation will satisfy the Designer’s responsibilities for EPIC 00.

---

## 6. Wireframe Mapping

The accompanying `design/wireframe.md` will provide a text-outline “wireframe” of `README.md`, reflecting the section structure, headings, and approximate content order described in this spec.

---
