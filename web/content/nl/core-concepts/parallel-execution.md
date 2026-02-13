---
title: Parallelle uitvoering
description: CLI-orkestratiepatronen voor het gelijktijdig uitvoeren van meerdere agents.
---

# Parallelle uitvoering

## Basispatroon

```bash
oh-my-ag agent:spawn backend "Implement auth API" session-01 &
oh-my-ag agent:spawn frontend "Create login form" session-01 &
wait
```

## Werkruimtebewust patroon

```bash
oh-my-ag agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oh-my-ag agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## Monitoringpatroon

```bash
bunx oh-my-ag dashboard:web
# open http://localhost:9847
```

## Multi-CLI-configuratie

Configureer verschillende CLI's per agenttype in `.agent/config/user-preferences.yaml`:

```yaml
# Antwoordtaal
language: ko  # ko, en, ja, zh, ...

# Standaard CLI (enkele taken)
default_cli: gemini

# CLI-toewijzing per agent (multi-CLI-modus)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

Voer `/setup` uit om interactief te configureren.

## Prioriteit van CLI-vendorresolutie

1. `--vendor` opdrachtregelargument
2. `agent_cli_mapping` uit user-preferences.yaml
3. `default_cli` uit user-preferences.yaml
4. `active_vendor` uit cli-config.yaml (verouderd)
5. Ingebouwde terugval: `gemini`
