# AGENT TASKS

---

## 1. Designer

### Project Name
Local Multi-Agent Boss Dashboard

### Required Deliverables
- `design/ui_spec.md`
  - Purpose: Describe the one-page UI/UX, including sections, interactions, and states.
- `design/wireframe.png` (or `.jpg` / `.svg`)
  - Purpose: Simple wireframe of the main dashboard layout.
- `design/components_notes.md`
  - Purpose: Short notes on key components (agent list, detail panel, logs, approvals, metrics) and intended behaviors, including state variations.

### Key Notes & Constraints
- Single-page dashboard; no authentication.
- Layout must include:
  - Header with project title and environment label.
  - Left or top section: agents list table or list.
  - Main detail panel: selected agent info, metrics, controls, logs.
  - Approval queue section (sidebar or bottom panel).
  - Global metrics bar (header or footer).
- Status states (`idle`, `running`, `paused`, `failed`) should have distinct colors and labels.
- Design for readability:
  - Large enough fonts.
  - Clear grouping with Tailwind-friendly utility classes (e.g., `flex`, `grid`, `gap-*`, `border`, `bg-*`).
- Assume Tailwind CSS is available (via CDN or compiled); you can reference class names directly in the spec.
- Wireframe can be low-fidelity; focus on:
  - Information hierarchy.
  - Placement of controls vs. read-only information.
  - How approval items are surfaced.
- Keep mobile behavior secondary; primary target is desktop/laptop screen.
- Avoid complex interactions that would require heavy front-end frameworks.

---

## 2. Frontend Developer

### Project Name
Local Multi-Agent Boss Dashboard

### Required Deliverables
- `frontend/index.html`
  - Purpose: Main single-page dashboard using Tailwind for layout and styling.
- `frontend/app.js`
  - Purpose: Client-side logic for:
    - Fetching initial data from the backend.
    - Managing UI state (selected agent, approval queue, logs).
    - Connecting to SSE or WebSocket endpoint for live updates.
    - Handling user actions and updating the UI.
- `frontend/styles.css` (optional if extending Tailwind)
  - Purpose: Small custom overrides or layout tweaks if needed, on top of Tailwind.
- `frontend/README.md`
  - Purpose: Quick instructions on how to run and build the frontend (if any build step), and a short description of main UI components.

### Key Technical Notes & Constraints
- Use **Tailwind CSS**:
  - Prefer CDN for simplicity (include in `index.html`) unless backend provides compiled CSS.
- Real-time channel:
  - Use the backend’s chosen mechanism (SSE or WebSocket).
  - Example for SSE: `const source = new EventSource('/api/events');`
  - Handle event types: `agent_status`, `log`, `metrics`, `approval` (adjust to actual names).
- No heavy front-end framework required:
  - Use vanilla JS or minimal utilities.
  - Organize code into simple functions: rendering, event binding, state updates.
- UI behavior requirements:
  - Agent list:
    - Render from `/api/agents`.
    - Clicking an agent sets it as “selected” and refreshes the detail panel.
  - Agent detail:
    - Show name, status, last task, current step, metrics, cost.
    - Show logs in reverse chronological or chronological order with timestamps.
    - Auto-scroll logs to bottom unless user is currently scrolled up.
  - Controls:
    - `Start`: POST to assign task for selected agent using a text input value.
    - `Stop`: POST to stop current task.
    - `Retry`: POST to retry last failed task.
    - `Pause/Resume`: POST to appropriate endpoint if implemented.
    - Use disabled states on buttons based on `status`.
  - Approval queue:
    - Initially fetched from `/api/approvals`.
    - Updated via real-time events.
    - Each item has Approve/Reject buttons calling their respective endpoints.
  - Global metrics:
    - Fetched from `/api/metrics`.
    - Update via real-time events without full reload.
- Error handling:
  - On failed API calls, show a simple inline message (e.g., toast-like div) but keep logic simple.
- Config:
  - Assume API base URL is same origin; if not, expose a small `API_BASE_URL` variable that can be configured via env and injected into HTML or JS.

---

## 3. Backend Developer

### Project Name
Local Multi-Agent Boss Dashboard

### Required Deliverables
- `backend/server.(js|ts|py)` (choose language/framework and stick to it)
  - Purpose: Main HTTP server implementing REST endpoints and serving frontend.
- `backend/routes.md`
  - Purpose: Short documentation of available API endpoints, request/response shapes, and event formats.
- `backend/models.(js|ts|py)` or `backend/store.(js|ts|py)`
  - Purpose: In-memory or simple persistent store for agents, tasks, logs, approvals, and metrics.
- `backend/events.(js|ts|py)` (if separate)
  - Purpose: SSE or WebSocket setup and event broadcasting helper functions.
