Rotary Engine Interactive Simulator – Design Specification
=========================================================

1. Design Goals
---------------

- Make rotary engine concepts visually intuitive for non-engineers.
- Allow “playful tinkering” with parameters while clearly surfacing risk.
- Keep mental load low: simple navigation, short labels, strong visual hierarchy.
- Respect technical constraints:
  - Blazor WebAssembly, single-page app feel with multiple routed pages.
  - Visualization implementable via SVG/Canvas/WebGL with optional JS interop.

2. Information Architecture
---------------------------

### 2.1 Primary Navigation (Top App Bar)

- **Logo/Title**: “Rotary Engine Simulator”
- **Nav links** (left-to-right):
  - Home
  - Engine Overview
  - Simulation
  - Glossary
  - About & Disclaimers
- **Theme / speed control (right side)**:
  - Animation speed selector (for visualizer) or simple slider.
  - Optional light/dark toggle (future; not required in first pass).

### 2.2 Pages

1. **Home (Index)**  
   - High-level intro and “Call to Explore” buttons.
2. **Engine Overview**  
   - Educational content with static/low-interaction diagrams.
3. **Simulation**  
   - Core interactive area: parameter inputs + visualization + outputs.
4. **Glossary**  
   - Searchable list of terms.
5. **About & Disclaimers**  
   - Educational nature, model limitations, credits.

3. Global Layout & Visual Style
-------------------------------

### 3.1 Layout Structure

- **Top App Bar** (persistent on all pages)
  - 60–72px height.
  - Contains title, navigation links, and small controls.
- **Content Area**
  - Centered, max-width ~1200–1320px on large screens.
  - Padding: 16–24px.
- **Footer** (persistent)
  - Short disclaimer summary.
  - Link to full About & Disclaimers page.

### 3.2 Visual Design

- **Color Palette (suggested)**
  - Background: Light gray off-white (`#F5F5F7`) or white.
  - Primary accent: Deep blue (`#1F4F7B`) for headers and CTAs.
  - Secondary accent: Warm orange/red (`#E86F3E`) for combustion / high heat indicators.
  - Safe indicators: Green (`#24A148`).
  - Warning indicators: Amber (`#F1C21B`).
  - Danger indicators: Red (`#DA1E28`).
- **Typography**
  - Headings: Sans-serif, larger weights for hierarchy (e.g., 600).
  - Body: Clear sans-serif; avoid dense paragraphs.
  - Use consistent heading levels `h1–h4` to structure content.
- **Iconography**
  - Simple line icons (question mark for help, “i” for info, flame for heat, wrench for wear).
- **Visual Language**
  - Use colors & simple shapes (triangles, epitrochoid housing outline) to explain ideas.
  - Avoid overly realistic “car culture” imagery; prioritize diagrams over photos.

### 3.3 Responsiveness

- **Desktop (≥1024px)**
  - Simulation page: 2–3 column layout (Controls | Visualizer | Outputs).
- **Tablet (768–1023px)**
  - Two-column stacked: Controls (top/left) and Visualizer/Outputs (right/bottom).
- **Mobile (<768px)**
  - Single column vertical order:
    1. Visualizer
    2. Outputs
    3. Controls
    4. Explanations/help

4. Page-Level Designs
---------------------

### 4.1 Home Page (Index)

**Purpose**: Introduce the app, guide users to Overview or Simulation.

**Content & Sections**

1. **Hero Section**
   - Left:
     - Title: “Explore the 13B Rotary Engine”
     - Short subtitle: “See how a rotary engine breathes, burns, and wears as you tune it.”
     - Primary CTA button: “Start Simulation”
     - Secondary CTA: “Learn the Basics”
   - Right:
     - Static stylized rotor + housing illustration (image asset).
     - Optional micro-animation (CSS-based) if cheap to implement.

2. **How It Works (Three Columns)**
   - Column 1: “Visualize”
     - Icon: simple engine outline.
     - One-line description.
   - Column 2: “Tweak Settings”
     - Icon: sliders.
   - Column 3: “See Risk”
     - Icon: gauge or warning triangle.

3. **Who This Is For**
   - Three bullets:
     - Enthusiasts
     - Students
     - Builders/Tuners
   - Very short, approachable text.

4. **Educational Disclaimer Snippet**
   - Brief sentence: “This tool is for learning, not for tuning your real engine.”
   - “Read full disclaimer” link to About & Disclaimers page.

