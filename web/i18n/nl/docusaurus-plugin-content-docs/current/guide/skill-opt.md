---
title: "Skilloptimalisatie"
sidebar_label: Skilloptimalisatie
description: Gebruik oma skill optimize voor persistente, evidence-based evolutie van skills met deterministische train-, validatie- en door de runner beheerde holdout-gates.
---

# Skilloptimalisatie {#skill-optimization}

`oma skill optimize` ontwikkelt de `SKILL.md` van een skill om de gemeten `utilityLift` van `oma skill eval` te maximaliseren. Het scheidt ruwe rollout-evidence, persistente afgebakende kennis en de uitvoerbare skill. Een Wiki Maintainer voegt waarneembare successen en mislukkingen samen; een Proposer gebruikt die kennis om begrensde add/delete/replace-edits te maken. Kandidaten moeten de utility op de niet-gebruikte validatieset verbeteren en `--apply` vereist daarnaast verbetering op een door de runner beheerde holdoutsplitsing. Bij deployment is er geen extra wiki-lookup tijdens inference: de uitvoer blijft een `SKILL.md`.

Onderzoeksbasis: Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C., & Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## Harde afhankelijkheid: evaluatietaakfixtures {#hard-dependency-eval-task-fixtures}

`oma skill optimize` kan niet zonder evaluatietaakfixtures draaien. Het vereist minstens **5 taakfixtures** (`MIN_TASKS = 5`) in `.agents/eval/<skill>/`. Als er minder worden gevonden, geeft het commando onmiddellijk een fout:

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

Zie de [gids voor Skill Utility Eval](/docs/guide/skill-eval) voor de conventie voor de map `.agents/eval/<skill>/`, het fixtureschema, checkertypen en het vullen van rollouts voor mock-replay.

---

## Hoe het werkt {#how-it-works}

Fixtures worden op taak-ID gesorteerd en deterministisch opgesplitst in sets voor **train**, **held-out validation** en de **runner-owned final-test**. Met minstens vijf fixtures zijn de doelverhoudingen 60/20/20 en bevat elke partitie minstens één taak. De final-testtaken komen uit deze lokale fixtureset; ze blijven tijdens de lus verborgen voor de Maintainer en Proposer en worden niet uit een verborgen externe suite opgehaald.

Voor elke epoch (maximaal `--max-epochs`, standaard 8):

1. **Scoor de huidige beste `SKILL.md` op de TRAIN-splitsing** — `oma skill eval` retourneert waarneembare prompts, outputs en lift per taak.
2. **Wiki Maintainer voegt evidence samen** — maximaal vijf mislukkingen en drie successen worden patronen met evidence-links. Afgebakende patronen en eerdere gate-uitkomsten worden uit OMA’s L1/L2/L3-geheugensysteem opgehaald.
3. **Proposer levert K kandidaat-edits** (maximaal `--edits-per-epoch`, standaard 4). Exacte edits die al in de persistente afwijzingsgeschiedenis staan, worden overgeslagen.
4. **Voor elke kandidaat-edit:**
   - Pas de edit toe op een in-memorykopie van `SKILL.md`.
   - Valideer de kandidaat (frontmatter `name`/`description` moet behouden blijven; de body moet kunnen worden geparsed).
   - Handhaaf het tekstuele learning-ratebudget: verwerp edits waarvan de netto wijziging in tekens groter is dan `--lr` (standaard 600 tekens).
   - Scoor de kandidaat opnieuw op de **held-out validation-splitsing**.
5. **Accepteer de beste validatiekandidaat ALLEEN ALS** de validatielift strikt verbetert (`Δlift > 0`) **EN** geen entry voor negative transfer de regressievloer overschrijdt (`NEG_TRANSFER_FAIL = -0.1`). Elke proposal-gate wordt persistent opgeslagen.
6. **Stop vroeg** na 2 opeenvolgende epochs zonder geaccepteerde edit (`OPT_EARLY_STOP_PATIENCE = 2`).
7. **Voer na de evolutie de door de runner beheerde final test uit.** De Maintainer en Proposer zien deze taken tijdens de lus nooit. Een mislukte final test verhindert `--apply` en registreert de validatiewinnaar als afgewezen kennis.

De optimizer bewerkt de live `SKILL.md` nooit tijdens de lus — hij werkt altijd op een in-memory kandidaatkopie.

---

## Gebruik {#usage}

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### Vlaggen {#flags}

