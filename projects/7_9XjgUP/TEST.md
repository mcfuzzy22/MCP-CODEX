# Rotary Engine Website – Test Plan

## 1. Scope

Covers research accuracy, UI/UX, simulation correctness, and Blazor WebAssembly app behavior for the rotary engine interactive website running in `app/`.

Owners:
- [Designer] – UX, visual clarity, educational flow
- [Frontend] – Blazor UI, visualization behavior
- [Backend] – Simulation logic, data models, service wiring
- [Tester] – System-level testing, regression, validation

---

## 2. Functional Tests

### 2.1 Educational Content & Navigation

**T-01: Basic navigation between main pages**  
[Owner: Frontend]  
**Description:** User can navigate between Home, Engine Overview, Simulation, and Glossary.  
**Acceptance Criteria:**
- A visible navigation menu or links exist to reach all major sections (Home, Overview, Simulation, Glossary or equivalent naming).
- Navigation works without page reload errors in a modern browser (Chrome/Edge/Firefox).
- Active page is clearly indicated (e.g., highlight in nav, title change).

**T-02: Content clarity and completeness**  
[Owner: Designer]  
**Description:** Rotary basics (13B) content is understandable to non-engineers.  
**Acceptance Criteria:**
- Pages include explanations for:
  - Rotor geometry and motion
  - Eccentric shaft
  - Intake/compression/combustion/exhaust cycles
  - Apex, side, and corner seals
- Each section has succinct explanatory text plus at least one supportive diagram or visualization.
- A non-technical user can read through content and answer basic questions in a short informal test (e.g., “What does an apex seal do?”) without confusion.
- Disclaimers about “educational only, not manufacturer-certified” are clearly visible at least once.

**T-03: Glossary availability**  
[Owner: Frontend]  
**Description:** Rotary-specific terms are accessible in a glossary view.  
**Acceptance Criteria:**
- A dedicated glossary page or section exists.
- At least 10 core terms (e.g., apex seal, eccentric shaft, detonation, AFR) are listed with concise definitions.
- Glossary is reachable from the main nav or a clearly labeled link.

---

### 2.2 Visualization & Interaction

**T-04: Rotor animation display**  
[Owner: Frontend]  
**Description:** Visualization of the rotor moving inside the housing.  
**Acceptance Criteria:**
- On the simulation or visualization page, a graphic shows a rotor and housing.
- A “Play/Pause” control starts and stops rotor motion.
- Animation runs smoothly (no major stutters) on a typical modern desktop browser.
- At least one cycle state (e.g., intake, compression) is visually distinguishable (color or label).

**T-05: Cycle visualization**  
[Owner: Designer]  
**Description:** User can perceive different engine cycle phases.  
**Acceptance Criteria:**
- Visualization (or labels) explicitly indicate which phase the rotor is currently in (e.g., text label or highlighted sector).
- In at least one complete rotation sequence, all four phases are presented.
- Explanatory text or legend clarifies color/label meaning.

**T-06: Overlays for heat and wear**  
[Owner: Frontend]  
**Description:** Toggleable overlays for heat and wear are available.  
**Acceptance Criteria:**
- UI provides controls (checkboxes, buttons, or tabs) to show/hide:
  - Heat overlay
  - Wear overlay
- When toggled, the visualization clearly changes to reflect the overlay state.
- Overlays are visually distinguishable (e.g., color gradients, icons, or patterns).

---

### 2.3 Input Controls & Validation

**T-07: Parameter input controls**  
[Owner: Frontend]  
**Description:** User can adjust boost, AFR, ignition timing, RPM, and seal type.  
**Acceptance Criteria:**
- Controls exist for:
  - Boost pressure (slider or numeric input with range)
  - AFR (slider or numeric input)
  - Ignition timing (advance/retard input)
  - RPM range/profile (slider/dropdown)
  - Seal type/material (dropdown or radio buttons)
- Changing any control triggers a visible update in displayed outputs (numbers and/or visualization) within 500 ms.

**T-08: Input range validation**  
[Owner: Backend]  
**Description:** Inputs are validated and constrained to safe numeric ranges for the model.  
**Acceptance Criteria:**
- Boost, AFR, ignition timing, and RPM are clamped or validated to defined min/max values.
- Invalid entries (e.g., text in numeric fields, out-of-range values) are handled gracefully:
  - UI shows an error message or resets to last valid value.
  - No unhandled exceptions appear in browser console.
- Extreme but valid-edge inputs still return bounded outputs (no NaN/infinity in UI).

---

### 2.4 Simulation Outputs

**T-09: Wear index calculation**  
[Owner: Backend]  
**Description:** Simulation computes a normalized wear measure based on user inputs.  
**Acceptance Criteria:**
- Internal model exposes a wear index (e.g., 0–100 or 0–1) for current parameters.
- Wear index is displayed numerically and/or via a visual gauge.
- Increasing RPM and boost, with everything else equal, results in a monotonically non-decreasing wear index (in a test sequence of at least 3 data points).
- Selecting a more robust seal type reduces wear index for the same other parameters, or at least does not increase it.

