#!/usr/bin/env bash
set -euo pipefail

# Simple automated sanity checks based on TEST.md acceptance criteria.
# This script does not replace manual/browser testing; it just validates structure and basic build.

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Sanity check: project structure =="

if [ ! -d "$PROJECT_ROOT/app" ]; then
  echo "ERROR: app/ directory not found at project root: $PROJECT_ROOT" >&2
  exit 1
fi

if [ ! -f "$PROJECT_ROOT/README.md" ]; then
  echo "ERROR: README.md not found in project root: $PROJECT_ROOT" >&2
  exit 1
fi

echo "app/ and README.md found."

echo "== Checking Blazor project files in app/ =="
APP_DIR="$PROJECT_ROOT/app"

if [ ! -f "$APP_DIR/Program.cs" ]; then
  echo "ERROR: Program.cs not found in app/; expected for Blazor WebAssembly project." >&2
  exit 1
fi

if [ ! -d "$APP_DIR/Pages" ]; then
  echo "ERROR: Pages/ directory not found in app/." >&2
  exit 1
fi

if [ ! -d "$APP_DIR/wwwroot" ]; then
  echo "ERROR: wwwroot/ directory not found in app/." >&2
  exit 1
fi

# Look for a .csproj in app/
CS_PROJ_COUNT=$(find "$APP_DIR" -maxdepth 1 -name "*.csproj" | wc -l | tr -d ' ')
if [ "$CS_PROJ_COUNT" -eq 0 ]; then
  echo "ERROR: No .csproj file found directly under app/." >&2
  exit 1
fi

echo "Blazor project structure appears present."

echo "== Building app with dotnet build =="
(
  cd "$APP_DIR"
  dotnet build > /dev/null
)

echo "Build succeeded."

echo "== Checking presence of key documentation files =="
DOCS_MISSING=0
for f in ROTARY_KNOWLEDGE_BASE.md SIMPLIFIED_MODELS.md GLOSSARY_ROTARY_TERMS.md SIMULATION_VALIDATION_NOTES.md QA_TEST_CASES.md USABILITY_FEEDBACK.md SIMULATION_VALIDATION_REPORT.md FINAL_APPROVAL_CHECKLIST.md; do
  if [ ! -f "$PROJECT_ROOT/$f" ]; then
    echo "WARNING: Expected documentation file missing: $f"
    DOCS_MISSING=1
  fi
done

if [ "$DOCS_MISSING" -eq 1 ]; then
  echo "One or more documentation files are missing; see warnings above."
else
  echo "All expected documentation files are present."
fi

echo "== Basic grep checks for required pages and services =="

REQUIRED_PAGES=(Index.razor Simulation.razor Glossary.razor HowItWorks.razor)
for page in "${REQUIRED_PAGES[@]}"; do
  if ! find "$APP_DIR/Pages" -maxdepth 1 -name "$page" | grep -q .; then
    echo "WARNING: Expected page not found under app/Pages/: $page"
  else
    echo "Found page: $page"
  fi
done

if ! grep -R "EngineSimulationService" "$APP_DIR" >/dev/null 2>&1; then
  echo "WARNING: 'EngineSimulationService' not referenced in app/; verify simulation service implementation."
else
  echo "EngineSimulationService appears in app/ source."
fi

echo "== test.sh completed basic structural and build checks =="
echo "Manual browser-based tests are still required per tests/TEST_PLAN.md."
