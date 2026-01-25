# Test Plan: Local Multi-Agent Boss Dashboard

## 1. Scope

Covers:
- Core HTTP API endpoints.
- Real-time updates via SSE/WebSocket.
- Basic UI flows for monitoring, controlling agents, and approval gates.
- Metrics and cost display consistency.

Out of scope:
- Load testing, security testing, and real AI agent integrations.

---

## 2. Test Environment

- Run backend on `localhost` at configurable port (default e.g. `http://localhost:3000` or `http://localhost:8000`).
- Frontend served as static files from same server or simple static server.
- Tailwind loaded via CDN or local build.
- Use simple CLI tools:
  - `curl` or `HTTPie` for API tests.
  - Node/Python script for automated route checks.
- No auth headers required.

---

## 3. Test Tasks by Role

### 3.1 Design Review

**[Owner: Designer] UI/UX Review Checklist**

- Verify layout against spec:
  - Single-page layout with:
    - Header
    - Agent list
    - Agent detail panel
    - Approval queue section
    - Global metrics bar
- Check that:
  - Statuses (idle/running/paused/failed) are visually distinct (color, label).
  - Logs area is readable and scrollable.
  - Controls (Start/Stop/Retry) are clearly labeled and grouped logically.
  - Approval items are easy to notice and act on.

**Acceptance Criteria:**
- Page structure matches wireframe sections and hierarchy.
- Key interactions (selecting an agent, acting on approval) are discoverable without reading code.
- No overlapping UI elements on a 13–15" laptop screen at 100% zoom.
- Text labels are understandable to a beginner user.

---

### 3.2 Backend API Tests

**[Owner: Backend] API Route Availability**

1. Start backend server.
2. Test core endpoints (example names; align with actual implementation):

   - `GET /api/agents`
   - `GET /api/agents/:id`
   - `POST /api/agents/:id/tasks` (assign task)
   - `POST /api/agents/:id/stop`
   - `POST /api/agents/:id/retry`
   - `GET /api/approvals`
   - `POST /api/approvals/:id/approve`
   - `POST /api/approvals/:id/reject`
   - `GET /api/metrics`
   - SSE or WebSocket endpoint for live updates (e.g., `GET /api/events` for SSE).

**Acceptance Criteria:**
- All documented endpoints respond with HTTP 2xx for valid inputs.
- Error cases return 4xx with JSON error body containing `message` and `code` or similar.
- JSON responses include required fields documented in code comments or minimal schema.

---

**[Owner: Backend] Data & State Transition Tests**

1. **Assign task to idle agent**
   - Create an agent in initial data (or via admin route if available).
   - `POST /api/agents/:id/tasks` with a sample task description.
   - `GET /api/agents/:id` and verify:
     - Status changes from `idle` to `running` (or appropriate intermediate).
     - Last task matches the description.
   - Wait for simulated completion; verify:
     - Task marked `success` or `pending-approval`.
     - Agent status updates accordingly.

2. **Stop running agent**
   - Assign a long-running simulated task.
   - Call `POST /api/agents/:id/stop`.
   - Confirm:
     - Agent status becomes `idle` or `failed/stopped` (per design).
     - Task status reflects stop outcome (e.g., `failed` or `stopped`).

3. **Retry failed task**
   - Force a task to fail (e.g., via a mock flag).
   - `POST /api/agents/:id/retry`.
   - Confirm:
     - New task or retried run is recorded.
     - Status transitions to `running`.
     - Previous task marked as failed remains in history.

**Acceptance Criteria:**
- State transitions follow documented rules (idle → running → success/failed/pending-approval).
- No crashes or unhandled exceptions in logs during operations.
- Data for past tasks remains accessible and consistent.

---

**[Owner: Backend] Metrics & Cost Calculation Tests**

1. Run a few tasks with simulated durations and token counts.
2. Call `GET /api/metrics`.
3. Verify:
   - Per-agent counts match actual completed tasks.
   - Global totals equal sum of per-agent totals.
   - Average duration is correctly computed: `sum(durations) / number_of_completed_tasks`.
   - Cost = tokens * configured rate (check against env var or default).

