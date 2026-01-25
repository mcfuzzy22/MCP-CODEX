Rotary Engine Interactive Web Simulator – UI/UX Design Spec  
Version: 1.0  
Scope: Blazor WebAssembly app living entirely in `app/`

---

## 1. Information Architecture & Navigation

**Global Shell**

- Top navigation bar (persistent, responsive):
  - Logo/title (left): “Rotary Engine Explorer”
  - Nav items (right / centered on large screens, collapsed into hamburger on small):
    - Overview
    - How It Works
    - Simulation
    - Glossary
- Footer (persistent, minimal):
  - Short disclaimer summary and link/anchor to full disclaimer in Simulation page.
  - Links: “About this project”, “Educational disclaimer”.

**Pages**

1. **Overview (`Index.razor`)**
   - Hero: Intro text + “Start with the Basics” (CTA to How It Works) + “Jump to Simulation” (CTA).
   - Sections:
     - “What is a Rotary Engine?” – short, non-technical summary.
     - “Why This Simulator?” – bullets for enthusiasts, students, builders.
     - “What You’ll Learn” – 3-column feature highlights (Basics, Visualization, Experiment).
   - Visual: Static diagram/illustration of a 13B layout (image from `wwwroot`).

2. **How It Works (`HowItWorks.razor`)**
   - Left: Stepper or vertical timeline for four phases:
     - Intake, Compression, Combustion, Exhaust.
   - Right: Static/simplified animated diagram panel:
     - Shows rotor in housing; phase labels, color overlays.
   - Phase selection controls:
     - Clickable tabs or numbered stepper (1–4).
     - Optional “Play cycle” button to auto-advance phases.
   - Below:
     - Short explanation cards:
       - Rotor & eccentric shaft
       - Seals (apex, side, corner)
       - Common failure modes (brief, with links to glossary terms via anchor/hover).

3. **Simulation (`Simulation.razor`)**
   - Primary interactive workspace.
   - Responsive two-column layout on desktop; stacked on mobile:
     - Left Column: Parameter Controls + Presets.
     - Right Column: Visualization + Output Panels + Explanation.
   - Clear, persistent **disclaimer banner** at top of content area:
     - “Educational simulation only – not a tuning recommendation tool” with an info icon and expandable detailed text.

4. **Glossary (`Glossary.razor`)**
   - Simple searchable list of terms from `GLOSSARY_ROTARY_TERMS.md`.
   - Layout:
     - Search box + filter chips (e.g., “Components”, “Operation”, “Tuning”).
     - Alphabetical list with term, 1–2 line definition, and links back into relevant pages (e.g., “See in How It Works”).

---

## 2. Core Interaction Layout – Simulation Page

### 2.1 High-Level Layout (Desktop)

- **Header area (full width)**
  - Page title: “Interactive 13B Simulation”
  - Subtitle: One-line description.
  - Disclaimer banner.

- **Main body – Two columns**

  **Left: “Engine Setup & Controls” (~35–40% width)**
  - Section A – Presets
    - Radio buttons or pill buttons:
      - Stock street
      - Mild street port
      - Track/Drift
    - Each shows short description below when selected (e.g., “Low boost, conservative timing”). Applying a preset updates sliders.

  - Section B – Key Parameters
    - Form-like vertical control group with clear labels, units, ranges, helper text, and clamping:
      1. Boost Pressure
         - Slider: 0–25 psi.
         - Numeric input box synced with slider.
         - Safe range band visually highlighted on slider (e.g., 0–10 psi faint green).
         - Helper text: “0 = naturally aspirated. Higher boost increases power and stress.”
      2. Air–Fuel Ratio (AFR)
         - Slider: 10:1–16:1 (display as `AFR: 11.5:1`).
         - Colored safe band (e.g., ~11:1–12.5:1 for boost) in green; lean and very rich zones in yellow/red.
         - Helper text: “Too lean or too rich can increase heat and risk.”
      3. Ignition Timing
         - Options:
           - Radio/pill presets: Retarded, Stock, Advanced.
           - When expanded/advanced mode: slider in degrees relative to stock (e.g., -5° to +5°).
         - Helper text: simple wording: “More advanced timing can improve response but increases knock risk.”
      4. RPM
         - Slider: 500–9,000 rpm.
         - Readout text: “Current simulation RPM: 7,000 rpm (high track use)”.
         - Influence label: indicates effect on animation speed.
      5. Seal Type / Material
         - Dropdown:
           - Stock (OEM steel)
           - Performance (upgraded)
           - Race-only
         - Under label, 1-line explanation: “Affects wear resilience at high stress.”

  - Section C – Info / Help
    - Small collapsible help box: “What do these controls represent?” with short paragraphs and links to glossary terms.

  **Right: “Visualization & Results” (~60–65% width)**

  - Subsection 1 – Engine Visualization Panel
    - Card-like container, fixed aspect ratio (e.g., 16:9).
    - Top bar:
      - Label: “Rotor Motion & Heat Map”
      - RPM display mirrored from slider.
    - Main canvas:
      - SVG or Canvas placeholder region.
      - Visual elements:
        - Housing outline with clear three-lobed epitrochoid.
        - Rotor triangle with chamfered corners.
        - Highlighted working chambers with phase color or labels.
        - Optional overlay gradient to show heat (cool = blue, normal = green, hot = orange/red).
      - Play / Pause / Step controls (under canvas):
        - Play/Pause toggle.
        - Step: “Advance one phase”.
        - Speed toggle or rely on RPM slider as speed control (label: “Animation speed tied to RPM”).

  - Subsection 2 – Simulation Outputs
    - Three primary cards, color-coded but accessible:
      1. Wear Index
         - Prominent label: “Wear Level”.
         - Dial/bar meter representing 0–1 normalized value.
         - Qualitative label: Low / Moderate / High.
         - Short explanation: “High RPM and boost increase seal and bearing wear.”
      2. Thermal Stress
         - Bar or thermometer-style meter, 0–1.
         - Color gradient matching heat overlay colors.
         - Label: Cool / Warm / Hot.
         - Text: “Leaner mixtures and high RPM/boost increase heat load.”
      3. Detonation / Risk
         - Risk label badge:
           - Safe (green)
           - Aggressive (amber)
           - Engine-grenade (red)
         - Supporting secondary metrics:
           - “Detonation tendency: Low / Moderate / Severe”
         - Text: “High boost, lean AFR, and advanced timing increase detonation risk.”

  - Subsection 3 – “Why is this risky?” Explanation Box
    - Dynamic text area that summarises key reasons for current risk level:
      - E.g.: “You’re running relatively lean (13.8:1) at 8,500 rpm with advanced timing. This combination significantly increases detonation risk and thermal load.”
    - Uses simple bullet points and bolded phrases.
    - Contains reminder: “Trends only – not precise tuning advice.”

