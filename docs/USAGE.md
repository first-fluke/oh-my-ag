# How to Use Antigravity Multi-Agent Skills

## Quick Start

1. **Open in Antigravity IDE**
   ```bash
   antigravity open /path/to/oh-my-ag
   ```

2. **Skills are automatically detected.** Antigravity scans `.agent/skills/` and indexes all available skills.

3. **Chat in the IDE.** Describe what you want to build.

---

## Usage Examples

### Example 1: Simple Single-Domain Task

**You type:**
```
"Create a login form component with email and password fields using Tailwind CSS"
```

**What happens:**
- Antigravity detects this matches `frontend-agent`
- The skill loads automatically (Progressive Disclosure)
- You get a React component with TypeScript, Tailwind, form validation

### Example 2: Complex Multi-Domain Project

**You type:**
```
"Build a TODO app with user authentication"
```

**What happens:**

1. **Workflow Guide activates** — detects multi-domain complexity
2. **PM Agent plans** — creates task breakdown with priorities
3. **You spawn agents via CLI**:
   ```bash
   oh-my-ag agent:spawn backend "JWT authentication API" session-01 &
   oh-my-ag agent:spawn frontend "Login and TODO UI" session-01 &
   wait
   ```
4. **Agents work in parallel** — save outputs to Knowledge Base
5. **You coordinate** — review `.gemini/antigravity/brain/` for consistency
6. **QA Agent reviews** — security/performance audit
7. **Fix & iterate** — re-spawn agents with corrections

### Example 3: Bug Fixing

**You type:**
```
"There's a bug — clicking login shows 'Cannot read property map of undefined'"
```

**What happens:**

1. **debug-agent activates** — analyzes error
2. **Root cause found** — component maps over `todos` before data loads
3. **Fix provided** — loading states and null checks added
4. **Regression test written** — ensures bug won't return
5. **Similar patterns found** — proactively fixes 3 other components

### Example 4: CLI-based Parallel Execution

```bash
# Single agent (workspace auto-detected)
oh-my-ag agent:spawn backend "Implement JWT auth API" session-01

# Parallel agents
oh-my-ag agent:spawn backend "Implement auth API" session-01 &
oh-my-ag agent:spawn frontend "Create login form" session-01 &
oh-my-ag agent:spawn mobile "Build auth screens" session-01 &
wait
```

**Monitor in real-time:**
```bash
# Terminal (separate terminal window)
bunx oh-my-ag dashboard

# Or browser
bunx oh-my-ag dashboard:web
# → http://localhost:9847
```

---

## Real-time Dashboards

### Terminal Dashboard

```bash
bunx oh-my-ag dashboard
```

Watches `.serena/memories/` using `fswatch` (macOS) or `inotifywait` (Linux). Displays a live table with session status, agent states, turns, and latest activity. Updates automatically when memory files change.

**Requirements:**
- macOS: `brew install fswatch`
- Linux: `apt install inotify-tools`

### Web Dashboard

```bash
npm install          # first time only
bunx oh-my-ag dashboard:web
```

Open `http://localhost:9847` in your browser. Features:

- **Real-time updates** via WebSocket (event-driven, not polling)
- **Auto-reconnect** if the connection drops
- **Serena-themed UI** with purple accent colors
- **Session status** — ID and running/completed/failed state
- **Agent table** — name, status (with colored dots), turn count, task description
- **Activity log** — latest changes from progress and result files

The server watches `.serena/memories/` using chokidar with debounce (100ms). Only changed files trigger reads — no full re-scan.

---

## Key Concepts

### Progressive Disclosure
Antigravity automatically matches requests to skills. You never manually select a skill. Only the needed skill loads into context.

