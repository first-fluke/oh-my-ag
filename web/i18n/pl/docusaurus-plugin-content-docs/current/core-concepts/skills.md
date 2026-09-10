---
title: Umiejętności
description: "Pełny przewodnik po dwuwarstwowej architekturze OMA obejmującej 33 umiejętności: routing SKILL.md, zasoby ładowane na żądanie, protokoły współdzielone i warunkowe, wykonywanie przez dostawców, pomiary tokenów oraz mechanikę routingu."
---

# Umiejętności {#skills}

Umiejętności to uporządkowane pakiety wiedzy, które dostarczają roli dispatchu wskazówek z jej domeny. Zawierają protokoły wykonywania, referencje stosu technologicznego, szablony kodu, podręczniki błędów, checklisty jakości i przykłady, jeśli dana umiejętność je udostępnia. Są zorganizowane w dwuwarstwowej architekturze zaprojektowanej pod kątem oszczędzania tokenów.

---

## Architektura dwuwarstwowa {#the-two-layer-design}

### Warstwa 1: SKILL.md (mediana ~2631 tokenów, ładowana po routingu umiejętności) {#layer-1-skillmd-2631-tokens-median-loaded-when-the-skill-is-routed}

Każda umiejętność ma w katalogu głównym plik `SKILL.md`. Trafia on do okna kontekstu po skierowaniu do niego umiejętności — hook injectora przekazuje **referencję ścieżki**, a nie treść, więc nieroutowana umiejętność nie kosztuje nic poza swoim `description`. Plik zawiera:

- **Frontmatter YAML** z `name` i `description` (używanymi do routingu i wyświetlania)
- **When to use / When NOT to use**: jawne warunki aktywacji
- **Core rules**: 5–15 najważniejszych ograniczeń dla domeny
- **Przegląd architektury**: jak należy strukturyzować kod
- **Lista bibliotek**: zatwierdzone zależności i ich przeznaczenie
- **Referencje**: odnośniki do zasobów warstwy 2 (nigdy nie są ładowane automatycznie)

Przykładowy frontmatter:

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

Pole description ma kluczowe znaczenie, ponieważ zawiera słowa kluczowe routingu używane przez system routingu umiejętności do dopasowywania zadań do agentów.

### Warstwa 2: resources/ (ładowana na żądanie) {#layer-2-resources-loaded-on-demand}

Katalog `resources/` zawiera pogłębioną wiedzę o wykonywaniu. Pliki te są ładowane tylko wtedy, gdy:
1. Host lub workflow wybrał umiejętność (np. przez natywne dopasowanie umiejętności albo jawne polecenie)
2. Konkretny zasób jest potrzebny dla bieżącego typu i poziomu trudności zadania

To ładowanie na żądanie podlega przewodnikowi ładowania kontekstu (`.agents/skills/_shared/core/context-loading.md`), który mapuje typy zadań na wymagane zasoby dla każdego agenta.

---

## Przykład struktury plików {#file-structure-example}

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

## Typy zasobów per umiejętność {#per-skill-resource-types}

| Typ zasobu | Wzorzec nazwy pliku | Przeznaczenie | Kiedy ładowany |
|--------------|---------------------|-------------|-------------|
| **Protokół wykonywania** | `execution-protocol.md` | Workflow krok po kroku: Analyze -> Plan -> Implement -> Verify | Zawsze (wraz z SKILL.md) |
| **Stos technologiczny** | `tech-stack.md` | Szczegółowe specyfikacje technologii, wersje i konfiguracja | Zadania złożone |
| **Podręcznik błędów** | `error-playbook.md` | Procedury odzyskiwania z eskalacją „3 strikes” | Tylko po błędzie |
| **Checklista** | `checklist.md` | Weryfikacja jakości właściwa dla domeny | Na etapie Verify |
| **Snippety** | `snippets.md` | Gotowe do skopiowania wzorce kodu | Zadania średnie/złożone |
| **Przykłady** | `examples.md` lub `examples/` | Przykłady wejścia/wyjścia few-shot dla LLM | Zadania średnie/złożone |
| **Warianty** | katalog `variants/` | Referencje właściwe dla języka/frameworka. Backend dostarcza ziarna `node`, `python` i `rust`; mobile dostarcza schemat i może otrzymać wygenerowane referencje platformowe. | Gdy istnieje pasujący stos |
| **Szablony** | `component-template.tsx`, `screen-template.dart` | Szablony plików boilerplate | Przy tworzeniu komponentu |
| **Referencja domenowa** | `orm-reference.md`, `anti-patterns.md` itd. | Pogłębiona wiedza domenowa dla konkretnych podzadań | Zależnie od typu zadania |

