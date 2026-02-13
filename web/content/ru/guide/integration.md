---
title: Интеграция в существующий проект
description: Безопасный и неразрушающий процесс интеграции навыков oh-my-ag в существующий проект Antigravity.
---

# Интеграция в существующий проект

Это руководство заменяет устаревший рабочий процесс с корневым `AGENT_GUIDE.md` и отражает текущую структуру проекта (`cli` + `web`) и поведение CLI.

## Цель

Добавить навыки `oh-my-ag` в существующий проект без перезаписи текущих ресурсов.

## Рекомендуемый путь (CLI)

Выполните в корне целевого проекта:

```bash
bunx oh-my-ag
```

Что происходит:

- Устанавливает или обновляет `.agent/skills/*`
- Устанавливает общие ресурсы в `.agent/skills/_shared`
- Устанавливает `.agent/workflows/*`
- Устанавливает `.agent/config/user-preferences.yaml`
- Опционально устанавливает глобальные рабочие процессы в `~/.gemini/antigravity/global_workflows`

## Безопасный ручной путь

Используйте, когда нужен полный контроль над каждой копируемой директорией.

```bash
cd /path/to/your-project

mkdir -p .agent/skills .agent/workflows .agent/config

# Копировать только отсутствующие директории навыков (пример)
for skill in workflow-guide pm-agent frontend-agent backend-agent mobile-agent qa-agent debug-agent orchestrator commit; do
  if [ ! -d ".agent/skills/$skill" ]; then
    cp -r /path/to/oh-my-ag/.agent/skills/$skill .agent/skills/$skill
  fi
done

# Копировать общие ресурсы, если отсутствуют
[ -d .agent/skills/_shared ] || cp -r /path/to/oh-my-ag/.agent/skills/_shared .agent/skills/_shared

# Копировать рабочие процессы, если отсутствуют
for wf in coordinate.md orchestrate.md plan.md review.md debug.md setup.md tools.md; do
  [ -f ".agent/workflows/$wf" ] || cp /path/to/oh-my-ag/.agent/workflows/$wf .agent/workflows/$wf
done

# Копировать пользовательские настройки по умолчанию, только если отсутствуют
[ -f .agent/config/user-preferences.yaml ] || cp /path/to/oh-my-ag/.agent/config/user-preferences.yaml .agent/config/user-preferences.yaml
```

## Чек-лист верификации

```bash
# 9 устанавливаемых навыков (исключая _shared)
find .agent/skills -mindepth 1 -maxdepth 1 -type d ! -name '_shared' | wc -l

# Общие ресурсы
[ -d .agent/skills/_shared ] && echo ok

# 7 рабочих процессов
find .agent/workflows -maxdepth 1 -name '*.md' | wc -l

# Базовая проверка работоспособности команд
bunx oh-my-ag doctor
```

## Опциональные панели мониторинга

Панели мониторинга опциональны и используют установленный CLI:

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

URL веб-панели по умолчанию: `http://localhost:9847`

## Стратегия отката

Перед интеграцией создайте контрольный коммит в вашем проекте:

```bash
git add -A
git commit -m "chore: checkpoint before oh-my-ag integration"
```

Если нужно отменить изменения, откатите этот коммит стандартным процессом вашей команды.

## Поддержка мульти-CLI через символические ссылки

При запуске `bunx oh-my-ag` после выбора навыков вы увидите такой запрос:

```text
Also develop with other CLI tools?
  ○ Claude Code (.claude/skills/)
  ○ OpenCode, Amp, Codex (.agents/skills/)
  ○ GitHub Copilot (.github/skills/)
```

Выберите дополнительные CLI-инструменты, которые вы используете наряду с Antigravity. Установщик:

1. Устанавливает навыки в `.agent/skills/` (нативное расположение Antigravity)
2. Создаёт символические ссылки из директории навыков каждого выбранного CLI на `.agent/skills/`

Это обеспечивает единый источник истины, позволяя навыкам работать в нескольких CLI-инструментах.

### Структура символических ссылок

```
.agent/skills/frontend-agent/      <- Источник (SSOT)
.claude/skills/frontend-agent/     -> ../../.agent/skills/frontend-agent/
.agents/skills/frontend-agent/     -> ../../.agent/skills/frontend-agent/ (OpenCode, Amp, Codex)
.github/skills/frontend-agent/     -> ../../.agent/skills/frontend-agent/ (GitHub Copilot)
```

Установщик пропускает существующие символические ссылки и предупреждает, если в целевом расположении существует реальная директория.

## Примечания

- Не перезаписывайте существующие папки `.agent/skills/*`, если вы не намерены заменить кастомизированные навыки.
- Храните файлы политик проекта (`.agent/config/*`) под управлением вашего репозитория.
- Для паттернов мультиагентной оркестрации перейдите к [`Руководству по использованию`](./usage.md).
