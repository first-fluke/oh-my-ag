---
title: Integracja z istniejącym projektem
description: Bezpieczny i niedestrukcyjny przepływ integracji dodający umiejętności oh-my-ag do istniejącego projektu Antigravity.
---

# Integracja z istniejącym projektem

Ten przewodnik zastępuje przestarzały przepływ pracy oparty na `AGENT_GUIDE.md` w katalogu głównym i odzwierciedla aktualną strukturę workspace (`cli` + `web`) oraz zachowanie CLI.

## Cel

Dodanie umiejętności `oh-my-ag` do istniejącego projektu bez nadpisywania bieżących zasobów.

## Zalecana ścieżka (CLI)

Uruchom to w katalogu głównym docelowego projektu:

```bash
bunx oh-my-ag
```

Co robi:

- Instaluje lub aktualizuje `.agent/skills/*`
- Instaluje współdzielone zasoby w `.agent/skills/_shared`
- Instaluje `.agent/workflows/*`
- Instaluje `.agent/config/user-preferences.yaml`
- Opcjonalnie instaluje globalne przepływy pracy w `~/.gemini/antigravity/global_workflows`

## Bezpieczna ścieżka ręczna

Użyj tego, gdy potrzebujesz pełnej kontroli nad każdym kopiowanym katalogiem.

```bash
cd /path/to/your-project

mkdir -p .agent/skills .agent/workflows .agent/config

# Copy only missing skill directories (example)
for skill in workflow-guide pm-agent frontend-agent backend-agent mobile-agent qa-agent debug-agent orchestrator commit; do
  if [ ! -d ".agent/skills/$skill" ]; then
    cp -r /path/to/oh-my-ag/.agent/skills/$skill .agent/skills/$skill
  fi
done

# Copy shared resources if missing
[ -d .agent/skills/_shared ] || cp -r /path/to/oh-my-ag/.agent/skills/_shared .agent/skills/_shared

# Copy workflows if missing
for wf in coordinate.md orchestrate.md plan.md review.md debug.md setup.md tools.md; do
  [ -f ".agent/workflows/$wf" ] || cp /path/to/oh-my-ag/.agent/workflows/$wf .agent/workflows/$wf
done

# Copy default user preferences only if missing
[ -f .agent/config/user-preferences.yaml ] || cp /path/to/oh-my-ag/.agent/config/user-preferences.yaml .agent/config/user-preferences.yaml
```

## Lista kontrolna weryfikacji

```bash
# 9 installable skills (excluding _shared)
find .agent/skills -mindepth 1 -maxdepth 1 -type d ! -name '_shared' | wc -l

# Shared resources
[ -d .agent/skills/_shared ] && echo ok

# 7 workflows
find .agent/workflows -maxdepth 1 -name '*.md' | wc -l

# Basic command health
bunx oh-my-ag doctor
```

## Opcjonalne panele

Panele są opcjonalne i korzystają z zainstalowanego CLI:

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Domyślny URL panelu webowego: `http://localhost:9847`

## Strategia wycofywania

Przed integracją utwórz commit z punktem kontrolnym w swoim projekcie:

```bash
git add -A
git commit -m "chore: checkpoint before oh-my-ag integration"
```

Jeśli musisz cofnąć zmiany, wycofaj ten commit zgodnie z normalnym procesem zespołu.

## Obsługa dowiązań symbolicznych dla wielu CLI

Po uruchomieniu `bunx oh-my-ag` zobaczysz ten komunikat po wybraniu umiejętności:

```text
Also develop with other CLI tools?
  ○ Claude Code (.claude/skills/)
  ○ OpenCode, Amp, Codex (.agents/skills/)
  ○ GitHub Copilot (.github/skills/)
```

Wybierz dodatkowe narzędzia CLI, których używasz obok Antigravity. Instalator:

1. Zainstaluje umiejętności do `.agent/skills/` (natywna lokalizacja Antigravity)
2. Utworzy dowiązania symboliczne z katalogu umiejętności każdego wybranego CLI do `.agent/skills/`

Zapewnia to jedno źródło prawdy, jednocześnie umożliwiając działanie umiejętności w wielu narzędziach CLI.

### Struktura dowiązań symbolicznych

```
.agent/skills/frontend-agent/      ← Źródło (SSOT)
.claude/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/
.agents/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (OpenCode, Amp, Codex)
.github/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (GitHub Copilot)
```

Instalator pomija istniejące dowiązania symboliczne i ostrzega, jeśli w docelowej lokalizacji istnieje prawdziwy katalog.

## Uwagi

- Nie nadpisuj istniejących katalogów `.agent/skills/*`, chyba że zamierzasz zastąpić dostosowane umiejętności.
- Zachowaj pliki polityk specyficzne dla projektu (`.agent/config/*`) pod własnością swojego repozytorium.
- Aby poznać wzorce orkiestracji wieloagentowej, przejdź do [`Przewodnika użycia`](./usage.md).
