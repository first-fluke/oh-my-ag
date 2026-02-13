---
title: Параллельное выполнение
description: Паттерны CLI-оркестрации для одновременного запуска нескольких агентов.
---

# Параллельное выполнение

## Базовый паттерн

```bash
oh-my-ag agent:spawn backend "Implement auth API" session-01 &
oh-my-ag agent:spawn frontend "Create login form" session-01 &
wait
```

## Паттерн с учётом рабочих пространств

```bash
oh-my-ag agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oh-my-ag agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## Паттерн мониторинга

```bash
bunx oh-my-ag dashboard:web
# open http://localhost:9847
```

## Конфигурация нескольких CLI

Настройте различные CLI для каждого типа агента в `.agent/config/user-preferences.yaml`:

```yaml
# Язык ответов
language: ko  # ko, en, ja, zh, ...

# CLI по умолчанию (для одиночных задач)
default_cli: gemini

# Привязка CLI к агентам (мульти-CLI режим)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

Выполните `/setup` для интерактивной настройки.

## Приоритет определения CLI-вендора

1. Аргумент командной строки `--vendor`
2. `agent_cli_mapping` из user-preferences.yaml
3. `default_cli` из user-preferences.yaml
4. `active_vendor` из cli-config.yaml (устаревший)
5. Значение по умолчанию: `gemini`
