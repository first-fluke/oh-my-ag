---
title: "Anleitung: Diagramm-Engine (archify)"
sidebar_label: Diagramme
description: So wählt oh-my-agent zwischen Mermaid und dem optionalen Agenten-Skill tt-a1i/archify für Architektur-, Sequenz- und Datenflussdiagramme — mit Diagramm-Konfiguration, oma diagram resolve / oma diagram archify, der Nutzung durch /architecture und /explain sowie der unbegrenzten Schleife aus Validieren, Reparieren und Ausliefern.
---

# Diagramm-Engine

`/architecture` (ADRs, Empfehlungen, Reviews) und `/explain` (Erklärungen zu Codeänderungen) erzeugen beide Strukturdiagramme. Diese sind immer **Mermaid**-Blöcke im Markdown-Artefakt und zusätzlich — sobald [archify](https://github.com/tt-a1i/archify) aufgelöst werden kann, was dem Normalfall entspricht — ein **interaktives, validiertes HTML-Diagramm** neben dem Artefakt: mit dunklem/hellem Theme, Pan-Zoom, Suche, Nachverfolgung von Beziehungen und PNG-/SVG-/WebM-Export, aus einer typisierten JSON-Spezifikation gerendert.

Mermaid bleibt erhalten: Es ist die Text-SSOT im Markdown und in Git-Diffs. archify ist ein abgeleitetes Artefakt.

---

## Immer das neueste archify — nichts zu installieren

archify ist ein MIT-lizenzierter Agenten-Skill (Node ≥ 18, keine Laufzeitabhängigkeiten). oh-my-agent verlässt sich nicht auf eine einmalig installierte Kopie, sondern hält eine **eigene verwaltete Kopie** vor und verfolgt das neueste Release:

- Cache: `~/.cache/oma-diagram/archify/<tag>/` plus die Zeigerdatei `state.json`.
- Vor jeder Nutzung fragt `oma diagram resolve` GitHub nach dem neuesten Release-Tag (höchstens einmal pro `check_interval_min`, standardmäßig 60 Minuten), lädt den Quell-Tarball bei einem neueren Tag herunter (atomisches Verzeichnis pro Tag; ältere Tags werden entfernt) und verwendet ansonsten die gecachte Kopie erneut.
- Netzwerkfehler sind nie fatal: Die gecachte Kopie wird verwendet und mit dem Grund als `stale` gemeldet. Nur ein erster Lauf ohne Netzwerk und ohne Cache fällt auf eine benutzerinstallierte Skill-Kopie und danach auf Mermaid zurück.

```bash
# Illustrative output; the release tag, cache path, and quality can vary.
oma diagram update          # force a check / download now
oma diagram resolve
# engine:   archify  (requested: auto)
# reason:   archify 2.15.0 via managed:v2.15.0 (current)
# root:     /Users/you/.cache/oma-diagram/archify/v2.15.0
# quality:  showcase
oma diagram resolve --offline   # never touch the network
```

Auflösungsreihenfolge (der erste Treffer gewinnt und ist für jede Vendor-Laufzeit gleich):

1. `diagram.archify.path` in `oma-config.yaml` — expliziter Pin, deaktiviert Auto-Latest
2. Umgebungsvariable `ARCHIFY_HOME` — expliziter Pin
3. **Verwaltete neueste Version** (`~/.cache/oma-diagram/archify`)
4. Benutzerinstallierte Skill-Verzeichnisse: Projekt `.agents` / `.claude` / `.codex` / `.cursor` / `.qwen` / `.kiro` `/skills/archify`, danach dieselben Verzeichnisse unter `~` sowie `~/.raven/workspace/skills/archify`

<!-- oma-docs:ignore-start -->
Ein Treffer erfordert, dass die verwaltete oder angeheftete archify-Installation `bin/archify.mjs` enthält.
<!-- oma-docs:ignore-end -->

---

## Konfiguration

Der sparsame Konfigurationsabschnitt in `.agents/oma-config.yaml` (fehlende Schlüssel verwenden die angegebenen Standardwerte):

```yaml
diagram:
  engine: auto                # auto | archify | mermaid
  explain_sidecar: false      # /explain also writes an archify sidecar
  archify:
    managed: true             # false = never download; use pins / skill dirs only
    channel: stable           # stable (latest GitHub Release) | main (HEAD of main)
    check_interval_min: 60    # minutes between remote checks; 0 = every call
    path: null                # explicit install dir (pin)
    quality: showcase         # showcase | standard  → --quality
    open: false               # pass --open to deliver
```

| `engine` | Verhalten |
|---|---|
| `auto` (Standard) | archify, sobald es aufgelöst werden kann (verwaltet, gepinnt oder im Skill-Verzeichnis), andernfalls Mermaid |
| `archify` | archify ist erforderlich. `oma diagram resolve` beendet sich mit 1, wenn nichts aufgelöst wird (erster Lauf offline); Workflows stoppen, statt still herunterzustufen |
| `mermaid` | archify wird nie aufgerufen |

Ein Prompt kann die Konfiguration für einen Lauf überschreiben (`/explain 640 with archify`).

---

## CLI

```bash
oma diagram resolve [--engine auto|archify|mermaid] [--refresh] [--offline] [--json]
oma diagram update  [--json]
oma diagram archify <archify args…>
```

`oma diagram archify` führt die aufgelöste archify-Binärdatei mit `ARCHIFY_UPDATE_CHECK_DISABLED=1` (kein Netzwerk) aus und reicht den Exit-Code weiter. Daher verhalten sich `validate` / `deliver` / `visual-check` genau so, wie es die archify-Dokumentation beschreibt:

```bash
oma diagram archify guide "show the auth request lifecycle" --json
oma diagram archify validate architecture adr-auth.archify.json --quality showcase --json
oma diagram archify deliver  architecture adr-auth.archify.json adr-auth.archify.html --quality showcase --json
oma diagram archify visual-check adr-auth.archify.html --json   # exit 2 = no Chrome, reported as skipped
```

`--json` bei `resolve` gibt `{ ok, requested, engine, quality, open, explainSidecar, archify?: { root, bin, version, source, status?, note? }, reason, probed }` zurück. `source` ist `managed:<tag>`, `config:…`, `env:…` oder eine Bezeichnung des Skill-Verzeichnisses; bei verwalteten Kopien werden `status` (`fresh` / `current` / `stale`) und `note` gesetzt.

---

## Nutzung durch die Workflows

Das gemeinsame Protokoll liegt in `.agents/skills/_shared/conditional/diagram-engine.md`. Beide Workflows folgen derselben Reihenfolge:

1. `oma diagram resolve --json`
2. Zuerst den Mermaid-Block schreiben (immer).
3. Bei `engine: archify` die Mermaid-Topologie in das JSON-IR von archify (`architecture` / `sequence` / `dataflow` / `lifecycle` / `workflow`) übersetzen und dabei nur das passende Schema und ein Beispiel aus der Installation lesen.
4. `validate` → reparieren → `deliver`. **Es gibt kein festes Iterationslimit.** Der Agent repariert, solange die objektive Fehlerzahl von archify sinkt, und stoppt erst nach archifys eigener Konvergenzregel (zwei aufeinanderfolgende Runden ohne Verbesserung). Semantische Labels werden nicht nur zum Bestehen gelöscht.
5. Das HTML verlinken — niemals einbetten.

### `/architecture`

Nur für strukturelle Entscheidungen (Grenzen, Abhängigkeiten, Datenfluss). Ausgabe neben dem Markdown-Artefakt unter `.agents/results/architecture/`:

```
adr-notification-service.md            # Mermaid block + "Interactive:" link
adr-notification-service.archify.json  # frozen spec (kept even on failure)
adr-notification-service.archify.html  # delivered viewer
```

### `/explain`

Opt-in, weil der eigene Vertrag des Explainers (eine eigenständige Datei mit CSS-Variablen-Theming) das Einbetten eines zweiten vollständigen HTML-Dokuments nicht zulässt. Aktivieren Sie es mit `diagram.explain_sidecar: true` oder fragen Sie im Prompt danach. Das Sidecar `{date}-{slug}.archify.html` wird aus dem primären System-/Datenflussdiagramm des Explainers abgeleitet und mit einem einfachen `<a href>` verlinkt; ein Fehler des Sidecars blockiert den Explainer nie.

---

## Fehlerfälle

| Situation | Ergebnis |
|---|---|
| Update-Prüfung schlägt fehl (offline, rate-limitiert) | Gecachte Kopie wird verwendet und mit dem Grund als `stale` gemeldet |
| Kein Cache, kein Netzwerk, kein Skill-Verzeichnis, `engine: auto` | Nur Mermaid; der Bericht empfiehlt, einmal online `oma diagram update` auszuführen |
| Gleiches, aber `engine: archify` | Workflow stoppt (`ok: false`) mit dem Hinweis auf `oma diagram update` |
| `validate` konvergiert nie | Mermaid bleibt das ausgelieferte Diagramm; die letzte `.archify.json` bleibt für eine manuelle Prüfung liegen und Diagnosen werden wörtlich gemeldet |
| Chrome fehlt für `visual-check` | Als `skipped` gemeldet, niemals als bestanden |

---

## Verwandte Seiten

- [Code-Erklärer](/docs/guide/code-explainer) — `/explain`-Workflow
- [Semantik von oma-config.yaml](/docs/guide/oma-config-semantics)
- archify upstream: [tt-a1i/archify](https://github.com/tt-a1i/archify)
