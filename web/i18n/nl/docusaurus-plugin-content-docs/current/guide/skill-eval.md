---
title: "Evaluatie van skillnut"
sidebar_label: Skill-evaluatie
description: Schrijf evaluatietaakfixtures voor oma skill eval, gebruik de conventie voor de map .agents/eval/ en begrijp de checker-typen en mock/live-uitvoermodi.
---

# Evaluatie van skillnut {#skill-utility-eval}

`oma skill eval` meet of het laden van een skill de uitkomsten van agenttaken werkelijk verbetert. Het beantwoordt een andere vraag dan `oma skill audit` (dat vraagt of twee skills redundant zijn): het vraagt “helpt deze skill?”.

Het ontwerp volgt twee onderzoeksbevindingen: WikiSkill (arXiv:2608.27454) scheidt ruwe ervaring, persistente kennis en uitvoerbare skills en behoudt daarbij gates op niet-gebruikte data voor evolutie; SkillLens (arXiv:2605.23899) laat zien dat skillnut onafhankelijk is van de onderscheidendheid van de beschrijving — een onderscheidende skill kan nog steeds nutteloos zijn en een overlappende skill kan toch helpen.

---

## Hoe het werkt {#how-it-works}

Voor elke taakfixture voert het commando twee armen uit:

1. **Baseline-arm** — de taakprompt wordt naar een agent gestuurd zonder de skill.
2. **Behandelingsarm** — `SKILL.md` wordt vóór de prompt geplaatst en daarna wordt dezelfde taak uitgevoerd.

Elke arm krijgt een score (0 = mislukt, 1 = geslaagd) van de checker van de taak. De primaire metriek is:

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

Een skill slaagt wanneer `utilityLift ≥ 5%`. Onder die drempel krijgt de skill een waarschuwing (marginale lift) of faalt die (geen lift). Voor een beslissing zijn minstens 5 scorebare taken nodig.

---

## De conventie `.agents/eval/<skill>/` {#the-agentsevalskill-convention}

Plaats taakfixtures onder `.agents/eval/<skill>/`. Dit pad staat binnen `.agents/` maar buiten de skillmap zelf, zodat `oma update` de door de gebruiker gemaakte evaluaties niet overschrijft.

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

Bestanden die met `_` beginnen worden bij het laden van taakfixtures overgeslagen. De submap `_rollouts/` bevat vastgelegde outputs van eerdere runs met `--live --record`.

## Schema van een taakfixture {#task-fixture-schema}

Elke fixture is een YAML-bestand met de volgende velden:

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

| Veld | Vereist | Beschrijving |
|:------|:---------|:-----------|
| `id` | Ja | Unieke identifier voor deze taak (gebruikt in rolloutbestandsnamen en rapporten) |
| `skill` | Ja | Skill die wordt geëvalueerd (komt overeen met de naam van de bovenliggende map) |
| `domain` | Ja | Domeinlabel (gebruikt voor groepering en toekomstige detectie van negative transfer) |
| `prompt` | Ja | De taakprompt die naar beide armen wordt gestuurd |
| `checker` | Nee | Hoe agentuitvoer wordt gescoord. Standaard `{ type: judge }` wanneer dit veld ontbreekt. |
| `weight` | Ja | Relatief gewicht voor de gewogen gemiddelde score (gebruik `1` tenzij taken verschillend belangrijk zijn) |

### Typen checkers {#checker-types}

#### judge (standaard) {#judge-default}

Een LLM beoordeelt de armuitvoer aan de hand van een rubric en retourneert PASS of FAIL. Dit is de standaard wanneer `checker` ontbreekt of wanneer `checker.type` niet is ingesteld.

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

Het veld `rubric` is optioneel; zonder dit veld wordt de standaardrubric gebruikt: "Does the answer correctly and completely satisfy the task prompt?"

Je kunt de rubric voor beknoptheid ook op topniveau schrijven:

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**Belangrijk:** in `--mock`-modus vereisen judge-taken een eerder vastgelegd oordeel in `_rollouts/`. Als voor een taak geen vastgelegd oordeel bestaat, wordt die taak met een waarschuwing uit het rapport weggelaten. Gebruik `--live --record` om de rollouts eerst te vullen.

Hetzelfde geldt voor elk checkertype wanneer een arm volledig ontbreekt: de taak wordt uitgesloten en niet als 0 gescoord. Ontbrekende data is geen mislukt antwoord — beide armen op 0 zetten zou de lift als nul lezen als `decision: "fail"`. Uitsluitingen die het aantal gescoorde taken onder `MIN_TASKS` brengen, worden zichtbaar als `coverage: "insufficient"`.

#### assert (opt-in) {#assert-opt-in}

Deterministische controle op een substring. Gebruik dit voor contract-, formaat- of tool-callverificatie wanneer de verwachte uitvoer exact is.

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

De controle slaagt wanneer elke string in `expect_contains` in de armuitvoer aanwezig is.

#### regex (opt-in) {#regex-opt-in}

Deterministische regex-match. Gebruik dit wanneer een patroon nodig is in plaats van een exacte string.

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

