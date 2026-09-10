---
title: "Skill-Optimierung"
sidebar_label: Skill-Optimierung
description: Mit oma skill optimize eine dauerhafte, evidenzbasierte Skill-Weiterentwicklung mit deterministischen Train-, Validierungs- und vom Runner verwalteten Holdout-Gates durchführen.
---

# Skill-Optimierung

`oma skill optimize` entwickelt die `SKILL.md` eines Skills weiter, um den von `oma skill eval` gemessenen `utilityLift` zu maximieren. Es trennt rohe Rollout-Evidenz, dauerhaftes domänenspezifisches Wissen und den ausführbaren Skill. Ein Wiki Maintainer bündelt beobachtbare Erfolge und Fehler; ein Proposer verwendet dieses Wissen, um begrenzte Add-/Delete-/Replace-Änderungen auszugeben. Kandidaten müssen den Nutzwert auf der zurückgehaltenen Validierung verbessern; `--apply` erfordert zusätzlich eine Verbesserung auf einem vom Runner verwalteten Holdout-Split. Bei der Bereitstellung gibt es keine zusätzliche Wiki-Suche zur Laufzeit: Die Ausgabe bleibt eine `SKILL.md`.

Forschungsgrundlage: Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C. und Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## Harte Abhängigkeit: Evaluierungs-Fixtures

`oma skill optimize` kann ohne Evaluierungs-Fixtures nicht laufen. Es benötigt mindestens **5 Aufgaben-Fixtures** (`MIN_TASKS = 5`) unter `.agents/eval/<skill>/`. Werden weniger gefunden, meldet der Befehl sofort einen Fehler:

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

Siehe die [Anleitung zur Skill-Nutzwert-Evaluierung](/docs/guide/skill-eval) für die Verzeichniskonvention `.agents/eval/<skill>/`, das Fixture-Schema, Prüfertypen und das Vorbereiten von Rollouts für Mock-Wiedergabe.

---

## So funktioniert es

Fixtures werden nach Aufgaben-ID sortiert und deterministisch in **Trainings-, zurückgehaltene Validierungs- und vom Runner verwaltete Final-Test-Sets** geteilt. Bei mindestens fünf Fixtures sind die Zielanteile 60/20/20, und jede Partition enthält mindestens eine Aufgabe. Die Final-Test-Aufgaben stammen aus diesem lokalen Fixture-Set; während der Schleife werden sie vor Maintainer und Proposer zurückgehalten und nicht aus einer verborgenen externen Suite geladen.

Für jede Epoche (bis zu `--max-epochs`, Standard 8):

1. **Aktuell besten `SKILL.md` auf dem TRAIN-Split bewerten** — `oma skill eval` gibt beobachtbare Prompts, Ausgaben und Lift pro Aufgabe zurück.
2. **Wiki Maintainer bündelt Evidenz** — bis zu fünf Fehler und drei Erfolge werden zu evidenzverknüpften Mustern; bereichsbezogene Muster und frühere Gate-Ergebnisse werden aus OMAs L1/L2/L3-Speichersystem abgerufen.
3. **Proposer gibt K-Kandidatenänderungen aus** (bis zu `--edits-per-epoch`, Standard 4). Exakte Änderungen aus der dauerhaften Ablehnungshistorie werden übersprungen.
4. **Für jede Kandidatenänderung:**
   - Änderung auf eine In-Memory-Kopie von `SKILL.md` anwenden.
   - Kandidaten validieren (`name`/`description` im Frontmatter müssen erhalten bleiben; der Body muss parsebar sein).
   - Textbudget der Lernrate erzwingen: Änderungen verwerfen, deren Nettozeichenänderung `--lr` (Standard 600 Zeichen) überschreitet.
   - Kandidaten auf dem **zurückgehaltenen Validierungssplit** neu bewerten.
