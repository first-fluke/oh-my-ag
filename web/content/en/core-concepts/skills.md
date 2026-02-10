---
title: Skills
description: Progressive disclosure and token-optimized skill architecture.
---

# Skills

## Progressive Disclosure

Skills are selected from request intent. Manual skill selection is usually unnecessary.

## Two-Layer Design

Each skill uses a **token-optimized two-layer design**:

| Layer | Content | Size |
|-------|---------|------|
| `SKILL.md` | Identity, routing conditions, core rules | ~40 lines (~800B) |
| `resources/` | Execution protocols, examples, checklists, playbooks, snippets, tech stack | Loaded on-demand |

This achieves **~75% token savings** on initial skill loading (3-7KB → ~800B per skill).

## Shared Resource Layer (`_shared/`)

Common resources deduplicated across all skills:

| Resource | Purpose |
|----------|---------|
| `reasoning-templates.md` | Structured fill-in-the-blank templates for multi-step reasoning |
| `clarification-protocol.md` | When to ask vs. assume, ambiguity levels |
| `context-budget.md` | Token-efficient file reading strategies per model tier |
| `context-loading.md` | Task-type to resource mapping for orchestrator prompt construction |
| `skill-routing.md` | Keyword-to-skill mapping and parallel execution rules |
| `difficulty-guide.md` | Simple/Medium/Complex assessment with protocol branching |
| `lessons-learned.md` | Cross-session accumulated domain gotchas |
| `verify.sh` | Automated verification script run after agent completion |
| `api-contracts/` | PM creates contracts, backend implements, frontend/mobile consumes |
| `serena-memory-protocol.md` | CLI mode memory read/write protocol |
| `common-checklist.md` | Universal code quality checks |

## Per-Skill Resources

Each skill provides domain-specific resources:

| Resource | Purpose |
|----------|---------|
| `execution-protocol.md` | 4-step chain-of-thought workflow (Analyze → Plan → Implement → Verify) |
| `examples.md` | 2-3 few-shot input/output examples |
| `checklist.md` | Domain-specific self-verification checklist |
| `error-playbook.md` | Failure recovery with "3 strikes" escalation rule |
| `tech-stack.md` | Detailed technology specifications |
| `snippets.md` | Copy-paste ready code patterns |

## Why It Matters

This keeps initial context lean while still supporting deep execution when required.
