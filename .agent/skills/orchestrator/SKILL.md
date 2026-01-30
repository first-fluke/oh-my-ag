---
name: orchestrator
description: Automated multi-agent orchestrator that spawns CLI subagents in parallel, coordinates via MCP Memory, and monitors progress
---

# Orchestrator - Automated Multi-Agent Coordinator

## When to use
- Complex feature requires multiple specialized agents working in parallel
- User wants automated execution without manually spawning agents
- Full-stack implementation spanning backend, frontend, mobile, and QA
- User says "자동으로 실행해줘", "병렬로 돌려줘", or similar automation requests

## When NOT to use
- Simple single-domain task -> use the specific agent directly
- User wants manual control via Agent Manager UI -> use workflow-guide
- Quick bug fixes or minor changes

## Important
This skill orchestrates CLI subagents via `gemini -p "..." --approval-mode=yolo`. It uses MCP Memory tools as a shared state bus. Each subagent runs as an independent process.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| MAX_PARALLEL | 3 | Max concurrent subagents |
| MAX_RETRIES | 2 | Retry attempts per failed task |
| POLL_INTERVAL | 30s | Status check interval |
| MAX_TURNS (impl) | 20 | Turn limit for backend/frontend/mobile |
| MAX_TURNS (review) | 15 | Turn limit for qa/debug |
| MAX_TURNS (plan) | 10 | Turn limit for pm |

## Memory Configuration

Memory provider and tool names are configurable via `mcp.json`:
```json
{
  "memoryConfig": {
    "provider": "serena",
    "basePath": ".serena/memories",
    "tools": {
      "read": "read_memory",
      "write": "write_memory",
      "edit": "edit_memory"
    }
  }
}
```

## Workflow Phases

**PHASE 1 - Plan**: Analyze request -> decompose tasks -> generate session ID
**PHASE 2 - Setup**: Use memory write tool to create `orchestrator-session.md` + `task-board.md`
**PHASE 3 - Execute**: Spawn agents by priority tier (never exceed MAX_PARALLEL)
**PHASE 4 - Monitor**: Poll every POLL_INTERVAL; handle completed/failed/crashed agents
**PHASE 4.5 - Verify**: Run `../_shared/verify.sh {agent-type} {workspace}` per completed agent
**PHASE 5 - Collect**: Read all `result-{agent}.md`, compile summary, cleanup progress files

See `resources/subagent-prompt-template.md` for prompt construction.
See `resources/memory-schema.md` for memory file formats.

## Memory File Ownership

| File | Owner | Others |
|------|-------|--------|
| `orchestrator-session.md` | orchestrator | read-only |
| `task-board.md` | orchestrator | read-only |
| `progress-{agent}.md` | that agent | orchestrator reads |
| `result-{agent}.md` | that agent | orchestrator reads |

## Verification Gate (PHASE 4.5)
After each agent completes, run automated verification before accepting the result:
```bash
bash .agent/skills/_shared/verify.sh {agent-type} {workspace}
```
- **PASS (exit 0)**: Accept result, advance to next task
- **FAIL (exit 1)**: Treat as failure → enter Retry Logic with verify output as error context
- This is mandatory. Never skip verification even if the agent reports success.

## Retry Logic
- 1st retry: Wait 30s, re-spawn with error context (include verify.sh output)
- 2nd retry: Wait 60s, add "Try a different approach"
- Final failure: Report to user, ask whether to continue or abort

## References
- Prompt template: `resources/subagent-prompt-template.md`
- Memory schema: `resources/memory-schema.md`
- Config: `config/cli-config.yaml`
- Scripts: `scripts/spawn-agent.sh`, `scripts/parallel-run.sh`
- Task templates: `templates/`
- Skill routing: `../_shared/skill-routing.md`
- Verification: `../_shared/verify.sh`
- API contracts: `../_shared/api-contracts/`
- Context loading: `../_shared/context-loading.md`
- Difficulty guide: `../_shared/difficulty-guide.md`
- Reasoning templates: `../_shared/reasoning-templates.md`
- Clarification protocol: `../_shared/clarification-protocol.md`
- Context budget: `../_shared/context-budget.md`
- Lessons learned: `../_shared/lessons-learned.md`
