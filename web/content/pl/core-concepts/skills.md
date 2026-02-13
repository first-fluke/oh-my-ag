---
title: Umiejętności
description: Progresywne ujawnianie i architektura umiejętności zoptymalizowana pod kątem tokenów.
---

# Umiejętności

## Progresywne ujawnianie

Umiejętności są wybierane na podstawie intencji żądania. Ręczny wybór umiejętności zwykle nie jest konieczny.

## Dwuwarstwowy design

Każda umiejętność wykorzystuje **dwuwarstwowy design zoptymalizowany pod kątem tokenów**:

| Warstwa | Zawartość | Rozmiar |
|---------|-----------|---------|
| `SKILL.md` | Tożsamość, warunki routingu, podstawowe reguły | ~40 linii (~800B) |
| `resources/` | Protokoły wykonania, przykłady, listy kontrolne, poradniki, fragmenty kodu, stos technologiczny | Ładowane na żądanie |

Osiąga to **~75% oszczędności tokenów** przy początkowym ładowaniu umiejętności (3-7KB → ~800B na umiejętność).

## Współdzielona warstwa zasobów (`_shared/`)

Wspólne zasoby zdeduplikowane pomiędzy wszystkimi umiejętnościami:

| Zasób | Przeznaczenie |
|-------|---------------|
| `reasoning-templates.md` | Strukturalne szablony do uzupełniania dla wielokrokowego rozumowania |
| `clarification-protocol.md` | Kiedy pytać, a kiedy zakładać, poziomy niejednoznaczności |
| `context-budget.md` | Strategie odczytu plików efektywne tokenowo dla poszczególnych poziomów modeli |
| `context-loading.md` | Mapowanie typ zadania → zasób dla konstruowania promptu orkiestratora |
| `skill-routing.md` | Mapowanie słów kluczowych na umiejętności i reguły wykonywania równoległego |
| `difficulty-guide.md` | Ocena Proste/Średnie/Złożone z rozgałęzieniem protokołu |
| `lessons-learned.md` | Zgromadzone między sesjami pułapki domenowe |
| `verify.sh` | Automatyczny skrypt weryfikacyjny uruchamiany po zakończeniu pracy agenta |
| `api-contracts/` | PM tworzy kontrakty, backend implementuje, frontend/mobile konsumuje |
| `serena-memory-protocol.md` | Protokół odczytu/zapisu pamięci w trybie CLI |
| `common-checklist.md` | Uniwersalne kontrole jakości kodu |

## Zasoby specyficzne dla umiejętności

Każda umiejętność dostarcza zasoby specyficzne dla danej domeny:

| Zasób | Przeznaczenie |
|-------|---------------|
| `execution-protocol.md` | 4-krokowy przepływ łańcucha myśli (Analiza → Plan → Implementacja → Weryfikacja) |
| `examples.md` | 2-3 przykłady wejścia/wyjścia typu few-shot |
| `checklist.md` | Lista kontrolna samoweryfikacji specyficzna dla domeny |
| `error-playbook.md` | Odzyskiwanie po awariach z regułą eskalacji „3 strajki" |
| `tech-stack.md` | Szczegółowe specyfikacje technologiczne |
| `snippets.md` | Gotowe do skopiowania wzorce kodu |

## Dlaczego to ma znaczenie

Dzięki temu początkowy kontekst pozostaje oszczędny, jednocześnie wspierając głębokie wykonanie, gdy jest to wymagane.
