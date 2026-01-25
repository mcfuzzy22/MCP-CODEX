Local Multi-Agent Boss Dashboard – Design Spec
=============================================

Overview
--------
Single-page, desktop-first dashboard for monitoring and controlling multiple local AI agents. Layout is a three-column style with a global header on top and global metrics bar along the bottom.

Primary layout (desktop, ~1280×720+):
- Header (top, full width)
- Main body (flex row):
  - Left: Agent List Panel (30–35% width)
  - Center: Agent Detail Panel (45–50% width)
  - Right: Approval Queue (20–25% width)
- Footer: Global Metrics Bar (full width)

Color & Typography (Tailwind-friendly)
--------------------------------------
- Background: `bg-slate-950` body or `bg-slate-900` main, with contrasting cards `bg-slate-800`.
- Text: `text-slate-100` primary, `text-slate-400` secondary.
- Borders: `border-slate-700`, subtle dividers.
- Fonts: Tailwind default sans (`font-sans`), base text `text-sm` / `text-base`, headers `text-lg` / `text-xl`.
- Status colors (used consistently in badges and table pills):
  - idle: `bg-slate-700 text-slate-100`
  - running: `bg-emerald-500/10 text-emerald-300 border border-emerald-500/40`
  - paused: `bg-amber-500/10 text-amber-300 border border-amber-500/40`
  - failed: `bg-rose-500/10 text-rose-300 border border-rose-500/40`

1. Header
---------
Location: Top, fixed-height bar.

Layout:
- Wrapper: `flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900`
- Left section:
  - Project title: `Local Multi-Agent Boss Dashboard` (`text-lg font-semibold text-slate-100`)
  - Subtitle (optional small text): “Local control center for simulated agents” (`text-xs text-slate-400`)
- Right section:
  - Environment badge: `Local` with icon:
    - Styles: `inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs px-2 py-1 border border-emerald-500/40`
  - Optional simple connection indicator to real-time channel:
    - Dot + label `Live` / `Disconnected`
    - Colors: green for connected (`bg-emerald-400`), gray/red for disconnected (`bg-rose-400`)

Behavior:
- Static text, connection indicator updates via JS but layout unchanged.
- No navigation; it’s a single-page app.

2. Main Layout
--------------
Wrapper: `flex flex-row h-[calc(100vh-3.5rem-2.5rem)]` (height minus header + footer) with `gap-3 px-3 py-3 bg-slate-950`.

Columns:
- Left: Agent List Panel – `w-1/3 min-w-[280px] max-w-sm flex flex-col`
- Center: Agent Detail Panel – `flex-1 min-w-[420px] flex flex-col`
- Right: Approval Queue – `w-[260px] max-w-xs flex flex-col`

Scroll:
- Each panel scrolls internally (`overflow-y-auto`) while header/footer remain fixed.

3. Agent List Panel (Left)
--------------------------
Purpose: At-a-glance list of all agents with key status and quick metrics.

Container:
- Card: `bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full`
- Header row:
  - `flex items-center justify-between px-3 py-2 border-b border-slate-800`
  - Left: label `Agents` (`text-sm font-medium`)
  - Right: small count badge `N agents` (`text-xs text-slate-400`)
  - Optional filter/search input next to label:
    - `relative flex-1 ml-2`
    - Input: `w-full bg-slate-800 text-xs text-slate-100 rounded px-2 py-1 border border-slate-700 placeholder-slate-500`

Agent list body:
- Scrollable list (not full table, but table-like):
  - Wrapper: `flex-1 overflow-y-auto divide-y divide-slate-800`
- Each row (agent item):
  - Clickable `button`-like row: `w-full text-left px-3 py-2 hover:bg-slate-800/70 cursor-pointer flex flex-col gap-1`
  - Selected state: `bg-slate-800`
  - Upper line:
    - `flex items-center justify-between gap-2`
    - Left: Agent name – `text-sm font-medium text-slate-100 truncate`
    - Right: Status badge – using status color scheme:
      - Chip: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium`
  - Middle line:
    - Last task, truncated: `text-xs text-slate-400 truncate` with label: `Last task: Use short preview...`
  - Lower line:
    - `flex items-center justify-between text-[11px] text-slate-500`
    - Left: Current step short description `Step: Generating summary…`
    - Right: Quick metrics snippet: `12 tasks • 83% success`

Empty states:
- If no agents: show a centered muted message:
  - `flex-1 flex items-center justify-center`
  - Text: `No agents registered yet.`

Hover affordance:
- Slight background, pointer cursor.

4. Agent Detail Panel (Center)
-------------------------------
Purpose: Detailed view for selected agent including status, metrics, controls, and logs.

Container:
- Card: `bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full`

4.1 Top: Agent Header & Summary
- Area: `px-4 pt-3 pb-2 border-b border-slate-800`
- Layout:
  - `flex items-start justify-between gap-3`
  - Left column:
    - Agent name: `text-base font-semibold text-slate-100`
    - Status badge under name (same style as list).
    - Small subline with last task and timestamp:
      - `text-xs text-slate-400`
      - Example: `Last task: "Summarize logs..." • Updated 14:23:10`
  - Right column:
    - Current step pill and ID:
      - Step text: `Current step: Waiting for approval` (`text-xs text-slate-300`)
      - Small ID / task code: `Task #12` in `text-[11px] text-slate-500`

