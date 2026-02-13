---
title: "Anwendungsfall: Einzelner Skill"
description: Schneller Weg für fokussierte Einzeldomänen-Arbeit mit klarem Umfang und kurzen Feedback-Schleifen.
---

# Anwendungsfall: Einzelner Skill

## Wann dieser Weg geeignet ist

Verwenden Sie diesen Weg, wenn die Ausgabe eng begrenzt ist und hauptsächlich einer Domäne gehört:

- Eine UI-Komponente
- Ein API-Endpunkt
- Ein Fehler in einer Schicht
- Ein Refactoring in einem Modul

Wenn die Aufgabe domänenübergreifende Koordination erfordert (API-Vertrag + UI + QA), verwenden Sie [`Multi-Agenten-Projekt`](./multi-agent-project.md).

## Vorbereitungs-Checkliste

Definieren Sie vor dem Prompting:

1. Exakte Ausgabe (Datei oder Verhalten)
2. Ziel-Stack und Versionen
3. Akzeptanzkriterien
4. Testerwartungen

## Prompt-Vorlage

```text
Build <specific artifact> using <stack>.
Constraints: <style/perf/security constraints>.
Acceptance criteria:
1) ...
2) ...
Add tests for: <critical cases>.
```

## Beispiel-Prompt

```text
Create a login form component in React + TypeScript + Tailwind CSS.
Constraints: accessible labels, client-side validation, no external form library.
Acceptance criteria:
1) email and password validation messages
2) disabled submit while invalid
3) keyboard and screen-reader friendly
Add unit tests for valid/invalid submit paths.
```

## Erwarteter Ausführungsablauf

1. Der passende Skill wird automatisch ausgewählt.
2. Der Agent schlägt Implementierung und Annahmen vor.
3. Sie bestätigen oder korrigieren die Annahmen.
4. Der Agent liefert Code und Tests.
5. Sie führen die lokale Verifizierung durch und fordern kleine Nachbesserungen an.

## Qualitäts-Gate vor dem Merge

- Verhalten entspricht den Akzeptanzkriterien
- Tests decken den Happy Path und wesentliche Grenzfälle ab
- Keine unzugehörigen Dateiänderungen
- Keine versteckten Breaking Changes an gemeinsamen Modulen

## Eskalationssignale

Wechseln Sie zum Multi-Agenten-Ablauf, wenn:

- UI-Arbeit neue API-Verträge erfordert
- Eine Korrektur kaskadierende Änderungen über Schichten hinweg verursacht
- Der Umfang nach der ersten Iteration über eine Domäne hinauswächst

## Abschlusskriterien

Die Einzelskill-Ausführung ist abgeschlossen, wenn:

- Das Zielartefakt implementiert ist
- Die Akzeptanzkriterien nachweislich erfüllt sind
- Tests für das geänderte Verhalten hinzugefügt oder aktualisiert wurden
