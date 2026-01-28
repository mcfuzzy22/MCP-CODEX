Rotary Builder MVP – Wireframes (Text / ASCII)
==============================================

Notation
--------

- `[ ]` – Checkbox
- `( )` – Radio
- `>` – Currently selected / active
- `----` – Section separators
- `|` – Column separators

Home Page – Rotary Builder Landing
==================================

Desktop / Wide Layout
---------------------

+--------------------------------------------------------------+
| Rotary Builder                                               |
|--------------------------------------------------------------|
| Configure a rotary engine build and see completion, cost,    |
| and warnings in real time.                                   |
+--------------------------------------------------------------+

 Engine family: [ v Select engine family ▼ ]   [ Create Build ]

 (disabled when no engine family or while loading)

 Optional info panel:

+--------------------------------------------------------------+
| How it works                                                 |
|--------------------------------------------------------------|
| 1. Choose an engine family and create a build.               |
| 2. Select parts by category.                                 |
| 3. Watch completion, cost, and warnings update in real time. |
+--------------------------------------------------------------+

Error example (if POST /api/builds fails):

[✖] Could not create build. Please try again.

Mobile / Narrow Layout
----------------------

Rotary Builder
Configure a rotary engine build and see completion, cost, and
warnings in real time.

Engine family
[ Select engine family ▼ ]

[ Create Build ]

(Secondary explanatory panel below, stacked full width.)


Builder Page – `/builder/{buildId}` – Desktop
=============================================

Overall Layout
--------------

+-----------------------------------------------------------------------+
| Build #1234 – Engine family: 13B         Status: In Progress          |
+-----------------------------------------------------------------------+
|                 |                               |                     |
|  CategoryTree   |         PartsList             |  Summary +         |
|    (left)       |          (center)             |  Warnings (right)  |
|                 |                               |                     |
+-----------------------------------------------------------------------+


Left Rail – CategoryTree
------------------------

+---------------------+-----------------------------------------------+------------------+
| Categories          |                                               |                  |
+---------------------+-----------------------------------------------+------------------+
| > Core              | (active category highlighted)                 |                  |
|   Intake            |                                               |                  |
|   Exhaust           |                                               |                  |
|   Fuel System       |                                               |                  |
|   Ignition          |                                               |                  |
|   Cooling           |                                               |                  |
|   Lubrication       |                                               |                  |
|   Rotors            |                                               |                  |
|   Seals & Gaskets   |                                               |                  |
|   Sensors & Wiring  |                                               |                  |
+---------------------+-----------------------------------------------+------------------+


Center Panel – PartsList (Table Example)
----------------------------------------

                            Parts – Core
+----------------------------------------------------------------------------------------+
| Name                | Description              | Price      | Req. | Select            |
+----------------------------------------------------------------------------------------+
| Apex Seal Set A     | Performance seal set...  | $450.00    | Yes  | [x] Selected      |
+----------------------------------------------------------------------------------------+
| Apex Seal Set B     | Budget-friendly seals... | $280.00    | Yes  | [ ]               |
+----------------------------------------------------------------------------------------+
| Rotor Housing Gen1  | OEM housing for 13B...   | $950.00    | Yes  | [x] Selected      |
+----------------------------------------------------------------------------------------+
| Side Housing Kit    | Includes front/rear...   | $700.00    | No   | [ ]               |
+----------------------------------------------------------------------------------------+
| Eccentric Shaft Pro | Balanced for high RPM... | $1,200.00  | Yes  | [ ]               |
+----------------------------------------------------------------------------------------+

- Selected rows shaded or bordered.
- Required parts marked in “Req.” column (Yes/No or icon).

Inline error (per row, if needed):

| Apex Seal Set A  ... | [ ] |
   ⚠ Could not update selection. Please try again.


Right Rail – SummaryRail + WarningsPanel
----------------------------------------

SummaryRail
~~~~~~~~~~~