---

## Zasoby współdzielone (_shared/) {#shared-resources-shared}

Wszyscy agenci współdzielą podstawy z `.agents/skills/_shared/`. Są one uporządkowane w trzech kategoriach:

### Zasoby podstawowe (`.agents/skills/_shared/core/`) {#core-resources-agents-skills-shared-core}

| Zasób | Przeznaczenie | Kiedy ładowany |
|----------|---------|-------------|
| **`skill-routing.md`** | Kieruje słowa kluczowe zadań do właściwego agenta. Zawiera tabelę Skill-Agent Mapping, wzorce Complex Request Routing, reguły Inter-Agent Dependency, reguły eskalacji i Turn Limit Guide. | Referencja dla umiejętności orkiestratora i koordynacji |
| **`context-loading.md`** | Określa, które zasoby ładować dla danego typu i poziomu trudności zadania. Zawiera mapowania typ–zasób dla każdego agenta oraz wyzwalacze ładowania protokołów warunkowych. | Na początku workflowu (Step 0 / Phase 0) |
| **`prompt-structure.md`** | Definiuje cztery elementy, które musi zawierać każdy prompt zadania: Goal, Context, Constraints, Done When. Obejmuje szablony dla agentów PM, implementacji i QA. Wymienia antywzorce (zaczynanie wyłącznie od Goal). | Referencja dla agenta PM i wszystkich workflowów |
| **`clarification-protocol.md`** | Definiuje poziomy niepewności (LOW/MEDIUM/HIGH) i działania dla każdego z nich. Zawiera wyzwalacze niepewności, szablony eskalacji, wymagane elementy weryfikacji dla typów agentów oraz zachowanie trybu subagenta. | Gdy wymagania są niejednoznaczne |
| **`context-budget.md`** | Zarządzanie budżetem tokenów. Definiuje strategię czytania plików (użyj `find_symbol`, nie `read_file`), zmierzony koszt każdego pliku zasobu, koszt ładowania Simple (~4000 tokenów) i Complex (~9000 tokenów), wymuszony limit `SKILL.md` (25 000 znaków, sprawdzany przez `oma skill audit`), obsługę dużych plików i objawy przepełnienia kontekstu. | Na początku workflowu |
| **`difficulty-guide.md`** | Kryteria klasyfikacji zadań jako Simple/Medium/Complex. Definiuje oczekiwaną liczbę tur, rozgałęzienia protokołu (Fast Track / Standard / Extended) i odzyskiwanie po błędnej ocenie. | Na początku zadania (Step 0) |
| **`quality-principles.md`** | Cztery uniwersalne zasady jakości stosowane przez wszystkich agentów. | Na początku workflowów skupionych na jakości (ultrawork) |
| **`vendor-detection.md`** | Protokół wykrywania bieżącego środowiska runtime (Claude Code, Codex CLI, Antigravity, Cursor, Kiro, Qwen i fallback CLI). Używa znaczników hosta i skonfigurowanego stanu dostawcy. | Na początku workflowu |
| **`session-metrics.md`** | Punktacja Clarification Debt (CD) i śledzenie metryk sesji. Definiuje typy zdarzeń (clarify +10, correct +25, redo +40), progi (CD >= 50 = RCA, CD >= 80 = pauza) i punkty integracji. | Podczas sesji orkiestracji |
| **`common-checklist.md`** | Uniwersalna checklista jakości używana podczas końcowej weryfikacji zadań Complex (oprócz checklist agenta). | Etap Verify zadań Complex |
| **`lessons-learned.md`** | Repozytorium wniosków z poprzednich sesji, generowane automatycznie po przekroczeniu Clarification Debt i odrzuconych eksperymentach. Uporządkowane według sekcji domenowych. Obejmuje lekcje ewaluacji QA do śledzenia martwych pól ewaluatora. | Po błędach i na końcu sesji |
| **`api-contracts/`** | Katalog zawierający szablon kontraktu API i wygenerowane kontrakty. `template.md` definiuje format per endpoint (metoda, ścieżka, schematy żądania/odpowiedzi, auth, błędy). | Gdy planowana jest praca na granicy |

