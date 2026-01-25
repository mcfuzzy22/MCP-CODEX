- Pre-checks  
  - [ ] Confirm repository structure:
    - [ ] `app/` directory exists.
    - [ ] `README.md` exists in project root.
    - [ ] `logs/CHANGELOG.md` exists in `logs/`.
  - [ ] From `app/`, list contents and verify presence of:
    - [ ] `Program.cs`
    - [ ] `Pages/`
    - [ ] `wwwroot/`
    - [ ] `Data/` or equivalent knowledge base folder.
    - [ ] `Services/` and `Models/` (or equivalent) for simulation logic.
    - [ ] `Components/` or `Shared/` for visualization components.
  - [ ] Verify knowledge base and model documentation files exist:
    - [ ] `app/Data/RotaryKnowledge.md` or `app/Data/rotary-knowledge.json`
    - [ ] `app/Data/SimulationModelNotes.md`
    - [ ] `app/Data/RotaryGlossary.json` or glossary content file
    - [ ] `app/Data/ModelValidation.md`
  - [ ] Verify QA artifacts (Reviewer agent deliverables) exist:
    - [ ] `app/QA/TestCases.md`
    - [ ] `app/QA/QAReport-<date>.md`
    - [ ] `app/QA/UsabilityNotes.md`
    - [ ] `app/QA/SimulationValidation.md`
    - [ ] `app/QA/FinalChecklist.md`

- Build & Run Sanity  
  - [ ] From `app/`, run `dotnet build` and verify:
    - [ ] Build succeeds without errors.
  - [ ] From `app/`, run `dotnet run` and verify:
    - [ ] Application starts successfully.
    - [ ] Console output shows a listening URL (e.g., `http://localhost:5xxx`).
  - [ ] Open the app URL in a modern browser (Chrome/Edge/Firefox).

- T-01: Basic navigation between main pages  
  Manual steps:
  - [ ] Locate a navigation menu or header in the running app.
  - [ ] Verify presence of links or nav items for:
    - [ ] Home (or equivalent, e.g., “Index” / “Overview”).
    - [ ] Engine Overview.
    - [ ] Simulation.
    - [ ] Glossary.
  - [ ] Click each link in turn and verify:
    - [ ] The corresponding page content is displayed.
    - [ ] No page reload errors or Blazor error UI appears.
    - [ ] Active page is clearly indicated (e.g., highlighted nav item, page title, or heading change).

- T-02: Content clarity and completeness  
  Manual steps:
  - [ ] Open Engine Overview (or equivalent educational page).
  - [ ] Confirm presence of explanations for:
    - [ ] Rotor geometry and motion.
    - [ ] Eccentric shaft operation.
    - [ ] Intake, compression, combustion, and exhaust cycles.
    - [ ] Apex, side, and corner seals.
  - [ ] Verify that each of the above topics has:
    - [ ] Succinct explanatory text.
    - [ ] At least one diagram or visualization (image, SVG, or embedded visual component).
  - [ ] Confirm a visible disclaimer indicating:
    - [ ] Educational use only.
    - [ ] Not manufacturer-certified.
  - [ ] (Optional usability spot-check) Ask a non-technical reader (or self-evaluate) if the content answers:
    - [ ] “What does an apex seal do?”
    - [ ] “What are the main four strokes/phases of the cycle in this rotary context?”

- T-03: Glossary availability  
  Manual steps:
  - [ ] Navigate to the Glossary page/section using main nav or clear link.
  - [ ] Count listed glossary entries and confirm:
    - [ ] At least 10 distinct terms are defined.
  - [ ] Ensure key terms are present with concise definitions:
    - [ ] Apex seal
    - [ ] Side seal
    - [ ] Corner seal
    - [ ] Eccentric shaft
    - [ ] Detonation / knock
    - [ ] AFR (Air–Fuel Ratio)
    - [ ] Boost
    - [ ] Ignition timing (advance/retard)
  - [ ] Verify glossary is reachable from the primary navigation or a clearly marked link.

