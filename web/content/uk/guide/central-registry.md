---
title: Центральний реєстр для мульти-репозиторної конфігурації
description: Використовуйте цей репозиторій як версіонований центральний реєстр та безпечно синхронізуйте споживчі проєкти через оновлення на основі PR.
---

# Центральний реєстр для мульти-репозиторної конфігурації

Цей репозиторій може слугувати **центральним реєстром** для навичок агентів, щоб кілька споживчих репозиторіїв залишалися узгодженими з версіонованими оновленнями.

## Архітектура

```text
┌─────────────────────────────────────────────────────────┐
│  Центральний реєстр (цей репозиторій)                   │
│  • release-please для автоматичного версіонування       │
│  • Автогенерація CHANGELOG.md                           │
│  • prompt-manifest.json (версія/файли/контрольні суми)  │
│  • agent-skills.tar.gz артефакт релізу                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Споживчий репозиторій                                  │
│  • .agent-registry.yaml для фіксації версії             │
│  • Виявлення нової версії → PR (без авто-злиття)        │
│  • Повторно використовуваний Action для синхронізації   │
└─────────────────────────────────────────────────────────┘
```

## Для супроводжувачів реєстру

Релізи автоматизовані через [release-please](https://github.com/googleapis/release-please):

1. Використовуйте конвенційні коміти (`feat:`, `fix:`, `chore:`, ...).
2. Зробіть push до `main`, щоб створити/оновити PR релізу.
3. Злийте PR релізу для публікації артефактів GitHub Release:
   - `CHANGELOG.md` (автоматично згенерований)
   - `prompt-manifest.json` (список файлів + контрольні суми SHA256)
   - `agent-skills.tar.gz` (стиснута директорія `.agent/`)

## Для споживчих проєктів

Скопіюйте шаблони з `docs/consumer-templates/` у свій проєкт:

```bash
# Configuration file
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# GitHub workflows
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

Потім зафіксуйте бажану версію в `.agent-registry.yaml`:

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

Ролі робочих процесів:

- `check-registry-updates.yml`: перевіряє наявність нових версій та відкриває PR.
- `sync-agent-registry.yml`: синхронізує `.agent/` при зміні зафіксованої версії.

**Важливо**: Авто-злиття навмисно вимкнено. Усі оновлення повинні проходити ручну перевірку.

## Використання повторно використовуваного Action

Споживчі репозиторії можуть викликати action синхронізації напряму:

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
