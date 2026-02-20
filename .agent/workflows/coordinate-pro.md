---
description: Thorough version of coordinate - high-quality development workflow with 11 review steps out of 17
---

# MANDATORY RULES — VIOLATION IS FORBIDDEN

- **Response language follows `language` setting in `.agent/config/user-preferences.yaml` if configured.**
- **NEVER skip steps.** Execute from Step 0 in order. Explicitly report completion of each step to the user before proceeding to the next.
- **You MUST use MCP tools throughout the entire workflow.** This is NOT optional.
  - Use code analysis tools (`get_symbols_overview`, `find_symbol`, `find_referencing_symbols`, `search_for_pattern`) for code exploration.
  - Use memory tools (read/write/edit) for progress tracking.
  - Memory path: configurable via `memoryConfig.basePath` (default: `.serena/memories`)
  - Tool names: configurable via `memoryConfig.tools` in `mcp.json`
  - Do NOT use raw file reads or grep as substitutes. MCP tools are the primary interface for code and memory operations.
- **Read the workflow-guide BEFORE starting.** Read `.agent/skills/workflow-guide/SKILL.md` and follow its Core Rules.
- **Follow the context-loading guide.** Read `.agent/skills/_shared/context-loading.md` and load only task-relevant resources.

---

## Phase 0: Initialization (DO NOT SKIP)

1. Read `.agent/skills/workflow-guide/SKILL.md` and confirm Core Rules.
2. Read `.agent/skills/_shared/context-loading.md` for resource loading strategy.
3. Read `.agent/skills/_shared/memory-protocol.md` for memory protocol.
4. Read `.agent/skills/_shared/multi-review-protocol.md` (11 review guides)
5. Read `.agent/skills/_shared/quality-principles.md` (4 principles)
6. Read `.agent/skills/_shared/phase-gates.md` (gate definitions)
7. Record session start using memory write tool:
   - Create `session-coordinate-pro.md` in the memory base path
   - Include: session start time, user request summary, workflow version (pro)

---

## Phase 1: PLAN (Steps 1-4)

### Step 1: Create Plan & Review
// turbo
Spawn PM Agent to execute Steps 1-4 (Creation + 3 Reviews).
Command: `oh-my-ag agent:spawn pm-agent "Analyze requirements. Execute Step 1: Create Plan. Then execute Step 2 (Completeness), Step 3 (Meta Review), and Step 4 (Over-Engineering Review). Save plan to .agent/plan.json and memory. IMPORTANT: Follow .agent/skills/_shared/context-loading.md rules." session-id`

### Step 2: Plan Review (Completeness)
- **Delegated to PM Agent**: Ensure requirements are fully mapped.

### Step 3: Review Verification (Meta Review)
- **Delegated to PM Agent**: Self-verify if the review was sufficient.

### Step 4: Over-Engineering Review (Simplicity)
- **Delegated to PM Agent**: Check for unnecessary complexity (MVP focus).

### PLAN_GATE
- [ ] Plan documented
- [ ] Assumptions listed
- [ ] Alternatives considered
- [ ] Over-engineering review done
- [ ] **User confirmation**

**On gate pass**: Use memory edit tool to record phase completion in `session-coordinate-pro.md`

**Gate failure → Return to Step 1**

---

## Phase 2: IMPL (Step 5)

### Step 5: Implementation
// turbo
Spawn Implementation Agents (Backend/Frontend/Mobile) in parallel.
Command:
```bash
oh-my-ag agent:spawn backend "Implement backend tasks per plan. IMPORTANT: Follow .agent/skills/_shared/context-loading.md rules." session-id -w ./backend &
oh-my-ag agent:spawn frontend "Implement frontend tasks per plan. IMPORTANT: Follow .agent/skills/_shared/context-loading.md rules." session-id -w ./frontend &
wait
```

### Monitor Implementation Progress
- Use memory read tool to poll `progress-{agent}.md` files
- Use MCP code analysis tools to verify implementation alignment
- Use memory edit tool to record monitoring results in `session-coordinate-pro.md`

### IMPL_GATE
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Only planned files modified

**On gate pass**: Use memory edit tool to record phase completion in `session-coordinate-pro.md`

**Gate failure → Re-run Step 5**

---

## Phase 3: VERIFY (Steps 6-8)

