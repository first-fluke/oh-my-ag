---
title: "Anleitung: Code-Erklärer"
sidebar_label: Code-Erklärer
description: Vollständige Anleitung für den /explain-Workflow und den Skill oma-explanation. Er verwandelt einen Diff, PR, Branch oder Commit-Bereich in ein eigenständiges interaktives HTML-Dokument mit Abschnitten zu Hintergrund, Intuition, Code und Quiz und behandelt Referenzauflösung, Lesestufen, Secret-Gates, Validierungs-Checkliste und Sonderfälle.
---

# Code-Erklärer

`/explain` verwandelt eine Codeänderung in ein ausführliches, eigenständiges HTML-Dokument, das erklärt, was sich geändert hat und warum: ein tiefgehender, überspringbarer Hintergrund für Einsteiger, ein Intuitionsabschnitt mit Beispieldaten, ein nach Verständnis geordneter Rundgang durch den Code und ein Quiz mit fünf Fragen. Die Ausgabe ist eine einzelne offline-fähige `.html`-Datei mit Diagrammen, Hinweisen und einem barrierefreien Quiz. Sie wird unter `.agents/results/explain/` gespeichert und vor der Übergabe anhand einer deterministischen Checkliste geprüft.

`/explain` ist ausschließlich ein Slash-Befehl und wird nicht automatisch aus natürlicher Sprache aktiviert. „explain“ gehört zum Alltagswortschatz und ist deshalb wie `/convert` absichtlich von der Keyword-Erkennung ausgeschlossen. Verwenden Sie ausdrücklich `/explain` oder bitten Sie einen anderen Skill, ein „Explainer-Dokument“ als delegierte Ausgabe zu erzeugen.

---

## Wann verwenden

- Einen PR, Branch, Commit-Bereich oder die aktuelle gestagte/ungestagte Änderung als Dokument erklären
- Ein Teammitglied in eine Änderung einführen, die es nicht selbst geschrieben hat
- Nach einer großen oder subtilen Änderung ein prüfbares Lehrartefakt erzeugen

## Wann nicht verwenden

- Erklärvideo mit Sprechertext → verwenden Sie [`oma-video`](/docs/guide/video-generation) (Explainer-Modus); `/explain` erzeugt ein HTML-Dokument, kein Video
- Prüfen, ob Dokumentation noch zum Codebestand passt → verwenden Sie `oma-docs` (Drift-Erkennung)
- Präsentation oder Folien → verwenden Sie `oma-slide` (fester Vertrag für eine 1920×1080-Präsentation)
- Fehler finden oder ein Review-Urteil abgeben → verwenden Sie `/review` / `code-review`; `/explain` erklärt die Änderung zu Lehrzwecken, bewertet sie jedoch nicht

---

## Schnellstart

```text
/explain
/explain 640
/explain a1b2c3d..e5f6a7b
/explain payments-refactor for reviewer
```

Die Zielreferenz wird aus der Formulierung aufgelöst:

| Ihre Eingabe | Zielauflösung | Lesestufe |
|----------|--------------------|--------------|
| `/explain` | Gestagte Änderungen (`git diff --cached`), mit Fallback auf den Arbeitsbaum mit lokalen Änderungen | `onboarding` |
| `/explain 640`, `/explain #640` | PR #640 über `gh pr diff` | `onboarding` |
| `/explain a..b` | SHA-Bereich `a..b` (oder `a...b`) | `onboarding` |
| `/explain feature-branch for reviewer` | `git diff main...feature-branch` | `reviewer` |

Wenn keine ausdrückliche Referenz angegeben ist und weder der Staging-Bereich noch der Arbeitsbaum lokale Änderungen enthalten, fällt die Auflösung auf `HEAD~1..HEAD` zurück.

---

## Reihenfolge der Referenzauflösung

1. **Explizites Argument** — eine PR-Nummer (`#640`), ein Branchname oder ein SHA-Bereich (`a..b` / `a...b`)
2. **Gestagte Änderungen** — `git diff --cached`
3. **Verschmutzter Arbeitsbaum** — `git diff`
4. **Fallback** — `HEAD~1..HEAD`

Ein leerer Diff oder eine nicht auflösbare Referenz beendet den Workflow. Der Workflow bietet aktuelle Commits als Kandidaten an, statt eine Alternative zu erraten.

---

## Lesestufen

