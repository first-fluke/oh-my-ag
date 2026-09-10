---
title: "Skill-Nutzwert-Evaluierung"
sidebar_label: Skill-Evaluierung
description: Aufgabefixtures für oma skill eval, die Konvention des Verzeichnisses .agents/eval/, Prüfertypen und Mock-/Live-Ausführungsmodi erstellen.
---

# Skill-Nutzwert-Evaluierung

`oma skill eval` misst, ob das Laden eines Skills die Ergebnisse von Agentenaufgaben tatsächlich verbessert. Es beantwortet eine andere Frage als `oma skill audit` (dort geht es um die Redundanz zweier Skills): Es fragt „Hilft dieser Skill?“

Das Design folgt zwei Forschungsergebnissen: WikiSkill (arXiv:2608.27454) trennt rohe Erfahrung, persistentes Wissen und ausführbare Skills und behält dabei zurückgehaltene Gates für die Weiterentwicklung bei; SkillLens (arXiv:2605.23899) zeigt, dass der Nutzwert eines Skills unabhängig von der Eigenständigkeit seiner Beschreibung ist — ein eigenständiger Skill kann nutzlos bleiben, und ein überlappender Skill kann trotzdem helfen.

---

## So funktioniert es

Für jede Aufgaben-Fixture führt der Befehl zwei Arme aus:

1. **Baseline-Arm** — der Aufgaben-Prompt wird an einen Agenten verteilt, ohne den Skill bereitzustellen.
2. **Treatment-Arm** — `SKILL.md` wird dem Prompt vorangestellt und danach dieselbe Aufgabe verteilt.

Jeder Arm wird vom Checker der Aufgabe bewertet (0 = nicht bestanden, 1 = bestanden). Die primäre Kennzahl ist:

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

Ein Skill besteht, wenn `utilityLift ≥ 5%`. Unterhalb dieser Schwelle gibt es eine Warnung (marginaler Lift) oder ein Nichtbestehen (kein Lift). Für ein Urteil sind mindestens 5 bewertbare Aufgaben erforderlich.

---

## Die Konvention `.agents/eval/<skill>/`

Legen Sie Aufgaben-Fixtures unter `.agents/eval/<skill>/` ab. Dieser Pfad liegt innerhalb von `.agents/`, aber außerhalb des Skill-Verzeichnisses selbst. Dadurch bleibt er bei `oma update` erhalten und überschreibt keine benutzererstellten Evaluierungen.

```
.agents/eval/
└── oma-scholar/
    ├── claims-only.yaml        ← task fixture
    ├── entity-lookup.yaml
    ├── partial-fetch.yaml
    ├── structured-output.yaml
    ├── edge-empty-response.yaml
    └── _rollouts/
        └── a3f1b2c4d5e6f7a8.json   ← recorded arm outputs + judge verdicts
```

Dateien, die mit `_` beginnen, werden beim Laden von Aufgaben-Fixtures übersprungen. Das Unterverzeichnis `_rollouts/` enthält aufgezeichnete Ausgaben früherer `--live --record`-Läufe.

---

## Schema der Aufgaben-Fixture

Jede Fixture ist eine YAML-Datei mit den folgenden Feldern:

```yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
checker:
  type: judge
  rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

| Feld | Erforderlich | Beschreibung |
|:------|:---------|:-----------|
| `id` | Ja | Eindeutige ID für diese Aufgabe (wird in Rollout-Dateinamen und Berichten verwendet) |
| `skill` | Ja | Zu evaluierender Skill (entspricht dem Namen des übergeordneten Verzeichnisses) |
| `domain` | Ja | Bezeichnung der Domäne (für Gruppierung und künftige Erkennung negativer Übertragung) |
| `prompt` | Ja | Aufgaben-Prompt, der an beide Arme verteilt wird |
| `checker` | Nein | Bewertung der Armausgabe. Standard ist `{ type: judge }`, wenn das Feld fehlt. |
| `weight` | Ja | Relatives Gewicht im gewichteten Mittelwert (verwenden Sie `1`, sofern Aufgaben keine unterschiedliche Bedeutung haben) |

### Prüfertypen

#### judge (Standard)

Ein LLM bewertet die Ausgabe des Arms anhand einer Rubrik und gibt PASS oder FAIL zurück. Dies ist der Standard, wenn `checker` fehlt oder `checker.type` nicht vorhanden ist.

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

Das Feld `rubric` ist optional. Fehlt es, gilt die Standardrubrik: „Erfüllt die Antwort den Aufgaben-Prompt korrekt und vollständig?“

Sie können die Rubrik zur Kürze auch auf der obersten Ebene angeben:

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**Wichtig:** Im `--mock`-Modus benötigen judge-Aufgaben ein zuvor aufgezeichnetes Urteil in `_rollouts/`. Gibt es für eine Aufgabe kein aufgezeichnetes Urteil, wird sie mit einer Warnung aus dem Bericht ausgeschlossen. Führen Sie zuerst `--live --record` aus, um die Rollouts zu füllen.

Dasselbe gilt für jeden Prüfertyp, wenn ein Arm vollständig fehlt: Die Aufgabe wird ausgeschlossen und nicht mit 0 bewertet. Fehlende Daten sind keine fehlgeschlagene Antwort — eine Bewertung würde beide Arme zu 0 machen und ein Lift von null würde `decision: "fail"` lesen. Ausschlüsse, die die Zahl bewerteter Aufgaben unter `MIN_TASKS` senken, führen zu `coverage: "insufficient"`.

#### assert (opt-in)

Deterministische Teilstring-Prüfung. Verwenden Sie sie für Vertrags-, Format- oder Tool-Call-Prüfungen, bei denen die erwartete Ausgabe exakt ist.

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

Besteht, wenn jeder String in `expect_contains` in der Armausgabe vorkommt.

#### regex (opt-in)

Deterministische Regex-Prüfung. Verwenden Sie sie, wenn ein Muster statt einer exakten Zeichenfolge nötig ist.

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

Muster mit mehr als 200 Zeichen werden mit 0 bewertet (ReDoS-Schutz). Vor der Übereinstimmung wird die Ausgabe auf 10.000 Zeichen gekürzt.

---

## Ausführungsmodi

### --mock (Standard)

Spielt aufgezeichnete Rollouts aus `_rollouts/` ab. Vollständig deterministisch und offline — kein LLM wird aufgerufen.

- Für `assert`-/`regex`-Prüfer werden Scores aus den aufgezeichneten Ausgabestrings berechnet.
- Für `judge`-Prüfer wird das von `--live --record` aufgezeichnete Feld `score` wiedergegeben.

Fehlt für eine judge-Aufgabe ein aufgezeichneter Score in `_rollouts/`, wird sie mit einer Konsolenwarnung aus dem Bericht ausgeschlossen. Dadurch bleibt der Mock-Modus strikt offline.

Aufzeichnungen werden vor der Verwendung auch auf Veraltetheit geprüft. Ein Treatment-Eintrag, der unter einem anderen SKILL.md-Text aufgezeichnet wurde, ein Eintrag mit geändertem Fixture-`prompt` und jeder Eintrag ohne Provenance-Aufzeichnung werden mit einer Warnung verworfen, die Datei und Anzahl nennt. Bleiben dadurch weniger als `MIN_TASKS` bewertbare Aufgaben, meldet der Lauf `coverage: "insufficient"` statt eines Urteils — ein bearbeiteter Skill übernimmt also nie unbemerkt seinen alten Score.

:::note `oma skill optimize --mock`
Der Optimierer bewertet Kandidateninhalte von SKILL.md. Da eine Aufzeichnung nur für den Text gültig ist, mit dem sie erstellt wurde, besitzen Kandidaten keine passenden Rollouts und melden fehlende Abdeckung. Verwenden Sie `--live`, um Kandidaten zu bewerten.
:::

Sicher für CI. Setzen Sie `OMA_SKILLEVAL_MOCK=1`, um diesen Modus zu erzwingen.

```bash
oma skill eval --skill oma-scholar
```

### --live

Startet echte Agentenarme über `oma agent spawn --read-only`. Beide Arme laufen in einem temporären Workspace, damit keine Projektdateien geändert werden.

Vor dem Dispatch gibt der Befehl eine Kostenvorschau mit Zahl der Aufgaben, Arm-Dispatches, Judge-Dispatches und aufgelöstem Vendor aus. Bestätigen Sie mit `y` oder überspringen Sie mit `--yes`.

Die übrigen Steuerungen sind in CI und bei der Untersuchung der Coverage nützlich:

| Option | Wirkung |
| --- | --- |
| `--task-dir <path>` | Fixtures aus einem anderen Verzeichnis als `.agents/eval/<skill>` evaluieren. |
| `--max-tasks <n>` | Zahl der Fixtures für einen begrenzten Live-Lauf beschränken. |
| `--neg-transfer` | Nachbarn derselben Domäne auf negative Übertragung untersuchen; standardmäßig deaktiviert. |
| `--require-coverage` | Mit Exit-Code ungleich null enden, wenn weniger als fünf bewertbare gepaarte Aufgaben übrig bleiben. |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### Skill-Isolierung (Baseline ehrlich halten) {#skill-isolation-keeping-the-baseline-honest}

`utilityLift` ist nur aussagekräftig, wenn der **Baseline-Arm ohne Zielskill läuft**. Die Schwierigkeit: Ein verteilter Agent lädt automatisch jeden in seiner Laufzeit installierten Skill. Eine naive Baseline würde also weiterhin den Skill aufnehmen, der eigentlich gemessen werden soll — Baseline ≈ Treatment, Lift ≈ 0.

Um dies zu verhindern, führt `--live` **beide Arme in einem isolierten temporären Workspace** aus, dessen Skill-Verzeichnis jeden installierten Skill **außer dem Zielskill** enthält. Der Treatment-Arm fügt den Zielskill **nur** über die injizierte `SKILL.md` (vorangestellt im Prompt) wieder hinzu. Die Injektion ist somit die einzige kontrollierte Variable: Baseline = kein Skill, Treatment = Kandidaten-`SKILL.md`.

Das funktioniert, weil die meisten Vendors Skills **relativ zum Arbeitsverzeichnis** entdecken (z. B. `<cwd>/.claude/skills`, `<cwd>/.codex/skills`) — ein sauberes Arbeitsverzeichnis verbirgt den Skill tatsächlich. Der Bericht gibt über ein Feld `isolation` an, wie gut die Isolation gehalten hat:

| Status | Bedeutung |
|---|---|
| `enforced` | CWD-relativer Vendor, Zielskill fehlt im HOME-Pfad — vollständig isoliert. |
| `best-effort` | CWD-relativer Vendor, aber eine HOME-Kopie des Skills existiert ebenfalls (oder der Vendor ist unbekannt); die Projektkopie ist verborgen, eine HOME-Kopie kann jedoch durchsickern. Mit geringer Sicherheit markiert. |
| `unavailable` | HOME-basierter Vendor (z. B. **antigravity**, der `~/.gemini/antigravity-cli/skills` liest); ein sauberes CWD kann ihn nicht verbergen. Warnung und geringe Sicherheit. |
| n/a | Mock-Modus — kein Live-Dispatch. |

Wenn die Isolation nicht `enforced` ist, wird ein einzeiliger Warnhinweis ausgegeben; das Ergebnis ist als unsicher zu behandeln. Für ein sauberes Signal führen Sie die Evaluation mit einem CWD-relativen, isolierbaren Vendor (claude / codex / qwen) aus, nicht mit einem HOME-basierten. Der Evaluations-Vendor folgt `model_preset` in `.agents/oma-config.yaml`; wählen Sie daher ein Preset, dessen Standard-Vendor CWD-relativ ist.

### --live --record

Führt Live-Arme aus und schreibt die erfassten Ausgaben (einschließlich Judge-Urteilen für judge-Prüfungen) nach `_rollouts/<hash>.json`. Der Dateiname ist ein deterministischer SHA-256-Hash der Aufgaben-ID-Menge und nicht datums- oder zufallsbasiert.

Verwenden Sie dies, um auf dem eigenen Rechner die Grundlage für `--mock`-Läufe zu schaffen, damit Wiederholungsläufe offline bleiben.

Jeder Eintrag enthält Provenance, damit eine spätere Wiedergabe prüfen kann, ob er noch gilt:

| Feld | Aufgezeichnet bei | Verglichen mit |
|---|---|---|
| `skillBodyHash` | nur `treatment` | dem zu evaluierenden SKILL.md-Text |
| `promptHash` | beide Arme | dem aktuellen `prompt` der Fixture |

Der Baseline-Arm enthält den Skill nicht; eine Änderung von SKILL.md macht ihn nicht ungültig — nur der Treatment-Arm muss erneut aufgezeichnet werden.

:::caution `_rollouts/` ist nur lokal — nicht committen
Eine Aufzeichnung wird nur für genau den SKILL.md-Text wiedergegeben, für den sie erstellt wurde. Bearbeiten Sie einen Skill, werden seine Treatment-Aufzeichnungen beim nächsten `--mock`-Lauf verworfen. Eine committete Aufzeichnung wäre nach der nächsten Änderung an SKILL.md veraltet und würde bei allen, die das Repository abrufen, Warnungen auslösen. Das Verzeichnis ist gitignored; zeichnen Sie lokal auf.
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

Nach einem erfolgreichen Live-Lauf enthält der Bericht Baseline- und Treatment-Zahlen, `utilityLift`, `coverage: "ok"`, den Isolationsstatus und die Entscheidung pass/warn/fail. Ein späterer Mock-Lauf verwendet nur Aufzeichnungen, deren Aufgaben-Prompts und Treatment-Skill-Text weiterhin übereinstimmen.

---

## Ein minimales funktionierendes Fixture-Set

Für ein Urteil sind fünf Fixtures erforderlich (`MIN_TASKS = 5`). Hier ist ein minimales Set für einen imaginären Skill `oma-scholar`:

```yaml
# .agents/eval/oma-scholar/claims-only.yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

