# AGENT TASKS

## Project Name
Rotary Engine Interactive Web Simulator (Blazor WebAssembly)

---

## Role: Research Agent (agent-1)

### Project Name
Rotary Engine Interactive Web Simulator – Research & Modeling

### Required Deliverables
1. **`ROTARY_KNOWLEDGE_BASE.md`**
   - Purpose: Centralized, non-proprietary reference for rotary fundamentals, 13B-specific details, and educational explanations to be used by designers and developers.
2. **`SIMPLIFIED_MODELS.md`**
   - Purpose: Document simplified math and logic for:
     - Wear estimation.
     - Thermal stress estimation.
     - Detonation/risk scoring.
     - Mapping of indices to qualitative labels (“Safe”, “Aggressive”, “Engine-grenade”).
3. **`GLOSSARY_ROTARY_TERMS.md`**
   - Purpose: Glossary of rotary-specific terminology with concise, non-technical explanations and any relationships between terms.
4. **`SIMULATION_VALIDATION_NOTES.md`**
   - Purpose: Assumption list, reference ranges, and validation notes for the simplified simulation (what’s realistic, what’s approximated, and why).

### Key Technical Notes & Constraints
- Focus on **Mazda 13B** first; keep notes adaptable to other engines (20B, Renesis).
- Use publicly available, non-proprietary data; avoid manufacturer-confidential details and CAD-level specs.
- Provide:
  - Typical ranges for RPM (idle, cruise, redline).
  - Typical boost ranges for stock vs modified engines.
  - Target AFR ranges for safe operation in various conditions.
  - High-level ignition timing concepts (no proprietary maps).
- Express models in a way that’s easy to implement in C#:
  - Clear function definitions: inputs, outputs, units, valid ranges.
  - Piecewise or parametric formulas where necessary.
  - Pseudocode or simple math expressions for each index:
    - WearIndex(boost, rpm, sealType, etc.).
    - HeatIndex(boost, rpm, afr, etc.).
    - DetonationRisk(afr, timing, boost, rpm).
- Define:
  - Thresholds for risk categories.
  - Defaults and “stock” presets for initial states.
- Provide at least one numeric example per model to help verify implementation.
- Flag any areas where scientific accuracy is weaker or highly simplified, so Reviewer Agent can treat them carefully in QA.

---

## Role: Coding Agent (agent-2)

### Project Name
Rotary Engine Interactive Web Simulator – Blazor Implementation

### Required Deliverables
1. **Blazor WebAssembly App (inside `app/`)**
   - Purpose: The running interactive website, including pages, components, and assets.
   - Key files to update:
     - `app/Program.cs` – configure root components, services (e.g., simulation service, state management).
     - `app/App.razor` – root routing/shell.
     - `app/Pages/*.razor` – main pages (Overview, How It Works, Simulation, Glossary).
     - `app/Shared/*.razor` – common layout and components.
     - `app/wwwroot/*` – static assets (CSS, JS interop, images/diagrams).
2. **`app/Services/EngineSimulationService.cs` (or equivalent)**
   - Purpose: Encapsulate the simulation logic using Research Agent’s simplified models.
3. **Visualization Module Files**
   - Purpose: Implement animated visualization using Canvas/SVG/WebGL via JS interop:
     - A Blazor component, e.g., `app/Components/EngineVisualizer.razor`.
     - Optional JS interop file, e.g., `app/wwwroot/js/engineVisualizer.js`.
4. **`README.md` in Project Root**
   - Purpose: Provide setup and run instructions:
     - Explain app structure, emphasizing Blazor app in `app/`.
     - Detail `dotnet run` usage from `app/`.
     - Document high-level features and navigation.
5. **Developer-Facing Notes**
   - Either inline in code or a short `DEVELOPER_NOTES.md` (optional, but recommended).
   - Purpose: Explain:
     - How simulation service works.
     - How to add a new engine configuration.
     - Where visualization logic is implemented and how to extend it.

