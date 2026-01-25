# AGENT TASKS – Rotary Engine Website (Blazor WASM)

Project Name: **Rotary Engine Interactive Simulator (13B Focus)**

Common Required Deliverables (Project Root unless noted):
- `README.md` – Setup and run instructions; explain that Blazor app lives in `app/`, how to run (`cd app && dotnet run`), and where frontend/simulation logic reside.
- `logs/CHANGELOG.md` – Updated with at least one summary line for this run.
- Blazor app code and assets under `app/`, including:
  - `app/Program.cs`
  - `app/Pages/*`
  - `app/wwwroot/*`
- Internal knowledge/document files as chosen formats (e.g., markdown or JSON) stored under an appropriate folder inside `app/` (e.g., `app/Data/` or similar).

---

## 1. Research Agent

### Project Name
Rotary Engine Knowledge & Model Foundation

### Required Deliverables

1. **Rotary Engine Knowledge Base**  
   - Suggested filenames (inside `app/`):
     - `app/Data/RotaryKnowledge.md` or  
       `app/Data/rotary-knowledge.json`
   - Purpose:
     - Central reference with 13B rotary fundamentals:
       - Rotor geometry and motion
       - Eccentric shaft operation
       - Apex, side, and corner seals
       - Intake/compression/combustion/exhaust cycles
       - Common failure modes (apex seal wear, overheating, detonation)
       - Publicly available specs (approximate dimensions, compression ratios, typical RPM ranges).

2. **Simplified Physics & Behavior Models**  
   - Suggested filenames:
     - `app/Data/SimulationModelNotes.md`
   - Purpose:
     - Define simplified math/logic models for:
       - Wear (especially apex seals)
       - Heat/thermal stress
       - Overall risk classification (“safe”, “aggressive”, “engine-grenade”)
     - Include:
       - Input variables (boost, AFR, timing, RPM, seal type)
       - Ranges and units
       - Output variables (wear index, heat index, risk level)
       - Simplifying assumptions and approximations
       - Notes on validity ranges and limitations.

3. **Glossary of Rotary Terminology**  
   - Suggested filenames:
     - `app/Data/RotaryGlossary.json` or  
       `app/Pages/Glossary.razor` content source.
   - Purpose:
     - Provide standardized definitions for terms:
       - Apex seal, side seal, corner seal, eccentric shaft
       - Detonation/knock, AFR, boost, timing advance/retard, etc.
     - Ensure language is understandable to non-engineers.

4. **Validation & Plausibility Notes**  
   - Suggested filenames:
     - `app/Data/ModelValidation.md`
   - Purpose:
     - Document:
       - Rationale for chosen formulae and thresholds.
       - Cross-checks from public sources (without copying proprietary data).
       - Example scenarios (“mild street tune”, “aggressive track tune”, “extreme scenario”) and expected qualitative behavior (e.g., “risk should be high due to heat and wear”).

### Key Technical Notes & Constraints

- Use conservative, generic values based on public information; do not include proprietary manufacturer-specific data or confidential tuning tables.
- Keep formulas simple and efficient for real-time use in WebAssembly:
  - Favor closed-form calculations over iterative/expensive numerical methods.
- Provide explicit mapping guidance:
  - How Research variables should be represented in code models (e.g., ranges, normalization).
  - Clear risk threshold suggestions (e.g., wear index > X and heat index > Y => “engine-grenade”).
- Coordinate with Coding Agent:
  - Ensure data structures (JSON shape, field names) are convenient for direct binding in Blazor components/services.

---

## 2. Coding Agent

### Project Name
Rotary Engine Blazor WebAssembly App

### Required Deliverables

1. **Blazor WebAssembly App Implementation**  
   - Location: `app/`
   - Key files:
     - `app/Program.cs` – Configure root components, services, and any simulation or data services.
     - `app/Pages/*.razor` – Main UI and navigation pages, e.g.:
       - `Index.razor` – Intro/overview.
       - `EngineOverview.razor` – Educational walkthrough of 13B operation.
       - `Simulation.razor` – Interactive visualization and parameter controls.
       - `Glossary.razor` – Integration with glossary data.
     - `app/wwwroot/*` – Static content:
       - Images/diagrams of rotor/housing.
       - Optional JS for advanced canvas/WebGL helpers if needed.
   - Purpose:
     - Deliver a functioning single-page Blazor WebAssembly app with navigation, content, interactivity, and simulation.

2. **Visualization Module**  
   - Location: within `app/` (e.g., `app/Components/` or `app/Shared/`).
   - Suggested files:
     - `app/Components/RotaryVisualizer.razor`
     - Optional JS interop under `app/wwwroot/js/visualizer.js` if using Canvas/WebGL.
   - Purpose:
     - Render 2D or 3D rotary engine diagram.
     - Animate rotor motion and visually indicate cycle phases.
     - Support overlays for heat and wear, toggled from UI controls.

