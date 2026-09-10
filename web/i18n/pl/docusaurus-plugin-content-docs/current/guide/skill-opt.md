---
title: "Optymalizacja umiejętności"
sidebar_label: Optymalizacja umiejętności
description: Jak używać oma skill optimize do trwałego rozwoju umiejętności opartego na dowodach, z deterministycznymi bramkami zbiorów train, validation i holdout należących do runnera.
---

# Optymalizacja umiejętności

`oma skill optimize` rozwija `SKILL.md`, aby zmaksymalizować zmierzone `utilityLift` uzyskane przez `oma skill eval`. Rozdziela surowe dowody rolloutów, trwałą wiedzę o ograniczonym zakresie i wykonywalną umiejętność. Wiki Maintainer konsoliduje obserwowalne sukcesy i porażki, a Proposer wykorzystuje tę wiedzę do tworzenia ograniczonych edycji typu add/delete/replace. Kandydaci muszą poprawić użyteczność na wydzielonej walidacji, a `--apply` dodatkowo wymaga poprawy na zbiorze holdout należącym do runnera. W czasie wdrożenia nie ma dodatkowego wyszukiwania w wiki podczas inferencji: wynikiem pozostaje `SKILL.md`.

Podstawa badawcza: Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C., & Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## Twarda zależność: fixture’y zadań ewaluacyjnych

`oma skill optimize` nie może działać bez fixture’ów zadań ewaluacyjnych. Wymaga co najmniej **5 fixture’ów zadań** (`MIN_TASKS = 5`) w `.agents/eval/<skill>/`. Gdy znajdzie ich mniej, polecenie natychmiast zgłasza błąd:

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

Zobacz [przewodnik po ewaluacji użyteczności umiejętności](/docs/guide/skill-eval), aby poznać konwencję katalogu `.agents/eval/<skill>/`, schemat fixture’a, typy checkerów i sposób przygotowania rolloutów do odtwarzania mock.

---

## Jak to działa

Fixture’y są sortowane po ID zadania i deterministycznie dzielone na zbiory **train**, **held-out validation** oraz **runner-owned final-test**. Przy co najmniej pięciu fixture’ach docelowe proporcje to 60/20/20, a każda partycja ma co najmniej jedno zadanie. Zadania final-test pochodzą z lokalnego zestawu fixture’ów; podczas pętli są ukryte przed Maintainerem i Proposerem, a nie pobierane z ukrytego zewnętrznego zestawu.

Dla każdej epoki (do `--max-epochs`, domyślnie 8):

1. **Oceń bieżące najlepsze `SKILL.md` na partycji TRAIN** — `oma skill eval` zwraca obserwowalne prompty, wyniki i przyrosty per zadanie.
2. **Wiki Maintainer konsoliduje dowody** — do pięciu porażek i trzech sukcesów staje się wzorcami powiązanymi z dowodami. Wzorce ograniczone zakresem i wcześniejsze wyniki bramek są przywoływane z systemu pamięci OMA L1/L2/L3.
3. **Proposer emituje K edycji kandydata** (do `--edits-per-epoch`, domyślnie 4). Dokładne edycje obecne już w trwałej historii odrzuceń są pomijane.
4. **Dla każdej edycji kandydata:**
   - Zastosuj edycję do kopii `SKILL.md` przechowywanej w pamięci.
   - Zweryfikuj kandydata (frontmatter `name`/`description` musi przetrwać; body musi dać się sparsować).
   - Wymuś tekstowy budżet learning rate: odrzuć edycje, których łączna zmiana liczby znaków przekracza `--lr` (domyślnie 600 znaków).
   - Ponownie oceń kandydata na **wydzielonej partycji validation**.
5. **Zaakceptuj najlepszego kandydata walidacyjnego IFF**, gdy przyrost walidacyjny ściśle się poprawia (`Δlift > 0`) **ORAZ** żaden wpis negative-transfer nie przekracza progu regresji (`NEG_TRANSFER_FAIL = -0.1`). Każda bramka propozycji jest utrwalana.
6. **Zatrzymaj się wcześniej** po 2 kolejnych epokach bez zaakceptowanej edycji (`OPT_EARLY_STOP_PATIENCE = 2`).
7. **Po ewolucji uruchom finalny test należący do runnera.** Maintainer i Proposer nigdy nie widzą tych zadań podczas pętli. Nieudany finalny test uniemożliwia `--apply` i zapisuje zwycięzcę walidacji jako odrzuconą wiedzę.

Optymalizator nigdy nie edytuje aktywnego `SKILL.md` podczas pętli — zawsze pracuje na kopii kandydata przechowywanej w pamięci.

---

## Użycie

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### Flagi

