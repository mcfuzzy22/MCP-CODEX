# Rotary Engine Interactive Website – Requirements

## 1. Product Summary

An interactive, educational Blazor WebAssembly website that explains how Mazda-style rotary (Wankel) engines—initially the 13B—work. The site should combine clear explanations, visualizations, and simplified simulations to help enthusiasts, students, and beginner builders understand rotary operation, tuning impacts, and common failure risks.

The application runs fully client-side in a Blazor WebAssembly app within the existing `app/` folder.

## 2. Target Users

- **Enthusiasts:** Car and rotary fans who want to understand how their engine works.
- **Students / Learners:** People with basic science/mechanics background learning engine principles.
- **Beginner Builders / Tuners:** DIY builders looking for intuitive feedback on basic parameter changes.
- **Curious General Audience:** Non-engineers who want high-level visual understanding.

## 3. Core User Goals

Users should be able to:

1. **Understand Rotary Basics**
   - See an overview of rotary engine architecture (rotor, housing, eccentric shaft, seals).
   - Step through the four phases: intake, compression, combustion, exhaust.
   - Learn terminology via an integrated glossary.

2. **Visualize Engine Motion**
   - View an animated visualization (2D or lightweight pseudo-3D) of:
     - Rotor orbiting inside the epitrochoid housing.
     - Eccentric shaft rotation.
     - Indicated working chambers and phases over time.

3. **Experiment with Parameters**
   - Adjust key inputs using UI controls (sliders/dropdowns/inputs):
     - Boost pressure
     - Air–Fuel Ratio (AFR)
     - Ignition timing
     - RPM range
     - Seal type/material (e.g., OEM steel, upgraded ceramic, generic “performance”)
   - Immediately see how these changes affect simplified outputs.

4. **View Data-Driven Feedback**
   - See real-time or on-demand computed outputs:
     - Estimated wear levels (e.g., low/medium/high with numeric index).
     - Thermal stress indications across the housing/rotor.
     - Risk warnings graded (e.g., “Safe”, “Aggressive”, “Engine-grenade”).
   - Understand *why* a setting is risky via short text explanations.

5. **Rely on Clear, Honest Disclaimers**
   - Understand the tool is educational, using simplified physics and not manufacturer-certified data.

## 4. Functional Requirements

### 4.1 Information & Content

- **Knowledge Base**
  - Rotary fundamentals focused on Mazda 13B:
    - Rotor geometry and motion (high-level, no proprietary CAD).
    - Seals: apex, side, corner—function and failure modes.
    - Eccentric shaft role.
    - Cycle explanation with diagrams.
  - Common failure modes:
    - Apex seal wear and chipping.
    - Overheating.
    - Detonation / pre-ignition issues.
  - Publicly available, non-proprietary specs for 13B:
    - Displacement concept (bore equivalent, rotor volume).
    - Nominal compression ratio (approximate).
    - Typical safe RPM limits (e.g., street vs track).
  - Glossary of key rotary terms with short, non-technical descriptions.

- **Presentation**
  - Content organized into pages/sections (e.g., Overview, How It Works, Simulation, Glossary).
  - Explanations that can be skimmed by non-engineers (short paragraphs, callouts, diagrams).

### 4.2 Simulation & Parameters

- **Input Controls (UI)**
  - Sliders or numeric inputs for:
    - Boost pressure (e.g., 0–25 psi).
    - AFR (e.g., 10:1–16:1, with highlighting outside safe range).
    - Ignition timing (e.g., “retarded”, “stock”, “advanced” with degrees or preset options).
    - RPM range (e.g., idle to redline, 500–9,000 rpm).
  - Selector for seal type/material (e.g., “Stock”, “Performance”, “Race-only”).
  - Preset configurations (optional but desirable):
    - “Stock street”
    - “Mild street port”
    - “Track/Drift”

- **Simulation Logic (Simplified)**
  - Underlying model provided by Research Agent and implemented by Coding Agent:
    - Use relative, dimensionless indices (e.g., wear 0–1, heat 0–1) computed from inputs.
    - Simple formulae or lookups that increase:
      - Wear with RPM, boost, and seal type factor.
      - Thermal stress with RPM, boost, and richer/leaner AFR.
      - Detonation risk with lean AFR, advanced timing, high boost.
  - Outputs:
    - Wear index plus textual explanation and simple scale (e.g., “Low”, “Moderate”, “Severe”).
    - Heat load index and color-coded representation (e.g., cool/warm/hot zones).
    - Holistic risk label:
      - “Safe” – all indices below conservative thresholds.
      - “Aggressive” – one or more moderate-to-high risks.
      - “Engine-grenade” – severe combined risk.
  - No real-time physics simulation required; approximated calculations per parameter change are acceptable.

