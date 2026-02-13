---
title: Flujos de trabajo
description: Flujos de trabajo explicitos con comandos slash y cuando utilizarlos.
---

# Flujos de trabajo

## Comandos de flujo de trabajo

- `/coordinate`
- `/orchestrate`
- `/plan`
- `/review`
- `/debug`

## Skills vs flujos de trabajo

- Skills: se activan automaticamente a partir de la intencion de la solicitud
- Flujos de trabajo: pipelines explicitos de multiples pasos activados por el usuario

## Secuencia tipica multi-agente

1. `/plan` para la descomposicion
2. `/coordinate` para la ejecucion por etapas
3. `agent:spawn` para sub-agentes en paralelo
4. `/review` para la compuerta de QA
