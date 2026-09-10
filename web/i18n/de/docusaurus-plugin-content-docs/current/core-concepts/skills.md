---
title: Skills
description: Vollständige Anleitung zur Zwei-Schichten-Architektur der 33 OMA-Skills, einschließlich SKILL.md-Routing, bedarfsgesteuerter Ressourcen, gemeinsamer und bedingter Protokolle, Vendor-Ausführung, Token-Messungen und Routing-Mechanik.
---

# Skills

Skills sind strukturierte Wissenspakete, die jedem Agenten seine Domänenexpertise verleihen. Sie sind nicht nur Prompts — sie enthalten Ausführungsprotokolle, Tech-Stack-Referenzen, Code-Vorlagen, Fehler-Playbooks, Qualitätschecklisten und Few-Shot-Beispiele, organisiert in einer Zwei-Schichten-Architektur, die auf Token-Effizienz ausgelegt ist.

---

## Das Zwei-Schichten-Design

### Schicht 1: SKILL.md (Median ~2.631 Tokens, beim Routing des Skills geladen)

Jeder Skill hat eine `SKILL.md`-Datei im Stammverzeichnis. Sie gelangt in das Kontextfenster, sobald der Skill geroutet wird — der Injector-Hook übergibt eine **Pfadangabe**, nicht den Inhalt. Ein nicht gerouteter Skill kostet daher außer seiner `description` nichts. Die Datei enthält:

- **YAML-Frontmatter** mit `name` und `description` (verwendet für Routing und Anzeige)
- **Wann verwenden / Wann NICHT verwenden** — explizite Aktivierungsbedingungen
- **Kernregeln** — die 5-15 kritischsten Einschränkungen für die Domäne
- **Architekturübersicht** — wie Code strukturiert sein sollte
- **Bibliotheksliste** — genehmigte Abhängigkeiten und deren Zwecke
- **Referenzen** — Verweise auf Schicht-2-Ressourcen (werden nie automatisch geladen)

Beispiel-Frontmatter:

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

Das description-Feld ist entscheidend — es enthält die Routing-Keywords, die das Skill-Routing-System zur Zuordnung von Aufgaben zu Agenten verwendet.

### Schicht 2: resources/ (bedarfsgesteuert geladen)

Das `resources/`-Verzeichnis enthält ausführliches Ausführungswissen. Diese Dateien werden nur geladen, wenn:
1. Der Host oder Workflow den Skill ausgewählt hat (etwa durch Skill-Matching oder einen ausdrücklichen Befehl)
2. Die spezifische Ressource für den aktuellen Aufgabentyp und Schwierigkeitsgrad benötigt wird

Dieses bedarfsgesteuerte Laden wird durch den Context-Loading-Leitfaden (`.agents/skills/_shared/core/context-loading.md`) gesteuert, der Aufgabentypen den erforderlichen Ressourcen pro Agent zuordnet.

---

## Beispiel der Dateistruktur

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

## Ressourcentypen pro Skill

| Ressourcentyp | Dateinamenmuster | Zweck | Wann geladen |
|--------------|-----------------|---------|-------------|
| **Ausführungsprotokoll** | `execution-protocol.md` | Schritt-für-Schritt-Workflow: Analysieren -> Planen -> Implementieren -> Verifizieren | Immer (mit SKILL.md) |
| **Tech-Stack** | `tech-stack.md` | Detaillierte Technologiespezifikationen, Versionen, Konfiguration | Komplexe Aufgaben |
| **Fehler-Playbook** | `error-playbook.md` | Wiederherstellungsverfahren mit "3-Strikes"-Eskalation | Nur bei Fehlern |
| **Checkliste** | `checklist.md` | Domänenspezifische Qualitätsverifikation | Beim Verifikationsschritt |
| **Snippets** | `snippets.md` | Kopierbereite Code-Muster | Mittlere/komplexe Aufgaben |
| **Beispiele** | `examples.md` oder `examples/` | Few-Shot-Ein-/Ausgabebeispiele für das LLM | Mittlere/komplexe Aufgaben |
| **Varianten** | `variants/`-Verzeichnis | Sprach-/Framework-spezifische Referenzen. Für Backend gibt es `node`, `python` und `rust` als Seeds; Mobile liefert ein Schema und kann generierte Plattformreferenzen erhalten. | Wenn ein passender Stack vorhanden ist |
| **Vorlagen** | `component-template.tsx`, `screen-template.dart` | Boilerplate-Dateivorlagen | Bei Komponentenerstellung |
| **Domänenreferenz** | `orm-reference.md`, `anti-patterns.md` usw. | Vertiefte Domänenkenntnisse für spezifische Teilaufgaben | Aufgabentypspezifisch |

