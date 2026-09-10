---
title: "Руководство: Diagram Engine (archify)"
sidebar_label: Диаграммы
description: Как oh-my-agent выбирает между Mermaid и необязательным agent skill tt-a1i/archify для архитектурных, sequence и data-flow diagram — раздел diagram config, oma diagram resolve / oma diagram archify, использование в /architecture и /explain и цикл validate-repair-deliver без фиксированного лимита.
---

# Diagram Engine

`/architecture` (ADR, рекомендации, review) и `/explain` (explainers изменений кода) создают структурные диаграммы. Это всегда **Mermaid** blocks внутри Markdown-артефакта и — когда можно разрешить [archify](https://github.com/tt-a1i/archify), что является обычным случаем — дополнительно **interactive validated HTML diagram** рядом с артефактом: dark/light theme, pan-zoom, search, tracing отношений, PNG/SVG/WebM export, render из typed JSON spec.

Mermaid никуда не исчезает: это текстовый SSOT, живущий в Markdown и Git diff. archify — производный артефакт.

---

## Всегда последняя версия archify — ничего устанавливать не нужно

archify — agent skill под лицензией MIT (Node ≥ 18, без runtime dependencies). oh-my-agent не полагается на однажды установленную вами копию; он поддерживает **собственную управляемую копию** и отслеживает последний release:

- Cache: `~/.cache/oma-diagram/archify/<tag>/` плюс указатель `state.json`.
- Перед каждым использованием `oma diagram resolve` запрашивает у GitHub последний release tag (не чаще одного раза за `check_interval_min`, по умолчанию 60 min), загружает source tarball при появлении нового tag (atomic каталог на tag; старые tag очищаются), иначе использует cache copy.
- Сетевые ошибки никогда не критичны: используется cache copy и сообщается `stale` с причиной. Только первый запуск без сети и cache переключается на user-installed skill copy, а затем на Mermaid.

```bash
# Illustrative output; the release tag, cache path, and quality can vary.
oma diagram update          # force a check / download now
oma diagram resolve
# engine:   archify  (requested: auto)
# reason:   archify 2.15.0 via managed:v2.15.0 (current)
# root:     /Users/you/.cache/oma-diagram/archify/v2.15.0
# quality:  showcase
oma diagram resolve --offline   # never touch the network
```

Порядок разрешения (побеждает первое совпадение, одинаков во всех runtime вендоров):

1. `diagram.archify.path` в `oma-config.yaml` — явная pin, отключающая auto-latest.
2. Переменная окружения `ARCHIFY_HOME` — явная pin.
3. **Последняя управляемая версия** (`~/.cache/oma-diagram/archify`).
4. Каталоги skill, установленные пользователем: `.agents` / `.claude` / `.codex` / `.cursor` / `.qwen` / `.kiro` `/skills/archify` в проекте, затем те же пути под `~`, а также `~/.raven/workspace/skills/archify`.

<!-- oma-docs:ignore-start -->
Установка считается найденной, только если управляемая или закреплённая archify installation содержит `bin/archify.mjs`.
<!-- oma-docs:ignore-end -->

---

## Конфигурация

Неполный раздел в `.agents/oma-config.yaml` (отсутствующие keys используют показанные defaults):

```yaml
diagram:
  engine: auto                # auto | archify | mermaid
  explain_sidecar: false      # /explain also writes an archify sidecar
  archify:
    managed: true             # false = never download; use pins / skill dirs only
    channel: stable           # stable (latest GitHub Release) | main (HEAD of main)
    check_interval_min: 60    # minutes between remote checks; 0 = every call
    path: null                # explicit install dir (pin)
    quality: showcase         # showcase | standard  → --quality
    open: false               # pass --open to deliver
```

| `engine` | Поведение |
|---|---|
| `auto` (default) | archify, когда он разрешён (managed latest, pin или skill dir), иначе Mermaid |
| `archify` | Требовать archify. `oma diagram resolve` завершается с code 1, если ничего не разрешено (первый offline запуск); workflow останавливается вместо тихого downgrade |
| `mermaid` | Никогда не вызывать archify |

Prompt может переопределить config для одного запуска (`/explain 640 with archify`).

---

## CLI

```bash
oma diagram resolve [--engine auto|archify|mermaid] [--refresh] [--offline] [--json]
oma diagram update  [--json]
oma diagram archify <archify args…>
```

`oma diagram archify` запускает разрешённый исполняемый файл archify с `ARCHIFY_UPDATE_CHECK_DISABLED=1` (без сети) и передаёт exit code, поэтому `validate` / `deliver` / `visual-check` ведут себя ровно так, как описывает archify:

```bash
oma diagram archify guide "show the auth request lifecycle" --json
oma diagram archify validate architecture adr-auth.archify.json --quality showcase --json
oma diagram archify deliver  architecture adr-auth.archify.json adr-auth.archify.html --quality showcase --json
oma diagram archify visual-check adr-auth.archify.html --json   # exit 2 = no Chrome, reported as skipped
```

`--json` у `resolve` возвращает `{ ok, requested, engine, quality, open, explainSidecar, archify?: { root, bin, version, source, status?, note? }, reason, probed }` — `source` равен `managed:<tag>`, `config:…`, `env:…` или label skill-dir; `status` (`fresh` / `current` / `stale`) и `note` задаются для managed copies.

---

## Использование в workflow

Общий protocol находится в `.agents/skills/_shared/conditional/diagram-engine.md`. Оба workflow выполняют одну последовательность:

1. `oma diagram resolve --json`.
2. Сначала всегда напишите Mermaid block.
3. При `engine: archify`: переведите Mermaid topology в archify JSON IR (`architecture` / `sequence` / `dataflow` / `lifecycle` / `workflow`), читая из installation только соответствующую schema и один example.
4. `validate` → repair → `deliver`. **Фиксированного лимита итераций нет.** Agent продолжает repair, пока objective error count archify улучшается, и останавливается только по собственной convergence rule archify (два последовательных раунда без улучшения). Semantic labels никогда не удаляются только ради прохождения.
5. Свяжите HTML — никогда не встраивайте его.

### `/architecture`

Только для structural decisions (boundaries, dependencies, data flow). Output рядом с Markdown artifact в `.agents/results/architecture/`:

```
adr-notification-service.md            # Mermaid block + "Interactive:" link
adr-notification-service.archify.json  # frozen spec (kept even on failure)
adr-notification-service.archify.html  # delivered viewer
```

### `/explain`

Opt-in, поскольку собственный contract explainer (один self-contained file, theming через CSS variables) не позволяет встроить второй полный HTML document. Включите через `diagram.explain_sidecar: true` или попросите в prompt. Sidecar `{date}-{slug}.archify.html` создаётся из primary System/Data-Flow diagram explainer и подключается обычным `<a href>`; ошибка sidecar никогда не блокирует explainer.

---

## Режимы ошибок

| Ситуация | Результат |
|---|---|
| Проверка update не удалась (offline, rate-limited) | Используется cache copy и сообщается `stale` с причиной |
| Нет cache, network и skill dir при `engine: auto` | Только Mermaid; report предлагает один раз online выполнить `oma diagram update` |
| То же при `engine: archify` | Workflow останавливается (`ok: false`) с подсказкой `oma diagram update` |
| `validate` никогда не достигает convergence | Mermaid остаётся доставленной diagram; последний `.archify.json` оставляется человеку, diagnostics сообщаются verbatim |
| Нет Chrome для `visual-check` | Сообщается как `skipped`, никогда как pass |

---

## Связанные материалы

- [Объяснение кода](/docs/guide/code-explainer) — workflow `/explain`
- [Семантика oma-config.yaml](/docs/guide/oma-config-semantics)
- archify upstream: [tt-a1i/archify](https://github.com/tt-a1i/archify)
