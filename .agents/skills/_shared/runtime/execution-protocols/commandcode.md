# Execution Protocol (Command Code)

When running as a CLI subagent, follow this protocol for shared state coordination.

## State Management

Use native file tools for coordination notes under `.agents/state/memories/` at the project root. Human-facing reports may live under `.agents/results/`. Completion follows [the shared result contract](../result-contract.md); neither location alone proves completion.

### Path Resolution (CRITICAL)

Use flat `progress-{agentId}-{taskId}-{runId}-{sessionId}.md` and
`result-{agentId}-{taskId}-{runId}-{sessionId}.md` reports per
`memory-protocol.md`. Use the injected claim path unchanged for the structured
result. The project-root memory base remains the only base.

## Lifecycle and results

Follow [Execution Policy](../../core/execution-policy.md) and [Agent Result Contract](../result-contract.md). The task-specific injected run ID and result path are authoritative for this dispatch. Keep coordination notes in the project-root memory store; the structured receipt determines completion.

Read an existing task board when assigned one. Report progress for long tasks. Include unresolved work even on failure. For read-only dispatch, return the injected stdout JSON contract instead of writing files.
