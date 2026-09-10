---
title: "Evaluatie van de harness"
sidebar_label: Harness-evaluatie
description: Evalueer een volledige OMA-harnessoverlay met gepaarde, geïsoleerde repositorytaken en deterministische artifactcontroles.
---

# Evaluatie van de harness {#harness-evaluation}

`oma harness eval` meet of een kandidaat-OMA-harness een vaste doelagent verbetert zonder het model van die agent te wijzigen. De opdracht past het evaluatiepatroon uit [AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses](https://arxiv.org/abs/2608.12307) aan: houd het doelmodel vast, verander de harness en vergelijk de uitkomsten voor dezelfde taken.

Deze opdracht evalueert een grotere eenheid dan `oma skill eval`:

| Opdracht | Behandeling | Scoredoel |
|:--------|:----------|:-------------|
| `oma skill eval` | Eén `SKILL.md`-body | Agentuitvoer |
| `oma harness eval` | Een afgebakende `.agents/`-overlay | Bestanden en uitvoer die in een repository-workspace worden geproduceerd |

Gebruik skill eval om de vraag “helpt deze skill?” te beantwoorden. Gebruik harness eval om te bepalen of deze combinatie van skills, workflows, regels en agentinstructies de vaste agent repositorytaken betrouwbaarder laat voltooien.

## Evaluatiemodel {#evaluation-model}

Elke taak draait als een gepaard experiment:

1. OMA kopieert de taakfixture naar een nieuwe baseline-workspace.
2. OMA kopieert de huidige definities van `agents`, `config`, `rules`, `skills` en `workflows` naar die workspace en projecteert ze naar het formaat van de geselecteerde vendor.
3. OMA herhaalt de setup in een tweede nieuwe workspace en past daar de kandidaat-overlay toe.
4. Voor beide armen worden dezelfde primaire agent, vendorroute, prompt, schrijfrechten en time-out gebruikt.
5. Deterministische controles inspecteren de resulterende workspace en optionele agentuitvoer.

Het echte project wordt nooit als werkmap van een arm gebruikt. Tijdelijke arm-workspaces worden na het scoren verwijderd; de eigen processandbox van de geselecteerde vendor blijft de autoriteit voor toegang buiten die werkmap.

## Indeling van de kandidaat {#candidate-layout}

Het kandidaatpad is een map met een gedeeltelijke `.agents/`-boom:

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

Alleen bestanden onder `.agents/agents`, `.agents/rules`, `.agents/skills` en `.agents/workflows` worden geaccepteerd. Hooks, evaluatiefixtures, state, resultaten, configuratiebestanden, symlinks en vendor-skillvarianten worden geweigerd. Beschermde frontmattervelden van de agent, zoals `model`, `tools`, `effort` en uitvoeringslimieten, moeten gelijk zijn aan de baseline. Een arm faalt ook als de uitvoerende agent vóór het scoren beschermde `.agents/`-definities wijzigt.

## Suiteformaat {#suite-format}

Een suite bestaat uit één YAML-bestand en één fixturemap per taak:

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

Taak-ID’s moeten uniek zijn. Fixturepaden en controlepaden moeten binnen het project en de workspace van de taak blijven. Fixtures mogen geen symlinks of besturingsoppervlakken van de agent-harness bevatten, zoals `.agents`, `.codex`, `.claude`, vendorskilmappen of rootbestanden met agentinstructies. Zo kan taakdata de gecontroleerde harness van geen van beide armen overschaduwen.

Gegenereerde afhankelijkheidsmappen zoals `node_modules` en `.venv` worden niet uit de baseline-harness gekopieerd. Commit deterministische helperbron en dependency-manifests in de skill; voorzie runtimeafhankelijkheden in de taakfixture wanneer een controle die nodig heeft.

### Typen controles {#check-types}

| Type | Velden | Voorwaarde voor slagen |
|:-----|:-------|:---------------|
| `file_exists` | `path` | Het pad bestaat nadat de arm klaar is. |
| `file_not_exists` | `path` | Het pad bestaat niet. |
| `file_contains` | `path`, `value` | Het bestand bestaat en bevat de waarde. |
| `file_not_contains` | `path`, `value` | Het bestand bestaat en bevat de waarde niet. |
| `output_contains` | `value` | De vastgelegde agentuitvoer bevat de waarde. |
| `output_not_contains` | `value` | De vastgelegde agentuitvoer bevat de waarde niet. |

Artifactcontroles zijn bewust deterministisch. De eerste versie voert geen veranderlijke pakketscripts als beoordelaars uit, omdat een geëvalueerde agent die scripts of hun tests kan aanpassen en zo de evaluator ongeldig kan maken.

## Uitvoeren en vastleggen {#run-and-record}

Live-modus voert per taak twee dispatches uit, print een kostenpreview en vraagt om bevestiging:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --live --record
```

Bij een geslaagde run bevat het rapport gepaarde baseline- en kandidaatscores, een lift, regressietellingen en een beslissing zoals `pass` of `insufficient`. Als je de suite, baselinedefinities, kandidaat-overlay, prompts, fixtures of controles wijzigt, leg je een nieuwe live run vast; een oud `_runs`-bestand wordt op basis van zijn hash geweigerd.

Gebruik `--yes` voor niet-interactieve uitvoering en `--timeout-minutes` om voor beide armen dezelfde wall-clocklimiet in te stellen. Live-uitvoering is alleen beschikbaar wanneer de geselecteerde vendor harnessbestanden relatief aan de projectworkspace ontdekt. OMA weigert HOME-gebaseerde discovery omdat de baseline dan kandidaatinhoud die globaal is geïnstalleerd zou kunnen zien.

Met `--record` wordt naast de suite een JSON-record met hashadres onder `_runs/` geschreven. Het record bindt de resultaten aan drie inputs:

- de suite, prompts, controles en fixture-inhoud;
- de huidige baselinedefinities van de harness;
- de inhoud van de kandidaat-overlay.

Mock-modus is de standaard en voert geen modelaanroepen uit. Alleen wanneer alle drie de hashes nog overeenkomen, wordt een record opnieuw afgespeeld:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --mock --require-coverage
```

## Metrics en beslissingspoort {#metrics-and-decision-gate}

Elke taak slaagt alleen wanneer elke controle slaagt. Scores zijn gewogen gemiddelden over gepaarde taken:

```text
lift = candidateScore - baselineScore
```

OMA rapporteert ook:

- gecorrigeerde taken: baseline faalde en kandidaat slaagde;
- teruggevallen taken: baseline slaagde en kandidaat faalde;
- dekking: er zijn minstens vijf gepaarde, scorebare taken vereist.

De kandidaat slaagt wanneer de lift minstens 5 procentpunten is en er geen regressies zijn. Elke regressie laat de kandidaat falen. Een niet-negatieve lift onder 5 punten geeft een waarschuwing en minder dan vijf gepaarde taken leidt tot de beslissing `insufficient`. Voeg `--require-coverage` toe om onvoldoende dekking in CI met een niet-nul exitcode te laten eindigen. Een score is geen bewijs als een arm ontbreekt, een recordhash verouderd is of een deterministische controle niet compleet is.

## Huidige begrenzing {#current-boundary}

Dit is een basis voor evaluatie en geen automatische harnessoptimalisatie. Een builder kan kandidaat-overlays extern produceren en deze opdracht daarna als acceptatiepoort gebruiken. Een afzonderlijke verborgen final-test-suite, herhaalde stochastische proeven, vertrouwde externe testrunners, tokenadministratie, verplichte modelpinnen voor geneste subagentaanroepen en een geautomatiseerde lus `harness opt` maken geen deel uit van de huidige opdracht. Tot er pinning voor geneste aanroepen bestaat, vermijd je in suites die één vast model willen meten kandidaatworkflows die andere geconfigureerde agentrollen spawnen.
