const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Utility helpers ---

function clamp(value, min, max) {
  if (typeof value !== 'number' || Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

const SEAL_TYPES = {
  stock: { id: 'stock', label: 'Stock', wearFactor: 1.0 },
  performance: { id: 'performance', label: 'Performance', wearFactor: 0.9 },
  race: { id: 'race', label: 'Race-only', wearFactor: 1.2 }
};

const IGNITION_TIMING_PRESETS = {
  retarded: { id: 'retarded', label: 'Retarded', advanceDeg: -5 },
  stock: { id: 'stock', label: 'Stock', advanceDeg: 0 },
  advanced: { id: 'advanced', label: 'Advanced', advanceDeg: 5 }
};

// --- Core simulation logic ---
// This mirrors what the Blazor EngineSimulationService is expected to do.
// It is intentionally deterministic and uses only simple arithmetic.

function evaluateSimulation(input) {
  // 1. Normalize / clamp inputs
  const rpm = clamp(input.rpm ?? 3000, 500, 9000);
  const boostPsi = clamp(input.boostPsi ?? 0, 0, 25);
  const afr = clamp(input.afr ?? 12.0, 10.0, 16.0);
  const sealTypeKey = typeof input.sealType === 'string'
    ? input.sealType.toLowerCase()
    : 'stock';
  const timingKey = typeof input.ignitionTiming === 'string'
    ? input.ignitionTiming.toLowerCase()
    : 'stock';

  const sealType = SEAL_TYPES[sealTypeKey] || SEAL_TYPES.stock;
  const timing = IGNITION_TIMING_PRESETS[timingKey] || IGNITION_TIMING_PRESETS.stock;

  const rpmNorm = (rpm - 500) / (9000 - 500); // 0–1
  const boostNorm = boostPsi / 25;            // 0–1

  // 2. Wear index
  const baseWear = 0.15 * rpmNorm + 0.5 * boostNorm;
  const sealWearFactor = sealType.wearFactor;
  let wearIndex = baseWear * sealWearFactor + 0.05;
  wearIndex = clamp(wearIndex, 0, 1);

  let wearLabel;
  if (wearIndex < 0.33) wearLabel = 'Low';
  else if (wearIndex < 0.66) wearLabel = 'Moderate';
  else wearLabel = 'Severe';

  // 3. Heat index
  const afrRichPenalty = afr < 11 ? (11 - afr) / 2 : 0;
  const afrLeanPenalty = afr > 13 ? (afr - 13) / 3 : 0;
  const afrPenalty = afrRichPenalty + afrLeanPenalty; // <= ~2

  let heatIndex = 0.5 * rpmNorm + 0.4 * boostNorm + 0.2 * (afrPenalty / 2);
  heatIndex = clamp(heatIndex, 0, 1);

  let heatLabel;
  if (heatIndex < 0.33) heatLabel = 'Cool';
  else if (heatIndex < 0.66) heatLabel = 'Warm';
  else heatLabel = 'Hot';

  // 4. Detonation / risk index
  const afrLeanFactor = afr > 13 ? (afr - 13) / 3 : 0;
  const timingAdvanceFactor = Math.max(0, timing.advanceDeg) / 10; // 0–0.5

  let detonationIndex =
    0.5 * boostNorm +
    0.3 * afrLeanFactor +
    0.3 * timingAdvanceFactor +
    0.2 * rpmNorm;

  detonationIndex = clamp(detonationIndex, 0, 1);

  let riskLabel;
  if (detonationIndex < 0.33 && wearIndex < 0.5 && heatIndex < 0.5) {
    riskLabel = 'Safe';
  } else if (detonationIndex < 0.66 && wearIndex < 0.8 && heatIndex < 0.8) {
    riskLabel = 'Aggressive';
  } else {
    riskLabel = 'Engine-grenade';
  }

  // Textual explanations
  const wearExplanation = (() => {
    if (wearLabel === 'Low') {
      return 'Estimated wear is low. Parameters are similar to conservative street use.';
    }
    if (wearLabel === 'Moderate') {
      return 'Wear is moderate. Higher RPM or boost will increase stress on seals and housings.';
    }
    return 'Wear is severe. Sustained running at these settings may rapidly damage seals and surfaces.';
  })();

  const heatExplanation = (() => {
    if (heatLabel === 'Cool') {
      return 'Thermal load is relatively low. Typical of light or moderate driving.';
    }
    if (heatLabel === 'Warm') {
      return 'Thermal load is elevated. Suitable for spirited use with good cooling and monitoring.';
    }
    return 'Thermal load is very high. Risk of overheating and component damage is increased.';
  })();

  const detonationExplanation = (() => {
    if (riskLabel === 'Safe') {
      return 'Overall risk is within a conservative educational “safe” envelope for a healthy engine.';
    }
    if (riskLabel === 'Aggressive') {
      return 'Overall risk is aggressive. Settings resemble hard track or drift use and require careful tuning and monitoring.';
    }
    return 'Overall risk is extreme. In real life, these conditions could quickly lead to detonation and engine failure.';
  })();

  return {
    inputs: {
      rpm,
      boostPsi,
      afr,
      sealType: sealType.id,
      ignitionTiming: timing.id
    },
    wear: {
      index: wearIndex,
      label: wearLabel,
      explanation: wearExplanation
    },
    heat: {
      index: heatIndex,
      label: heatLabel,
      explanation: heatExplanation
    },
    detonation: {
      index: detonationIndex,
      label: riskLabel,
      explanation: detonationExplanation
    },
    meta: {
      disclaimer: 'Educational simulation only. Simplified model, not a tuning recommendation or engineering tool.'
    }
  };
}

// --- Routes ---

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get available presets / metadata (useful for the Blazor app or other clients)
app.get('/api/engine/config', (req, res) => {
  res.json({
    engine: {
      id: '13b',
      name: 'Mazda 13B (generic)',
      description: 'Simplified educational model of the Mazda 13B rotary engine.'
    },
    ranges: {
      rpm: { min: 500, max: 9000, default: 3000 },
      boostPsi: { min: 0, max: 25, default: 0 },
      afr: { min: 10.0, max: 16.0, default: 12.0 }
    },
    sealTypes: Object.values(SEAL_TYPES),
    ignitionTimingPresets: Object.values(IGNITION_TIMING_PRESETS),
    presets: [
      {
        id: 'stock-street',
        label: 'Stock street',
        description: 'Near-factory boost (NA or low boost), conservative RPM, stock timing.',
        values: {
          rpm: 3500,
          boostPsi: 0,
          afr: 12.5,
          sealType: 'stock',
          ignitionTiming: 'stock'
        }
      },
      {
        id: 'mild-street-port',
        label: 'Mild street port',
        description: 'Moderate RPM and boost with performance seals.',
        values: {
          rpm: 5500,
          boostPsi: 8,
          afr: 11.8,
          sealType: 'performance',
          ignitionTiming: 'stock'
        }
      },
      {
        id: 'track-drift',
        label: 'Track/Drift',
        description: 'High RPM and boost, race-only style configuration.',
        values: {
          rpm: 7500,
          boostPsi: 16,
          afr: 11.2,
          sealType: 'race',
          ignitionTiming: 'advanced'
        }
      }
    ],
    disclaimer: 'Educational simulation. All values are illustrative only and not manufacturer specifications.'
  });
});

// Main simulation endpoint
app.post('/api/engine/simulate', (req, res) => {
  try {
    const body = req.body || {};
    const result = evaluateSimulation(body);
    res.json(result);
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({
      error: 'Simulation failed',
      details: 'An internal error occurred while running the simulation.'
    });
  }
});

// Fallback 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Rotary engine simulator backend listening on port ${PORT}`);
});
