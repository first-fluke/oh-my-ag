---
title: Skills
description: Complete gids voor OMA's 33-skill, tweelaagse architectuur, met SKILL.md-routering, on-demand resources, gedeelde en conditionele protocollen, vendoruitvoering, tokenmetingen en routeringsmechanismen.
---

# Skills

Skills zijn gestructureerde kennispakketten die een dispatchrol domeinguidance geven. Ze bevatten uitvoeringsprotocollen, verwijzingen naar technologiestacks, codesjablonen, error playbooks, kwaliteitschecklists en voorbeelden wanneer de skill die levert. Alles is georganiseerd in een tweelaagse architectuur die tokens bespaart.

---

## Het tweelaagse ontwerp

### Laag 1: SKILL.md (~2.631 tokens mediaan, geladen wanneer de skill wordt gerouteerd)

Elke skill heeft een `SKILL.md` in de root. Het bestand komt in het contextvenster wanneer de skill wordt gerouteerd — de injector-hook geeft een **padverwijzing**, niet de inhoud. Een niet-gerouteerde skill kost daardoor niets bovenop zijn `description`. Het bestand bevat:

- **YAML-frontmatter** met `name` en `description` (voor routering en weergave)
- **When to use / When NOT to use**: expliciete activatievoorwaarden
- **Core rules**: de 5-15 belangrijkste beperkingen voor het domein
- **Architecture overview**: hoe code moet worden gestructureerd
- **Library list**: goedgekeurde dependencies en hun doel
- **References**: verwijzingen naar Laag 2-resources (worden nooit automatisch geladen)

Voorbeeld van frontmatter:

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

Het veld `description` is belangrijk: het bevat de routeringswoorden waarmee het skill-routersysteem taken aan agenten koppelt.

### Laag 2: resources/ (op aanvraag geladen)

De map `resources/` bevat diepgaande uitvoeringskennis. Deze bestanden worden alleen geladen wanneer:
1. de host of workflow de skill heeft geselecteerd (bijvoorbeeld via een native skillmatch of een expliciet commando);
2. de specifieke resource nodig is voor het huidige taaktype en de huidige moeilijkheidsgraad.

Dit laden op aanvraag wordt gestuurd door de context-loading guide (`.agents/skills/_shared/core/context-loading.md`), die per agent de vereiste resources aan taaktypen koppelt.

---

## Voorbeeld van bestandsstructuur

```
.agents/skills/oma-frontend/
├── SKILL.md                          ← Layer 1: loaded when routed
└── resources/
    ├── execution-protocol.md         ← Layer 2: step-by-step workflow
    ├── tech-stack.md                 ← Layer 2: detailed technology specs
    ├── angular-rules.md              ← Layer 2: Angular-specific conventions
    ├── snippets.md                   ← Layer 2: copy-paste code patterns
    ├── error-playbook.md             ← Layer 2: error recovery procedures
    └── checklist.md                  ← Layer 2: quality verification checklist

.agents/skills/oma-backend/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── orm-reference.md              ← Domain-specific (ORM queries, N+1, transactions)
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Shipped language seeds / generated references
    ├── node/
    ├── python/
    └── rust/

.agents/skills/oma-mobile/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── tech-stack.md
│   ├── screen-template.dart
│   ├── screen-template.swift         ← Swift native iOS screen template
│   ├── screen-template.tsx            ← React Native screen template
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Stack schema and generated platform references
    ├── README.md
    └── stack.schema.json

.agents/skills/oma-design/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── anti-patterns.md
│   ├── checklist.md
│   ├── design-md-spec.md
│   ├── design-tokens.md
│   ├── prompt-enhancement.md
│   ├── stitch-integration.md
│   └── error-playbook.md
└── reference/                         ← Deep reference material
    ├── typography.md
    ├── color-and-contrast.md
    ├── spatial-design.md
    ├── motion-design.md
    ├── responsive-design.md
    ├── component-patterns.md
    ├── accessibility.md
    └── shader-and-3d.md
```

