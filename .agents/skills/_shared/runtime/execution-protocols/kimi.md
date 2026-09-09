# Execution Protocol (Kimi Code CLI)

Follow [Execution Policy](../../core/execution-policy.md) and [Agent Result Contract](../result-contract.md). `oma agent spawn` and `oma agent parallel` inject both; native/custom-agent dispatch must read both before starting work. For coordination notes, read [Memory Protocol](../memory-protocol.md).

## Headless dispatch

Use the injected claim for writable `kimi` runs and the exact stdout JSON contract for read-only runs. A conversational stdout summary is not a completion record.
