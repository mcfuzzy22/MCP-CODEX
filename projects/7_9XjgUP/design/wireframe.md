Rotary Engine Simulator – Wireframes
====================================

Notation:
- `[]` buttons / toggles
- `()` radio/checkbox
- `-----` separators
- `|` and `+` for basic layout
- ALL CAPS = key regions

1. Home Page (Index)
--------------------

Desktop layout:

+----------------------------------------------------------------------------------+
| TOP NAV BAR: [Rotary Engine Simulator]  Home | Engine Overview | Simulation | ...|
+----------------------------------------------------------------------------------+

+--------------------------------------------------+-------------------------------+
| HERO LEFT                                       | HERO RIGHT                    |
|                                                  |                               |
|  [H1] Explore the 13B Rotary Engine              |  [Image: Rotor + Housing]    |
|  See how tuning affects heat, wear, and risk.    |  (simple diagram/illustr.)   |
|                                                  |                               |
|  [ Start Simulation ]  [ Learn the Basics ]      |                               |
+--------------------------------------------------+-------------------------------+

+------------------------------------------------------------------------------+
| HOW IT WORKS                                                                 |
|------------------------------------------------------------------------------|
|  [Visualize]     [Tweak Settings]           [See Risk]                       |
|  Simple text     Simple text                Simple text                      |
+------------------------------------------------------------------------------+

+------------------------------------------------------------------------------+
| WHO THIS IS FOR                                                              |
|  - Enthusiasts                                                               |
|  - Students                                                                  |
|  - Builders & Tuners                                                         |
+------------------------------------------------------------------------------+

+------------------------------------------------------------------------------+
| DISCLAIMER SNIPPET                                                           |
|  This tool is educational only... [Read full disclaimer]                     |
+------------------------------------------------------------------------------+

Footer (common):
+------------------------------------------------------------------------------+
| Short disclaimer | © Project Name | Links: About & Disclaimers               |
+------------------------------------------------------------------------------+


2. Engine Overview Page
-----------------------

+----------------------------------------------------------------------------------+
| TOP NAV BAR                                                                      |
+----------------------------------------------------------------------------------+

Content (single column with side images):

[H1] 13B Rotary Engine Overview

[Section] What Is a Rotary Engine?
+--------------------------------------------------+-----------------------------+
| Text: simple explainer                           | Image: simplified engine   |
+--------------------------------------------------+-----------------------------+

[Section] Major Components
+--------------------------------------------------+-----------------------------+
| Text bullets: rotor, housing, eccentric shaft... | Labeled diagram             |
| Each label may show tooltip on hover             | [Rotor] [Housing] ...       |
+--------------------------------------------------+-----------------------------+

[Section] Four Phases (Intake, Compression, Combustion, Exhaust)
+----------------------------------------------------------------------------+
| [Intake]  [Compression]  [Combustion]  [Exhaust] (color tiles)             |
| short descriptions below each                                              |
+----------------------------------------------------------------------------+

[Section] Rotor Motion & Eccentric Shaft
+--------------------------------------------------+-----------------------------+
| Text explanation                                | Diagram / simple motion     |
+--------------------------------------------------+-----------------------------+

[Section] Common Failure Modes
+------------------------------------------------------------------------------+
| - Apex seal wear (short explanation)                                         |
| - Overheating                                                                |
| - Detonation/knock                                                           |
+------------------------------------------------------------------------------+

Bottom:
+------------------------------------------------------------------------------+
| Ready to experiment?  [Go to Simulation]                                     |
+------------------------------------------------------------------------------+


3. Simulation Page
------------------

Desktop, 3-column layout:

+----------------------------------------------------------------------------------+
| TOP NAV BAR                                                                      |
+----------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------+
| LEFT: CONTROLS      | CENTER: VISUALIZER                      | RIGHT: OUTPUTS  |
+----------------------------------------------------------------------------------+

LEFT COLUMN (controls; stacked cards):

+-------------------------------------+
| CARD: Engine & Profile              |
|-------------------------------------|
| Engine Type: [13B-Style Rotary ▾]   |
| Seal Type:  [OEM street ▾]          |
+-------------------------------------+

