---
title: "Ewaluacja użyteczności umiejętności"
sidebar_label: Ewaluacja umiejętności
description: Jak pisać fixture’y zadań ewaluacyjnych dla oma skill eval, konwencję katalogu .agents/eval/, typy checkerów oraz tryby wykonania mock/live.
---

# Ewaluacja użyteczności umiejętności

`oma skill eval` mierzy, czy załadowanie umiejętności rzeczywiście poprawia wyniki zadań agenta. Odpowiada na inne pytanie niż `oma skill audit` (które pyta „czy dwie umiejętności są redundantne?”): pyta „czy ta umiejętność pomaga?”.

Projekt opiera się na dwóch wynikach badań: WikiSkill (arXiv:2608.27454) rozdziela surowe doświadczenie, trwałą wiedzę i wykonywalne umiejętności, zachowując bramki holdout dla ewolucji; SkillLens (arXiv:2605.23899) pokazuje, że użyteczność umiejętności jest niezależna od odrębności opisu — odrębna umiejętność może być bezużyteczna, a nakładająca się umiejętność może nadal pomagać.

---

## Jak to działa

Dla każdego fixture’a zadania polecenie uruchamia dwa warianty:

1. **Wariant bazowy** — prompt zadania jest wysyłany do agenta bez udostępnionej umiejętności.
2. **Wariant badany** — `SKILL.md` jest dodawany na początku promptu, a następnie wysyłane jest to samo zadanie.

Każdy wariant jest oceniany przez checker zadania (0 = porażka, 1 = sukces). Główna metryka to:

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

Umiejętność przechodzi, gdy `utilityLift ≥ 5%`. Poniżej tego progu pojawia się ostrzeżenie (marginalny przyrost) albo porażka (brak przyrostu). Do wydania werdyktu wymaganych jest co najmniej 5 zadań z możliwym wynikiem.

---

## Konwencja `.agents/eval/<skill>/`

Umieść fixture’y zadań w `.agents/eval/<skill>/`. Ta ścieżka znajduje się wewnątrz `.agents/`, ale poza samym katalogiem umiejętności, więc przetrwa `oma update` bez nadpisania ewaluacji napisanych przez użytkownika.

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

Pliki zaczynające się od `_` są pomijane podczas ładowania fixture’ów zadań. Podkatalog `_rollouts/` przechowuje zapisane wyniki wariantów z wcześniejszych uruchomień `--live --record`.

---

## Schemat fixture’a zadania

Każdy fixture jest plikiem YAML z następującymi polami:

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

| Pole | Wymagane | Opis |
|:------|:---------|:-----------|
| `id` | Tak | Unikatowy identyfikator zadania (używany w nazwach plików rolloutów i raportach) |
| `skill` | Tak | Oceniana umiejętność (pasuje do nazwy katalogu nadrzędnego) |
| `domain` | Tak | Etykieta domeny (używana do grupowania i przyszłego wykrywania negative transfer) |
| `prompt` | Tak | Prompt zadania wysyłany do obu wariantów |
| `checker` | Nie | Sposób oceniania wyniku wariantu. Gdy pominięty, domyślnie `{ type: judge }`. |
| `weight` | Tak | Względna waga ważonego średniego wyniku (użyj `1`, chyba że zadania mają różne znaczenie) |

### Typy checkerów

#### judge (domyślny)

LLM ocenia wynik wariantu według rubryki i zwraca PASS albo FAIL. To wartość domyślna, gdy `checker` jest pominięty albo gdy brakuje `checker.type`.

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

Pole `rubric` jest opcjonalne; gdy je pominięto, używana jest domyślna rubryka: „Czy odpowiedź poprawnie i kompletnie spełnia prompt zadania?”.

Dla zwięzłości rubrykę można też zapisać na poziomie głównym:

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**Ważne:** W trybie `--mock` zadania typu judge wymagają wcześniej zapisanego werdyktu w `_rollouts/`. Jeśli dla zadania nie istnieje zapisany werdykt, zadanie zostaje wyłączone z raportu z ostrzeżeniem. Najpierw uruchom `--live --record`, aby wypełnić rollouty.