5. **Besten Validierungskandidaten akzeptieren, genau dann wenn** der Validierungs-Lift strikt steigt (`Δlift > 0`) **und** kein Eintrag negativer Übertragung die Regressionsgrenze (`NEG_TRANSFER_FAIL = -0.1`) verletzt. Jedes Proposal-Gate wird gespeichert.
6. **Früh stoppen**, nachdem 2 aufeinanderfolgende Epochen ohne angenommene Änderung vergangen sind (`OPT_EARLY_STOP_PATIENCE = 2`).
7. **Nach der Weiterentwicklung den vom Runner verwalteten Final-Test ausführen.** Maintainer und Proposer sehen diese Aufgaben während der Schleife nie. Ein fehlgeschlagener Final-Test verhindert `--apply` und speichert den Validierungssieger als abgelehntes Wissen.

Der Optimierer bearbeitet die aktive `SKILL.md` während der Schleife nie. Er arbeitet immer mit einer Kandidatenkopie im Speicher.

---

## Verwendung

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### Flags

| Flag | Standard | Beschreibung |
|:-----|:--------|:-----------|
| `--skill <id>` | `_all` | Zu optimierende Skill-ID (einfacher Name ohne Pfadtrenner). |
| `--dry-run` | **ja (Standard)** | Änderungen vorschlagen und Diff ausgeben, ohne `SKILL.md` zu ändern; erzeugte Evidenz und Evolutionsevents werden trotzdem gespeichert. |
| `--apply` | — | Angenommene Änderungen auf `SKILL.md` anwenden — Original vor einem atomaren Schreiben sichern. Läuft nur, wenn Validierungs- und vom Runner verwaltete Final-Test-Gates bestehen; ein OMA-eigener Skill benötigt zusätzlich `--yes`. |
| `--mock` | **ja (Standard)** | Aufgezeichnete Optimiereränderungen und Evaluierungsurteile aus `_rollouts/` wiedergeben. Deterministisch, offline und CI-sicher. |
| `--live` | — | Live-LLM-Optimierer-Dispatch — verursacht pro Epoche echte Modellaufrufe. Gibt eine Kostenvorschau aus und fragt ohne `--yes` nach Bestätigung. |
| `--max-epochs <n>` | `8` | Maximale Zahl der Optimierungsepochen. |
| `--edits-per-epoch <k>` | `4` | Kandidatenänderungen, die das Optimierer-LLM pro Epoche vorschlägt. |
| `--lr <chars>` | `600` | Textbudget der Lernrate: maximale Nettozeichenänderung pro angenommener Änderung. |
| `--yes` | — | Kostenvorschau-Bestätigung überspringen. Nur mit `--live` relevant. |
| `--json` | — | JSON-Ausgabe für CI/CD. |
| `--output <format>` | `text` | Ausgabeformat (`text` oder `json`). |

---

## Minimales Beispiel von Ende zu Ende

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

Beispielausgabe:

```
[oma skill opt] skill: oma-scholar, tasks: 8 (train: 4, val: 4), dry-run: true

Skill opt  (skill: oma-scholar)
  applied: false
  baselineLift: 18.5%  finalLift: 32.0%
  epochs: 3  acceptedEdits: 2  rejected: 6

  diff:
--- a/SKILL.md
+++ b/SKILL.md
@@ -12,6 +12,9 @@
 ### When to use
 - User asks to look up an academic paper or technical claim.
+- User asks for a summary of arxiv abstracts or DOI-linked documents.
 - User wants citations or sources for a factual statement.
```

Der Diff zeigt, was der Optimierer schreiben würde. `SKILL.md` bleibt unverändert, während erzeugte Evolutions-Evidenz und bereichsbezogene Gate-Ergebnisse für künftige Läufe gespeichert werden.

---

## Eine validierte Verbesserung anwenden

Wenn Sie mit dem vorgeschlagenen Diff zufrieden sind, führen Sie den Befehl erneut mit `--apply` aus:

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

`--apply` schreibt nur, wenn die Optimierung eine strikt positive Verbesserung bei der Validierung gefunden hat und der Lift des vom Runner verwalteten Final-Test-Kandidaten größer ist als der Baseline-Lift. Vor dem atomaren Schreiben wird eine Sicherung der ursprünglichen `SKILL.md` erstellt. Der Diff wird immer ausgegeben, damit Sie die Änderung prüfen können.

