# Operations (How we build without chaos)

## Task lifecycle
1) PM creates task file in /tasks using template
2) Owner agent implements code + docs
3) QA agent adds verification steps/tests
4) Reviewer agent checks acceptance criteria
5) Merge + add CHANGELOG entry

## Definition of Done
- Code merged
- Docs updated
- Seed data updated (if schema or catalog changed)
- Runbook verification steps updated
- At least one test or manual check documented

## Codex CLI (WSL setup + quick test)
Prereqs: Node.js + npm in WSL.

Install:
```bash
npm i -g @openai/codex
```

Run + authenticate:
```bash
codex
```

Quick checks:
```bash
codex --version
```

Upgrade:
```bash
npm i -g @openai/codex@latest
```

Notes:
- Codex CLI officially supports macOS and Linux; Windows support is experimental, so use WSL for Windows.

## Skills (what they are + where they live)
- A skill is a folder with a `SKILL.md` plus optional `scripts/`, `references/`, and `assets/`.
- Codex scans skill locations in precedence order (higher overrides lower):
  - `$CWD/.codex/skills`
  - `$CWD/../.codex/skills`
  - `$REPO_ROOT/.codex/skills`
  - `$CODEX_HOME/skills` (default: `~/.codex/skills`)
  - `/etc/codex/skills`
  - Bundled system skills
- Built-in skills like `$skill-creator` and `$skill-installer` come with Codex.

Install skills:
- Use `$skill-installer` inside Codex to pull curated skills.

Create skills:
- Use `$skill-creator` inside Codex to scaffold a new skill.

## Database connectivity (agent-safe)
- Agents can use the `db_query` tool (read-only) if DB env vars are set.
- Configure these in the project root `.env` (never commit passwords):
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME`, `DB_PASSWORD`
- A `.env.example` template is generated in each project folder.