---

## Gemeinsame Ressourcen (_shared/)

Alle Agenten teilen gemeinsame Grundlagen aus `.agents/skills/_shared/`. Diese sind in drei Kategorien organisiert:

### Kernressourcen (`.agents/skills/_shared/core/`)

| Ressource | Zweck | Wann geladen |
|----------|---------|-------------|
| **`skill-routing.md`** | Ordnet Aufgaben-Keywords dem richtigen Agenten zu. Enthält die Skill-Agent-Zuordnung, Muster für komplexes Request-Routing, Inter-Agent-Abhängigkeiten, Eskalationsregeln und den Leitfaden für Zug-Limits. | Von Orchestrator- und Koordinations-Skills referenziert |
| **`context-loading.md`** | Legt fest, welche Ressourcen für Aufgabentyp und Schwierigkeitsgrad geladen werden. Enthält Zuordnungstabellen pro Agent sowie Trigger für bedingte Protokolle. | Beim Workflow-Start (Schritt 0 / Phase 0) |
| **`prompt-structure.md`** | Definiert die vier Elemente jedes Aufgaben-Prompts: Ziel, Kontext, Einschränkungen und Abschlusskriterium. Enthält Vorlagen für PM-, Implementierungs- und QA-Agenten sowie Anti-Patterns. | Von PM-Agent und allen Workflows referenziert |
| **`clarification-protocol.md`** | Definiert die Unsicherheitsstufen LOW/MEDIUM/HIGH und ihre Aktionen, Auslöser, Eskalationsvorlagen, Verifikationsanforderungen pro Agententyp und das Verhalten im Subagentenmodus. | Bei unklaren Anforderungen |
| **`context-budget.md`** | Verwaltet das Token-Budget. Beschreibt Dateilesestrategien (verwende `find_symbol`, nicht `read_file`), die gemessenen Kosten von Ressourcen, das durch `oma skill audit` geprüfte Limit für `SKILL.md`, den Umgang mit großen Dateien und Symptome eines Kontextüberlaufs. | Beim Workflow-Start |
| **`difficulty-guide.md`** | Kriterien für die Einstufung als Simple/Medium/Complex, erwartete Zugzahlen, Protokollpfade und die Wiederherstellung bei Fehleinstufung. | Beim Aufgabenstart (Schritt 0) |
| **`quality-principles.md`** | Vier universelle Qualitätsprinzipien, die für alle Agenten gelten. | Beim Workflow-Start qualitätsorientierter Workflows (ultrawork) |
| **`vendor-detection.md`** | Protokoll zur Erkennung der Laufzeitumgebung (Claude Code, Codex CLI, Antigravity, Cursor, Kiro, Qwen und CLI-Fallback). | Beim Workflow-Start |
| **`session-metrics.md`** | Bewertet Clarification Debt (CD) und Sitzungsmetriken. Enthält Ereignistypen, Schwellenwerte und Integrationspunkte. | Während Orchestrierungssitzungen |
| **`common-checklist.md`** | Universelle Qualitätscheckliste für die abschließende Verifikation komplexer Aufgaben, zusätzlich zu agentenspezifischen Checklisten. | Beim Verifikationsschritt komplexer Aufgaben |
| **`lessons-learned.md`** | Sammlung früherer Sitzungslearnings, automatisch aus Clarification-Debt-Überschreitungen und verworfenen Experimenten erzeugt und nach Domäne geordnet. | Nach Fehlern und am Sitzungsende |
| **`api-contracts/`** | Verzeichnis mit API-Vertragsvorlage und generierten Verträgen. `template.md` beschreibt das Format pro Endpunkt. | Wenn domänenübergreifende Arbeit geplant wird |

