---
title: "Ewaluacja harnessu"
sidebar_label: Ewaluacja harnessu
description: Oceniaj kompletną nakładkę harnessu OMA za pomocą sparowanych, izolowanych zadań repozytorium i deterministycznych kontroli artefaktów.
---

# Ewaluacja harnessu

`oma harness eval` mierzy, czy kandydat na harness OMA poprawia działanie ustalonego agenta bez zmiany jego modelu. Polecenie adaptuje wzorzec ewaluacji w czasie testu z pracy [AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses](https://arxiv.org/abs/2608.12307): pozostaw model docelowy bez zmian, zmień harness i porównaj wyniki dla tych samych zadań.

To polecenie ocenia większą jednostkę niż `oma skill eval`:

| Polecenie | Badany wariant | Cel wyniku |
|:--------|:----------|:-------------|
| `oma skill eval` | Jedno ciało `SKILL.md` | Wynik agenta |
| `oma harness eval` | Ograniczona nakładka `.agents/` | Pliki i wynik utworzone w workspace repozytorium |

Użyj ewaluacji umiejętności, aby odpowiedzieć na pytanie „czy ta umiejętność pomaga?”. Użyj ewaluacji harnessu, aby sprawdzić, czy ta kombinacja umiejętności, workflowów, reguł i instrukcji agenta sprawia, że ustalony agent bardziej niezawodnie kończy zadania repozytorium.

## Model ewaluacji

Każde zadanie działa jako sparowany eksperyment:

1. OMA kopiuje fixture zadania do nowego workspace’u bazowego.
2. OMA kopiuje bieżące definicje `agents`, `config`, `rules`, `skills` i `workflows` do tego workspace’u i projektuje je na wybrany format dostawcy.
3. OMA powtarza konfigurację w drugim nowym workspace’ie i stosuje tam nakładkę kandydata.
4. W obu wariantach używane są ten sam agent główny, trasa dostawcy, prompt, uprawnienia zapisu i limit czasu.
5. Deterministyczne kontrole sprawdzają wynikowy workspace oraz opcjonalny wynik agenta.

Rzeczywisty projekt nigdy nie jest katalogiem roboczym wariantu. Tymczasowe workspace’y wariantów są usuwane po obliczeniu wyniku; własny sandbox procesu wybranego dostawcy pozostaje źródłem prawdy dla dostępu poza tym katalogiem roboczym.

## Układ kandydata

Ścieżka kandydata to katalog zawierający częściowe drzewo `.agents/`:

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

Akceptowane są tylko pliki poniżej `.agents/agents`, `.agents/rules`, `.agents/skills` i `.agents/workflows`. Hooki, fixture’y ewaluatora, stan, wyniki, pliki konfiguracji, dowiązania symboliczne i warianty agentów dostawcy są odrzucane. Chronione pola frontmatter agenta, takie jak `model`, `tools`, `effort` i limity wykonania, muszą pasować do bazowych. Wariant również kończy się niepowodzeniem, jeśli uruchomiony agent zmodyfikuje chronione definicje `.agents/` przed obliczeniem wyniku.

## Format zestawu

Zestaw to jeden plik YAML oraz jeden katalog fixture’ów na zadanie:

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

ID zadań muszą być unikatowe. Ścieżki fixture’ów i kontroli muszą pozostać wewnątrz projektu i workspace’u zadania. Fixture’y nie mogą zawierać dowiązań symbolicznych ani powierzchni sterowania harnessu agenta, takich jak `.agents`, `.codex`, `.claude`, katalogi umiejętności dostawców lub główne pliki instrukcji agenta. Zapobiega to zasłonięciu kontrolowanego harnessu któregokolwiek wariantu przez dane zadania.

Generowane katalogi zależności, takie jak `node_modules` i `.venv`, nie są kopiowane z bazowego harnessu. Zapisz deterministyczne źródło pomocnicze i manifesty zależności w umiejętności; zależności runtime’u dostarcz w fixture zadania, gdy wymaga ich kontrola.

### Typy kontroli

| Typ | Pola | Warunek przejścia |
|:-----|:-------|:---------------|
| `file_exists` | `path` | Ścieżka istnieje po zakończeniu wariantu. |
| `file_not_exists` | `path` | Ścieżka nie istnieje. |
| `file_contains` | `path`, `value` | Plik istnieje i zawiera wartość. |
| `file_not_contains` | `path`, `value` | Plik istnieje i nie zawiera wartości. |
| `output_contains` | `value` | Przechwycony wynik agenta zawiera wartość. |
| `output_not_contains` | `value` | Przechwycony wynik agenta nie zawiera wartości. |

Kontrole artefaktów są celowo deterministyczne. Pierwsza wersja nie uruchamia zmiennych skryptów pakietów jako sędziów, ponieważ oceniany agent mógłby zmienić te skrypty albo ich testy i unieważnić ewaluator.

## Uruchomienie i zapis

Tryb live wykonuje dwa dispatch’e na zadanie, wyświetla podgląd kosztu i wymaga potwierdzenia:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --live --record
```

Po udanym uruchomieniu raport zawiera sparowane wyniki bazowe i kandydata, przyrost, liczbę regresji oraz decyzję, na przykład `pass` albo `insufficient`. Jeśli zmienisz zestaw, definicje bazowe, nakładkę kandydata, prompty, fixture’y lub kontrole, zapisz nowe uruchomienie live; stary plik `_runs` zostanie odrzucony na podstawie skrótu.

Użyj `--yes` do wykonania bez interakcji i `--timeout-minutes`, aby ustawić identyczny limit czasu zegarowego dla obu wariantów. Wykonanie live jest dostępne tylko wtedy, gdy wybrany dostawca wyszukuje pliki harnessu względem workspace’u projektu. OMA odmawia wyszukiwania względem HOME, ponieważ wariant bazowy mógłby zobaczyć globalnie zainstalowaną treść kandydata.

`--record` zapisuje adresowany skrótem rekord JSON poniżej `_runs/`, obok zestawu. Rekord wiąże wyniki z trzema wejściami:

- zestawem, promptami, kontrolami i zawartością fixture’ów;
- bieżącymi definicjami bazowego harnessu;
- zawartością nakładki kandydata.

Tryb mock jest domyślny i nie wykonuje wywołań modeli. Odtwarza rekord tylko wtedy, gdy wszystkie trzy skróty nadal pasują:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --mock --require-coverage
```

## Metryki i bramka decyzji

Każde zadanie przechodzi tylko wtedy, gdy przejdą wszystkie kontrole. Wyniki są średnimi ważonymi po sparowanych zadaniach:

```text
lift = candidateScore - baselineScore
```

OMA raportuje też:

- zadania naprawione: bazowe nie przeszło, a kandydat przeszedł;
- zadania z regresją: bazowe przeszło, a kandydat nie przeszedł;
- pokrycie: wymaganych jest co najmniej pięć sparowanych zadań, dla których można obliczyć wynik.

Kandydat przechodzi, gdy przyrost wynosi co najmniej 5 punktów procentowych i nie ma regresji. Każda regresja kończy się niepowodzeniem kandydata. Nieujemny przyrost poniżej 5 punktów generuje ostrzeżenie, a mniej niż pięć sparowanych zadań daje decyzję `insufficient`. Dodaj `--require-coverage`, aby w CI niewystarczające pokrycie kończyło się niezerowym kodem wyjścia. Wynik nie jest dowodem, gdy brakuje wariantu, skrót rekordu jest nieaktualny albo deterministyczna kontrola jest niekompletna.

## Obecna granica

To fundament ewaluacji, a nie automatyczna optymalizacja harnessu. Builder może zewnętrznie utworzyć nakładki kandydatów, a następnie użyć tego polecenia jako bramki akceptacji. Oddzielny ukryty zestaw testu końcowego, powtarzane próby stochastyczne, zaufane zewnętrzne runnery testów, rozliczanie tokenów, wymuszanie przypięcia modelu dla zagnieżdżonych wywołań subagentów i automatyczna pętla `harness opt` nie należą do bieżącego polecenia. Dopóki nie istnieje przypinanie zagnieżdżonych wywołań, zestawy mierzące jeden ustalony model powinny unikać workflowów kandydata, które uruchamiają inne skonfigurowane role agentów.