---

## Live-Modus

Der Live-Modus ruft echten Maintainer und Proposer auf und führt pro Epoche die Live-Evaluierungsarme erneut aus. Er ist teuer: Jede bewertete Aufgabe erzeugt Baseline- und Treatment-Aufrufe, Judge-Fixtures zusätzliche Bewertungsaufrufe, und der Final-Test bewertet Original- und Kandidatentext. Die Vorschau meldet eine Obergrenze der tatsächlichen Modellaufrufe aus der aktuellen Aufteilung. Jeder Aufruf hat ein Timeout von 120 Sekunden; Claude-Evaluierungsarme laufen eingeschränkt, ohne Umgebungstools, Skills, MCP und AgentMemory.

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

Die Kostenvorschau listet die Obergrenze der Modellaufrufe auf, bevor irgendein LLM-Aufruf erfolgt.

---

## JSON-Ausgabe

```bash
oma skill optimize --skill oma-scholar --json
```

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "baselineLift": 0.1850,
  "finalLift": 0.3200,
  "epochCount": 3,
  "acceptedEdits": [
    { "op": "add", "anchor": "### When to use", "after": "\n- User asks for a summary of arxiv abstracts or DOI-linked documents." }
  ],
  "rejectedCount": 6,
  "applied": false,
  "diff": "--- a/SKILL.md\n+++ b/SKILL.md\n...",
  "_dryRun": true,
  "finalTest": { "baselineLift": 0.10, "candidateLift": 0.25, "passed": true },
  "_split": { "trainCount": 4, "valCount": 1, "testCount": 3 }
}
```

`ok` ist nur dann `true`, wenn der Kandidat die Validierung verbessert und der vom Runner verwaltete Final-Test nicht fehlschlägt (oder der Kandidat angewendet wurde). Die `_split`-Zahlen zeigen die tatsächliche lokale Fixture-Aufteilung des Laufs.

---

## SSOT-Hinweis für `oma-*`-Skills

Skills mit einer ID, die mit `oma-` beginnt, gehören oh-my-agent und werden durch `oma update` **überschrieben**. Für diese Skills wird `--apply` nicht empfohlen. Verwenden Sie `--dry-run` (Standard), prüfen Sie den vorgeschlagenen Diff und übertragen Sie sinnvolle Änderungen in die Registry. Für benutzererstellte Skills ist `--apply` sicher.

Der Befehl gibt eine Warnung aus, wenn der Zielskill OMA gehört:

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

---

## Schutz vor Overfitting

Maintainer und Proposer sehen nur die Rollout-Evidenz des TRAIN-Splits. Die Kandidatenauswahl verwendet den zurückgehaltenen VALIDATION-Split; der vom Runner verwaltete TEST-Split bleibt bis zum Ende der Evolution verborgen. Ein Validierungssieger, der den Final-Test nicht verbessert, wird nicht angewendet und der dauerhaften Ablehnungshistorie hinzugefügt.

---

## CI-Integration

Im `--mock`-Modus ist `oma skill optimize` vollständig deterministisch und offline — kein LLM wird aufgerufen. Verwenden Sie es in CI, um zu prüfen, dass ein vorgeschlagener Skill-Diff gegenüber den aufgezeichneten Rollouts weiterhin Lift zeigt:

```bash
oma skill optimize --skill oma-scholar --mock --json
```

Exit-Codes:
- `0` — Optimierung abgeschlossen (mit oder ohne Verbesserung)
- `1` — weniger als `MIN_TASKS` Fixtures oder ungültiges `--skill`-Argument

---

## Siehe auch

- [Skill-Nutzwert-Evaluierung](/docs/guide/skill-eval) — Aufgaben-Fixtures, Prüfertypen, Mock-/Live-Modi und das Verzeichnis `_rollouts/`.
- [CLI-Befehle](/docs/cli-interfaces/commands) — Flag-Referenz für alle Skill-Verwaltungsbefehle.