```yaml
# .agents/eval/oma-scholar/entity-lookup.yaml
id: entity-lookup
skill: oma-scholar
domain: research
prompt: "Look up the entity knows:concept/attention-mechanism"
rubric: "Does the answer return the entity name, description, and at least one related concept?"
weight: 1
```

Wiederholen Sie dies für mindestens drei weitere Aufgaben. Führen Sie danach aus:

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```

---

## Bericht lesen

**Textausgabe:**

```
Skill utility eval  (skill: oma-scholar)
  tasks: 7
  isolation: enforced [codex]

  baseline: 42.9%  treatment: 71.4%
  utilityLift: 28.6%  (stddev: 14.3%)
  [PASS]
  Skill shows positive utility lift >= 5%.

  Per-task findings:
    claims-only: baseline=0 treatment=1 lift=+1.000
    entity-lookup: baseline=1 treatment=1 lift=+0.000
    ...

  Thresholds: fail <= 0%, warn < 5%
```

**JSON-Ausgabe** (über `--json`):

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "taskCount": 7,
  "coverage": "ok",
  "decision": "pass",
  "baselineScore": 0.4286,
  "treatmentScore": 0.7143,
  "utilityLift": 0.2857,
  "utilityStdDev": 0.1429,
  "findings": [
    { "taskId": "claims-only", "baseline": 0, "treatment": 1, "lift": 1.0 }
  ],
  "negativeTransfer": [],
  "isolation": "enforced",
  "isolationVendor": "codex"
}
```

