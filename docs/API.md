# API Contracts

## Core Rule
All write endpoints return:
{ summary, completion, cost, warnings }

## Endpoints

### Builds
POST /api/builds
Body: { engine_family_id, tree_id, name }
Returns: { build_id, summary, completion, cost, warnings }

GET /api/builds/{id}
Returns: { build, summary, completion, cost, warnings }

### Selections
POST /api/builds/{id}/selections
Body: { category_id, part_id, qty }
Returns: { summary, completion, cost, warnings }

DELETE /api/builds/{id}/selections
Body: { category_id, part_id }
Returns: { summary, completion, cost, warnings }

### Read panels (no-store)
GET /api/builds/{id}/summary
GET /api/builds/{id}/completion
GET /api/builds/{id}/cost
GET /api/builds/{id}/warnings

### Catalog
GET /api/trees/{tree_id}
GET /api/categories/{id}
GET /api/categories/{id}/parts
Query: filters/sort

GET /api/parts/{id}
GET /api/parts/{id}/offerings
