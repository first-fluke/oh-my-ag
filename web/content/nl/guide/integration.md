---
title: Integratie in bestaand project
description: Veilige en niet-destructieve integratieworkflow voor het toevoegen van oh-my-ag-skills aan een bestaand Antigravity-project.
---

# Integratie in een bestaand project

Deze handleiding vervangt de verouderde root `AGENT_GUIDE.md`-workflow en weerspiegelt de huidige werkruimtestructuur (`cli` + `web`) en CLI-gedrag.

## Doel

Voeg `oh-my-ag`-skills toe aan een bestaand project zonder bestaande bestanden te overschrijven.

## Aanbevolen pad (CLI)

Voer dit uit in de hoofdmap van het doelproject:

```bash
bunx oh-my-ag
```

Wat het doet:

- Installeert of werkt `.agent/skills/*` bij
- Installeert gedeelde resources in `.agent/skills/_shared`
- Installeert `.agent/workflows/*`
- Installeert `.agent/config/user-preferences.yaml`
- Installeert optioneel globale workflows onder `~/.gemini/antigravity/global_workflows`

## Veilig handmatig pad

Gebruik dit wanneer u volledige controle wilt over elke gekopieerde map.

```bash
cd /path/to/your-project

mkdir -p .agent/skills .agent/workflows .agent/config

# Kopieer alleen ontbrekende skillmappen (voorbeeld)
for skill in workflow-guide pm-agent frontend-agent backend-agent mobile-agent qa-agent debug-agent orchestrator commit; do
  if [ ! -d ".agent/skills/$skill" ]; then
    cp -r /path/to/oh-my-ag/.agent/skills/$skill .agent/skills/$skill
  fi
done

# Kopieer gedeelde resources als ze ontbreken
[ -d .agent/skills/_shared ] || cp -r /path/to/oh-my-ag/.agent/skills/_shared .agent/skills/_shared

# Kopieer workflows als ze ontbreken
for wf in coordinate.md orchestrate.md plan.md review.md debug.md setup.md tools.md; do
  [ -f ".agent/workflows/$wf" ] || cp /path/to/oh-my-ag/.agent/workflows/$wf .agent/workflows/$wf
done

# Kopieer standaard gebruikersvoorkeuren alleen als ze ontbreken
[ -f .agent/config/user-preferences.yaml ] || cp /path/to/oh-my-ag/.agent/config/user-preferences.yaml .agent/config/user-preferences.yaml
```

## Verificatiechecklist

```bash
# 9 installeerbare skills (exclusief _shared)
find .agent/skills -mindepth 1 -maxdepth 1 -type d ! -name '_shared' | wc -l

# Gedeelde resources
[ -d .agent/skills/_shared ] && echo ok

# 7 workflows
find .agent/workflows -maxdepth 1 -name '*.md' | wc -l

# Basis commandogezondheidscontrole
bunx oh-my-ag doctor
```

## Optionele dashboards

Dashboards zijn optioneel en gebruiken de geïnstalleerde CLI:

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Standaard URL webdashboard: `http://localhost:9847`

## Terugdraaistrategie

Maak voor de integratie een checkpointcommit aan in uw project:

```bash
git add -A
git commit -m "chore: checkpoint before oh-my-ag integration"
```

Als u de integratie ongedaan moet maken, draai die commit dan terug via uw gebruikelijke teamproces.

## Multi-CLI-symlinkondersteuning

Wanneer u `bunx oh-my-ag` uitvoert, ziet u na het selecteren van skills deze prompt:

```text
Also develop with other CLI tools?
  ○ Claude Code (.claude/skills/)
  ○ OpenCode, Amp, Codex (.agents/skills/)
  ○ GitHub Copilot (.github/skills/)
```

Selecteer eventuele extra CLI-tools die u naast Antigravity gebruikt. De installer zal:

1. Skills installeren in `.agent/skills/` (de native locatie van Antigravity)
2. Symlinks aanmaken van de skillsmap van elke geselecteerde CLI naar `.agent/skills/`

Dit garandeert een enkele bron van waarheid terwijl skills over meerdere CLI-tools werken.

### Symlinkstructuur

```
.agent/skills/frontend-agent/      ← Bron (SSOT)
.claude/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/
.agents/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (OpenCode, Amp, Codex)
.github/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (GitHub Copilot)
```

De installer slaat bestaande symlinks over en geeft een waarschuwing als er een echte map op de doellocatie bestaat.

## Opmerkingen

- Overschrijf bestaande `.agent/skills/*`-mappen niet, tenzij u aangepaste skills bewust wilt vervangen.
- Houd projectspecifieke beleidsbestanden (`.agent/config/*`) onder het eigendom van uw repository.
- Ga voor multi-agentorkestratiepatronen verder met de [`Gebruikshandleiding`](./usage.md).