### Laufzeit-Ressourcen (`.agents/skills/_shared/runtime/`)

| Ressource | Zweck |
|----------|---------|
| **`memory-protocol.md`** | Speicherdateiformat und Operationen für CLI-Subagenten. Definiert Protokolle für Start, Ausführung und Abschluss mit konfigurierbaren Speicherwerkzeugen sowie eine Erweiterung zur Experimentverfolgung. |
| **`execution-protocols/claude.md`** | Claude-Code-spezifische Ausführungsmuster. Wird von `oma agent spawn` bei Vendor `claude` injiziert. |
| **`execution-protocols/antigravity.md`** | Ausführungsmuster für die Antigravity-CLI (`agy`). |
| **`execution-protocols/codex.md`** | Codex-CLI-spezifische Ausführungsmuster. |
| **`execution-protocols/commandcode.md`** | Ausführungsmuster für CommandCode. |
| **`execution-protocols/grok.md`** | Ausführungsmuster für Grok. |
| **`execution-protocols/kimi.md`** | Ausführungsmuster für Kimi Code. |
| **`execution-protocols/kiro.md`** | Ausführungsmuster für Kiro. |
| **`execution-protocols/opencode.md`** | Ausführungsmuster für die OpenCode-Erweiterung. |
| **`execution-protocols/pi.md`** | Ausführungsmuster für die pi-Erweiterung. |
| **`execution-protocols/qwen.md`** | Qwen-CLI-spezifische Ausführungsmuster. |

Vendor-spezifische Ausführungsprotokolle werden für per CLI gestartete Agenten automatisch durch `oma agent spawn` injiziert. Native Subagenten verwenden die Integrationsregeln des ausgewählten Vendors.

### Bedingte Ressourcen (`.agents/skills/_shared/conditional/`)

Diese werden nur geladen, wenn bestimmte Bedingungen während der Ausführung erfüllt sind:

| Ressource | Auslösebedingung | Geladen von | Ungefähre Tokens |
|----------|-------------------|-----------|----------------|
| **`quality-score.md`** | VERIFY- oder SHIP-Phase beginnt in einem Workflow, der Qualitätsmessung unterstützt | Orchestrator (wird an QA-Agent-Prompt übergeben) | ~250 |
| **`experiment-ledger.md`** | Erstes Experiment wird aufgezeichnet, nachdem eine IMPL-Baseline etabliert wurde | Orchestrator (inline, nach Baseline-Messung) | ~250 |
| **`exploration-loop.md`** | Dasselbe Gate scheitert zweimal beim selben Problem | Orchestrator (inline, vor dem Starten von Hypothesen-Agenten) | ~250 |

Budgetauswirkung: ungefähr 750 Tokens insgesamt, wenn alle 3 geladen werden. Da das Laden bedingt ist, laden typische Sitzungen 1-2 davon. Das Flash-Tier-Budget bleibt innerhalb der ungefähr 3.100 Token-Zuweisung.

---

## Wie Skills über skill-routing.md geroutet werden

Die Skill-Routing-Karte definiert, wie Aufgaben Agenten zugeordnet werden:

### Einfaches Routing (einzelne Domäne)

Ein Prompt mit "Build a login form with Tailwind CSS" stimmt mit den Keywords `UI`, `component`, `form`, `Tailwind` überein und wird an **oma-frontend** weitergeleitet.

### Routing komplexer Anfragen

Multi-Domänen-Anfragen folgen etablierten Ausführungsreihenfolgen:

| Anfragemuster | Ausführungsreihenfolge |
|----------------|----------------|
| "Erstelle eine Fullstack-App" | oma-pm -> (oma-backend + oma-frontend) parallel -> oma-qa |
| "Erstelle eine Mobile-App" | oma-pm -> (oma-backend + oma-mobile) parallel -> oma-qa |
| "Fix bug and review" | oma-debug -> oma-qa |
| "Design and build a landing page" | oma-design -> oma-frontend |
| "I have an idea for a feature" | oma-brainstorm -> oma-pm -> relevante Agenten -> oma-qa |
| "Do everything automatically" | oma-orchestration (intern: oma-pm -> Agenten -> oma-qa) |

### Inter-Agent-Abhängigkeitsregeln

**Können parallel laufen (keine Abhängigkeiten):**
- oma-backend + oma-frontend (wenn API-Vertrag vorab definiert ist)
- oma-backend + oma-mobile (wenn API-Vertrag vorab definiert ist)
- oma-frontend + oma-mobile (unabhängig voneinander)

**Müssen sequenziell laufen:**
- oma-brainstorm -> oma-pm (Design kommt vor Planung)
- oma-pm -> alle anderen Agenten (Planung kommt zuerst)
- Implementierungsagent -> oma-qa (Review nach Implementierung)
- oma-backend -> oma-frontend/oma-mobile (wenn kein vorab definierter API-Vertrag)

**QA ist immer zuletzt**, außer wenn der Benutzer nur ein Review bestimmter Dateien anfordert.

---

## Token-Einsparungsberechnung {#token-savings-math}

Diese Werte werden aus dem Skill-Baum gemessen und nicht von Hand geschätzt. Bei Bedarf lassen sie sich neu berechnen:

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

Tokenzahlen sind **Näherungswerte** (Bytes ÷ 4, ein grobes Verhältnis für englisches Markdown). Tabellen und Code-Fences werden etwas ungünstiger tokenisiert und liegen daher leicht zu niedrig. Für exakte Zahlen sollte ein echter Tokenizer des Zielmodells verwendet werden.

### Ladeebenen