`ok` ist nur dann `true`, wenn `coverage === "ok"` und `decision === "pass"`. Das Feld `isolation` meldet, ob der Baseline-Arm wirklich ohne Zielskill lief (siehe [Skill-Isolierung](#skill-isolation-keeping-the-baseline-honest)); im `--mock`-Modus ist `isolation` gleich `"n/a"`.

---

## CI-Integration

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

Exit-Codes:
- `0` — bestanden oder Warnung
- `1` — fehlgeschlagen oder unzureichende Coverage mit `--require-coverage`

---

## Live oder Mock auswählen

Verwenden Sie `--live` mit judge-Prüfern, um den tatsächlichen Nutzwert für offene Aufgaben zu messen. Verwenden Sie `--mock`, um zuvor aufgezeichnete Judge-Urteile offline wiederzugeben oder deterministische `assert`-/`regex`-Vertragsprüfungen auszuführen.

Die Mock-Deterministik bleibt erhalten, indem das binäre Urteil des Judges (PASS/FAIL) während `--live --record` im Rollout-Eintrag gespeichert und dieser Score in späteren `--mock`-Läufen wiedergegeben wird — das LLM wird nicht erneut aufgerufen.

**Datenabfluss:** Während `--live` verteilt der Judge die Ausgabe des Kandidatenarms zur Bewertung an den konfigurierten Vendor. Zu Beginn jedes Live-Laufs wird einmalig gewarnt.

Wenn ein Mock-Lauf unzureichende Coverage meldet, prüfen Sie die Warnung auf verworfene oder fehlende `_rollouts`-Einträge und führen Sie nach der Korrektur von Fixture oder Skill einen Live-Aufzeichnungslauf aus. Wenn die Isolation `best-effort` oder `unavailable` ist, wählen Sie einen CWD-relativen Vendor wie Claude, Codex oder Qwen, bevor Sie einen Lift als starkes Signal behandeln.

---

## Evaluierungsaufgaben mit einem Skill ausliefern

Skills können ein Evaluierungsaufgaben-Set enthalten, indem Fixtures unter `.agents/eval/<skill>/` abgelegt werden. Diese benutzererstellten Dateien liegen außerhalb des Skill-Verzeichnisses und bleiben daher bei `oma update` erhalten. Beim Erstellen eines neuen Skills mit `oma-skill-creation` fügen Sie ein passendes `eval/`-Fixture-Set hinzu, damit künftige Autoren die Wirkung des Skills prüfen können. Siehe `.agents/skills/oma-skill-creation/SKILL.md` für den Workflow zur Skill-Erstellung.