---

## 3. Visual Design Notes

- **Overall Look & Feel**
  - Clean, educational, slightly technical but approachable.
  - Light theme by default.
  - Primary accents:
    - Primary blue or teal (trust/technology).
    - Secondary orange/red used only for risk/heat emphasis.
  - Plenty of whitespace, minimal dense text.

- **Typography**
  - Sans-serif fonts (e.g., system UI or something Bootstrap-compatible).
  - Headings: 1–2 levels only on each page.
  - Body text: short paragraphs, bullet points preferred.

- **Color & Accessibility**
  - Use color plus text (don’t rely on color alone):
    - Risk labels always include text: “Safe (low combined risk)”.
    - Heat and wear cards include icons (e.g., thermometer, warning triangle).
  - Contrast checked for major UI elements.
  - Red only for clearly negative state (“Engine-grenade”) and severe warnings.

- **Animation Considerations**
  - Animation should be smooth but not overly busy.
  - Allow pausing; respect users who may not want motion (play default can be medium).
  - Animation speed scaled with RPM, but with a cap for legibility.

---

## 4. Content Strategy & Microcopy

- **Tone**
  - Non-engineer-friendly, conversational but precise.
  - Avoid jargon in headings; when used, immediately defined or linked to glossary.

- **Callouts**
  - Use “Did you know?” callout boxes in Overview/How It Works:
    - Short 1–2 sentence facts about rotaries (e.g., “Each rotor face completes a power stroke every revolution of the eccentric shaft.”) – consistent with knowledge base.

- **Disclaimers**
  - Appears:
    - In Simulation page header banner (always visible).
    - In footer of all pages (short version with link).
  - Wording guidance:
    - Make clear that physics are simplified, approximate, and non-authoritative.
    - Explicitly state: “Not a tuning recommendation tool” and “Does not replace professional advice.”

---

## 5. Responsive Behavior

- **Desktop (>= 992px)**
  - Two-column layout as described.
  - Navigation menu full width.

- **Tablet (768–991px)**
  - Two columns but slightly stacked; simulation visualization may move above outputs.
  - Params panel collapsible to accordion groups.

- **Mobile (< 768px)**
  - Single-column stacked order:
    - Disclaimer
    - Visualization (so user sees something visual first)
    - Controls
    - Outputs
    - Explanations
  - Nav bar collapses into hamburger menu.

---

## 6. Components Overview (Design-Level)

- **Layout Components**
  - `MainLayout`: header/nav, body, footer.
  - `PageHeader`: title + subtitle + optional icon.

- **Simulation-Specific Components**
  - `PresetSelector`:
    - Shows preset options with short text.
  - `ParameterControlPanel`:
    - Groups all sliders/inputs with inline helper text.
  - `EngineVisualizer`:
    - Encapsulates canvas/SVG + animation controls.
  - `MetricCard`:
    - Generic visual card for Wear / Heat / Risk with:
      - Title, numeric index, qualitative label, icon, and color scheme.
  - `RiskSummaryPanel`:
    - “Why is this risky?” explanation wrapper.

- **Glossary Components**
  - `GlossarySearchBar`
  - `GlossaryList`
  - `GlossaryItem`

The Coding Agent should implement these as Blazor components but can adjust naming as needed, preserving this conceptual structure.

---

## 7. Extensibility Considerations (Design-Level)

- Engine selection (13B vs future engines) can eventually be a dropdown near presets.
- Layout and components are neutral to specific engine; only labels and presets change.
- Visualization should assume the possibility of:
  - Different housing shapes (but same high-level pane: housing outline, rotor, chambers).
  - Engine-specific info in the header (e.g., “Mazda 13B” text label now, changeable later).

---

## 8. Page-Specific UX Notes

**Overview**
- Keep text concise; link for “Learn more about rotaries” that jumps into How It Works, scrolled to fundamentals section.

**How It Works**
- Use hover/click “info pins” over rotor/housing diagram:
  - Clicking “apex seal” shows a small tooltip or side panel with explanation.

**Simulation**
- Changes to sliders should:
  - Immediately update metrics with a slight fade-in/fade-out to indicate recalculation, but no jarring transitions.
- Risk states:
  - When entering “Engine-grenade”:
    - Show a prominent but friendly warning callout near risk card.

**Glossary**
- Terms alphabetically grouped with sticky letter headers (A, B, C...) for quick scanning.

---

End of design spec.
