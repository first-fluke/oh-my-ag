---
title: Agents
description: Agenttypen, werkruimtestrategie en orkestratiestroom.
---

# Agents

## Agentcategorieën

- Planning: PM-agent
- Implementatie: Frontend, Backend, Mobile
- Kwaliteitsborging: QA, Debug
- Coördinatie: workflow-guide, orchestrator

## Werkruimtestrategie

Gescheiden werkruimten verminderen mergeconflicten:

```text
./apps/api      -> backend
./apps/web      -> frontend
./apps/mobile   -> mobile
```

## Agent Manager-stroom

1. PM definieert de taakopsplitsing
2. Domeinagents voeren parallel uit
3. Voortgang stroomt naar Serena-geheugens
4. QA valideert systeembrede consistentie

## Serena-runtimebestanden

- `orchestrator-session.md`
- `task-board.md`
- `progress-{agent}.md`
- `result-{agent}.md`
