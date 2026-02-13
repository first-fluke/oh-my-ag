---
title: Workflows
description: Workflows explícitos por comandos de barra e quando utilizá-los.
---

# Workflows

## Comandos de Workflow

- `/coordinate`
- `/orchestrate`
- `/plan`
- `/review`
- `/debug`

## Skills vs Workflows

- Skills: ativadas automaticamente a partir da intenção da solicitação
- Workflows: pipelines explícitos de múltiplas etapas acionados pelo usuário

## Sequência Típica Multi-Agente

1. `/plan` para decomposição
2. `/coordinate` para execução em etapas
3. `agent:spawn` para sub-agentes em paralelo
4. `/review` para portão de QA
