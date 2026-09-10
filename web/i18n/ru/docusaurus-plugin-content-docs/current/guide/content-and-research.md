---
title: "Руководство: workflow контента и исследований"
sidebar_label: Обзор
description: Выберите правильный путь oh-my-agent для извлечения PDF и HWP, работы с голосом, научных исследований, слайдов, recap, перевода и академического письма.
---

# Workflow контента и исследований

Это руководство направляет работу с документами, аудио, исследованиями и презентациями к соответствующей возможности. Начните с нужного артефакта, затем используйте минимальную команду или точку входа skill, создающую результат для review.

| Задача | Точка входа | Первый результат |
|---|---|---|
| Извлечь PDF | skill `oma-pdf` или команды `uvx opendataloader-pdf` ниже | Markdown, text, JSON или краткий отчёт об извлечении |
| Извлечь HWP/HWPX/HWPML | skill `oma-hwp` и `bunx kordoc@latest` | Markdown или структурированный JSON/chunks |
| Озвучить или транскрибировать аудио | `/oma-voice` | Аудио с manifest или `transcript.md` с manifest |
| Найти и проверить статьи | `oma scholar` | Результаты поиска, полученный sidecar или lint report |
| Создать презентацию | skill `oma-slide` и `oma slide` | Проверенные HTML-слайды и необязательный экспорт |
| Суммировать разговоры агентов | `oma recap` | Датированный Markdown recap со статусом evidence |
| Перевести или проверить локализованный текст | skill `oma-translation` | Текст на целевом языке или review с evidence |
| Создать или проверить академическую прозу | skill `oma-academic-writing` | Draft, revision или compliance report с Claim-Evidence Map |

Имена команд `oma` на этой странице — зарегистрированные публичные команды. `uvx`, `bunx` и `bun` — внешние инструменты конвертации, описанные в соответствующих skills. Остальные skills вызываются естественным языком или slash-командами; отдельных команд `oma pdf`, `oma hwp`, `oma voice`, `oma translation` или `oma academic-writing` нет.

## Извлечение PDF {#extract-pdf-content}

Используйте skill `oma-pdf`, когда вход — PDF, а результат должен иметь читаемую структуру для человека, LLM или retrieval pipeline. Skill сначала проверяет текстовый слой, затем выбирает standard, tagged или hybrid OCR extraction.

Для быстрой проверки текстового слоя выведите небольшой диапазон страниц, не создавая файл результата:

```bash
uvx opendataloader-pdf "<input.pdf>" -f text --pages 1-3 --to-stdout -q
```

Для извлечения и нормализации Markdown:

```bash
OUT=".agents/results/pdf/<document>"
uvx opendataloader-pdf "<input.pdf>" --format markdown --output-dir "$OUT"
uvx mdformat "$OUT/<document>.md"
```

Для большого документа выбирайте диапазон с `--pages`. Если текстовый слой читаем, оставайтесь на standard extraction. Если структурированные теги есть, но порядок чтения плохой, повторите с `--use-struct-tree`; для повреждённых таблиц попробуйте `--table-method cluster` или `--markdown-with-html` перед переходом к OCR.

Для отсканированного или основанного на изображениях PDF сначала запустите hybrid server, затем hybrid converter:

```bash
# Terminal 1: leave this local server running while the conversion runs.
uvx --from "opendataloader-pdf[hybrid]" opendataloader-pdf-hybrid \
  --port 5002 --force-ocr --ocr-lang "ko,en"
```

Во втором терминале задайте каталог вывода и запустите converter:

```bash
OUT=".agents/results/pdf/<document>"
uvx opendataloader-pdf --hybrid docling-fast --hybrid-mode full \
  "<input.pdf>" --format markdown --output-dir "$OUT"
```

Успешный артефакт — Markdown или текстовый файл в выбранном каталоге вывода с количеством страниц и заметками о качестве. Для зашифрованных PDF нужна разблокированная копия или пароль. Большим файлам могут потребоваться отдельные диапазоны страниц и каталоги вывода, чтобы повторные запуски не перезаписывали одно и то же базовое имя. Не считайте догадки OCR фактами источника; отмечайте неопределённые или отсутствующие таблицы.

## Извлечение документов семейства HWP {#extract-hwp-family-documents}

Используйте `oma-hwp` для файлов `.hwp`, `.hwpx` и `.hwpml`. Skill запускает `kordoc` через Bun, затем при необходимости обрабатывает таблицы Markdown и глифы из Private Use Area.

```bash
OUT=".agents/results/hwp/<document>.md"
bunx kordoc@latest "<input.hwp>" -o "$OUT"

# The skill's cleanup helper; set this to the project or global oma-hwp skill directory.
HWP_SKILL_DIR=".agents/skills/oma-hwp"
bun "$HWP_SKILL_DIR/resources/flatten-tables.ts" "$OUT"
```

В новом clone helper может сообщить `Cannot find module "turndown"`; выполните `bun install` в каталоге `resources/` skill `oma-hwp`, затем запустите helper снова.