### Token-Optimized Skill Design
Each skill uses a two-layer architecture for maximum token efficiency:
- **SKILL.md** (~40 lines): Identity, routing, core rules — loaded immediately
- **resources/**: Execution protocols, examples, checklists, error playbooks — loaded on-demand

Shared resources live in `_shared/` (not a skill) and are referenced by all agents:
- Chain-of-thought execution protocols with 4-step workflow
- Few-shot input/output examples for mid-tier model guidance
- Error recovery playbooks with "3 strikes" escalation
- Reasoning templates for structured multi-step analysis
- Context budget management for Flash/Pro model tiers
- Automated verification via `verify.sh`
- Cross-session lessons learned accumulation

### CLI Agent Spawning
Use `oh-my-ag agent:spawn` to run agents via CLI. Respects `agent_cli_mapping` in `user-preferences.yaml` to select the appropriate CLI (gemini, claude, codex, qwen) per agent type. Workspace is auto-detected from common monorepo conventions, or can be set explicitly with `-w`.

### Knowledge Base
Agent outputs stored at `.gemini/antigravity/brain/`. Contains plans, code, reports, and coordination notes.

### Serena Memory
Structured runtime state at `.serena/memories/`. The orchestrator writes session info, task boards, per-agent progress, and results. Dashboards watch these files for monitoring.

### Workspaces
Agents can work in separate directories to avoid conflicts. Workspace is auto-detected from common monorepo conventions:
```
./apps/api   or ./backend   → Backend Agent workspace
./apps/web   or ./frontend  → Frontend Agent workspace
./apps/mobile or ./mobile   → Mobile Agent workspace
```

---

## Available Skills

| Skill | Auto-activates for | Output |
|-------|-------------------|--------|
| workflow-guide | Complex multi-domain projects | Step-by-step agent coordination |
| pm-agent | "plan this", "break down" | `.agent/plan.json` |
| frontend-agent | UI, components, styling | React components, tests |
| backend-agent | APIs, databases, auth | API endpoints, models, tests |
| mobile-agent | Mobile apps, iOS/Android | Flutter screens, state management |
| qa-agent | "review security", "audit" | QA report with prioritized fixes |
| debug-agent | Bug reports, error messages | Fixed code, regression tests |
| orchestrator | CLI sub-agent execution | Results in `.agent/results/` |
| commit | "commit", "커밋해줘" | Git commits (auto-splits by feature) |

---

## Workflow Commands

Type these in Antigravity IDE chat to trigger step-by-step workflows:

| Command | Description |
|---------|-------------|
| `/coordinate` | Multi-agent orchestration via CLI with step-by-step guidance |
| `/orchestrate` | Automated CLI-based parallel agent execution |
| `/plan` | PM task decomposition with API contracts |
| `/review` | Full QA pipeline (security, performance, accessibility, code quality) |
| `/debug` | Structured bug fixing (reproduce → diagnose → fix → regression test) |

These are separate from **skills** (which auto-activate). Workflows give you explicit control over multi-step processes.

---

## Typical Workflows

### Workflow A: Single Skill

```
You: "Create a button component"
  → Antigravity loads frontend-agent
  → Get component immediately
```

### Workflow B: Multi-Agent Project (Auto)

```
You: "Build a TODO app with authentication"
  → workflow-guide activates automatically
  → PM Agent creates plan
  → You spawn agents via CLI (oh-my-ag agent:spawn)
  → Agents work in parallel
  → QA Agent reviews
  → Fix issues, iterate
```

### Workflow B-2: Multi-Agent Project (Explicit)

```
You: /coordinate
  → Step-by-step guided workflow
  → PM planning → plan review → agent spawning → monitoring → QA review
```

### Workflow C: Bug Fixing

```
You: "Login button throws TypeError"
  → debug-agent activates
  → Root cause analysis
  → Fix + regression test
  → Similar patterns checked
```

### Workflow D: CLI Orchestration with Dashboard

```
Terminal 1: bunx oh-my-ag dashboard:web
Terminal 2: oh-my-ag agent:spawn backend "task" session-01 &
            oh-my-ag agent:spawn frontend "task" session-01 &
Browser:    http://localhost:9847 → real-time status
```

---

## Tips

1. **Be specific** — "Build a TODO app with JWT auth, React frontend, FastAPI backend" is better than "make an app"
2. **Use CLI spawning** for multi-domain projects — don't try to do everything in one chat
3. **Review Knowledge Base** — check `.gemini/antigravity/brain/` for API consistency
4. **Iterate with re-spawns** — refine instructions, don't start over
5. **Use dashboards** — `bunx oh-my-ag dashboard` or `bunx oh-my-ag dashboard:web` to monitor orchestrator sessions
6. **Separate workspaces** — assign each agent its own directory

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Skills not loading | `antigravity open .`, check `.agent/skills/`, restart IDE |
| CLI not found | Check `which gemini` / `which claude`, install missing CLIs |
| Incompatible agent outputs | Review both in Knowledge Base, re-spawn with corrections |
| Dashboard: "No agents" | Memory files not created yet, run orchestrator first |
| Web dashboard won't start | Run `npm install` to install chokidar and ws |
| fswatch not found | macOS: `brew install fswatch`, Linux: `apt install inotify-tools` |
| QA report has 50+ issues | Focus on CRITICAL/HIGH first, document rest for later |

---

## CLI Commands

```bash
bunx oh-my-ag                # Interactive skill installer
bunx oh-my-ag doctor         # Check setup & repair missing skills
bunx oh-my-ag doctor --json  # JSON output for CI/CD
bunx oh-my-ag update         # Update skills to latest version
bunx oh-my-ag stats          # View productivity metrics
bunx oh-my-ag stats --reset  # Reset metrics
bunx oh-my-ag retro          # Session retrospective (learnings & next steps)
bunx oh-my-ag dashboard      # Terminal real-time dashboard
bunx oh-my-ag dashboard:web  # Web dashboard (http://localhost:9847)
bunx oh-my-ag help           # Show help
```

---

## For Developers (Integration Guide)

If you want to integrate these skills into your existing Antigravity project, see [AGENT_GUIDE.md](../AGENT_GUIDE.md) for:
- Quick 3-step integration
- Full dashboard integration
- Customizing skills for your tech stack
- Troubleshooting and best practices

---

**Just chat in Antigravity IDE.** For monitoring, use the dashboards. For CLI execution, use the orchestrator scripts. To integrate into your existing project, see [AGENT_GUIDE.md](../AGENT_GUIDE.md).
