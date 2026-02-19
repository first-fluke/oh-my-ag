# Dynamic Context Loading Guide

Agents should not read all resources at once. Instead, load only necessary resources based on task type.
This saves context window and prevents confusion from irrelevant information.

---

## Loading Order (Common to All Agents)

### Always Load (Required)
1. `SKILL.md` — Auto-loaded (provided by Antigravity)
2. `resources/execution-protocol.md` — Execution protocol

### Load at Task Start
3. `../_shared/difficulty-guide.md` — Difficulty assessment (Step 0)

### Load Based on Difficulty
4. **Simple**: Proceed to implementation without additional loading
5. **Medium**: `resources/examples.md` (reference similar examples)
6. **Complex**: `resources/examples.md` + `resources/tech-stack.md` + `resources/snippets.md`

### Load During Execution as Needed
7. `resources/checklist.md` — Load at Step 4 (Verify)
8. `resources/error-playbook.md` — Load only when errors occur
9. `../_shared/common-checklist.md` — For final verification of Complex tasks
10. `../_shared/memory-protocol.md` — CLI mode only

---

## Task Type → Resource Mapping by Agent

### Backend Agent

| Task Type                     | Required Resources                          |
| ----------------------------- | ------------------------------------------- |
| CRUD API creation             | snippets.md (route, schema, model, test)    |
| Authentication implementation | snippets.md (JWT, password) + tech-stack.md |
| DB migration                  | snippets.md (migration)                     |
| Performance optimization      | examples.md (N+1 example)                   |
| Existing code modification    | examples.md + Serena MCP                    |

### Frontend Agent

| Task Type           | Required Resources                                     |
| ------------------- | ------------------------------------------------------ |
| Component creation  | snippets.md (component, test) + component-template.tsx |
| Form implementation | snippets.md (form + Zod)                               |
| API integration     | snippets.md (TanStack Query)                           |
| Styling             | tailwind-rules.md                                      |
| Page layout         | snippets.md (grid) + examples.md                       |

### Mobile Agent

| Task Type        | Required Resources                                    |
| ---------------- | ----------------------------------------------------- |
| Screen creation  | snippets.md (screen, provider) + screen-template.dart |
| API integration  | snippets.md (repository, Dio)                         |
| Navigation       | snippets.md (GoRouter)                                |
| Offline features | examples.md (offline example)                         |
| State management | snippets.md (Riverpod)                                |

### Debug Agent

| Task Type       | Required Resources                                                |
| --------------- | ----------------------------------------------------------------- |
| Frontend bug    | common-patterns.md (Frontend section)                             |
| Backend bug     | common-patterns.md (Backend section)                              |
| Mobile bug      | common-patterns.md (Mobile section)                               |
| Performance bug | common-patterns.md (Performance section) + debugging-checklist.md |
| Security bug    | common-patterns.md (Security section)                             |

### QA Agent

| Task Type            | Required Resources                   |
| -------------------- | ------------------------------------ |
| Security review      | checklist.md (Security section)      |
| Performance review   | checklist.md (Performance section)   |
| Accessibility review | checklist.md (Accessibility section) |
| Full audit           | checklist.md (full) + self-check.md  |

### Developer Workflow Expert

| Task Type                   | Required Resources                                            |
| --------------------------- | ------------------------------------------------------------- |
| API Workflow Setup          | resources/api-workflows.md + resources/validation-pipeline.md |
| Database Migration Workflow | resources/database-patterns.md                                |
| Release Coordination        | resources/release-coordination.md                             |
| Troubleshooting             | resources/troubleshooting.md                                  |

### Terraform Infra Engineer

| Task Type                   | Required Resources                                                       |
| --------------------------- | ------------------------------------------------------------------------ |
| Infrastructure Provisioning | resources/multi-cloud-examples.md + resources/policy-testing-examples.md |
| Cost Analysis               | resources/cost-optimization.md                                           |

### PM Agent

| Task Type                 | Required Resources                                           |
| ------------------------- | ------------------------------------------------------------ |
| New project planning      | examples.md + task-template.json + api-contracts/template.md |
| Feature addition planning | examples.md + Serena MCP (understand existing structure)     |
| Refactoring planning      | Serena MCP only                                              |

---

## Orchestrator Only: Composing Subagent Prompts

When the Orchestrator composes subagent prompts, reference the mapping above
to include only resource paths matching the task type in the prompt.

```
Prompt composition:
1. Agent SKILL.md's Core Rules section
2. execution-protocol.md
3. Resources matching task type (see tables above)
4. error-playbook.md (always include — recovery is essential)
5. Serena Memory Protocol (CLI mode)
```

This approach avoids loading unnecessary resources, maximizing subagent context efficiency.