### Zasoby runtime (`.agents/skills/_shared/runtime/`) {#runtime-resources-agents-skills-shared-runtime}

| Zasób | Przeznaczenie |
|----------|---------|
| **`memory-protocol.md`** | Format i operacje plików pamięci dla subagentów CLI. Definiuje protokoły On Start, During Execution i On Completion z konfigurowalnymi narzędziami pamięci (read/write/edit). Obejmuje rozszerzenie śledzenia eksperymentów. |
| **`execution-protocols/claude.md`** | Wzorce wykonywania właściwe dla Claude Code. Wstrzykiwane przez `oma agent spawn`, gdy dostawcą jest claude. |
| **`execution-protocols/antigravity.md`** | Wzorce wykonywania CLI Antigravity (`agy`). |
| **`execution-protocols/codex.md`** | Wzorce wykonywania właściwe dla Codex CLI. |
| **`execution-protocols/commandcode.md`** | Wzorce wykonywania CommandCode. |
| **`execution-protocols/grok.md`** | Wzorce wykonywania Grok. |
| **`execution-protocols/kimi.md`** | Wzorce wykonywania Kimi Code. |
| **`execution-protocols/kiro.md`** | Wzorce wykonywania Kiro. |
| **`execution-protocols/opencode.md`** | Wzorce wykonywania rozszerzeń OpenCode. |
| **`execution-protocols/pi.md`** | Wzorce wykonywania rozszerzeń pi. |
| **`execution-protocols/qwen.md`** | Wzorce wykonywania właściwe dla Qwen CLI. |

Protokoły wykonywania właściwe dla dostawcy są automatycznie wstrzykiwane agentom uruchamianym przez CLI przez `oma agent spawn`. Natywni subagenci korzystają z reguł integracji wybranego dostawcy.

### Zasoby warunkowe (`.agents/skills/_shared/conditional/`) {#conditional-resources-agents-skills-shared-conditional}


| Zasób | Warunek wyzwalający | Ładowany przez | Przybliżona liczba tokenów |
|----------|-----------------|-----------|----------------|
| **`quality-score.md`** | Rozpoczyna się faza VERIFY lub SHIP w workflowie obsługującym pomiar jakości | Orchestrator (przekazuje promptowi agenta QA) | ~250 |
| **`experiment-ledger.md`** | Pierwszy eksperyment zapisano po ustanowieniu baseline'u IMPL | Orchestrator (inline, po pomiarze baseline'u) | ~250 |
| **`exploration-loop.md`** | Ta sama bramka zawiedzie dwa razy dla tego samego problemu | Orchestrator (inline, przed uruchomieniem agentów hipotez) | ~250 |

Wpływ na budżet: około 750 tokenów łącznie, jeśli załadowane są wszystkie 3. Ponieważ ładowanie jest warunkowe, typowa sesja ładuje 1–2 z nich — to niewiele wobec około 4000 tokenów, które zadanie Simple już zużywa na `SKILL.md` i `execution-protocol.md`.

---

## Jak umiejętności są routowane przez skill-routing.md {#how-skills-route-via-skill-routingmd}

Mapa routingu umiejętności określa, jak zadania są dopasowywane do agentów:

### Prosty routing (jedna domena) {#simple-routing-single-domain}

Prompt zawierający „Zbuduj formularz logowania z Tailwind CSS” dopasowuje słowa kluczowe `UI`, `component`, `form` i `Tailwind` oraz kieruje zadanie do **oma-frontend**.