3. **Simulation & Calculation Engine**  
   - Location: within `app/` (e.g., `app/Services/`).
   - Suggested files:
     - `app/Services/SimulationService.cs`
     - `app/Models/SimulationInputs.cs`
     - `app/Models/SimulationOutputs.cs`
   - Purpose:
     - Implement core logic based on Research Agent’s models:
       - Map UI inputs (boost, AFR, timing, RPM, seal type) to normalized indices.
       - Calculate wear index, heat index, and risk level.
     - Expose a clean API for use by Blazor components:
       - Methods like `ComputeSimulation(SimulationInputs inputs)` returning `SimulationOutputs`.
     - Structure code to support future additional engine profiles (e.g., `EngineProfile` models).

4. **Local Run & Setup Documentation**  
   - File: `README.md` (project root).
   - Purpose:
     - Explain:
       - The app is a Blazor WebAssembly project located in `app/`.
       - Prerequisites (e.g., `.NET SDK` version).
       - Commands:
         - `cd app`
         - `dotnet run`
       - Default URL and how to access the running app in a browser.
       - Any optional debug or build instructions.

5. **CHANGELOG Entry**  
   - File: `logs/CHANGELOG.md`
   - Purpose:
     - Add at least one entry documenting this implementation step (e.g., date + “Initial Blazor WASM rotary simulation and visualization added”).

### Key Technical Notes & Constraints

- **Project Structure**
  - Do NOT create standalone `frontend/` or `backend/` folders for this app.
  - Use standard Blazor conventions under `app/`.
- **Performance**
  - Keep simulation logic light enough for responsive updates when parameters are adjusted.
  - Avoid heavy allocations or tight loops in WASM.
- **Interactivity**
  - UI should update outputs (wear, heat, risk) promptly when inputs change.
  - Visualizer should be decoupled from the calculation engine (e.g., driven by a simple view model).
- **Extensibility**
  - Design models and services to support multiple engines later (e.g., engine type enum or separate profile definitions).
- **Safety & Messaging**
  - Integrate disclaimers from Research Agent in UI (footer, info banner, or help section).
- **Testing Facilitation**
  - Ensure design supports parameterized test scenarios (e.g., simple internal API that Tester can call or verify via UI).

---

## 3. Reviewer Agent

### Project Name
Rotary Engine Website Review & QA

### Required Deliverables

1. **QA Test Cases & Reports**  
   - Suggested filenames:
     - `app/QA/TestCases.md`
     - `app/QA/QAReport-<date>.md`
   - Purpose:
     - Document executed tests based on `TEST.md`.
     - Record outcomes for:
       - Content clarity and correctness.
       - Simulation plausibility (wear, heat, risk responses to input changes).
       - UI/UX usability for non-engineers.
       - Performance and responsiveness.
       - Error handling and stability.

2. **Usability Feedback & Improvement Notes**  
   - Suggested filenames:
     - `app/QA/UsabilityNotes.md`
   - Purpose:
     - Capture observations from usability sessions:
       - Confusing labels or terms.
       - Points where users don’t understand cause–effect of parameter changes.
     - Recommend specific wording/UX adjustments for Coding and Research agents.

3. **Simulation Validation Report**  
   - Suggested filenames:
     - `app/QA/SimulationValidation.md`
   - Purpose:
     - Evaluate if outputs are consistent with expectations from Research Agent:
       - Scenarios with increasing boost/RPM lead to higher wear/heat.
       - Safer settings yield “Safe” risk and aggressive ones “Aggressive” or “Engine-grenade.”
     - Document any cases where model behavior feels unrealistic or counterintuitive.

4. **Final Approval Checklist**  
   - Suggested filenames:
     - `app/QA/FinalChecklist.md`
   - Purpose:
     - Checklist to confirm:
       - All critical tests in `TEST.md` have passing results or accepted deviations.
       - Educational disclaimers are present.
       - Blazor app runs with `cd app && dotnet run` as documented in `README.md`.
       - No major usability blockers.
       - No structural violations (e.g., no extraneous `frontend/`/`backend/` folders).

### Key Technical Notes & Constraints

- Review using modern browsers (Chrome, Edge, Firefox) and confirm consistent behavior.
- Pay special attention to:
  - Edge cases: extreme boost, very lean AFR, high RPM.
  - UI states where multiple overlays are enabled/disabled rapidly.
  - Error cases: invalid user input, unexpected simulation responses.
- Coordinate with:
  - Research Agent to resolve discrepancies between documented models and observed outputs.
  - Coding Agent to prioritize and track fixes.
- Ensure logs/CHANGELOG.md:
  - Has an entry reflecting completed QA/review cycle for this run.
- Keep feedback concrete and actionable:
  - Prefer specific recommendations (“rename ‘AFR’ label to ‘Air–Fuel Ratio (AFR)’”) over generic comments.
