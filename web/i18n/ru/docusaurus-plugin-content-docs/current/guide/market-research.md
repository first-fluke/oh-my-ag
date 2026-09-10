---
title: "Руководство: исследование рынка (engine last30days)"
sidebar_label: Исследование рынка
description: Как skill oma-market проводит исследование социальных сигналов через upstream engine mvanhorn/last30days, автоматически поддерживаемый на последнем release, с разделом market config, oma market resolve / update / run, gate detect-trap, сопоставлением intent с framework и режимами ошибок.
---

# Исследование рынка

`oma-market` отвечает на вопрос «что люди на самом деле говорят о X за последние N дней» — о проблемах, трендах, отношении к конкурентам и поиске новых возможностей — используя социальные источники с реальными показателями вовлечённости: Reddit (upvotes и лучшие comments), X, YouTube transcripts, TikTok, Instagram, Hacker News, Polymarket, GitHub, arXiv, Techmeme, Digg, LinkedIn, StockTwits, Bluesky, web и другие.

Само исследование выполняется через upstream engine [**last30days**](https://github.com/mvanhorn/last30days-skill) (MIT, Python 3.12+). oh-my-agent не создаёт его fork: он поддерживает **собственную управляемую копию последнего release**, защищает каждый запуск gate и добавляет слой стратегических framework. Частота release, число stars и покрытие provider принадлежат upstream project и могут меняться.

---

## Всегда последняя версия engine — ничего не устанавливать

```bash
# Illustrative output; the release tag, cache path, and Python version vary.
oma market resolve
# engine:   last30days
# reason:   last30days 3.21.1 via managed:v3.21.1 (current)
# root:     ~/.cache/oma-market/last30days/v3.21.1
# skill:    ~/.cache/oma-market/last30days/v3.21.1/SKILL.md
# python:   python3.14 (3.14.7, PATH)
# save_dir: <workspace>/.agents/results/market/raw
```

- Кэш: `~/.cache/oma-market/last30days/<tag>/` плюс `state.json`.
- Перед каждым использованием `resolve` запрашивает у GitHub последний release (не чаще одного раза за `check_interval_min`, по умолчанию каждые 60 min), загружает новый tag в собственный каталог (старые tag удаляются), иначе использует cache. Сетевые ошибки повторно используют cache и сообщают `stale`.
- Python: `LAST30DAYS_PYTHON` → `market.python` → `python3.14 … python3` в PATH (должен быть ≥ 3.12) → `uv python find '>=3.12'`. Если interpreter отсутствует, `resolve` недействителен и печатает подсказку установки; skill останавливается, а не заменяет исследование одним web search.
- Конфигурация engine и API key находится в `~/.config/last30days/` (upstream wizard записывает их с согласия пользователя), поэтому переживает обновления engine.

Порядок разрешения (побеждает первое совпадение): `market.path` → `LAST30DAYS_HOME` → **последний управляемый release** → пользовательские копии (`.agents|.claude|.codex|.cursor|.qwen|.kiro/skills/last30days` в проекте и под `~`, затем plugin cache Claude Code).

```bash
oma market update            # force a check / download now
oma market resolve --offline # never touch the network
oma market run --help        # the engine's own flags
```

---

## Конфигурация

```yaml
market:
  managed: true                   # false = never download; pins / skill dirs only
  channel: stable                 # stable (latest Release) | main (HEAD)
  check_interval_min: 60          # 0 = check on every call
  path: null                      # explicit engine dir (pin)
  python: null                    # interpreter override
  save_dir: .agents/results/market/raw
```

---

## Как работает запуск

1. `oma market detect-trap "<topic>"` — отклоняет темы-ловушки по ключевым словам или демографические покупки (exit code 2) и предлагает переформулировку.
2. `oma market resolve --json` — engine и Python; останавливается при `ok: false`.
3. Agent полностью читает `SKILL.md` разрешённого engine и следует ему: wizard первоначальной настройки, разрешение handle / subreddit / hashtag до исследования (если доступен WebSearch), планирование query и preflight gate.
4. `oma market run "<topic>" <flags> --emit=compact` — те же аргументы, что и upstream-вызов `python3 scripts/last30days.py`; `--save-dir` добавляется из `market.save_dir`.
5. Синтез следует upstream OUTPUT CONTRACT (badge в первой строке, упорядоченные evidence clusters, LAWs 1–8), затем oma добавляет разделы framework, ссылающиеся только на clusters engine:

| Intent | Формирование engine | Framework |
|---|---|---|
| pain | topic оформляется как complaint, `--days 30`, `--deep` при малом объёме данных | SWOT |
| trend | `--days 7/30/90/180`, `--discover "<domain>"` для «что сейчас в топе» | SWOT |
| competitor | `"A vs B"` → upstream comparison flow | SWOT + Porter’s 5F |
| discovery | `--discover`, затем дополнительные `--drill` | SWOT + PESTEL |

6. Выполните self-check, затем сохраните `.agents/results/market/{topic-slug}-{YYYYMMDD}.md`.

---

## Режимы ошибок

| Ситуация | Результат |
|---|---|
| Topic отклонён detect-trap | Показывается переформулировка; engine не запускается. `--force` допустим только после явного повторного подтверждения пользователя |
| Нет engine в кэше и включён offline mode | `ok: false` → один раз online выполните `oma market update` |
| Нет Python 3.12+ | `ok: false` с подсказкой установки (brew / apt / `uv python install 3.12`); заменять это одним web search нельзя |
| Проверка release не удалась | Используется engine из cache со статусом `stale` |
| У источника нет key | Источник пропускается внутри engine и указывается в footer; включите его через upstream configuration wizard |

---

## Связанные материалы

- [Diagram Engine](/docs/guide/diagram-engine) — тот же паттерн управляемого последнего release для archify
- [Семантика oma-config.yaml](/docs/guide/oma-config-semantics)
- Upstream: [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)
