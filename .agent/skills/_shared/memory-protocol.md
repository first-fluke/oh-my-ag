# Memory Protocol (CLI Mode)

When running as a CLI subagent via `gemini -p "..." --approval-mode=yolo`, follow this protocol.

## Tool Reference

Tool names are configurable via `mcp.json → memoryConfig.tools`:
- `[READ]` → default: `read_memory`
- `[WRITE]` → default: `write_memory`
- `[EDIT]` → default: `edit_memory`
- `[LIST]` → default: `list_memories`
- `[DELETE]` → default: `delete_memory`

Memory base path is configurable via `memoryConfig.basePath` (default: `.serena/memories`).

---

## On Start

1. `[READ]("task-board.md")` to confirm your assigned task
2. `[WRITE]("progress-{agent-id}.md", initial progress entry)` with Turn 1 status

## During Execution

- Every 3-5 turns: `[EDIT]("progress-{agent-id}.md")` to append a new turn entry
- Include: action taken, current status, files created/modified

## On Completion

- `[WRITE]("result-{agent-id}.md")` with final result including:
  - Status: `completed` or `failed`
  - Summary of work done
  - Files created/modified
  - Acceptance criteria checklist

## On Failure

- Still create `result-{agent-id}.md` with Status: `failed`
- Include detailed error description and what remains incomplete

---

## Example with Default Tools (Serena)

```python
# On Start
read_memory("task-board.md")
write_memory("progress-backend.md", initial_content)

# During Execution
edit_memory("progress-backend.md", turn_update)

# On Completion
write_memory("result-backend.md", final_result)
```

## Example with Custom Tools

If `memoryConfig.tools` is configured differently:

```json
{
  "memoryConfig": {
    "tools": {
      "read": "fs_read",
      "write": "fs_write",
      "edit": "fs_patch"
    }
  }
}
```

Then use:
```python
fs_read("task-board.md")
fs_write("progress-backend.md", initial_content)
fs_patch("progress-backend.md", turn_update)
fs_write("result-backend.md", final_result)
```