---

## Resourcetypen per skill

| Resourcetype | Bestandsnaam-patroon | Doel | Wanneer geladen |
|--------------|-----------------|---------|-------------|
| **Execution Protocol** | `execution-protocol.md` | Stapsgewijze workflow: Analyze -> Plan -> Implement -> Verify | Altijd (met SKILL.md) |
| **Tech Stack** | `tech-stack.md` | Gedetailleerde technologiespecificaties, versies en configuratie | Complexe taken |
| **Error Playbook** | `error-playbook.md` | Herstelprocedures met escalatie na "3 strikes" | Alleen bij fouten |
| **Checklist** | `checklist.md` | Domeinspecifieke kwaliteitsverificatie | Bij de Verify-stap |
| **Snippets** | `snippets.md` | Direct kopieerbare codepatronen | Gemiddelde/complexe taken |
| **Examples** | `examples.md` of `examples/` | Few-shot input/output-voorbeelden voor het LLM | Gemiddelde/complexe taken |
| **Variants** | map `variants/` | Taal- of frameworkspecifieke referenties. Backend levert seeds voor `node`, `python` en `rust`; mobile levert een schema en kan gegenereerde platformreferenties krijgen. | Wanneer een passende stack bestaat |
| **Templates** | `component-template.tsx`, `screen-template.dart` | Boilerplate-sjablonen voor bestanden | Bij het maken van een component |
| **Domeinreferentie** | `orm-reference.md`, `anti-patterns.md`, enzovoort | Diepgaande domeinkennis voor specifieke subtaken | Afhankelijk van het taaktype |

---

## Gedeelde resources (_shared/)

Alle agenten delen gemeenschappelijke fundamenten uit `.agents/skills/_shared/`. Die zijn onderverdeeld in drie categorieën:

### Kernresources (`.agents/skills/_shared/core/`)

| Resource | Doel | Wanneer geladen |
|----------|------|-------------|
| **`skill-routing.md`** | Koppelt taak-keywords aan de juiste agent. Bevat de tabel Skill-Agent Mapping, patronen voor complexe routering, inter-agentafhankelijkheidsregels, escalatieregels en de gids met beurtlimieten. | Door orchestratie- en coördinatieskills geraadpleegd |
| **`context-loading.md`** | Bepaalt welke resources bij welk taaktype en welke moeilijkheidsgraad worden geladen. Bevat mappingtabellen per agent en triggers voor conditionele protocollen. | Aan het begin van de workflow (stap 0 / fase 0) |
| **`prompt-structure.md`** | Bepaalt de vier elementen die elke taakprompt moet bevatten: Goal, Context, Constraints, Done When. Bevat sjablonen voor PM-, implementatie- en QA-agenten en noemt antipatronen, waaronder starten met alleen een Goal. | Door PM-agent en alle workflows geraadpleegd |
| **`clarification-protocol.md`** | Definieert onzekerheidsniveaus (LOW/MEDIUM/HIGH) met acties. Bevat triggers, escalatiesjablonen, vereiste verificatie per agenttype en subagentgedrag. | Bij ambigue requirements |
| **`context-budget.md`** | Beheert het tokenbudget. Definieert leesstrategie (gebruik `find_symbol` in plaats van `read_file`), gemeten kosten per resource en voor Simple (~4.000 tokens) versus Complex (~9.000 tokens), de afgedwongen limiet voor `SKILL.md` (25.000 tekens, gecontroleerd met `oma skill audit`), grote bestanden en signalen van contextoverloop. | Aan het begin van de workflow |
| **`difficulty-guide.md`** | Classificeert taken als Simple/Medium/Complex. Definieert verwachte beurten, protocoldoorvertakkingen (Fast Track / Standard / Extended) en herstel bij een verkeerde inschatting. | Aan het begin van de taak (stap 0) |
| **`quality-principles.md`** | Vier universele kwaliteitsprincipes voor alle agenten. | Aan het begin van kwaliteitsworkflows (ultrawork) |
| **`vendor-detection.md`** | Detecteert de huidige runtime (Claude Code, Codex CLI, Antigravity, Cursor, Kiro, Qwen en CLI-fallback) via hostmarkers en ingestelde vendorstatus. | Aan het begin van de workflow |
| **`session-metrics.md`** | Houdt Clarification Debt (CD) en sessiemetrics bij. Definieert gebeurtenistypen (clarify +10, correct +25, redo +40), drempels (CD >= 50 = RCA, CD >= 80 = pauze) en integratiepunten. | Tijdens orchestratiesessies |
| **`common-checklist.md`** | Universele kwaliteitschecklist bij de eindverificatie van complexe taken, naast agentspecifieke checklists. | Verify-stap van complexe taken |
| **`lessons-learned.md`** | Repository met lessen uit vorige sessies, automatisch gegenereerd na Clarification Debt-overtredingen en verworpen experimenten. Geordend per domein en met QA-evaluatielessen voor blinde vlekken. | Na fouten en aan het einde van een sessie |
| **`api-contracts/`** | Map met het API-contractsjabloon en gegenereerde contracten. `template.md` beschrijft per endpoint de methode, het pad, request/response-schema's, auth en fouten. | Wanneer werk over grenzen heen wordt gepland |

