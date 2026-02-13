---
title: Команди
description: Повна поверхня команд з cli/cli.ts.
---

# Команди

Поверхня команд нижче відображає поточну реалізацію в `cli/cli.ts`.

## Основні команди

```bash
oh-my-ag                         # інтерактивний інсталятор
oh-my-ag dashboard               # термінальна панель моніторингу
oh-my-ag dashboard:web           # веб-панель моніторингу (:9847)
oh-my-ag usage                   # квоти використання
oh-my-ag update                  # оновити навички з реєстру
oh-my-ag doctor                  # діагностика середовища/навичок
oh-my-ag stats                   # метрики продуктивності
oh-my-ag retro                   # ретроспективний звіт
oh-my-ag cleanup                 # очищення залишкових ресурсів
oh-my-ag bridge [url]            # MCP stdio -> streamable HTTP
```

## Команди агентів

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## Пам'ять та верифікація

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
