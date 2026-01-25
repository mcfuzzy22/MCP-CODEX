#!/usr/bin/env bash
set -euo pipefail

# Simple verification script for structural and build-related checks.
# This does NOT replace the full manual test plan in tests/TEST_PLAN.md.

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$PROJECT_ROOT/app"

echo "Project root: $PROJECT_ROOT"
echo "App directory: $APP_DIR"

if [ ! -d "$APP_DIR" ]; then
  echo "ERROR: app/ directory not found at $APP_DIR" >&2
  exit 1
fi

echo "Checking required root files..."
[ -f "$PROJECT_ROOT/README.md" ] || { echo "ERROR: README.md missing in project root"; exit 1; }
[ -f "$PROJECT_ROOT/logs/CHANGELOG.md" ] || { echo "ERROR: logs/CHANGELOG.md missing"; exit 1; }

echo "Checking Blazor structure..."
[ -f "$APP_DIR/Program.cs" ] || { echo "ERROR: app/Program.cs missing"; exit 1; }
[ -d "$APP_DIR/Pages" ] || { echo "ERROR: app/Pages directory missing"; exit 1; }
[ -d "$APP_DIR/wwwroot" ] || { echo "ERROR: app/wwwroot directory missing"; exit 1; }

echo "Ensuring no forbidden frontend/backend directories exist..."
if [ -d "$PROJECT_ROOT/frontend" ] || [ -d "$PROJECT_ROOT/backend" ]; then
  echo "ERROR: Disallowed frontend/ or backend/ directory detected in project root" >&2
  exit 1
fi

echo "Checking knowledge base and model documentation files (if present)..."
if [ ! -d "$APP_DIR/Data" ]; then
  echo "WARNING: app/Data directory not found; expected knowledge base files may be missing."
else
  KNOWN_OK=0
  if [ -f "$APP_DIR/Data/RotaryKnowledge.md" ] || [ -f "$APP_DIR/Data/rotary-knowledge.json" ]; then
    KNOWN_OK=1
  fi
  if [ "$KNOWN_OK" -eq 0 ]; then
    echo "WARNING: Rotary knowledge base file not found in app/Data."
  fi

  [ -f "$APP_DIR/Data/SimulationModelNotes.md" ] || echo "WARNING: SimulationModelNotes.md not found in app/Data."
  [ -f "$APP_DIR/Data/ModelValidation.md" ] || echo "WARNING: ModelValidation.md not found in app/Data."
fi

echo "Running dotnet build in app/..."
cd "$APP_DIR"
dotnet build >/dev/null

echo "Basic structural and build checks passed."
echo "For full coverage, execute manual tests described in tests/TEST_PLAN.md."