| Vlag | Standaard | Beschrijving |
|:-----|:--------|:-----------|
| `--skill <id>` | `_all` | Skill-ID die moet worden geoptimaliseerd (eenvoudige naam, zonder padscheidingstekens). |
| `--dry-run` | **yes (default)** | Stel edits voor en print het diff zonder `SKILL.md` te wijzigen; gegenereerde evidence en evolutie-events blijven wel bewaard. |
| `--apply` | — | Pas geaccepteerde edits toe op `SKILL.md` en maak vóór een atomische write een backup van het origineel. Dit draait alleen als de validatie- en door de runner beheerde final-test-gates slagen; een OMA-owned skill vereist ook `--yes`. |
| `--mock` | **yes (default)** | Speel vastgelegde optimizer-edits en eval-oordelen uit `_rollouts/` opnieuw af. Deterministisch, offline en veilig voor CI. |
| `--live` | — | Live LLM-optimizerdispatch; dit kost echte modelaanroepen per epoch. Print een kostenpreview en vraagt om bevestiging tenzij `--yes` is ingesteld. |
| `--max-epochs <n>` | `8` | Maximumaantal optimalisatie-epochs. |
| `--edits-per-epoch <k>` | `4` | Aantal kandidaat-edits dat de optimizer-LLM per epoch voorstelt. |
| `--lr <chars>` | `600` | Tekstueel learning-ratebudget: maximale netto wijziging in tekens per geaccepteerde edit. |
| `--yes` | — | Sla de bevestiging van de kostenpreview over. Alleen betekenisvol met `--live`. |
| `--json` | — | Uitvoer als JSON voor CI/CD. |
| `--output <format>` | `text` | Uitvoerformaat (`text` of `json`). |

---

## Minimaal end-to-end-voorbeeld {#minimal-end-to-end-example}

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

Voorbeeldoutput:

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

Het diff toont wat de optimizer zou schrijven. `SKILL.md` blijft ongewijzigd, terwijl gegenereerde evidence over de evolutie en afgebakende gate-uitkomsten voor toekomstige runs worden bewaard.

---

## Een gevalideerde verbetering toepassen {#applying-a-validated-improvement}

Als je tevreden bent met het voorgestelde diff, voer je de opdracht opnieuw uit met `--apply`:

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

`--apply` schrijft alleen wanneer de optimalisatie een strikt positieve verbetering op validatie heeft gevonden en de lift van de kandidaat voor de door de runner beheerde final test groter is dan diens baselinelift. Er wordt vóór de atomische write een backup van het originele `SKILL.md` gemaakt. Het diff wordt altijd geprint, zodat je de wijziging kunt beoordelen.

---

## Live-modus {#live-mode}

Live-modus roept de echte Maintainer en Proposer aan en voert per epoch opnieuw live eval-armen uit. Dit is duur: elke gescoorde taak heeft baseline- en behandelingsaanroepen, judge-fixtures voegen beoordelingsaanroepen toe en de final test scoort de originele en kandidaatbody. De preview meldt een bovengrens van de onderliggende modelaanroepen uit de werkelijke splitsing. Elke aanroep heeft een time-out van 120 seconden; Claude-evalarmen draaien beperkt, zonder ambient tools, skills, MCP en AgentMemory.

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

De kostenpreview toont de bovengrens van de onderliggende modelaanroepen voordat er een LLM-aanroep wordt gedaan.

---

## JSON-uitvoer {#json-output}

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

`ok` is alleen `true` wanneer de kandidaat de validatie verbetert en de door de runner beheerde final test niet faalt (of de kandidaat is toegepast). De `_split`-aantallen tonen de werkelijke lokale fixturepartitie van de run.

---

## SSOT-waarschuwing voor `oma-*`-skills {#ssot-caveat-for-oma-skills}

Skills waarvan de ID met `oma-` begint, zijn eigendom van oh-my-agent en worden **overschreven door `oma update`**. Voor deze skills wordt `--apply` afgeraden — gebruik `--dry-run` (de standaard), beoordeel het voorgestelde diff en upstream wijzigingen naar het register als de verbetering betekenisvol is. Voor door gebruikers geschreven skills is `--apply` veilig.

Het commando print een waarschuwing wanneer de doel-skill eigendom is van oma:

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

---

## Guard tegen overfitting {#overfitting-guard}

De Maintainer en Proposer zien alleen TRAIN-rollout-evidence. De kandidaatselectie gebruikt de niet-gebruikte VALIDATION-splitsing, terwijl de door de runner beheerde TEST-splitsing tot het einde van de evolutie voor hen verborgen blijft. Een validatiewinnaar die de final test niet verbetert, wordt niet toegepast en aan de persistente afwijzingsgeschiedenis toegevoegd.

---

## CI-integratie {#ci-integration}

In `--mock`-modus is `oma skill optimize` volledig deterministisch en offline — er wordt geen LLM aangeroepen. Gebruik het in CI om te controleren of een voorgesteld skill-diff nog steeds lift toont ten opzichte van de vastgelegde rollouts:

```bash
oma skill optimize --skill oma-scholar --mock --json
```

Exitcodes:
- `0` — optimalisatie voltooid (met of zonder verbetering)
- `1` — minder dan `MIN_TASKS` fixtures of een ongeldig `--skill`-argument

---

## Zie ook {#see-also}

- [Skill Utility Eval](/docs/guide/skill-eval) — taakfixtures schrijven, checkertypen en mock/live-modi, de map `_rollouts/`.
- [CLI Commands](/docs/cli-interfaces/commands) — vlagreferentie voor alle commando’s voor skillbeheer.