### Step 6-8: QA Verification
// turbo
Spawn QA Agent to execute Steps 6-8.
Command: `oh-my-ag agent:spawn qa-agent "Execute Phase 3 Verification. Step 6: Alignment Review. Step 7: Security/Bug Review (npm audit, OWASP). Step 8: Improvement/Regression Review. IMPORTANT: Follow .agent/skills/_shared/context-loading.md rules." session-id`

### Step 6: Alignment Review
- **Delegated to QA Agent**: Compare implementation vs plan.

### Step 7: Security/Bug Review (Safety)
- **Delegated to QA Agent**: Check for vulnerabilities (Safety).

### Step 8: Improvement Review (Regression Prevention)
- **Delegated to QA Agent**: Run regression tests.

### VERIFY_GATE
- [ ] Implementation = Requirements
- [ ] CRITICAL count: 0
- [ ] HIGH count: 0
- [ ] No regressions

**On gate pass**: Use memory edit tool to record phase completion in `session-coordinate-pro.md`

**Gate failure → Return to Step 5 (fix implementation)**

---

## Phase 4: REFINE (Steps 9-13)

### Step 9-13: Deep Refinement
// turbo
Spawn Debug Agent (or Senior Dev Agent) to execute Steps 9-13.
Command: `oh-my-ag agent:spawn debug-agent "Execute Phase 4 Refine. Step 9: Split large files. Step 10: Integration check. Step 11: Side Effect analysis (find_referencing_symbols). Step 12: Consistency review. Step 13: Cleanup dead code. IMPORTANT: Follow .agent/skills/_shared/context-loading.md rules." session-id`

### Step 9: Split Large Files/Functions
- **Delegated to Debug Agent**: Files > 500 lines, Functions > 50 lines.

### Step 10: Integration/Reuse Review (Reusability)
- **Delegated to Debug Agent**: Check for duplicate logic.

### Step 11: Side Effect Review (Cascade Impact)
- **Delegated to Debug Agent**: Analyze impact scope.

### Step 12: Full Change Review (Consistency)
- **Delegated to Debug Agent**: Review naming and style.

### Step 13: Clean Up Unused Code
- **Delegated to Debug Agent**: Remove newly created dead code.

### REFINE_GATE
- [ ] No large files/functions
- [ ] Integration opportunities captured
- [ ] Side effects verified
- [ ] Code cleaned

**On gate pass**: Use memory edit tool to record phase completion in `session-coordinate-pro.md`

**Skip conditions**: Simple tasks < 50 lines

---

## Phase 5: SHIP (Steps 14-17)

### Step 14-17: Final QA & Deployment Readiness
// turbo
Spawn QA Agent to execute Steps 14-17.
Command: `oh-my-ag agent:spawn qa-agent "Execute Phase 5 Ship. Step 14: Quality Review (lint/coverage). Step 15: UX Flow Verification. Step 16: Related Issues Review. Step 17: Deployment Readiness. IMPORTANT: Follow .agent/skills/_shared/context-loading.md rules." session-id`

### Step 14: Code Quality Review
- **Delegated to QA Agent**: Lint, Types, Coverage.

### Step 15: UX Flow Verification
- **Delegated to QA Agent**: User journey check.

### Step 16: Related Issues Review (Cascade Impact 2nd)
- **Delegated to QA Agent**: Final impact check.

### Step 17: Deployment Readiness Review (Final)
- **Delegated to QA Agent**: Secrets, Migrations, checklist.

### SHIP_GATE
- [ ] Quality checks pass
- [ ] UX verified
- [ ] Related issues resolved
- [ ] Deployment checklist complete
- [ ] **User final approval**

**On gate pass**: Use memory write tool to record final results in `session-coordinate-pro.md`

---

## Review Steps Summary (Delegated)

| Phase  | Steps | Agent       | Perspective                       |
| ------ | ----- | ----------- | --------------------------------- |
| PLAN   | 1-4   | PM Agent    | Completeness, Meta, Simplicity    |
| IMPL   | 5     | Dev Agents  | Implementation                    |
| VERIFY | 6-8   | QA Agent    | Alignment, Safety, Regression     |
| REFINE | 9-13  | Debug Agent | Reusability, Cascade, Consistency |
| SHIP   | 14-17 | QA Agent    | Quality, UX, Cascade 2nd, Deploy  |

**Total 11 review steps → High quality guaranteed (via Agent Delegation)**
