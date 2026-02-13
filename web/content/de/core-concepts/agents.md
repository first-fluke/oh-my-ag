---
title: Agenten
description: Agententypen, Workspace-Strategie und Orchestrierungsablauf.
---

# Agenten

## Agentenkategorien

- Planung: PM-Agent
- Implementierung: Frontend, Backend, Mobile
- Qualitätssicherung: QA, Debug
- Koordination: workflow-guide, orchestrator

## Workspace-Strategie

Separate Workspaces reduzieren Merge-Konflikte:

```text
./apps/api      -> backend
./apps/web      -> frontend
./apps/mobile   -> mobile
```

## Agent-Manager-Ablauf

1. PM definiert die Aufgabenzerlegung
2. Domänen-Agenten arbeiten parallel
3. Fortschritt wird in Serena-Speicher gestreamt
4. QA validiert die systemweite Konsistenz

## Serena-Laufzeitdateien

- `orchestrator-session.md`
- `task-board.md`
- `progress-{agent}.md`
- `result-{agent}.md`