### Routing złożonego żądania {#complex-request-routing}

Żądania obejmujące wiele domen stosują ustalone kolejności wykonywania:

| Wzorzec żądania | Kolejność wykonywania |
|----------------|----------------|
| „Utwórz aplikację fullstack” | oma-pm -> (oma-backend + oma-frontend) równolegle -> oma-qa |
| „Utwórz aplikację mobilną” | oma-pm -> (oma-backend + oma-mobile) równolegle -> oma-qa |
| „Napraw błąd i wykonaj przegląd” | oma-debug -> oma-qa |
| „Zaprojektuj i zbuduj stronę docelową” | oma-design -> oma-frontend |
| „Mam pomysł na funkcję” | oma-brainstorm -> oma-pm -> odpowiedni agenci -> oma-qa |
| „Zrób wszystko automatycznie” | oma-orchestration (wewnętrznie: oma-pm -> agenci -> oma-qa) |

### Reguły zależności między agentami {#inter-agent-dependency-rules}

**Można uruchamiać równolegle (bez zależności):**
- oma-backend + oma-frontend (gdy kontrakt API jest zdefiniowany wcześniej)
- oma-backend + oma-mobile (gdy kontrakt API jest zdefiniowany wcześniej)
- oma-frontend + oma-mobile (niezależnie od siebie)

**Muszą działać sekwencyjnie:**
- oma-brainstorm -> oma-pm (design przed planowaniem)
- oma-pm -> wszyscy pozostali agenci (najpierw planowanie)
- agent implementacji -> oma-qa (review po implementacji)
- oma-backend -> oma-frontend/oma-mobile (gdy nie ma wcześniej zdefiniowanego kontraktu API)

**QA jest zawsze ostatni**, z wyjątkiem sytuacji, gdy użytkownik prosi o przegląd tylko określonych plików.

---

## Matematyka oszczędności tokenów {#token-savings-math}

Te liczby zmierzono na podstawie drzewa umiejętności, a nie oszacowano ręcznie. Odtwórz je w dowolnym momencie:

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

Liczby tokenów są **przybliżeniami** (bajty ÷ 4, przybliżony współczynnik dla angielskiego Markdownu). Tabele i bloki kodu tokenizują się nieco gorzej, więc te wartości są lekko zaniżone; jeśli potrzebujesz dokładnych liczb, użyj prawdziwego tokenizera dla docelowego modelu.

### Poziomy ładowania {#loading-tiers}