### Runtimeresources (`.agents/skills/_shared/runtime/`)

| Resource | Doel |
|---------|---------|
| **`memory-protocol.md`** | Formaat en bewerkingen van geheugenbestanden voor CLI-subagenten. Beschrijft On Start, During Execution en On Completion met configureerbare geheugenbewerkingen, plus de extensie voor experimenttracking. |
| **`execution-protocols/claude.md`** | Claude Code-specifieke uitvoeringspatronen. Wordt door `oma agent spawn` geïnjecteerd wanneer de vendor claude is. |
| **`execution-protocols/antigravity.md`** | Uitvoeringspatronen voor de Antigravity CLI (`agy`). |
| **`execution-protocols/codex.md`** | Uitvoeringspatronen voor Codex CLI. |
| **`execution-protocols/commandcode.md`** | Uitvoeringspatronen voor CommandCode. |
| **`execution-protocols/grok.md`** | Uitvoeringspatronen voor Grok. |
| **`execution-protocols/kimi.md`** | Uitvoeringspatronen voor Kimi Code. |
| **`execution-protocols/kiro.md`** | Uitvoeringspatronen voor Kiro. |
| **`execution-protocols/opencode.md`** | Uitvoeringspatronen voor de OpenCode-extensie. |
| **`execution-protocols/pi.md`** | Uitvoeringspatronen voor de pi-extensie. |
| **`execution-protocols/qwen.md`** | Uitvoeringspatronen voor Qwen CLI. |

Vendor-specifieke uitvoeringsprotocollen worden automatisch geïnjecteerd bij CLI-gespawnde agenten via `oma agent spawn`. Native subagenten gebruiken de integratieregels van de geselecteerde vendor.

### Conditionele resources (`.agents/skills/_shared/conditional/`)

Deze worden alleen geladen wanneer tijdens de uitvoering aan specifieke voorwaarden is voldaan:

| Resource | Triggerconditie | Geladen door | Ongeveer tokens |
|----------|-----------------|--------------|----------------|
| **`quality-score.md`** | VERIFY- of SHIP-fase begint in een workflow die kwaliteitsmeting ondersteunt | Orchestrator (geeft door aan QA-agentprompt) | ~250 |
| **`experiment-ledger.md`** | Het eerste experiment wordt vastgelegd na een IMPL-baseline | Orchestrator (inline, na baselinemeting) | ~250 |
| **`exploration-loop.md`** | Dezelfde poort faalt twee keer op hetzelfde probleem | Orchestrator (inline, vóór hypotheses te spawnen) | ~250 |

