---
title: "Оценка полезности skill"
sidebar_label: Оценка skill
description: Как создавать fixture задач evaluation для oma skill eval, использовать соглашение каталога .agents/eval/, типы checker и режимы mock/live.
---

# Оценка полезности skill

`oma skill eval` измеряет, действительно ли загрузка skill улучшает результаты задач агента. Он отвечает на другой вопрос, чем `oma skill audit` (там спрашивается «не дублируют ли друг друга два skill?»): здесь вопрос такой — «помогает ли этот skill?».

Дизайн опирается на два результата исследований: WikiSkill (arXiv:2608.27454) разделяет raw experience, persistent knowledge и executable skills, сохраняя held-out gate для evolution; SkillLens (arXiv:2605.23899) показывает, что utility skill независима от distinctiveness описания — distinct skill может оказаться бесполезным, а пересекающийся skill может помогать.

---

## Как это работает

Для каждой fixture задачи команда запускает две стороны:

1. **Baseline arm** — prompt задачи передаётся агенту без target skill.
2. **Treatment arm** — `SKILL.md` добавляется в начало prompt, затем передаётся та же задача.

Каждая сторона получает оценку (0 = fail, 1 = pass) через checker задачи. Главная метрика:

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

Skill проходит, когда `utilityLift ≥ 5%`. Ниже этого порога появляется warning (marginal lift) или fail (нет lift). Для verdict требуется как минимум 5 оцениваемых task.

---

## Соглашение `.agents/eval/<skill>/`

Размещайте task fixture в `.agents/eval/<skill>/`. Этот путь находится внутри `.agents/`, но за пределами каталога skill, поэтому `oma update` не перезапишет созданные пользователем eval.

```
.agents/eval/
└── oma-scholar/
    ├── claims-only.yaml        ← task fixture
    ├── entity-lookup.yaml
    ├── partial-fetch.yaml
    ├── structured-output.yaml
    ├── edge-empty-response.yaml
    └── _rollouts/
        └── a3f1b2c4d5e6f7a8.json   ← recorded arm outputs + judge verdicts
```

Файлы, начинающиеся с `_`, пропускаются при загрузке fixture task. Подкаталог `_rollouts/` хранит записанные output предыдущих запусков `--live --record`.

---

## Схема task fixture

Каждая fixture — YAML-файл со следующими полями:

```yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
checker:
  type: judge
  rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

| Поле | Обязательно | Описание |
|:------|:-----------|:---------|
| `id` | Да | Уникальный идентификатор task (используется в именах rollout и отчётах). |
| `skill` | Да | Оцениваемый skill (совпадает с именем родительского каталога). |
| `domain` | Да | Метка домена (для группировки и будущего обнаружения negative transfer). |
| `prompt` | Да | Prompt task, dispatchимый обеим сторонам. |
| `checker` | Нет | Способ оценить output arm. Если отсутствует, используется `{ type: judge }`. |
| `weight` | Да | Относительный вес для взвешенного среднего score (используйте `1`, если task одинаково важны). |

### Типы checker

#### judge (по умолчанию)

LLM оценивает output arm по rubric и возвращает PASS или FAIL. Это default, когда `checker` отсутствует или `checker.type` не задан.

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

Поле `rubric` необязательно; если его нет, используется default rubric: «Does the answer correctly and completely satisfy the task prompt?»

Для краткости rubric можно задать на верхнем уровне:

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**Важно:** в режиме `--mock` проверка judge требует заранее записанный verdict в `_rollouts/`. Если записанного verdict для задачи нет, она исключается из report с предупреждением. Сначала выполните `--live --record`, чтобы заполнить rollout.

То же относится к любому типу checker, если arm полностью отсутствует: задача исключается, а не получает score 0. Отсутствующие данные не означают плохой ответ — оценка обеих сторон как 0 дала бы `decision: "fail"` при нулевом lift. Исключения, из-за которых число оценённых задач становится меньше `MIN_TASKS`, приводят к `coverage: "insufficient"`.

#### assert (опционально)

Детерминированная проверка подстрок. Используйте её для проверки contract / format / tool-call, где output должен быть точным.

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

Проверка проходит, когда каждая строка из `expect_contains` присутствует в output arm.

#### regex (опционально)

Детерминированное совпадение regex. Используйте, когда нужна pattern, а не точная строка.

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

Pattern длиннее 200 символов получает score 0 (защита от ReDoS). Перед сопоставлением output обрезается до 10 000 символов.

---

## Режимы выполнения

### --mock (по умолчанию)

Воспроизводит записанные rollout из `_rollouts/`. Полностью детерминирован и offline — LLM не вызывается.

- Для checker `assert`/`regex`: score вычисляется из записанных строк output.
- Для checker `judge`: воспроизводится поле `score`, записанное через `--live --record`.

Если для task judge в `_rollouts/` нет записанного score, task исключается из report (с предупреждением в консоли). Так mock mode остаётся строго offline.

Перед использованием записи также проверяются на устаревание. Treatment entry, записанная для другого body SKILL.md, entry с изменившимся fixture `prompt` и любая entry без provenance tracking отбрасываются с предупреждением, где указаны файл и количество. Если после этого остаётся меньше `MIN_TASKS` оцениваемых task, запуск сообщает `coverage: "insufficient"`, а не verdict — изменившийся skill не наследует старую оценку.

:::note `oma skill optimize --mock`
Optimizer оценивает candidate body SKILL.md. Поскольку запись действительна только для body, с которым она создана, для candidate body подходящих rollout нет и они считаются uncovered. Для оценки candidate используйте `--live`.
:::

Безопасно для CI. Задайте `OMA_SKILLEVAL_MOCK=1`, чтобы принудительно включить этот mode.

```bash
oma skill eval --skill oma-scholar
```

### --live

Запускает реальные arm агентов через `oma agent spawn --read-only`. Обе стороны работают во временном workspace, чтобы не изменять файлы проекта.

Перед dispatch команда печатает предварительную оценку стоимости: количество задач, dispatch arm, dispatch judge и разрешённый вендор. Подтвердите `y` или пропустите с `--yes`.

Другие control полезны для CI и исследования coverage:

| Параметр | Действие |
| --- | --- |
| `--task-dir <path>` | Оценивает fixture из каталога, отличного от `.agents/eval/<skill>`. |
| `--max-tasks <n>` | Ограничивает число fixture для bounded live run. |
| `--neg-transfer` | Выбирает соседние task того же домена для поиска negative transfer; по умолчанию выключено. |
| `--require-coverage` | Завершает процесс ненулевым кодом, если осталось меньше пяти оцениваемых парных task. |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### Изоляция skill (чтобы baseline оставался честным) {#skill-isolation-keeping-the-baseline-honest}

`utilityLift` имеет смысл только если **baseline arm запускается без target skill**. Проблема в том, что dispatchированный agent автоматически загружает все skill, установленные в его runtime, поэтому наивный baseline всё равно подхватил бы skill, который должен измеряться без него — сравнение загрязняется (baseline ≈ treatment, lift ≈ 0).

Чтобы этого не произошло, `--live` запускает **обе стороны в изолированном временном workspace**, каталог skill которого содержит все установленные skill **кроме target**. Treatment arm добавляет target **только** через внедрённый `SKILL.md` (в начало prompt). Injection — единственная контролируемая переменная: baseline = без skill, treatment = candidate `SKILL.md`.

Это работает, потому что большинство vendor обнаруживает skill **относительно рабочего каталога** (например, `<cwd>/.claude/skills`, `<cwd>/.codex/skills`): чистый рабочий каталог действительно скрывает skill. Report показывает, насколько хорошо сработала изоляция, в поле `isolation`:

| Статус | Значение |
|---|---|
| `enforced` | Vendor использует cwd-relative discovery, target skill отсутствует в HOME path — изоляция полная. |
| `best-effort` | Vendor использует cwd-relative discovery, но копия skill есть в HOME (или vendor неизвестен); project copy скрыта, однако HOME copy всё ещё может просочиться. Низкая уверенность. |
| `unavailable` | Vendor использует HOME (например, **antigravity**, который читает `~/.gemini/antigravity-cli/skills`); чистый cwd не может скрыть skill. Печатается warning, результат имеет низкую уверенность. |
| n/a | Mock mode — live dispatch отсутствует. |

Если isolation не `enforced`, печатается однострочное предупреждение, а результат следует считать сигналом с низкой уверенностью. Для чистого сигнала запускайте eval через изолируемого вендора с cwd-relative discovery (claude / codex / qwen), а не через HOME-based vendor — eval vendor следует `model_preset` в `.agents/oma-config.yaml`, поэтому выберите preset с cwd-relative default vendor.

### --live --record

Запускает live arm и записывает захваченные output (включая judge verdict для task с judge-checker) в `_rollouts/<hash>.json`. Имя файла — детерминированный SHA-256 hash набора ID task, а не дата или случайное значение.

Используйте это для подготовки `--mock` запусков на своей машине, чтобы повторные запуски оставались offline.

Каждая entry содержит provenance, поэтому последующий replay может определить, применима ли она:

| Поле | Записывается для | Сравнивается с |
|---|---|---|
| `skillBodyHash` | только `treatment` | body SKILL.md, который оценивается |
| `promptHash` | обе arm | текущий `prompt` fixture |

Baseline arm скрывает skill, поэтому редактирование SKILL.md не делает его недействительным — повторно записывается только treatment arm.

:::caution `_rollouts/` — только локальный каталог, не коммитьте его
Recording воспроизводится только для точного body SKILL.md, с которым создан. После изменения skill treatment recording отбрасывается при следующем `--mock`, поэтому закоммиченный recording устареет при следующем изменении SKILL.md и выдаст warning всем, кто его получит. Каталог игнорируется Git; записывайте его локально.
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

После успешного live run report содержит оценки baseline и treatment, `utilityLift`, `coverage: "ok"`, статус isolation и решение pass/warn/fail. Последующий mock run использует только записи, у которых prompt задачи и body treatment skill по-прежнему совпадают.

---

## Минимальный рабочий набор fixture

Для verdict требуется пять fixture (`MIN_TASKS = 5`). Вот минимальный набор для условного skill `oma-scholar`:

```yaml
# .agents/eval/oma-scholar/claims-only.yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

