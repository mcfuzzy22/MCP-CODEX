# Test & QA Plan

Format: Each task has an `[Owner]` tag and clear acceptance criteria.

## 1. Project Structure & Setup

### 1.1 Blazor App Location & Startup
- **Task:** Verify Blazor WebAssembly app lives in `app/` and can be run locally.
- **Owner:** [Backend]
- **Acceptance Criteria:**
  - `app/` contains a valid Blazor WebAssembly project (`Program.cs`, `Pages/`, `wwwroot/`, project file).
  - Running `dotnet run` from inside `app/` successfully starts the application.
  - App is accessible in a browser at the indicated localhost URL without runtime errors.

### 1.2 README Content & Accuracy
- **Task:** Validate `README.md` in project root.
- **Owner:** [Tester]
- **Acceptance Criteria:**
  - README exists in project root (same level as `app/`).
  - Contains: project overview, prerequisites, setup steps, and run instructions using `dotnet run` in `app/`.
  - Clearly explains where frontend/backend logic live (Blazor app in `app/`).
  - Following README steps on a clean environment successfully runs the app.

## 2. Content & Knowledge Base

### 2.1 Rotary Fundamentals Coverage
- **Task:** Review informational content pages for completeness and clarity.
- **Owner:** [Designer]
- **Acceptance Criteria:**
  - Pages/sections explain:
    - Rotor geometry & motion.
    - Apex, side, and corner seals.
    - Eccentric shaft operation.
    - Intake, compression, combustion, exhaust cycles.
  - Language is understandable by non-engineers (limited jargon, or jargon explained).
  - Diagrams or illustrations (even simple) are present or referenced where appropriate.

### 2.2 Failure Modes & Specs
- **Task:** Confirm common failure modes and basic 13B specs are documented.
- **Owner:** [Designer]
- **Acceptance Criteria:**
  - Content references at least:
    - Apex seal wear/chipping.
    - Overheating.
    - Detonation/pre-ignition.
  - Approximate 13B parameters (displacement description, compression ratio, RPM limits) are present.
  - No proprietary or manufacturer-protected schematics or confidential data are used.
  - Each failure mode description is paired with high-level mitigation or explanation.

### 2.3 Glossary Page
- **Task:** Validate presence and usability of glossary.
- **Owner:** [Designer]
- **Acceptance Criteria:**
  - Dedicated glossary section or page accessible via navigation.
  - Includes key rotary terms (e.g., apex seal, eccentric shaft, epitrochoid, porting, detonation).
  - Terms have concise, user-friendly definitions.
  - Terms used in the app link or reference glossary entries where feasible.

## 3. Simulation Logic

### 3.1 Parameter Input Range Validation
- **Task:** Ensure all simulation inputs validate and constrain user entry.
- **Owner:** [Frontend]
- **Acceptance Criteria:**
  - Boost pressure control enforces a defined range (e.g., 0–25 psi); values outside range are clamped or rejected with user feedback.
  - AFR control enforces valid range (e.g., 10–16); invalid values trigger validation state.
  - Ignition timing only allows defined presets or safe numeric range.
  - RPM slider/input respects min/max RPM; extreme values are handled gracefully.
  - Seal type selection is limited to defined options; no blank/invalid states.

### 3.2 Simulation Output Correctness (Relative)
- **Task:** Verify qualitative correctness of simulation relationships.
- **Owner:** [Backend]
- **Acceptance Criteria:**
  - Increasing boost while holding other values constant increases:
    - Wear index and thermal stress index.
  - Moving AFR leaner (higher number) beyond a safe region increases detonation risk.
  - Advancing ignition timing (within model definition) increases detonation and stress risk, especially at high boost.
  - Higher RPM increases wear and thermal stress more than proportionally or as specified by model.
  - Switching to a “more robust” seal type reduces wear index for the same conditions.

### 3.3 Risk Category Thresholds
- **Task:** Validate risk label mapping from simulation indices.
- **Owner:** [Backend]
- **Acceptance Criteria:**
  - Defined thresholds for “Safe”, “Aggressive”, and “Engine-grenade” are documented in code comments or docs.
  - Multiple test input sets produce each of the three categories.
  - Edge cases near thresholds are tested; categories change consistently and predictably.
  - No combination of extreme inputs fails to produce a risk category (no null/undefined state).

## 4. Visualization & Interaction

