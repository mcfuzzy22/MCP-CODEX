# Project: Local Multi-Agent Boss Dashboard

## 1. Product Summary

Build a local-only web dashboard that lets a human “boss” observe and control multiple AI agents and their workflows in real time. The dashboard should focus on clarity and simplicity so beginners can understand the structure and code.

The application runs on localhost during development, but the project structure should be clean enough to deploy later (e.g., container, simple server deploy) with configuration via environment variables.

## 2. Target Users

- **Primary**: Technical individual users (e.g., developers, tinkerers) running AI agents on their own machine who want a simple “control center” to:
  - See what agents are doing
  - Start/stop tasks
  - Gate/approve outputs
  - Track metrics and costs

- **Secondary**: Beginner developers learning about multi-agent orchestration, real-time dashboards, and simple web app structure.

## 3. Core Use Cases

1. **Monitor agents at a glance**
   - View a list of all agents.
   - See each agent’s status (idle, running, paused, failed).
   - See the last task each agent worked on.
   - See current step / activity summary.

2. **Inspect a specific agent**
   - Click/select an agent to open a detail panel or section.
   - View live logs / stream of that agent’s activity (append-only log style).
   - See its metrics: total tasks, success/failure count, average task duration.
   - See its cost usage: estimated tokens and cost for that agent.

3. **Control agents**
   - Start an agent on a new task (assign task).
   - Stop a running task/agent.
   - Retry a failed task for an agent.
   - Pause and resume (if supported by backend model; at minimum, support start/stop and label paused state).

4. **Approval gates**
   - When an agent finishes a step requiring human review, surface that pending approval.
   - Allow user to:
     - Approve: agent can proceed to the next step.
     - Reject: agent is stopped or the step is marked failed; option to retry with edited input (v1 can just reject and mark failed).
   - Show pending approvals clearly (either in a sidebar or a section in the agent detail view).

5. **Global monitoring**
   - Display aggregate metrics across all agents:
     - Total tasks processed.
     - Total successes / failures.
     - Average task duration overall.
     - Total estimated tokens and total cost.
   - Update these aggregates in real time.

## 4. Functional Requirements

### 4.1 Dashboard UI

- Single-page layout (no complex routing required).
- Sections:
  1. **Header**:
     - Project name.
     - Simple environment indicator (e.g., “Local”).
  2. **Agent List Panel**:
     - Table or list of agents.
     - Columns:
       - Agent name.
       - Status badge: `idle`, `running`, `paused`, `failed`.
       - Last task (short text, truncated).
       - Current step/short description.
       - Quick metrics snippet (e.g., total tasks, success rate %).
     - Click row to select an agent and view details.
  3. **Agent Detail Panel** (for selected agent):
     - Agent name and status.
     - Basic info: last task, last updated timestamp.
     - Metrics block:
       - Total tasks.
       - Success count / failure count.
       - Average task duration.
       - Estimated tokens and cost.
     - Controls:
       - Input field for “New task description”.
       - Buttons: `Start`, `Stop`, `Retry Last`, `Pause/Resume` (where logic permits).
       - Show disabled/active state appropriately based on current status.
     - Live logs area:
       - Scrollable vertical list with timestamps and messages.
       - Auto-scroll to bottom when new messages arrive, unless user is scrolling up.
  4. **Approval Queue / Section**:
     - List of pending approval items (agent + task + step summary).
     - For each item:
       - Short description of the output requiring approval.
       - Buttons: `Approve` and `Reject`.
  5. **Global Metrics Bar**:
     - Small bar at top or bottom showing:
       - Total tasks.
       - Successes / failures.
       - Average duration.
       - Total tokens and cost.

### 4.2 Backend Behavior

- Provide REST-style JSON APIs for:
  - Listing agents and their current state.
  - Getting details for a single agent.
  - Assigning a new task to an agent.
  - Stopping, pausing, resuming an agent.
  - Retrying the last failed task for an agent.
  - Listing pending approvals.
  - Approving or rejecting a specific approval item.
  - Fetching metrics (per agent and global).
- Provide a real-time update channel:
  - Use **either Server-Sent Events (SSE) or WebSocket** (choose one implementation and stick to it).
  - Push events when:
    - Agent status changes.
    - New log lines are available.
    - Metrics update.
    - Approval items are created or resolved.
- Local data storage:
  - Use a simple, beginner-friendly option:
    - Either an in-process store (with JSON file persistence) or a lightweight DB like SQLite.
  - Must track:
    - Agents and their statuses.
    - Tasks with timestamps, statuses, durations.
    - Logs per agent.
    - Approvals queue and decisions.
    - Token and cost estimates.
  - No user accounts; all data is global.

### 4.3 Metrics and Cost Tracking

- For each task:
  - Start and end timestamps.
  - Duration (computed).
  - Status: `success`, `failure`, `running`, `pending-approval`.
  - Estimated tokens (mocked or based on provided field).
  - Estimated cost (tokens * some configurable rate).
- For each agent:
  - Aggregated metrics:
    - Total tasks.
    - Success/failure counts.
    - Average task duration for completed tasks.
    - Sum of tokens and cost.
- Global metrics:
  - Aggregate across all agents.
- Estimation rules:
  - Implement simple placeholder logic (e.g., tokens as integer increments per log line or task; configurable via env var).
  - Cost per 1K tokens or per token configurable via env vars.

## 5. Non-Functional Requirements

- **Localhost only (for now)**:
  - Default server bind: `localhost` (127.0.0.1) and a configurable port via env var (e.g., `DASHBOARD_PORT`).
- **Deployable structure**:
  - Clear separation of concerns:
    - `backend/` server code.
    - `frontend/` static assets and JS.
    - `design/` docs and wireframes.
    - `tests/` scripts and test plan.
  - Environment configuration via `.env` or simple config file.
- **Readability & simplicity**:
  - Use minimal tooling; avoid heavy frameworks.
  - Backend: can be a small framework (e.g., Express, FastAPI, Flask) but no large monolithic stacks.
  - Frontend: vanilla JS or small library; no heavy SPA frameworks required.
  - Clear comments, straightforward code, and small files where practical.
- **Styling**:
  - Use Tailwind CSS:
    - Either via CDN for ease or local build pipeline if trivial.
    - Keep the layout simple and responsive enough for typical laptop screens.
- **Performance**:
  - Must support:
    - Dozens of agents.
    - Hundreds of log lines per agent in memory.
  - Real-time channel must not overwhelm the browser; batching or log truncation is acceptable.
- **Reliability**:
  - Basic error handling:
    - Return clear JSON error messages for bad inputs.
    - Backend should not crash on missing fields.
  - Clearly defined default states for agents and tasks.

## 6. Constraints & Assumptions

- **No authentication or authorization** in v1.
- **Local environment** assumed (single user).
- Agents and tasks are **simulated** / managed by the backend in this project; integration with real AI agents can come later.
- Approval gates are **synchronous with human input**:
  - Agent is blocked from proceeding until approval decision is set for that step.
- Network access is allowed during development, but runtime should not depend on external services except static CDN loads (e.g., Tailwind CDN).

## 7. Glossary

- **Agent**: A logical worker entity performing tasks (could be a process, thread, or simulated unit).
- **Task**: A single unit of work assigned to an agent, with its own status and logs.
- **Step**: A phase or sub-action within a task, surfaced as the agent’s “current step”.
- **Approval item**: A record indicating that a particular agent’s step or output requires human review.
- **Status**:
  - `idle`: Not working on any task.
  - `running`: Currently executing a task.
  - `paused`: Task execution is temporarily halted.
  - `failed`: Last task ended with failure.

---
