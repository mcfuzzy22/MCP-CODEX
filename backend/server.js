/*
 * Multi-Agent Boss Dashboard Backend (multi-project)
 * - Per-project state persisted on disk
 * - AGENTS.md + per-agent diaries stored in each project folder
 * - SSE for live updates
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const TOKEN_COST_PER_1K = process.env.TOKEN_COST_PER_1K
  ? Number(process.env.TOKEN_COST_PER_1K)
  : 0.002;

const app = express();
app.use(cors());
app.use(express.json());

const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

const projectsRoot = path.join(__dirname, '..', 'projects');
const tasksRoot = path.join(__dirname, '..', 'tasks');
fs.mkdirSync(projectsRoot, { recursive: true });

const projects = new Map(); // projectId -> projectState
const sseClientsByProject = new Map(); // projectId -> Set<{id,res}>
const projectRunners = new Map(); // projectId -> child process

function safeReadJSON(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    return null;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function projectDir(projectId) {
  return path.join(projectsRoot, projectId);
}

function projectStatePath(projectId) {
  return path.join(projectDir(projectId), 'state.json');
}

function agentsDocPath(projectId) {
  return path.join(projectDir(projectId), 'AGENTS.md');
}

function diaryDir(projectId) {
  return path.join(projectDir(projectId), 'diaries');
}

function diaryPath(projectId, agentId) {
  return path.join(diaryDir(projectId), `${agentId}.md`);
}

function approvalsDir(projectId) {
  return path.join(projectDir(projectId), 'approvals');
}

function approvalDecisionPath(projectId, approvalId) {
  return path.join(approvalsDir(projectId), `${approvalId}.json`);
}

function memoryDir(projectId) {
  return path.join(projectDir(projectId), 'memory');
}

function defaultAgents() {
  return [
    { id: 'pm', name: 'Project Manager' },
    { id: 'doc', name: 'Documentation Curator' },
    { id: 'domain', name: 'Domain Expert' },
    { id: 'data', name: 'Data Modeler' },
    { id: 'designer', name: 'Designer' },
    { id: 'frontend', name: 'Frontend Developer' },
    { id: 'backend', name: 'Backend Developer' },
    { id: 'tester', name: 'Tester' },
    { id: 'runner', name: 'Orchestrator' }
  ];
}

function createAgentState(agent) {
  return {
    id: agent.id,
    name: agent.name,
    status: 'idle',
    currentTaskId: null,
    lastTaskId: null,
    currentStep: 'Ready',
    updatedAt: Date.now()
  };
}

function createProjectState({ name, type }) {
  const id = nanoid(8);
  const rootPath = projectDir(id);
  ensureDir(rootPath);
  ensureDir(diaryDir(id));

  const project = {
    id,
    name: name || `Project ${id}`,
    type: type || 'web',
    rootPath,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    runStatus: 'idle',
    lastRunAt: null,
    lastRunResult: null,
    activeTaskFile: null
  };

  if (project.type === 'blazor') {
    const blazorDir = path.join(rootPath, 'app');
    ensureDir(blazorDir);
    const blazorReadme = path.join(blazorDir, 'README.md');
    if (!fs.existsSync(blazorReadme)) {
      fs.writeFileSync(
        blazorReadme,
        '# Blazor App\n\nThis folder is reserved for a Blazor web app.\n',
        'utf-8'
      );
    }
  }

  const agents = new Map();
  defaultAgents().forEach((a) => agents.set(a.id, createAgentState(a)));

  const state = {
    project,
    agents,
    tasks: new Map(),
    approvals: new Map(),
    logs: []
  };

  ensureProjectFiles(state);
  saveProjectState(state);
  return state;
}

function ensureProjectFiles(state) {
  const docPath = agentsDocPath(state.project.id);
  if (!fs.existsSync(docPath)) {
    const lines = [
      '# Agents',
      '',
      'This file tracks agent roles and responsibilities for this project.',
      '',
      '## Agents',
      ...Array.from(state.agents.values()).map((a) => `- ${a.id}: ${a.name}`),
      '',
      '## Notes',
      '- Update this file as the team evolves.'
    ];
    fs.writeFileSync(docPath, `${lines.join('\n')}\n`, 'utf-8');
  }

  ensureDir(diaryDir(state.project.id));
  ensureDir(approvalsDir(state.project.id));
  ensureDir(memoryDir(state.project.id));
  const envExamplePath = path.join(state.project.rootPath, '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    const envLines = [
      'DB_HOST=localhost',
      'DB_PORT=3306',
      'DB_USER=rotary_user',
      'DB_NAME=rotarysite',
      'DB_PASSWORD=',
      ''
    ];
    fs.writeFileSync(envExamplePath, envLines.join('\n'), 'utf-8');
  }
  for (const agent of state.agents.values()) {
    const dPath = diaryPath(state.project.id, agent.id);
    if (!fs.existsSync(dPath)) {
      const header = `# Diary: ${agent.name} (${agent.id})\n\n`;
      fs.writeFileSync(dPath, header, 'utf-8');
    }
  }
}

function serializeProjectState(state) {
  return {
    project: state.project,
    agents: Array.from(state.agents.values()),
    tasks: Array.from(state.tasks.values()),
    approvals: Array.from(state.approvals.values()),
    logs: state.logs,
    tokenUsage: state.tokenUsage || {}
  };
}

function saveProjectState(state) {
  state.project.updatedAt = Date.now();
  const payload = serializeProjectState(state);
  fs.writeFileSync(
    projectStatePath(state.project.id),
    JSON.stringify(payload, null, 2),
    'utf-8'
  );
}

function loadProjectFromDisk(projectId) {
  const data = safeReadJSON(projectStatePath(projectId));
  if (!data || !data.project) return null;

  const agents = new Map();
  (data.agents || []).forEach((a) => {
    // Normalize running agents to paused after restart
    const normalized = {
      ...a,
      status: a.status === 'running' ? 'paused' : a.status,
      currentStep:
        a.status === 'running' ? 'Paused after restart' : a.currentStep,
      updatedAt: Date.now()
    };
    agents.set(a.id, normalized);
  });

  const tasks = new Map();
  (data.tasks || []).forEach((t) => {
    const normalized = {
      ...t,
      status: t.status === 'running' ? 'paused' : t.status
    };
    tasks.set(t.id, normalized);
  });

  const approvals = new Map();
  (data.approvals || []).forEach((a) => approvals.set(a.id, a));

  const state = {
    project: {
      ...data.project,
      rootPath: data.project.rootPath || projectDir(projectId),
      runStatus: data.project.runStatus || 'idle',
      lastRunAt: data.project.lastRunAt || null,
      lastRunResult: data.project.lastRunResult || null,
      activeTaskFile: data.project.activeTaskFile || null
    },
    agents,
    tasks,
    approvals,
    logs: data.logs || [],
    tokenUsage: data.tokenUsage || {}
  };

  defaultAgents().forEach((agent) => {
    if (!state.agents.has(agent.id)) {
      state.agents.set(agent.id, createAgentState(agent));
    }
  });

  if (state.project.runStatus === 'running') {
    state.project.runStatus = 'idle';
    state.project.lastRunResult = 'stale-run';
  }

  ensureProjectFiles(state);
  return state;
}

function loadProjects() {
  const entries = fs.readdirSync(projectsRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const projectId = entry.name;
    const state = loadProjectFromDisk(projectId);
    if (state) projects.set(projectId, state);
  }

  if (projects.size === 0) {
    const defaultState = createProjectState({
      name: 'Local Dashboard',
      type: 'web'
    });
    projects.set(defaultState.project.id, defaultState);
  }
}

function resolvePythonPath() {
  const envPath = process.env.PYTHON_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;
  const venvPath = path.join(__dirname, '..', '.venv', 'bin', 'python');
  if (fs.existsSync(venvPath)) return venvPath;
  return 'python3';
}

function listTaskFiles() {
  if (!fs.existsSync(tasksRoot)) return [];
  return fs
    .readdirSync(tasksRoot)
    .filter((f) => f.toLowerCase().endsWith('.md'))
    .map((f) => {
      const fullPath = path.join(tasksRoot, f);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const titleLine = content.split(/\r?\n/).find((line) => line.trim().length > 0) || f;
      return { name: f, title: titleLine.replace(/^#\s*/, '').trim() };
    });
}