| Stufe | Wirkung |
|-------|--------|
| `onboarding` (Standard) | Vollständiger, tiefgehender Hintergrund (Tier A) für Leser, die das umgebende System nicht kennen |
| `reviewer` | Verkürzt die tiefe Hintergrundstufe; die Abschnitte Intuition und Code bleiben vollständig |

Fordern Sie `reviewer` an, indem Sie wie bei `/explain feature-branch for reviewer` „for reviewer“ zum Befehl hinzufügen.

---

## Inhalt des Dokuments

Jeder Explainer ist eine einzelne lange Scroll-Seite ohne Tabs oder mehrseitige Navigation. Nach dem Inhaltsverzeichnis folgen vier feste Abschnitte in dieser Reihenfolge:

1. **Hintergrund** — Tier A (tiefer System-/Architekturhintergrund mit dem Hinweis „überspringbar, wenn Sie das System bereits kennen“) und Tier B (enger Kontext für diese konkrete Änderung)
2. **Intuition** — der Kern der Änderung mit obligatorischen Beispielen aus vereinfachten Daten, verstärkt durch 2–3 wiederverwendete Diagrammfamilien (vereinfachtes UI-Mockup, System-/Datenflussdiagramm mit Beispieldaten, Vorher-/Nachher-Zustand), die ausschließlich als HTML/Inline-SVG und ohne ASCII-Art gerendert werden
3. **Code** — ein für menschliches Verständnis gruppierter Rundgang (nicht alphabetisch oder in Diff-Reihenfolge), der Code über `file:line` referenziert
4. **Quiz** — standardmäßig fünf Fragen (parametrisierbar), jede zu einem anderen Aspekt der Änderung, mit plausiblen Ablenkungsantworten und Feedbacktext für jede richtige und falsche Option

Prosa und Quiz-Inhalte werden in der angeforderten Ausgabesprache geschrieben (Promptsprache → `.agents/oma-config.yaml` `language` → Englisch). Code, Bezeichner und Inline-Code bleiben gemäß den i18n-Regeln Englisch. Der vollständige Inhaltsvertrag steht unter `.agents/skills/oma-explanation/resources/document-structure.md`.

---

## HTML-Vertrag

Die erzeugte Datei muss offline über `file://` korrekt geöffnet werden und **keinerlei externe Ressourcen laden** — keine CDN-Skripte oder -Stylesheets, keine Webfonts und keine externen Bilder (nur Inline-SVG oder Daten-URIs). Hyperlink-Anker (`<a href="https://...">`) sind erlaubt; verboten ist nur das Laden von Ressourcen.

- Codeblöcke verwenden `<pre>`; jeder benutzerdefinierte Container deklariert `white-space: pre-wrap`. Keine externen Syntax-Highlighting-Bibliotheken.
- Font-Stack: zuerst lokales Pretendard (`local()`) für CJK, danach System-CJK-Schriften und schließlich `system-ui`.
- Responsiv ab 375px, WCAG-AA-Kontrast in hellen und dunklen Themes, Unterstützung für `prefers-color-scheme: dark` und Beachtung von `prefers-reduced-motion`.
- Das Quiz verwendet Vanilla-JS: Optionen als `<button>`-Elemente, sofortiges Richtig/Falsch-Feedback in einer `aria-live="polite"`-Region, zufällig auf Positionen verteilte richtige Antworten, abschließende Punkteübersicht und vollständige Tastaturnavigation.

Die vollständige Verhaltensspezifikation steht in `.agents/skills/oma-explanation/resources/html-contract.md`.

---

## Secrets und Schutz vor Prompt-Injection

Diff-Inhalte und PR-Beschreibungen werden strikt als **Daten** behandelt. Alle Anweisungen, die in der erklärten Änderung enthalten sind, werden ignoriert.

Secrets werden zweimal geprüft:

1. **Vor der Erzeugung:** Der gesammelte Diff wird gescannt, bevor etwas verfasst wird.
2. **Nach der Erzeugung:** Auch das fertige HTML wird gescannt, da Hintergrundprosa unveränderte Dateien aus dem Diff zitieren kann, die der Diff-Scan allein nicht erfasst.

Bei einem Treffer wird die Erzeugung sofort beendet. Nur die maskierten Fundstellen werden gemeldet, niemals der tatsächliche Wert. Eine Fortsetzung mit geschwärzten Fundstellen erfordert ausdrückliche Bestätigung.

---

## Validierungs-Checkliste