Als alle drie worden geladen, kost dat ongeveer 750 tokens. Omdat het laden conditioneel is, worden er in een doorsneesessie 1-2 geladen — verwaarloosbaar naast de ongeveer 4.000 tokens die een Simple-taak al verbruikt voor `SKILL.md` plus `execution-protocol.md`.

---

## Hoe skills routeren via skill-routing.md

De skill-routeringskaart bepaalt hoe taken aan agenten worden gekoppeld:

### Eenvoudige routering (één domein)

Een prompt met "Build a login form with Tailwind CSS" matcht de keywords `UI`, `component`, `form`, `Tailwind` en routeert naar **oma-frontend**.

### Complexe verzoekroutering

Verzoeken over meerdere domeinen volgen vaste uitvoeringsvolgordes:

| Verzoekpatroon | Uitvoeringsvolgorde |
|----------------|----------------|
| "Maak een fullstack-app" | oma-pm -> (oma-backend + oma-frontend) parallel -> oma-qa |
| "Maak een mobiele app" | oma-pm -> (oma-backend + oma-mobile) parallel -> oma-qa |
| "Fix bug and review" | oma-debug -> oma-qa |
| "Design and build a landing page" | oma-design -> oma-frontend |
| "I have an idea for a feature" | oma-brainstorm -> oma-pm -> relevante agenten -> oma-qa |
| "Do everything automatically" | oma-orchestration (intern: oma-pm -> agenten -> oma-qa) |

### Inter-agentafhankelijkheidsregels

**Kunnen parallel (geen afhankelijkheden):**
- oma-backend + oma-frontend (wanneer het API-contract vooraf is gedefinieerd)
- oma-backend + oma-mobile (wanneer het API-contract vooraf is gedefinieerd)
- oma-frontend + oma-mobile (onafhankelijk van elkaar)

**Moeten sequentieel:**
- oma-brainstorm -> oma-pm (ontwerp vóór planning)
- oma-pm -> alle andere agenten (planning eerst)
- implementatieagent -> oma-qa (review na implementatie)
- oma-backend -> oma-frontend/oma-mobile (wanneer geen vooraf gedefinieerd API-contract bestaat)

**QA komt altijd als laatste**, behalve wanneer de gebruiker alleen een review van specifieke bestanden vraagt.

---

## Tokenbesparingsberekening {#token-savings-math}

Deze cijfers zijn gemeten uit de skill tree, niet met de hand geschat. Leid ze op elk moment opnieuw af:

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

Tokenaantallen zijn **benaderingen** (bytes ÷ 4, een ruwe verhouding voor Engelse Markdown). Tabellen en codefences tokeniseren iets ongunstiger, dus deze cijfers vallen iets laag uit; gebruik een echte tokenizer tegen je doelmodel als exacte aantallen nodig zijn.

### Laadniveaus

