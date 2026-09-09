# Execution Protocol (Antigravity)

When running as a CLI subagent (`agy -p` headless mode), follow this protocol for shared
state coordination. **In headless mode your stdout is discarded by the spawner** — the only
durable hand-off to the orchestrator is the result artifact written below. If you do not
write it, the orchestrator reports your run as `crashed` even on success.

## Memory Tools

Coordination artifacts are read and written as plain files with your native file tools.
Tool names remain configurable via `mcp_config.json → memoryConfig.tools`:
- `[READ]` → default: `Read`
- `[WRITE]` → default: `Write`
- `[EDIT]` → default: `Edit`
- `[LIST]` → default: directory listing (e.g. `ls`)
- `[DELETE]` → default: file delete (e.g. `rm`)

Memory base path is configurable via `memoryConfig.basePath` (default: `.agents/state/memories`). Create the directory if it does not yet exist.

### Path Resolution (CRITICAL)

Use flat `progress-{agentId}-{taskId}-{runId}-{sessionId}.md` and
`result-{agentId}-{taskId}-{runId}-{sessionId}.md` reports per
`memory-protocol.md`. Use the injected claim path unchanged for the structured
result. The project-root memory base remains the only base.

## Lifecycle and results

Follow [Execution Policy](../../core/execution-policy.md) and [Agent Result Contract](../result-contract.md). The task-specific injected run ID and result path are authoritative for this dispatch. Keep coordination notes in the project-root memory store; the structured receipt determines completion.

Read an existing task board when assigned one. Report progress for long tasks. Include unresolved work even on failure. For read-only dispatch, return the injected stdout JSON contract instead of writing files.
