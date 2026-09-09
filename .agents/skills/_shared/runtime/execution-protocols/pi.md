# Execution Protocol (pi)

Follow [Execution Policy](../../core/execution-policy.md) and [Agent Result Contract](../result-contract.md). `oma agent spawn` and `oma agent parallel` inject both; native/custom-agent dispatch must read both before starting work. For coordination notes, read [Memory Protocol](../memory-protocol.md).

## Native tools

Use pi’s `read`, `write`, and `edit` tools for file operations in headless print mode (`pi -p`).