function readTaskFile(taskFile) {
  if (!taskFile) return null;
  const safeName = path.basename(taskFile);
  const fullPath = path.join(tasksRoot, safeName);
  if (!fs.existsSync(fullPath)) return null;
  return { name: safeName, content: fs.readFileSync(fullPath, 'utf-8') };
}

function ensureBlazorApp(state) {
  if (state.project.type !== 'blazor') return { ok: true };
  const appDir = path.join(state.project.rootPath, 'app');
  const csprojExists =
    fs.existsSync(appDir) &&
    fs.readdirSync(appDir).some((f) => f.endsWith('.csproj'));
  if (csprojExists) return { ok: true };

  ensureDir(appDir);
  const result = spawnSync('dotnet', ['new', 'blazorwasm', '-o', appDir, '--no-https'], {
    cwd: state.project.rootPath,
    encoding: 'utf-8'
  });

  if (result.error) {
    return { ok: false, error: result.error.message };
  }
  if (result.status !== 0) {
    return { ok: false, error: result.stderr || 'dotnet new blazorwasm failed' };
  }
  return { ok: true };
}

function startProjectRun(state, options = {}) {
  const projectId = state.project.id;
  if (projectRunners.has(projectId)) {
    return { ok: false, error: 'Project is already running' };
  }

  const agentsDoc = agentsDocPath(projectId);
  const agentsText = fs.existsSync(agentsDoc) ? fs.readFileSync(agentsDoc, 'utf-8') : '';
  if (!agentsText.trim()) {
    return { ok: false, error: 'AGENTS.md is empty. Fill it out before running.' };
  }

  const python = resolvePythonPath();
  const scriptPath = path.join(__dirname, '..', 'multi_agent_workflow.py');
  const args = [scriptPath, '--project-root', state.project.rootPath];
  if (options.taskFile) {
    const task = readTaskFile(options.taskFile);
    if (!task) {
      return { ok: false, error: 'Task file not found' };
    }
    args.push('--task-file', task.name);
    state.project.activeTaskFile = task.name;
  } else {
    args.push('--task-from-agents');
    state.project.activeTaskFile = null;
  }
  const blazorInit = ensureBlazorApp(state);
  if (!blazorInit.ok) {
    addLog(state, 'runner', null, `[blazor init] ${blazorInit.error}`);
    return { ok: false, error: `Blazor init failed: ${blazorInit.error}` };
  }

  addLog(state, 'runner', null, `Launching: ${python} ${args.join(' ')}`);
  const child = spawn(python, args, {
    cwd: state.project.rootPath,
      env: {
        ...process.env,
        PROJECT_ID: state.project.id,
        PROJECT_TYPE: state.project.type,
        PROJECT_ROOT: state.project.rootPath,
        AGENT_APPROVAL_REQUIRED: '1',
        APPROVAL_MODE: 'dashboard'
      }
    });

  projectRunners.set(projectId, child);

  const orchestrator = state.agents.get('runner');
  if (orchestrator) {
    orchestrator.status = 'running';
    orchestrator.currentStep = 'Running multi_agent_workflow.py';
    orchestrator.updatedAt = Date.now();
  }

  state.project.runStatus = 'running';
  state.project.lastRunAt = Date.now();
  state.project.lastRunResult = null;
  saveProjectState(state);

  broadcastEvent(projectId, 'project_run_status', {
    status: state.project.runStatus,
    lastRunAt: state.project.lastRunAt,
    lastRunResult: state.project.lastRunResult,
    activeTaskFile: state.project.activeTaskFile
  });
  if (orchestrator) broadcastEvent(projectId, 'agent_updated', orchestrator);
  addLog(state, 'runner', null, 'Run started.');

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    text.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('AGENT_STATUS|')) {
        const parts = trimmed.split('|');
        const agentId = parts[1];
        const status = parts[2];
        const step = parts.slice(3).join('|') || 'Working';
        const agent = state.agents.get(agentId);
        if (agent) {
          agent.status = status;
          agent.currentStep = step;
          agent.updatedAt = Date.now();
          broadcastEvent(projectId, 'agent_updated', agent);
          saveProjectState(state);
        }
      } else if (trimmed.startsWith('AGENT_TOKENS|')) {
        const parts = trimmed.split('|');
        const agentId = parts[1];
        const tokens = Number(parts[2]) || 0;
        state.tokenUsage = state.tokenUsage || {};
        state.tokenUsage[agentId] = (state.tokenUsage[agentId] || 0) + tokens;
        saveProjectState(state);
        broadcastEvent(projectId, 'costs_updated', computeCosts(state).global);
      } else if (trimmed.startsWith('AGENT_LOG|')) {
        const parts = trimmed.split('|');
        const agentId = parts[1] || 'runner';
        const message = parts.slice(2).join('|') || '';
        addLog(state, agentId, null, message);
      } else if (trimmed.startsWith('APPROVAL_REQUEST|')) {
        const payloadText = trimmed.slice('APPROVAL_REQUEST|'.length);
        try {
          const payload = JSON.parse(payloadText);
          handleApprovalRequest(state, payload);
        } catch (err) {
          addLog(state, 'runner', null, `Invalid approval payload: ${payloadText}`);
        }
      } else {
        addLog(state, 'runner', null, trimmed);
      }
    });
  });
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    text.split(/\r?\n/).forEach((line) => {
      if (line.trim()) addLog(state, 'runner', null, `[stderr] ${line.trim()}`);
    });
  });
  child.on('error', (err) => {
    projectRunners.delete(projectId);
    state.project.runStatus = 'failed';
    state.project.lastRunResult = err.message;
    saveProjectState(state);
    const orchestrator = state.agents.get('runner');
    if (orchestrator) {
      orchestrator.status = 'failed';
      orchestrator.currentStep = 'Failed to start';
      orchestrator.updatedAt = Date.now();
      broadcastEvent(projectId, 'agent_updated', orchestrator);
    }
    broadcastEvent(projectId, 'project_run_status', {
      status: state.project.runStatus,
      lastRunAt: state.project.lastRunAt,
      lastRunResult: state.project.lastRunResult,
      activeTaskFile: state.project.activeTaskFile
    });
    addLog(state, 'runner', null, `[spawn error] ${err.message}`);
  });
  child.on('close', (code) => {
    projectRunners.delete(projectId);
    const status = code === 0 ? 'completed' : 'failed';
    state.project.runStatus = status;
    state.project.lastRunResult = code === 0 ? 'ok' : `exit ${code}`;
    saveProjectState(state);

    const orchestrator = state.agents.get('runner');
    if (orchestrator) {
      orchestrator.status = status === 'completed' ? 'idle' : 'failed';
      orchestrator.currentStep = status === 'completed' ? 'Idle' : 'Failed';
      orchestrator.updatedAt = Date.now();
      broadcastEvent(projectId, 'agent_updated', orchestrator);
    }
    broadcastEvent(projectId, 'project_run_status', {
      status: state.project.runStatus,
      lastRunAt: state.project.lastRunAt,
      lastRunResult: state.project.lastRunResult
    });
    addLog(state, 'runner', null, `Run finished with status: ${status}.`);
  });

  return { ok: true };
}

