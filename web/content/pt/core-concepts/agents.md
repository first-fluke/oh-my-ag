---
title: Agentes
description: Tipos de agentes, estratégia de workspace e fluxo de orquestração.
---

# Agentes

## Categorias de Agentes

- Planejamento: agente PM
- Implementação: Frontend, Backend, Mobile
- Garantia: QA, Debug
- Coordenação: workflow-guide, orchestrator

## Estratégia de Workspace

Workspaces separados reduzem conflitos de merge:

```text
./apps/api      -> backend
./apps/web      -> frontend
./apps/mobile   -> mobile
```

## Fluxo do Gerenciador de Agentes

1. O PM define a decomposição
2. Agentes de domínio executam em paralelo
3. O progresso é transmitido para as memórias do Serena
4. O QA valida a consistência no nível do sistema

## Arquivos de Runtime do Serena

- `orchestrator-session.md`
- `task-board.md`
- `progress-{agent}.md`
- `result-{agent}.md`
