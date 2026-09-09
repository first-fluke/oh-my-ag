# Execution Protocol (Codex)

Follow [Execution Policy](../../core/execution-policy.md) and [Agent Result Contract](../result-contract.md). `oma agent spawn` and `oma agent parallel` inject both; native/custom-agent dispatch must read both before starting work. For coordination notes, read [Memory Protocol](../memory-protocol.md).

## User questions

Follow [Clarification Protocol](../../core/clarification-protocol.md). Use an available asynchronous question tool when permitted; do not call Plan-only tools in other modes. A subagent reports missing information to its coordinator, who asks the user if needed.