### 4.1 Engine Animation Presence
- **Task:** Ensure an engine visualization exists and operates.
- **Owner:** [Frontend]
- **Acceptance Criteria:**
  - A visual representation of a rotary engine (rotor + housing) is displayed on the Simulation or main page.
  - Rotor movement relative to housing is animated.
  - There are at least three distinct “chambers” visible or implied by rotor position.
  - Animation can be started/stopped using UI controls.

### 4.2 RPM-Linked Animation Speed
- **Task:** Verify RPM slider affects animation.
- **Owner:** [Frontend]
- **Acceptance Criteria:**
  - Adjusting RPM slider or control changes the animation speed noticeably.
  - Low RPM yields slow, clearly visible motion.
  - High RPM yields faster motion without breaking the animation or causing major stutters on a typical modern machine.
  - Animation remains within an acceptable performance envelope (no freezing).

### 4.3 Overlays & Visual Feedback
- **Task:** Confirm heat and wear overlays visually respond.
- **Owner:** [Frontend]
- **Acceptance Criteria:**
  - A visual indication (e.g., color gradient, overlay, or icons) represents thermal stress on the engine visualization.
  - When simulation outputs change (e.g., higher heat index), the visual representation updates accordingly (e.g., color shifts toward “hot”).
  - Wear state or risk is visually indicated (e.g., seal markers changing color, or global indicator).
  - Legends or labels explain what colors/indicators mean.

## 5. UI/UX & Usability

### 5.1 Navigation & Information Architecture
- **Task:** Check that core sections are discoverable and logically organized.
- **Owner:** [Designer]
- **Acceptance Criteria:**
  - Navigation/menu includes clear entries for concepts such as “Overview”, “How It Works”, “Simulation”, “Glossary”.
  - Users can reach each key view within two clicks from the landing page.
  - Page titles and headings match their content.

### 5.2 Clarity for Non-Engineers
- **Task:** Validate that typical non-expert users can understand the app.
- **Owner:** [Tester]
- **Acceptance Criteria:**
  - Tooltips or inline help exist near complex controls (AFR, timing, etc.).
  - Risk messages include short, plain-language explanations.
  - No unexplained abbreviations or jargon appear in primary UI text.
  - At least one usability test (informal) is documented in QA notes, with feedback incorporated where feasible.

### 5.3 Disclaimers & Safety Messages
- **Task:** Ensure educational-disclaimer messaging is present.
- **Owner:** [Designer]
- **Acceptance Criteria:**
  - Clear disclaimer appears at or near simulation controls, stating that outputs are educational and not professional tuning advice.
  - Disclaimers are visible on desktop and mobile views without scrolling excessively.
  - No text implies manufacturer endorsement or guarantees.

## 6. Performance & Technical Quality

### 6.1 App Load & Runtime Performance
- **Task:** Measure app load and runtime responsiveness.
- **Owner:** [Tester]
- **Acceptance Criteria:**
  - Application loads and becomes interactive in a reasonable time on a typical dev machine (subjectively acceptable but not excessively slow).
  - Adjusting parameters updates outputs and visualization with no noticeable lag (>0.5s) for normal usage.
  - No console errors or unhandled exceptions occur during typical user journeys.

### 6.2 Browser Compatibility
- **Task:** Validate app across major browsers (desktop).
- **Owner:** [Tester]
- **Acceptance Criteria:**
  - App works in latest Chrome, Edge, and Firefox on desktop (and Safari where available).
  - Core features (navigation, controls, simulation, visualization) are functional in all tested browsers.
  - If any browser has limited support (e.g., WebGL issues), this is documented with known issues and, if possible, a fallback is present.

### 6.3 Code Structure & Extensibility
- **Task:** Inspect code for modularity and future engine expansion.
- **Owner:** [Backend]
- **Acceptance Criteria:**
  - A dedicated simulation service/class accepts an “engine configuration” or equivalent structure.
  - Adding a new engine type (20B, Renesis) would primarily involve new configuration parameters rather than rewriting core logic.
  - Comments or documentation note where and how to extend to additional engine types.
  - No unnecessary duplication of logic across components.

## 7. QA & Review Process

### 7.1 Content and Simulation Review Loop
- **Task:** Establish and complete review passes between roles.
- **Owner:** [Tester]
- **Acceptance Criteria:**
  - Research Agent signs off on technical content accuracy and documented assumptions.
  - Coding Agent signs off on correct implementation of formulas and constraints.
  - Reviewer Agent provides at least one consolidated QA report with:
    - Issues found.
    - Suggested improvements.
    - Final approval checklist with status.

---