Jede Ebene entspricht einem Zustand, den ein Agent tatsächlich erreicht, gemäß [`context-loading.md`](https://github.com/first-fluke/oh-my-agent/blob/main/.agents/skills/_shared/core/context-loading.md):

| Ebene | Inhalt des Kontexts |
|------|--------------------|
| `routed` | Nur `SKILL.md` |
| `simple` | + `execution-protocol.md` |
| `medium` | + die zugeordnete Ressource für die Aufgabe, sofern vorhanden |
| `complex` | + zugeordnete Ressource und Stack-Referenzen, sofern das Projekt sie bereitstellt |
| `all` | `SKILL.md` + jede Ressourcendatei — die **Obergrenze**, kein auswählbarer Modus |

Für Backend- und Mobile-Skills kann `/stack-set` projektspezifische Referenzen unter `stack/` erzeugen. In einem frischen Checkout existiert dieses Verzeichnis noch nicht; die folgende Zeile `complex` wird daher anhand der ausgelieferten `variants/`-Seeds gemessen, aus denen die Generierung ableitet. Sie ist ein Größenproxy und keine Datei, die ein Agent bereits lädt.

### Eine Sitzung mit 5 Agenten (pm, backend, frontend, mobile, qa)

| Ebene | Tokens | Anteil an der Obergrenze | Vermeidung |
|------|-------:|-------------------------:|----------:|
| `routed` | 11.497 | 15,7 % | 84,3 % |
| `simple` | 17.923 | 24,4 % | 75,6 % |
| `medium` | 19.125 | 26,1 % | 73,9 % |
| `complex` | 39.156 | 53,4 % | 46,6 % |
| `all` | 73.355 | 100 % | — |

Bei einer einfachen oder mittleren Aufgabe über fünf Agenten liegen damit ungefähr **17–19.000 Tokens** Skill-Kontext an, statt der Obergrenze von 73.000. Eine komplexe Aufgabe benötigt etwa **38.000**. Das entspricht bei gewöhnlicher Arbeit einer Einsparung von rund 74–76 %, bei geladenen Stack-Referenzen etwa 47 %. Bei einem Modell mit 128K Kontext bleiben damit ungefähr 110K Tokens für Simple/Medium und 90K für Complex frei.

:::note `all` ist eine Grenze, keine Alternative
Keine Laufzeit lädt jede Ressource im Voraus: Skills werden über ihre `description` angeboten, ihr Inhalt wird beim Routing gelesen und Ressourcen werden nur nach Bedarf geladen. `all` ist die obere Grenze dessen, was ein Skill kosten *könnte*. Deshalb werden die Prozentwerte als „vermieden“ angegeben und nicht als Vergleich mit einer realen Konfiguration.
:::

Schicht 1 bildet den Boden und ist nicht klein: Über die 33 installierten Skills umfasst `SKILL.md` etwa 1.275–5.489 Tokens (Median ~2.631). Dieser Boden begrenzt die Einsparung durch progressive Offenlegung. Sind alle fünf Agenten geroutet, belegt allein die Ebene `routed` bereits 15 % der Obergrenze.

---

## Ressourcenladen nach Aufgabenschwierigkeit

Der Schwierigkeitsleitfaden klassifiziert Aufgaben in drei Stufen. Daraus ergibt sich, wie viel von Schicht 2 geladen wird:

### Einfach (3-5 erwartete Züge)

Einzelne Dateiänderung, klare Anforderungen, Wiederholung vorhandener Muster.

Lädt: nur `execution-protocol.md`. Analyse überspringen, direkt zur Implementierung mit minimaler Checkliste.

### Mittel (8-15 erwartete Züge)

2–3 Dateiänderungen, einige Designentscheidungen und die Übertragung von Mustern auf neue Domänen.

Lädt: `execution-protocol.md` plus die zugeordnete Medium-Ressource, sofern diese Datei vorhanden ist. Standardprotokoll mit kurzer Analyse und vollständiger Verifikation.

### Komplex (15-25 erwartete Züge)

4+ Dateiänderungen, erforderliche Architekturentscheidungen, neue Muster oder Abhängigkeiten von anderen Agenten.

Lädt: `execution-protocol.md` plus zugeordnete Ressource und verfügbare `tech-stack.md`-/`snippets.md`-Referenzen. Erweitertes Protokoll mit Checkpoints, Fortschrittsaufzeichnung während der Ausführung und vollständiger Verifikation einschließlich `common-checklist.md`.

---

## Context-Loading-Aufgabenzuordnungen (pro Agent)

Der Context-Loading-Leitfaden bietet detaillierte Aufgabentyp-zu-Ressource-Zuordnungen. Hier sind die wichtigsten Zuordnungen:

### Backend-Agent

| Aufgabentyp | Erforderliche Ressourcen |
|-----------|-------------------|
| CRUD-API-Erstellung | passende `variants/{node,python,rust}/snippets.md`, sofern vorhanden |
| Authentifizierung | passende `snippets.md`-Variante + `tech-stack.md`, sofern vorhanden |
| DB-Migration | passende `snippets.md`-Variante, sofern vorhanden |
| Performance-Optimierung | `orm-reference.md` und passende vom Skill bereitgestellte Beispiele |
| Vorhandenen Code modifizieren | projektweiter Code-Intelligence-Provider und relevante Ausführungsressourcen |

### Frontend-Agent

| Aufgabentyp | Erforderliche Ressourcen |
|-----------|-------------------|
| Komponentenerstellung | snippets.md + vorhandene Komponenten-Muster des Projekts |
| Formularimplementierung | snippets.md (Formular + Zod) |
| API-Integration | snippets.md (TanStack Query) |
| Styling | tailwind-rules.md |
| Seitenlayout | snippets.md (Grid) |

### Design-Agent

| Aufgabentyp | Erforderliche Ressourcen |
|-----------|-------------------|
| Design-System-Erstellung | reference/typography.md + reference/color-and-contrast.md + reference/spatial-design.md + design-md-spec.md |
| Landingpage-Design | reference/component-patterns.md + reference/motion-design.md + prompt-enhancement.md |
| Design-Audit | checklist.md + anti-patterns.md |
| Design-Token-Export | design-tokens.md |
| 3D- / Shader-Effekte | reference/shader-and-3d.md + reference/motion-design.md |
| Barrierefreiheits-Review | reference/accessibility.md + checklist.md |

### QA-Agent

| Aufgabentyp | Erforderliche Ressourcen |
|-----------|-------------------|
| Sicherheits-Review | checklist.md (Sicherheitsabschnitt) |
| Performance-Review | checklist.md (Performance-Abschnitt) |
| Barrierefreiheits-Review | checklist.md (Barrierefreiheitsabschnitt) |
| Vollständiges Audit | checklist.md (vollständig) + self-check.md |
| Qualitätsbewertung | quality-score.md (bedingt) |

---

## Orchestrator-Prompt-Zusammenstellung

Wenn der Orchestrator Prompts für Subagenten zusammenstellt, enthält er nur aufgabenrelevante Ressourcen:

1. Kernregeln-Abschnitt der SKILL.md des Agenten
2. `execution-protocol.md`
3. Ressourcen, die dem spezifischen Aufgabentyp entsprechen (aus den obigen Zuordnungen)
4. `error-playbook.md` (immer enthalten — Fehlerbehandlung ist essenziell)
5. Memory Protocol (CLI-Modus)

Diese zielgerichtete Zusammenstellung vermeidet unnötige Ressourcen und maximiert den verfügbaren Kontext des Subagenten für die eigentliche Arbeit.

---

## Clarification Debt und Sitzungsmetriken (Vertiefung)

Clarification Debt (CD) misst die Kosten unklarer Anforderungen während einer Sitzung. Der Orchestrator erfasst jede Korrektur durch den Benutzer und bewertet sie:

| Ereignistyp | Punkte | Beschreibung |
|------------|--------|-------------|
| `clarify` | +10 | Einfache Klärungsfrage (bei MEDIUM-Unsicherheit erwartet) |
| `correct` | +25 | Missverstandene Absicht, die eine Richtungsänderung erfordert |
| `redo` | +40 | Verstoß gegen Umfang oder Charter, der Rollback und Neustart erfordert |
| `blocked` | +0 | Agent stoppt korrekt und fragt nach (gutes Verhalten, keine Strafe) |

**Modifikatoren:** Charter nicht gelesen (+15), Allowlist-Verstoß (+20), derselbe Fehler erneut (×1,5).

**Schwellenwerte und Durchsetzung:**
- **CD >= 50** → Verbindlicher RCA-Eintrag in `lessons-learned.md`
- **CD >= 80** → Sitzung wird angehalten; der Benutzer muss die Anforderungen neu spezifizieren
- **`redo` >= 2** → Orchestrator pausiert und fordert eine ausdrückliche Bestätigung des Umfangs an
- **CD >= 30 über 3 aufeinanderfolgende Sitzungen für denselben Agenten** → Vorlage für den Agenten-Prompt prüfen

Das Sitzungsprotokoll liegt in `.agents/state/memories/session-metrics.md`. Es enthält Zeilen pro Ereignis (Zug, Agent, Ereignistyp, Punkte, Details) und einen Zusammenfassungsabschnitt.

---

## Evaluator-Genauigkeit und QA-Tuning

QA-Agenten verbessern sich durch erfasste Beurteilungsfehler. Im Gegensatz zu CD (Echtzeit) ist Evaluator Accuracy (EA) retrospektiv; die meisten Fehler werden erst nach Sitzungsende entdeckt.

**EA-Ereignistypen:**

| Ereignis | Punkte | Entdeckung |
|-------|--------|-----------------|
| `false_negative` | +30 | Nächste Sitzung oder Produktion (von QA übersehener Fehler) |
| `false_positive` | +15 | Während der Sitzung (Implementierungsagent widerlegt den QA-Befund) |
| `severity_mismatch` | +10 | Während der Sitzung oder im Review der nächsten Sitzung (falsche Schwere) |
| `missed_stub` | +20 | Laufzeitverifikation findet ein reines Anzeige-Stub-Feature |
| `good_catch` | -10 | QA entdeckt einen nicht offensichtlichen Fehler (positives Signal) |

**EA wird über ein gleitendes Fenster von drei Sitzungen berechnet.** Schwellenwerte:
- **EA >= 30** → Tuning empfohlen: gesammelte EA-Ereignisse auf wiederkehrende QA-Fehler prüfen
- **EA >= 50** → Tuning erforderlich: `execution-protocol.md` des QA-Skills aktualisieren
- **`false_negative` >= 3** im Fenster → Erkennungsmuster in `checklist.md` des QA-Skills ergänzen
- **`good_catch` >= 5** im Fenster → Erfolgreiches Muster in `common-checklist.md` verallgemeinern

Bei Überschreiten eines Schwellenwerts die EA-Ereignisse prüfen, Fehler kategorisieren, die QA-Checkliste oder das Ausführungsprotokoll anpassen und die Änderung in den nächsten drei Sitzungen validieren.

---

## Sprint-Zerlegung für komplexe Aufgaben

Komplexe Aufgaben (4+ Dateien, Architekturentscheidungen) werden in Sprints ausgeführt und nicht als ein einziger langer Lauf:

1. **Zerlegen:** in 2–4 auf ein Feature fokussierte, unabhängig testbare Sprints
2. **Ziel:** 5–8 Züge pro Sprint
3. **Sprint Gate** nach jedem Sprint:
   - Ist das Sprint-Ergebnis vollständig?
   - Bestehen Lint und Tests?
   - Dauert der Sprint doppelt so lange wie erwartet → Checkpoint schreiben und den Benutzer informieren
4. **Fortsetzen:** nächsten Sprint starten, wenn das Gate bestanden ist

**Beispiel:** Die Aufgabe „JWT-Auth + CRUD-API + Tests“ wird aufgeteilt in:
- Sprint 1: Benutzermodell und Auth-Endpunkte (Registrierung/Login)
- Sprint 2: CRUD-Endpunkte und Validierung
- Sprint 3: Tests und Fehlerbehandlung

**Wiederherstellung bei Fehleinstufung:** Wenn eine als Simple gestartete Aufgabe komplexer wird, wechselt der Agent während der Ausführung zum Medium- oder Complex-Protokoll und vermerkt die Änderung im Fortschritt.

---

## Protokoll für Kontext-Resets

Bei langen Läufen nimmt die Qualität ab, sobald der Kontext vollläuft. Der Orchestrator (nicht der Agent selbst) überwacht dies und löst Resets aus.

**Auslöser (während der Überwachung):**

| Bedingung | Erkennung | Aktion |
|-----------|-----------|--------|
| Zugbudget erschöpft | Agent hat >= 80 % der erwarteten Züge verbraucht und < 50 % der Akzeptanzkriterien erfüllt | Kontext-Reset |
| Fortschritt stockt | 3 oder mehr Überwachungszyklen ohne Aktualisierung der Fortschrittsdatei | Kontext-Reset |
| Oberflächliche Ausgabe | Ergebnisdatei enthält Stub-Marker oder TODO-Platzhalter | Mit ausdrücklicher Anweisung neu starten |

**Reset-Ablauf:**
1. **Checkpoint:** aktuellen Zustand des Agenten speichern (abgeschlossen, offen, wichtige Entscheidungen)
2. **Beenden:** aktuellen Agentenlauf stoppen
3. **Neu starten:** frischen Agenten mit dem Checkpoint als Kontext starten
4. **Fortsetzen:** neuer Agent liest den Checkpoint und arbeitet nur die offenen Punkte ab

Für eigenständige Agenten ohne Orchestrator dient das Sprint Gate in `difficulty-guide.md` als Sicherheitsnetz. Dauert ein Sprint doppelt so lange wie erwartet, schreibt der Agent einen Checkpoint und informiert den Benutzer.