function runSingleTask(state, taskFile) {
  return new Promise((resolve) => {
    const projectId = state.project.id;
    const python = resolvePythonPath();
    const scriptPath = path.join(__dirname, '..', 'multi_agent_workflow.py');
    const args = [scriptPath, '--project-root', state.project.rootPath];

    if (taskFile) {
      const task = readTaskFile(taskFile);
      if (!task) {
        addLog(state, 'runner', null, `Task file not found: ${taskFile}`);
        resolve({ ok: false });
        return;
      }
      args.push('--task-file', task.name);
      state.project.activeTaskFile = task.name;
      saveProjectState(state);
      broadcastEvent(projectId, 'project_run_status', {
        status: state.project.runStatus,
        lastRunAt: state.project.lastRunAt,
        lastRunResult: state.project.lastRunResult,
        activeTaskFile: state.project.activeTaskFile
      });
    } else {
      args.push('--task-from-agents');
      state.project.activeTaskFile = null;
    }

    addLog(state, 'runner', null, `Launching: ${python} ${args.join(' ')}`);
    const child = spawn(python, args, {
      cwd: state.project.rootPath,
      env: {
        ...process.env,
        PROJECT_ID: state.project.id,
        PROJECT_TYPE: state.project.type,
        PROJECT_ROOT: state.project.rootPath,
        AGENT_APPROVAL_REQUIRED: '1',
        APPROVAL_MODE: 'dashboard',
      },
    });

    projectRunners.set(projectId, child);

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      text.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('AGENT_STATUS|')) {
          const parts = trimmed.split('|');
          const agentId = parts[1];
          const status = parts[2];
          const step = parts.slice(3).join('|') || 'Working';
          const agent = state.agents.get(agentId);
          if (agent) {
            agent.status = status;
            agent.currentStep = step;
            agent.updatedAt = Date.now();
            broadcastEvent(projectId, 'agent_updated', agent);
            saveProjectState(state);
          }
        } else if (trimmed.startsWith('AGENT_TOKENS|')) {
          const parts = trimmed.split('|');
          const agentId = parts[1];
          const tokens = Number(parts[2]) || 0;
          state.tokenUsage = state.tokenUsage || {};
          state.tokenUsage[agentId] = (state.tokenUsage[agentId] || 0) + tokens;
          saveProjectState(state);
          broadcastEvent(projectId, 'costs_updated', computeCosts(state).global);
      } else if (trimmed.startsWith('AGENT_LOG|')) {
        const parts = trimmed.split('|');
        const agentId = parts[1] || 'runner';
        const message = parts.slice(2).join('|') || '';
        addLog(state, agentId, null, message);
      } else if (trimmed.startsWith('APPROVAL_REQUEST|')) {
        const payloadText = trimmed.slice('APPROVAL_REQUEST|'.length);
        try {
          const payload = JSON.parse(payloadText);
          handleApprovalRequest(state, payload);
        } catch (err) {
          addLog(state, 'runner', null, `Invalid approval payload: ${payloadText}`);
        }
      } else {
        addLog(state, 'runner', null, trimmed);
      }
    });
  });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      text.split(/\r?\n/).forEach((line) => {
        if (line.trim()) addLog(state, 'runner', null, `[stderr] ${line.trim()}`);
      });
    });

    child.on('close', (code) => {
      projectRunners.delete(projectId);
      resolve({ ok: code === 0 });
    });

    child.on('error', (err) => {
      projectRunners.delete(projectId);
      addLog(state, 'runner', null, `[spawn error] ${err.message}`);
      resolve({ ok: false });
    });
  });
}