### 4.3 Visualization

- **Engine Visualization (Blazor + Web tech)**
  - Use Canvas, SVG, or WebGL via JS interop (e.g., simple 2D canvas or Three.js) called from Blazor.
  - Show rotor moving in an epitrochoid housing with:
    - Clear depiction of three chambers.
    - Color-coded or labeled active phase for at least one chamber.
  - Visual overlays:
    - Color gradient showing thermal stress distribution (simplified).
    - Simple markers or highlights for seals and their wear state.

- **Interaction**
  - Play/pause/step-through controls for animation.
  - RPM slider influencing animation speed (within safe rendering performance).
  - Responsive layout: visualization should remain usable on typical laptop and tablet screens.

### 4.4 Architecture & Implementation

- **Blazor WebAssembly Only**
  - Entire UI and simulation implemented in the existing `app/` folder.
  - No new `frontend/` or `backend/` folders; treat the Blazor app as both frontend and “logic layer”.
  - Backend services are optional; if needed, they should be minimal and consistent with Blazor hosting model.

- **Code Organization**
  - Pages under `app/Pages/` for core sections (e.g., `Index.razor`, `Simulation.razor`, `Glossary.razor`).
  - Shared components for:
    - Parameter controls.
    - Visualization canvas wrapper.
    - Explanation panels.
  - Static assets (images/diagrams, CSS, JS) in `app/wwwroot/`.

- **APIs & Extensibility**
  - Internal C# service or module representing “EngineSimulationService”:
    - Takes structured input parameters.
    - Returns structured outputs with indices and qualitative labels.
  - Designed so that adding other engines (e.g., 20B, Renesis) mostly involves:
    - New config constants.
    - Possibly additional presets.
    - Limited changes to visualization/layout.

### 4.5 Documentation & Developer Experience

- **README.md in project root**
  - High-level project overview.
  - Clear description of where the Blazor app lives (`app/` directory only).
  - Setup steps including prerequisites (.NET SDK).
  - Instructions to run locally (`dotnet run` inside `app/`).
  - How to open and interact with the simulation.

- **In-App Help**
  - Short descriptions near controls and outputs to prevent misinterpretation.
  - Prominent disclaimer: “Educational simulation, not a tuning recommendation tool.”

## 5. Non-Functional Requirements

- **Performance**
  - Animation and UI remain responsive on typical modern browsers (desktop and tablet).
  - Simulation calculations should be fast (<100ms per input change on normal hardware).
  - Avoid heavy dependencies; keep bundle size reasonable for WebAssembly.

- **Compatibility**
  - Recent versions of major browsers (Chrome, Edge, Firefox, Safari) on desktop.
  - Graceful degradation if WebGL is unavailable (fallback to 2D/SVG if necessary).

- **Usability**
  - Non-engineer friendly language.
  - Clear labeling of dangerous configurations (visual emphasis).
  - No overwhelming walls of text; use structured sections and tooltips.

- **Reliability & Safety**
  - Avoid proprietary/manufacturer-protected data.
  - Avoid implying professional tuning advice.
  - Robust handling of invalid input values (validation and clamping).

- **Maintainability**
  - Separately testable simulation logic (pure C# where possible).
  - Clear comments describing simplifications and assumptions.
  - Logical separation between content, simulation logic, and visualization.

## 6. Constraints & Assumptions

- Must use **Blazor WebAssembly** inside the **existing `app/` folder only**.
- Must **not** create separate `frontend/` or `backend/` directories for the app UI.
- Physics and data are **illustrative** and may be simplified; clarity and honesty are prioritized over realism.
- Initial scope focuses on **Mazda 13B**; architecture should not block future engines.
- Team roles:
  - Research Agent: content, formulas, and validation.
  - Coding Agent: Blazor implementation, visualization, simulation.
  - Reviewer Agent: correctness, usability, and QA.

---
