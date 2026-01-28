#!/usr/bin/env bash
set -euo pipefail

# Simple helper script for EPIC 02: Builder MVP manual testing
# This script does NOT run automated browser tests; it assists the tester
# by verifying key files and starting the app.

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== EPIC 02: Builder MVP – Test Helper =="

echo "Project root: ${PROJECT_ROOT}"

echo
echo "1) Verifying required files exist..."
check_file() {
  local path="$1"
  if [[ -f "${PROJECT_ROOT}/${path}" ]]; then
    echo "  [OK] ${path}"
  else
    echo "  [MISSING] ${path}"
  fi
}

check_file "README.md"
check_file "docs/API.md"
check_file "logs/CHANGELOG.md"
check_file "TEST.md"

if [[ -d "${PROJECT_ROOT}/app" ]]; then
  echo "  [OK] app/ directory present"
else
  echo "  [MISSING] app/ directory"
fi

echo
echo "2) .NET SDK version (for manual cross-check with README prerequisites):"
if command -v dotnet >/dev/null 2>&1; then
  dotnet --version || true
else
  echo "  dotnet command not found; install .NET SDK as per README."
fi

echo
echo "3) Restoring and building the Blazor app (no run)..."
if [[ -d "${PROJECT_ROOT}/app" ]]; then
  pushd "${PROJECT_ROOT}/app" >/dev/null
  dotnet restore
  dotnet build
  popd >/dev/null
else
  echo "Cannot build: app/ directory not found."
fi

cat <<'EOF'

==========================================================
Manual Testing Next Steps
==========================================================

- Start the app for interactive testing:
    cd app
    dotnet run

- Once running, follow the manual test steps in:
    TEST.md
and the detailed checklist in:
    tests/TEST_PLAN.md

- Use browser dev tools or a REST client to validate the
  four Builder API endpoints:
    POST   /api/builds
    GET    /api/builds/{id}
    POST   /api/builds/{id}/selections
    DELETE /api/builds/{id}/selections

==========================================================

EOF
