---
title: "Оптимизация skill"
sidebar_label: Оптимизация skill
description: Используйте oma skill optimize для постоянного развития skill на основе evidence с детерминированными gate train, validation и holdout, которым владеет runner.
---

# Оптимизация skill

`oma skill optimize` развивает `SKILL.md`, чтобы максимизировать измеренный `utilityLift`, который выдаёт `oma skill eval`. Команда разделяет evidence rollout, постоянные scoped knowledge и исполняемый skill. Wiki Maintainer объединяет наблюдаемые успехи и ошибки; Proposer создаёт ограниченные add/delete/replace edits на основе этих знаний. Candidate должен улучшить utility на отложенной validation, а `--apply` дополнительно требует улучшения на holdout split, которым владеет runner. При deployment дополнительного wiki lookup во время inference нет: результатом остаётся `SKILL.md`.

Основа исследования: Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C., & Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## Жёсткая зависимость: fixture evaluation

`oma skill optimize` не работает без eval task fixtures. Требуется минимум **5 task fixture** (`MIN_TASKS = 5`) в `.agents/eval/<skill>/`. Если найдено меньше, команда немедленно завершится ошибкой:

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

См. [руководство Skill Utility Eval](/docs/guide/skill-eval): соглашение о каталоге `.agents/eval/<skill>/`, схему fixture, типы checker и подготовку rollout для mock replay.

---

## Как это работает

Fixture сортируются по ID задачи и детерминированно делятся на наборы **train**, **held-out validation** и **runner-owned final-test**. При наличии минимум пяти fixture целевые пропорции равны 60/20/20, при этом в каждом разделе есть хотя бы одна задача. Задачи final-test берутся из этого локального набора fixture; во время цикла они скрыты от Maintainer и Proposer, а не загружаются из внешнего hidden suite.

Для каждой epoch (до `--max-epochs`, по умолчанию 8):

1. **Оценка текущего лучшего `SKILL.md` на TRAIN split** — `oma skill eval` возвращает наблюдаемые prompt по task, output и lift.
2. **Wiki Maintainer объединяет evidence** — до пяти ошибок и трёх успехов становятся evidence-linked pattern. Scoped pattern и результаты предыдущих gate извлекаются из memory system OMA L1/L2/L3.
3. **Proposer создаёт K candidate edits** (до `--edits-per-epoch`, по умолчанию 4). Точные edits, уже находящиеся в persistent rejection history, пропускаются.
4. **Для каждого candidate edit:**
   - применить edit к находящейся в памяти копии `SKILL.md`;
   - проверить candidate (`name`/`description` frontmatter должны сохраниться; body должен разобрать parser);
   - применить textual learning-rate budget: отбросить edit, если чистое изменение символов превышает `--lr` (по умолчанию 600 символов);
   - повторно оценить candidate на **held-out validation split**.
5. **Принять лучший validation candidate тогда и только тогда, когда** lift validation строго улучшился (`Δlift > 0`) **и** ни одна negative-transfer запись не нарушает regression floor (`NEG_TRANSFER_FAIL = -0.1`). Каждый proposal gate сохраняется.
6. **Остановиться досрочно** после 2 последовательных epoch без принятого edit (`OPT_EARLY_STOP_PATIENCE = 2`).
7. **Выполнить final test, которым владеет runner, после evolution.** Maintainer и Proposer не видят эти task в цикле. Неудачный final test запрещает `--apply` и записывает validation winner как rejected knowledge.

Optimizer не изменяет живой `SKILL.md` во время цикла — он всегда работает с находящейся в памяти копией candidate.

---

## Использование

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### Флаги

| Флаг | По умолчанию | Описание |
|:-----|:--------|:-----------|
| `--skill <id>` | `_all` | ID skill для оптимизации (простое имя, без разделителей пути). |
| `--dry-run` | **yes (default)** | Предлагать edits и печатать diff без изменения `SKILL.md`; созданные evidence и evolution events всё равно сохраняются. |
| `--apply` | — | Применять принятые edits к `SKILL.md` — сначала сохранять исходный файл, затем выполнять atomic write. Запускается только после успешных gate validation и runner-owned final-test; для принадлежащего OMA skill также требует `--yes`. |
| `--mock` | **yes (default)** | Воспроизводить записанные edits optimizer и eval verdict из `_rollouts/`. Детерминированно, offline, безопасно для CI. |
| `--live` | — | Live LLM dispatch optimizer — реальные model calls для каждой epoch. Печатает cost preview и запрашивает подтверждение, если нет `--yes`. |
| `--max-epochs <n>` | `8` | Максимальное число epoch оптимизации. |
| `--edits-per-epoch <k>` | `4` | Число candidate edit, предлагаемых LLM optimizer для epoch. |
| `--lr <chars>` | `600` | Textual learning-rate budget: максимальное чистое изменение символов для принятого edit. |
| `--yes` | — | Пропустить подтверждение cost preview. Имеет значение только с `--live`. |
| `--json` | — | Выводить JSON для CI/CD. |
| `--output <format>` | `text` | Формат вывода (`text` или `json`). |

