import os
import asyncio
import logging
import json
import re
import argparse
from datetime import datetime
from dotenv import load_dotenv
from agents import Agent, RunConfig, Runner, WebSearchTool, ModelSettings
from agents.handoffs import HandoffInputData
from agents.items import (
    HandoffCallItem,
    HandoffOutputItem,
    ReasoningItem,
    RunItem,
    ToolCallItem,
    ToolCallOutputItem,
)
from agents.extensions.handoff_prompt import RECOMMENDED_PROMPT_PREFIX
from openai.types.shared import Reasoning

FILE_HEADER_RE = re.compile(r"^### FILE:\s*(.+?)\s*$")
FENCE_START_RE = re.compile(r"^\s*```[a-zA-Z0-9_-]*\s*$")
FENCE_END_RE = re.compile(r"^\s*```\s*$")
MODEL_NAME = "gpt-5.1"
APPROVAL_REQUIRED = os.environ.get("AGENT_APPROVAL_REQUIRED", "1") != "0"


class _SuppressMcpValidationWarnings(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        msg = record.getMessage()
        return "Failed to validate notification" not in msg


def _setup_logging() -> str:
    logger = logging.getLogger()
    if logger.handlers:
        return ""

    log_dir = os.path.join(os.getcwd(), "logs")
    os.makedirs(log_dir, exist_ok=True)
    run_id = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(log_dir, f"run_{run_id}_{os.getpid()}.log")

    logger.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)

    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return log_file


def _build_reasoning_settings() -> Reasoning:
    logger = logging.getLogger(__name__)
    enable_encrypted = os.getenv("OPENAI_REASONING_ENCRYPTED", "").lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
    kwargs_list = [{"effort": "low"}]
    if enable_encrypted:
        kwargs_list.insert(0, {"effort": "low", "encrypted_content": True})
    kwargs_list.append({})
    for kwargs in kwargs_list:
        try:
            reasoning = Reasoning(**kwargs)
        except TypeError:
            continue
        if kwargs.get("encrypted_content"):
            logger.info("Reasoning encrypted_content enabled for carry-forward.")
        return reasoning
    logger.warning("Reasoning settings could not be constructed with expected arguments.")
    return Reasoning()


def _build_run_config() -> RunConfig:
    model_settings = ModelSettings(reasoning=_build_reasoning_settings())
    return RunConfig(
        model=MODEL_NAME,
        model_settings=model_settings,
        handoff_input_filter=_grouped_handoff_filter,
        nest_handoff_history=False,
    )


def _grouped_handoff_filter(handoff_input_data: HandoffInputData) -> HandoffInputData:
    logger = logging.getLogger(__name__)
    input_history = handoff_input_data.input_history
    filtered_history = input_history
    removed_history = 0
    if not isinstance(input_history, str):
        filtered_history, removed_history = _filter_input_item_sequence(list(input_history))

    grouped_items, removed_items = _group_tool_items(handoff_input_data.new_items)
    removed_total = removed_history + removed_items
    if removed_total:
        logger.warning(
            "Handoff filter removed %s orphaned tool items (history=%s, new=%s).",
            removed_total,
            removed_history,
            removed_items,
        )

    return handoff_input_data.clone(
        input_history=filtered_history,
        input_items=grouped_items,
    )


def _extract_call_id(item: object) -> str | None:
    if isinstance(item, dict):
        return item.get("call_id") or item.get("tool_call_id")
    if isinstance(item, (ToolCallItem, ToolCallOutputItem, HandoffCallItem, HandoffOutputItem)):
        try:
            input_item = item.to_input_item()
        except Exception:
            return None
        if isinstance(input_item, dict):
            return input_item.get("call_id") or input_item.get("tool_call_id")
    return None


def _call_ids_match(call_item: object, output_item: object) -> bool:
    call_id = _extract_call_id(call_item)
    if not call_id:
        return False
    return call_id == _extract_call_id(output_item)


