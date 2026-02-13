# Структура проєкту

Детальне дерево директорій для цього репозиторія.

```text
.
├── .agent/
│   ├── config/
│   │   └── user-preferences.yaml   # Мова, часовий пояс, відповідність CLI
│   ├── workflows/
│   │   ├── coordinate.md           # /coordinate (мультиагентна оркестрація через UI)
│   │   ├── orchestrate.md          # /orchestrate (автоматичне CLI паралельне виконання)
│   │   ├── plan.md                 # /plan (PM декомпозиція завдань)
│   │   ├── review.md               # /review (повний QA конвеєр)
│   │   ├── debug.md                # /debug (структуроване виправлення помилок)
│   │   ├── setup.md                # /setup (налаштування CLI та MCP)
│   │   └── tools.md                # /tools (управління MCP інструментами)
│   └── skills/
│       ├── _shared/                    # Спільні ресурси (не навичка)
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
│       ├── workflow-guide/             # Мультиагентна координація
│       ├── pm-agent/                   # Менеджер продукту
│       ├── frontend-agent/             # React/Next.js
│       ├── backend-agent/              # FastAPI
│       ├── mobile-agent/               # Flutter
│       ├── qa-agent/                   # Безпека та QA
│       ├── debug-agent/                # Виправлення помилок
│       ├── orchestrator/               # CLI-створювач підагентів
│       └── commit/                     # Навичка conventional commits
│       # Кожна навичка має:
│       #   SKILL.md              (~40 рядків, токен-оптимізований)
│       #   resources/
│       #     ├── execution-protocol.md  (кроки ланцюга міркувань)
│       #     ├── examples.md            (few-shot введення/виведення)
│       #     ├── checklist.md           (самоперевірка)
│       #     ├── error-playbook.md      (відновлення після збоїв)
│       #     ├── tech-stack.md          (детальні технічні специфікації)
│       #     └── snippets.md            (шаблони копіювати-вставити)
├── .serena/
│   └── memories/                   # Стан виконання (ігнорується git)
├── package.json
├── docs/
│   ├── USAGE.md                    # Детальний посібник з використання (англійською)
│   ├── USAGE.ko.md                 # Детальний посібник з використання (корейською)
│   ├── project-structure.md        # Повний довідник структури (англійською)
│   └── project-structure.ko.md     # Повний довідник структури (корейською)
├── README.md                       # Цей файл (англійською)
└── README.ko.md                    # Посібник корейською
```