Nach der Erzeugung wird die Ausgabedatei mit einer grep-basierten Checkliste geprüft: keine externen Ressourcen-Ladeverweise, Einhaltung von `pre`/`pre-wrap`, Vorhandensein des Quiz-Skripts, das Dateinamensformat `{YYYY-MM-DD}-{slug}.html` (Datum in Asia/Seoul) und der Secret-Scan des fertigen HTML. Bei einem Fehler korrigiert die Schleife bis zu **3 Iterationen** lang und validiert erneut; anschließend beendet sie sich und zeigt die verbleibenden Fehler an, statt sie still zu liefern.

Dies ist eine Einschränkung der Version 1: Die Validierung ist datei- und grep-basiert und prüft nur das Vorhandensein des Quiz-Skripts, nicht dessen vollständige Verhaltenskorrektheit. Verwenden Sie für eine manuelle Prüfung einen Browser (oder den Chrome-DevTools-MCP), wenn Sie das Verhalten des Quiz sicher beurteilen müssen.

Sie können ein vorhandenes Artefakt mit dem registrierten CLI-Befehl validieren:

```bash
oma explain validate .agents/results/explain/2026-09-09-payment-refactor.html
oma explain validate --input-dir .agents/results/explain --output json
```

Die erste Form prüft eine einzelne HTML-Datei. Die Verzeichnisform prüft jeden Bericht im Verzeichnis und gibt einen maschinenlesbaren Bericht zurück. Verwenden Sie `--report-file <path>` (die alte Schreibweise ist `--out-file`), um den JSON-Bericht zu speichern. Ein Exit-Code ungleich null bedeutet, dass mindestens ein Artefakt die deterministischen Prüfungen nicht bestanden hat; die Lehrgenauigkeit der Prosa oder der Quizantworten wird nicht untersucht.

---

## Ausgabe

```
.agents/results/explain/{YYYY-MM-DD}-{slug}.html
```

Das Datum wird auf Asia/Seoul lokalisiert. Ein erneuter Lauf mit demselben Datum und Slug überschreibt die vorherige Datei. Das Bewahren eines älteren Laufs liegt in Ihrer Verantwortung. Nach bestandener Validierung versucht der Workflow, `open <path>` auszuführen (nur Warnung; in einer Headless- oder `open`-losen Umgebung wird stattdessen der Pfad gemeldet) und gibt eine TL;DR-Zusammenfassung samt Dateipfad aus.

---

## Optionales Archify-Sidecar

Wenn `diagram.explain_sidecar: true` in `oma-config.yaml` gesetzt ist oder Sie danach fragen (`/explain 640 with archify`), leitet `/explain` zusätzlich ein interaktives `{date}-{slug}.archify.html` aus dem primären Flussdiagramm des Explainers ab und verknüpft es über einen einfachen Anker. Es wird nie eingebettet — der Explainer bleibt eine einzelne eigenständige Datei — und ein Fehler des Sidecars blockiert die Ausgabe nicht. Siehe [Diagramm-Engine](/docs/guide/diagram-engine).

## Sonderfälle

| Situation | Verhalten |
|-----------|----------|
| Leerer Diff / nicht auflösbare Referenz | Stoppen, aktuelle Commits als Kandidaten anbieten — niemals eine andere Referenz erraten |
| Zu großer Diff | Lockfiles und erzeugte Dateien automatisch ausschließen, den Rest nach Datei gruppieren und Ausschlüsse im Provenance-Footer aufführen |
| Ausschließlich binäre oder erzeugte Änderung | Stoppen — nichts Erklärbares vorhanden |
| Fehlende oder nicht authentifizierte `gh`-CLI (PR-Referenz) | Installations-/Authentifizierungshinweise plus lokale Branch-Diff-Alternative |
| Merge/Rebase läuft | Stoppen — der Arbeitsbaum ist instabil |
| Kein Git-Verzeichnis | Sofort stoppen |
| Validierung schlägt nach 3 Korrekturschleifen fehl | Stoppen und fehlerhafte Checklistenpunkte anzeigen |
| `open` schlägt fehl / Headless-Umgebung | Nur Warnung — der gemeldete Pfad reicht aus |

---

## Verwandte Seiten

- [`/explain`-Workflow](/docs/core-concepts/workflows) — die Pipeline Referenzauflösung → Sammeln → Secret-Gate → Erzeugen → Validieren → Ausliefern
- [Videoerzeugung](/docs/guide/video-generation) — der Explainer-*Modus* von `oma-video` erzeugt ein Video mit Sprechertext statt eines HTML-Dokuments