4.2 Middle: Metrics / Info and Controls
Split horizontally into two blocks: left metrics, right controls.

Wrapper:
- `px-4 py-2 border-b border-slate-800 flex flex-row gap-4`

Metrics block (left):
- Layout:
  - `flex-1 grid grid-cols-2 gap-3 text-xs`
- Each metric: small card:
  - Container: `bg-slate-800/60 rounded-md px-2 py-1.5`
  - Label: `text-[11px] text-slate-400 uppercase tracking-wide`
  - Value: `text-sm font-semibold text-slate-100`
- Suggested metrics:
  - Total tasks
  - Successes / Failures
  - Avg duration (e.g., `3.2s`)
  - Tokens / Cost (e.g., `3.2K tok • $0.05`)

Controls block (right):
- Layout:
  - `w-64 flex flex-col gap-2`
- Task input:
  - Label: `New task` (`text-xs text-slate-400`)
  - Textarea or single-line input (short text):
    - `textarea` with `rows=2`:
      - `w-full bg-slate-800 text-xs text-slate-100 rounded border border-slate-700 px-2 py-1 placeholder-slate-500`
- Buttons row:
  - `flex flex-wrap gap-2 mt-1`
  - Buttons:
    - Start: primary `bg-emerald-600 hover:bg-emerald-500 text-xs text-white px-3 py-1.5 rounded disabled:opacity-40 disabled:cursor-not-allowed`
    - Stop: `bg-rose-600 hover:bg-rose-500 text-xs text-white px-3 py-1.5 rounded`
    - Retry Last: `bg-slate-700 hover:bg-slate-600 text-xs text-slate-100 px-3 py-1.5 rounded`
    - Pause/Resume: toggling label:
      - Paused: show `Resume` in emerald-like style
      - Running: show `Pause` in amber-like style
  - State rules (visual spec, logic handled in JS):
    - When status `idle`: Start enabled; Stop, Pause/Resume, Retry Last disabled.
    - When `running`: Start disabled; Stop & Pause enabled; Retry Last disabled.
    - When `paused`: Start disabled; Stop & Resume enabled.
    - When `failed`: Start enabled; Retry Last enabled; Stop & Pause disabled.
- Error/feedback area:
  - Under buttons: small inline message container:
    - `text-[11px] mt-1`
    - Success: `text-emerald-300`
    - Error: `text-rose-300`
    - Hidden when no message.

4.3 Bottom: Live Logs
Purpose: Append-only log view with timestamps.

Container:
- `flex-1 flex flex-col px-3 pb-3 pt-2`
- Header row:
  - `flex items-center justify-between mb-1`
  - Left: `text-xs font-medium text-slate-300` label `Logs`
  - Right: controls:
    - Auto-scroll toggle: small switch-like button `Auto-scroll` (`text-[11px] text-slate-400`, toggled style with `bg-slate-800` vs `bg-emerald-500/10 text-emerald-300`)
    - Clear button (optional): `Clear` link-style `text-[11px] text-slate-500 hover:text-slate-300`

Log list:
- Scroll area: `flex-1 overflow-y-auto bg-slate-950/40 rounded border border-slate-800 px-2 py-1.5`
- Each log entry:
  - `flex items-baseline gap-2 text-[11px] py-0.5`
  - Timestamp: fixed width, monospace: `font-mono text-[10px] text-slate-500`
  - Message:
    - `flex-1 text-slate-200`
    - Log level indicator (if available): small colored dot `w-1.5 h-1.5 rounded-full`
      - Info: `bg-slate-500`
      - Warning: `bg-amber-400`
      - Error: `bg-rose-400`
- Ordering: chronological top-to-bottom; container auto-scrolls to bottom unless user has scrolled up.

Empty state:
- Center small message:
  - `text-[11px] text-slate-500 text-center mt-4` – `No logs yet for this agent.`

5. Approval Queue (Right)
------------------------
Purpose: Human approval items clearly visible, always accessible.

