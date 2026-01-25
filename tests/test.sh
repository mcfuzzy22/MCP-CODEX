#!/usr/bin/env bash
set -euo pipefail

# Simple automated runner for core checks.
# Assumes:
# - Backend is already running on localhost (default port used in the project).
# - Frontend is optional for these API checks.
#
# This script will:
# - Detect whether tests/basic_checks.js or tests/basic_checks.py exists.
# - Run the available one.
# - Propagate its exit code.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[test.sh] Starting basic test run..."

EXIT_CODE=0

if [ -f "$SCRIPT_DIR/basic_checks.py" ]; then
  echo "[test.sh] Running Python basic_checks.py"
  python "$SCRIPT_DIR/basic_checks.py" || EXIT_CODE=$?
elif [ -f "$SCRIPT_DIR/basic_checks.js" ]; then
  echo "[test.sh] Running Node basic_checks.js"
  node "$SCRIPT_DIR/basic_checks.js" || EXIT_CODE=$?
else
  echo "[test.sh] ERROR: No basic_checks.(js|py) found in $SCRIPT_DIR" >&2
  EXIT_CODE=1
fi

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "[test.sh] All automated basic checks PASSED."
else
  echo "[test.sh] Automated basic checks FAILED with exit code $EXIT_CODE."
fi

exit "$EXIT_CODE"
