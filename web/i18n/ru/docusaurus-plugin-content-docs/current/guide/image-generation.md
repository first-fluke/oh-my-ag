---
title: "Руководство: генерация изображений"
sidebar_label: Генерация изображений
description: "Полное руководство по генерации изображений в oh-my-agent: мультивендорная диспетчеризация через Codex (gpt-image-2), Pollinations (flux/zimage, бесплатно) и Antigravity через Gemini Code Assist, эталонные изображения, защита от перерасхода, структура вывода, устранение неполадок и общие паттерны вызова."
---

# Генерация изображений

`oma-image` — это мультивендорный маршрутизатор изображений для oh-my-agent. Он генерирует изображения из промптов на естественном языке, отправляет их в CLI того вендора, в котором вы аутентифицированы, и записывает рядом с результатом manifest с входными данными и решениями провайдера, необходимыми для аудита или повторения запуска. Результат работающего провайдера всё равно может отличаться.

Навык автоматически активируется по ключевым словам *image*, *illustration*, *visual asset*, *concept art* либо когда другому навыку требуется изображение как побочный результат (hero-кадр, миниатюра, продуктовое фото).

---

## Когда использовать

- Генерация изображений, иллюстраций, продуктовых фото, концепт-арта, hero- и landing-визуалов
- Сравнение одного промпта на нескольких моделях бок о бок (`--vendor all`)
- Создание ассетов внутри редакторского workflow (Claude Code, Codex, Gemini CLI)
- Вызов другим навыком (дизайн, маркетинг, документация) image-конвейера как общей инфраструктуры

## Когда НЕ использовать

- Редактирование или ретушь существующего изображения (вне зоны ответственности; используйте отдельный инструмент)
- Генерация видео или аудио (вне зоны ответственности)
- Inline SVG или векторная композиция из структурированных данных (используйте навык шаблонизации)
- Простое изменение размера или конвертация формата (используйте библиотеку для работы с изображениями, а не конвейер генерации)

---

## Краткий обзор вендоров

Навык построен по принципу CLI-first: если нативный CLI вендора может вернуть необработанные байты изображения, путь через подпроцесс предпочтительнее прямого API-ключа.

