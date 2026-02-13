---
title: Execução Paralela
description: Padrões de orquestração CLI para executar múltiplos agentes simultaneamente.
---

# Execução Paralela

## Padrão Básico

```bash
oh-my-ag agent:spawn backend "Implement auth API" session-01 &
oh-my-ag agent:spawn frontend "Create login form" session-01 &
wait
```

## Padrão com Workspace Dedicado

```bash
oh-my-ag agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oh-my-ag agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## Padrão de Monitoramento

```bash
bunx oh-my-ag dashboard:web
# open http://localhost:9847
```

## Configuração Multi-CLI

Configure diferentes CLIs por tipo de agente em `.agent/config/user-preferences.yaml`:

```yaml
# Idioma de resposta
language: ko  # ko, en, ja, zh, ...

# CLI padrão (tarefas únicas)
default_cli: gemini

# Mapeamento de CLI por agente (modo multi-CLI)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

Execute `/setup` para configurar interativamente.

## Prioridade de Resolução do Vendor CLI

1. Argumento `--vendor` na linha de comando
2. `agent_cli_mapping` do user-preferences.yaml
3. `default_cli` do user-preferences.yaml
4. `active_vendor` do cli-config.yaml (legado)
5. Fallback padrão: `gemini`