To samo dotyczy każdego typu checkera, gdy brakuje całego wariantu: zadanie jest wyłączane, a nie oceniane jako 0. Brak danych nie jest nieudaną odpowiedzią — ocenienie go ustawiłoby oba warianty na 0, a zerowy przyrost odczytano by jako `decision: "fail"`. Wyłączenia, które obniżą liczbę ocenionych zadań poniżej `MIN_TASKS`, ujawniają się jako `coverage: "insufficient"`.

#### assert (opcjonalny)

Deterministyczne sprawdzenie podciągu. Używaj do weryfikacji kontraktu, formatu albo wywołania narzędzia, gdy oczekiwany wynik jest dokładny.

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

Checker przechodzi, gdy każdy string z `expect_contains` występuje w wyniku wariantu.

#### regex (opcjonalny)

Deterministyczne dopasowanie regexu. Używaj, gdy potrzebny jest wzorzec, a nie dokładny string.

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

Wzorce dłuższe niż 200 znaków otrzymują 0 (ograniczenie zapobiegające ReDoS). Przed dopasowaniem wynik jest obcinany do 10 000 znaków.

---

## Tryby wykonania

### --mock (domyślny)

Odtwarza zapisane rollouty z `_rollouts/`. Jest w pełni deterministyczny i działa offline — żaden LLM nie jest wywoływany.

- Dla checkerów `assert`/`regex`: wyniki są obliczane na podstawie zapisanych stringów wyników.
- Dla checkerów `judge`: odtwarzane jest pole `score` zapisane przez `--live --record`.

Jeśli zadanie judge nie ma zapisanego wyniku w `_rollouts/`, zostaje wyłączone z raportu (z ostrzeżeniem w konsoli). Dzięki temu tryb mock pozostaje całkowicie offline.

Przed użyciem sprawdzana jest też nieaktualność nagrań. Odrzucane są wpis wariantu badanego zapisany dla innego ciała SKILL.md, wpis ze zmienionym `prompt` fixture’a oraz każdy wpis sprzed wprowadzenia śledzenia pochodzenia, a ostrzeżenie podaje nazwę pliku i liczbę. Gdy pozostanie mniej niż `MIN_TASKS` zadań z wynikiem, uruchomienie zgłasza `coverage: "insufficient"` zamiast werdyktu — zmieniona umiejętność nigdy nie dziedziczy poprzedniego wyniku.

:::note `oma skill optimize --mock`
Optymalizator ocenia kandydackie ciała SKILL.md. Ponieważ nagranie jest ważne tylko dla ciała, z którego powstało, ciała kandydatów nie mają pasujących rolloutów i są zgłaszane jako niepokryte. Użyj `--live`, aby ocenić kandydatów.
:::

Bezpieczne dla CI. Ustaw `OMA_SKILLEVAL_MOCK=1`, aby wymusić ten tryb.

```bash
oma skill eval --skill oma-scholar
```

### --live

Uruchamia rzeczywiste warianty agentów przez `oma agent spawn --read-only`. Oba warianty działają w tymczasowym workspace’ie, aby uniemożliwić modyfikację plików projektu.

Przed dispatch’em polecenie wyświetla podgląd kosztu z liczbą zadań, dispatchów wariantów, dispatchów sędziów i rozstrzygniętym dostawcą. Potwierdź przez `y` albo pomiń pytanie, używając `--yes`.

Pozostałe opcje są przydatne w CI i przy analizie pokrycia:

| Opcja | Skutek |
| --- | --- |
| `--task-dir <path>` | Oceniaj fixture’y z katalogu innego niż `.agents/eval/<skill>`. |
| `--max-tasks <n>` | Ogranicz liczbę fixture’ów w ograniczonym uruchomieniu live. |
| `--neg-transfer` | Próbkuj sąsiadów z tej samej domeny w poszukiwaniu negative transfer; domyślnie wyłączone. |
| `--require-coverage` | Zakończ kodem niezerowym, gdy pozostanie mniej niż pięć ocenionych sparowanych zadań. |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### Izolacja umiejętności (uczciwa baza) {#skill-isolation-keeping-the-baseline-honest}

`utilityLift` ma znaczenie tylko wtedy, gdy **wariant bazowy działa bez docelowej umiejętności**. Problem polega na tym, że wysłany
agent automatycznie ładuje każdą umiejętność zainstalowaną w swoim runtime’ie, więc naiwny wariant bazowy nadal pobrałby umiejętność, która miała być mierzona
*bez* niej — zanieczyszczając porównanie (baseline ≈ treatment, lift ≈ 0).

Aby temu zapobiec, `--live` uruchamia **oba warianty w izolowanym, tymczasowym workspace’ie**, którego katalog umiejętności zawiera
każdą zainstalowaną umiejętność **oprócz docelowej**. Wariant badany dodaje docelową umiejętność **wyłącznie** przez wstrzyknięte
`SKILL.md` (dodane na początku promptu). Wstrzyknięcie jest więc jedyną kontrolowaną zmienną: baseline = bez
umiejętności, treatment = kandydacki `SKILL.md`.

Działa to, ponieważ większość dostawców odkrywa umiejętności **względem katalogu roboczego** (np.
`<cwd>/.claude/skills`, `<cwd>/.codex/skills`) — czysty katalog roboczy rzeczywiście ukrywa umiejętność. Raport
podaje skuteczność izolacji w polu `isolation`:

| Stan | Znaczenie |
|---|---|
| `enforced` | Dostawca względny względem cwd, docelowa umiejętność nieobecna w ścieżce HOME — pełna izolacja. |
| `best-effort` | Dostawca względny względem cwd, ale kopia umiejętności istnieje też w HOME (albo dostawca jest nieznany); kopia projektu jest ukryta, lecz kopia HOME może się przedostać. Niska pewność. |
| `unavailable` | Dostawca oparty na HOME (np. **antigravity**, który odczytuje `~/.gemini/antigravity-cli/skills`); czysty cwd nie może go ukryć. Wypisywane jest ostrzeżenie, a wynik ma niską pewność. |
| n/a | Tryb mock — brak dispatchu live. |

Gdy izolacja nie ma stanu `enforced`, wypisywane jest jednolinijkowe ostrzeżenie i wynik należy traktować jako
obarczony niską pewnością. Aby uzyskać czysty sygnał, uruchom ewaluację z dostawcą **względnym względem cwd i możliwym do izolowania** (claude / codex /
qwen), zamiast dostawcy opartego na HOME — dostawca ewaluacji podąża za `model_preset` w `.agents/oma-config.yaml`, więc
wybierz preset, którego domyślny dostawca działa względem cwd.

### --live --record

Uruchamia warianty live i zapisuje przechwycone wyniki (w tym werdykty sędziów dla zadań typu judge-checker) w `_rollouts/<hash>.json`. Nazwa pliku jest deterministycznym skrótem SHA-256 zbioru ID zadań — nie zależy od daty ani losowania.

Użyj tego, aby zasilić uruchomienia `--mock` na własnym komputerze i zachować offline przy kolejnych powtórzeniach.

Każdy wpis zawiera pochodzenie, dzięki czemu późniejsze odtworzenie może sprawdzić, czy nadal obowiązuje:

| Pole | Zapisywane dla | Porównywane z |
|---|---|---|
| `skillBodyHash` | tylko `treatment` | treść SKILL.md poddawana ewaluacji |
| `promptHash` | oba warianty | bieżący `prompt` fixture’a |

Wariant bazowy ukrywa umiejętność, więc edycja SKILL.md go nie unieważnia —
ponownie nagrywany jest tylko wariant badany.