function startProjectRunAll(state) {
  const projectId = state.project.id;
  if (projectRunners.has(projectId)) {
    return { ok: false, error: 'Project is already running' };
  }

  const tasks = listTaskFiles().map((t) => t.name);
  if (!tasks.length) {
    return { ok: false, error: 'No task templates found' };
  }

  const blazorInit = ensureBlazorApp(state);
  if (!blazorInit.ok) {
    addLog(state, 'runner', null, `[blazor init] ${blazorInit.error}`);
    return { ok: false, error: `Blazor init failed: ${blazorInit.error}` };
  }

  const orchestrator = state.agents.get('runner');
  if (orchestrator) {
    orchestrator.status = 'running';
    orchestrator.currentStep = 'Running task queue';
    orchestrator.updatedAt = Date.now();
  }

  state.project.runStatus = 'running';
  state.project.lastRunAt = Date.now();
  state.project.lastRunResult = null;
  state.project.activeTaskFile = null;
  saveProjectState(state);
  broadcastEvent(projectId, 'project_run_status', {
    status: state.project.runStatus,
    lastRunAt: state.project.lastRunAt,
    lastRunResult: state.project.lastRunResult,
    activeTaskFile: state.project.activeTaskFile,
  });
  if (orchestrator) broadcastEvent(projectId, 'agent_updated', orchestrator);

  (async () => {
    addLog(state, 'runner', null, `Run-all started with ${tasks.length} tasks.`);
    for (const taskFile of tasks) {
      addLog(state, 'runner', null, `Starting task file: ${taskFile}`);
      const result = await runSingleTask(state, taskFile);
      if (!result.ok) {
        state.project.runStatus = 'failed';
        state.project.lastRunResult = `task failed: ${taskFile}`;
        state.project.activeTaskFile = null;
        saveProjectState(state);
        broadcastEvent(projectId, 'project_run_status', {
          status: state.project.runStatus,
          lastRunAt: state.project.lastRunAt,
          lastRunResult: state.project.lastRunResult,
          activeTaskFile: state.project.activeTaskFile,
        });
        if (orchestrator) {
          orchestrator.status = 'failed';
          orchestrator.currentStep = 'Failed';
          orchestrator.updatedAt = Date.now();
          broadcastEvent(projectId, 'agent_updated', orchestrator);
        }
        addLog(state, 'runner', null, `Run-all stopped after failure: ${taskFile}`);
        return;
      }
    }
    state.project.runStatus = 'completed';
    state.project.lastRunResult = 'ok';
    state.project.activeTaskFile = null;
    saveProjectState(state);
    broadcastEvent(projectId, 'project_run_status', {
      status: state.project.runStatus,
      lastRunAt: state.project.lastRunAt,
      lastRunResult: state.project.lastRunResult,
      activeTaskFile: state.project.activeTaskFile,
    });
    if (orchestrator) {
      orchestrator.status = 'idle';
      orchestrator.currentStep = 'Idle';
      orchestrator.updatedAt = Date.now();
      broadcastEvent(projectId, 'agent_updated', orchestrator);
    }
    addLog(state, 'runner', null, 'Run-all completed.');
  })();

  return { ok: true };
}

function getProjectOr404(req, res) {
  const projectId = req.params.projectId || req.query.projectId;
  if (!projectId || !projects.has(projectId)) {
    res.status(404).json({ error: 'Project not found' });
    return null;
  }
  return projects.get(projectId);
}

