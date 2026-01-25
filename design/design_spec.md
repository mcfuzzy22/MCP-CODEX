Rotary Engine Builder – Design Spec
==================================

Overview
--------
Desktop-first builder with 3-column layout:
- Left: Category Tree
- Center: Parts Browser
- Right: Build Summary + Warnings

Primary layout:
- Header: engine family selector + build name + save/export
- Left rail: category tree with status chips (✅/❗/⛔)
- Main: parts list with filters, sort, compare drawer
- Right rail:
  - completion % + missing list
  - cost estimate + cheapest vendor mix
  - warnings/errors panel

Key States
----------
- Empty build (no selections)
- Part selected satisfies category fully (✅)
- Part selected partially satisfies (progress bar)
- Incompatible selection (⛔) with explanation and suggested fixes

Interaction Rules
-----------------
- Selecting a part triggers write endpoint and patches UI from response.
- Removing selection triggers same flow.
- Tree status updates immediately from completion payload.

Accessibility
-------------
- Keyboard nav in tree and list
- Focus outlines visible
- Warnings panel is screen-reader friendly