**Interactions**

- Buttons navigate via Blazor routing:
  - “Start Simulation” → `/simulation`
  - “Learn the Basics” → `/engine-overview`

### 4.2 Engine Overview Page

**Purpose**: Step-by-step explanation of 13B operation and components.

**Layout**

- Title & intro paragraph.
- Vertical sections, each with:
  - Left/Top: Subheading + short explanatory text.
  - Right/Bottom: Static diagram or simplified illustration.

**Key Sections**

1. **What Is a Rotary (Wankel) Engine?**
   - High-level description.
2. **Major Components**
   - Rotor, housing, eccentric shaft, intake/exhaust ports, apex/side/corner seals.
   - Diagram with labels.
3. **Four “Cycles” in Rotary Form**
   - Use color-coded tiles (blue = intake, yellow = compression, orange = combustion, gray = exhaust).
   - Each tile:
     - Short 1–2 sentence summary.
4. **Rotor Motion & Eccentric Shaft**
   - Simple animation (optional) or diagram: triangle orbiting an offset circle.
5. **Common Failure Modes**
   - Short bullet list, each with short explanation and icon:
     - Apex seal wear
     - Overheating
     - Detonation/knock

**Micro Interactions**

- Hover/tap on labeled parts in images:
  - Show small tooltip with name & 1-line definition (reused from glossary data).
- “Try these settings in the Simulation” link at the bottom, leading to `/simulation`.

### 4.3 Simulation Page

**Purpose**: Core playground for tuning parameters and seeing effects.

#### 4.3.1 Overall Layout (Desktop)

- **Left Column (or Panel)** – *Input Controls*
  - Card “Engine & Profile”
  - Card “Tuning Parameters”
  - Card “Simulation Settings”
- **Center Column** – *Visualizer*
  - Animated rotor & housing.
  - Overlays and phase labels.
- **Right Column** – *Outputs & Explanation*
  - Risk summary card with large label & color.
  - Gauges/bars for wear & heat.
  - Text explanation & example guidance.

#### 4.3.2 Controls Panel

**Card: Engine & Profile**

- Engine Type (disabled or basic for now):
  - Dropdown: “13B-Style Rotary (default)” (others greyed for future).
- Seal Type:
  - Dropdown:
    - “OEM street”
    - “Upgraded performance”
    - “Race-focused”

**Card: Tuning Parameters**

- **Boost Pressure**
  - Slider + numeric input:
    - Range: 0–25 psi.
    - Default: 7–10 psi (mild).
  - Tooltip/info icon:
    - Explain that more boost increases power and also heat/stress.
- **Air–Fuel Ratio (AFR)**
  - Slider + numeric:
    - Range: 9.0 (rich) – 15.0 (lean).
    - Default: 11.0–12.0 (safe-rich for boost).
  - Color-coded label while moving:
    - Rich → blue/green
    - Stoich ~14.7 highlight
    - Lean >14.7 → yellow/red warning.
- **Ignition Timing (Advance)**
  - Slider:
    - Range: -5° (retarded) to +15° (advanced) from a notional base.
    - Default: 0°.
  - Tooltip: explain tradeoff: more advance → power & heat / knock risk.
- **RPM Range / Profile**
  - Control style:
    - Two numeric boxes: “Typical cruise RPM” and “Typical peak RPM” (e.g., 2500–8000).
    - OR single slider: “Usage intensity” with text presets:
      - “Mostly street (low–mid RPM)”
      - “Mixed street/track”
      - “High RPM track use”
    - Implementation shortcut: value mapped to a normalized RPM index.
  - Tooltip: highlight that high sustained RPM increases wear/heat.

**Card: Simulation Settings**

- Checkbox: “Update results automatically as I move sliders”
  - Default: ON.
- If automatic is OFF:
  - Button: “Run Simulation” (prominent).
- Animation controls (affect visualizer only):
  - Play/Pause button.
  - Speed slider (0.5x–2x).
  - “Step one phase” button:
    - Moves rotor to next cycle (Intake → Compression → Combustion → Exhaust).

#### 4.3.3 Visualizer Panel

**Elements**

- Main canvas (SVG/Canvas):
  - Epitrochoid housing outline.
  - Triangular rotor with labeled apexes A, B, C.
  - Colored chamber regions:
    - Blue: Intake
    - Yellow: Compression
    - Orange: Combustion
    - Gray: Exhaust
  - Small arrow or rotating eccentric shaft depiction.