- T-04: Rotor animation display  
  Manual steps:
  - [ ] Open the Simulation (or Visualization) page.
  - [ ] Confirm:
    - [ ] A graphic or diagram of rotor and housing is visible.
  - [ ] Locate Play/Pause (or Start/Stop) animation control.
  - [ ] Click Play:
    - [ ] Rotor motion begins.
    - [ ] At least one cycle state is visually distinguishable (e.g., colored chamber, label).
  - [ ] Click Pause:
    - [ ] Rotor motion stops or visibly freezes.
  - [ ] Observe for 10–20 seconds:
    - [ ] No obvious stutters or pauses beyond brief frame hitches on a typical machine.

- T-05: Cycle visualization  
  Manual steps:
  - [ ] With animation running, verify:
    - [ ] There is an indicator showing the current cycle phase (text label, highlighted sector, or overlay).
  - [ ] Observe at least one full rotor cycle:
    - [ ] Intake phase appears.
    - [ ] Compression phase appears.
    - [ ] Combustion phase appears.
    - [ ] Exhaust phase appears.
  - [ ] Verify there is a legend or explanatory text clarifying the meaning of colors/labels used for phases.

- T-06: Overlays for heat and wear  
  Manual steps:
  - [ ] On the Simulation/Visualization page, locate controls for:
    - [ ] Heat overlay toggle.
    - [ ] Wear overlay toggle.
  - [ ] With animation running or static image displayed:
    - [ ] Toggle Heat overlay on and off:
      - [ ] Visualization changes visibly when Heat overlay is enabled.
      - [ ] Change is reverted when disabled.
    - [ ] Toggle Wear overlay on and off:
      - [ ] Visualization clearly changes to represent wear when enabled.
      - [ ] Change is reverted when disabled.
  - [ ] Verify heat and wear states are visually distinguishable (e.g., distinct color gradients or styling).

- T-07: Parameter input controls  
  Manual steps:
  - [ ] On Simulation page, locate controls for:
    - [ ] Boost pressure.
    - [ ] AFR.
    - [ ] Ignition timing.
    - [ ] RPM range/profile.
    - [ ] Seal type/material.
  - [ ] Confirm control types:
    - [ ] Boost: slider or numeric with defined range.
    - [ ] AFR: slider or numeric.
    - [ ] Ignition timing: slider or numeric, labeled as advance/retard.
    - [ ] RPM: slider or dropdown for ranges/profiles.
    - [ ] Seal type: dropdown or radio buttons with at least OEM/upgraded/race or similar.
  - [ ] For each control:
    - [ ] Change value and verify simulation outputs (numeric indices, risk label, or visualization) update within ~500 ms.
    - [ ] Confirm outputs are not stale (e.g., labels refresh).

- T-08: Input range validation  
  Manual steps:
  - [ ] Identify documented or UI-indicated min/max values for:
    - [ ] Boost.
    - [ ] AFR.
    - [ ] Timing.
    - [ ] RPM.
  - [ ] For numeric inputs allowing direct text:
    - [ ] Enter an out-of-range high value and blur/focus-out:
      - [ ] Value is clamped to max or reset to last valid value.
      - [ ] No red error in developer console.
    - [ ] Enter an out-of-range low value and blur:
      - [ ] Value is clamped/reset.
      - [ ] No unhandled errors.
    - [ ] Enter invalid text (e.g., `abc`, empty string):
      - [ ] UI shows validation message or restores previous valid value.
      - [ ] No NaN or `Infinity` appears in outputs.
  - [ ] For sliders:
    - [ ] Verify slider handles stop at defined endpoints and do not exceed.
  - [ ] Check that extreme but in-range values produce finite numeric outputs with no Blazor error UI.