Patronen langer dan 200 tekens krijgen score 0 (ReDoS-stopmaatregel). De uitvoer wordt vóór het matchen afgekapt op 10.000 tekens.

---

## Uitvoermodi {#execution-modes}

### --mock (standaard) {#mock-default}

Speelt vastgelegde rollouts uit `_rollouts/` opnieuw af. Volledig deterministisch en offline — er wordt geen LLM aangeroepen.

- Bij checkers van het type `assert`/`regex` worden scores berekend uit de vastgelegde uitvoerstrings.
- Bij checkers van het type `judge` wordt het veld `score` afgespeeld dat door `--live --record` is vastgelegd.

Als een judge-taak geen vastgelegde score in `_rollouts/` heeft, wordt die uit het rapport weggelaten (met een waarschuwing op de console). Zo blijft mock-modus strikt offline.

Opnames worden ook op veroudering gecontroleerd voordat ze worden gebruikt. Een behandelingsinvoer die onder een andere SKILL.md-body is vastgelegd, een invoer waarvan de fixture-`prompt` is gewijzigd en elke invoer die van vóór provenance-tracking dateert, worden allemaal met een waarschuwing weggelaten met de bestandsnaam en het aantal. Als daardoor minder dan `MIN_TASKS` scorebare taken overblijven, meldt de run `coverage: "insufficient"` in plaats van een beslissing — zo erft een bewerkte skill nooit haar vorige score.

:::note `oma skill optimize --mock`
De optimizer scoort kandidaat-SKILL.md-bodies. Omdat een opname alleen geldig is voor de body waarvoor die is gemaakt, hebben kandidaat-bodies geen overeenkomende rollouts en worden ze als niet gedekt gemeld. Gebruik `--live` om kandidaten te scoren.
:::

Veilig voor CI. Stel `OMA_SKILLEVAL_MOCK=1` in om deze modus af te dwingen.

```bash
oma skill eval --skill oma-scholar
```

### --live {#live}

Start echte agentarmen via `oma agent spawn --read-only`. Beide armen draaien in een tijdelijke workspace om wijzigingen in het projectbestand te voorkomen.

Voor dispatchen print het commando een kostenpreview met het aantal taken, arm-dispatches, judge-dispatches en de opgeloste vendor. Bevestig met `y` of sla de bevestiging over met `--yes`.

De volgende controles zijn ook nuttig in CI en bij onderzoeken naar dekking:

| Optie | Effect |
| --- | --- |
| `--task-dir <path>` | Evalueer fixtures uit een andere map dan `.agents/eval/<skill>`. |
| `--max-tasks <n>` | Beperk het aantal fixtures voor een begrensde live run. |
| `--neg-transfer` | Neem buren uit hetzelfde domein om negative transfer te zoeken; standaard uitgeschakeld. |
| `--require-coverage` | Eindig met een niet-nul exitcode wanneer minder dan vijf scorebare gepaarde taken overblijven. |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### Skillisolatie (de baseline eerlijk houden) {#skill-isolation-keeping-the-baseline-honest}

`utilityLift` is alleen betekenisvol als de **baseline-arm zonder de doel-skill draait**. Het probleem: een gedispatchte agent laadt automatisch elke skill die in zijn runtime is geïnstalleerd. Een naïeve baseline zou daardoor toch de skill oppikken die juist zonder skill moet worden gemeten — de vergelijking wordt vervuild (baseline ≈ behandeling, lift ≈ 0).

Daarom draait `--live` beide armen in een geïsoleerde tijdelijke workspace waarvan de skillmap elke geïnstalleerde skill **behalve de doel-skill** bevat. De behandelingsarm voegt de doel-skill alleen opnieuw toe via de geïnjecteerde `SKILL.md` (die vóór de prompt wordt geplaatst). De injectie is zo de enige gecontroleerde variabele: baseline = zonder skill, behandeling = kandidaat-`SKILL.md`.

Dit werkt omdat de meeste vendors skills ontdekken **relatief aan de werkmap** (bijvoorbeeld `<cwd>/.claude/skills`, `<cwd>/.codex/skills`) — een schone werkmap verbergt de skill echt. Het rapport verklaart hoe goed de isolatie standhield via een veld `isolation`:

| Status | Betekenis |
|---|---|
| `enforced` | CWD-relatieve vendor, doel-skill ontbreekt in het HOME-pad — volledig geïsoleerd. |
| `best-effort` | CWD-relatieve vendor, maar er bestaat ook een HOME-kopie van de skill (of de vendor is onbekend); de projectkopie is verborgen, maar een HOME-kopie kan nog lekken. Lage betrouwbaarheid wordt gemarkeerd. |
| `unavailable` | HOME-gebaseerde vendor (bijvoorbeeld **antigravity**, die `~/.gemini/antigravity-cli/skills` leest); een schone CWD kan die niet verbergen. Er wordt een waarschuwing geprint en het resultaat krijgt lage betrouwbaarheid. |
| n/a | mock-modus — geen live dispatch. |

