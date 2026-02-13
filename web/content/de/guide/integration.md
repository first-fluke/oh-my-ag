---
title: Integration in ein bestehendes Projekt
description: Sicherer und zerstörungsfreier Integrations-Workflow zum Hinzufügen von oh-my-ag-Skills zu einem bestehenden Antigravity-Projekt.
---

# Integration in ein bestehendes Projekt

Dieser Leitfaden ersetzt den veralteten Root-`AGENT_GUIDE.md`-Workflow und spiegelt die aktuelle Workspace-Struktur (`cli` + `web`) und das CLI-Verhalten wider.

## Ziel

`oh-my-ag`-Skills zu einem bestehenden Projekt hinzufügen, ohne vorhandene Assets zu überschreiben.

## Empfohlener Weg (CLI)

Führen Sie dies im Stammverzeichnis des Zielprojekts aus:

```bash
bunx oh-my-ag
```

Was es tut:

- Installiert oder aktualisiert `.agent/skills/*`
- Installiert gemeinsame Ressourcen in `.agent/skills/_shared`
- Installiert `.agent/workflows/*`
- Installiert `.agent/config/user-preferences.yaml`
- Installiert optional globale Workflows unter `~/.gemini/antigravity/global_workflows`

## Sicherer manueller Weg

Verwenden Sie diesen Weg, wenn Sie volle Kontrolle über jedes kopierte Verzeichnis benötigen.

```bash
cd /path/to/your-project

mkdir -p .agent/skills .agent/workflows .agent/config

# Nur fehlende Skill-Verzeichnisse kopieren (Beispiel)
for skill in workflow-guide pm-agent frontend-agent backend-agent mobile-agent qa-agent debug-agent orchestrator commit; do
  if [ ! -d ".agent/skills/$skill" ]; then
    cp -r /path/to/oh-my-ag/.agent/skills/$skill .agent/skills/$skill
  fi
done

# Gemeinsame Ressourcen kopieren, falls fehlend
[ -d .agent/skills/_shared ] || cp -r /path/to/oh-my-ag/.agent/skills/_shared .agent/skills/_shared

# Workflows kopieren, falls fehlend
for wf in coordinate.md orchestrate.md plan.md review.md debug.md setup.md tools.md; do
  [ -f ".agent/workflows/$wf" ] || cp /path/to/oh-my-ag/.agent/workflows/$wf .agent/workflows/$wf
done

# Standard-Benutzereinstellungen nur kopieren, falls fehlend
[ -f .agent/config/user-preferences.yaml ] || cp /path/to/oh-my-ag/.agent/config/user-preferences.yaml .agent/config/user-preferences.yaml
```

## Verifizierungs-Checkliste

```bash
# 9 installierbare Skills (ohne _shared)
find .agent/skills -mindepth 1 -maxdepth 1 -type d ! -name '_shared' | wc -l

# Gemeinsame Ressourcen
[ -d .agent/skills/_shared ] && echo ok

# 7 Workflows
find .agent/workflows -maxdepth 1 -name '*.md' | wc -l

# Grundlegender Zustandscheck
bunx oh-my-ag doctor
```

## Optionale Dashboards

Dashboards sind optional und verwenden die installierte CLI:

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Standard-URL des Web-Dashboards: `http://localhost:9847`

## Rollback-Strategie

Erstellen Sie vor der Integration einen Checkpoint-Commit in Ihrem Projekt:

```bash
git add -A
git commit -m "chore: checkpoint before oh-my-ag integration"
```

Falls Sie rückgängig machen müssen, setzen Sie diesen Commit mit Ihrem normalen Teamprozess zurück.

## Multi-CLI-Symlink-Unterstützung

Wenn Sie `bunx oh-my-ag` ausführen, sehen Sie nach der Skill-Auswahl diese Abfrage:

```text
Also develop with other CLI tools?
  ○ Claude Code (.claude/skills/)
  ○ OpenCode, Amp, Codex (.agents/skills/)
  ○ GitHub Copilot (.github/skills/)
```

Wählen Sie alle zusätzlichen CLI-Tools aus, die Sie neben Antigravity verwenden. Der Installer wird:

1. Skills in `.agent/skills/` installieren (Antigravitys nativer Speicherort)
2. Symlinks vom Skills-Verzeichnis jedes ausgewählten CLI-Tools zu `.agent/skills/` erstellen

Dies gewährleistet eine einzige Informationsquelle, während die Skills über mehrere CLI-Tools hinweg funktionieren.

### Symlink-Struktur

```
.agent/skills/frontend-agent/      ← Quelle (SSOT)
.claude/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/
.agents/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (OpenCode, Amp, Codex)
.github/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (GitHub Copilot)
```

Der Installer überspringt vorhandene Symlinks und warnt, wenn am Zielspeicherort ein echtes Verzeichnis existiert.

## Hinweise

- Überschreiben Sie vorhandene `.agent/skills/*`-Ordner nicht, es sei denn, Sie beabsichtigen, angepasste Skills zu ersetzen.
- Behalten Sie projektspezifische Richtliniendateien (`.agent/config/*`) unter der Eigentümerschaft Ihres Repositories.
- Für Multi-Agenten-Orchestrierungsmuster fahren Sie mit dem [`Nutzungsleitfaden`](./usage.md) fort.
