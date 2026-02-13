---
title: Установка
description: Предварительные требования, варианты установки и первоначальная настройка.
---

# Установка

## Предварительные требования

- Google Antigravity (2026+)
- Bun
- uv

## Вариант 1: Интерактивная установка

```bash
bunx oh-my-ag
```

Устанавливает навыки и рабочие процессы в `.agent/` в текущем проекте.

## Вариант 2: Глобальная установка

```bash
bun install --global oh-my-ag
```

Рекомендуется, если вы часто используете команды оркестратора.

## Вариант 3: Интеграция в существующий проект

### Через CLI

```bash
bunx oh-my-ag
bunx oh-my-ag doctor
```

### Ручное копирование

```bash
cp -r oh-my-ag/.agent/skills /path/to/project/.agent/
cp -r oh-my-ag/.agent/workflows /path/to/project/.agent/
cp -r oh-my-ag/.agent/config /path/to/project/.agent/
```

## Команда первоначальной настройки

```text
/setup
```

Создаёт `.agent/config/user-preferences.yaml`.

## Необходимые CLI-вендоры

Установите и авторизуйте хотя бы одного:

- Gemini
- Claude
- Codex
- Qwen