:::caution `_rollouts/` jest tylko lokalne — nie commituj go
Nagranie odtwarza się tylko dla dokładnego ciała SKILL.md, z którego powstało. Po edycji
umiejętności jej nagrania wariantu badanego są odrzucane przy następnym uruchomieniu `--mock`, więc
zapisane nagranie stanie się nieaktualne po kolejnej zmianie SKILL.md i zacznie ostrzegać
wszystkich, którzy je pobiorą. Katalog jest ignorowany przez Git; nagrywaj lokalnie.
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

Po udanym uruchomieniu live raport zawiera liczbę wyników bazowych i badanych, `utilityLift`, `coverage: "ok"`, stan izolacji oraz decyzję pass/warn/fail. Późniejsze uruchomienie mock używa ponownie tylko nagrań, których prompty zadań i ciało umiejętności wariantu badanego nadal pasują.

---

## Minimalny działający zestaw fixture’ów

Do wydania werdyktu wymaganych jest pięć fixture’ów (`MIN_TASKS = 5`). Oto minimalny zestaw dla wymyślonej umiejętności `oma-scholar`:

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

Powtórz dla co najmniej trzech kolejnych zadań. Następnie uruchom:

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```

---

## Odczytywanie raportu

**Wynik tekstowy:**

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

**Wynik JSON** (przez `--json`):

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

`ok` ma wartość `true` tylko wtedy, gdy `coverage === "ok"` i `decision === "pass"`. Pole `isolation` informuje, czy
wariant bazowy rzeczywiście działał bez docelowej umiejętności (zobacz [Izolacja umiejętności](#skill-isolation-keeping-the-baseline-honest));
`isolation` ma wartość `"n/a"` w trybie `--mock`.

---

## Integracja z CI

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

Kody wyjścia:
- `0` — przejście albo ostrzeżenie
- `1` — porażka albo niewystarczające pokrycie z `--require-coverage`

---

## Wybór trybu live albo mock

Używaj `--live` z checkerami judge, aby mierzyć rzeczywistą użyteczność na otwartych zadaniach. Używaj `--mock`, aby offline odtwarzać wcześniej zapisane werdykty sędziów albo wykonywać deterministyczne kontrole kontraktu `assert`/`regex`.

Deterministyczność mock zachowuje się przez zapisanie binarnego werdyktu sędziego (PASS/FAIL) we wpisie rolloutu podczas `--live --record`, a następnie odtworzenie zapisanego wyniku w kolejnych uruchomieniach `--mock` — bez ponownego wywoływania LLM.

**Eksport danych:** podczas `--live` sędzia przekazuje wynik wariantu kandydata skonfigurowanemu dostawcy do oceny. Na początku każdego uruchomienia live wypisywane jest jednorazowe ostrzeżenie.

Jeśli uruchomienie mock zgłosi niewystarczające pokrycie, sprawdź ostrzeżenie pod kątem odrzuconych albo brakujących wpisów `_rollouts`, a następnie po poprawieniu fixture’a lub umiejętności wykonaj nagranie live. Jeśli izolacja ma stan `best-effort` albo `unavailable`, wybierz dostawcę działającego względem cwd, takiego jak Claude, Codex albo Qwen, zanim uznasz przyrost za silny sygnał.

---

## Dostarczanie zadań ewaluacyjnych z umiejętnością

Umiejętności mogą zawierać zestaw zadań ewaluacyjnych przez umieszczenie fixture’ów w `.agents/eval/<skill>/`. Są to pliki napisane przez użytkownika poza katalogiem umiejętności, więc przetrwają `oma update`. Przy tworzeniu nowej umiejętności za pomocą `oma-skill-creation` dodaj pasujący zestaw fixture’ów `eval/`, aby przyszli autorzy mogli sprawdzać wpływ umiejętności. Workflow authoringu umiejętności opisano w `.agents/skills/oma-skill-creation/SKILL.md`.
