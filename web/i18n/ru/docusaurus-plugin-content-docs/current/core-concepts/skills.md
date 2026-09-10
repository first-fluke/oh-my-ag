---
title: Навыки
description: "Полное руководство по двухслойной архитектуре OMA из 33 навыков: маршрутизация SKILL.md, ресурсы по требованию, общие и условные протоколы, выполнение для поставщиков, измерение токенов и механика маршрутизации."
---

# Навыки

Навыки — это структурированные пакеты знаний, которые дают роли диспетчеризации предметные указания. Они содержат протоколы выполнения, ссылки на технологический стек, шаблоны кода, playbook ошибок, чек-листы качества и примеры, если навык их предоставляет; всё организовано в двухслойной архитектуре для экономии токенов.

---

## Двухслойный дизайн

### Слой 1: SKILL.md (медиана около 2 631 токена, загружается при маршрутизации навыка)

У каждого навыка в корне есть файл `SKILL.md`. Он попадает в окно контекста, когда навык выбран маршрутизацией; injector hook передаёт **ссылку на путь**, а не содержимое, поэтому ненаправленный навык ничего не стоит сверх своего `description`. Файл содержит:

- **YAML frontmatter** с `name` и `description` (используются для маршрутизации и отображения)
- **When to use / When NOT to use**: явные условия активации
- **Core rules**: 5–15 самых важных ограничений предметной области
- **Architecture overview**: как следует структурировать код
- **Library list**: одобренные зависимости и их назначение
- **References**: указатели на ресурсы слоя 2 (автоматически не загружаются)

Example frontmatter:

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

Поле description критично: оно содержит ключевые слова маршрутизации, по которым система маршрутизации навыков сопоставляет задачи и агентов.

### Слой 2: resources/ (загружается по требованию)

Каталог `resources/` содержит подробные знания о выполнении. Эти файлы загружаются только когда:
1. хост или рабочий процесс выбрал навык (например, через нативное совпадение навыка или явную команду)
2. конкретный ресурс нужен для текущего типа и сложности задачи

Загрузкой по требованию управляет руководство по загрузке контекста (`.agents/skills/_shared/core/context-loading.md`), сопоставляющее типы задач с обязательными ресурсами каждого агента.

---

## Пример структуры файлов

```
.agents/skills/oma-frontend/
├── SKILL.md                          ← Layer 1: loaded when routed
└── resources/
    ├── execution-protocol.md         ← Layer 2: step-by-step workflow
    ├── tech-stack.md                 ← Layer 2: detailed technology specs
    ├── angular-rules.md              ← Layer 2: Angular-specific conventions
    ├── snippets.md                   ← Layer 2: copy-paste code patterns
    ├── error-playbook.md             ← Layer 2: error recovery procedures
    └── checklist.md                  ← Layer 2: quality verification checklist

.agents/skills/oma-backend/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── orm-reference.md              ← Domain-specific (ORM queries, N+1, transactions)
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Shipped language seeds / generated references
    ├── node/
    ├── python/
    └── rust/

.agents/skills/oma-mobile/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── tech-stack.md
│   ├── screen-template.dart
│   ├── screen-template.swift         ← Swift native iOS screen template
│   ├── screen-template.tsx            ← React Native screen template
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Stack schema and generated platform references
    ├── README.md
    └── stack.schema.json

.agents/skills/oma-design/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── anti-patterns.md
│   ├── checklist.md
│   ├── design-md-spec.md
│   ├── design-tokens.md
│   ├── prompt-enhancement.md
│   ├── stitch-integration.md
│   └── error-playbook.md
└── reference/                         ← Deep reference material
    ├── typography.md
    ├── color-and-contrast.md
    ├── spatial-design.md
    ├── motion-design.md
    ├── responsive-design.md
    ├── component-patterns.md
    ├── accessibility.md
    └── shader-and-3d.md
```

---

## Типы ресурсов навыка

