// Multi-Agent Boss Dashboard frontend logic
// Vanilla JS, SSE for realtime updates.

// Basic configurable API base URL. If frontend/config.js exists and defines window.BOSS_DASHBOARD_CONFIG,
// we use that; otherwise default to same origin.
const DEFAULT_CONFIG = { apiBaseUrl: '' };
const CONFIG = (window.BOSS_DASHBOARD_CONFIG || DEFAULT_CONFIG);
const API_BASE = CONFIG.apiBaseUrl.replace(/\/+$/, '');

// ------------- Helpers -------------

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function projectApiUrl(path) {
  if (!state.currentProjectId) return apiUrl(path);
  return apiUrl(`/projects/${encodeURIComponent(state.currentProjectId)}${path}`);
}

async function fetchJSON(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function fetchProjectJSON(path, options = {}) {
  const res = await fetch(projectApiUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return res.json();
}

function formatDateTime(iso) {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleString();
}

function formatDuration(ms) {
  if (ms == null) return '–';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function statusBadge(status, type = 'agent') {
  if (!status) return '';
  let color = 'bg-slate-100 text-slate-700';
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ';
  const s = status.toLowerCase();
  if (type === 'agent') {
    if (s === 'running') color = 'bg-emerald-100 text-emerald-700';
    else if (s === 'idle') color = 'bg-slate-100 text-slate-700';
    else if (s === 'paused') color = 'bg-amber-100 text-amber-700';
    else if (s === 'failed') color = 'bg-red-100 text-red-700';
  } else if (type === 'task') {
    if (s === 'running') color = 'bg-blue-100 text-blue-700';
    else if (s === 'completed') color = 'bg-emerald-100 text-emerald-700';
    else if (s === 'failed') color = 'bg-red-100 text-red-700';
    else if (s === 'waiting_approval') color = 'bg-amber-100 text-amber-700';
    else if (s === 'pending') color = 'bg-slate-100 text-slate-700';
  } else if (type === 'approval') {
    if (s === 'pending') color = 'bg-amber-100 text-amber-700';
    else if (s === 'approved') color = 'bg-emerald-100 text-emerald-700';
    else if (s === 'rejected') color = 'bg-red-100 text-red-700';
  }
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `<span class="${base}${color}">${label}</span>`;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const div = document.createElement('div');
  const base = 'px-3 py-2 rounded-md shadow text-sm flex items-center space-x-2 ';
  let color = 'bg-slate-800 text-white';
  if (type === 'success') color = 'bg-emerald-600 text-white';
  else if (type === 'error') color = 'bg-red-600 text-white';

  div.className = base + color;
  div.textContent = message;
  container.appendChild(div);
  setTimeout(() => {
    div.classList.add('opacity-0', 'transition-opacity');
    setTimeout(() => div.remove(), 300);
  }, 2500);
}

function agentDisplayName(agentId) {
  const match = state.agents.find((a) => a.id === agentId);
  return match?.name || agentId || 'Unknown Agent';
}

// ------------- State -------------

const state = {
  projects: [],
  currentProjectId: null,
  currentProject: null,
  taskTemplates: [],
  selectedTaskFile: null,
  agents: [],
  selectedAgentId: null,
  agentDetails: {}, // id -> full detail (may include tasks, logs)
  logsByAgent: {}, // id -> [{timestamp, taskId, message}]
  metrics: null,
  costs: null,
  approvals: [], // full list from backend
  recentDecisions: [], // local list [{agentName, taskId, decision, timestamp}]
  sse: null,
  sseConnected: false,
};

// ------------- DOM references -------------

const connectionDot = document.getElementById('connection-dot');
const connectionText = document.getElementById('connection-text');
const projectSelect = document.getElementById('project-select');
const taskSelect = document.getElementById('task-select');
const projectNewBtn = document.getElementById('project-new-btn');
const projectRunBtn = document.getElementById('project-run-btn');
const projectRunStatus = document.getElementById('project-run-status');

const metricTotalTasks = document.getElementById('metric-total-tasks');
const metricSuccessTasks = document.getElementById('metric-success-tasks');
const metricFailedTasks = document.getElementById('metric-failed-tasks');
const metricAvgDuration = document.getElementById('metric-avg-duration');
const metricTotalTokens = document.getElementById('metric-total-tokens');
const metricTotalCost = document.getElementById('metric-total-cost');
const metricsError = document.getElementById('metrics-error');

const projectMemoryContent = document.getElementById('project-memory-content');
const projectMemorySave = document.getElementById('project-memory-save');
const projectMemoryStatus = document.getElementById('project-memory-status');
const agentDiaryContent = document.getElementById('agent-diary-content');
const agentDiaryTitle = document.getElementById('agent-diary-title');
const taskBriefName = document.getElementById('task-brief-name');
const taskBriefContent = document.getElementById('task-brief-content');

const agentsTableBody = document.getElementById('agents-table-body');
const agentsLoadingRow = document.getElementById('agents-loading-row');
const agentsError = document.getElementById('agents-error');

const agentDetailEmpty = document.getElementById('agent-detail-empty');
const agentDetailContent = document.getElementById('agent-detail-content');
const agentDetailName = document.getElementById('agent-detail-name');
const agentDetailId = document.getElementById('agent-detail-id');
const agentDetailStatus = document.getElementById('agent-detail-status');
const agentDetailUpdated = document.getElementById('agent-detail-updated');
const agentDetailStatusBadge = document.getElementById('agent-detail-status-badge');

const agentCurrentTaskStatus = document.getElementById('agent-current-task-status');
const agentCurrentTaskId = document.getElementById('agent-current-task-id');
const agentCurrentTaskDesc = document.getElementById('agent-current-task-desc');
const agentCurrentTaskStarted = document.getElementById('agent-current-task-started');
const agentCurrentTaskDuration = document.getElementById('agent-current-task-duration');

const btnStartAgent = document.getElementById('btn-start-agent');
const btnStopAgent = document.getElementById('btn-stop-agent');
const btnRetryAgent = document.getElementById('btn-retry-agent');
const btnAssignTaskOpen = document.getElementById('btn-assign-task-open');
const agentControlMessage = document.getElementById('agent-control-message');

const logsAutoscrollToggle = document.getElementById('logs-autoscroll-toggle');
const agentLogsContainer = document.getElementById('agent-logs-container');
const agentLogsEmpty = document.getElementById('agent-logs-empty');
const agentLogsList = document.getElementById('agent-logs-list');

const approvalsError = document.getElementById('approvals-error');
const pendingApprovalsEmpty = document.getElementById('pending-approvals-empty');
const pendingApprovalsList = document.getElementById('pending-approvals-list');
const recentDecisionsEmpty = document.getElementById('recent-decisions-empty');
const recentDecisionsBody = document.getElementById('recent-decisions-body');

const assignTaskModalBackdrop = document.getElementById('assign-task-modal-backdrop');
const assignTaskModalTitle = document.getElementById('assign-task-modal-title');
const assignTaskModalClose = document.getElementById('assign-task-modal-close');
const assignTaskCancel = document.getElementById('assign-task-cancel');
const assignTaskSubmit = document.getElementById('assign-task-submit');
const assignTaskText = document.getElementById('assign-task-text');
const assignTaskError = document.getElementById('assign-task-error');

const projectModalBackdrop = document.getElementById('project-modal-backdrop');
const projectModalClose = document.getElementById('project-modal-close');
const projectModalCancel = document.getElementById('project-modal-cancel');
const projectModalSubmit = document.getElementById('project-modal-submit');
const projectNameInput = document.getElementById('project-name-input');
const projectTypeSelect = document.getElementById('project-type-select');
const projectModalError = document.getElementById('project-modal-error');

let assignTaskAgentId = null;

// ------------- Rendering -------------

function renderConnectionStatus() {
  if (!connectionDot || !connectionText) return;
  if (state.sseConnected) {
    connectionDot.className = 'inline-block w-2 h-2 rounded-full bg-emerald-500';
    connectionText.textContent = 'Live: connected';
  } else {
    connectionDot.className = 'inline-block w-2 h-2 rounded-full bg-red-500';
    connectionText.textContent = 'Live: reconnecting…';
  }
}

function renderProjectSelect() {
  if (!projectSelect) return;
  projectSelect.innerHTML = '';
  if (state.projects.length === 0) {
    const opt = document.createElement('option');
    opt.textContent = 'No projects';
    projectSelect.appendChild(opt);
    return;
  }
  state.projects.forEach((project) => {
    const opt = document.createElement('option');
    opt.value = project.id;
    opt.textContent = `${project.name} (${project.type})`;
    if (project.id === state.currentProjectId) opt.selected = true;
    projectSelect.appendChild(opt);
  });
}

function renderTaskSelect() {
  if (!taskSelect) return;
  taskSelect.innerHTML = '';
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = 'Use AGENTS.md';
  taskSelect.appendChild(defaultOpt);

  state.taskTemplates.forEach((task) => {
    const opt = document.createElement('option');
    opt.value = task.name;
    opt.textContent = task.title || task.name;
    if (task.name === state.selectedTaskFile) opt.selected = true;
    taskSelect.appendChild(opt);
  });
}

function renderProjectRunStatus() {
  if (!projectRunStatus) return;
  const status = state.currentProject?.runStatus || 'idle';
  projectRunStatus.textContent = status;
  if (!projectRunBtn) return;
  projectRunBtn.disabled = status === 'running';
}

async function loadTasks() {
  try {
    const tasks = await fetchJSON('/tasks');
    state.taskTemplates = tasks || [];
    renderTaskSelect();
  } catch (err) {
    state.taskTemplates = [];
    renderTaskSelect();
  }
}

async function loadTaskBrief(taskFile) {
  if (!taskBriefContent || !taskBriefName) return;
  if (!taskFile) {
    taskBriefName.textContent = 'Using AGENTS.md';
    taskBriefContent.value = 'No task template selected. The run will use AGENTS.md.';
    return;
  }
  try {
    const data = await fetchJSON(`/tasks/${encodeURIComponent(taskFile)}`);
    taskBriefName.textContent = data.name || taskFile;
    taskBriefContent.value = data.content || '';
  } catch (err) {
    taskBriefName.textContent = taskFile;
    taskBriefContent.value = 'Unable to load task template.';
  }
}

function renderMetrics() {
  const m = state.metrics;
  const c = state.costs;
  if (!m && !c) {
    metricTotalTasks.textContent = '–';
    metricSuccessTasks.textContent = '–';
    metricFailedTasks.textContent = '–';
    metricAvgDuration.textContent = '–';
    metricTotalTokens.textContent = '–';
    metricTotalCost.textContent = '–';
    return;
  }
  if (m) {
    metricTotalTasks.textContent = m.totalTasks ?? 0;
    metricSuccessTasks.textContent = m.successCount ?? 0;
    metricFailedTasks.textContent = m.failureCount ?? 0;
    const avg = m.avgTaskDurationMs;
    metricAvgDuration.textContent = avg != null ? formatDuration(avg) : '–';
  }
  if (c) {
    metricTotalTokens.textContent = c.totalTokens != null ? c.totalTokens.toLocaleString() : '–';
    metricTotalCost.textContent = c.totalCost != null ? `$${c.totalCost.toFixed(4)}` : '–';
  }
}

async function loadProjects() {
  try {
    const projects = await fetchJSON('/projects');
    state.projects = projects;
    if (!state.currentProjectId && projects.length > 0) {
      state.currentProjectId = projects[0].id;
    }
    renderProjectSelect();
  } catch (err) {
    showToast('Failed to load projects', 'error');
  }
}

async function setCurrentProject(projectId) {
  if (!projectId) return;
  if (state.currentProjectId === projectId) return;
  state.currentProjectId = projectId;
  state.selectedAgentId = null;
  state.agentDetails = {};
  state.logsByAgent = {};
  state.currentProject = null;
  renderProjectSelect();
  await refreshAll();
}

async function loadProjectMemory() {
  if (!projectMemoryContent) return;
  if (!state.currentProjectId) return;
  try {
    const data = await fetchProjectJSON('/agents-doc');
    projectMemoryContent.value = data.content || '';
    if (projectMemoryStatus) projectMemoryStatus.textContent = '';
  } catch (err) {
    if (projectMemoryStatus) projectMemoryStatus.textContent = 'Failed to load AGENTS.md';
  }
}

async function loadProjectInfo() {
  if (!state.currentProjectId) return;
  try {
    const data = await fetchJSON(`/projects/${encodeURIComponent(state.currentProjectId)}`);
    state.currentProject = data.project || null;
    state.selectedTaskFile = state.currentProject?.activeTaskFile || null;
    renderTaskSelect();
    await loadTaskBrief(state.selectedTaskFile);
    renderProjectRunStatus();
  } catch (err) {
    state.currentProject = null;
    renderProjectRunStatus();
  }
}

async function saveProjectMemory() {
  if (!projectMemoryContent) return;
  if (!state.currentProjectId) return;
  try {
    await fetchProjectJSON('/agents-doc', {
      method: 'PUT',
      body: JSON.stringify({ content: projectMemoryContent.value })
    });
    if (projectMemoryStatus) projectMemoryStatus.textContent = 'Saved.';
    showToast('AGENTS.md updated', 'success');
  } catch (err) {
    if (projectMemoryStatus) projectMemoryStatus.textContent = 'Save failed.';
    showToast('Failed to save AGENTS.md', 'error');
  }
}

async function loadAgentDiary(agentId, agentName) {
  if (!agentDiaryContent || !agentDiaryTitle) return;
  if (!agentId || !state.currentProjectId) {
    agentDiaryTitle.textContent = 'No agent selected';
    agentDiaryContent.textContent = '';
    return;
  }
  agentDiaryTitle.textContent = agentName || agentId;
  try {
    const data = await fetchProjectJSON(`/diaries/${encodeURIComponent(agentId)}`);
    agentDiaryContent.textContent = data.content || '';
  } catch (err) {
    agentDiaryContent.textContent = 'No diary found.';
  }
}

function renderAgentsTable() {
  if (!agentsTableBody) return;
  agentsLoadingRow && agentsLoadingRow.remove();

  const agents = state.agents;
  agentsTableBody.innerHTML = '';

  if (!agents || agents.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.className = 'py-4 text-center text-sm text-slate-500';
    td.textContent = 'No agents registered yet. Agents will appear here once the backend creates them.';
    tr.appendChild(td);
    agentsTableBody.appendChild(tr);
    return;
  }

  agents.forEach(agent => {
    const tr = document.createElement('tr');
    const isSelected = state.selectedAgentId === agent.id;
    tr.className = 'cursor-pointer hover:bg-slate-50 ' + (isSelected ? 'bg-slate-100' : '');

    tr.addEventListener('click', () => {
      if (state.selectedAgentId !== agent.id) {
        state.selectedAgentId = agent.id;
        renderAgentsTable();
        loadAgentDetail(agent.id);
        loadAgentDiary(agent.id, agent.name);
      }
    });

    // Name
    const tdName = document.createElement('td');
    tdName.className = 'py-2 pr-4 align-top';
    tdName.innerHTML = `
      <div class="text-sm font-medium text-slate-900">${agent.name || 'Unnamed Agent'}</div>
      <div class="text-xs text-slate-400">${agent.id}</div>
    `;
    tr.appendChild(tdName);

    // Status
    const tdStatus = document.createElement('td');
    tdStatus.className = 'py-2 pr-4 align-top';
    tdStatus.innerHTML = statusBadge(agent.status || 'idle', 'agent');
    tr.appendChild(tdStatus);

    // Last Task
    const tdLastTask = document.createElement('td');
    tdLastTask.className = 'py-2 pr-4 align-top hidden md:table-cell';
    const lastTask = agent.lastTaskId ? `#${agent.lastTaskId}` : 'No tasks yet';
    tdLastTask.innerHTML = `<div class="text-xs text-slate-700 truncate max-w-[160px]">${lastTask}</div>`;
    tr.appendChild(tdLastTask);

    // Current Step
    const tdStep = document.createElement('td');
    tdStep.className = 'py-2 pr-4 align-top hidden lg:table-cell';
    const step = agent.currentStep || '—';
    tdStep.innerHTML = `<div class="text-xs text-slate-600 truncate max-w-[140px]">${step}</div>`;
    tr.appendChild(tdStep);

    // Tasks summary
    const tdTasks = document.createElement('td');
    tdTasks.className = 'py-2 pr-4 align-top';
    const t = agent.metrics || {};
    const total = t.totalTasks ?? '–';
    const success = t.successCount ?? '–';
    const fail = t.failureCount ?? '–';
    tdTasks.innerHTML = `
      <div class="text-xs text-slate-800">${total} / ${success} / ${fail}</div>
      <div class="text-[10px] text-slate-400">Total / Success / Fail</div>
    `;
    tr.appendChild(tdTasks);

    // Cost
    const tdCost = document.createElement('td');
    tdCost.className = 'py-2 pr-2 align-top hidden md:table-cell';
    const cost = agent.costs?.cost;
    tdCost.innerHTML = `<div class="text-xs text-slate-700">${cost != null ? `$${cost.toFixed(4)}` : '–'}</div>`;
    tr.appendChild(tdCost);

    agentsTableBody.appendChild(tr);
  });
}

function renderAgentDetail() {
  const id = state.selectedAgentId;
  if (!id) {
    agentDetailEmpty.classList.remove('hidden');
    agentDetailContent.classList.add('hidden');
    return;
  }
  const agent = state.agentDetails[id] || state.agents.find(a => a.id === id);
  if (!agent) {
    agentDetailEmpty.classList.remove('hidden');
    agentDetailContent.classList.add('hidden');
    return;
  }
  agentDetailEmpty.classList.add('hidden');
  agentDetailContent.classList.remove('hidden');

  agentDetailName.textContent = agent.name || 'Agent';
  agentDetailId.textContent = agent.id ? `ID: ${agent.id}` : '';
  agentDetailStatus.innerHTML = statusBadge(agent.status || 'idle', 'agent');
  agentDetailUpdated.textContent = agent.updatedAt ? `Last updated: ${formatDateTime(agent.updatedAt)}` : '';

  // Current task
  const tasks = Array.isArray(agent.tasks) ? agent.tasks : [];
  const task = agent.currentTaskId
    ? tasks.find((t) => t.id === agent.currentTaskId) || null
    : null;
  if (!task) {
    agentCurrentTaskStatus.innerHTML = statusBadge(agent.status === 'running' ? 'running' : 'pending', 'task');
    agentCurrentTaskId.textContent = 'None';
    agentCurrentTaskDesc.textContent = 'This agent is currently idle. Assign a new task to start work.';
    agentCurrentTaskStarted.textContent = '–';
    agentCurrentTaskDuration.textContent = '–';
  } else {
    agentCurrentTaskStatus.innerHTML = statusBadge(task.status || 'pending', 'task');
    agentCurrentTaskId.textContent = task.id || '—';
    agentCurrentTaskDesc.textContent = task.description || '—';
    agentCurrentTaskStarted.textContent = task.startedAt ? formatDateTime(task.startedAt) : '–';
    if (task.startedAt) {
      const end = task.endedAt ? new Date(task.endedAt) : new Date();
      const dur = end - new Date(task.startedAt);
      agentCurrentTaskDuration.textContent = formatDuration(dur);
    } else {
      agentCurrentTaskDuration.textContent = '–';
    }
  }

  // Controls enabling
  const status = (agent.status || '').toLowerCase();
  btnStartAgent.disabled = status === 'running';
  btnStopAgent.disabled = status === 'idle' || status === 'failed' || status === 'paused' && !task;
  const hasFailed = tasks.some((t) => t.status === 'failed');
  btnRetryAgent.disabled = !hasFailed && !agent.lastTaskId;
  agentControlMessage.textContent = '';

  // Logs
  renderLogsForAgent(id);
}

function renderLogsForAgent(agentId) {
  const logs = state.logsByAgent[agentId] || [];
  if (!logs.length) {
    agentLogsEmpty.classList.remove('hidden');
    agentLogsList.innerHTML = '';
    return;
  }
  agentLogsEmpty.classList.add('hidden');
  agentLogsList.innerHTML = '';
  logs.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'px-3 py-1.5';
    const ts = formatDateTime(entry.timestamp);
    const taskPart = entry.taskId ? `[#${entry.taskId}] ` : '';
    li.textContent = `${ts}  ${taskPart}${entry.message}`;
    agentLogsList.appendChild(li);
  });

  if (logsAutoscrollToggle.checked) {
    agentLogsContainer.scrollTop = agentLogsContainer.scrollHeight;
  }
}

function renderApprovals() {
  const approvals = state.approvals || [];
  const pending = approvals.filter(a => a.status === 'pending');
  const decided = approvals.filter(a => a.status === 'approved' || a.status === 'rejected');

  // Pending
  pendingApprovalsList.innerHTML = '';
  if (!pending.length) {
    pendingApprovalsEmpty.classList.remove('hidden');
  } else {
    pendingApprovalsEmpty.classList.add('hidden');
    pending.forEach(a => {
      const card = document.createElement('div');
      card.className = 'border rounded-md p-3 space-y-2';

      // Header
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';
      const left = document.createElement('div');
      left.innerHTML = `
        <div class="text-sm font-semibold text-slate-900">${agentDisplayName(a.agentId)}</div>
        <div class="text-xs text-slate-500">Task #${a.taskId || '–'} • Created ${formatDateTime(a.createdAt)}</div>
      `;
      const right = document.createElement('div');
      right.innerHTML = statusBadge('pending', 'approval');
      header.appendChild(left);
      header.appendChild(right);

      // Body
      const body = document.createElement('div');
      body.className = 'text-xs text-slate-700 space-y-1';
      const label = document.createElement('div');
      label.className = 'font-semibold';
      label.textContent = 'Proposed Output';
      const text = document.createElement('div');
      text.className = 'mt-1 bg-slate-50 border border-slate-200 rounded p-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs';
      const content = a.outputSummary || a.output || '';
      text.textContent = content || '(no content provided)';
      body.appendChild(label);
      body.appendChild(text);

      const meta = document.createElement('div');
      meta.className = 'text-[11px] text-slate-500';
      const step = a.stepName ? ` • Step: ${a.stepName}` : '';
      meta.textContent = `Status: Pending • Requested at: ${formatDateTime(a.createdAt)}${step}`;

      // Actions
      const actions = document.createElement('div');
      actions.className = 'pt-2 flex space-x-2';
      const btnApprove = document.createElement('button');
      btnApprove.className = 'px-3 py-1.5 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700';
      btnApprove.textContent = 'Approve';
      const btnReject = document.createElement('button');
      btnReject.className = 'px-3 py-1.5 text-xs rounded-md border border-red-500 text-red-600 hover:bg-red-50';
      btnReject.textContent = 'Reject';

      const setLoading = (loading) => {
        btnApprove.disabled = loading;
        btnReject.disabled = loading;
        if (loading) {
          btnApprove.classList.add('opacity-70');
          btnReject.classList.add('opacity-70');
        } else {
          btnApprove.classList.remove('opacity-70');
          btnReject.classList.remove('opacity-70');
        }
      };

      btnApprove.addEventListener('click', async () => {
        try {
          setLoading(true);
          await fetchProjectJSON(`/approvals/${encodeURIComponent(a.id)}/approve`, { method: 'POST' });
          showToast('Approval approved.', 'success');
          // Rely on SSE to update; fallback remove from UI:
          card.remove();
        } catch (err) {
          console.error(err);
          showToast('Could not update approval. Please try again.', 'error');
        } finally {
          setLoading(false);
        }
      });

      btnReject.addEventListener('click', async () => {
        try {
          setLoading(true);
          await fetchProjectJSON(`/approvals/${encodeURIComponent(a.id)}/reject`, { method: 'POST' });
          showToast('Approval rejected.', 'success');
          card.remove();
        } catch (err) {
          console.error(err);
          showToast('Could not update approval. Please try again.', 'error');
        } finally {
          setLoading(false);
        }
      });

      actions.appendChild(btnApprove);
      actions.appendChild(btnReject);

      card.appendChild(header);
      card.appendChild(body);
      card.appendChild(meta);
      card.appendChild(actions);
      pendingApprovalsList.appendChild(card);
    });
  }

  // Recent decisions: combine from approvals list plus local state, keep last 10
  const decisionsFromApprovals = decided
    .map(a => ({
      agentName: agentDisplayName(a.agentId),
      taskId: a.taskId,
      decision: a.status,
      timestamp: a.decidedAt || a.updatedAt || a.createdAt,
    }))
    .filter(d => d.timestamp);

  const merged = [...decisionsFromApprovals, ...state.recentDecisions];
  merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const uniqueKey = new Set();
  const final = [];
  for (const d of merged) {
    const key = `${d.agentName}|${d.taskId}|${d.decision}|${d.timestamp}`;
    if (!uniqueKey.has(key)) {
      uniqueKey.add(key);
      final.push(d);
    }
    if (final.length >= 10) break;
  }
  state.recentDecisions = final;

  recentDecisionsBody.innerHTML = '';
  if (!final.length) {
    recentDecisionsEmpty.classList.remove('hidden');
  } else {
    recentDecisionsEmpty.classList.add('hidden');
    final.forEach(d => {
      const tr = document.createElement('tr');
      tr.className = 'text-[11px]';
      const tdAgent = document.createElement('td');
      tdAgent.className = 'py-1 pr-3';
      tdAgent.textContent = d.agentName || '—';
      const tdTask = document.createElement('td');
      tdTask.className = 'py-1 pr-3';
      tdTask.textContent = d.taskId != null ? `#${d.taskId}` : '—';
      const tdDecision = document.createElement('td');
      tdDecision.className = 'py-1 pr-3';
      tdDecision.innerHTML = statusBadge(d.decision, 'approval');
      const tdTime = document.createElement('td');
      tdTime.className = 'py-1 pr-3';
      tdTime.textContent = formatDateTime(d.timestamp);
      tr.appendChild(tdAgent);
      tr.appendChild(tdTask);
      tr.appendChild(tdDecision);
      tr.appendChild(tdTime);
      recentDecisionsBody.appendChild(tr);
    });
  }
}

// ------------- Data loading -------------

async function loadInitialData() {
  if (!state.currentProjectId) return;
  try {
    const [agents, metrics, costs, approvals] = await Promise.all([
      fetchProjectJSON('/agents'),
      fetchProjectJSON('/metrics').catch(() => null),
      fetchProjectJSON('/costs').catch(() => null),
      fetchProjectJSON('/approvals').catch(() => []),
    ]);
    state.agents = agents || [];
    state.metrics = metrics;
    state.costs = costs;
    state.approvals = approvals || [];

    renderMetrics();
    renderAgentsTable();
    renderAgentDetail();
    renderApprovals();
    await loadProjectMemory();
    await loadAgentDiary(state.selectedAgentId, state.agentDetails[state.selectedAgentId]?.name);
  } catch (err) {
    console.error('Initial data load failed', err);
    agentsError.classList.remove('hidden');
    metricsError.classList.remove('hidden');
    approvalsError.classList.remove('hidden');
  }
}

async function refreshAll() {
  teardownEventStream();
  await loadProjectInfo();
  await loadInitialData();
  setupEventStream();
}

async function loadAgentDetail(agentId) {
  try {
    const detail = await fetchProjectJSON(`/agents/${encodeURIComponent(agentId)}`);
    state.agentDetails[agentId] = detail;
    if (detail.logs && Array.isArray(detail.logs)) {
      state.logsByAgent[agentId] = detail.logs;
    }
    renderAgentDetail();
    loadAgentDiary(agentId, detail.name);
  } catch (err) {
    console.error('Failed to load agent detail', err);
    showToast('Unable to load agent details.', 'error');
  }
}

// ------------- Controls actions -------------

async function postAgentAction(agentId, actionPath, body) {
  try {
    const options = {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    };
    await fetchProjectJSON(`/agents/${encodeURIComponent(agentId)}/${actionPath}`, options);
    // SSE will update; fallback toast
    return true;
  } catch (err) {
    console.error(`Action ${actionPath} failed`, err);
    showToast(`Could not ${actionPath} agent.`, 'error');
    return false;
  }
}

btnStartAgent.addEventListener('click', async () => {
  const id = state.selectedAgentId;
  if (!id) return;
  btnStartAgent.disabled = true;
  agentControlMessage.textContent = 'Start request sent.';
  const ok = await postAgentAction(id, 'start');
  if (ok) showToast('Task started.', 'success');
  setTimeout(() => renderAgentDetail(), 200);
});

btnStopAgent.addEventListener('click', async () => {
  const id = state.selectedAgentId;
  if (!id) return;
  btnStopAgent.disabled = true;
  agentControlMessage.textContent = 'Stop request sent.';
  const ok = await postAgentAction(id, 'stop');
  if (ok) showToast('Stop request sent.', 'success');
  setTimeout(() => renderAgentDetail(), 200);
});

btnRetryAgent.addEventListener('click', async () => {
  const id = state.selectedAgentId;
  if (!id) return;
  btnRetryAgent.disabled = true;
  agentControlMessage.textContent = 'Retry requested.';
  const ok = await postAgentAction(id, 'retry');
  if (ok) showToast('Retry requested.', 'success');
  setTimeout(() => renderAgentDetail(), 200);
});

// Assign Task modal
function openAssignTaskModal(agentId) {
  assignTaskAgentId = agentId;
  const agent = state.agents.find(a => a.id === agentId);
  const name = agent ? agent.name : agentId;
  assignTaskModalTitle.textContent = `Assign Task to ${name}`;
  assignTaskText.value = '';
  assignTaskError.classList.add('hidden');
  assignTaskModalBackdrop.classList.remove('hidden');
  assignTaskText.focus();
}

function closeAssignTaskModal() {
  assignTaskModalBackdrop.classList.add('hidden');
  assignTaskAgentId = null;
}

btnAssignTaskOpen.addEventListener('click', () => {
  if (!state.selectedAgentId) return;
  openAssignTaskModal(state.selectedAgentId);
});
assignTaskModalClose.addEventListener('click', closeAssignTaskModal);
assignTaskCancel.addEventListener('click', closeAssignTaskModal);

assignTaskSubmit.addEventListener('click', async () => {
  const agentId = assignTaskAgentId;
  if (!agentId) return;
  const desc = assignTaskText.value.trim();
  if (!desc) {
    assignTaskError.classList.remove('hidden');
    return;
  }
  assignTaskError.classList.add('hidden');
  assignTaskSubmit.disabled = true;
  try {
    await fetchProjectJSON(`/agents/${encodeURIComponent(agentId)}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ description: desc }),
    });
    showToast('Task assigned.', 'success');
    closeAssignTaskModal();
  } catch (err) {
    console.error('Assign task failed', err);
    showToast('Could not assign task. Please check backend logs.', 'error');
  } finally {
    assignTaskSubmit.disabled = false;
  }
});

// ------------- Project modal -------------

function openProjectModal() {
  if (!projectModalBackdrop) return;
  projectNameInput.value = '';
  projectModalError.classList.add('hidden');
  projectModalBackdrop.classList.remove('hidden');
  projectNameInput.focus();
}

function closeProjectModal() {
  if (!projectModalBackdrop) return;
  projectModalBackdrop.classList.add('hidden');
}

projectNewBtn.addEventListener('click', openProjectModal);
projectModalClose.addEventListener('click', closeProjectModal);
projectModalCancel.addEventListener('click', closeProjectModal);

projectModalSubmit.addEventListener('click', async () => {
  const name = projectNameInput.value.trim();
  const type = projectTypeSelect.value;
  if (!name) {
    projectModalError.classList.remove('hidden');
    return;
  }
  projectModalError.classList.add('hidden');
  projectModalSubmit.disabled = true;
  try {
    const project = await fetchJSON('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, type }),
    });
    await loadProjects();
    await setCurrentProject(project.id);
    closeProjectModal();
    showToast('Project created.', 'success');
  } catch (err) {
    console.error('Create project failed', err);
    showToast('Could not create project.', 'error');
  } finally {
    projectModalSubmit.disabled = false;
  }
});

projectSelect.addEventListener('change', async (event) => {
  const projectId = event.target.value;
  await setCurrentProject(projectId);
});

taskSelect.addEventListener('change', async (event) => {
  const taskFile = event.target.value || null;
  state.selectedTaskFile = taskFile;
  await loadTaskBrief(taskFile);
});

projectMemorySave.addEventListener('click', saveProjectMemory);

projectRunBtn.addEventListener('click', async () => {
  if (!state.currentProjectId) return;
  projectRunBtn.disabled = true;
  try {
    await fetchProjectJSON('/run', {
      method: 'POST',
      body: JSON.stringify({ taskFile: state.selectedTaskFile }),
    });
    showToast('Project run started.', 'success');
    await loadProjectInfo();
  } catch (err) {
    console.error('Run project failed', err);
    showToast('Could not start run. Check AGENTS.md.', 'error');
  } finally {
    projectRunBtn.disabled = false;
  }
});

// ------------- SSE real-time events -------------

function teardownEventStream() {
  if (state.sse) {
    state.sse.close();
    state.sse = null;
  }
  state.sseConnected = false;
  renderConnectionStatus();
}

function setupEventStream() {
  if (!state.currentProjectId) return;
  try {
    const sse = new EventSource(projectApiUrl('/events'));
    state.sse = sse;

    sse.onopen = () => {
      state.sseConnected = true;
      renderConnectionStatus();
    };

    sse.onerror = () => {
      state.sseConnected = false;
      renderConnectionStatus();
    };

    const events = [
      'agent_updated',
      'task_created',
      'task_updated',
      'approval_created',
      'approval_updated',
      'log_appended',
      'metrics_updated',
      'costs_updated',
      'project_run_status',
    ];

    events.forEach((eventName) => {
      sse.addEventListener(eventName, (event) => {
        if (!event.data) return;
        let payload;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }
        handleEvent(eventName, payload);
      });
    });
  } catch (err) {
    console.error('Failed to setup SSE', err);
  }
}

function handleEvent(type, payload) {
  switch (type) {
    case 'agent_updated': {
      const agent = payload;
      const idx = state.agents.findIndex(a => a.id === agent.id);
      if (idx >= 0) state.agents[idx] = { ...state.agents[idx], ...agent };
      else state.agents.push(agent);
      state.agentDetails[agent.id] = {
        ...(state.agentDetails[agent.id] || {}),
        ...agent,
      };
      renderAgentsTable();
      if (state.selectedAgentId === agent.id) {
        renderAgentDetail();
      }
      break;
    }
    case 'task_created':
    case 'task_updated': {
      if (state.selectedAgentId && payload.agentId === state.selectedAgentId) {
        loadAgentDetail(state.selectedAgentId);
      }
      break;
    }
    case 'log_appended': {
      const log = payload;
      if (!log || !log.agentId) break;
      if (!state.logsByAgent[log.agentId]) state.logsByAgent[log.agentId] = [];
      state.logsByAgent[log.agentId].push(log);
      if (state.selectedAgentId === log.agentId) {
        renderLogsForAgent(log.agentId);
        loadAgentDiary(log.agentId, state.agentDetails[log.agentId]?.name);
      }
      break;
    }
    case 'metrics_updated': {
      state.metrics = payload;
      renderMetrics();
      break;
    }
    case 'costs_updated': {
      state.costs = payload;
      renderMetrics();
      break;
    }
    case 'approval_created':
    case 'approval_updated': {
      const appr = payload;
      const idx = state.approvals.findIndex(a => a.id === appr.id);
      if (idx >= 0) state.approvals[idx] = appr;
      else state.approvals.push(appr);

      if (appr.status === 'approved' || appr.status === 'rejected') {
        state.recentDecisions.unshift({
          agentName: agentDisplayName(appr.agentId),
          taskId: appr.taskId,
          decision: appr.status,
          timestamp: appr.decidedAt || appr.updatedAt || appr.createdAt,
        });
      }
      renderApprovals();
      break;
    }
    case 'project_run_status': {
      if (!state.currentProject) state.currentProject = {};
      state.currentProject.runStatus = payload.status || 'idle';
      state.currentProject.lastRunAt = payload.lastRunAt || null;
      state.currentProject.lastRunResult = payload.lastRunResult || null;
      if (payload.activeTaskFile !== undefined) {
        state.currentProject.activeTaskFile = payload.activeTaskFile || null;
        state.selectedTaskFile = state.currentProject.activeTaskFile || null;
        renderTaskSelect();
        loadTaskBrief(state.selectedTaskFile);
      }
      renderProjectRunStatus();
      break;
    }
    default:
      break;
  }
}

// ------------- Init -------------

document.addEventListener('DOMContentLoaded', () => {
  renderConnectionStatus();
  loadTasks().then(() => {
    renderTaskSelect();
    loadProjects().then(async () => {
      renderProjectSelect();
      if (state.currentProjectId) {
        await refreshAll();
      }
    });
  });
});
