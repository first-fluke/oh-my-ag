---
title: Exécution parallèle
description: Modèles d'orchestration CLI pour exécuter plusieurs agents simultanément.
---

# Exécution parallèle

## Modèle de base

```bash
oh-my-ag agent:spawn backend "Implement auth API" session-01 &
oh-my-ag agent:spawn frontend "Create login form" session-01 &
wait
```

## Modèle avec espaces de travail

```bash
oh-my-ag agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oh-my-ag agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## Modèle de surveillance

```bash
bunx oh-my-ag dashboard:web
# open http://localhost:9847
```

## Configuration multi-CLI

Configurez différents CLI par type d'agent dans `.agent/config/user-preferences.yaml` :

```yaml
# Response language
language: ko  # ko, en, ja, zh, ...

# Default CLI (single tasks)
default_cli: gemini

# Per-agent CLI mapping (multi-CLI mode)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

Exécutez `/setup` pour configurer de manière interactive.

## Priorité de résolution du fournisseur CLI

1. Argument en ligne de commande `--vendor`
2. `agent_cli_mapping` depuis user-preferences.yaml
3. `default_cli` depuis user-preferences.yaml
4. `active_vendor` depuis cli-config.yaml (ancien)
5. Valeur par défaut en dur : `gemini`
