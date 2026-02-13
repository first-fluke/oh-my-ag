---
title: "Przypadek użycia: Pojedyncza umiejętność"
description: Szybka ścieżka dla skupionej pracy w jednej domenie z jasnym zakresem i krótkimi pętlami informacji zwrotnej.
---

# Przypadek użycia: Pojedyncza umiejętność

## Kiedy używać tej ścieżki

Użyj tego, gdy wynik ma wąski zakres i jest w głównej mierze własnością jednej domeny:

- jeden komponent UI
- jeden endpoint API
- jeden błąd w jednej warstwie
- jedna refaktoryzacja w jednym module

Jeśli zadanie wymaga koordynacji między domenami (kontrakt API + UI + QA), użyj [`Projektu wieloagentowego`](./multi-agent-project.md).

## Lista kontrolna przed rozpoczęciem

Przed sformułowaniem promptu zdefiniuj:

1. Dokładny wynik (plik lub zachowanie)
2. Docelowy stos technologiczny i wersje
3. Kryteria akceptacji
4. Oczekiwania testowe

## Szablon promptu

```text
Build <specific artifact> using <stack>.
Constraints: <style/perf/security constraints>.
Acceptance criteria:
1) ...
2) ...
Add tests for: <critical cases>.
```

## Przykładowy prompt

```text
Create a login form component in React + TypeScript + Tailwind CSS.
Constraints: accessible labels, client-side validation, no external form library.
Acceptance criteria:
1) email and password validation messages
2) disabled submit while invalid
3) keyboard and screen-reader friendly
Add unit tests for valid/invalid submit paths.
```

## Oczekiwany przepływ wykonania

1. Odpowiednia umiejętność jest wybierana automatycznie.
2. Agent proponuje implementację i założenia.
3. Potwierdzasz lub korygasz założenia.
4. Agent dostarcza kod i testy.
5. Uruchamiasz lokalną weryfikację i prosisz o drobne poprawki.

## Bramka jakości przed scaleniem

- Zachowanie odpowiada kryteriom akceptacji
- Testy pokrywają ścieżkę główną i kluczowe przypadki brzegowe
- Brak niezwiązanych zmian w plikach
- Brak ukrytych zmian powodujących regresję we współdzielonych modułach

## Sygnały eskalacji

Przejdź do przepływu wieloagentowego, gdy:

- Praca nad UI wymaga nowych kontraktów API
- Jedna poprawka powoduje kaskadowe zmiany w wielu warstwach
- Zakres rozrasta się poza jedną domenę po pierwszej iteracji

## Kryteria zakończenia

Wykonywanie pojedynczej umiejętności jest zakończone, gdy:

- Docelowy artefakt jest zaimplementowany
- Kryteria akceptacji są wymiernie spełnione
- Testy są dodane lub zaktualizowane dla zmienionego zachowania