| Flaga | Wartość domyślna | Opis |
|:-----|:--------|:-----------|
| `--skill <id>` | `_all` | ID umiejętności do optymalizacji (prosta nazwa, bez separatorów ścieżki). |
| `--dry-run` | **tak (domyślnie)** | Zaproponuj edycje i wypisz diff bez zmiany `SKILL.md`; wygenerowane dowody i zdarzenia ewolucji są nadal zapisywane. |
| `--apply` | — | Zastosuj zaakceptowane edycje do `SKILL.md` — przed atomowym zapisem utwórz kopię oryginału. Działa tylko po przejściu bramek walidacji i finalnego testu runnera; umiejętność należąca do OMA wymaga również `--yes`. |
| `--mock` | **tak (domyślnie)** | Odtwórz zapisane edycje optymalizatora i werdykty ewaluacji z `_rollouts/`. Deterministyczne, offline, bezpieczne dla CI. |
| `--live` | — | Dispatch optymalizatora LLM w trybie live — wykonuje rzeczywiste wywołania modeli w każdej epoce. Wypisuje podgląd kosztu i pyta o potwierdzenie, chyba że podano `--yes`. |
| `--max-epochs <n>` | `8` | Maksymalna liczba epok optymalizacji. |
| `--edits-per-epoch <k>` | `4` | Liczba edycji kandydata proponowanych przez LLM optymalizatora w każdej epoce. |
| `--lr <chars>` | `600` | Tekstowy budżet learning rate: maksymalna łączna zmiana znaków dla jednej zaakceptowanej edycji. |
| `--yes` | — | Pomiń potwierdzenie podglądu kosztu. Ma znaczenie tylko z `--live`. |
| `--json` | — | Wypisz wynik jako JSON dla CI/CD. |
| `--output <format>` | `text` | Format wyniku (`text` albo `json`). |

---

## Minimalny przykład od początku do końca

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

Przykładowy wynik:

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

Diff pokazuje, co optymalizator zapisałby do pliku. `SKILL.md` pozostaje bez zmian, a wygenerowane dowody ewolucji i wyniki bramek ograniczone zakresem są przechowywane do przyszłych uruchomień.

---

## Zastosowanie zweryfikowanej poprawy

Gdy proponowany diff jest gotowy, uruchom ponownie polecenie z `--apply`:

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

`--apply` zapisuje tylko wtedy, gdy optymalizacja znalazła ściśle dodatnią poprawę walidacji, a przyrost kandydata w finalnym teście runnera jest większy niż jego przyrost bazowy. Przed atomowym zapisem tworzona jest kopia oryginalnego `SKILL.md`. Diff jest zawsze wypisywany, aby można było sprawdzić zmianę.

---

## Tryb live

Tryb live wywołuje rzeczywistych Maintainerów i Proposerów oraz ponownie uruchamia ramiona ewaluacji live w każdej epoce. Jest kosztowny: każde oceniane zadanie wykonuje wywołanie bazowe i wariantu badanego, fixture’y judge dodają wywołania oceniajace, a finalny test ocenia oryginalne i kandydackie treści. Podgląd podaje górną granicę wewnętrznych wywołań modeli wynikającą z rzeczywistego podziału. Każde wywołanie ma limit 120 sekund; ramiona ewaluacji Claude działają w ograniczeniu bez narzędzi otoczenia, umiejętności, MCP i AgentMemory.

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

Podgląd kosztu wyświetla górną granicę wewnętrznych wywołań modeli, zanim zostanie wykonane jakiekolwiek wywołanie LLM.

---

## Wynik JSON

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

`ok` ma wartość `true` tylko wtedy, gdy kandydat poprawia walidację, a finalny test runnera nie kończy się niepowodzeniem (albo kandydat został zastosowany). Liczniki `_split` pokazują rzeczywisty podział lokalnych fixture’ów użyty podczas uruchomienia.

---

## Zastrzeżenie SSOT dla umiejętności `oma-*`

Umiejętności, których ID zaczyna się od `oma-`, należą do oh-my-agent i są **nadpisywane przez `oma update`**. Dla tych umiejętności odradza się `--apply` — użyj `--dry-run` (wartość domyślna), przejrzyj proponowany diff i wprowadź zmianę do rejestru upstream, jeśli poprawa ma znaczenie. Dla umiejętności napisanych przez użytkownika `--apply` jest bezpieczne.

Gdy docelowa umiejętność należy do OMA, polecenie wypisuje ostrzeżenie:

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

---

## Guard przed przeuczeniem

Maintainer i Proposer widzą wyłącznie dowody rolloutów TRAIN. Wybór kandydata korzysta z wydzielonej partycji VALIDATION, a partycja TEST należąca do runnera pozostaje dla nich niedostępna do końca ewolucji. Zwycięzca walidacji, który nie poprawi finalnego testu, nie jest stosowany i trafia do trwałej historii odrzuceń.

---

## Integracja z CI

W trybie `--mock` `oma skill optimize` jest w pełni deterministyczne i działa offline — nie jest wywoływany żaden LLM. Użyj go w CI, aby sprawdzić, czy proponowany diff umiejętności nadal wykazuje przyrost względem zapisanych rolloutów:

```bash
oma skill optimize --skill oma-scholar --mock --json
```

Kody wyjścia:
- `0` — optymalizacja zakończona (z poprawą albo bez niej)
- `1` — mniej niż `MIN_TASKS` fixture’ów albo nieprawidłowy argument `--skill`

---

## Zobacz także

- [Ewaluacja użyteczności umiejętności](/docs/guide/skill-eval) — tworzenie fixture’ów zadań, typy checkerów, tryby mock/live i katalog `_rollouts/`.
- [Polecenia CLI](/docs/cli-interfaces/commands) — odniesienie do flag wszystkich poleceń zarządzania umiejętnościami.
