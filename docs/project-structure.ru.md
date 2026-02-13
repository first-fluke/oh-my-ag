# Структура проекта

Подробное дерево директорий для этого репозитория.

```text
.
├── .agent/
│   ├── config/
│   │   └── user-preferences.yaml   # Язык, часовой пояс, маппинг CLI
│   ├── workflows/
│   │   ├── coordinate.md           # /coordinate (мультиагентная оркестрация через UI)
│   │   ├── orchestrate.md          # /orchestrate (автоматизированное CLI параллельное выполнение)
│   │   ├── plan.md                 # /plan (декомпозиция задач PM)
│   │   ├── review.md               # /review (полный QA конвейер)
│   │   ├── debug.md                # /debug (структурированное исправление багов)
│   │   ├── setup.md                # /setup (конфигурация CLI и MCP)
│   │   └── tools.md                # /tools (управление MCP инструментами)
│   └── skills/
│       ├── _shared/                    # Общие ресурсы (не навык)
│       │   ├── serena-memory-protocol.md
│       │   ├── common-checklist.md
│       │   ├── skill-routing.md
│       │   ├── context-loading.md
│       │   ├── context-budget.md
│       │   ├── reasoning-templates.md
│       │   ├── clarification-protocol.md
│       │   ├── difficulty-guide.md
│       │   ├── lessons-learned.md
│       │   ├── verify.sh
│       │   └── api-contracts/
│       ├── workflow-guide/             # Координация мультиагентов
│       ├── pm-agent/                   # Продакт-менеджер
│       ├── frontend-agent/             # React/Next.js
│       ├── backend-agent/              # FastAPI
│       ├── mobile-agent/               # Flutter
│       ├── qa-agent/                   # Безопасность и QA
│       ├── debug-agent/                # Исправление багов
│       ├── orchestrator/               # CLI-основанный спавнер субагентов
│       └── commit/                     # Навык Conventional commits
│       # Каждый навык имеет:
│       #   SKILL.md              (~40 строк, оптимизировано по токенам)
│       #   resources/
│       #     ├── execution-protocol.md  (шаги цепочки мыслей)
│       #     ├── examples.md            (few-shot ввод/вывод)
│       #     ├── checklist.md           (самопроверка)
│       #     ├── error-playbook.md      (восстановление после сбоев)
│       #     ├── tech-stack.md          (детальные техспецификации)
│       #     └── snippets.md            (паттерны для копирования)
├── .serena/
│   └── memories/                   # Состояние выполнения (gitignored)
├── package.json
├── docs/
│   ├── USAGE.md                    # Подробное руководство по использованию (английский)
│   ├── USAGE.ko.md                 # Подробное руководство по использованию (корейский)
│   ├── project-structure.md        # Полная справка по структуре (английский)
│   └── project-structure.ko.md     # Полная справка по структуре (корейский)
├── README.md                       # Этот файл (английский)
└── README.ko.md                    # Корейское руководство
```