- `backend/config.(js|ts|py)` or `.env.example`
  - Purpose: Central configuration for:
    - Port.
    - Token-to-cost conversion settings.
    - Any simulation toggles (e.g., speed of tasks).
- `backend/README.md`
  - Purpose: How to run the server, API overview, and notes on local data storage.

### Key Technical Notes & Constraints
- Choose a simple, beginner-friendly stack, e.g.:
  - Node + Express, or
  - Python + Flask/FastAPI.
- Serve the static `frontend/` files from the backend for local usage.
- Data storage:
  - For v1, you can use:
    - In-memory store with optional JSON file persistence, or
    - SQLite via a lightweight ORM or direct queries.
  - Must support restarting server without critical failures (ok if data resets, but document behavior).
- Core endpoint suggestions (adjust naming as needed but keep semantics):

  - Agents:
    - `GET /api/agents` → list all agents with summary info.
    - `GET /api/agents/:id` → details and metrics for one agent.
    - `POST /api/agents/:id/tasks` → assign a new task `{ description: string }`.
    - `POST /api/agents/:id/stop` → stop current task.
    - `POST /api/agents/:id/retry` → retry last failed task.
    - (Optional) `POST /api/agents/:id/pause` and `/resume`.
  - Approvals:
    - `GET /api/approvals` → list pending approvals.
    - `POST /api/approvals/:id/approve`
    - `POST /api/approvals/:id/reject`
  - Metrics:
    - `GET /api/metrics` → global + per-agent summary.
  - Events:
    - For SSE: `GET /api/events` keeps connection open and streams events.

- SSE/WebSocket:
  - Pick **one** and fully implement it:
    - For SSE:
      - Keep a list of client connections.
      - Send events formatted as `event: <type>\ndata: <json>\n\n`.
    - Broadcast when:
      - Agent status changes.
      - New log entries are recorded.
      - Approvals are created/resolved.
      - Metrics change.
  - Keep event types and payloads documented in `routes.md`.

- Simulation logic:
  - Since real AI agents aren’t required, simulate task execution:
    - When a task is assigned:
      - Immediately set status to `running`.
      - Append log lines over time (e.g., using timers).
      - After a short delay, mark task as `success` or create an approval item (e.g., random or configurable behavior).
  - Track:
    - Task start/end timestamps.
    - Duration = end - start.
    - Simulated tokens (e.g., increment on each log line).
- Metrics & cost:
  - Provide basic functions to compute metrics from stored tasks.
  - Cost calculation:
    - Use an env var for cost per token or per 1K tokens (e.g., `COST_PER_1K_TOKENS`).
    - Default values if env vars are missing.

- Config & environment:
  - Read port and cost config from env:
    - `PORT` or `DASHBOARD_PORT`.
    - `COST_PER_1K_TOKENS` or similar.
  - Provide `.env.example` with commented defaults.

- Error handling:
  - Return consistent JSON errors: `{ "error": { "code": "NOT_FOUND", "message": "..." } }`.
  - Validate incoming payloads (e.g., ensure `description` is non-empty on tasks).

---

## 4. Tester

### Project Name
Local Multi-Agent Boss Dashboard

### Required Deliverables
- `tests/test_plan.md`
  - Purpose: Written version of the test plan (you can base on TEST.md) with any updates specific to actual implementation.
- `tests/smoke_test.(py|js)`
  - Purpose: Automated script to sanity-check core API routes and simple flows.
- `tests/manual_checklist.md`
  - Purpose: Short checklist for manual UI tests run via browser (steps and expected outcomes).

### Key Technical Notes & Constraints
- Assume backend is running on `http://localhost:<port>`; port may be set via env; allow script configuration via an env var or small config at top of file.
- Smoke test script:
  - Steps:
    1. `GET /api/agents` → assert 200 and array response.
    2. Choose an agent ID (or create one if API supports).
    3. `POST /api/agents/:id/tasks` with `{"description": "Test task from smoke test"}`.
    4. Poll `GET /api/agents/:id` until status is `success`/`failed`/`pending-approval` or timeout.
    5. `GET /api/metrics` → verify totals >= 1.
  - Print clear log messages for each step.
  - Exit with status code 0 on success, non-zero on failure.
- Manual checklist:
  - Include:
    - Open dashboard, confirm layout elements exist.
    - Start/stop task visually.
    - Confirm logs and metrics update.
    - Trigger and resolve approval item.
    - Confirm two tabs stay in sync for live updates.
- Keep scripts and docs small and beginner-readable:
  - Avoid heavy test frameworks unless trivial (e.g., plain `assert` or minimal library).
  - Add comments explaining each major step.
