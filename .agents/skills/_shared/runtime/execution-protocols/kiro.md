# Execution Protocol (Kiro CLI)

Follow [Execution Policy](../../core/execution-policy.md) and [Agent Result Contract](../result-contract.md). `oma agent spawn` and `oma agent parallel` inject both; native/custom-agent dispatch must read both before starting work. For coordination notes, read [Memory Protocol](../memory-protocol.md).

## Headless dispatch

For `kiro-cli chat --no-interactive`, use the injected claim for writable runs and the exact stdout JSON contract for read-only runs. Do not rely on a conversational stdout summary as completion evidence.
