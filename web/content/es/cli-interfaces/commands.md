---
title: Comandos
description: Superficie completa de comandos de cli/cli.ts.
---

# Comandos

La superficie de comandos a continuacion refleja la implementacion actual en `cli/cli.ts`.

## Comandos principales

```bash
oh-my-ag                         # instalador interactivo
oh-my-ag dashboard               # panel de control en terminal
oh-my-ag dashboard:web           # panel de control web (:9847)
oh-my-ag usage                   # cuotas de uso
oh-my-ag update                  # actualizar skills desde el registro
oh-my-ag doctor                  # diagnosticos de entorno/skills
oh-my-ag stats                   # metricas de productividad
oh-my-ag retro                   # informe retrospectivo
oh-my-ag cleanup                 # limpiar recursos huerfanos
oh-my-ag bridge [url]            # MCP stdio -> streamable HTTP
```

## Comandos de agentes

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## Memoria y verificacion

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
