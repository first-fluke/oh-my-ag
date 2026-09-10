---
title: "Przewodnik: silnik diagramów (archify)"
sidebar_label: Diagramy
description: Jak oh-my-agent wybiera między Mermaid a opcjonalną umiejętnością agenta tt-a1i/archify dla diagramów architektury, sekwencji i przepływu danych — sekcja konfiguracji diagramów, oma diagram resolve / oma diagram archify, użycie przez /architecture i /explain oraz nieograniczona pętla validate-repair-deliver.
---

# Silnik diagramów

`/architecture` (ADR-y, rekomendacje, przeglądy) i `/explain` (objaśnienia zmian kodu) emitują diagramy strukturalne. Zawsze są to bloki **Mermaid** wewnątrz artefaktu Markdown, a — gdy można rozstrzygnąć [archify](https://github.com/tt-a1i/archify), co jest normalnym przypadkiem — dodatkowo **interaktywny, zwalidowany diagram HTML** obok artefaktu: z motywem ciemnym/jasnym, przesuwaniem i powiększaniem, wyszukiwaniem, śledzeniem relacji, eksportem PNG/SVG/WebM oraz renderowaniem z typowanej specyfikacji JSON.

Mermaid nigdy nie znika: to tekstowy SSOT obecny w Markdownie i diffach Git. archify jest artefaktem pochodnym.

---

## Zawsze najnowszy archify — niczego nie instalujesz

archify to umiejętność agenta na licencji MIT (Node ≥ 18, zero zależności runtime’u). oh-my-agent nie polega na kopii zainstalowanej raz przez Ciebie; utrzymuje **własną zarządzaną kopię** i śledzi najnowsze wydanie:

- Cache: `~/.cache/oma-diagram/archify/<tag>/` oraz wskaźnik `state.json`.
- Przed każdym użyciem `oma diagram resolve` pyta GitHub o najnowszy tag wydania (maksymalnie raz na `check_interval_min`, domyślnie co 60 min), pobiera archiwum źródłowe, gdy istnieje nowszy tag (atomowy katalog per tag; starsze tagi są usuwane), a w przeciwnym razie używa kopii z cache.
- Błędy sieci nigdy nie są krytyczne: używana jest kopia z cache i raportowany stan `stale` wraz z przyczyną. Tylko pierwsze uruchomienie bez sieci i bez cache przechodzi do kopii umiejętności zainstalowanej przez użytkownika, a następnie do Mermaid.

```bash
# Illustrative output; the release tag, cache path, and quality can vary.
oma diagram update          # force a check / download now
oma diagram resolve
# engine:   archify  (requested: auto)
# reason:   archify 2.15.0 via managed:v2.15.0 (current)
# root:     /Users/you/.cache/oma-diagram/archify/v2.15.0
# quality:  showcase
oma diagram resolve --offline   # never touch the network
```

Kolejność rozstrzygania (wygrywa pierwsze trafienie, identyczna w każdym runtime’ie dostawcy):

1. `diagram.archify.path` w `oma-config.yaml` — jawne przypięcie, które wyłącza automatyczne najnowsze wydanie
2. Zmienna środowiskowa `ARCHIFY_HOME` — jawne przypięcie
3. **Zarządzane najnowsze wydanie** (`~/.cache/oma-diagram/archify`)
4. Katalogi umiejętności użytkownika: projektowe `.agents` / `.claude` / `.codex` / `.cursor` / `.qwen` / `.kiro` `/skills/archify`, następnie te same ścieżki pod `~`, a także `~/.raven/workspace/skills/archify`

<!-- oma-docs:ignore-start -->
Trafienie wymaga, aby zarządzana albo przypięta instalacja archify zawierała `bin/archify.mjs`.
<!-- oma-docs:ignore-end -->

---

## Konfiguracja

Częściowa sekcja w `.agents/oma-config.yaml` (brakujące klucze używają pokazanych wartości domyślnych):

```yaml
diagram:
  engine: auto                # auto | archify | mermaid
  explain_sidecar: false      # /explain also writes an archify sidecar
  archify:
    managed: true             # false = never download; use pins / skill dirs only
    channel: stable           # stable (latest GitHub Release) | main (HEAD of main)
    check_interval_min: 60    # minutes between remote checks; 0 = every call
    path: null                # explicit install dir (pin)
    quality: showcase         # showcase | standard  → --quality
    open: false               # pass --open to deliver
```

| `engine` | Zachowanie |
|---|---|
| `auto` (domyślnie) | archify, gdy tylko zostanie rozstrzygnięty (zarządzane najnowsze wydanie, przypięcie albo katalog umiejętności), w przeciwnym razie Mermaid |
| `archify` | Wymagaj archify. `oma diagram resolve` kończy się kodem 1, gdy nic nie zostanie rozstrzygnięte (pierwsze uruchomienie offline); workflow zatrzymuje się zamiast po cichu obniżać możliwości |
| `mermaid` | Nigdy nie wywołuj archify |

Prompt może nadpisać konfigurację dla jednego uruchomienia (`/explain 640 with archify`).

---

## CLI

```bash
oma diagram resolve [--engine auto|archify|mermaid] [--refresh] [--offline] [--json]
oma diagram update  [--json]
oma diagram archify <archify args…>
```

`oma diagram archify` uruchamia rozstrzygnięty plik wykonywalny archify z `ARCHIFY_UPDATE_CHECK_DISABLED=1` (bez sieci) i przekazuje kod wyjścia, więc `validate` / `deliver` / `visual-check` zachowują się dokładnie tak, jak opisuje archify:

```bash
oma diagram archify guide "show the auth request lifecycle" --json
oma diagram archify validate architecture adr-auth.archify.json --quality showcase --json
oma diagram archify deliver  architecture adr-auth.archify.json adr-auth.archify.html --quality showcase --json
oma diagram archify visual-check adr-auth.archify.html --json   # exit 2 = no Chrome, reported as skipped
```

`--json` przy `resolve` zwraca `{ ok, requested, engine, quality, open, explainSidecar, archify?: { root, bin, version, source, status?, note? }, reason, probed }` — `source` to `managed:<tag>`, `config:…`, `env:…` albo etykieta katalogu umiejętności; `status` (`fresh` / `current` / `stale`) i `note` są ustawiane dla kopii zarządzanych.

---

## Jak workflowy tego używają

Wspólny protokół znajduje się w `.agents/skills/_shared/conditional/diagram-engine.md`. Oba workflowy wykonują tę samą sekwencję:

1. `oma diagram resolve --json`
2. Najpierw zawsze napisz blok Mermaid.
3. Gdy `engine: archify`: przetłumacz topologię Mermaid na JSON IR archify (`architecture` / `sequence` / `dataflow` / `lifecycle` / `workflow`), odczytując z instalacji tylko pasujący schemat i jeden przykład.
4. `validate` → naprawa → `deliver`. **Nie ma stałego limitu iteracji.** Agent naprawia, dopóki liczba błędów celu archify się poprawia, i zatrzymuje się dopiero na własnej regule zbieżności archify (dwie kolejne rundy bez poprawy). Etykiety semantyczne nigdy nie są usuwane tylko po to, aby przejść kontrolę.
5. Połącz HTML — nigdy go nie osadzaj.

### `/architecture`

Tylko dla decyzji strukturalnych (granice, zależności, przepływ danych). Wynik obok artefaktu Markdown w `.agents/results/architecture/`:

```
adr-notification-service.md            # Mermaid block + "Interactive:" link
adr-notification-service.archify.json  # frozen spec (kept even on failure)
adr-notification-service.archify.html  # delivered viewer
```

### `/explain`

Opcjonalne, ponieważ własny kontrakt objaśnienia (pojedynczy samodzielny plik, motywowanie zmiennymi CSS) nie pozwala osadzić drugiego pełnego dokumentu HTML. Włącz przez `diagram.explain_sidecar: true` albo poproś w prompcie. Sidecar `{date}-{slug}.archify.html` pochodzi z głównego diagramu System/Data-Flow objaśnienia i jest łączony zwykłym `<a href>`; błąd sidecara nigdy nie blokuje objaśnienia.

---

## Tryby awarii

| Sytuacja | Wynik |
|---|---|
| Nieudane sprawdzenie aktualizacji (offline, ograniczenie częstotliwości) | Kopia z cache jest używana i raportowana jako `stale` wraz z przyczyną |
| Brak cache, sieci i katalogu umiejętności, `engine: auto` | Tylko Mermaid; raport mówi, aby raz online uruchomić `oma diagram update` |
| To samo, lecz `engine: archify` | Workflow zatrzymuje się (`ok: false`) ze wskazówką `oma diagram update` |
| `validate` nigdy nie osiąga zbieżności | Dostarczony pozostaje Mermaid; ostatni `.archify.json` zostaje dla człowieka, a diagnostyka jest raportowana dosłownie |
| Brak Chrome dla `visual-check` | Raportowane jako `skipped`, nigdy jako przejście |

---

## Powiązane

- [Objaśnianie kodu](/docs/guide/code-explainer) — workflow `/explain`
- [Semantyka oma-config.yaml](/docs/guide/oma-config-semantics)
- Upstream archify: [tt-a1i/archify](https://github.com/tt-a1i/archify)
