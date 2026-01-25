Rotary Engine Interactive Web Simulator – Wireframe (Text/ASCII)

Note: Layout is conceptual; exact sizes/responsiveness left to implementation.

---

GLOBAL LAYOUT (DESKTOP)
=======================

+------------------------------------------------------------+
| LOGO / TITLE       | Overview | How It Works | Simulation |
|                    | Glossary                                |
+------------------------------------------------------------+
|                                                        |
|                  PAGE CONTENT AREA                     |
|                                                        |
+------------------------------------------------------------+
|  Short disclaimer · About · Educational notice         |
+------------------------------------------------------------+


OVERVIEW PAGE
=============

+------------------------------------------------------------+
| [H1] Rotary Engine Explorer                               |
| [Sub] Learn how Mazda-style rotary engines work...        |
|                                                            |
| [CTA Button] Start with the Basics  [CTA] Try Simulation   |
+------------------------------------------------------------+
|  [Image/Diagram: simple 13B layout]                        |
+------------------------------------------------------------+
|  [Section: What is a rotary engine?]                       |
|   - short paragraph                                        |
+------------------------------------------------------------+
|  [Section: Why this simulator?]                            |
|   [3 columns]                                              |
|   (1) Understand basics  (2) See motion  (3) Try settings  |
+------------------------------------------------------------+


HOW IT WORKS PAGE
=================

+------------------------------------------------------------+
| [H1] How a Rotary Engine Works                            |
| [Sub] Step through the four phases of the cycle.          |
+------------------------------------------------------------+
|  LEFT (phases)              |  RIGHT (diagram)             |
|  -------------------------- | ---------------------------- |
|  [Step list / tabs]         |   +----------------------+   |
|  (1) Intake                 |   |   Rotor in housing   |   |
|  (2) Compression            |   |  with chamber labels |   |
|  (3) Combustion             |   |  and phase colors    |   |
|  (4) Exhaust                |   +----------------------+   |
|                             |  [Buttons: Play | Pause]     |
+------------------------------------------------------------+
| [Info cards: Rotor, Seals, Eccentric Shaft, Failure Modes] |
+------------------------------------------------------------+


SIMULATION PAGE (DESKTOP)
=========================

+------------------------------------------------------------+
| [H1] Interactive 13B Simulation                           |
| [Sub] Adjust basic parameters and see relative effects.   |
+------------------------------------------------------------+
| [DISMISSIBLE BANNER]                                      |
|  "Educational simulation only – not a tuning tool."       |
+------------------------------------------------------------+
| LEFT COLUMN (Controls)   | RIGHT COLUMN (Visualization +  |
| ~35-40% width            | Results) ~60-65% width         |
|--------------------------+--------------------------------|
| [Section] Presets        | [Card] Engine Visualization    |
|  (o) Stock street        |  +--------------------------+  |
|  ( ) Mild street port    |  |  [Canvas/SVG: rotor     |  |
|  ( ) Track/Drift         |  |   & housing, heat map]  |  |
|  [Apply preset tooltip]  |  +--------------------------+  |
|                          |  [Play] [Pause] [Step]         |
|--------------------------+--------------------------------|
| [Section] Parameters     | [Row of metric cards]          |
|  Boost Pressure          |  +---------+ +---------+       |
|   [0 psi]--|====|--[25]  |  | WEAR   | | HEAT   | ...     |
|   [num input]            |  | 0.35   | | 0.52   |         |
|   (safe band colored)    |  | Low    | | Warm   |         |
|                          |  +---------+ +---------+       |
|  AFR                     |  +--------------------------+  |
|   [10]--|====|--[16]     |  | RISK STATUS: Safe       |  |
|   [num input]            |  | [badge: SAFE (green)]   |  |
|   (green band midrange)  |  +--------------------------+  |
|                          |                                |
|  Ignition Timing         | [Panel] Why is this risky?     |
|   (o) Retarded           |  - Short bullet summary        |
|   (•) Stock              |  - Highlight main contributors |
|   ( ) Advanced           |                                |
|   [optional slider +/-]  |                                |
|                          |                                |
|  RPM                     |                                |
|   [500]--|====|--[9000]  |                                |
|   [num input]            |                                |
|                          |                                |
|  Seal Type               |                                |
|   [Dropdown v]           |                                |
|    - Stock               |                                |
|    - Performance         |                                |
|    - Race-only           |                                |
|--------------------------+--------------------------------|
| [Help box: ? What do these controls mean?]                |
+------------------------------------------------------------+


SIMULATION PAGE (MOBILE – STACKED)
==================================

+------------------------------------------------------------+
| [H1] Interactive 13B Simulation                           |
| [Banner disclaimer]                                       |
+------------------------------------------------------------+
| [Card] Engine Visualization                               |
+------------------------------------------------------------+
| [Section] Presets                                         |
+------------------------------------------------------------+
| [Section] Parameters (sliders stacked)                    |
+------------------------------------------------------------+
| [Metric cards stacked: Wear, Heat, Risk]                  |
+------------------------------------------------------------+
| [Why is this risky? explanation box]                      |
+------------------------------------------------------------+


GLOSSARY PAGE
=============

+------------------------------------------------------------+
| [H1] Rotary Glossary                                      |
| [Search box: "Search terms..."]                           |
| [Filter chips: Components | Operation | Tuning | All]     |
+------------------------------------------------------------+
| A                                                          |
|  - Apex seal: short description... [link: see How It Works]|
|  - Air–fuel ratio: ...                                     |
|                                                            |
| C                                                          |
|  - Combustion chamber: ...                                 |
|                                                            |
| E                                                          |
|  - Eccentric shaft: ...                                    |
+------------------------------------------------------------+
