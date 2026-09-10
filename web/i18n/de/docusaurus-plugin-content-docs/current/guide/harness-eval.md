---
title: "Harness-Evaluierung"
sidebar_label: Harness-Evaluierung
description: Ein vollständiges OMA-Harness-Overlay mit gepaarten, isolierten Repository-Aufgaben und deterministischen Artefaktprüfungen evaluieren.
---

# Harness-Evaluierung

`oma harness eval` misst, ob ein OMA-Harness einen festen Zielagenten verbessert, ohne dessen Modell zu ändern. Das Verfahren übernimmt das Evaluierungsmuster aus [AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses](https://arxiv.org/abs/2608.12307): Zielmodell festhalten, Harness ändern und Ergebnisse bei denselben Aufgaben vergleichen.

Dieser Befehl evaluiert eine größere Einheit als `oma skill eval`:

| Befehl | Behandlung | Bewertungsziel |
|:--------|:----------|:-------------|
| `oma skill eval` | Ein `SKILL.md`-Text | Agentenausgabe |
| `oma harness eval` | Ein abgegrenztes `.agents/`-Overlay | Dateien und Ausgabe in einem Repository-Workspace |

Verwenden Sie Skill-Evaluation, um die Frage „Hilft dieser Skill?“ zu beantworten. Verwenden Sie Harness-Evaluation für die Frage „Macht diese Kombination aus Skills, Workflows, Regeln und Agentenanweisungen den festen Agenten zuverlässiger beim Erledigen von Repository-Aufgaben?“

## Evaluierungsmodell

Jede Aufgabe läuft als gepaartes Experiment:

1. OMA kopiert die Aufgaben-Fixture in einen frischen Baseline-Workspace.
2. OMA kopiert die aktuellen Definitionen von `agents`, `config`, `rules`, `skills` und `workflows` in diesen Workspace und projiziert sie in das ausgewählte Vendor-Format.
3. OMA wiederholt die Einrichtung in einem zweiten frischen Workspace und wendet dort das Kandidaten-Overlay an.
4. Für beide Arme werden derselbe primäre Agent, Vendor-Pfad, Prompt, Schreibberechtigungen und Timeout verwendet.
5. Deterministische Prüfungen untersuchen den resultierenden Workspace und optional die Agentenausgabe.

Das echte Projekt wird nie als Arbeitsverzeichnis eines Arms verwendet. Temporäre Arm-Workspaces werden nach der Bewertung entfernt; die Sandbox des Prozesses des ausgewählten Vendors bleibt für Zugriffe außerhalb dieses Arbeitsverzeichnisses maßgeblich.

## Aufbau des Kandidaten

Der Kandidatenpfad ist ein Verzeichnis mit einem Teilbaum von `.agents/`:

```text
candidate/
└── .agents/
    ├── agents/
    │   └── docs-curator.md
    ├── rules/
    │   └── documentation.md
    ├── skills/
    │   └── project-docs/
    │       └── SKILL.md
    └── workflows/
        └── docs-check.md
```

Nur Dateien unter `.agents/agents`, `.agents/rules`, `.agents/skills` und `.agents/workflows` werden akzeptiert. Hooks, Evaluator-Fixtures, State, Ergebnisse, Konfigurationsdateien, Symlinks und Vendor-Agent-Varianten werden abgelehnt. Geschützte Agent-Frontmatter-Felder wie `model`, `tools`, `effort` und Ausführungslimits müssen der Baseline entsprechen. Ein Arm schlägt außerdem fehl, wenn der laufende Agent geschützte `.agents/`-Definitionen vor der Bewertung ändert.

## Suite-Format

Eine Suite besteht aus einer YAML-Datei und einem Fixture-Verzeichnis pro Aufgabe:

```text
harness-eval/
├── suite.yaml
└── fixtures/
    ├── stale-api-doc/
    │   ├── docs/api.md
    │   └── src/session.ts
    └── missing-guide/
        ├── docs/
        └── src/feature.ts
```

```yaml
schema_version: 1
id: docs-harness
agent: docs-curator
tasks:
  - id: stale-api-doc
    prompt: Update the API documentation to match the implementation.
    workspace: fixtures/stale-api-doc
    weight: 1
    checks:
      - type: file_contains
        path: docs/api.md
        value: openSession
      - type: file_not_contains
        path: docs/api.md
        value: createSession
```

Task-IDs müssen eindeutig sein. Fixture- und Prüfpfade müssen innerhalb des Projekts und des Aufgaben-Workspace bleiben. Fixtures dürfen keine Symlinks oder Steuerungsoberflächen des Agent-Harness wie `.agents`, `.codex`, `.claude`, Vendor-Skill-Verzeichnisse oder Root-Dateien mit Agentenanweisungen enthalten. Dadurch können Aufgabendaten den kontrollierten Harness keines der beiden Arme überschreiben.

Erzeugte Abhängigkeitsverzeichnisse wie `node_modules` und `.venv` werden nicht aus dem Baseline-Harness kopiert. Committen Sie deterministischen Hilfsquelltext und Dependency-Manifeste im Skill; stellen Sie Laufzeitabhängigkeiten in der Aufgaben-Fixture bereit, wenn eine Prüfung sie benötigt.

### Prüfungstypen

| Typ | Felder | Bestehensbedingung |
|:-----|:-------|:---------------|
| `file_exists` | `path` | Der Pfad existiert nach Abschluss des Arms. |
| `file_not_exists` | `path` | Der Pfad existiert nicht. |
| `file_contains` | `path`, `value` | Die Datei existiert und enthält den Wert. |
| `file_not_contains` | `path`, `value` | Die Datei existiert und enthält den Wert nicht. |
| `output_contains` | `value` | Die aufgezeichnete Agentenausgabe enthält den Wert. |
| `output_not_contains` | `value` | Die aufgezeichnete Agentenausgabe enthält den Wert nicht. |

Artefaktprüfungen sind absichtlich deterministisch. Die erste Version führt keine veränderlichen Paket-Skripte als Prüfer aus, weil ein evaluierter Agent diese Skripte oder ihre Tests ändern und damit den Evaluator entkräften könnte.

## Ausführen und aufzeichnen

Der Live-Modus führt zwei Dispatches pro Aufgabe aus, zeigt eine Kostenvorschau und verlangt eine Bestätigung:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --live --record
```

Bei einem erfolgreichen Lauf enthält der Bericht gepaarte Baseline-/Kandidatenwerte, einen Lift, Regressionszahlen und eine Entscheidung wie `pass` oder `insufficient`. Wenn Sie Suite, Baseline-Definitionen, Kandidaten-Overlay, Prompts, Fixtures oder Prüfungen ändern, zeichnen Sie einen neuen Live-Lauf auf; eine alte `_runs`-Datei wird wegen ihres Hashes abgelehnt.

Verwenden Sie `--yes` für eine nicht interaktive Ausführung und `--timeout-minutes`, um für beide Arme dasselbe Wandzeitlimit zu setzen. Die Live-Ausführung ist nur verfügbar, wenn der ausgewählte Vendor Harness-Dateien relativ zum Projekt-Workspace findet. OMA verweigert die Suche in HOME, weil die Baseline dort global installierte Kandidateninhalte sehen könnte.

`--record` schreibt eine JSON-Aufzeichnung mit Hash im Verzeichnis `_runs/` neben der Suite. Die Aufzeichnung bindet die Ergebnisse an drei Eingaben:

- Suite, Prompts, Prüfungen und Fixture-Inhalte;
- aktuelle Baseline-Harness-Definitionen;
- Inhalte des Kandidaten-Overlays.

Der Mock-Modus ist Standard und führt keine Modellaufrufe aus. Er spielt eine Aufzeichnung nur ab, wenn alle drei Hashes noch übereinstimmen:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --mock --require-coverage
```

## Metriken und Entscheidungsgate

Eine Aufgabe besteht nur, wenn jede Prüfung besteht. Scores sind gewichtete Mittelwerte über gepaarte Aufgaben:

```text
lift = candidateScore - baselineScore
```

OMA meldet außerdem:

- korrigierte Aufgaben: Baseline fehlgeschlagen, Kandidat bestanden;
- regressierte Aufgaben: Baseline bestanden, Kandidat fehlgeschlagen;
- Coverage: mindestens fünf gepaarte, bewertbare Aufgaben sind erforderlich.

Der Kandidat besteht, wenn der Lift mindestens 5 Prozentpunkte beträgt und keine Regressionen vorliegen. Jede Regression lässt den Kandidaten scheitern. Ein nichtnegativer Lift unter 5 Punkten gibt eine Warnung aus; weniger als fünf gepaarte Aufgaben erzeugen die Entscheidung `insufficient`. Fügen Sie `--require-coverage` hinzu, damit unzureichende Coverage in CI mit Exit-Code ungleich null endet. Ein Score ist kein Beleg, wenn ein Arm fehlt, ein Record-Hash veraltet ist oder eine deterministische Prüfung unvollständig ist.

## Aktuelle Grenze

Dies ist eine Grundlage für Evaluation und keine automatische Harness-Optimierung. Ein Builder kann Kandidaten-Overlays extern erzeugen und diesen Befehl anschließend als Abnahme-Gate verwenden. Eine separate verborgene Final-Test-Suite, wiederholte stochastische Durchläufe, vertrauenswürdige externe Test-Runner, Token-Abrechnung, erzwungenes Pinnen von Modellen für verschachtelte Subagent-Aufrufe und eine automatisierte `harness opt`-Schleife gehören nicht zum aktuellen Befehl. Solange das Pinnen verschachtelter Aufrufe nicht existiert, sollten Suites, die ein einzelnes festes Modell messen, Kandidaten-Workflows vermeiden, die andere konfigurierte Agentenrollen starten.