Elk niveau is een toestand die een agent daadwerkelijk bereikt, volgens
[`context-loading.md`](https://github.com/first-fluke/oh-my-agent/blob/main/.agents/skills/_shared/core/context-loading.md):

| Niveau | Wat in de context staat |
|------|--------------------|
| `routed` | Alleen `SKILL.md` |
| `simple` | + `execution-protocol.md` |
| `medium` | + de gemapte resource voor de taak, wanneer dat bestand bestaat |
| `complex` | + de gemapte resource en stackreferenties wanneer het project die levert |
| `all` | `SKILL.md` + elk resourcebestand — het **plafond**, geen selecteerbare modus |

Voor backend- en mobileskills kan `/stack-set` projectspecifieke referenties genereren onder `stack/`. Een verse checkout heeft geen gegenereerde stackmap; de rij `complex` wordt daarom gemeten tegen de meegeleverde `variants/`-seeds waarvan de generatie afleidt — een proxy voor omvang, niet een bestand dat een agent nu al laadt.

### Een sessie met 5 agenten (pm, backend, frontend, mobile, qa)

| Niveau | Tokens | Aandeel van plafond | Vermeden |
|------|-------:|-----------------:|--------:|
| `routed` | 11,497 | 15.7% | 84.3% |
| `simple` | 17,923 | 24.4% | 75.6% |
| `medium` | 19,125 | 26.1% | 73.9% |
| `complex` | 39,156 | 53.4% | 46.6% |
| `all` | 73,355 | 100% | — |

Een Simple- of Medium-taak over vijf agenten houdt ongeveer **17-19K tokens** aan skillcontext vast in plaats van het plafond van 73K; een Complex-taak ongeveer **38K**. De besparing is voor normaal werk dus ~74-76% en daalt naar ~47% wanneer een taak stackreferenties laadt. Op een model met context van 128K betekent dat ongeveer 110K vrije tokens voor Simple/Medium-werk en 90K voor Complex werk.

:::note Lees `all` als bovengrens, niet als alternatief
Geen enkele runtime laadt elke resource vooraf: skills worden via `description` zichtbaar, hun body wordt gelezen wanneer ze worden gerouteerd en resources worden alleen gelezen wanneer de taak ze nodig heeft. `all` is de bovengrens van wat een skill kan kosten. Daarom zijn de percentages geformuleerd als "vermeden" en niet als vergelijking met een echte configuratie.
:::

Laag 1 is de ondergrens en die is niet klein: over de 33 geïnstalleerde skills varieert `SKILL.md` van ongeveer 1.275-5.489 tokens (mediaan ~2.631). Die ondergrens beperkt hoeveel progressief onthullen kan besparen — met alle vijf agenten gerouteerd gebruikt alleen niveau `routed` al 15% van het plafond.

---

## Resources laden per taakmoeilijkheid

De difficulty guide deelt taken in drie niveaus in. Die bepalen hoeveel van Laag 2 wordt geladen:

### Eenvoudig (3-5 beurten verwacht)

Eén bestandswijziging, duidelijke requirements, bestaande patronen herhalen.

Laadt alleen `execution-protocol.md`. Sla analyse over, ga direct naar implementatie en gebruik een minimale checklist.

### Gemiddeld (8-15 beurten verwacht)

2-3 bestandswijzigingen, enkele ontwerpkeuzes nodig, patronen toepassen in nieuwe domeinen.

Laadt `execution-protocol.md` plus de gemapte Medium-resource wanneer dat bestand bestaat. Gebruikt het standaardprotocol met korte analyse en volledige verificatie.

### Complex (15-25 beurten verwacht)

4+ bestandswijzigingen, architectuurkeuzes nodig, nieuwe patronen introduceren of afhankelijkheden van andere agenten.

Laadt `execution-protocol.md` plus de gemapte resource en beschikbare verwijzingen naar `tech-stack.md` / `snippets.md`. Gebruikt het uitgebreide protocol met checkpoints, tussentijdse voortgangsregistratie en volledige verificatie inclusief `common-checklist.md`.

---

## Context-loading-taakkaarten (per agent)

De context-loading guide bevat gedetailleerde mappingen van taaktype naar resource. Dit zijn de belangrijkste:

### Backend agent

| Taaktype | Vereiste resources |
|-----------|-------------------|
| CRUD-API maken | passende `variants/{node,python,rust}/snippets.md` wanneer aanwezig |
| Authenticatie | passende variant `snippets.md` + `tech-stack.md` wanneer aanwezig |
| DB-migratie | passende variant `snippets.md` wanneer aanwezig |
| Performanceoptimalisatie | `orm-reference.md` en eventuele bijpassende voorbeelden die de skill levert |
| Bestaande code wijzigen | de projectprovider voor code-intelligentie en relevante uitvoeringsresources |

### Frontend agent

| Taaktype | Vereiste resources |
|-----------|-------------------|
| Component maken | `snippets.md` + bestaande componentpatronen van het project |
| Formulierimplementatie | `snippets.md` (formulier + Zod) |
| API-integratie | `snippets.md` (TanStack Query) |
| Styling | `tailwind-rules.md` |
| Paginalayout | `snippets.md` (grid) |

### Design agent

| Taaktype | Vereiste resources |
|-----------|-------------------|
| Designsystem maken | `reference/typography.md` + `reference/color-and-contrast.md` + `reference/spatial-design.md` + `design-md-spec.md` |
| Landingspagina ontwerpen | `reference/component-patterns.md` + `reference/motion-design.md` + `prompt-enhancement.md` |
| Designaudit | `checklist.md` + `anti-patterns.md` |
| Designtokens exporteren | `design-tokens.md` |
| 3D/shader | `reference/shader-and-3d.md` + `reference/motion-design.md` |
| Toegankelijkheidsreview | `reference/accessibility.md` + `checklist.md` |

### QA-agent

| Taaktype | Vereiste resources |
|-----------|-------------------|
| Securityreview | `checklist.md` (sectie Security) |
| Performancereview | `checklist.md` (sectie Performance) |
| Toegankelijkheidsreview | `checklist.md` (sectie Accessibility) |
| Volledige audit | `checklist.md` (volledig) + `self-check.md` |
| Quality scoring | `quality-score.md` (conditioneel) |

---

## Promptcompositie door de orchestrator

Wanneer de orchestrator prompts voor subagenten samenstelt, neemt hij alleen taakrelevante resources op:

1. De kernregels uit het SKILL.md van de agent
2. `execution-protocol.md`
3. Resources voor het specifieke taaktype (uit de kaarten hierboven)
4. `error-playbook.md` (altijd; herstel is essentieel)
5. Memory Protocol (CLI-modus)

Deze gerichte samenstelling voorkomt dat onnodige resources worden geladen en laat de subagent zoveel mogelijk context overhouden voor het eigenlijke werk.

---

## Clarification Debt en sessiemetrics (verdieping)

Clarification Debt (CD) meet de kosten van onduidelijke requirements tijdens een sessie. De orchestrator registreert elke gebruikerscorrectie en kent punten toe:

| Gebeurtenistype | Punten | Beschrijving |
|------------|-------:|-------------|
| `clarify` | +10 | Eenvoudige verduidelijkingsvraag (verwacht bij MEDIUM-onzekerheid) |
| `correct` | +25 | Intent verkeerd begrepen, waardoor de richting moet veranderen |
| `redo` | +40 | Charter- of scopeovertreding, waardoor terugdraaien en opnieuw starten nodig is |
| `blocked` | +0 | Agent stopte correct en vroeg het ontbrekende (goed gedrag, geen straf) |

**Modifiers:** Charter niet gelezen (+15), allowlist overtreden (+20), dezelfde fout opnieuw (x1.5).

**Drempels en handhaving:**
- **CD >= 50** -> verplichte RCA-entry in `lessons-learned.md`
- **CD >= 80** -> sessie stopt; de gebruiker moet requirements opnieuw specificeren
- **`redo` >= 2** -> orchestrator pauzeert en vraagt expliciete scopebevestiging
- **CD >= 30 in 3 opeenvolgende sessies voor dezelfde agent** -> review van het agentprompt-sjabloon

Het sessielogboek staat in `.agents/state/memories/session-metrics.md`, met per gebeurtenis een rij (beurt, agent, type, punten, detail) en een samenvatting.

---

## Evaluatornauwkeurigheid en QA-tuning

QA-agenten worden beter door geregistreerde beoordelingsfouten. In tegenstelling tot CD is Evaluator Accuracy (EA) retrospectief; de meeste fouten worden na afloop van de sessie ontdekt.

**EA-gebeurtenistypen:**

| Gebeurtenis | Punten | Wanneer ontdekt |
|-------|-------:|-----------------|
| `false_negative` | +30 | Volgende sessie of productie (bug gemist door QA) |
| `false_positive` | +15 | Tijdens sessie (implementatieagent weerlegt bevinding met succes) |
| `severity_mismatch` | +10 | Tijdens de sessie of bij de volgende review (verkeerde ernst) |
| `missed_stub` | +20 | Runtimeverificatie vindt display-only feature |
| `good_catch` | -10 | QA vond een niet voor de hand liggende bug (positief signaal) |

EA wordt berekend over een voortschrijdend venster van 3 sessies. Drempels:
- **EA >= 30** -> tuning aanbevolen: terugkerende beoordelingsfouten bekijken
- **EA >= 50** -> tuning vereist: `execution-protocol.md` van QA bijwerken
- **`false_negative` >= 3** in het venster -> patroon toevoegen aan `checklist.md` van QA
- **`good_catch` >= 5** in het venster -> geslaagd patroon veralgemenen naar `common-checklist.md`

Bij een overschreden drempel worden EA-gebeurtenissen bekeken, fouten gecategoriseerd, checklist of uitvoeringsprotocol aangepast en de wijziging in de volgende 3 sessies gevalideerd.

---

## Sprintdecompositie voor complexe taken

Complexe taken (4+ bestanden en architectuurkeuzes) gebruiken sprintuitvoering in plaats van één lange run:

1. **Splitsen:** verdeel in 2-4 functiegerichte sprints die elk onafhankelijk testbaar zijn
2. **Doel:** 5-8 beurten per sprint
3. **Sprintpoort** na elke sprint:
   - Is het sprintdeliverable af?
   - Slagen lint/test?
   - Duurde de sprint 2x langer dan verwacht? Schrijf dan een checkpoint en informeer de gebruiker
4. **Doorgaan:** ga bij een geslaagde poort naar de volgende sprint

**Voorbeeld:** De taak "JWT-auth + CRUD-API + tests" wordt opgesplitst in:
- Sprint 1: Usermodel + auth-endpoints (register/login)
- Sprint 2: CRUD-endpoints + validatie
- Sprint 3: Tests + foutafhandeling

**Herstel bij verkeerde moeilijkheidsinschatting:** Als een taak als Simple begint maar complexer blijkt, schakelt de agent halverwege over naar het Medium- of Complex-protocol en registreert die wijziging in de voortgang.

---

## Context-resetprotocol

Langlopende agenten verliezen kwaliteit wanneer de context volloopt. De orchestrator (niet de agent zelf) bewaakt dit en start resets.

**Triggercondities (orchestrator controleert tijdens monitoring):**

| Conditie | Detectie | Actie |
|-----------|-----------|--------|
| Beurtbudget op | Agent gebruikte >= 80% van verwachte beurten en minder dan 50% van de criteria is af | Context reset |
| Voortgang staat stil | 3+ opeenvolgende monitorcycli geen update in progressbestand | Context reset |
| Oppervlakkige output | Resultaatbestand bevat stubmarkers of TODO-placeholders | Opnieuw spawnen met expliciete instructie |

**Resetprocedure:**
1. **Checkpoint:** sla de huidige status op (afgerond, resterend, belangrijke beslissingen)
2. **Beëindigen:** stop de huidige agentrun
3. **Opnieuw spawnen:** start een nieuwe run met het checkpoint als context
4. **Hervatten:** de nieuwe agent leest het checkpoint en gaat alleen verder met wat nog openstaat

Voor standalone-agenten zonder orchestrator fungeert de Sprint Gate als vangnet. Duurt een sprint 2x langer dan verwacht, schrijf dan een checkpoint en informeer de gebruiker.