def _filter_input_item_sequence(items: list[dict]) -> tuple[tuple[dict, ...], int]:
    call_types = {"function_call", "tool_call"}
    output_types = {"function_call_output", "tool_call_output"}
    filtered: list[dict] = []
    removed = 0
    index = 0
    while index < len(items):
        item = items[index]
        item_type = item.get("type")
        if item_type == "reasoning":
            if (
                index + 2 < len(items)
                and items[index + 1].get("type") in call_types
                and items[index + 2].get("type") in output_types
                and _call_ids_match(items[index + 1], items[index + 2])
            ):
                filtered.extend([item, items[index + 1], items[index + 2]])
                index += 3
                continue
            removed += 1
            index += 1
            continue
        if item_type in call_types:
            if (
                index + 1 < len(items)
                and items[index + 1].get("type") in output_types
                and _call_ids_match(item, items[index + 1])
            ):
                filtered.extend([item, items[index + 1]])
                index += 2
                continue
            removed += 1
            index += 1
            continue
        if item_type in output_types:
            removed += 1
            index += 1
            continue
        filtered.append(item)
        index += 1
    return tuple(filtered), removed


def _group_tool_items(items: tuple[RunItem, ...]) -> tuple[tuple[RunItem, ...], int]:
    logger = logging.getLogger(__name__)
    call_types = (ToolCallItem, HandoffCallItem)
    output_types = (ToolCallOutputItem, HandoffOutputItem)
    grouped: list[RunItem] = []
    removed = 0
    grouped_pairs = 0
    kept_singles = 0
    index = 0
    while index < len(items):
        item = items[index]
        if isinstance(item, dict):
            item_type = item.get("type")
            if item_type == "reasoning":
                if (
                    index + 2 < len(items)
                    and isinstance(items[index + 1], dict)
                    and items[index + 1].get("type") in {"function_call", "tool_call"}
                    and isinstance(items[index + 2], dict)
                    and items[index + 2].get("type") in {"function_call_output", "tool_call_output"}
                    and _call_ids_match(items[index + 1], items[index + 2])
                ):
                    grouped.extend([item, items[index + 1], items[index + 2]])
                    grouped_pairs += 1
                    index += 3
                    continue
                removed += 1
                index += 1
                continue
            if item_type in {"function_call", "tool_call"}:
                if index + 1 < len(items):
                    next_item = items[index + 1]
                    if isinstance(next_item, dict) and next_item.get("type") in {
                        "function_call_output",
                        "tool_call_output",
                    } and _call_ids_match(item, next_item):
                        grouped.extend([item, next_item])
                        grouped_pairs += 1
                        index += 2
                        continue
                removed += 1
                index += 1
                continue
            if item_type in {"function_call_output", "tool_call_output"}:
                removed += 1
                index += 1
                continue
            grouped.append(item)
            kept_singles += 1
            index += 1
            continue
        if isinstance(item, ReasoningItem):
            if (
                index + 2 < len(items)
                and isinstance(items[index + 1], call_types)
                and isinstance(items[index + 2], output_types)
                and _call_ids_match(items[index + 1], items[index + 2])
            ):
                grouped.extend([item, items[index + 1], items[index + 2]])
                grouped_pairs += 1
                index += 3
                continue
            removed += 1
            index += 1
            continue
        if isinstance(item, call_types):
            if (
                index + 1 < len(items)
                and isinstance(items[index + 1], output_types)
                and _call_ids_match(item, items[index + 1])
            ):
                grouped.extend([item, items[index + 1]])
                grouped_pairs += 1
                index += 2
                continue
            removed += 1
            index += 1
            continue
        if isinstance(item, output_types):
            removed += 1
            index += 1
            continue
        grouped.append(item)
        kept_singles += 1
        index += 1
    if grouped_pairs or kept_singles or removed:
        logger.debug(
            "Grouped tool items: pairs=%s kept=%s removed=%s",
            grouped_pairs,
            kept_singles,
            removed,
        )
    return tuple(grouped), removed


def _permissions_instructions() -> str:
    return (
        "<permissions instructions>\n"
        "- Local execution only. Network access permitted.\n"
        "- Files may be created and modified within the project folder.\n"
        "- Avoid destructive commands unless explicitly requested.\n"
        "</permissions instructions>"
    )