```yaml
# .agents/eval/oma-scholar/entity-lookup.yaml
id: entity-lookup
skill: oma-scholar
domain: research
prompt: "Look up the entity knows:concept/attention-mechanism"
rubric: "Does the answer return the entity name, description, and at least one related concept?"
weight: 1
```

Повторите для ещё минимум трёх task. Затем запустите:

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```

---

## Чтение report

**Текстовый вывод:**

```
Skill utility eval  (skill: oma-scholar)
  tasks: 7
  isolation: enforced [codex]

  baseline: 42.9%  treatment: 71.4%
  utilityLift: 28.6%  (stddev: 14.3%)
  [PASS]
  Skill shows positive utility lift >= 5%.

  Per-task findings:
    claims-only: baseline=0 treatment=1 lift=+1.000
    entity-lookup: baseline=1 treatment=1 lift=+0.000
    ...

  Thresholds: fail <= 0%, warn < 5%
```

**JSON output** (через `--json`):

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "taskCount": 7,
  "coverage": "ok",
  "decision": "pass",
  "baselineScore": 0.4286,
  "treatmentScore": 0.7143,
  "utilityLift": 0.2857,
  "utilityStdDev": 0.1429,
  "findings": [
    { "taskId": "claims-only", "baseline": 0, "treatment": 1, "lift": 1.0 }
  ],
  "negativeTransfer": [],
  "isolation": "enforced",
  "isolationVendor": "codex"
}
```

`ok` равно `true` только при `coverage === "ok"` и `decision === "pass"`. Поле `isolation` показывает, действительно ли baseline arm работал без target skill (см. [изоляцию skill](#skill-isolation-keeping-the-baseline-honest)); `isolation` в режиме `--mock` равно `"n/a"`.

---

## Интеграция с CI

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

Коды выхода:
- `0` — pass или warn
- `1` — fail или недостаточное coverage с `--require-coverage`

---

## Выбор live или mock

Используйте `--live` с judge checker, чтобы измерить реальную полезность на открытых задачах. Используйте `--mock`, чтобы offline воспроизвести ранее записанные judge verdict или выполнить детерминированные contract check `assert`/`regex`.

Mock determinism сохраняется так: во время `--live --record` бинарный verdict judge (PASS/FAIL) записывается в rollout entry, а в последующих `--mock` запусках используется записанный score — LLM повторно не вызывается.

**Data egress:** во время `--live` judge dispatch передаёт output candidate arm настроенному vendor для оценки. В начале каждого live run печатается однократное предупреждение.

Если mock run сообщает недостаточное coverage, изучите warning об отброшенных или отсутствующих entry `_rollouts`, затем после исправления fixture или skill выполните live recording. Если isolation имеет статус `best-effort` или `unavailable`, выберите cwd-relative vendor, например Claude, Codex или Qwen, прежде чем считать lift надёжным сигналом.

---

## Поставка eval task вместе со skill

Skill может содержать набор eval task, если fixture размещены в `.agents/eval/<skill>/`. Это созданные пользователем файлы за пределами каталога skill, поэтому они сохраняются после `oma update`. Создавая новый skill с `oma-skill-creation`, добавьте соответствующий набор fixture в `eval/`, чтобы будущие авторы могли проверить эффект skill. Workflow авторинга описан в `.agents/skills/oma-skill-creation/SKILL.md`.