+---------------------------+
| Build Summary             |
+---------------------------+
| Completion:  62%          |
| [██████████------      ] |
|                           |
| Total Cost:  $3,530.00    |
|                           |
| Selected 5 of 8 required  |
| parts for engine family   |
| 13B.                      |
+---------------------------+


WarningsPanel
~~~~~~~~~~~~~

+---------------------------+
| Warnings (2)              |
+---------------------------+
| ! Critical: Required apex |
|   seals not fully chosen. |
+---------------------------+
| ! Warning: Multiple core  |
|   housings selected.      |
+---------------------------+

Empty warnings state:

+---------------------------+
| Warnings                  |
+---------------------------+
| No current warnings.      |
+---------------------------+


Builder Page – Tablet / Medium View
===================================

Stacked Summary + Warnings, then Split Categories + Parts
---------------------------------------------------------

+---------------------------------------------------------+
| Build #1234 – Engine family: 13B                        |
+---------------------------------------------------------+

+---------------------------+  (Full width row)
| Build Summary             |
| Completion: 62% [bar]     |
| Total Cost: $3,530.00     |
| Selected 5 of 8 required… |
+---------------------------+

+---------------------------+
| Warnings (2)              |
| ! Critical: ...           |
| ! Warning: ...            |
+---------------------------+

+---------------------+-----------------------------------------------+
| Categories          | Parts – Core                                  |
+---------------------+-----------------------------------------------+
| > Core              | [x] Apex Seal Set A  – $450.00   (Required)   |
|   Intake            | [ ] Apex Seal Set B  – $280.00   (Required)   |
|   Exhaust           | [x] Rotor Housing Gen1 – $950.00 (Required)   |
|   ...               | [ ] Side Housing Kit – $700.00                |
+---------------------+-----------------------------------------------+


Builder Page – Mobile / Narrow View
===================================

Vertical Stack
--------------

Build #1234 – Engine family: 13B

+---------------------------+
| Build Summary             |
| Completion: 62% [bar]     |
| Total Cost: $3,530.00     |
| Selected 5 of 8 required… |
+---------------------------+

+---------------------------+
| Warnings (2)              |
| ! Critical: ...           |
| ! Warning: ...            |
+---------------------------+

+---------------------------+
| Categories ▼              |
+---------------------------+
| > Core                    |
|   Intake                  |
|   Exhaust                 |
|   Fuel System             |
|   ...                     |
+---------------------------+

(Optionally this “Categories” section is collapsible.)

PartsList displayed as cards:

+----------------------------------------------------+
| [x] Apex Seal Set A (Required)                     |
| Price: $450.00                                     |
| Performance seal set for high-RPM use.             |
+----------------------------------------------------+

+----------------------------------------------------+
| [ ] Rotor Housing Gen1 (Required)                  |
| Price: $950.00                                     |
| OEM housing for 13B engines.                       |
+----------------------------------------------------+

(Checkbox/radio at top row; tap entire card toggles selection.)

---

State Transitions (ASCII Overview)
==================================

1. Home (Select engine + Create Build)
   -> POST /api/builds
   -> On success: navigate to `/builder/{buildId}`.

2. `/builder/{buildId}` load
   - Show:
     - Header
     - Skeleton / “Loading…” in parts + summary + warnings.
   - GET /api/builds/:id
   -> On success:
     - Populate CategoryTree (10 items)
     - Show default category parts in PartsList
     - SummaryRail: completion, cost, summary
     - WarningsPanel: list

3. Select part
   - User taps `[ ]` in PartsList row.
   - Row visually toggles to `[x]` and shaded.
   - POST /api/builds/:id/selections (or DELETE for deselect).
   - On response:
     - SummaryRail updates:
       - Completion bar and % value.
       - Total Cost.
       - Summary text.
     - WarningsPanel updates:
       - New warning list, or none.

4. Error on selection
   - Row reverts to previous `[ ]` or `[x]` state.
   - Small inline message under that row: “Couldn’t update selection.”