| Вендор | Стратегия | Модели | Триггер | Стоимость |
|---|---|---|---|---|
| `pollinations` | Прямой HTTP | Бесплатные: `flux`, `zimage`. По кредитам: `qwen-image`, `wan-image`, `gpt-image-2`, `klein`, `kontext`, `gptimage`, `gptimage-large` | Задана `POLLINATIONS_API_KEY` (бесплатная регистрация на https://enter.pollinations.ai) | Бесплатно для `flux` / `zimage` |
| `codex` | CLI-first через `codex exec` (ChatGPT OAuth) | `gpt-image-2` | `codex login` (API-ключ не нужен) | Списывается с тарифа ChatGPT |
| `antigravity` | CLI `agy` через подписку Gemini Code Assist | Модель выбирается самим `agy` | `agy` установлен и выполнен вход | За изображение отдельно не взимается плата через Code Assist |

Встроенный режим вендора — `auto`: он запускает провайдеры, прошедшие health checks. Модели Pollinations `flux` и `zimage` бесплатны за изображение, но всё равно требуют `POLLINATIONS_API_KEY`; Codex и Antigravity требуют собственного входа. Для платных оценок по-прежнему действует защита подтверждением стоимости.

---

## Быстрый старт

Перед первой генерацией проверьте, какой провайдер готов, и выполните вход одним из поддерживаемых способов:

```bash
oma image doctor

# Pollinations: create a free account and export its key.
export POLLINATIONS_API_KEY="<pollinations-key>"

# Or authenticate an alternative provider instead.
codex login
# Sign in to Gemini Code Assist for `agy` when using --vendor antigravity.
```

```bash
# Auto-selects the healthy provider; cost and auth depend on that provider.
oma image generate "minimalist sunrise over mountains"

# Run all configured vendors; every selected vendor must be healthy or the command stops.
oma image generate "cat astronaut" --vendor all

# Specific vendor + size + count, skip cost prompt
oma image generate "logo concept" --vendor codex --size 1024x1024 -n 3 -y

# Cost estimate without spending
oma image generate "test prompt" --dry-run

# Inspect authentication and install status per vendor
oma image doctor

# List registered vendors and supported models
oma image vendor list
```

`oma img` — это алиас для `oma image`.

---

## Использование как навык

`oma-image` — навык, который автоматически активируется из естественного языка и может вызываться явно. Доступны три точки входа.

### 1. Естественный язык (автоактивация)

В Claude Code, Codex CLI или Gemini CLI просто опишите изображение. Навык сопоставляет такие ключевые слова, как *image*, *illustration*, *visual asset*, *concept art*, *hero shot*, *thumbnail*, *product photo*.

Запоминать CLI-флаги не нужно. Опишите запрос обычными словами, и навык сопоставит его с нужными параметрами:

| Вы говорите | Навык выводит |
|---|---|
| "use codex" / "with gpt-image-2" / "free flux" | `--vendor codex` / `--vendor pollinations` |
| "compare across vendors" / "side by side" | `--vendor all` |
| "portrait" / "landscape" / "1024×1536" | `--size 1024x1536` / `--size 1536x1024` |
| "high quality" / "draft" | `--quality high` / `--quality low` |
| "three variations" / "give me 3" | `-n 3` |
| "save to ./hero" / "output to docs/assets" | `--output-dir <dir>` |
| Attached image + "make it nighttime" | `-r <attached path>` |
| "just estimate the cost" / "dry run" | `--dry-run` |

Примеры:

> "Generate a minimalist sunrise over mountains for the landing hero, landscape, high quality."
> "Compare a ceramic mug product photo across all vendors, three variations each."
> "Use codex to make this otter photo dramatic and nighttime." (с прикреплённым эталоном)

Агент выполняет [протокол уточнений](#clarification-protocol), при необходимости расширяет промпт и вызывает `oma image generate` с выведенными флагами. Используйте slash-команду, если нужен явный контроль над точными значениями флагов.

### 2. Явная slash-команда

```text
/oma-image a red apple on white background
/oma-image --vendor all --size 1536x1024 jeju coastline at sunset
/oma-image -n 3 --quality high --output-dir ./hero "minimalist dashboard hero illustration"
```

Каждый CLI-флаг (`--vendor`, `-n`, `--size`, `-r`, `--dry-run`, …) работает в slash-команде и передаётся в тот же конвейер `oma image generate`.

### 3. Из другого навыка (общая инфраструктура)

Другие навыки (дизайн, маркетинг, документация) вызывают конвейер как общую инфраструктуру с JSON-выводом:

```bash
oma image generate "<prompt>" --output json
```

Записываемый в stdout manifest содержит пути к результатам, вендора, модель и стоимость, поэтому его легко разобрать и использовать в цепочке.

---

## Справочник CLI

```bash
oma image generate "<prompt>"
  [--vendor auto|codex|pollinations|antigravity|all]
  [-n 1..5]
  [--size 1024x1024|1024x1536|1536x1024|auto]
  [--quality low|medium|high|auto]
  [--output-dir <dir>] [--allow-external-output]
  [-r <path>]...
  [--timeout 180] [-y] [--no-prompt-in-manifest]
  [--dry-run] [--output text|json]

oma image doctor
oma image vendor list
```

### Ключевые флаги

| Флаг | Назначение |
|---|---|
| `--vendor <name>` | `auto`, `pollinations`, `codex`, `antigravity` или `all`. В режиме `all` каждый запрошенный вендор должен быть исправен (строгий режим). |
| `-n, --count <n>` | Количество изображений на вендора: 1–5 (ограничение wall-time). |
| `--size <size>` | Соотношение сторон: `1024x1024` (квадрат), `1024x1536` (портрет), `1536x1024` (пейзаж) или `auto`. |
| `--quality <level>` | `low`, `medium`, `high` или `auto` (значение по умолчанию вендора). |
| `--output-dir <dir>` | Каталог вывода. По умолчанию `.agents/results/images/{timestamp}/`. Для путей за пределами `$PWD` требуется `--allow-external-output`. |
| `--allow-external-output` | Разрешает каталог вывода за пределами `$PWD`. |
| `--model <name>` | Переопределяет модель выбранного вендора для этого запуска. `antigravity` игнорирует этот параметр, поскольку модель выбирает `agy`. |
| `-r, --reference <path>` | До 10 эталонных изображений (PNG/JPEG/GIF/WebP, ≤ 5 МБ каждое). Можно повторять флаг или передать пути через запятую. Поддерживается в `codex` и `antigravity`, отклоняется в `pollinations`. |
| `-y, --yes` | Пропускает подтверждение стоимости для запусков с оценкой ≥ `$0.20`. Также доступно через `OMA_IMAGE_YES=1`. |
| `--no-prompt-in-manifest` | Записывает в `manifest.json` SHA-256 промпта вместо исходного текста. |
| `--dry-run` | Печатает план и оценку стоимости без расходов. |
| `--output text\|json` | Формат вывода CLI. JSON — точка интеграции для других навыков. |
| `--timeout <duration>` | Тайм-аут для каждого изображения. |

---

## Эталонные изображения

Прикрепите до 10 эталонных изображений, чтобы задать стиль, идентичность объекта или композицию.

```bash
oma image generate -r ~/Downloads/otter.jpeg "same otter in dramatic lighting" --vendor codex
oma image generate -r a.png -r b.png "blend these styles" --vendor antigravity
oma image generate -r a.png,b.png "blend these styles" --vendor antigravity
```

| Вендор | Поддержка эталонов | Как это работает |
|---|---|---|
| `codex` (gpt-image-2) | Да | Передаёт `-i <path>` в `codex exec` |
| `antigravity` | Да | Копирует эталоны в каталог отдельного запуска и даёт `agy` доступ к ним |
| `pollinations` | Нет | Отклоняет запрос с кодом выхода 4 (нужен хостинг по URL) |

### Где находятся прикреплённые изображения

- **Claude Code**: `~/.claude/image-cache/<session>/N.png`, отображаются в системных сообщениях как `[Image: source: <path>]`. Они привязаны к сессии; если изображение понадобится снова, скопируйте его в постоянное место.
- **Antigravity**: каталог загрузок workspace (точный путь показывает IDE)
- **Codex CLI как хост**: путь нужно передать явно; вложения из диалога не перенаправляются автоматически

Когда пользователь прикрепляет изображение и просит сгенерировать или отредактировать результат на его основе, вызывающий агент **обязан** передать его через `--reference <path>`, а не описывать изображение словами. Если локальный CLI слишком старый и не поддерживает `--reference`, выполните `oma update` и повторите попытку.

---

## Структура вывода

Каждый запуск записывается в `.agents/results/images/` в каталог с временной меткой и hash-суффиксом:

```
.agents/results/images/
├── 20260424-143052-ab12cd/                 # single-vendor run
│   ├── pollinations-flux.jpg
│   └── manifest.json
└── 20260424-143122-7z9kqw-compare/         # --vendor all run
    ├── codex-gpt-image-2.png
    ├── pollinations-flux.jpg
    └── manifest.json
```

`manifest.json` сохраняет вендора, модель, промпт (или его SHA-256), размер, качество и стоимость, поэтому запрос можно проверить и повторить. Он не гарантирует одинаковые пиксели при работе с живым провайдером.

---

## Стоимость, безопасность и отмена

1. **Защита от расходов:** для запусков с оценкой ≥ `$0.20` запрашивается подтверждение. Обойти его можно через `-y` или `OMA_IMAGE_YES=1`. Встроенный `pollinations` (`flux`/`zimage`) бесплатен, поэтому для него запрос автоматически пропускается.
2. **Безопасность путей:** для путей за пределами `$PWD` требуется `--allow-external-output`, чтобы избежать неожиданных записей.
3. **Отмена:** `Ctrl+C` (SIGINT/SIGTERM) прерывает все текущие вызовы провайдеров и оркестратор.
4. **Стабильная запись запуска:** `manifest.json` всегда записывается рядом с изображениями.
5. **Максимум `n` = 5:** это ограничение времени выполнения, а не квоты.
6. **Коды выхода:** соответствуют `oma search fetch`: `0` — ok, `1` — general, `2` — safety, `3` — not-found, `4` — invalid-input, `5` — auth-required, `6` — timeout.

---

## Протокол уточнений {#clarification-protocol}

Перед вызовом `oma image generate` вызывающий агент проходит этот чек-лист. Если чего-то не хватает и это нельзя вывести из контекста, он сначала задаёт вопрос либо расширяет промпт и показывает расширение для подтверждения.

**Обязательно:**
- **Субъект:** что является главным объектом изображения? (предмет, человек, сцена)
- **Окружение / фон:** где это происходит?

**Настоятельно рекомендуется (спросить, если отсутствует и не выводится из контекста):**
- **Стиль:** фотореализм, иллюстрация, 3D-рендер, масляная живопись, концепт-арт, плоский вектор?
- **Настроение / освещение:** яркое или мрачное, тёплое или холодное, драматичное или минималистичное
- **Контекст использования:** hero-изображение, иконка, миниатюра, продуктовый кадр, постер?
- **Соотношение сторон:** квадрат, портрет или пейзаж

Для короткого промпта вроде *"a red apple"* агент **не** задаёт дополнительных вопросов. Вместо этого он расширяет запрос inline и показывает пользователю:

> User: "a red apple"
> Agent: "I'll generate this as: *a single glossy red apple centered on a clean white background, soft studio lighting, photorealistic, shallow depth of field, 1024×1024*. Shall I proceed, or would you like a different style/composition?"

Если пользователь сам составил полный творческий бриф (≥ 2 из: субъект + стиль + освещение + композиция), его промпт сохраняется дословно: без уточнений и расширения.

**Язык вывода.** Промпты для генерации отправляются провайдеру на английском (модели изображений в основном обучены на англоязычных подписях). Если пользователь написал на другом языке, агент переводит промпт и показывает перевод при расширении, чтобы пользователь мог исправить неверное толкование.

---

## Конфигурация

- **Конфигурация проекта:** секция `image:` в `.agents/oma-config.yaml`. Устаревший `config/image-config.yaml` больше не читается.
- **Переменные окружения:**
  - `OMA_IMAGE_DEFAULT_VENDOR`: переопределяет вендора по умолчанию (иначе `pollinations`)
  - `OMA_IMAGE_DEFAULT_OUT`: переопределяет каталог вывода по умолчанию
  - `OMA_IMAGE_YES`: `1`, чтобы обходить подтверждение стоимости
  - `POLLINATIONS_API_KEY`: требуется для вендора pollinations (бесплатная регистрация)

---

## Устранение неполадок

| Симптом | Вероятная причина | Решение |
|---|---|---|
| Код выхода `5` (auth-required) | Выбранный вендор не аутентифицирован | Запустите `oma image doctor`, чтобы узнать, какому вендору нужен вход. Затем выполните `codex login`, войдите в `agy` или задайте `POLLINATIONS_API_KEY`. |
| Код выхода `4` для `--reference` | `pollinations` отклоняет эталоны либо файл слишком большой или имеет неверный формат | Переключитесь на `--vendor codex` или `--vendor antigravity`. Каждый эталон должен быть размером ≤ 5 МБ и иметь формат PNG/JPEG/GIF/WebP. |
| `--reference` не распознаётся | Локальный CLI устарел | Выполните `oma update` и повторите попытку. Не заменяйте эталон словесным описанием. |
| Подтверждение стоимости блокирует автоматизацию | Оценка запуска составляет ≥ `$0.20` | Передайте `-y` или установите `OMA_IMAGE_YES=1`. Лучше переключиться на бесплатный `pollinations`. |
| `--vendor all` сразу прерывается | Один из запрошенных вендоров неисправен (строгий режим) | Установите и авторизуйте отсутствующего вендора либо выберите конкретный `--vendor`. |
| Результат записан в неожиданный каталог | По умолчанию используется `.agents/results/images/{timestamp}/` | Передайте `--output-dir <dir>`. Для путей за пределами `$PWD` нужен `--allow-external-output`. |
| Antigravity не работает после успешной health check | `agy --version` доказывает установку, но не вход в аккаунт | Войдите в Gemini Code Assist, затем повторите `oma image doctor` и запуск с `--vendor antigravity`. |

---

## Связанные материалы

- [Навыки](/docs/core-concepts/skills): двухуровневая архитектура навыков, на которой работает `oma-image`
- [Команды CLI](/docs/cli-interfaces/commands): полная справка по команде `oma image`
- [Опции CLI](/docs/cli-interfaces/options): общая матрица опций