function broadcastEvent(projectId, type, data) {
  const clients = sseClientsByProject.get(projectId);
  if (!clients) return;
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.res.write(payload);
    } catch (err) {
      clients.delete(client);
    }
  }
}

function appendDiary(state, agentId, message) {
  const stamp = new Date().toISOString();
  const line = `- [${stamp}] ${message}\n`;
  try {
    fs.appendFileSync(diaryPath(state.project.id, agentId), line, 'utf-8');
  } catch (err) {
    // Ignore diary write failures to keep app responsive
  }
}

function appendApprovalLog(state, approval, decision) {
  const stamp = new Date().toISOString();
  const logDir = path.join(state.project.rootPath, 'logs');
  ensureDir(logDir);
  const logPath = path.join(logDir, 'APPROVALS.md');
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '# Approvals Log\n\n', 'utf-8');
  }
  const line = `- [${stamp}] ${decision.toUpperCase()} • ${approval.agentId} • ${approval.stepName || 'Approval'} • ${approval.id}\n`;
  try {
    fs.appendFileSync(logPath, line, 'utf-8');
  } catch (err) {
    // Ignore approval log write failures
  }
}

function writeApprovalDecision(state, approval) {
  const dir = approvalsDir(state.project.id);
  ensureDir(dir);
  const payload = {
    id: approval.id,
    status: approval.status,
    decidedAt: approval.decidedAt,
    agentId: approval.agentId,
    stepName: approval.stepName || null,
  };
  fs.writeFileSync(
    approvalDecisionPath(state.project.id, approval.id),
    JSON.stringify(payload, null, 2),
    'utf-8'
  );
}

function handleApprovalRequest(state, payload) {
  if (!payload || typeof payload !== 'object') return;
  const files = Array.isArray(payload.files) ? payload.files : [];
  const outputSummary =
    payload.summary ||
    payload.outputSummary ||
    (files.length ? `Files:\n- ${files.join('\n- ')}` : '');

  const approval = {
    id: payload.id || nanoid(),
    agentId: payload.agentId || payload.agent_id || 'runner',
    taskId: payload.taskId || null,
    status: 'pending',
    outputSummary,
    createdAt: Date.now(),
    decidedAt: null,
    stepName: payload.role || payload.stepName || null,
    files
  };

  state.approvals.set(approval.id, approval);
  broadcastEvent(state.project.id, 'approval_created', approval);
  addLog(
    state,
    approval.agentId,
    approval.taskId,
    `Approval requested for ${approval.stepName || approval.id}.`
  );

  if (state.project.runStatus === 'running') {
    state.project.runStatus = 'waiting_approval';
    saveProjectState(state);
    broadcastEvent(state.project.id, 'project_run_status', {
      status: state.project.runStatus,
      lastRunAt: state.project.lastRunAt,
      lastRunResult: state.project.lastRunResult,
      activeTaskFile: state.project.activeTaskFile
    });
  }
}

function addLog(state, agentId, taskId, message) {
  const entry = {
    id: nanoid(),
    agentId,
    taskId: taskId || null,
    timestamp: Date.now(),
    message
  };
  state.logs.push(entry);
  appendDiary(state, agentId, message);
  broadcastEvent(state.project.id, 'log_appended', entry);
  saveProjectState(state);
}

function computeMetrics(state) {
  const perAgent = {};
  const globalAgg = {
    totalTasks: 0,
    successCount: 0,
    failureCount: 0,
    totalDurationMs: 0,
    completedCount: 0
  };

  for (const agent of state.agents.values()) {
    perAgent[agent.id] = {
      agentId: agent.id,
      totalTasks: 0,
      successCount: 0,
      failureCount: 0,
      averageTaskDurationMs: 0
    };
  }

  for (const task of state.tasks.values()) {
    const agentMetrics =
      perAgent[task.agentId] ||
      (perAgent[task.agentId] = {
        agentId: task.agentId,
        totalTasks: 0,
        successCount: 0,
        failureCount: 0,
        averageTaskDurationMs: 0
      });

    agentMetrics.totalTasks += 1;
    globalAgg.totalTasks += 1;

    if (task.status === 'completed') {
      agentMetrics.successCount += 1;
      globalAgg.successCount += 1;
    } else if (task.status === 'failed') {
      agentMetrics.failureCount += 1;
      globalAgg.failureCount += 1;
    }

    if (task.startedAt && task.endedAt && task.endedAt >= task.startedAt) {
      const duration = task.endedAt - task.startedAt;
      agentMetrics._totalDurationMs =
        (agentMetrics._totalDurationMs || 0) + duration;
      agentMetrics._completedCount =
        (agentMetrics._completedCount || 0) + 1;

      globalAgg.totalDurationMs += duration;
      globalAgg.completedCount += 1;
    }
  }

  Object.values(perAgent).forEach((m) => {
    if (m._completedCount && m._completedCount > 0) {
      m.averageTaskDurationMs = m._totalDurationMs / m._completedCount;
    } else {
      m.averageTaskDurationMs = 0;
    }
    delete m._totalDurationMs;
    delete m._completedCount;
  });

  const globalMetrics = {
    totalTasks: globalAgg.totalTasks,
    successCount: globalAgg.successCount,
    failureCount: globalAgg.failureCount,
    averageTaskDurationMs:
      globalAgg.completedCount > 0
        ? globalAgg.totalDurationMs / globalAgg.completedCount
        : 0
  };

  return { global: globalMetrics, perAgent };
}

