---
title: Команды
description: Полный набор команд из cli/cli.ts.
---

# Команды

Набор команд ниже соответствует текущей реализации в `cli/cli.ts`.

## Основные команды

```bash
oh-my-ag                         # интерактивный установщик
oh-my-ag dashboard               # терминальная панель мониторинга
oh-my-ag dashboard:web           # веб-панель мониторинга (:9847)
oh-my-ag usage                   # квоты использования
oh-my-ag update                  # обновление навыков из реестра
oh-my-ag doctor                  # диагностика окружения и навыков
oh-my-ag stats                   # метрики продуктивности
oh-my-ag retro                   # ретроспективный отчёт
oh-my-ag cleanup                 # очистка осиротевших ресурсов
oh-my-ag bridge [url]            # MCP stdio -> streamable HTTP
```

## Команды агентов

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## Память и верификация

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