**Acceptance Criteria:**
- Metric values are numerically correct within expected rounding.
- Cost updates after tasks complete.
- No negative or NaN values in metrics.

---

### 3.3 Real-Time Channel Tests

**[Owner: Backend] SSE/WebSocket Functional Test**

1. Connect to events endpoint:
   - SSE: `curl -N http://localhost:<port>/api/events`
   - WebSocket: use a small Node/Python client.
2. Trigger events:
   - Assign a new task.
   - Cause a status change (e.g., stop).
   - Generate logs (simulated steps).
3. Observe messages:
   - Ensure messages are received in near real time.
   - Verify event payload contains:
     - Type (e.g., `agent_status`, `log`, `metrics`, `approval`).
     - Relevant IDs and data.

**Acceptance Criteria:**
- Connection stays open without errors.
- Events are well-formed JSON payloads.
- At least agent list, logs, metrics, and approvals changes are emitted.

---

### 3.4 Frontend UI & Integration Tests

**[Owner: Frontend] Agent List & Detail Views**

1. Load dashboard in browser.
2. Confirm:
   - Agents list shows all initial agents.
   - Each agent row includes name, status, last task, current step.
3. Click on an agent:
   - Detail panel updates with that agent’s data.
   - Metrics and cost fields display numeric values (0 or greater).
   - Logs area shows at least a placeholder if no logs yet.

**Acceptance Criteria:**
- No JS errors in console.
- Selecting different agents updates details correctly.
- Status badges visually match underlying status.

---

**[Owner: Frontend] Controls & Actions**

1. Select an idle agent.
2. Enter a task description and click `Start`.
3. Observe:
   - UI shows status transitioning to `running`.
   - Logs begin to appear (once backend starts sending them).
4. Click `Stop` on a running agent:
   - Status changes to stopped/idle.
   - New log line describing stop action.
5. If last task fails:
   - `Retry` button becomes available.
   - Clicking Retry starts a new execution.

**Acceptance Criteria:**
- Each button triggers a visible change in the UI and corresponding API call (inspect via dev tools network tab).
- Buttons are disabled appropriately (e.g., cannot start when already running).

---

**[Owner: Frontend] Approvals Handling**

1. Cause a task to end in `pending-approval` state (use known agent/task or test mode).
2. Confirm:
   - New item appears in Approval queue section.
   - Item shows agent name and summary.
3. Click `Approve`:
   - Item disappears from queue.
   - Agent proceeds to next step or marks task as success.
4. Repeat with `Reject`:
   - Item disappears.
   - Task status is set to failed/rejected.

**Acceptance Criteria:**
- Approval queue always reflects backend state after actions.
- UI updates in real time when approvals are created or resolved.

---

**[Owner: Frontend] Real-Time Updates**

1. Open two browser tabs with the dashboard.
2. In tab A, start/stop tasks and generate logs.
3. Verify in tab B:
   - Statuses, logs, and metrics update automatically without manual refresh.

**Acceptance Criteria:**
- Both tabs stay in sync using SSE/WebSocket events.
- No duplicated entries or flickering in lists.

---

### 3.5 End-to-End Sanity Script

**[Owner: Tester] Simple Automated Check Script**

- Implement a small script in `tests/` (e.g., `tests/smoke_test.py` or `tests/smoke_test.js`) that:
  1. Checks server health (e.g., `GET /api/agents`).
  2. Creates or uses an existing agent to:
     - Assign a task.
     - Poll `GET /api/agents/:id` until status is `success` or timeout.
  3. Verifies metrics update accordingly.
  4. Prints `OK` or `FAIL` per check.

**Acceptance Criteria:**
- Running `python tests/smoke_test.py` or `node tests/smoke_test.js` (as documented) completes without unhandled errors.
- Script exits with success code (0) when all checks pass, non-zero otherwise.
- Output is human-readable and minimal.

---
