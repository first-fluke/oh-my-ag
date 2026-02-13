---
title: Comandos
description: Superfície completa de comandos a partir de cli/cli.ts.
---

# Comandos

A superfície de comandos abaixo reflete a implementação atual em `cli/cli.ts`.

## Comandos Principais

```bash
oh-my-ag                         # instalador interativo
oh-my-ag dashboard               # dashboard no terminal
oh-my-ag dashboard:web           # dashboard web (:9847)
oh-my-ag usage                   # cotas de uso
oh-my-ag update                  # atualizar skills do registro
oh-my-ag doctor                  # diagnóstico de ambiente/skills
oh-my-ag stats                   # métricas de produtividade
oh-my-ag retro                   # relatório retrospectivo
oh-my-ag cleanup                 # limpar recursos órfãos
oh-my-ag bridge [url]            # MCP stdio -> streamable HTTP
```

## Comandos de Agente

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## Memória e Verificação

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
