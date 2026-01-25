# EPIC 01: Data Foundation

## Goal
A working MySQL schema + seed data that can compute completion for a build.

## Deliverables
- db/migrations/001_init.sql
- db/seeds/seed_minimal.sql
- docs/DATA_MODEL.md updated with columns
- tests: completion query proves apex seal requirement works

## Tasks
### 01.01 Create base tables
- Category, CategoryTree, CategoryEdge
- EngineFamily, CategoryRequirement
- Part, PartCategory, PartComponent
- Vendor, PartOffering
- Build, BuildSelection

### 01.02 Seed minimal dataset
- engine_family: 13B-REW (rotor_count=2)
- tree: "core"
- categories: apex seals, side seals, coolant seals, etc.
- requirements: formula rules (example: 3 * rotor_count for apex seals)
- parts: at least 30 across categories
- at least 2 kits that expand via BOM

### 01.03 Completion query
- Required per category (formula-aware)
- Supplied pieces per category (kit-expanding)
- Compare required vs supplied => status and progress