---

## Минимальный сквозной пример

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

Пример результата:

```
[oma skill opt] skill: oma-scholar, tasks: 8 (train: 4, val: 4), dry-run: true

Skill opt  (skill: oma-scholar)
  applied: false
  baselineLift: 18.5%  finalLift: 32.0%
  epochs: 3  acceptedEdits: 2  rejected: 6

  diff:
--- a/SKILL.md
+++ b/SKILL.md
@@ -12,6 +12,9 @@
 ### When to use
 - User asks to look up an academic paper or technical claim.
+- User asks for a summary of arxiv abstracts or DOI-linked documents.
 - User wants citations or sources for a factual statement.
```

Diff показывает, что optimizer записал бы. `SKILL.md` не меняется, а созданные evolution evidence и scoped gate outcomes сохраняются для будущих запусков.

---

## Применение проверенного улучшения

Когда предложенный diff вас устраивает, повторите запуск с `--apply`:

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

`--apply` записывает изменения только при строго положительном улучшении validation и когда candidate lift runner-owned final-test больше baseline lift. Перед atomic write создаётся backup исходного `SKILL.md`. Diff всегда печатается для проверки.

---

## Live mode

Live mode вызывает настоящие Maintainer и Proposer и повторно выполняет live eval arm для каждой epoch. Это дорого: каждая оцениваемая task требует baseline и treatment calls, judge fixture добавляют grading calls, а final test оценивает исходное и candidate body. Preview показывает верхнюю границу model call из фактического split. Каждый call имеет timeout 120 секунд; eval arm Claude запускаются с ограниченными ambient tools, skills, MCP и AgentMemory.

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

Cost preview перечисляет верхнюю границу model call до любого LLM call.

---

## JSON output

```bash
oma skill optimize --skill oma-scholar --json
```

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "baselineLift": 0.1850,
  "finalLift": 0.3200,
  "epochCount": 3,
  "acceptedEdits": [
    { "op": "add", "anchor": "### When to use", "after": "\n- User asks for a summary of arxiv abstracts or DOI-linked documents." }
  ],
  "rejectedCount": 6,
  "applied": false,
  "diff": "--- a/SKILL.md\n+++ b/SKILL.md\n...",
  "_dryRun": true,
  "finalTest": { "baselineLift": 0.10, "candidateLift": 0.25, "passed": true },
  "_split": { "trainCount": 4, "valCount": 1, "testCount": 3 }
}
```

`ok` равно `true` только когда candidate улучшает validation и runner-owned final test не провален (или candidate был применён). Счётчики `_split` показывают фактическое разбиение локальных fixture.

---

## SSOT caveat для `oma-*` skills

Skills с ID, начинающимся с `oma-`, принадлежат oh-my-agent и перезаписываются `oma update`. Для этих skill `--apply` не рекомендуется — используйте `--dry-run` (значение по умолчанию), проверьте предложенный diff и отправьте значимое изменение в registry. Для пользовательских skill `--apply` безопасен.

Команда печатает предупреждение, если target skill принадлежит OMA:

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

---

## Защита от переобучения

Maintainer и Proposer видят только evidence rollout TRAIN. Выбор candidate использует отложенный VALIDATION split, а TEST split runner-owned остаётся недоступным до конца evolution. Validation winner, который не улучшил final test, не применяется и добавляется в постоянную историю отклонений.

---

## Интеграция с CI

В `--mock` mode `oma skill optimize` полностью детерминирован и работает offline — LLM не вызывается. Используйте его в CI, чтобы проверить, что предлагаемый diff по-прежнему показывает lift относительно записанных rollout:

```bash
oma skill optimize --skill oma-scholar --mock --json
```

Коды выхода:
- `0` — optimization завершена (с улучшением или без него)
- `1` — меньше `MIN_TASKS` fixture или недопустимый аргумент `--skill`

---

## См. также

- [Skill Utility Eval](/docs/guide/skill-eval) — создание task fixture, типы checker, mock/live mode и каталог `_rollouts/`.
- [CLI Commands](/docs/cli-interfaces/commands) — справочник flags всех команд управления skill.
