# Execution Protocol (Grok)

Follow [Execution Policy](../../core/execution-policy.md) and [Agent Result Contract](../result-contract.md). `oma agent spawn` and `oma agent parallel` inject both; native/custom-agent dispatch must read both before starting work. For coordination notes, read [Memory Protocol](../memory-protocol.md).

## Native tools

Use the available file tools and `run_terminal_cmd` for shell operations. Use `task` for subagents only when the active task authorizes delegation. Follow the project instructions loaded in the agent definition.