def _environment_context() -> str:
    cwd = os.getcwd()
    shell = os.environ.get("SHELL", "bash")
    return f"<environment_context>\n  <cwd>{cwd}</cwd>\n  <shell>{shell}</shell>\n</environment_context>"


def _base_input_items() -> list[dict]:
    return [
        {
            "type": "message",
            "role": "developer",
            "content": [{"type": "input_text", "text": _permissions_instructions()}],
        },
        {
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": _environment_context()}],
        },
    ]


def _user_message(text: str) -> list[dict]:
    return [
        {
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": text}],
        }
    ]


def _parse_files_from_output(text: str) -> dict[str, str]:
    files: dict[str, str] = {}
    current_path: str | None = None
    buffer: list[str] = []

    for line in text.splitlines():
        match = FILE_HEADER_RE.match(line)
        if match:
            if current_path is not None:
                files[current_path] = "\n".join(buffer).rstrip() + "\n"
            current_path = match.group(1)
            buffer = []
            continue
        if current_path is not None:
            buffer.append(line)

    if current_path is not None:
        files[current_path] = "\n".join(buffer).rstrip() + "\n"

    return files


def _strip_markdown_fences(content: str) -> str:
    lines = content.splitlines()
    if not lines:
        return content
    if FENCE_START_RE.match(lines[0]) and FENCE_END_RE.match(lines[-1]):
        return "\n".join(lines[1:-1]).rstrip() + "\n"
    return content


def _write_files(files: dict[str, str]) -> list[str]:
    written: list[str] = []
    for rel_path, content in files.items():
        rel_path = rel_path.strip().lstrip("./")
        if not rel_path:
            continue
        content = _strip_markdown_fences(content)
        abs_path = os.path.join(os.getcwd(), rel_path)
        parent = os.path.dirname(abs_path)
        if parent:
            os.makedirs(parent, exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as handle:
            handle.write(content)
        written.append(rel_path)
    return written


def _read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as handle:
        return handle.read().strip()


def _write_text(path: str, content: str) -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content)


def _require_approval(role: str, written: list[str]) -> None:
    if not APPROVAL_REQUIRED:
        return
    print(f"\nApproval gate: {role}")
    if written:
        for path in written:
            print(f"- {path}")
    while True:
        response = input("Approve this output? (y/n): ").strip().lower()
        if response in {"y", "yes"}:
            return
        if response in {"n", "no"}:
            raise SystemExit("Approval rejected. Exiting workflow.")
        print("Please enter y or n.")


def _agent_status(agent_id: str, status: str, step: str) -> None:
    print(f"AGENT_STATUS|{agent_id}|{status}|{step}", flush=True)


def _agent_log(agent_id: str, message: str) -> None:
    print(f"AGENT_LOG|{agent_id}|{message}", flush=True)


def _agent_tokens(agent_id: str, tokens: int) -> None:
    print(f"AGENT_TOKENS|{agent_id}|{tokens}", flush=True)


def _sum_tokens(result) -> int:
    total = 0
    for response in getattr(result, "raw_responses", []) or []:
        usage = getattr(response, "usage", None)
        if usage is not None:
            total += int(getattr(usage, "total_tokens", 0) or 0)
    return total


def _blazor_constraints() -> str:
    project_type = os.environ.get("PROJECT_TYPE", "").strip().lower()
    if project_type != "blazor":
        return ""
    return (
        "\nAdditional constraints:\n"
        "- This is a Blazor WebAssembly project. Work inside the existing `app/` folder only.\n"
        "- Do NOT create separate `frontend/` or `backend/` folders for the app UI.\n"
        "- Update Blazor files such as `app/Program.cs`, `app/Pages/*`, and `app/wwwroot/*`.\n"
        "- Provide clear instructions to run the Blazor app locally (`dotnet run` in `app/`).\n"
    )


def _common_file_instructions() -> str:
    return "Do not include any extra text outside the file blocks. Do not wrap file contents in triple backticks."