- T-09: Wear index calculation  
  Manual steps:
  - [ ] Locate displayed wear index (number and/or gauge).
  - [ ] Confirm visible scale (e.g., 0–1, 0–100) from label or UI.
  - [ ] Fix inputs other than RPM and boost (AFR, timing, seal type constant).
  - [ ] Perform a 3–4 point test:
    - [ ] Low RPM + low boost: record wear index.
    - [ ] Medium RPM + same boost: record index.
    - [ ] High RPM + same boost: record index.
    - [ ] Verify wear index is monotonically non-decreasing across these points.
  - [ ] With RPM fixed:
    - [ ] Low boost -> record wear.
    - [ ] Medium boost -> record wear.
    - [ ] High boost -> record wear.
    - [ ] Verify non-decreasing wear index with increasing boost.
  - [ ] Seal type test:
    - [ ] Use a fixed set of inputs and switch from OEM to upgraded/race:
      - [ ] Confirm wear index decreases or at least does not increase for more robust seal types.

- T-10: Heat index calculation  
  Manual steps:
  - [ ] Locate displayed heat index.
  - [ ] With timing and RPM fixed:
    - [ ] Set richer AFR (higher fuel, lower AFR number if modeled accordingly); record heat.
    - [ ] Set leaner AFR; record heat.
    - [ ] Confirm leaner AFR leads to higher heat index.
  - [ ] With AFR fixed:
    - [ ] Low boost -> record heat.
    - [ ] Medium boost -> record heat.
    - [ ] High boost -> record heat.
    - [ ] Confirm heat index increases with boost.
  - [ ] Verify heat index updates quickly when changing controls and remains within defined numeric bounds.

- T-11: Risk classification  
  Manual steps:
  - [ ] Locate risk output label (e.g., “Safe”, “Aggressive”, “Engine-grenade”).
  - [ ] Confirm at least three distinct risk levels are possible (via documentation or trying scenarios).
  - [ ] Mild scenario:
    - [ ] Low RPM, low/no boost, safe AFR, conservative timing, robust seals.
    - [ ] Confirm risk level is “Safe” or equivalent.
  - [ ] Moderate scenario:
    - [ ] Medium RPM and boost, slightly lean but not extreme, moderate timing advance.
    - [ ] Confirm risk moves to “Aggressive” or mid-tier label.
  - [ ] Extreme scenario:
    - [ ] High RPM, high boost, lean AFR, advanced timing, less robust seals.
    - [ ] Confirm risk moves to highest risk category (“Engine-grenade” or similar).
  - [ ] Check UI text near risk output:
    - [ ] Confirms risk is illustrative and not a guarantee / not tuning advice.
  - [ ] Inspect code or documentation (e.g., SimulationModelNotes, service code) to:
    - [ ] Verify mapping from wear/heat indices to risk thresholds is clearly documented.

- T-12: Initial load time  
  Manual steps:
  - [ ] Stop any running instance, then from `app/` run `dotnet run`.
  - [ ] In browser, open the app URL and:
    - [ ] Use a timer to measure from first load request to interactive UI (navigation usable).
    - [ ] Confirm time is ≤ 10 seconds on dev machine.
  - [ ] Reload the page (Ctrl+R/F5):
    - [ ] Confirm reload time is faster than initial load (subjectively or timed).

- T-13: Animation performance  
  Manual steps:
  - [ ] Start rotor animation and enable overlays (heat and wear).
  - [ ] Interact for ~5 minutes:
    - [ ] Adjust sliders for RPM, boost, AFR, timing repeatedly.
    - [ ] Toggle overlays on/off several times.
  - [ ] During interaction, observe:
    - [ ] No UI freeze longer than 1 second.
    - [ ] No repeated Blazor error dialogs.
  - [ ] Optionally open browser task manager:
    - [ ] Confirm CPU and memory usage remain stable (no continual upward trend suggesting leak).

- T-14: Graceful error messages  
  Manual steps:
  - [ ] Intentionally create edge conditions:
    - [ ] Enter borderline values quickly in sequence.
    - [ ] Toggle overlays rapidly.
    - [ ] Rapidly change multiple sliders while animation is running.
  - [ ] Monitor browser console for:
    - [ ] No unhandled exceptions.
    - [ ] If exceptions occur, verify that UI continues functioning (no blank screen).
  - [ ] If any internal error UI appears:
    - [ ] Confirm user-facing message is friendly and non-technical where possible.
    - [ ] Confirm app recovers or can be reset without full browser restart.

