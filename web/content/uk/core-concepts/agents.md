---
title: Агенти
description: Типи агентів, стратегія робочих просторів та потік оркестрації.
---

# Агенти

## Категорії агентів

- Планування: PM-агент
- Реалізація: Frontend, Backend, Mobile
- Забезпечення якості: QA, Debug
- Координація: workflow-guide, orchestrator

## Стратегія робочих просторів

Окремі робочі простори зменшують конфлікти злиття:

```text
./apps/api      -> backend
./apps/web      -> frontend
./apps/mobile   -> mobile
```

## Потік менеджера агентів

1. PM визначає декомпозицію
2. Доменні агенти виконують задачі паралельно
3. Прогрес передається в пам'ять Serena
4. QA перевіряє узгодженість на рівні системи

## Файли середовища Serena

- `orchestrator-session.md`
- `task-board.md`
- `progress-{agent}.md`
- `result-{agent}.md`
