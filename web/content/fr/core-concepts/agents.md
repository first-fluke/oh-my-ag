---
title: Agents
description: Types d'agents, stratégie d'espace de travail et flux d'orchestration.
---

# Agents

## Catégories d'agents

- Planification : agent PM
- Implémentation : Frontend, Backend, Mobile
- Assurance qualité : QA, Debug
- Coordination : workflow-guide, orchestrator

## Stratégie d'espace de travail

Des espaces de travail séparés réduisent les conflits de fusion :

```text
./apps/api      -> backend
./apps/web      -> frontend
./apps/mobile   -> mobile
```

## Flux du gestionnaire d'agents

1. Le PM définit la décomposition
2. Les agents de domaine s'exécutent en parallèle
3. La progression est transmise dans les mémoires Serena
4. Le QA valide la cohérence au niveau du système

## Fichiers d'exécution Serena

- `orchestrator-session.md`
- `task-board.md`
- `progress-{agent}.md`
- `result-{agent}.md`