| Тип ресурса | Шаблон имени файла | Назначение | Когда загружается |
|--------------|-----------------|---------|-------------|
| **Протокол выполнения** | `execution-protocol.md` | Рабочий процесс по шагам: Analyze -> Plan -> Implement -> Verify | Всегда (вместе с SKILL.md) |
| **Технологический стек** | `tech-stack.md` | Подробные спецификации технологий, версии и конфигурация | Сложные задачи |
| **Playbook ошибок** | `error-playbook.md` | Процедуры восстановления с эскалацией «3 strikes» | Только при ошибке |
| **Чек-лист** | `checklist.md` | Проверка качества для предметной области | На шаге Verify |
| **Фрагменты** | `snippets.md` | Готовые для копирования паттерны кода | Средние и сложные задачи |
| **Примеры** | `examples.md` или `examples/` | Few-shot-примеры ввода и вывода для LLM | Средние и сложные задачи |
| **Варианты** | каталог `variants/` | Ссылки для конкретного языка или фреймворка. Backend поставляет заготовки `node`, `python` и `rust`; mobile поставляет схему и может получать созданные ссылки для платформ. | Когда найден соответствующий стек |
| **Шаблоны** | `component-template.tsx`, `screen-template.dart` | Шаблоны файлов с заготовленным кодом | При создании компонента |
| **Ссылка на предметную область** | `orm-reference.md`, `anti-patterns.md` и т. п. | Глубокие знания предметной области для конкретных подзадач | Зависит от типа задачи |

---

## Shared resources (_shared/)

Все агенты используют общую основу из `.agents/skills/_shared/`. Она организована в три категории:

### Core resources (`.agents/skills/_shared/core/`)

| Resource | Purpose | When Loaded |
|----------|---------|-------------|
| **`skill-routing.md`** | Сопоставляет ключевые слова задачи с агентом. Содержит Skill-Agent Mapping, шаблоны Complex Request Routing, Inter-Agent Dependency Rules, Escalation Rules и Turn Limit Guide. | Используется orchestrator и coordination skills |
| **`context-loading.md`** | Определяет ресурсы для каждого типа и сложности задачи. Содержит таблицы task-type-to-resource по агентам и условные triggers загрузки протоколов. | В начале workflow (Step 0 / Phase 0) |
| **`prompt-structure.md`** | Определяет четыре элемента каждого task prompt: Goal, Context, Constraints, Done When. Содержит шаблоны для PM, implementation и QA agents и перечисляет anti-patterns (начинать только с Goal). | Используется PM agent и всеми workflows |
| **`clarification-protocol.md`** | Определяет уровни неопределённости (LOW/MEDIUM/HIGH) и действия для каждого. Содержит triggers неопределённости, шаблоны эскалации, обязательные проверки по типу агента и поведение subagent mode. | При неоднозначных требованиях |
| **`context-budget.md`** | Управляет token budget. Определяет стратегию чтения файлов (используйте `find_symbol`, а не `read_file`), измеренную стоимость ресурсов и загрузок Simple (~4 000 токенов) и Complex (~9 000), лимит `SKILL.md` (25 000 символов, проверяется `oma skill audit`), обработку больших файлов и симптомы переполнения контекста. | В начале workflow |
| **`difficulty-guide.md`** | Критерии классификации Simple/Medium/Complex. Определяет ожидаемые ходы, ветви протокола (Fast Track / Standard / Extended) и восстановление после неверной оценки. | В начале задачи (Step 0) |
| **`quality-principles.md`** | Четыре универсальных принципа качества, применяемых всеми агентами. | В начале quality-focused workflows (ultrawork) |
| **`vendor-detection.md`** | Протокол определения текущего runtime (Claude Code, Codex CLI, Antigravity, Cursor, Kiro, Qwen и CLI fallback). Использует host markers и состояние настроенного вендора. | В начале workflow |
| **`session-metrics.md`** | Подсчёт Clarification Debt (CD) и отслеживание метрик сессии. Определяет типы событий (clarify +10, correct +25, redo +40), пороги (CD >= 50 = RCA, CD >= 80 = pause) и точки интеграции. | Во время orchestration sessions |
| **`common-checklist.md`** | Универсальный quality checklist для финальной проверки Complex-задач (в дополнение к checklist агента). | Verify-шаг Complex-задач |
| **`lessons-learned.md`** | Репозиторий уроков прошлых сессий, автоматически создаваемых после нарушений Clarification Debt и отброшенных экспериментов. Организован по доменам и включает QA Evaluation Lessons для отслеживания blind spots оценивателя. | После ошибок и в конце сессии |
| **`api-contracts/`** | Каталог с шаблоном API-контрактов и сгенерированными контрактами. `template.md` задаёт формат каждого endpoint (method, path, request/response schemas, auth, errors). | Когда планируется работа через границы |

