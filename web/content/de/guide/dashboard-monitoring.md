---
title: "Anwendungsfall: Dashboard-Überwachung"
description: Orchestrator-Sitzungen mit Terminal-/Web-Dashboards und umsetzbaren Runbook-Signalen betreiben.
---

# Anwendungsfall: Dashboard-Überwachung

## Startbefehle

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Standard-URL des Web-Dashboards: `http://localhost:9847`

## Empfohlenes Terminal-Layout

Verwenden Sie mindestens 3 Terminals:

1. Terminal-Dashboard (`oh-my-ag dashboard`)
2. Agent-Spawn-Befehle
3. Test-/Build-Logs

Lassen Sie das Web-Dashboard für gemeinsame Sichtbarkeit während Team-Sitzungen geöffnet.

## Was die Dashboards überwachen

Datenquelle: `.serena/memories/`

Primäre Signale:

- Sitzungsstatus (`running`, `completed`, `failed`)
- Taskboard-Zuweisung und Statusänderungen
- Fortschrittsschritte pro Agent
- Ergebnisveröffentlichungs-Ereignisse

Updates sind ereignisgesteuert durch geänderte Dateien; eine vollständige Verzeichnis-Polling-Schleife ist nicht erforderlich.

## Runbook: Signal → Aktion

- `No agents detected`
  - Überprüfen Sie, ob die Agenten mit derselben `session-id` gestartet wurden
  - Bestätigen Sie, dass in `.serena/memories/` geschrieben wird
- `Session stuck in running`
  - Prüfen Sie die Zeitstempel der neuesten `progress-*`-Dateien
  - Starten Sie den fehlgeschlagenen oder blockierten Agenten mit einem klareren Prompt neu
- `Frequent reconnects (web)`
  - Firewall/Proxy lokal prüfen
  - `dashboard:web` neu starten und die Seite erneut öffnen
- `Missing activity while agents are active`
  - Überprüfen Sie, ob die Orchestrator-Schreibvorgänge nicht in einen anderen Workspace umgeleitet werden

## Pre-Merge-Überwachungs-Checkliste

- Alle erforderlichen Agenten haben den Status „completed" erreicht
- Keine ungelösten QA-Befunde mit hohem Schweregrad
- Aktuelle Ergebnisdateien sind für jeden Agenten vorhanden
- Integrationstests wurden nach den finalen Agentenausgaben ausgeführt

## Abschlusskriterien

Die Überwachungsphase ist abgeschlossen, wenn:

- Die Sitzung den Endzustand erreicht hat (`completed` oder absichtlich gestoppt)
- Der Aktivitätsverlauf die Herkunft der finalen Ausgabe erklärt
- Die Release-/Merge-Entscheidung mit vollständiger Statusübersicht getroffen wurde
