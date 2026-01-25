# Rotary Engine Interactive Website – Requirements

## 1. Product Overview

An interactive, educational, and tool-driven rotary engine website focused initially on the Mazda 13B-style rotary engine. It runs as a Blazor WebAssembly app and explains how rotary engines work through visualizations, simulations, and data-driven insights for enthusiasts, students, and builders.

Physics and predictions are illustrative and educational only, not manufacturer-certified.

## 2. Target Users

- **Enthusiasts**
  - Car and rotary fans wanting intuitive visual explanations.
- **Students / Learners**
  - Engineering and tech students needing conceptual understanding of rotary operation.
- **Builders / Tuners (entry–mid level)**
  - Hobbyists exploring effects of tuning parameters on wear, heat, and risk.

## 3. Core Product Goals

- Explain rotary (13B) operation with clear, accessible visuals and language.
- Allow users to manipulate key engine parameters and immediately see effects.
- Present risks (wear, heat, detonation risk) in a simple, intuitive way.
- Provide a foundation that can later extend to other engines (20B, Renesis) and deeper simulations.

## 4. Key Features

### 4.1 Educational Content & Visuals

- Overview of rotary engine parts and operation:
  - Rotor geometry and motion
  - Eccentric shaft operation
  - Intake, compression, combustion, exhaust cycles
  - Apex, side, and corner seals
- Clear, user-friendly explanations derived from engineering concepts.
- Glossary of rotary-specific terminology.

### 4.2 Interactive Engine Visualization

- 2D or 3D visualization of a 13B-style rotary engine:
  - Animated rotor movement inside housing.
  - Visual indication of cycles (color or labels for intake, compression, combustion, exhaust).
- Overlays for:
  - Heat distribution / thermal stress zones.
  - Wear “intensity” or risk over time (apex seal, etc.).
- Ability to pause, slow down, and step through cycles.

### 4.3 Simulation Inputs

User-adjustable parameters (via UI controls):

- Boost pressure
- Air–fuel ratio (AFR)
- Ignition timing
- RPM range / operating profile
- Seal type/material (e.g., OEM, upgraded, “race”)

### 4.4 Simulation Outputs

Real-time or near-real-time outputs, based on simplified physics models from the Research Agent:

- Predicted wear levels (especially apex seals, but can include general wear metric).
- Thermal stress / temperature zones.
- Simple risk classification:
  - “Safe”
  - “Aggressive”
  - “Engine-grenade” (or equivalent high-risk label)
- Visualization responds dynamically as inputs change.

### 4.5 Architecture & Extensibility

- Modular simulation logic:
  - Encapsulated models for:
    - Heat behavior
    - Wear behavior
    - Stress/risk computation
  - Engine configuration profiles (start with 13B, but structure allows adding 20B, Renesis later).
- Clear separation between:
  - UI components
  - Visualization/graphics module
  - Simulation/calculation logic
- Structured API-style boundaries within the Blazor app (e.g., services, model classes) for possible future use by mobile apps or advanced analytics.

### 4.6 Quality, Usability & Performance

- Simple and intuitive UI for non-engineers:
  - Clear labels and tooltips
  - Use of colors and graphics instead of dense text
- Performance:
  - Smooth animations on modern browsers
  - Reasonable CPU usage for WebAssembly in typical desktop/laptop environments
- Robustness:
  - Graceful handling of invalid or extreme input values
  - Clear warnings that output is illustrative/approximate

## 5. Technical Constraints & Environment

- **Framework:** Blazor WebAssembly.
- **Project structure:**
  - Use the existing `app/` folder as the Blazor project root.
  - Do NOT create separate `frontend/` or `backend/` folders for the app UI.
- **Code locations:**
  - Main configuration: `app/Program.cs`
  - Pages/views: `app/Pages/*`
  - Static assets (images, JS helpers, CSS): `app/wwwroot/*`
- **Backend:**
  - Primarily client-side (WASM). Only add server/backend services if absolutely necessary; keep any such boundary clean and minimal.
- **Local run instructions:**
  - Must support: `cd app && dotnet run`
- **Deliverables required in project root (not inside app/):**
  - `README.md` – Setup and run instructions, including:
    - Summary of where Blazor frontend (and any backend) live.
    - How to start the app locally.
  - `logs/CHANGELOG.md` – Updated with at least one summary line for this run.
- **Licensing / Data constraints:**
  - Use publicly available, generic specs; avoid manufacturer-protected or proprietary data.
  - Emphasize educational nature of predictions; no claim of OEM endorsement or certification.

## 6. Content & Simulation Requirements

### 6.1 Research & Content

- Create a rotary engine knowledge base (markdown or JSON) that covers:
  - 13B basics, rotor geometry, seal types, cycles, common failure modes.
  - Public specs: approximate rotor dimensions, compression ratios, typical RPM limits, etc.
- Simplified math/logic models (not full CFD/FEA) for:
  - Wear progression (focus on apex seals).
  - Heat buildup and dissipation.
  - Stress indicators relevant to tuning changes.
- Validation notes:
  - Clear documentation of simplifying assumptions.
  - Ranges where model is “reasonable” vs “very approximate.”

### 6.2 Simulation Logic

- Deterministic functions that input:
  - RPM profile, boost, AFR, timing, seal choice.
- And output:
  - Normalized wear index (0–1 or 0–100 scale).
  - Normalized heat index.
  - Risk category derived from thresholds on these indices.
- Ensure:
  - Functions are fast enough for user-interactive updates.
  - Edge cases (extreme values) produce safe, bounded outputs and warnings.

## 7. Non-Goals / Out of Scope (for this phase)

- Exact OEM-accurate performance prediction or tuning guidance.
- Multi-engine comparison tools beyond basic architecture support.
- Deep builder tools (e.g., full tune maps, part selection optimization).
- Production deployment infrastructure; focus is on local run and demo-level quality.
