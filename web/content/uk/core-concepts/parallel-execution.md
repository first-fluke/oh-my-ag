---
title: Паралельне виконання
description: Патерни CLI-оркестрації для одночасного запуску кількох агентів.
---

# Паралельне виконання

## Базовий патерн

```bash
oh-my-ag agent:spawn backend "Implement auth API" session-01 &
oh-my-ag agent:spawn frontend "Create login form" session-01 &
wait
```

## Патерн з урахуванням робочого простору

```bash
oh-my-ag agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oh-my-ag agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## Патерн моніторингу

```bash
bunx oh-my-ag dashboard:web
# open http://localhost:9847
```

## Конфігурація мульти-CLI

Налаштуйте різні CLI для кожного типу агента в `.agent/config/user-preferences.yaml`:

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

Запустіть `/setup` для інтерактивного налаштування.

## Пріоритет визначення CLI-постачальника

1. Аргумент командного рядка `--vendor`
2. `agent_cli_mapping` з user-preferences.yaml
3. `default_cli` з user-preferences.yaml
4. `active_vendor` з cli-config.yaml (застарілий)
5. Жорстко задане значення за замовчуванням: `gemini`
