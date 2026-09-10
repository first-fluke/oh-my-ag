---
title: "Оценка harness"
sidebar_label: Оценка harness
description: Оценивайте полный overlay OMA harness с парными изолированными задачами репозитория и детерминированными проверками артефактов.
---

# Оценка harness

`oma harness eval` измеряет, улучшает ли candidate OMA harness фиксированного target agent без изменения модели этого агента. Команда адаптирует тестовый паттерн из [AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses](https://arxiv.org/abs/2608.12307): зафиксируйте target model, измените harness и сравните результаты на одинаковых task.

Эта команда оценивает единицу крупнее, чем `oma skill eval`:

| Команда | Объект оценки | Цель оценки |
|:--------|:----------|:-------------|
| `oma skill eval` | Один body `SKILL.md` | Output агента |
| `oma harness eval` | Ограниченный overlay `.agents/` | Файлы и output в workspace репозитория |

Используйте skill eval, чтобы ответить на вопрос «помогает ли этот skill?». Используйте harness eval, чтобы выяснить, помогает ли сочетание skills, workflows, rules и инструкций агента надёжнее выполнять задачи репозитория на фиксированном агенте.

## Модель оценки

Каждая задача выполняется как парный эксперимент:

1. OMA копирует fixture задачи в новое baseline workspace.
2. OMA копирует текущие определения `agents`, `config`, `rules`, `skills` и `workflows` в это workspace и проектирует их в формат выбранного вендора.
3. OMA повторяет настройку во втором новом workspace и применяет там candidate overlay.
4. Для обеих сторон используются один primary agent, маршрут вендора, prompt, права записи и timeout.
5. Детерминированные проверки изучают получившийся workspace и необязательный output агента.

Настоящий проект никогда не используется как рабочий каталог arm. Временные arm workspace удаляются после оценки; собственная песочница процесса выбранного вендора остаётся источником полномочий для доступа вне этого рабочего каталога.

## Структура candidate

Путь candidate — каталог с частичным деревом `.agents/`:

```text
candidate/
└── .agents/
    ├── agents/
    │   └── docs-curator.md
    ├── rules/
    │   └── documentation.md
    ├── skills/
    │   └── project-docs/
    │       └── SKILL.md
    └── workflows/
        └── docs-check.md
```

Принимаются только файлы под `.agents/agents`, `.agents/rules`, `.agents/skills` и `.agents/workflows`. Hooks, fixtures evaluator, state, results, файлы конфигурации, symlinks и варианты агентов вендора отклоняются. Защищённые поля frontmatter агента, такие как `model`, `tools`, `effort` и лимиты выполнения, должны совпадать с baseline. Arm также завершается ошибкой, если запущенный agent изменяет защищённые определения `.agents/` до оценки.

## Формат suite

Suite — это один YAML-файл и один каталог fixture для каждой задачи:

```text
harness-eval/
├── suite.yaml
└── fixtures/
    ├── stale-api-doc/
    │   ├── docs/api.md
    │   └── src/session.ts
    └── missing-guide/
        ├── docs/
        └── src/feature.ts
```

```yaml
schema_version: 1
id: docs-harness
agent: docs-curator
tasks:
  - id: stale-api-doc
    prompt: Update the API documentation to match the implementation.
    workspace: fixtures/stale-api-doc
    weight: 1
    checks:
      - type: file_contains
        path: docs/api.md
        value: openSession
      - type: file_not_contains
        path: docs/api.md
        value: createSession
```

ID task должны быть уникальными. Пути fixture и check должны оставаться внутри project и task workspace. Fixture не могут содержать symlink или control surface harness, например `.agents`, `.codex`, `.claude`, vendor skill directories или root agent-instruction files. Это не позволяет данным task затенить управляемый harness обеих сторон.

Созданные каталоги зависимостей, такие как `node_modules` и `.venv`, не копируются из baseline harness. Зафиксируйте deterministic helper source и dependency manifests в skill; runtime dependencies для проверки предоставляйте в fixture task.

### Типы check

| Тип | Поля | Условие успеха |
|:-----|:-------|:---------------|
| `file_exists` | `path` | Путь существует после завершения arm. |
| `file_not_exists` | `path` | Путь не существует. |
| `file_contains` | `path`, `value` | Файл существует и содержит value. |
| `file_not_contains` | `path`, `value` | Файл существует и не содержит value. |
| `output_contains` | `value` | Захваченный output агента содержит value. |
| `output_not_contains` | `value` | Захваченный output агента не содержит value. |

Проверки артефактов намеренно детерминированы. Первая версия не запускает изменяемые package scripts в роли судей, потому что оцениваемый agent мог бы изменить эти scripts или их tests и тем самым нарушить evaluator.

## Запуск и запись

В live-режиме выполняются два dispatch на задачу, печатается предварительная оценка стоимости и требуется подтверждение:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --live --record
```

Для успешного запуска report содержит парные оценки baseline/candidate, lift, число regressions и решение вроде `pass` или `insufficient`. Если вы меняете suite, определения baseline, candidate overlay, prompt, fixture или check, запишите новый live run; старый файл `_runs` будет отклонён из-за hash.

Используйте `--yes` для неинтерактивного запуска и `--timeout-minutes`, чтобы задать одинаковый wall-clock limit для обеих сторон. Live execution доступен только когда выбранный vendor обнаруживает файлы harness относительно workspace проекта. OMA отказывается от discovery через HOME, поскольку baseline мог бы увидеть глобально установленный candidate content.

`--record` записывает JSON record с адресацией по hash в `_runs/` рядом с suite. Record связывает результат с тремя input:

- содержимое suite, prompt, check и fixture;
- текущие определения baseline harness;
- содержимое candidate overlay.

Mock mode используется по умолчанию и не выполняет вызовов модели. Он воспроизводит record только пока совпадают все три hash:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --mock --require-coverage
```

## Метрики и gate решения

Каждая task проходит только после успешного прохождения всех check. Score — это взвешенное среднее по парным task:

```text
lift = candidateScore - baselineScore
```

OMA также сообщает:

- corrected tasks: baseline не прошёл, candidate прошёл;
- regressed tasks: baseline прошёл, candidate не прошёл;
- coverage: требуется не менее пяти парных оцениваемых task.

Candidate проходит, когда lift не меньше 5 процентных пунктов и regression отсутствуют. Любая regression проваливает candidate. Нулевой или положительный lift ниже 5 пунктов выдаёт предупреждение, а менее пяти парных task даёт решение `insufficient`. Добавьте `--require-coverage`, чтобы в CI недостаточное coverage завершалось ненулевым кодом. Score не является evidence, если arm отсутствует, hash record устарел или детерминированная check не завершена.

## Текущая граница

Это основа оценки, а не автоматическая оптимизация harness. Builder может внешне создавать candidate overlay, а затем использовать эту команду как gate приёмки. Отдельный скрытый final-test suite, повторные стохастические испытания, доверенные внешние test runner, учёт token, принудительная фиксация модели для вложенных вызовов subagent и автоматический цикл `harness opt` не входят в текущую команду. Пока фиксация вложенных вызовов отсутствует, suite, предназначенные для измерения одной фиксированной модели, должны избегать candidate workflow, которые запускают другие настроенные роли agent.
