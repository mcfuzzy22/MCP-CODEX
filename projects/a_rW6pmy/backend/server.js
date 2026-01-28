const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { nanoid } = require('nanoid');

// --------------------------
// In-memory data model
// --------------------------

/**
 * Static categories (10 total).
 * These IDs should be stable so the frontend can rely on them.
 */
const categories = [
  { id: 'rotor_housing', name: 'Rotor Housing' },
  { id: 'rotors', name: 'Rotors' },
  { id: 'eccentric_shaft', name: 'Eccentric Shaft' },
  { id: 'stationary_gears', name: 'Stationary Gears' },
  { id: 'seals', name: 'Seals & Apex Seals' },
  { id: 'intake', name: 'Intake System' },
  { id: 'exhaust', name: 'Exhaust System' },
  { id: 'cooling', name: 'Cooling System' },
  { id: 'fuel', name: 'Fuel & Injection' },
  { id: 'ignition', name: 'Ignition & Electronics' }
];

/**
 * Parts catalog keyed by categoryId.
 * Each part:
 *  - id: unique within catalog
 *  - categoryId: reference
 *  - name: display name
 *  - price: numeric
 *  - required: whether part counts toward completion metric
 */
const partsCatalog = [
  // Rotor Housing
  { id: 'rh-oem-housing', categoryId: 'rotor_housing', name: 'OEM Rotor Housing', price: 1200, required: true },
  { id: 'rh-extended-port', categoryId: 'rotor_housing', name: 'Extended Port Housing', price: 1600, required: true },

  // Rotors
  { id: 'rotor-2mm-apex', categoryId: 'rotors', name: 'Rotors (2mm Apex Groove)', price: 900, required: true },
  { id: 'rotor-3mm-apex', categoryId: 'rotors', name: 'Rotors (3mm Apex Groove)', price: 950, required: true },

  // Eccentric Shaft
  { id: 'es-oem', categoryId: 'eccentric_shaft', name: 'OEM Eccentric Shaft', price: 850, required: true },
  { id: 'es-billet', categoryId: 'eccentric_shaft', name: 'Billet Eccentric Shaft', price: 1450, required: true },

  // Stationary Gears
  { id: 'sg-front', categoryId: 'stationary_gears', name: 'Front Stationary Gear', price: 320, required: true },
  { id: 'sg-rear', categoryId: 'stationary_gears', name: 'Rear Stationary Gear', price: 320, required: true },

  // Seals
  { id: 'seal-apex-2mm', categoryId: 'seals', name: '2mm Apex Seal Set', price: 600, required: true },
  { id: 'seal-apex-3mm', categoryId: 'seals', name: '3mm Apex Seal Set', price: 650, required: true },
  { id: 'seal-side', categoryId: 'seals', name: 'Side & Corner Seal Kit', price: 280, required: true },

  // Intake
  { id: 'intake-oem', categoryId: 'intake', name: 'OEM Intake Manifold', price: 400, required: false },
  { id: 'intake-peripheral', categoryId: 'intake', name: 'Peripheral Port Intake', price: 780, required: false },

  // Exhaust
  { id: 'exh-oem', categoryId: 'exhaust', name: 'OEM Exhaust Manifold', price: 350, required: false },
  { id: 'exh-header', categoryId: 'exhaust', name: 'Performance Header', price: 620, required: false },

  // Cooling
  { id: 'cooling-radiator', categoryId: 'cooling', name: 'Aluminum Radiator', price: 420, required: false },
  { id: 'cooling-oil-cooler', categoryId: 'cooling', name: 'Front-Mount Oil Cooler', price: 380, required: false },

  // Fuel
  { id: 'fuel-oem-injectors', categoryId: 'fuel', name: 'OEM Injector Set', price: 500, required: false },
  { id: 'fuel-highflow-injectors', categoryId: 'fuel', name: 'High-Flow Injector Set', price: 850, required: false },

  // Ignition
  { id: 'ign-oem-coils', categoryId: 'ignition', name: 'OEM Ignition Coils', price: 260, required: false },
  { id: 'ign-upgraded-coils', categoryId: 'ignition', name: 'Upgraded Coil Pack', price: 480, required: false }
];

// Precompute total required parts for completion calculation.
const totalRequiredParts = partsCatalog.filter(p => p.required).length;

/**
 * Builds store:
 * key: buildId
 * value: {
 *   id: string,
 *   engineFamily: string,
 *   createdAt: ISO string,
 *   selections: Set<string> // partIds
 * }
 */
const builds = new Map();

// --------------------------
// Helper functions
// --------------------------

