---
title: Parallele Ausführung
description: CLI-Orchestrierungsmuster für die gleichzeitige Ausführung mehrerer Agenten.
---

# Parallele Ausführung

## Grundmuster

```bash
oh-my-ag agent:spawn backend "Implement auth API" session-01 &
oh-my-ag agent:spawn frontend "Create login form" session-01 &
wait
```

## Workspace-bewusstes Muster

```bash
oh-my-ag agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oh-my-ag agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## Überwachungsmuster

```bash
bunx oh-my-ag dashboard:web
# open http://localhost:9847
```

## Multi-CLI-Konfiguration

Konfigurieren Sie verschiedene CLIs pro Agententyp in `.agent/config/user-preferences.yaml`:

```yaml
# Antwortsprache
language: ko  # ko, en, ja, zh, ...

# Standard-CLI (Einzelaufgaben)
default_cli: gemini

# CLI-Zuordnung pro Agent (Multi-CLI-Modus)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

Führen Sie `/setup` aus, um die Konfiguration interaktiv vorzunehmen.

## CLI-Anbieter-Auflösungspriorität

1. `--vendor` Kommandozeilenargument
2. `agent_cli_mapping` aus user-preferences.yaml
3. `default_cli` aus user-preferences.yaml
4. `active_vendor` aus cli-config.yaml (veraltet)
5. Fest codierter Fallback: `gemini`