**T-10: Heat index calculation**  
[Owner: Backend]  
**Description:** Simulation computes a normalized heat/thermal stress index.  
**Acceptance Criteria:**
- Heat index is calculated and displayed for current parameters.
- Leaner AFR and/or higher boost, holding other inputs constant, lead to a higher heat index in test scenarios.
- Heat index reacts within visible UI latency to changed inputs.

**T-11: Risk classification**  
[Owner: Backend]  
**Description:** Overall risk level is computed and explained.  
**Acceptance Criteria:**
- Risk output is one of at least three discrete levels (e.g., “Safe”, “Aggressive”, “Engine-grenade”).
- Clear mapping exists between combined indices (wear, heat, or other) and risk level (documented in code or comments).
- Manipulating inputs from mild to extreme yields at least one example of each risk level.
- UI text clarifies that the risk is illustrative and not a guarantee.

---

## 3. Non-Functional Tests

### 3.1 Performance & Responsiveness

**T-12: Initial load time**  
[Owner: Tester]  
**Description:** Blazor WebAssembly app loads within a reasonable time locally.  
**Acceptance Criteria:**
- On a typical dev machine running `dotnet run` from `app/`, first load of the app in a modern browser completes and becomes interactive within 10 seconds.
- Reloads are faster than first load.

**T-13: Animation performance**  
[Owner: Tester]  
**Description:** Animations remain smooth under normal interaction.  
**Acceptance Criteria:**
- While adjusting parameters and with rotor animation running, the UI remains responsive (no sustained freezes longer than 1 second).
- No runaway CPU or memory behavior is observed in browser task manager for a 5-minute interaction session.

---

### 3.2 Robustness & Error Handling

**T-14: Graceful error messages**  
[Owner: Backend]  
**Description:** App handles internal errors without breaking the UI.  
**Acceptance Criteria:**
- Any simulation failure or unexpected condition is caught and handled by the Blazor app.
- User sees a friendly error message or fallback state; app does not stay blank or crash.
- No unhandled exceptions are visible in the browser console during standard test scripts.

---

### 3.3 Usability & Education

**T-15: Non-engineer usability review**  
[Owner: Designer]  
**Description:** Evaluate how a non-technical person experiences the app.  
**Acceptance Criteria:**
- At least one person with no prior rotary knowledge is asked to:
  - Explain in simple terms how a rotary engine operates after 10–15 minutes.
  - Make the engine “safer” and “more aggressive” using the UI.
- Feedback is documented, and at least one iteration of text/labels is updated based on findings.

**T-16: Disclaimers and expectations**  
[Owner: Tester]  
**Description:** Educational nature and limitations are clearly stated.  
**Acceptance Criteria:**
- At least one global disclaimer is visible (e.g., footer or intro banner).
- Disclaimers mention that:
  - Simulations are approximations and for educational use only.
  - They are not manufacturer-certified tuning advice.

---

## 4. Technical / Project Structure Tests

**T-17: Blazor project run instructions**  
[Owner: Backend]  
**Description:** App runs with the documented commands.  
**Acceptance Criteria:**
- From project root, `README.md` explains:
  - That the Blazor app lives in `app/`.
  - How to run: `cd app` then `dotnet run`.
- Following `README.md` instructions on a clean dev environment successfully starts the app.

**T-18: File structure compliance**  
[Owner: Tester]  
**Description:** Code stays within allowed structure.  
**Acceptance Criteria:**
- No `frontend/` or `backend/` directories exist for the app UI.
- Main Blazor files reside under:
  - `app/Program.cs`
  - `app/Pages/*`
  - `app/wwwroot/*`
- Project builds successfully with `dotnet build` from `app/`.

**T-19: README and CHANGELOG updates**  
[Owner: Tester]  
**Description:** Required documentation files are present and updated.  
**Acceptance Criteria:**
- `README.md` exists in project root and includes:
  - Project description summary.
  - Clear setup and run steps for the Blazor app.
  - Notes on where frontend/backend logic live within `app/`.
- `logs/CHANGELOG.md` exists and contains at least one new line summarizing this run (e.g., date + “Initial interactive 13B simulation implemented”).

---

## 5. Regression & Review

**T-20: Cross-agent review cycle**  
[Owner: Tester]  
**Description:** Research, Coding, and Reviewer agents sign off.  
**Acceptance Criteria:**
- Research Agent confirms technical accuracy of terminology and core concepts.
- Coding Agent reviews simulation behavior and performance.
- Reviewer Agent signs off on a final checklist covering:
  - Content clarity
  - Simulation plausibility
  - UI/UX usability
  - Performance
  - Project scope alignment
