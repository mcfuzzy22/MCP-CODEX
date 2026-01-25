# Agents

This file tracks agent roles and responsibilities for the Rotary Engine Website Project.

The goal of this project is to design and build an interactive, educational, and tool-driven rotary engine website that explains how rotary engines work and provides visual, data-driven insights for enthusiasts, students, and builders.

---

## Agents

### agent-1: Research Agent
**Role:** Domain knowledge, accuracy, and content foundation

**Responsibilities:**
- Research rotary engine fundamentals (13B focus initially):
  - Rotor geometry and motion
  - Apex, side, and corner seals
  - Eccentric shaft operation
  - Intake, compression, combustion, exhaust cycles
- Define simplified physics and behavior models suitable for web visualization
- Provide clear explanations translated from engineering concepts into user-friendly language
- Research common failure modes (apex seal wear, overheating, detonation)
- Gather publicly available specifications (bore equivalents, rotor dimensions, compression ratios, RPM limits)
- Validate assumptions used in simulations and warnings
- Produce reference notes and diagrams for developers and designers
- Ensure technical accuracy while avoiding manufacturer-protected data

**Deliverables:**
- Rotary engine knowledge base (markdown or JSON)
- Simplified math/logic models for wear, heat, and stress
- Glossary of rotary-specific terminology
- Validation notes for simulation assumptions

---

### agent-2: Coding Agent
**Role:** Implementation, architecture, and interactive systems

**Responsibilities:**
- Design overall web architecture (frontend + backend)
- Implement interactive rotary engine visualization:
  - 2D or 3D engine model
  - Animated rotor movement
  - Heat and wear overlays
- Build input systems for user-controlled parameters:
  - Boost pressure
  - AFR
  - Ignition timing
  - RPM range
  - Seal type/material
- Implement simulation logic using simplified physics from Research Agent
- Generate real-time outputs:
  - Predicted wear levels
  - Thermal stress zones
  - Risk warnings (“safe”, “aggressive”, “engine-grenade”)
- Build modular code so new engines (20B, Renesis) can be added later
- Ensure performance and browser compatibility
- Expose clean APIs for future expansion (mobile app, advanced analytics)

**Deliverables:**
- Frontend UI (React / Blazor / Vue or agreed framework)
- Visualization module (Canvas / Three.js / WebGL)
- Simulation and calculation engine
- Backend services (if required)
- Documentation for setup and deployment

---

### agent-3: Reviewer Agent
**Role:** Quality control, usability, and realism checks

**Responsibilities:**
- Review research content for clarity and correctness
- Review simulation outputs for plausibility and consistency
- Test edge cases (extreme boost, lean AFR, high RPM)
- Ensure warnings and predictions make intuitive sense to users
- Verify UI/UX usability for non-engineers
- Check performance, responsiveness, and error handling
- Ensure project scope aligns with time and budget constraints
- Provide feedback loops between Research and Coding agents

**Deliverables:**
- QA reports and test cases
- Usability feedback and improvement notes
- Validation reports on simulation behavior
- Final approval checklist before deployment

---

## Notes
- Initial engine focus: **Mazda 13B-style rotary**
- Physics and predictions are **educational and illustrative**, not manufacturer-certified
- System is designed to scale into:
  - More engines (20B, Renesis)
  - Deeper simulations
  - Builder-style tools
- This file should be updated as new agents, features, or phases are added
