---
description: Create comprehensive, hierarchical AGENTS.md documentation across the codebase
---

# MANDATORY RULES — VIOLATION IS FORBIDDEN

- **Response language follows `language` setting in `.agent/config/user-preferences.yaml` if configured.**
- **NEVER skip steps.** Execute from Step 0 in order. Explicitly report completion of each step before proceeding.
- **You MUST use MCP tools throughout the entire workflow.** This is NOT optional.
  - Use code analysis tools (`get_symbols_overview`, `find_symbol`, `search_for_pattern`, `list_dir`, `view_file`) for code exploration.
  - Use file writing tools to generate `AGENTS.md` files.
- **Exclude directories:** Respect the project's `.gitignore` as the source of truth for excluding directories (e.g., `node_modules`, `dist`, `build`, etc.). Do not generate `AGENTS.md` for ignored paths.

---

## Step 0: Preparation

1. Read `.agent/skills/workflow-guide/SKILL.md` and confirm Core Rules.

---

## Step 1: Map Directory Structure

**Identify all valid directories recursively.**

- **Target Level 0:** `/` (root)
- **Target Levels:** Drill down iteratively (e.g., Level 1: `/src`, `/docs`, `/tests`, `/apps`, `/packages`; Level 2: nested structure).
- **Empty Directory Handling:**
  - If no files and no subdirectories: **Skip**.
  - If only config files or generated files: minimal `AGENTS.md`.

---

## Step 2: Create Work Plan

Determine generation order.
**IMPORTANT:** Generation MUST happen top-down (parent first) to ensure parent tags are correct.

Plan the work across directory levels. Report the depth plan to the user.

---

## Step 3: Content Generation Level by Level

For each directory in the plan:

1. **Read all directory content** using `list_dir` and analyze the purpose using `get_symbols_overview` or reading key files.
2. **Determine Parent Reference:**
   - Root has no parent tag.
   - Any child has: `<!-- Parent: {relative_path_to_parent}/AGENTS.md -->`.
3. **Template Format to Use:**

```markdown
<!-- Parent: ../AGENTS.md --> <!-- Adjust this relative path appropriately. Omit entirely for root directory. -->
<!-- Generated: {timestamp} | Updated: {timestamp} -->

# {Directory Name}

## Purpose
{One-paragraph description of what this directory contains and its role}

## Key Files
| File | Description |
|------|-------------|
| `file.ts` | Detailed one-line purpose |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `subdir/` | What it contains (see `subdir/AGENTS.md`) |

## For AI Agents
### Working In This Directory
{Special instructions for AI agents modifying files here}

### Dependencies
{Internal or external parts of the codebase this depends on}

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
```

1. **Parallel Generation:**
   - If directories are large or complex, use `oh-my-ag agent:spawn {agent_id} "Write AGENTS.md based on this directory" session_id -w {path}` to distribute the context load across suitable domain agents.
   - For simple directories, you can write them directly.

---

## Step 4: Compare and Update Existing (If Applicable)

If an `AGENTS.md` file already exists:

1. Parse the existing file.
2. Compare structural changes (new files, removed subdirectories).
3. **CRITICAL:** Preserve the manual annotation block intact. Everything after `<!-- MANUAL:` must be copied exactly.
4. Merge contents and update the generated timestamp.

---

## Step 5: Validate Hierarchy

Use tools to perform a sweeping check on all generated `AGENTS.md` files:

1. Ensure all `<!-- Parent: -->` references resolve to an existing `AGENTS.md` file.
2. Verify all listed `Key Files` exist in the directory.
3. Remove orphaned `AGENTS.md` files where directories no longer exist or parent links are broken.
