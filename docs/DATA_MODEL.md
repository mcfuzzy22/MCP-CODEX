# Data Model (MySQL)

## Core Concepts
- Categories are reusable nodes that can appear in multiple trees.
- Requirements are per-engine-family per-category (exact/min/formula).
- Parts can belong to multiple categories.
- Kits expand via BOM (PartComponent).
- Completion compares supplied vs required per category in real-time.

## Must-have Tables
- Category, CategoryTree, CategoryEdge
- EngineFamily
- CategoryRequirement
- Part, PartCategory, PartComponent
- Vendor, PartOffering
- Build, BuildSelection

## Typed Attributes + Rules (for compatibility and filters)
Add:
- AttributeDef, PartAttribute (+ optional EngineAttribute)
- CompatRule(scope, condition_expr, message, severity)

This supports conditions like:
- build.port_type='bridge' AND category='intake-gasket' AND part.gasket_type!='B' => error