function computeCosts(state) {
  const perAgent = {};
  let totalTokens = 0;
  const usage = state.tokenUsage || {};

  for (const task of state.tasks.values()) {
    const agentCosts =
      perAgent[task.agentId] ||
      (perAgent[task.agentId] = {
        agentId: task.agentId,
        tokensUsed: 0,
        cost: 0
      });

    const tokens = task.tokensUsed || 0;
    agentCosts.tokensUsed += tokens;
    totalTokens += tokens;
  }

  Object.entries(usage).forEach(([agentId, tokens]) => {
    const agentCosts =
      perAgent[agentId] ||
      (perAgent[agentId] = {
        agentId,
        tokensUsed: 0,
        cost: 0
      });
    const count = Number(tokens) || 0;
    agentCosts.tokensUsed += count;
    totalTokens += count;
  });

  Object.values(perAgent).forEach((c) => {
    c.cost = (c.tokensUsed / 1000) * TOKEN_COST_PER_1K;
  });

  const global = {
    totalTokens,
    totalCost: (totalTokens / 1000) * TOKEN_COST_PER_1K
  };

  return { global, perAgent };
}

function simulateTaskLifecycle(projectId, taskId) {
  const state = projects.get(projectId);
  if (!state) return;
  const task = state.tasks.get(taskId);
  if (!task) return;
  const agent = state.agents.get(task.agentId);
  if (!agent) return;

  agent.status = 'running';
  agent.currentTaskId = task.id;
  agent.currentStep = 'Starting task';
  agent.updatedAt = Date.now();
  task.status = 'running';
  task.startedAt = Date.now();

  broadcastEvent(projectId, 'agent_updated', agent);
  broadcastEvent(projectId, 'task_updated', task);
  addLog(state, agent.id, task.id, `Task started: ${task.description}`);

  setTimeout(() => {
    const currentState = projects.get(projectId);
    const currentTask = currentState?.tasks.get(taskId);
    const currentAgent = currentState?.agents.get(agent.id);
    if (!currentState || !currentTask || currentTask.status !== 'running') return;
    currentAgent.currentStep = 'Processing step 1/2';
    currentAgent.updatedAt = Date.now();
    broadcastEvent(projectId, 'agent_updated', currentAgent);
    addLog(currentState, agent.id, task.id, 'Processing data (step 1/2)...');
  }, 1000);

  setTimeout(() => {
    const currentState = projects.get(projectId);
    const currentTask = currentState?.tasks.get(taskId);
    const currentAgent = currentState?.agents.get(agent.id);
    if (!currentState || !currentTask || currentTask.status !== 'running') return;

    currentAgent.currentStep = 'Waiting for approval';
    currentAgent.updatedAt = Date.now();
    broadcastEvent(projectId, 'agent_updated', currentAgent);

    const approval = {
      id: nanoid(),
      agentId: currentAgent.id,
      taskId: currentTask.id,
      status: 'pending',
      outputSummary: `Proposed output for task "${currentTask.description}"`,
      createdAt: Date.now(),
      decidedAt: null
    };
    currentState.approvals.set(approval.id, approval);
    broadcastEvent(projectId, 'approval_created', approval);
    addLog(
      currentState,
      currentAgent.id,
      currentTask.id,
      'Reached approval gate. Waiting for user decision...'
    );
  }, 2000);
}

function completeTaskAfterApproval(projectId, approval) {
  const state = projects.get(projectId);
  if (!state) return;
  const task = state.tasks.get(approval.taskId);
  const agent = state.agents.get(approval.agentId);
  if (!task || !agent || task.status !== 'running') return;

  agent.currentStep = 'Finalizing after approval';
  agent.updatedAt = Date.now();
  broadcastEvent(projectId, 'agent_updated', agent);
  addLog(state, agent.id, task.id, 'Approval granted. Finalizing task...');

  setTimeout(() => {
    const currentState = projects.get(projectId);
    if (!currentState) return;
    const currentTask = currentState.tasks.get(task.id);
    const currentAgent = currentState.agents.get(agent.id);
    if (!currentTask || !currentAgent) return;

    const tokensUsed = 500 + Math.floor(Math.random() * 1500);
    currentTask.tokensUsed = tokensUsed;
    currentTask.status = 'completed';
    currentTask.endedAt = Date.now();

    currentAgent.status = 'idle';
    currentAgent.currentTaskId = null;
    currentAgent.lastTaskId = currentTask.id;
    currentAgent.currentStep = 'Idle';
    currentAgent.updatedAt = Date.now();

    broadcastEvent(projectId, 'task_updated', currentTask);
    broadcastEvent(projectId, 'agent_updated', currentAgent);
    broadcastEvent(projectId, 'metrics_updated', computeMetrics(currentState));
    broadcastEvent(projectId, 'costs_updated', computeCosts(currentState));
    addLog(
      currentState,
      currentAgent.id,
      currentTask.id,
      `Task completed. Tokens used: ${tokensUsed}.`
    );
  }, 1000);
}

function getAgentOr404(state, req, res) {
  const id = req.params.id;
  const agent = state.agents.get(id);
  if (!agent) {
    res.status(404).json({ error: `Agent not found: ${id}` });
    return null;
  }
  return agent;
}

function getApprovalOr404(state, req, res) {
  const id = req.params.id;
  const approval = state.approvals.get(id);
  if (!approval) {
    res.status(404).json({ error: `Approval not found: ${id}` });
    return null;
  }
  return approval;
}

// -----------------------------------------------------------------------------
// Routes: Projects
// -----------------------------------------------------------------------------