function computeMetrics(build) {
  const selectedParts = partsCatalog.filter(p => build.selections.has(p.id));

  const selectedRequiredCount = selectedParts.filter(p => p.required).length;
  const completionPercent = totalRequiredParts === 0
    ? 0
    : Math.round((selectedRequiredCount / totalRequiredParts) * 100);

  const totalCost = selectedParts.reduce((sum, p) => sum + (p.price || 0), 0);

  const warnings = [];

  // Static warning examples plus selection-based behavior.
  if (completionPercent < 100) {
    warnings.push({
      code: 'INCOMPLETE_BUILD',
      message: 'Build is incomplete. Some required core components are not selected.'
    });
  }

  if (totalCost > 8000) {
    warnings.push({
      code: 'HIGH_COST',
      message: 'Total cost is high. Consider reviewing selected performance parts.'
    });
  }

  // Simple selection-based logic:
  const has2mmApex = build.selections.has('seal-apex-2mm');
  const has3mmApex = build.selections.has('seal-apex-3mm');
  if (has2mmApex && has3mmApex) {
    warnings.push({
      code: 'CONFLICTING_APEX',
      message: 'Both 2mm and 3mm apex seal sets are selected. Choose one specification.'
    });
  }

  const summary = {
    text: `Engine family: ${build.engineFamily || 'unspecified'} · ${selectedParts.length} parts selected · ${completionPercent}% complete`,
    engineFamily: build.engineFamily,
    selectedCount: selectedParts.length,
    selectedRequiredCount,
    totalRequiredCount: totalRequiredParts
  };

  return {
    summary,
    completion: completionPercent,
    cost: totalCost,
    warnings
  };
}

function serializeBuild(build) {
  const metrics = computeMetrics(build);

  return {
    id: build.id,
    engineFamily: build.engineFamily,
    createdAt: build.createdAt,
    selections: Array.from(build.selections),
    categories,
    parts: partsCatalog,
    ...metrics
  };
}

// --------------------------
// Express app setup
// --------------------------

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --------------------------
// Routes
// --------------------------

/**
 * POST /api/builds
 * Creates a new build with default state.
 * Request body example:
 * {
 *   "engineFamily": "13B-REW"
 * }
 *
 * Response:
 * {
 *   "id": "build_123",
 *   "engineFamily": "13B-REW",
 *   "createdAt": "...",
 *   "selections": [],
 *   "categories": [...],
 *   "parts": [...],
 *   "summary": {...},
 *   "completion": 0,
 *   "cost": 0,
 *   "warnings": [...]
 * }
 */
app.post('/api/builds', (req, res) => {
  const engineFamily = (req.body && req.body.engineFamily) || 'Generic Rotary';

  const id = `build_${nanoid(8)}`;
  const build = {
    id,
    engineFamily,
    createdAt: new Date().toISOString(),
    selections: new Set()
  };

  builds.set(id, build);

  res.status(201).json(serializeBuild(build));
});

/**
 * GET /api/builds/:id
 * Returns build details including catalog and metrics.
 */
app.get('/api/builds/:id', (req, res) => {
  const id = req.params.id;
  const build = builds.get(id);
  if (!build) {
    return res.status(404).json({ error: 'Build not found' });
  }

  res.json(serializeBuild(build));
});

/**
 * POST /api/builds/:id/selections
 * Accepts selection changes for parts and recomputes metrics.
 *
 * Request body shape:
 * {
 *   "add": ["partId1", "partId2"],      // optional
 *   "remove": ["partId3", "partId4"]    // optional
 * }
 *
 * Both arrays are optional; if both are missing or empty,
 * the call is treated as a no-op.
 *
 * Response:
 * {
 *   "summary": {...},
 *   "completion": 50,
 *   "cost": 1234,
 *   "warnings": [...]
 * }
 */
app.post('/api/builds/:id/selections', (req, res) => {
  const id = req.params.id;
  const build = builds.get(id);
  if (!build) {
    return res.status(404).json({ error: 'Build not found' });
  }

  const { add, remove } = req.body || {};

  if (Array.isArray(add)) {
    for (const partId of add) {
      if (partsCatalog.some(p => p.id === partId)) {
        build.selections.add(partId);
      }
    }
  }

  if (Array.isArray(remove)) {
    for (const partId of remove) {
      build.selections.delete(partId);
    }
  }

  const metrics = computeMetrics(build);
  res.json(metrics);
});

/**
 * DELETE /api/builds/:id/selections
 * Clears or updates selections and recomputes metrics.
 *
 * Request body shape:
 * {
 *   "partIds": ["partId1", "partId2"],  // optional
 *   "clearAll": true                    // optional
 * }
 *
 * Behavior:
 * - If clearAll is true, all selections are removed (ignores partIds).
 * - Else if partIds provided, only those partIds are removed.
 * - Else (no body or neither field), all selections are removed.
 *
 * Response matches POST /selections:
 * {
 *   "summary": {...},
 *   "completion": 0,
 *   "cost": 0,
 *   "warnings": [...]
 * }
 */
app.delete('/api/builds/:id/selections', (req, res) => {
  const id = req.params.id;
  const build = builds.get(id);
  if (!build) {
    return res.status(404).json({ error: 'Build not found' });
  }

  const body = req.body || {};
  const { partIds, clearAll } = body;

  if (clearAll === true || (!body || (!partIds || partIds.length === 0))) {
    // Clear all selections
    build.selections = new Set();
  } else if (Array.isArray(partIds)) {
    for (const partId of partIds) {
      build.selections.delete(partId);
    }
  }

  const metrics = computeMetrics(build);
  res.json(metrics);
});

// --------------------------
// Start server
// --------------------------

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Rotary Builder stub backend listening on http://localhost:${port}`);
});
