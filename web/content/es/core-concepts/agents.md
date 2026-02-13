---
title: Agentes
description: Tipos de agentes, estrategia de espacios de trabajo y flujo de orquestacion.
---

# Agentes

## Categorias de agentes

- Planificacion: agente PM
- Implementacion: Frontend, Backend, Mobile
- Aseguramiento: QA, Debug
- Coordinacion: workflow-guide, orchestrator

## Estrategia de espacios de trabajo

Los espacios de trabajo separados reducen los conflictos de merge:

```text
./apps/api      -> backend
./apps/web      -> frontend
./apps/mobile   -> mobile
```

## Flujo del gestor de agentes

1. El PM define la descomposicion
2. Los agentes de dominio ejecutan en paralelo
3. El progreso se transmite a las memorias de Serena
4. QA valida la consistencia a nivel de sistema

## Archivos de tiempo de ejecucion de Serena

- `orchestrator-session.md`
- `task-board.md`
- `progress-{agent}.md`
- `result-{agent}.md`