app.get('/projects', (req, res) => {
  const list = Array.from(projects.values()).map((state) => ({
    id: state.project.id,
    name: state.project.name,
    type: state.project.type,
    rootPath: state.project.rootPath,
    createdAt: state.project.createdAt,
    updatedAt: state.project.updatedAt,
    runStatus: state.project.runStatus,
    lastRunAt: state.project.lastRunAt,
    lastRunResult: state.project.lastRunResult,
    activeTaskFile: state.project.activeTaskFile,
    agentCount: state.agents.size
  }));
  res.json(list);
});

app.post('/projects', (req, res) => {
  const name = (req.body && req.body.name || '').trim();
  const type = (req.body && req.body.type || 'web').trim();
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }
  const state = createProjectState({ name, type });
  projects.set(state.project.id, state);
  res.status(201).json(state.project);
});

// ---------------------------------------------------------------------------
// Routes: Task templates (global)
// ---------------------------------------------------------------------------

app.get('/tasks', (req, res) => {
  res.json(listTaskFiles());
});

app.get('/tasks/:name', (req, res) => {
  const task = readTaskFile(req.params.name);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.get('/projects/:projectId', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  res.json({
    project: state.project,
    agents: Array.from(state.agents.values())
  });
});

app.post('/projects/:projectId/run', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const taskFile = req.body && req.body.taskFile ? String(req.body.taskFile) : null;
  const result = startProjectRun(state, { taskFile });
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ ok: true });
});

app.post('/projects/:projectId/run-all', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const result = startProjectRunAll(state);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ ok: true });
});

app.get('/projects/:projectId/agents-doc', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const content = fs.readFileSync(agentsDocPath(state.project.id), 'utf-8');
  res.json({ content });
});

app.put('/projects/:projectId/agents-doc', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const content = (req.body && req.body.content) || '';
  fs.writeFileSync(agentsDocPath(state.project.id), content, 'utf-8');
  saveProjectState(state);
  res.json({ ok: true });
});

app.get('/projects/:projectId/diaries/:agentId', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const agentId = req.params.agentId;
  const dPath = diaryPath(state.project.id, agentId);
  if (!fs.existsSync(dPath)) {
    return res.status(404).json({ error: 'Diary not found' });
  }
  const content = fs.readFileSync(dPath, 'utf-8');
  res.json({ content });
});

// -----------------------------------------------------------------------------
// Routes: Agents & Tasks (project-scoped)
// -----------------------------------------------------------------------------

app.get('/projects/:projectId/agents', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const metrics = computeMetrics(state).perAgent;
  const costs = computeCosts(state).perAgent;

  const list = Array.from(state.agents.values()).map((a) => {
    const m = metrics[a.id] || {
      totalTasks: 0,
      successCount: 0,
      failureCount: 0,
      averageTaskDurationMs: 0
    };
    const c = costs[a.id] || { tokensUsed: 0, cost: 0 };
    return { ...a, metrics: m, costs: c };
  });

  res.json(list);
});

app.get('/projects/:projectId/agents/:id', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const agent = getAgentOr404(state, req, res);
  if (!agent) return;

  const agentTasks = Array.from(state.tasks.values()).filter(
    (t) => t.agentId === agent.id
  );

  const agentLogs = state.logs.filter((l) => l.agentId === agent.id);

  const agentApprovals = Array.from(state.approvals.values()).filter(
    (a) => a.agentId === agent.id
  );

  const metrics = computeMetrics(state).perAgent[agent.id] || {
    totalTasks: 0,
    successCount: 0,
    failureCount: 0,
    averageTaskDurationMs: 0
  };

  const costs = computeCosts(state).perAgent[agent.id] || {
    tokensUsed: 0,
    cost: 0
  };

  res.json({
    ...agent,
    metrics,
    costs,
    tasks: agentTasks,
    logs: agentLogs,
    approvals: agentApprovals
  });
});

app.post('/projects/:projectId/agents/:id/tasks', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const agent = getAgentOr404(state, req, res);
  if (!agent) return;

  const description = (req.body && req.body.description || '').trim();
  if (!description) {
    return res.status(400).json({ error: 'Task description is required' });
  }

  const task = {
    id: nanoid(),
    agentId: agent.id,
    description,
    status: 'pending',
    createdAt: Date.now(),
    startedAt: null,
    endedAt: null,
    tokensUsed: 0,
    error: null
  };
  state.tasks.set(task.id, task);
  agent.lastTaskId = task.id;
  agent.updatedAt = Date.now();

  broadcastEvent(state.project.id, 'task_created', task);
  broadcastEvent(state.project.id, 'agent_updated', agent);
  addLog(state, agent.id, task.id, `New task assigned: ${description}`);

  res.status(201).json(task);
});

app.post('/projects/:projectId/agents/:id/start', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const agent = getAgentOr404(state, req, res);
  if (!agent) return;

  if (agent.status === 'running') {
    return res.status(400).json({ error: 'Agent is already running' });
  }

  const agentTasks = Array.from(state.tasks.values()).filter(
    (t) => t.agentId === agent.id
  );
  const recent = agentTasks.sort((a, b) => b.createdAt - a.createdAt)[0];

  let taskToRun = null;
  if (recent && (recent.status === 'pending' || recent.status === 'failed')) {
    taskToRun = recent;
    taskToRun.error = null;
  } else {
    const generic = {
      id: nanoid(),
      agentId: agent.id,
      description: 'Generic work cycle',
      status: 'pending',
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,
      tokensUsed: 0,
      error: null
    };
    state.tasks.set(generic.id, generic);
    taskToRun = generic;
  }

  simulateTaskLifecycle(state.project.id, taskToRun.id);
  res.json({ ok: true, task: taskToRun });
});