### Runtime resources (`.agents/skills/_shared/runtime/`)

| Resource | Purpose |
|----------|---------|
| **`memory-protocol.md`** | Формат файлов памяти и операции для CLI-субагентов. Определяет протоколы On Start, During Execution и On Completion с настраиваемыми memory tools (read/write/edit), включая расширение для tracking экспериментов. |
| **`execution-protocols/claude.md`** | Claude Code-specific execution patterns. Injected by `oma agent spawn` when vendor is claude. |
| **`execution-protocols/antigravity.md`** | Antigravity CLI (`agy`) execution patterns. |
| **`execution-protocols/codex.md`** | Codex CLI-specific execution patterns. |
| **`execution-protocols/commandcode.md`** | CommandCode execution patterns. |
| **`execution-protocols/grok.md`** | Grok execution patterns. |
| **`execution-protocols/kimi.md`** | Kimi Code execution patterns. |
| **`execution-protocols/kiro.md`** | Kiro execution patterns. |
| **`execution-protocols/opencode.md`** | OpenCode extension execution patterns. |
| **`execution-protocols/pi.md`** | pi extension execution patterns. |
| **`execution-protocols/qwen.md`** | Qwen CLI-specific execution patterns. |

Для агентов, запущенных через CLI, протоколы выполнения конкретного вендора автоматически внедряет `oma agent spawn`. Нативные субагенты используют правила интеграции выбранного вендора.

### Conditional resources (`.agents/skills/_shared/conditional/`)

These are loaded only when specific conditions are met during execution:

| Resource | Trigger Condition | Loaded By | Approx. Tokens |
|----------|-------------------|-----------|----------------|
| **`quality-score.md`** | Начинается фаза VERIFY или SHIP в workflow, поддерживающем измерение качества | Orchestrator (передаёт в prompt QA agent) | ~250 |
| **`experiment-ledger.md`** | Первый эксперимент записывается после установления baseline IMPL | Orchestrator (inline, после baseline measurement) | ~250 |
| **`exploration-loop.md`** | Один gate дважды не проходит по одной проблеме | Orchestrator (inline, перед запуском hypothesis agents) | ~250 |

Влияние на бюджет: около 750 токенов всего, если загружены все 3 ресурса. Загрузка условная, поэтому обычная сессия загружает 1–2 из них — это мало по сравнению с примерно 4 000 токенов, которые простая задача уже тратит на `SKILL.md` и `execution-protocol.md`.

---

## Как навыки маршрутизируются через skill-routing.md

Карта маршрутизации навыков определяет сопоставление задач с агентами:

### Простая маршрутизация (один домен)

Prompt с текстом "Build a login form with Tailwind CSS" совпадает с ключевыми словами `UI`, `component`, `form`, `Tailwind` и направляется в **oma-frontend**.

### Маршрутизация сложных запросов

Запросы из нескольких доменов выполняются в установленном порядке:

| Request Pattern | Execution Order |
|----------------|----------------|
| "Создай fullstack-приложение" | oma-pm -> (oma-backend + oma-frontend) parallel -> oma-qa |
| "Создай мобильное приложение" | oma-pm -> (oma-backend + oma-mobile) parallel -> oma-qa |
| "Fix bug and review" | oma-debug -> oma-qa |
| "Design and build a landing page" | oma-design -> oma-frontend |
| "У меня есть идея для feature" | oma-brainstorm -> oma-pm -> relevant agents -> oma-qa |
| "Do everything automatically" | oma-orchestration (internally: oma-pm -> agents -> oma-qa) |