- Overlays (toggles at top-right of visualizer card):
  - “Show Heat” (checkbox or pill toggle)
    - Heatmap overlay: colors from cool blue → red over housing.
  - “Show Wear” (checkbox)
    - Highlights apex regions; color intensity maps to wear index.
  - “Show Labels”
    - Toggles text for phases & parts.

- Phase Indicator
  - Small horizontal stepper below canvas:
    - [ Intake ] – [ Compression ] – [ Combustion ] – [ Exhaust ]
  - Highlight current phase as animation runs or when stepping.

**Interactions**

- Play / Pause:
  - Animates rotor rotation and color cycling.
- Step phase:
  - Instantly updates rotor to specific canonical orientation for the selected phase.
- Changing inputs:
  - Smooth transition of heat and wear overlays (e.g., fade in/out, color changes) after simulation recomputes outputs.

#### 4.3.4 Outputs & Explanation Panel

**Risk Summary Card**

- Large label and color-coded background:
  - Green: “Safe”
  - Orange: “Aggressive”
  - Red: “High-Risk (Engine-Grenade Zone)”
- Short explanation sentence tailored to risk level:
  - Safe: “These settings are relatively gentle for a 13B-style street setup.”
  - Aggressive: “…may be suitable for short bursts; expect accelerated wear.”
  - High-Risk: “…very high stress; this is for educational ‘what-if’ only.”

**Indices & Gauges**

- Wear Index (0–100):
  - Horizontal bar or radial gauge.
  - Text: “Apex Seal Wear Index” plus status (“Low”, “Medium”, “High”).
- Heat Index (0–100):
  - Similar gauge.
  - Status: “Cool”, “Moderate”, “Hot”.
- Optional combined “Stress Indicator”:
  - Simple gauge with mechanical pointer and color segments.

**Context & Guidance Text**

- “What’s driving this risk?”
  - 2–5 bullet points generated from simple rules:
    - Example: “High boost increases combustion pressure and heat.”
    - “Lean AFR near 14.7 at high boost increases detonation risk.”
    - “Frequent high RPM operation increases seal wear per hour.”
- “Try This”
  - Suggest 1–2 simple adjustments:
    - “Try reducing boost to <10 psi” or “Richen AFR below 12.0 for safer operation.”

**Edge Case Handling**

- If input values exceed recommended ranges:
  - Show a non-blocking warning banner at top/right of Outputs panel:
    - “Inputs are beyond the range where this simplified model is reasonable. Interpret these results with extra caution.”
  - Use neutral but noticeable styling (yellow background).

### 4.4 Glossary Page

**Purpose**: Provide accessible definitions and support learning while exploring.

**Layout**

- Title & intro text.
- Search/filter bar at top:
  - Textbox: “Search terms (e.g., ‘apex seal’, ‘AFR’)”
- Term list:
  - Alphabetical, grouped by first letter.
  - Each item:
    - Term (bold).
    - Simple definition (1–2 sentences).
    - “More” toggle (optional) expanding to a slightly more detailed explanation or diagram thumbnail.

**Interactions**

- Typing in search filter:
  - Filters visible terms (client-side).
- Clicking a term:
  - Could show a small popover with diagram snippet (optional).
- Glossary entries reused:
  - Same data used to power tooltips throughout the site via shared service.

### 4.5 About & Disclaimers Page

**Purpose**: Clearly communicate educational nature & limitations.

**Sections**

1. **About This Project**
   - Short narrative about purpose and target users.
2. **Educational-Only Disclaimer**
   - Emphasize:
     - Not OEM-certified.
     - Not tuning advice.
     - Simulations are highly simplified and approximate.
3. **What the Model Does & Does Not Do**
   - Bulleted:
     - “Does: show relative trends when changing boost/AFR/timing/etc.”
     - “Does NOT: predict real-world horsepower, EGT, or engine lifetime.”
4. **Technical Notes (High-Level)**
   - Brief explanation that more detail lives in internal docs (SimulationModelNotes etc.) but high-level assumptions can be summarized in user-friendly language.
5. **Credits / Contact Placeholder**
   - Generic credit for development team and technologies (Blazor WebAssembly).

5. Components & Interaction Design
----------------------------------

### 5.1 Top Navigation Bar Component

- Left:
  - Clickable logo/title, navigating to Home.