Container:
- Card: `bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full`
- Header:
  - `flex items-center justify-between px-3 py-2 border-b border-slate-800`
  - Left: label `Pending approvals` (`text-sm font-medium`)
  - Right: count badge `3` with style:
    - `inline-flex items-center justify-center bg-amber-500/10 text-amber-300 px-2 py-0.5 text-xs rounded-full border border-amber-500/40`

Approval list:
- `flex-1 overflow-y-auto divide-y divide-slate-800`
- Each approval item card:
  - Container: `px-3 py-2 text-xs flex flex-col gap-1`
  - Top row:
    - `flex items-center justify-between gap-2`
    - Left: agent + task label:
      - Agent name: `text-slate-100 font-medium`
      - Under it (or inline): `Task #12 • Step "Review summary"` `text-[11px] text-slate-400`
    - Right: timestamp (when approval created): `text-[11px] text-slate-500`
  - Middle:
    - Short description/preview text:
      - `line-clamp-3 text-slate-300 text-[11px]`
      - Example: `Output: "Proposed summary of system logs..." (click to expand later if needed in v2; for now static)`
  - Bottom:
    - `flex items-center justify-end gap-2 pt-1`
    - Buttons:
      - Reject: `bg-rose-600 hover:bg-rose-500 text-white text-[11px] px-2.5 py-1 rounded`
      - Approve: `bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] px-2.5 py-1 rounded`
- States:
  - While API action in progress: show disabled state (`opacity-50`) and maybe spinner text `...`.
- Empty state:
  - Centered description:
    - `flex-1 flex items-center justify-center`
    - Message: `No pending approvals.` (`text-xs text-slate-500 text-center`)

6. Global Metrics Bar (Footer)
------------------------------
Purpose: Global overview across all agents, always visible.

Container:
- Sticky footer: `h-10 flex items-center justify-between px-4 border-t border-slate-800 bg-slate-900`
- Layout:
  - Left side: label `Global metrics` `text-xs text-slate-400`
  - Right side: inline metric chips:
    - Wrapper: `flex items-center gap-4 text-xs`
    - Each chip: `flex items-center gap-1 text-slate-300`
      - Label in `text-slate-400`
      - Value in `font-semibold text-slate-100`
    - Suggested:
      - `Total tasks: 123`
      - `Success: 110`
      - `Failures: 13`
      - `Avg duration: 2.8s`
      - `Tokens: 45.3K`
      - `Cost: $0.76`

Real-time behavior:
- Values updated without jarring animation; just text replacement.

7. Toast / Inline Notifications
-------------------------------
Simple optional top-right toast for API errors.

Placement:
- Fixed container: `fixed top-16 right-4 z-40 flex flex-col gap-2 max-w-sm`
- Each toast:
  - `rounded-md px-3 py-2 text-xs bg-rose-900/90 text-rose-50 border border-rose-700 shadow-lg`
  - Short message; auto-dismiss after few seconds.

8. States & Interactions Summary
--------------------------------
Selected Agent:
- When none selected:
  - Agent Detail panel shows placeholder:
    - `flex-1 flex items-center justify-center`
    - Message: `Select an agent from the list to see details.` (`text-sm text-slate-500`)
- When selected:
  - Panel displays fetched data; selection in list is highlighted.

Loading states:
- On initial load:
  - Panels may show skeletons:
    - Simple: `text-xs text-slate-500 px-4 py-3` messages: `Loading agents...`, `Loading metrics...`
- Buttons show disabled while waiting for responses.

Real-time updates:
- Agent list:
  - Status badge and current step update live.
  - Last task and quick metrics update based on SSE/WebSocket events.
- Detail panel:
  - If currently selected agent changes status/logs, reflect instantly.
  - If user is viewing logs and scrolled to bottom with auto-scroll ON, new entries keep view pinned to bottom.
- Approval panel:
  - New items appear at top of list; resolved items disappear.

Responsive behavior (secondary):
- On narrower widths (<1024px), simple stacking:
  - Agent List on top, Detail in middle, Approvals at bottom (vertical scrolling).
  - Keep same card structure; no complex reflow logic required.

Accessibility / Clarity considerations:
- Ensure sufficient color contrast (dark backgrounds with light text).
- Buttons have clear text labels (no icon-only controls required).
- Status labels are always textual, not just color-coded.

Visual Recap
------------
- Dark theme for focus on content and logs.
- Clear card separation via border and subtle background differences.
- Strong hierarchy: Agents list (navigation), Detail (primary workspace), Approvals (side actions), Global metrics (summary).
- Tailwind utility-friendly spec with class ideas explicitly noted to ease implementation.
