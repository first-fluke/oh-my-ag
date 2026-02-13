---
title: Встановлення
description: Передумови, варіанти встановлення та початкове налаштування.
---

# Встановлення

## Передумови

- Google Antigravity (2026+)
- Bun
- uv

## Варіант 1: Інтерактивне встановлення

```bash
bunx oh-my-ag
```

Встановлює навички та робочі процеси в `.agent/` поточного проєкту.

## Варіант 2: Глобальне встановлення

```bash
bun install --global oh-my-ag
```

Рекомендується, якщо ви часто використовуєте команди оркестратора.

## Варіант 3: Інтеграція в існуючий проєкт

### Шлях через CLI

```bash
bunx oh-my-ag
bunx oh-my-ag doctor
```

### Ручне копіювання

```bash
cp -r oh-my-ag/.agent/skills /path/to/project/.agent/
cp -r oh-my-ag/.agent/workflows /path/to/project/.agent/
cp -r oh-my-ag/.agent/config /path/to/project/.agent/
```

## Початкова команда налаштування

```text
/setup
```

Створює `.agent/config/user-preferences.yaml`.

## Необхідні CLI-постачальники

Встановіть та авторизуйте принаймні одного:

- Gemini
- Claude
- Codex
- Qwen