+-------------------------------------+
| CARD: Tuning Parameters             |
|-------------------------------------|
| Boost Pressure (psi) [ 10 ]        |
| [====|------------] 0       25      |
|  (?) tooltip                        |
|                                     |
| Air–Fuel Ratio (AFR) [ 11.5 ]       |
| [------|---------] 9.0       15.0   |
|  color-coded label “Rich/Safe/Lean” |
|                                     |
| Ignition Timing (° advance) [ 0 ]   |
| [----|-----------] -5       +15     |
|                                     |
| RPM Profile                         |
| ( ) Mostly street                   |
| ( ) Mixed street/track              |
| ( ) High RPM track use              |
+-------------------------------------+

+-------------------------------------+
| CARD: Simulation Settings           |
|-------------------------------------|
| (x) Update automatically            |
|                                     |
| [ Run Simulation ] (disabled if auto|
|  update ON)                         |
|                                     |
| Animation: [▶] [⏸] [Step]           |
| Speed: [---|-----] 0.5x     2x      |
+-------------------------------------+


CENTER COLUMN (visualizer):

+-------------------------------------+
| CARD: Rotary Visualizer             |
|-------------------------------------|
| [ ] Show Heat   [ ] Show Wear       |
| [ ] Show Labels                      |
|-------------------------------------|
|   +-----------------------------+   |
|   |   (SVG/Canvas area)        |   |
|   |   [Housing outline]        |   |
|   |    △ = rotor (rotating)    |   |
|   |   Colored chambers:        |   |
|   |    blue/yellow/orange/gray |   |
|   +-----------------------------+   |
|                                     |
| Phase: [ Intake ]-[Compression]-    |
|         [Combustion]-[Exhaust ]     |
+-------------------------------------+


RIGHT COLUMN (outputs & explanations):

+-------------------------------------+
| CARD: Risk Summary                  |
|-------------------------------------|
|  [ SAFE / AGGRESSIVE / HIGH-RISK ]  |
|  (large text, color background)     |
|  Short explanation:                 |
|   “Settings are relatively gentle…” |
+-------------------------------------+

+-------------------------------------+
| CARD: Indices                       |
|-------------------------------------|
| Apex Seal Wear Index:  35 / 100     |
| [██████░░░░░░░░░] Low               |
|                                     |
| Heat Index:  48 / 100               |
| [████████░░░░░░] Moderate           |
+-------------------------------------+

+-------------------------------------+
| CARD: What’s Driving This?          |
|-------------------------------------|
| - Moderate boost contributes to...  |
| - AFR is slightly rich, reducing... |
| - RPM profile is mostly street...   |
+-------------------------------------+

+-------------------------------------+
| CARD: Try This                      |
|-------------------------------------|
| - Lower boost below 10 psi for...   |
| - Keep AFR below 12.0 under boost.  |
+-------------------------------------+

If extreme inputs:

+-------------------------------------+
| BANNER (top of RIGHT COLUMN)        |
|  ⚠ Inputs are outside model’s       |
|    recommended range; results are   |
|    highly approximate.              |
+-------------------------------------+


Mobile layout (Simulation; top-to-bottom):

1. Rotary Visualizer card
2. Risk Summary card
3. Indices card
4. Controls cards (Engine & Profile, Tuning, Settings)
5. Explanation cards (“What’s Driving This?”, “Try This”)


4. Glossary Page
----------------

+----------------------------------------------------------------------------------+
| TOP NAV BAR                                                                      |
+----------------------------------------------------------------------------------+

[H1] Rotary Glossary

[ Search: ______________________ (🔍) ]

+-----------------------------------------------------------+
| A                                                         |
+-----------------------------------------------------------+
| Apex Seal                                                 |
|  Short definition (1–2 lines). [More ▾]                  |
|  (expanded area if opened)                               |
+-----------------------------------------------------------+
| AFR (Air–Fuel Ratio)                                     |
|  Short definition... [More ▾]                            |
+-----------------------------------------------------------+

+-----------------------------------------------------------+
| C                                                         |
+-----------------------------------------------------------+
| Corner Seal                                               |
|  Short definition... [More ▾]                            |
+-----------------------------------------------------------+

... continues alphabetically ...


5. About & Disclaimers Page
---------------------------

+----------------------------------------------------------------------------------+
| TOP NAV BAR                                                                      |
+----------------------------------------------------------------------------------+

[H1] About & Disclaimers

[Section] About This Project
- Short text.

[Section] Educational Use Only
- Bulleted disclaimers.

[Section] What This Model Does
- List of “Does” and “Does Not”.

[Section] Technical Assumptions (High-Level)
- Short, simple text.

[Section] Credits
- Generic acknowledgments.

Footer as on other pages.
