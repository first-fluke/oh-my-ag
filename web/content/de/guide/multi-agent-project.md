---
title: "Anwendungsfall: Multi-Agenten-Projekt"
description: End-to-End-Ablauf für komplexe domänenübergreifende Lieferung mit expliziten Koordinations-Gates.
---

# Anwendungsfall: Multi-Agenten-Projekt

## Wann dieser Weg geeignet ist

Verwenden Sie diesen Weg, wenn ein Feature mehrere Domänen umfasst (zum Beispiel Backend + Frontend + QA) und parallele Ausführung vorteilhaft ist.

## Koordinationsmodell

Empfohlene Reihenfolge:

1. `/plan` für Aufgabenzerlegung und Abhängigkeits-Mapping
2. `/coordinate` für Ausführungsreihenfolge und Zuständigkeiten
3. Paralleles `agent:spawn` pro Domäne
4. `/review` für QA-/Sicherheits-/Performance-Gate

## Sitzungs- und Workspace-Strategie

Verwenden Sie eine Sitzungs-ID pro Feature-Stream:

```text
session-auth-v2
```

Weisen Sie isolierte Workspaces pro Domäne zu, um Merge-Konflikte zu reduzieren:

- Backend: `./apps/api`
- Frontend: `./apps/web`
- Mobile: `./apps/mobile`

## Spawn-Beispiel

```bash
oh-my-ag agent:spawn backend "Implement JWT auth API + refresh flow" session-auth-v2 -w ./apps/api
oh-my-ag agent:spawn frontend "Build login + refresh UX with error states" session-auth-v2 -w ./apps/web
oh-my-ag agent:spawn qa "Review auth risks, test matrix, and regression scope" session-auth-v2
```

## Contract-First-Regel

Legen Sie vor der parallelen Implementierung gemeinsame Verträge fest:

- Request-/Response-Schemata
- Fehlercodes und Meldungen
- Auth-/Sitzungs-Lebenszyklus-Annahmen

Wenn sich Verträge während der Ausführung ändern, pausieren Sie nachgelagerte Agenten und senden Sie die Prompts mit dem aktualisierten Vertrag erneut.

## Merge-Gates

Mergen Sie nicht, es sei denn, alle Gates werden bestanden:

1. Domänenspezifische Tests bestehen
2. Integrationspunkte entsprechen den vereinbarten Verträgen
3. QA-Befunde mit hoher/kritischer Priorität sind gelöst oder explizit akzeptiert
4. Changelog oder Release Notes sind aktualisiert, wenn sich extern sichtbares Verhalten ändert

## Operative Anti-Patterns

Vermeiden Sie:

- Einen Workspace für alle Agenten gemeinsam nutzen
- Verträge ändern, ohne andere Agenten zu benachrichtigen
- Backend/Frontend unabhängig mergen, bevor die Kompatibilität geprüft wurde

## Abschlusskriterien

Die Multi-Agenten-Ausführung ist abgeschlossen, wenn:

- Geplante Aufgaben über alle Domänen hinweg erledigt sind
- Die domänenübergreifende Integration validiert ist
- Die QA-Freigabe (oder eine dokumentierte Risikoakzeptanz) vorliegt