Każdy poziom to stan, do którego agent faktycznie dochodzi, według [`context-loading.md`](https://github.com/first-fluke/oh-my-agent/blob/main/.agents/skills/_shared/core/context-loading.md):

| Poziom | Co znajduje się w kontekście |
|------|--------------------|
| `routed` | Sam `SKILL.md` |
| `simple` | + `execution-protocol.md` |
| `medium` | + zmapowany zasób dla zadania, gdy taki plik istnieje |
| `complex` | + zmapowany zasób i referencje stosu, gdy projekt je udostępnia |
| `all` | `SKILL.md` + każdy plik zasobu — **limit**, a nie wybieralny tryb |

Dla umiejętności backend i mobile `/stack-set` może wygenerować referencje właściwe dla projektu w katalogu `stack/`. Świeży checkout nie ma wygenerowanego katalogu stack, więc wiersz `complex` jest mierzony względem dostarczonych ziaren `variants/`, z których generowanie się adaptuje — to przybliżenie rozmiaru, a nie plik ładowany już przez agenta.

### Sesja pięciu agentów (pm, backend, frontend, mobile, qa) {#a-5-agent-session-pm-backend-frontend-mobile-qa}

| Poziom | Tokeny | Udział limitu | Uniknięto |
|------|-------:|-----------------:|--------:|
| `routed` | 11,497 | 15.7% | 84.3% |
| `simple` | 17,923 | 24.4% | 75.6% |
| `medium` | 19,125 | 26.1% | 73.9% |
| `complex` | 39,156 | 53.4% | 46.6% |
| `all` | 73,355 | 100% | — |

Zatem zadanie Simple lub Medium obejmujące pięciu agentów mieści około **17–19 tys. tokenów** kontekstu zamiast limitu 73 tys., a zadanie Complex około **38 tys.** — oszczędność wynosi około 74–76% dla zwykłej pracy i spada do około 47%, gdy zadanie pobiera referencje stosu. W modelu z kontekstem 128 tys. daje to około 110 tys. wolnego miejsca dla pracy Simple/Medium i 90 tys. dla Complex.

:::note Traktuj `all` jako granicę, nie alternatywę
Żaden runtime nie ładuje z góry każdego zasobu: umiejętności są ujawniane przez `description`, ich treść jest odczytywana po routingu, a zasoby są odczytywane zgodnie z potrzebą zadania. `all` jest górną granicą kosztu, jaki *może* ponieść umiejętność, dlatego podane procenty oznaczają „uniknięto”, a nie porównanie z rzeczywistą konfiguracją.
:::

Warstwa 1 jest dolną granicą i nie jest mała: wśród 33 zainstalowanych umiejętności `SKILL.md` zajmuje około 1275–5489 tokenów (mediana ~2631). Ta granica ogranicza oszczędności progresywnego ujawniania — gdy skierowanych jest wszystkich pięciu agentów, sam poziom `routed` stanowi już 15% limitu.

---

## Ładowanie zasobów według trudności zadania {#resource-loading-by-task-difficulty}

Przewodnik trudności klasyfikuje zadania na trzy poziomy, które określają, jak dużo warstwy 2 zostanie załadowane:

### Simple (oczekiwane 3–5 tur) {#simple-3-5-turns-expected}

Zmiana jednego pliku, jasne wymagania, powtarzanie istniejących wzorców.

Ładowane: tylko `execution-protocol.md`. Pomiń analizę, przejdź bezpośrednio do implementacji z minimalną checklistą.

### Medium (oczekiwane 8–15 tur) {#medium-8-15-turns-expected}

Zmiany w 2–3 plikach, potrzebne są pewne decyzje projektowe, zastosowanie wzorców w nowych domenach.

Ładowane: `execution-protocol.md` oraz zmapowany zasób Medium, jeśli taki plik istnieje. Standardowy protokół z krótką analizą i pełną weryfikacją.

### Complex (oczekiwane 15–25 tur) {#complex-15-25-turns-expected}

Zmiany w co najmniej 4 plikach, wymagane decyzje architektoniczne, wprowadzanie nowych wzorców, zależności od innych agentów.

Ładowane: `execution-protocol.md`, zmapowany zasób oraz dostępne referencje `tech-stack.md` / `snippets.md`. Protokół rozszerzony z punktami kontrolnymi, zapisem postępu w trakcie wykonywania i pełną weryfikacją obejmującą `common-checklist.md`.

---

## Mapy ładowania kontekstu (per agent) {#context-loading-task-maps-per-agent}

Przewodnik ładowania kontekstu dostarcza szczegółowych map typ–zasób dla zadania. Poniżej najważniejsze mapowania:

### Agent backendu {#backend-agent}

| Typ zadania | Wymagane zasoby |
|-----------|-------------------|
| Tworzenie API CRUD | pasujące `variants/{node,python,rust}/snippets.md`, gdy istnieje |
| Uwierzytelnianie | `snippets.md` z pasującego wariantu + `tech-stack.md`, gdy istnieją |
| Migracja bazy danych | `snippets.md` z pasującego wariantu, gdy istnieje |
| Optymalizacja wydajności | `orm-reference.md` i pasujące przykłady dostarczone przez umiejętność |
| Modyfikacja istniejącego kodu | dostawca inteligencji kodu projektu i właściwe zasoby wykonywania |

### Agent frontendu {#frontend-agent}

| Typ zadania | Wymagane zasoby |
|-----------|-------------------|
| Tworzenie komponentu | snippets.md + istniejące wzorce komponentów projektu |
| Implementacja formularza | snippets.md (formularz + Zod) |
| Integracja API | snippets.md (TanStack Query) |
| Stylowanie | tailwind-rules.md |
| Układ strony | snippets.md (grid) |

### Agent designu {#design-agent}

| Typ zadania | Wymagane zasoby |
|-----------|-------------------|
| Tworzenie systemu designu | reference/typography.md + reference/color-and-contrast.md + reference/spatial-design.md + design-md-spec.md |
| Projektowanie landing page | reference/component-patterns.md + reference/motion-design.md + prompt-enhancement.md |
| Audyt designu | checklist.md + anti-patterns.md |
| Eksport tokenów designu | design-tokens.md |
| Efekty 3D / shader | reference/shader-and-3d.md + reference/motion-design.md |
| Przegląd dostępności | reference/accessibility.md + checklist.md |

### Agent QA {#qa-agent}

| Typ zadania | Wymagane zasoby |
|-----------|-------------------|
| Przegląd bezpieczeństwa | checklist.md (sekcja Security) |
| Przegląd wydajności | checklist.md (sekcja Performance) |
| Przegląd dostępności | checklist.md (sekcja Accessibility) |
| Pełny audyt | checklist.md (całość) + self-check.md |
| Punktacja jakości | quality-score.md (warunkowe) |


---

## Kompozycja promptu orkiestratora {#orchestrator-prompt-composition}

Podczas komponowania promptów dla subagentów orkiestrator dołącza tylko zasoby istotne dla zadania:

1. sekcję Core Rules z SKILL.md agenta
2. `execution-protocol.md`
3. zasoby dopasowane do konkretnego typu zadania (z powyższych map)
4. `error-playbook.md` (zawsze dołączany; odzyskiwanie jest niezbędne)
5. Memory Protocol (tryb CLI)

Taka ukierunkowana kompozycja unika ładowania niepotrzebnych zasobów i maksymalizuje miejsce subagenta na właściwą pracę.

---

## Clarification Debt i metryki sesji (pogłębienie) {#clarification-debt-session-metrics-deep-dive}

Clarification Debt (CD) mierzy koszt niejasnych wymagań podczas sesji. Orkiestrator śledzi każdą korektę użytkownika i przyznaje punkty:

| Typ zdarzenia | Punkty | Opis |
|------------|--------|-------------|
| `clarify` | +10 | Proste pytanie doprecyzowujące (oczekiwane przy niepewności MEDIUM) |
| `correct` | +25 | Niezrozumienie intencji wymagające zmiany kierunku |
| `redo` | +40 | Naruszenie zakresu/charteru wymagające wycofania i ponownego uruchomienia |
| `blocked` | +0 | Agent poprawnie zatrzymany i pytający (dobre zachowanie, bez kary) |

**Modyfikatory:** nieprzeczytany charter (+15), naruszenie allowlisty (+20), powtórzenie tego samego błędu (×1,5).

**Progi i egzekwowanie:**
- **CD >= 50** → obowiązkowy wpis RCA dodany do `lessons-learned.md`
- **CD >= 80** → sesja zatrzymana, użytkownik musi ponownie określić wymagania
- **`redo` >= 2** → orkiestrator wstrzymuje pracę i prosi o jawne potwierdzenie zakresu
- **CD >= 30 przez 3 kolejne sesje dla tego samego agenta** → przegląd szablonu promptu agenta

Dziennik sesji jest utrzymywany w `.agents/state/memories/session-metrics.md` z wierszami per zdarzenie (tura, agent, typ zdarzenia, punkty, szczegóły) i sekcją podsumowania.

---

## Dokładność ewaluatora i strojenie QA {#evaluator-accuracy-qa-tuning}

Agenci QA poprawiają się dzięki śledzeniu błędów osądu. W odróżnieniu od CD w czasie rzeczywistym, Evaluator Accuracy (EA) jest retrospektywne. Większość błędów zostaje odkryta po zakończeniu sesji.

**Typy zdarzeń EA:**

| Zdarzenie | Punkty | Kiedy odkryte |
|-------|--------|-----------------|
| `false_negative` | +30 | Następna sesja lub produkcja (błąd pominięty przez QA) |
| `false_positive` | +15 | Podczas sesji (agent implementacji skutecznie kwestionuje ustalenie QA) |
| `severity_mismatch` | +10 | Podczas sesji lub weryfikacji kolejnej sesji (nadano niewłaściwą istotność) |
| `missed_stub` | +20 | Weryfikacja runtime wykrywa funkcję tylko do wyświetlania |
| `good_catch` | -10 | QA wykrył nieoczywisty błąd (pozytywny sygnał nagrody) |

**EA jest obliczane w ruchomym oknie 3 sesji.** Progi:
- **EA >= 30** → sugerowane strojenie: przejrzyj zgromadzone zdarzenia EA pod kątem powtarzających się błędów osądu QA
- **EA >= 50** → wymagane strojenie: zaktualizuj execution-protocol.md QA
- **`false_negative` >= 3** w oknie → dodaj wzorzec wykrywania do checklist.md QA
- **`good_catch` >= 5** w oknie → uogólnij udany wzorzec w `common-checklist.md`

Po przekroczeniu progu przejrzyj zgromadzone zdarzenia EA, skategoryzuj błędy, odpowiednio popraw checklistę/protokół wykonywania QA i sprawdź wynik w kolejnych 3 sesjach.

---

## Dekompozycja sprintu dla złożonych zadań {#sprint-decomposition-for-complex-tasks}

Złożone zadania (co najmniej 4 pliki, decyzje architektoniczne) korzystają z wykonywania opartego na sprintach, a nie z jednego długiego przebiegu:

1. **Dekomponuj** na 2–4 sprinty skupione na funkcjach, z których każdy można niezależnie przetestować
2. **Celuj** w 5–8 tur na sprint
3. **Bramka sprintu** po każdym sprincie:
   - Czy rezultat sprintu jest ukończony?
   - Czy lint/test przechodzi?
   - Jeśli sprint zajął dwa razy więcej tur niż oczekiwano → zapisz checkpoint i poinformuj użytkownika
4. **Kontynuuj** następny sprint po przejściu bramki

**Przykład:** zadanie „JWT auth + CRUD API + tests” dzieli się na:
- Sprint 1: model użytkownika + endpointy auth (register/login)
- Sprint 2: endpointy CRUD + walidacja
- Sprint 3: testy + obsługa błędów

**Odzyskiwanie po błędnej ocenie trudności:** Jeśli zadanie zaczęło się jako Simple, ale okazało się bardziej złożone, agent przechodzi w połowie wykonywania na protokół Medium lub Complex i zapisuje tę zmianę w postępie.

---

## Protokół resetu kontekstu {#context-reset-protocol}

Długotrwałe agenty tracą jakość, gdy kontekst się zapełnia. Orchestrator (a nie sam agent) obserwuje ten stan i uruchamia resety.

**Warunki wyzwalające (orkiestrator sprawdza podczas monitorowania):**

| Warunek | Wykrywanie | Działanie |
|-----------|-----------|--------|
| Wyczerpanie budżetu tur | Agent zużył >= 80% oczekiwanych tur ORAZ kryteria akceptacji są ukończone w mniej niż 50% | Reset kontekstu |
| Zastój postępu | Brak aktualizacji pliku postępu przez co najmniej 3 kolejne cykle monitorowania | Reset kontekstu |
| Płytki wynik | Plik wyniku zawiera znaczniki stubów lub placeholdery TODO | Uruchom ponownie z jawną instrukcją |

**Procedura resetu:**
1. **Checkpoint**: zapisz bieżący stan agenta (ukończone elementy, pozostałe elementy, kluczowe decyzje)
2. **Zakończ**: zatrzymaj bieżące uruchomienie agenta
3. **Uruchom ponownie**: rozpocznij świeżego agenta z checkpointem w kontekście
4. **Wznów**: nowy agent odczytuje checkpoint i kontynuuje tylko pozostałe elementy

W przypadku agentów samodzielnych (bez orkiestratora) bramka sprintu w `difficulty-guide.md` pełni rolę zabezpieczenia. Jeśli sprint zajmie dwa razy więcej tur niż oczekiwano, agent zapisuje checkpoint i informuje użytkownika.