app.post('/projects/:projectId/agents/:id/stop', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const agent = getAgentOr404(state, req, res);
  if (!agent) return;

  if (agent.status !== 'running') {
    return res.status(400).json({ error: 'Agent is not running' });
  }

  const task = agent.currentTaskId && state.tasks.get(agent.currentTaskId);
  if (task) {
    task.status = 'stopped';
    task.endedAt = Date.now();
    task.error = 'Stopped by user';
    broadcastEvent(state.project.id, 'task_updated', task);
  }

  agent.status = 'paused';
  agent.currentStep = 'Stopped by user';
  agent.currentTaskId = null;
  agent.updatedAt = Date.now();
  broadcastEvent(state.project.id, 'agent_updated', agent);
  addLog(state, agent.id, task ? task.id : null, 'Agent stopped by user.');

  res.json({ ok: true });
});

app.post('/projects/:projectId/agents/:id/retry', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const agent = getAgentOr404(state, req, res);
  if (!agent) return;

  const lastTask =
    agent.lastTaskId && state.tasks.get(agent.lastTaskId)
      ? state.tasks.get(agent.lastTaskId)
      : null;

  if (!lastTask) {
    return res.status(400).json({ error: 'No previous task to retry' });
  }

  const retryTask = {
    ...lastTask,
    id: nanoid(),
    status: 'pending',
    createdAt: Date.now(),
    startedAt: null,
    endedAt: null,
    error: null
  };
  state.tasks.set(retryTask.id, retryTask);
  agent.lastTaskId = retryTask.id;
  agent.updatedAt = Date.now();

  broadcastEvent(state.project.id, 'task_created', retryTask);
  broadcastEvent(state.project.id, 'agent_updated', agent);
  addLog(state, agent.id, retryTask.id, 'Retrying last task.');

  simulateTaskLifecycle(state.project.id, retryTask.id);
  res.json({ ok: true, task: retryTask });
});

// -----------------------------------------------------------------------------
// Routes: Approvals
// -----------------------------------------------------------------------------

app.get('/projects/:projectId/approvals', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  res.json(Array.from(state.approvals.values()));
});

app.post('/projects/:projectId/approvals/:id/approve', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const approval = getApprovalOr404(state, req, res);
  if (!approval) return;

  if (approval.status !== 'pending') {
    return res.status(400).json({ error: 'Approval already decided' });
  }

  approval.status = 'approved';
  approval.decidedAt = Date.now();
  broadcastEvent(state.project.id, 'approval_updated', approval);
  addLog(state, approval.agentId, approval.taskId, 'Approval granted.');
  appendApprovalLog(state, approval, 'approved');
  writeApprovalDecision(state, approval);

  if (projectRunners.has(state.project.id)) {
    state.project.runStatus = 'running';
    saveProjectState(state);
    broadcastEvent(state.project.id, 'project_run_status', {
      status: state.project.runStatus,
      lastRunAt: state.project.lastRunAt,
      lastRunResult: state.project.lastRunResult,
      activeTaskFile: state.project.activeTaskFile
    });
  }

  completeTaskAfterApproval(state.project.id, approval);
  res.json({ ok: true });
});

app.post('/projects/:projectId/approvals/:id/reject', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  const approval = getApprovalOr404(state, req, res);
  if (!approval) return;

  if (approval.status !== 'pending') {
    return res.status(400).json({ error: 'Approval already decided' });
  }

  approval.status = 'rejected';
  approval.decidedAt = Date.now();
  broadcastEvent(state.project.id, 'approval_updated', approval);
  addLog(state, approval.agentId, approval.taskId, 'Approval rejected.');
  appendApprovalLog(state, approval, 'rejected');
  writeApprovalDecision(state, approval);

  if (projectRunners.has(state.project.id)) {
    state.project.runStatus = 'running';
    saveProjectState(state);
    broadcastEvent(state.project.id, 'project_run_status', {
      status: state.project.runStatus,
      lastRunAt: state.project.lastRunAt,
      lastRunResult: state.project.lastRunResult,
      activeTaskFile: state.project.activeTaskFile
    });
  }

  const task = state.tasks.get(approval.taskId);
  const agent = state.agents.get(approval.agentId);
  if (task) {
    task.status = 'failed';
    task.error = 'Rejected by user';
    task.endedAt = Date.now();
    broadcastEvent(state.project.id, 'task_updated', task);
  }
  if (agent) {
    agent.status = 'failed';
    agent.currentTaskId = null;
    agent.currentStep = 'Failed after rejection';
    agent.updatedAt = Date.now();
    broadcastEvent(state.project.id, 'agent_updated', agent);
  }

  res.json({ ok: true });
});

// -----------------------------------------------------------------------------
// Routes: Metrics & Costs
// -----------------------------------------------------------------------------

app.get('/projects/:projectId/metrics', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  res.json(computeMetrics(state).global);
});

app.get('/projects/:projectId/costs', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;
  res.json(computeCosts(state).global);
});

// -----------------------------------------------------------------------------
// Routes: Real-time SSE
// -----------------------------------------------------------------------------

app.get('/projects/:projectId/events', (req, res) => {
  const state = getProjectOr404(req, res);
  if (!state) return;

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  const clientId = nanoid();
  const client = { id: clientId, res };
  if (!sseClientsByProject.has(state.project.id)) {
    sseClientsByProject.set(state.project.id, new Set());
  }
  sseClientsByProject.get(state.project.id).add(client);

  res.write(`event: connected\ndata: ${JSON.stringify({ id: clientId })}\n\n`);

  req.on('close', () => {
    const set = sseClientsByProject.get(state.project.id);
    if (set) set.delete(client);
  });
});

// -----------------------------------------------------------------------------
// Root route: serve dashboard UI
// -----------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

loadProjects();

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