Для batch используйте явный каталог вывода:

```bash
bunx kordoc@latest "./incoming/*.hwpx" -d ".agents/results/hwp"
```

По умолчанию результатом является Markdown. Запросите `json` для структурированного AST или `chunks` для фрагментов, ориентированных на retrieval, когда это необходимо. Параметры конвертации `--dedupe-headers`, `--keep-empty-cols` и `--inline-images` управляют распространёнными случаями таблиц и изображений. Перед передачей результата другому skill проверьте заголовки, вложенные или объединённые таблицы, списки, изображения, сноски и ссылки.

`bun` и `bunx` — обязательные зависимости. Пустой результат может означать отсканированное содержимое; направьте такой случай в workflow с поддержкой OCR. Зашифрованный или ограниченный DRM материал может остаться неполным. PDF, DOCX и XLSX относятся к соответствующим skills, хотя у `kordoc` есть и другие команды authoring и parsing.

## Генерация речи и транскрибация audio {#generate-speech-or-transcribe-audio}

`oma-voice` — MCP-native skill, использующий локальный сервер Voicebox. Вызывайте его в агенте через slash-команду:

```text
/oma-voice "The build is ready for review."
/oma-voice --profile prof_warm_korean "다음 단계 진행 준비됐어요"
/oma-voice transcribe ~/Downloads/standup.m4a
```

TTS принимает до 5 000 символов за вызов и требует голосового профиля Voicebox. Для transcription профиль TTS не нужен; принимается аудио длительностью до 30 минут. Сохранённые операции TTS и STT записываются в `.agents/results/voice/`; transcription создаёт `transcript.md` и `manifest.json`. В режиме уведомлений результат обычно остаётся в Voicebox Captures и локальный аудиофайл не записывается.

Локальная конечная точка MCP — `http://127.0.0.1:17493/mcp`. Первый setup регистрирует Voicebox в агенте, а desktop app Voicebox предоставляет голосовые профили. Skill узнаёт настоящие имена MCP-инструментов через `tools/list`, затем вызывает `voicebox_speak`, `voicebox_transcribe` или `voicebox_list_profiles`. Если у TTS нет профиля, создайте или выберите его в Voicebox; разбиение слишком длинного запроса — решение пользователя, потому что skill не делит его автоматически. Если сервер недоступен, проверьте локальную health endpoint и перезапустите Voicebox перед повтором.

## Поиск и проверка научных материалов {#search-and-validate-scholarly-material}

Используйте CLI `oma scholar` для Knows sidecar и метаданных статей. Search и resolve — операции поиска; `get` получает record или выбранный раздел; `lint` — проверка перед публикацией.

```bash
oma scholar search "vision language action" --limit 10
oma scholar search --year-min 2024 "vision language action"
oma scholar resolve "Attention Is All You Need"
oma scholar get "10.48550/arXiv.1706.03762"
oma scholar get --section statements "knows:generated/reconvla/1.0.0"
oma scholar lint paper.knows.yaml
oma scholar lint --lenient paper.knows.yaml
oma scholar lint --fail-on-warning paper.knows.yaml
```

Сначала используется Knows, затем fallback OpenAlex и Semantic Scholar. С помощью `--section` можно запросить `statements`, `evidence`, `relations`, `artifacts` или `citation`. Используйте `--lenient`, когда dangling cross-record references ожидаемы при локальной сборке; для строгой проверки CI используйте `--fail-on-warning`. Результат поиска или полученный sidecar — это evidence для поиска, а не утверждение, что статья подтверждает каждый вывод. Создайте или исправьте sidecar в агенте, затем выполните `oma scholar lint` перед публикацией.

Если удалённый сервис завершается по timeout, повторите более широкий запрос или разрешите fallback CLI. Ответ 429 от Semantic Scholar может означать лимит anonymous pool; повторите позже или задайте его API key. При ошибке provenance enum в sidecar используйте `tool`, `person` или `org`; если остаются предупреждения relation-density, добавляйте supported evidence relations только там, где их подтверждает источник.

## Слайды и презентации {#slides-and-presentations}

Используйте `oma-slide`, когда результатом должна быть презентация на фиксированной сцене. Authoring skill записывает HTML-фрагменты размером 1920×1080; CLI проверяет геометрию, собирает deck и экспортирует его.

```bash
DECK_DIR=".agents/results/slides/<session-id>"
oma slide create --output-dir "$DECK_DIR"
# author slide-01.html and meta.json in "$DECK_DIR"
oma slide validate --workspace "$DECK_DIR" --output json
oma slide preview --workspace "$DECK_DIR"
oma slide bundle --workspace "$DECK_DIR"
```

Экспортируйте только после validation:

```bash
oma slide export pdf --workspace "$DECK_DIR" --output-file "$DECK_DIR/out/deck.pdf" --mode capture
oma slide export png --workspace "$DECK_DIR" --output-dir "$DECK_DIR/out/png" --resolution 1080p
oma slide export pptx --workspace "$DECK_DIR" --output-file "$DECK_DIR/out/deck.pptx"
```

