# Project: Rotary Engine Builder (RotorBase / PCPartPicker-style)

## 1. Product Summary
A web app that lets users build a rotary engine spec by selecting parts from category trees.
It computes:
- completion status per category (✅ complete, ❗missing, ⛔incompatible)
- warnings/errors from compatibility rules
- estimated cost + cheapest vendor mix
Later: optional 3D “socket picker” (Tarkov-style).

## 2. Target Users
- Rotary enthusiasts building engines (RX-7/RX-8, swaps)
- Beginners learning what parts are required
- Builders comparing kits vs singles and vendor pricing

## 3. MVP Goals
MVP must support:
1) Choose engine family (start with 13B-REW)
2) Browse category tree (systems/subsystems)
3) Add parts (single parts or kits)
4) Compute completion: required vs supplied pieces (formula-aware)
5) Show warnings/errors (rules engine)
6) Show cost estimate from vendor offers
7) Export/share build list (JSON + “shopping list”)

## 4. Non-Goals (MVP)
- Full authentication (stub user_id is ok)
- Perfect manufacturer-OEM fitment coverage
- Full automatic scraping
- Full 3D picker (only scaffolding allowed)

## 5. Core Data Rules
- Categories are reusable nodes across multiple trees (tree/edge model).
- Requirements are rows in CategoryRequirement, keyed by engine_family + category (+ optional tree).
- Parts can belong to multiple categories via PartCategory (many-to-many).
- Kits expand via PartComponent BOM recursion.
- Completion is computed by comparing supplied pieces vs required pieces.

## 6. System Contracts (Hard Rules)
- Every write endpoint returns: {summary, completion, cost, warnings}
- UI updates from write responses (avoid stale re-fetch loops)
- GET endpoints for state use Cache-Control: no-store

## 7. Success Criteria
- A fresh repo clone can run locally and demo:
  - 1 engine family
  - 1 tree with ~30 parts
  - completion and warnings updating instantly
