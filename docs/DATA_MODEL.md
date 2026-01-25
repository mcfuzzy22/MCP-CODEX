# Data Model (MySQL)

## Core Concepts
- Categories are reusable nodes that can appear in multiple trees.
- Requirements are per-engine-family per-category (exact/min/formula).
- Parts can belong to multiple categories.
- Kits expand via BOM (PartComponent).
- Completion compares supplied vs required per category.

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

## Table Sketch (minimum columns)

Category
- category_id PK
- slug UNIQUE
- name
- description
- is_selectable BOOL
- created_at, updated_at

CategoryTree
- tree_id PK
- slug UNIQUE
- name
- description

CategoryEdge
- tree_id FK
- parent_category_id FK
- child_category_id FK
- position INT
PK(tree_id,parent_category_id,child_category_id)

EngineFamily
- engine_family_id PK
- code UNIQUE (13B-REW)
- rotor_count INT
- notes
- years_start, years_end NULLABLE

CategoryRequirement
- engine_family_id FK
- category_id FK
- tree_id NULLABLE
- requirement_type ENUM('exact_count','min_count','formula')
- required_qty DECIMAL NULLABLE
- formula TEXT NULLABLE
PK(engine_family_id,category_id,COALESCE(tree_id,0))

Part
- part_id PK
- sku UNIQUE NULLABLE
- name
- brand
- is_kit BOOL
- pieces_per_unit DECIMAL
- uom ENUM('piece','set','kit')
- status ENUM('active','deprecated')

PartComponent
- parent_part_id FK
- child_part_id FK
- qty_per_parent DECIMAL
PK(parent_part_id,child_part_id)

PartCategory
- part_id FK
- category_id FK
- is_primary BOOL
- display_order INT
PK(part_id,category_id)

Vendor
- vendor_id PK
- name
- website

PartOffering
- offering_id PK
- part_id FK
- vendor_id FK
- price DECIMAL(12,2)
- currency
- url
- in_stock BOOL
- effective_from
- effective_to NULLABLE

Build
- build_id PK
- user_id (stub ok)
- engine_family_id FK
- tree_id FK
- name
- created_at

BuildSelection
- build_id FK
- category_id FK
- part_id FK
- qty DECIMAL
PK(build_id,category_id,part_id)