Wanneer isolatie niet `enforced` is, wordt een waarschuwing van één regel geprint en moet je het resultaat als laag betrouwbaar behandelen. Gebruik voor een zuiver signaal een CWD-relatieve, isoleerbare vendor (claude / codex / qwen) in plaats van een HOME-gebaseerde vendor — de eval-vendor volgt `model_preset` in `.agents/oma-config.yaml`, dus selecteer een preset waarvan de standaardvendor CWD-relatief is.

### --live --record {#live-record}

Voert live-armen uit en schrijft de vastgelegde uitvoer (waaronder judge-oordelen voor taken met een judge-checker) naar `_rollouts/<hash>.json`. De bestandsnaam is een deterministische SHA-256-hash van de verzameling taak-ID’s, geen datum of willekeurige waarde.

Gebruik dit om op je eigen machine `--mock`-runs te voeden, zodat herhaalde runs offline blijven.

Elke invoer bevat provenance, zodat een latere replay kan bepalen of die nog van toepassing is:

| Veld | Vastgelegd op | Vergeleken met |
|---|---|---|
| `skillBodyHash` | alleen `treatment` | de SKILL.md-body die wordt geëvalueerd |
| `promptHash` | beide armen | de huidige `prompt` van de fixture |

De baseline-arm houdt de skill achter; het bewerken van SKILL.md maakt alleen de behandelingsinvoer ongeldig en vereist alleen daarvoor een nieuwe opname.

:::caution `_rollouts/` is alleen lokaal — commit dit niet
Een opname wordt alleen opnieuw afgespeeld voor exact de SKILL.md-body waarvoor die is gemaakt. Bewerk je een skill, dan worden de behandelingsopnames bij de volgende `--mock`-run weggegooid, zodat een gecommitte opname verouderd zou worden zodra iemand de skill wijzigt en voor iedereen waarschuwingen zou opleveren. De map is gegitignoreerd; neem lokaal op.
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

Na een geslaagde live run bevat het rapport baseline- en behandelingsaantallen, `utilityLift`, `coverage: "ok"`, de isolatiestatus en een pass/warn/fail-beslissing. Een latere mock-run gebruikt alleen opnames opnieuw waarvan de taakprompts en de behandelings-SKILL.md-body nog overeenkomen.

---

## Een minimale fixtureset die werkt {#a-minimal-working-fixture-set}

Voor een beslissing zijn vijf fixtures nodig (`MIN_TASKS = 5`). Dit is een minimale set voor een denkbeeldige skill `oma-scholar`:

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

Herhaal dit voor minstens drie andere taken. Voer daarna uit:

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```

---

## Het rapport lezen {#reading-the-report}

**Tekstuitvoer:**

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

**JSON-uitvoer** (via `--json`):

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

`ok` is alleen `true` wanneer `coverage === "ok"` en `decision === "pass"`. Het veld `isolation` meldt of de baseline-arm werkelijk zonder de doel-skill draaide (zie [Skillisolatie](#skill-isolation-keeping-the-baseline-honest)); in `--mock`-modus is `isolation` `"n/a"`.

---

## CI-integratie {#ci-integration}

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

Exitcodes:
- `0` — geslaagd of waarschuwing
- `1` — mislukt, of onvoldoende dekking met `--require-coverage`

---

## Live of mock kiezen {#choosing-live-or-mock}

Gebruik `--live` met judge-checkers om werkelijk nut op open taken te meten. Gebruik `--mock` om eerder vastgelegde judge-oordelen offline opnieuw af te spelen of om deterministische contractcontroles van het type `assert`/`regex` uit te voeren.

Mock-determinisme blijft behouden doordat het binaire oordeel van de judge (PASS/FAIL) tijdens `--live --record` in de rolloutinvoer wordt vastgelegd en die score daarna in volgende `--mock`-runs wordt afgespeeld — de LLM wordt niet opnieuw aangeroepen.

**Data-uitstroom:** tijdens `--live` stuurt de judge uitvoer van de kandidaatarm naar de geconfigureerde vendor voor beoordeling. Aan het begin van elke live run wordt één keer een waarschuwing geprint.

Als een mock-run onvoldoende dekking meldt, inspecteer je de waarschuwing op weggegooide of ontbrekende `_rollouts`-invoeren en voer je een live recording-pass uit nadat je de fixture of skill hebt hersteld. Als de isolatie `best-effort` of `unavailable` is, kies je een CWD-relatieve vendor zoals Claude, Codex of Qwen voordat je een lift als sterk signaal behandelt.

---

## Evaluatietaken met een skill meeleveren {#shipping-eval-tasks-with-a-skill}

Skills kunnen een evaluatietaakset bevatten door fixtures te plaatsen op `.agents/eval/<skill>/`. Dit zijn door de gebruiker geschreven bestanden buiten de skillmap, zodat ze een `oma update` overleven. Voeg bij het maken van een nieuwe skill met `oma-skill-creation` een bijpassende `eval/`-fixtureset toe, zodat toekomstige auteurs het effect van de skill kunnen controleren. Zie `.agents/skills/oma-skill-creation/SKILL.md` voor de workflow voor skill-auteurs.