### Inter-agent dependency rules

**Can run in parallel (no dependencies):**
- oma-backend + oma-frontend (when API contract is pre-defined)
- oma-backend + oma-mobile (when API contract is pre-defined)
- oma-frontend + oma-mobile (independent of each other)

**Must run sequentially:**
- oma-brainstorm -> oma-pm (design comes before planning)
- oma-pm -> all other agents (planning comes first)
- implementation agent -> oma-qa (review after implementation)
- oma-backend -> oma-frontend/oma-mobile (если заранее не задан API-контракт)

**QA всегда выполняется последним**, кроме случая, когда пользователь просит проверить только определённые файлы.

---

## Token savings math

Эти значения измерены по дереву навыков, а не оценены вручную. При необходимости их можно пересчитать:

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

Количество токенов — **приблизительное** (байты ÷ 4, грубое соотношение для английского
Markdown). Таблицы и fenced code токенизируются немного хуже, поэтому оценки слегка занижены; для точных
значений используйте настоящий tokenizer для целевой модели.

### Уровни загрузки

Каждый уровень — состояние, которого агент действительно достигает, согласно
[`context-loading.md`](https://github.com/first-fluke/oh-my-agent/blob/main/.agents/skills/_shared/core/context-loading.md):

| Уровень | Что находится в контексте |
|------|--------------------|
| `routed` | `SKILL.md` alone |
| `simple` | + `execution-protocol.md` |
| `medium` | + the mapped resource for the task, when that file exists |
| `complex` | + the mapped resource and stack references when the project provides them |
| `all` | `SKILL.md` + every resource file — the **ceiling**, not a selectable mode |

Для навыков backend и mobile `/stack-set` может создать project-specific
references в `stack/`. В свежем checkout нет сгенерированного каталога stack,
поэтому приведённая ниже строка `complex` измерена по поставленным seed в `variants/`,
на основе которых выполняется генерация — это proxy размера, а не файл, который агент уже загружает.

### Сессия из 5 агентов (pm, backend, frontend, mobile, qa)

| Tier | Tokens | Share of ceiling | Avoided |
|------|-------:|-----------------:|--------:|
| `routed` | 11,497 | 15.7% | 84.3% |
| `simple` | 17,923 | 24.4% | 75.6% |
| `medium` | 19,125 | 26.1% | 73.9% |
| `complex` | 39,156 | 53.4% | 46.6% |
| `all` | 73,355 | 100% | — |

Таким образом, простая или средняя задача у пяти агентов содержит примерно **17–19K токенов**
контекста навыков вместо потолка 73K, а сложная — около **38K**; экономия составляет ~74–76% для
обычной работы и снижается примерно до ~47%, когда задача подтягивает stack references. В модели с
контекстом 128K это оставляет около 110K свободными для Simple/Medium и 90K для Complex.

:::note Считайте `all` границей, а не альтернативой
Ни один runtime не загружает все ресурсы заранее: навыки показываются через `description`,
их тело читается при маршрутизации, а ресурсы — по мере необходимости задачи.
`all` — верхняя граница потенциальной стоимости навыка, поэтому проценты выше указаны как
«избегаемая» стоимость, а не как сравнение с реальной конфигурацией.
:::

Слой 1 — нижняя граница, и она немалая: для 33 установленных навыков
`SKILL.md` занимает примерно 1 275–5 489 токенов (медиана ~2 631). Эта граница ограничивает экономию
от progressive disclosure: если маршрутизированы все пять агентов, один уровень `routed` уже занимает
15% потолка.

---

## Загрузка ресурсов по сложности задачи

Руководство по сложности делит задачи на три уровня и определяет, какой объём Слоя 2 загружается:

### Simple (ожидается 3–5 ходов)

Изменение одного файла, ясные требования, повторение существующих паттернов.

Загружает только `execution-protocol.md`. Пропустите анализ и сразу переходите к реализации с коротким checklist.

### Medium (ожидается 8–15 ходов)

Изменение 2–3 файлов, требуются отдельные решения дизайна, применение паттернов в новых доменах.

Загружает `execution-protocol.md` и сопоставленный Medium-ресурс, если он существует. Применяется стандартный протокол с кратким анализом и полной проверкой.

### Complex (ожидается 15–25 ходов)

Изменение 4+ файлов, требуются архитектурные решения, вводятся новые паттерны и зависимости от других агентов.

Загружает `execution-protocol.md`, сопоставленный ресурс и доступные ссылки `tech-stack.md` / `snippets.md`. Расширенный протокол добавляет checkpoints, запись прогресса в середине выполнения и полную проверку с `common-checklist.md`.

---

## Context-loading task maps (per agent)

Руководство по загрузке контекста содержит подробные сопоставления типа задачи и ресурса. Ниже — ключевые mappings:

### Backend agent

| Task Type | Required Resources |
|-----------|-------------------|
| CRUD API creation | matching `variants/{node,python,rust}/snippets.md` when present |
| Authentication | matching variant `snippets.md` + `tech-stack.md` when present |
| DB migration | matching variant `snippets.md` when present |
| Performance optimization | `orm-reference.md` and any matching examples supplied by the skill |
| Existing code modification | project code-intelligence provider and relevant execution resources |

### Frontend agent

| Task Type | Required Resources |
|-----------|-------------------|
| Component creation | snippets.md + the project’s existing component patterns |
| Form implementation | snippets.md (form + Zod) |
| API integration | snippets.md (TanStack Query) |
| Styling | tailwind-rules.md |
| Page layout | snippets.md (grid) |

### Design agent

| Task Type | Required Resources |
|-----------|-------------------|
| Создание дизайн-системы | reference/typography.md + reference/color-and-contrast.md + reference/spatial-design.md + design-md-spec.md |
| Дизайн landing page | reference/component-patterns.md + reference/motion-design.md + prompt-enhancement.md |
| Design audit | checklist.md + anti-patterns.md |
| Design token export | design-tokens.md |
| 3D / shader effects | reference/shader-and-3d.md + reference/motion-design.md |
| Accessibility review | reference/accessibility.md + checklist.md |

### QA agent

| Task Type | Required Resources |
|-----------|-------------------|
| Security review | checklist.md (Security section) |
| Performance review | checklist.md (Performance section) |
| Accessibility review | checklist.md (Accessibility section) |
| Full audit | checklist.md (full) + self-check.md |
| Quality scoring | quality-score.md (conditional) |

---

## Orchestrator prompt composition

Когда orchestrator составляет prompt для субагентов, он включает только ресурсы, относящиеся к задаче:

1. Agent SKILL.md's Core Rules section
2. `execution-protocol.md`
3. Resources matching the specific task type (from the maps above)
4. `error-playbook.md` (always included; recovery is essential)
5. Memory Protocol (CLI mode)

Такой целевой состав не загружает ненужные ресурсы и оставляет субагенту максимум контекста для реальной работы.

---

## Clarification debt & session metrics (deep dive)

Clarification Debt (CD) измеряет стоимость неясных требований во время сессии. Orchestrator отслеживает каждую пользовательскую корректировку и начисляет баллы:

| Event Type | Points | Description |
|------------|--------|-------------|
| `clarify` | +10 | Simple clarification question (expected for MEDIUM uncertainty) |
| `correct` | +25 | Intent misunderstanding requiring direction change |
| `redo` | +40 | Scope/charter violation requiring rollback and restart |
| `blocked` | +0 | Agent correctly stopped and asked (good behavior, not penalized) |

**Modifiers:** Charter not read (+15), allowlist violation (+20), same error repeated (x1.5).

**Thresholds and enforcement:**
- **CD >= 50** → Mandatory RCA entry added to `lessons-learned.md`
- **CD >= 80** → Session halted, user must re-specify requirements
- **`redo` >= 2** → Orchestrator pauses and requests explicit scope confirmation
- **CD >= 30 в 3 последовательных сессиях одного агента** → ревью шаблона prompt агента

Журнал сессии ведётся в `.agents/state/memories/session-metrics.md`: для каждого события есть строки (turn, agent, event type, points, detail) и сводный раздел.

---

## Точность оценивания и настройка QA

QA-агенты улучшаются по отслеживаемым ошибкам суждения. В отличие от CD (real-time), Evaluator Accuracy (EA) ретроспективна: большинство ошибок обнаруживается после завершения сессии.

**Типы событий EA:**

| Событие | Баллы | Когда обнаружено |
|-------|--------|-----------------|
| `false_negative` | +30 | Следующая сессия или production (баг, который QA пропустил) |
| `false_positive` | +15 | Во время сессии (impl agent успешно оспорил находку QA) |
| `severity_mismatch` | +10 | Во время сессии или ревью следующей сессии (назначена неверная серьёзность) |
| `missed_stub` | +20 | Runtime-проверка обнаружила feature только для отображения |
| `good_catch` | -10 | QA поймал неочевидный баг (положительный сигнал) |

**EA вычисляется по скользящему окну из 3 сессий.** Пороги:
- **EA >= 30** → рекомендуется tuning: просмотрите накопленные EA events на повторяющиеся ошибки QA-суждения
- **EA >= 50** → tuning обязателен: обновите QA execution-protocol.md
- **`false_negative` >= 3** в окне → добавьте pattern обнаружения в QA checklist.md
- **`good_catch` >= 5** в окне → обобщите успешный pattern в `common-checklist.md`

При нарушении порога просмотрите накопленные EA events, классифицируйте ошибки, обновите QA checklist или execution protocol и проверьте результат в следующих 3 сессиях.

---

## Sprint decomposition for complex tasks

Для Complex-задач (4+ файлов, архитектурные решения) используется выполнение по sprint, а не один длинный запуск:

1. **Декомпозируйте** работу на 2–4 feature-focused sprint, каждый из которых проверяется отдельно
2. **Цель:** 5–8 ходов на sprint
3. **Sprint Gate** после каждого sprint:
   - deliverable sprint завершён?
   - lint/test проходят?
   - если sprint занял в 2 раза больше ожидаемых ходов → запишите checkpoint и сообщите пользователю
4. **Продолжайте** следующий sprint после прохождения gate

**Пример:** задача "JWT auth + CRUD API + tests" делится на:
- Sprint 1: User model + auth endpoints (register/login)
- Sprint 2: CRUD endpoints + validation
- Sprint 3: Tests + error handling

**Восстановление после неверной оценки сложности:** если задача началась как Simple, но оказалась сложнее, агент во время выполнения переходит на протокол Medium или Complex и записывает изменение в progress.

---

## Context reset protocol

Качество долго работающих агентов снижается по мере заполнения контекста. Orchestrator (а не сам агент) отслеживает это и запускает resets.

**Условия trigger (Orchestrator проверяет при мониторинге):**

| Условие | Обнаружение | Действие |
|-----------|-----------|--------|
| Исчерпан turn budget | Агент использовал >= 80% ожидаемых ходов, а acceptance criteria выполнены менее чем на 50% | Context Reset |
| Застой прогресса | В течение 3+ последовательных циклов мониторинга нет обновления progress file | Context Reset |
| Поверхностный вывод | Result file содержит stub markers или TODO placeholders | Re-spawn с явной инструкцией |

**Процедура reset:**
1. **Checkpoint:** сохраните текущее состояние агента (готовые и оставшиеся пункты, ключевые решения)
2. **Terminate:** остановите текущий запуск агента
3. **Re-spawn:** запустите нового агента с checkpoint в контексте
4. **Resume:** новый агент читает checkpoint и продолжает только оставшиеся пункты

Для автономных агентов (без Orchestrator) Sprint Gate из `difficulty-guide.md` служит safety net. Если sprint занимает в 2 раза больше ожидаемых ходов, агент записывает checkpoint и сообщает пользователю.