- T-15: Non-engineer usability review  
  Manual steps (manual process – record outcome in QA docs):
  - [ ] Ask at least one non-engineering person (or approximate by role-playing) to:
    - [ ] Spend 10–15 minutes with the app.
    - [ ] Afterwards, explain in their own words how a rotary engine operates.
    - [ ] Use the UI to “make the engine safer” and “make it more aggressive”, describing what they changed.
  - [ ] Collect feedback:
    - [ ] Any confusing terminology.
    - [ ] Any unclear cause-effect between controls and outputs.
  - [ ] Confirm at least one iteration of text/labels was updated (check commit or QA notes).

- T-16: Disclaimers and expectations  
  Manual steps:
  - [ ] Confirm a global disclaimer appears:
    - [ ] In footer, header, or an intro banner.
  - [ ] Text should indicate:
    - [ ] Simulations are approximations.
    - [ ] Educational use only.
    - [ ] Not manufacturer-certified, not professional tuning advice.
  - [ ] Verify disclaimers are visible without hidden or collapsible-only placement.

- T-17: Blazor project run instructions  
  Manual steps:
  - [ ] Open root `README.md` and verify it includes:
    - [ ] Statement that Blazor WebAssembly app lives in `app/`.
    - [ ] Prerequisites (e.g., .NET SDK version).
    - [ ] Run steps:
      - [ ] `cd app`
      - [ ] `dotnet run`
    - [ ] Default app URL or note about where to browse.
    - [ ] Description of where frontend/simulation logic reside (e.g., `Pages/`, `Services/`, `Models/`).
  - [ ] On a clean environment (or as close as possible), follow README exactly:
    - [ ] Confirm app starts successfully as described.

- T-18: File structure compliance  
  Manual steps:
  - [ ] From project root, verify:
    - [ ] No `frontend/` directory exists for this app.
    - [ ] No `backend/` directory exists for this app.
  - [ ] Confirm primary Blazor artifacts:
    - [ ] `app/Program.cs` present.
    - [ ] UI pages in `app/Pages/`.
    - [ ] Static assets in `app/wwwroot/`.
  - [ ] From `app/`, run `dotnet build`:
    - [ ] Confirm build success with no structural-related errors.

- T-19: README and CHANGELOG updates  
  Manual steps:
  - [ ] Open `README.md` and check for:
    - [ ] Project description summary mentioning rotary engine simulator and educational focus.
    - [ ] Clear setup & run steps for Blazor app (`cd app && dotnet run`).
    - [ ] Explanation of where:
      - [ ] Frontend UI lives (e.g., `Pages/`, `Components/`).
      - [ ] Simulation/backend-like logic lives (e.g., `Services/`, `Models/` within `app/`).
  - [ ] Open `logs/CHANGELOG.md`:
    - [ ] Confirm the file exists.
    - [ ] Verify at least one new entry for this run, including:
      - [ ] Date.
      - [ ] Summary mentioning interactive 13B simulation/visualization or QA/signoff.

- T-20: Cross-agent review cycle  
  Manual steps:
  - [ ] Open QA documents under `app/QA/`:
    - [ ] `SimulationValidation.md` for Research vs. implementation alignment.
    - [ ] `QAReport-<date>.md` for executed tests.
    - [ ] `FinalChecklist.md` for signoff status.
  - [ ] Check for explicit signoff statements from:
    - [ ] Research Agent (terminology and concept accuracy).
    - [ ] Coding Agent (simulation behavior and performance).
    - [ ] Reviewer Agent (content clarity, UI/UX, performance, scope).
  - [ ] Confirm FinalChecklist indicates:
    - [ ] All critical tests from `TEST.md` are covered (pass or documented deviation).
    - [ ] Disclaimers present and app runs via `cd app && dotnet run`.
    - [ ] No major usability blockers noted.

- Reporting  
  - [ ] Record pass/fail status for each test T-01 through T-20 in:
    - [ ] `app/QA/QAReport-<date>.md` (or update existing report).
  - [ ] For any failed test:
    - [ ] Document reproduction steps.
    - [ ] Expected vs. actual result.
    - [ ] Suggested fix or follow-up owner.