### Key Technical Notes & Constraints
- **Blazor WebAssembly Only:**
  - Work exclusively within `app/` for the UI and simulation logic.
  - Do **not** create separate `frontend/` or `backend/` directories for the main app.
- **Architecture:**
  - Use a service-oriented design for simulation:
    - Register `EngineSimulationService` in DI in `Program.cs`.
    - Use strongly-typed parameter and result models.
  - Structure pages:
    - `Index.razor`: Landing/overview with high-level explanation.
    - `HowItWorks.razor`: Step-by-step cycle visualization and textual content.
    - `Simulation.razor`: Parameters panel + visualization + outputs.
    - `Glossary.razor`: Terms list with search or basic filtering (optional).
- **Visualization:**
  - Choose a rendering approach:
    - Canvas 2D (via JS) or SVG with C# updates.
    - If using Three.js or WebGL, load minimal scripts in `wwwroot` and connect via JS interop.
  - Expose parameters (e.g., RPM, heat index) from Blazor to JS to drive animation speed and color.
- **Performance & UX:**
  - Throttle UI updates if needed (e.g., debouncing sliders).
  - Ensure responsive layout (use Bootstrap or CSS grid/flexbox).
  - Implement basic form validation and clamping for input ranges.
- **Extensibility:**
  - Design simulation configuration so new engines can be added by:
    - Adding new engine profiles (struct/class/record) with default values.
    - Updating a small part of the UI for engine selection (future enhancement).
- **Testing Hooks:**
  - Provide a quick way to log or display raw indices (wear, heat, risk) for QA.
  - Keep logic deterministic for given inputs.

---

## Role: Reviewer Agent (agent-3)

### Project Name
Rotary Engine Interactive Web Simulator – Review & QA

### Required Deliverables
1. **`QA_TEST_CASES.md`**
   - Purpose: List test cases (inputs and expected qualitative behavior) for:
     - Normal operation.
     - Edge and extreme scenarios (high boost, lean AFR, high RPM, advanced timing).
2. **`USABILITY_FEEDBACK.md`**
   - Purpose: Summarize findings about usability for non-engineer users, including:
     - Navigation clarity.
     - Understandability of terms and warnings.
     - Suggested UI/UX improvements.
3. **`SIMULATION_VALIDATION_REPORT.md`**
   - Purpose: Validate that implemented simulation behavior aligns with Research Agent’s models and intuitive expectations, including:
     - What was tested.
     - Observed vs expected behavior.
     - Any discrepancies and recommendations.
4. **`FINAL_APPROVAL_CHECKLIST.md`**
   - Purpose: A checklist to be completed before deployment, covering:
     - Content accuracy approval.
     - Simulation plausibility.
     - Performance and compatibility checks.
     - Disclaimer presence and clarity.

### Key Technical Notes & Constraints
- Use Research Agent’s documents (`ROTARY_KNOWLEDGE_BASE.md`, `SIMPLIFIED_MODELS.md`, `SIMULATION_VALIDATION_NOTES.md`) as baseline for correctness.
- Focus on **relative** plausibility rather than exact engineering precision:
  - Emphasize that behavior trends (e.g., higher boost increases risk) are correct.
- Verify that:
  - All required pages are present and accessible via navigation.
  - Simulation service and UI adhere to defined input ranges and constraints.
  - Risk thresholds and messages make sense and are consistent with documentation.
- Perform cross-browser sanity checks where possible:
  - Confirm animation, sliders, and buttons work as expected.
- Check for:
  - Accessible color choices for overlays (avoid ambiguous color meaning).
  - Clear and visible disclaimers in the simulation area.
  - Absence of misleading language implying professional tuning advice or manufacturer endorsement.
- Provide prioritized issue list (e.g., P0/P1/P2) in `SIMULATION_VALIDATION_REPORT.md` or `USABILITY_FEEDBACK.md` to guide final fixes.