Используйте `--slide <file>` для проверки одного слайда и `--report-file <path>` с JSON output, когда найденные проблемы нужны другому процессу. `slide import pptx <file>` начинает import workflow; `slide asset fetch-video <url>` скачивает video asset; `slide style list|preview|get <slug>` изучает стили. PPTX output основан на растре и не предоставляет редактируемые текстовые или графические слои. Validation и export требуют Chrome/puppeteer; задайте `OMA_CHROME_PATH`, если executable не найден. Если validation не сходится после трёх auto-fix итераций, по geometry findings исправьте затронутый fragment.

## Recap разговоров агентов

Используйте `oma recap` для сводки работы на основе evidence. Календарная дата и скользящее окно — разные виды входных данных:

```bash
# A calendar day
oma recap --date "$(date +%F)" --json

# A rolling 24-hour window ending now
oma recap --json

# A rolling multi-day window, capped at 30 days
oma recap --window 7d --tool claude,codex --json
```

Результат сохраняется в `.agents/results/recap/`, обычно как `{date}.md` для дневной сводки или `{start-date}~{end-date}.md` для диапазона. Recap группирует работу по содержанию, отдельно отмечает requested и in-progress work среди completed work и фиксирует отсутствующую историю tools. Используйте `--top`, `--sort`, `--mermaid` или `--graph`, когда отчёту нужен более узкий или визуальный вид. Если CLI недоступен, skill может использовать документированный fallback истории Claude, но необходимо указать меньший охват источника.

Используйте `oma retro` для инженерной retrospective на основе Git. Она отвечает на другой вопрос, чем conversation recap, и может сравнивать соседние окна через `--compare`.

## Перевод и review локализованного контента

Для строк интерфейса, документации, отчётов, маркетингового текста или академической прозы используйте `oma-translation`. Вызывайте skill естественным языком или через `/oma-translation`; публичной команды `oma translation` нет.

Передайте skill исходный текст, целевую локаль, тип содержимого и режим: translation, review или source-diff synchronization. Skill загружает подходящий language profile, если он есть, сохраняет placeholders, links, структуру Markdown и protected syntax, а также учитывает sibling translations и glossary. Для длинного документа или review применяется translation rubric. Если профиля целевого языка нет, используются общие правила, и это ограничение сообщается один раз.

Для документации переводите стабильную английскую страницу после того, как anchors и примеры команд утверждены. Имена CLI, flags, paths, environment variables и code blocks должны оставаться точными; переводите окружающее объяснение и сравнивайте структуру target page с English. Неясный смысл источника нужно отметить, а не молча угадывать.

## Черновик или аудит академического письма

Используйте `oma-academic-writing` для английских эссе, отчётов, обзоров литературы, аналитики, резюме для руководства, выводов и revisions. Выберите один mode и передайте rubric или ограничения source:

```text
Draft a literature review in draft mode from these sources. Include a Claim-Evidence Map.
Revise this section in revise mode against the quoted rubric below.
Review this draft in review mode and return the compliance report with recommended fixes.
```

`draft` возвращает прозу, Writing Notes и Claim-Evidence Map. `revise` возвращает исходные и исправленные блоки с concrete changes. `review` возвращает PASS/FAIL findings по структуре предложений, глаголам, hedging, конкретности, anti-AI patterns, ясности абзацев, ритму и claim-evidence alignment. Skill полностью читает существующий draft для revise/review, ослабляет или удаляет неподтверждённые claims и передаёт non-English output в `oma-translation` после English pass.

Перед draft используйте `oma scholar` для поиска источников и sidecar evidence. Если citation или rubric отсутствует, отметьте claim как pending или запросите недостающее ограничение; не заполняйте пробел выдуманным source. Полезный completion artifact — prose вместе с evidence map или audit report, а не общий «polished» paragraph без traceable support.

## Checklist восстановления

| Симптом | Следующее действие |
|---|---|
| Результат пуст или структурно повреждён | Проверьте тип input, затем для PDF выберите tagged, table или OCR mode; для HWP проверьте Bun и наличие страниц только с изображениями в source. |
| Локальный skill не подключается | Проверьте сервис или CLI владельца (`Voicebox`, `Chrome`, `uvx`, `bunx`) до изменения content request. |
| Результат исследования слишком слабый | Расширьте query, проверьте fallback/source status и сохраните неопределённость в report. |
| Экспорт slide не удался | Запустите `oma slide validate --workspace <dir> --output json`, исправьте geometry или font findings, затем повторите export. |
| Recap преувеличивает завершённость | Повторно проверьте receipt и artifact; один prompt или tool invocation не доказывает completion. |
| Translation меняет синтаксис кода | Восстановите protected names и повторите structure checks перед review prose. |
| В академической прозе есть неподтверждённые claims | Удалите или смягчите claim, добавьте evidence через scholar path и повторите Claim-Evidence Map. |

Полные зарегистрированные пути CLI и aliases см. в [CLI Commands](../cli-interfaces/commands.md) и [CLI Options](../cli-interfaces/options.md).