- Center/right:
  - Nav links (router links) with active state styling.
- On small screens:
  - Collapse to a hamburger icon:
    - Slide-down menu with same links.

### 5.2 Cards

- Used for:
  - Parameter groups.
  - Risk & indices.
  - Educational sections.
- Card style:
  - Slight elevation/shadow.
  - Clear title.
  - Internal vertical spacing ~16px.

### 5.3 Sliders & Inputs

- All sliders:
  - Labeled with unit and min/max values.
  - Display numeric value in a small box next to slider to allow precise tweaks.
- Input validation:
  - Clamp values to safe numerical ranges.
  - If invalid (non-numeric), show inline error message and revert to last valid value.

### 5.4 Tooltips & Help

- Each major parameter label:
  - Info icon (`?`).
  - Hover (desktop) or tap (mobile) opens short tooltip:
    - 1-line summary & “Learn more in Glossary” link.
- Visualizer:
  - Legend overlay or small button at corner: “What do these colors mean?”
  - Clicking shows small legend:
    - Phase colors and overlay colors definitions.

### 5.5 Banners & Alerts

- Non-obtrusive banners above outputs area for:
  - Extreme input ranges outside model’s validity.
  - Informational messages (e.g., “Auto-update is off. Click ‘Run Simulation’ to refresh results.”).

6. States & Flows
-----------------

### 6.1 Normal Flow

1. User lands on Home.
2. Clicks “Learn the Basics” → reads Engine Overview.
3. Navigates to Simulation.
4. Adjusts boost/AFR/timing:
   - Immediate recalculation & visual update (if auto-update on).
5. Sees risk go from “Safe” to “Aggressive”; reads explanation bullets.
6. Opens Glossary via a term tooltip or nav to clarify jargon.

### 6.2 Error/Edge Flows

- **Extreme Inputs**
  - Example: 25 psi boost, 15.0 AFR, 9000+ RPM.
  - Behavior:
    - Wear & heat indices capped at maximum.
    - Risk level is “High-Risk (Engine-Grenade Zone)”.
    - Warning banner about model limitations.
- **Auto-Update Off**
  - User changes an input.
  - Visual subtle highlight on “Run Simulation” button (e.g., pulse).
- **Mobile Navigation**
  - Hamburger menu opens & closes reliably.
  - Visualizer may be smaller or simplified; overlays still work.

7. Accessibility Considerations
-------------------------------

- Color choices:
  - Ensure contrast ratios sufficient for WCAG AA at least for text & important indicators.
- Don’t rely solely on color:
  - Use labels (“Safe”, “Aggressive”, etc.) and icons to convey meaning.
- Keyboard interactions:
  - All primary controls (sliders, buttons, toggles) focusable and operable via keyboard.
- ARIA roles/labels:
  - For visualizer, use aria-label (e.g., “Rotary engine animation showing current combustion phase and heat overlay”).

8. Data & State Mapping (High-Level)
------------------------------------

- **Simulation Inputs (front-end representation)**
  - `boostPsi` (0–25)
  - `afr` (9.0–15.0)
  - `timingAdvanceDeg` (-5 to +15)
  - `rpmProfile` (0–1 normalized or discrete enum: Street / Mixed / Track)
  - `sealType` (enum: OEM, Upgraded, Race)
  - `engineType` (enum, currently only 13B)
- **Simulation Outputs**
  - `wearIndex` (0–100)
  - `heatIndex` (0–100)
  - `riskLevel` (Safe / Aggressive / EngineGrenade)
  - `notes` (list of explanatory bullet strings)
  - `suggestions` (list of suggestion strings)
- These map 1:1 to the UI components described above.

9. Asset & Implementation Notes for Designers & Developers
----------------------------------------------------------

- Diagrams:
  - Use simple, licensed or custom-drawn images placed under `app/wwwroot/img/`.
  - Provide at least:
    - Overall engine diagram.
    - Rotor in housing schematic.
    - Simple icons for heat/wear.
- Visualizer:
  - Can start as basic SVG animation (rotating polygon inside path) before enhancement.
- Glossary & tooltips:
  - Backed by JSON or markdown described by Research Agent; UI assumes easily bindable structure with `term`, `shortDefinition`, `longDefinition`.

This design is intentionally modular so that structural elements (cards, sliders, outputs) map cleanly to Blazor components and services, with clear extension points for more advanced engine types or simulation depth later.

---