# Uncomment to suppress logging
+#logging.getLogger().addFilter(_SuppressMcpValidationWarnings())

load_dotenv(override=True)
_setup_logging()


async def main() -> None:
    parser = argparse.ArgumentParser(description="Run multi-agent workflow.")
    parser.add_argument("--project-root", default=None, help="Project root to run in.")
    parser.add_argument(
        "--task-from-agents",
        action="store_true",
        help="Use AGENTS.md as the task list input.",
    )
    args, _ = parser.parse_known_args()

    if args.project_root:
        os.chdir(args.project_root)

    run_config = _build_run_config()
    shared_tools = [WebSearchTool()]

    designer_agent = Agent(
        name="Designer",
        model=MODEL_NAME,
        instructions=(
            f"""{RECOMMENDED_PROMPT_PREFIX}"""
            "You are the Designer.\n"
            "Your only source of truth is the provided REQUIREMENTS.md and AGENT_TASKS.md content.\n"
            "Do not assume anything that is not written there.\n\n"
            "Deliverables:\n"
            "- design/design_spec.md - UI/UX layout, screens, and visual notes.\n"
            "- design/wireframe.md - text or ASCII wireframe if specified.\n\n"
            "Output format (required):\n"
            "### FILE: design/design_spec.md\n"
            "<content>\n"
            "### FILE: design/wireframe.md\n"
            "<content>\n\n"
            f"{_common_file_instructions()}"
        ),
        tools=shared_tools,
    )

    frontend_developer_agent = Agent(
        name="Frontend Developer",
        model=MODEL_NAME,
        instructions=(
            f"""{RECOMMENDED_PROMPT_PREFIX}"""
            "You are the Frontend Developer.\n"
            "Read the provided AGENT_TASKS.md and design/design_spec.md content. Implement exactly what is described.\n\n"
            "Deliverables:\n"
            "- frontend/index.html - main page structure\n"
            "- frontend/styles.css or inline styles if specified\n"
            "- frontend/main.js or frontend/game.js if specified\n\n"
            "Output format (required):\n"
            "### FILE: frontend/index.html\n"
            "<content>\n"
            "### FILE: frontend/styles.css\n"
            "<content>\n"
            "### FILE: frontend/main.js\n"
            "<content>\n\n"
            f"{_common_file_instructions()}"
        ),
    )

    backend_developer_agent = Agent(
        name="Backend Developer",
        model=MODEL_NAME,
        instructions=(
            f"""{RECOMMENDED_PROMPT_PREFIX}"""
            "You are the Backend Developer.\n"
            "Read the provided AGENT_TASKS.md and REQUIREMENTS.md content. Implement the backend endpoints described there.\n\n"
            "Deliverables:\n"
            "- backend/package.json - include a start script if requested\n"
            "- backend/server.js - implement the API endpoints and logic exactly as specified\n\n"
            "Output format (required):\n"
            "### FILE: backend/package.json\n"
            "<content>\n"
            "### FILE: backend/server.js\n"
            "<content>\n\n"
            f"{_common_file_instructions()}"
        ),
    )

    tester_agent = Agent(
        name="Tester",
        model=MODEL_NAME,
        instructions=(
            f"""{RECOMMENDED_PROMPT_PREFIX}"""
            "You are the Tester.\n"
            "Read the provided AGENT_TASKS.md and TEST.md content. Verify that the outputs meet the acceptance criteria.\n\n"
            "Deliverables:\n"
            "- tests/TEST_PLAN.md - bullet list of manual checks or automated steps as requested\n"
            "- tests/test.sh or a simple automated script if specified\n\n"
            "Output format (required):\n"
            "### FILE: tests/TEST_PLAN.md\n"
            "<content>\n"
            "### FILE: tests/test.sh\n"
            "<content>\n\n"
            f"{_common_file_instructions()}"
        ),
    )

    project_manager_agent = Agent(
        name="Project Manager",
        model=MODEL_NAME,
        instructions=(
            f"""{RECOMMENDED_PROMPT_PREFIX}"""
            "You are the Project Manager.\n\n"
            "Objective:\n"
            "Convert the input task list into three project-root files the team will execute against.\n\n"
            "Deliverables (write in project root):\n"
            "- REQUIREMENTS.md: concise summary of product goals, target users, key features, and constraints.\n"
            "- TEST.md: tasks with [Owner] tags (Designer, Frontend, Backend, Tester) and clear acceptance criteria.\n"
            "- AGENT_TASKS.md: one section per role containing:\n"
            "  - Project name\n"
            "  - Required deliverables (exact file names and purpose)\n"
            "  - Key technical notes and constraints\n\n"
            "Output format (required):\n"
            "### FILE: REQUIREMENTS.md\n"
            "<content>\n"
            "### FILE: TEST.md\n"
            "<content>\n"
            "### FILE: AGENT_TASKS.md\n"
            "<content>\n\n"
            f"{_common_file_instructions()}"
        ),
    )

    task_list = """
Goal: Build a local web dashboard where I can manage multi-agent workflows and act as their boss.

High-level requirements:
- Dashboard shows a list of agents with status (idle/running/paused/failed), last task, and current step.
- Live logs/stream view for each agent.
- Controls: start, stop, retry, and assign tasks to an agent.
- Approval gates: allow me to approve or reject an agent's output before it proceeds.
- Metrics: total tasks, success/failure counts, average duration.
- Cost tracking: show estimated tokens and cost per agent and total.
- Real-time updates with SSE or WebSocket (pick one and implement).
- Tailwind CSS for styling (local build or CDN is fine).
- Must run on localhost but be deployable later (clean structure, config via env vars).

Roles:
- Designer: create a one-page UI/UX spec and basic wireframe for the dashboard.
- Frontend Developer: implement the dashboard UI with Tailwind and client logic for live updates.
- Backend Developer: implement the API and live update channel; store agent/task data in the best local option.
- Tester: write a quick test plan and a simple script to verify core routes and basic flows.

Constraints:
- No auth for now (local only).
- Keep everything readable for beginners; no heavy frameworks required.
- Outputs should be small files saved in clearly named folders.
- Localhost only for runtime, but structure should be deployable later.
"""

    if args.task_from_agents:
        agents_path = os.path.join(os.getcwd(), "AGENTS.md")
        if os.path.exists(agents_path):
            agents_text = _read_text(agents_path)
            if agents_text:
                task_list = (
                    "Goal: Build the project described below.\n\n"
                    "Project Brief (AGENTS.md):\n"
                    f"{agents_text}\n"
                    "\nRequired output:\n"
                    "- A README.md in the project root with setup and run instructions.\n"
                    "- Summarize where the frontend/backend live and how to start them.\n"
                    f"{_blazor_constraints()}\n"
                )

    pm_input = _base_input_items() + _user_message(task_list)
    _agent_status("pm", "running", "Planning requirements")
    _agent_log("pm", "Starting requirements and task breakdown.")
    pm_result = await Runner.run(project_manager_agent, pm_input, max_turns=20, run_config=run_config)
    pm_files = _parse_files_from_output(pm_result.final_output)
    pm_tokens = _sum_tokens(pm_result)
    _agent_tokens("pm", pm_tokens)
    pm_written = _write_files(pm_files)
    _agent_status("pm", "idle", "Done")
    _agent_log("pm", "Requirements written.")
    _require_approval("Project Manager", pm_written)

    requirements = _read_text("REQUIREMENTS.md")
    agent_tasks = _read_text("AGENT_TASKS.md")
    test_plan = _read_text("TEST.md")

    designer_payload = (
        "REQUIREMENTS.md:\n"
        f"{requirements}\n\n"
        "AGENT_TASKS.md:\n"
        f"{agent_tasks}\n"
    )
    designer_input = _base_input_items() + _user_message(designer_payload)
    _agent_status("designer", "running", "Designing UI")
    _agent_log("designer", "Creating design spec.")
    designer_result = await Runner.run(designer_agent, designer_input, max_turns=20, run_config=run_config)
    designer_written = _write_files(_parse_files_from_output(designer_result.final_output))
    designer_tokens = _sum_tokens(designer_result)
    _agent_tokens("designer", designer_tokens)
    _agent_status("designer", "idle", "Done")
    _agent_log("designer", "Design spec written.")
    _require_approval("Designer", designer_written)

    design_spec = _read_text("design/design_spec.md")

    frontend_payload = (
        "REQUIREMENTS.md:\n"
        f"{requirements}\n\n"
        "AGENT_TASKS.md:\n"
        f"{agent_tasks}\n\n"
        "design/design_spec.md:\n"
        f"{design_spec}\n"
    )
    frontend_input = _base_input_items() + _user_message(frontend_payload)
    _agent_status("frontend", "running", "Building UI")
    _agent_log("frontend", "Implementing frontend.")
    frontend_result = await Runner.run(frontend_developer_agent, frontend_input, max_turns=20, run_config=run_config)
    frontend_written = _write_files(_parse_files_from_output(frontend_result.final_output))
    frontend_tokens = _sum_tokens(frontend_result)
    _agent_tokens("frontend", frontend_tokens)
    _agent_status("frontend", "idle", "Done")
    _agent_log("frontend", "Frontend written.")
    _require_approval("Frontend Developer", frontend_written)

    backend_payload = (
        "REQUIREMENTS.md:\n"
        f"{requirements}\n\n"
        "AGENT_TASKS.md:\n"
        f"{agent_tasks}\n"
    )
    backend_input = _base_input_items() + _user_message(backend_payload)
    _agent_status("backend", "running", "Building backend")
    _agent_log("backend", "Implementing backend.")
    backend_result = await Runner.run(backend_developer_agent, backend_input, max_turns=20, run_config=run_config)
    backend_written = _write_files(_parse_files_from_output(backend_result.final_output))
    backend_tokens = _sum_tokens(backend_result)
    _agent_tokens("backend", backend_tokens)
    _agent_status("backend", "idle", "Done")
    _agent_log("backend", "Backend written.")
    _require_approval("Backend Developer", backend_written)

    tester_payload = (
        "REQUIREMENTS.md:\n"
        f"{requirements}\n\n"
        "AGENT_TASKS.md:\n"
        f"{agent_tasks}\n\n"
        "TEST.md:\n"
        f"{test_plan}\n"
    )
    tester_input = _base_input_items() + _user_message(tester_payload)
    _agent_status("tester", "running", "Testing outputs")
    _agent_log("tester", "Creating test plan.")
    tester_result = await Runner.run(tester_agent, tester_input, max_turns=20, run_config=run_config)
    tester_written = _write_files(_parse_files_from_output(tester_result.final_output))
    tester_tokens = _sum_tokens(tester_result)
    _agent_tokens("tester", tester_tokens)
    _agent_status("tester", "idle", "Done")
    _agent_log("tester", "Test plan written.")
    _require_approval("Tester", tester_written)

    readme_path = os.path.join(os.getcwd(), "README.md")
    if not os.path.exists(readme_path):
        project_type = os.environ.get("PROJECT_TYPE", "web").strip().lower()
        readme_lines = [
            "# Project Output",
            "",
            "This project was generated by the multi-agent workflow.",
            "",
            "## Structure",
            "- `design/` - UI/UX notes and wireframes",
            "- `frontend/` - Frontend assets",
            "- `backend/` - Backend API server",
            "- `tests/` - Test plan and scripts",
        ]
        if project_type == "blazor":
            readme_lines += [
                "- `app/` - Blazor WebAssembly app (generated by `dotnet new blazorwasm`)",
            ]
        readme_lines += [
            "",
            "## Run (backend + frontend)",
            "```bash",
            "cd backend",
            "npm install",
            "npm start",
            "````",
            "",
            "Open `http://localhost:3000/`.",
        ]
        if project_type == "blazor":
            readme_lines += [
                "",
                "## Run (Blazor)",
                "```bash",
                "cd app",
                "dotnet run",
                "````",
            ]
        _write_text(readme_path, "\n".join(readme_lines) + "\n")


if __name__ == "__main__":
    asyncio.run(main())
