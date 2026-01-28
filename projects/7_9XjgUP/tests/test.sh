#!/usr/bin/env bash
set -euo pipefail

RED="$(printf '\033[31m')"
GREEN="$(printf '\033[32m')"
YELLOW="$(printf '\033[33m')"
RESET="$(printf '\033[0m')"

pass() {
  echo "${GREEN}PASS${RESET} - $1"
}

fail() {
  echo "${RED}FAILED${RESET} - $1"
  exit 1
}

warn() {
  echo "${YELLOW}WARN${RESET} - $1"
}

echo "Running EPIC 00: Repo Retrofit checks..."
echo

# 1. Repository structure checks
echo "1) Checking required root directories..."

for dir in docs agents tasks logs db app; do
  if [[ -d "$dir" ]]; then
    pass "Directory '$dir/' exists at repo root."
  else
    fail "Directory '$dir/' is missing at repo root."
  fi
done

# Ensure required dirs are non-empty (at least one file, including dotfiles)
for dir in docs agents tasks logs db; do
  if find "$dir" -mindepth 1 -maxdepth 5 | grep -q .; then
    pass "Directory '$dir/' contains at least one file or placeholder."
  else
    fail "Directory '$dir/' appears to be empty; add a placeholder (e.g., .gitkeep)."
  fi
done

# No frontend/backend directories for UI
echo
echo "2) Checking for forbidden 'frontend'/'backend' directories..."

if find . -maxdepth 4 -type d \( -name frontend -o -name backend \) | grep -q .; then
  fail "Found a 'frontend' or 'backend' directory within depth 4 of repo root, which is not allowed for the UI."
else
  pass "No forbidden 'frontend' or 'backend' directories detected near repo root."
fi

if find app -maxdepth 4 -type d \( -name frontend -o -name backend \) 2>/dev/null | grep -q .; then
  fail "Found a 'frontend' or 'backend' directory under 'app/', which is not allowed for the UI."
else
  pass "No forbidden 'frontend' or 'backend' directories found under 'app/'."
fi

# 2. README checks
echo
echo "3) Checking root README.md..."

if [[ -f "README.md" ]]; then
  pass "README.md exists at repo root."
else
  fail "README.md is missing at repo root."
fi

# Basic content checks
if grep -qi "Blazor" README.md && grep -q "app/" README.md; then
  pass "README.md mentions Blazor and the 'app/' directory."
else
  warn "README.md may not clearly describe the Blazor app location in 'app/'."
fi

if grep -q "cd app" README.md && grep -q "dotnet run" README.md; then
  pass "README.md contains 'cd app' and 'dotnet run' instructions."
else
  fail "README.md does not clearly document 'cd app' and 'dotnet run' steps."
fi

# Check that key directories are at least mentioned
for dir in docs agents tasks logs db; do
  if grep -q "$dir" README.md; then
    pass "README.md mentions '$dir/'."
  else
    warn "README.md does not mention '$dir/'; verify repository structure description is complete."
  fi
done

# Ensure README does not suggest frontend/backend dirs for UI
if grep -qi "frontend" README.md || grep -qi "backend" README.md; then
  warn "README.md mentions 'frontend' or 'backend'; verify it's not describing forbidden UI directories."
else
  pass "README.md does not mention new 'frontend'/'backend' UI directories."
fi

# 3. Blazor app basic structure
echo
echo "4) Checking Blazor app structure under 'app/'..."

if [[ -f "app/Program.cs" ]]; then
  pass "Found 'app/Program.cs'."
else
  fail "'app/Program.cs' is missing; Blazor startup may be misconfigured."
fi

if [[ -d "app/Pages" ]]; then
  pass "Found 'app/Pages/' directory."
else
  warn "'app/Pages/' directory not found; verify Blazor pages location."
fi

if [[ -d "app/wwwroot" ]]; then
  pass "Found 'app/wwwroot/' directory."
else
  warn "'app/wwwroot/' directory not found; verify static assets location."
fi

# Attempt a build (safer than always running the app)
echo
echo "5) Building Blazor app with 'dotnet build' (from app/)..."

if command -v dotnet >/dev/null 2>&1; then
  (
    cd app
    dotnet build >/dev/null
  ) && pass "dotnet build (from app/) completed successfully." || fail "dotnet build (from app/) failed."
else
  warn "'dotnet' command not found; skipping build check. Ensure .NET SDK is installed."
fi

# Optional: run the app if requested
if [[ "${RUN_DOTNET_RUN:-0}" != "0" ]]; then
  echo
  echo "6) RUN_DOTNET_RUN is set; attempting 'dotnet run' (from app/) for a quick smoke check..."
  if command -v dotnet >/dev/null 2>&1; then
    (
      cd app
      # Run briefly and then terminate after a short period
      dotnet run &
      RUN_PID=$!
      sleep 15 || true
      kill "$RUN_PID" >/dev/null 2>&1 || true
    ) && pass "dotnet run (from app/) started successfully (terminated after a short delay)." \
      || warn "dotnet run (from app/) did not complete cleanly; perform manual run and review console output."
  else
    warn "'dotnet' command not found; cannot run 'dotnet run'."
  fi
else
  echo
  warn "Skipping 'dotnet run' (set RUN_DOTNET_RUN=1 to enable automated run). Manual smoke test is still required."
fi

# 4. Changelog checks
echo
echo "7) Checking logs/CHANGELOG.md..."

if [[ -f "logs/CHANGELOG.md" ]]; then
  pass "logs/CHANGELOG.md exists."
else
  fail "logs/CHANGELOG.md is missing."
fi

if [[ -s "logs/CHANGELOG.md" ]]; then
  pass "logs/CHANGELOG.md is not empty (contains at least one entry)."
else
  fail "logs/CHANGELOG.md is empty; add an entry describing this EPIC 00 work."
fi

if grep -qi "EPIC 00" logs/CHANGELOG.md || grep -qi "repo retrofit" logs/CHANGELOG.md; then
  pass "logs/CHANGELOG.md appears to contain an entry related to EPIC 00 / repo retrofit."
else
  warn "logs/CHANGELOG.md does not explicitly reference EPIC 00 / repo retrofit; verify entry wording."
fi

# 5. Agents and tasks alignment
echo
echo "8) Checking agents/ and tasks/ alignment..."

if find agents -type f | grep -q .; then
  pass "agents/ contains at least one file (placeholder or config)."
else
  warn "agents/ does not contain any files; add a placeholder or config to match conventions."
fi

if find tasks -type f | grep -q .; then
  pass "tasks/ contains at least one task/EPIC definition file."
else
  warn "tasks/ does not contain any files; add EPIC/task definitions to match conventions."
fi

echo
echo "${GREEN}All scripted checks completed. Review any WARN messages and perform manual browser smoke tests as described in tests/TEST_PLAN.md.${RESET}"
