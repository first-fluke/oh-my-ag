---
title: "Przewodnik: wyniki agentów i wznawianie"
sidebar_label: Wyniki i wznawianie
description: Zapisuj pracę agentów za pomocą weryfikowalnych zgłoszeń, sprawdzaj natywny kontekst i odzyskuj niepełne sesje bez ponownego używania nieaktualnych dowodów.
---

# Wyniki agentów i wznawianie

OMA traktuje wynik agenta jako mały rekord dowodowy, a nie tylko kod wyjścia procesu. Uruchomienie zapisuje ID zadania i sesji, odcisk workspace’u, pokwitowania weryfikacji, zmienione pliki, nierozwiązaną pracę i skróty artefaktów. Dzięki temu koordynator może ponownie wykorzystać zakończone zadanie tylko tak długo, jak jego kontrakt akceptacji i dane wejściowe nadal pasują.

Używaj tego cyklu bezpośrednio, gdy uruchamiasz natywnego agenta. Workflowy i `oma agent spawn` tworzą te same rekordy za Ciebie i pozostawiają finalizację zarządzanego uruchomienia koordynatorowi nadrzędnemu.

## Rozpocznij natywne uruchomienie

Najpierw zdefiniuj zadanie oraz jego `acceptance_criteria` i `required_checks` w planie `.agents/results/plan-SESSION_ID.json`. Przy małej, ogólnej kontroli projektu plan może zawierać jedno zadanie, na przykład:

```json
{
  "tasks": [
    {
      "id": "docs",
      "agent": "docs",
      "task": "Review README.md and report any documentation issues",
      "workspace": ".",
      "acceptance_criteria": [
        { "id": "diff-clean", "description": "The current Git diff has no whitespace errors" }
      ],
      "required_checks": [
        { "id": "whitespace", "criteria": ["diff-clean"], "command": ["git", "diff", "--check"], "cwd": "." }
      ],
      "retry_policy": "manual"
    }
  ]
}
```

Ta kontrola dowodzi wyłącznie czystości białych znaków w diffie Git; zastąp zadanie, kryterium i kontrolę rzeczywistym kontraktem akceptacji projektu. Z katalogu głównego projektu rozpocznij uruchomienie:

```bash
oma agent begin docs docs SESSION_ID --workspace .
```

Zastąp `SESSION_ID` ID sesji użytym w planie. Polecenie wypisuje JSON zawierający wygenerowany UUID `runId` i `claimPath`, na przykład:

```json
{
  "runId": "<generated-run-id>",
  "taskId": "docs",
  "sessionId": "<your-session-id>",
  "status": "running",
  "claimPath": ".agents/state/agent-runs/<generated-run-id>.claim.json"
}
```

Wartości w nawiasach ostrych są placeholderami; użyj rzeczywistych wartości wypisanych przez uruchomienie. Udane rozpoczęcie tworzy rekord uruchomienia w `.agents/state/agent-runs/` i zapisuje migawkę kontraktu zadania. Ścieżka zgłoszenia jest zawsze ścieżką rekordu uruchomienia z `.claim.json` zamiast `.json`.

## Załaduj kontekst i uruchom zadanie

Przed edycją załaduj odwołania wybrane przez graf:

```bash
oma agent context docs --difficulty Medium
```

Poziom trudności musi być `Simple`, `Medium` albo `Complex`. Polecenie wypisuje kontekst zebrany dla wybranego agenta. Jeśli nie istnieje kontekst oparty na grafie, popraw definicję zadania albo kontynuuj udokumentowaną natywną ścieżką wyszukiwania; nie twórz fikcyjnego pokwitowania kontekstu.

Uruchom zadanie w workspace zapisanym przez `begin`. Podczas aktywnego uruchomienia zachowaj plan sesji bez zmian. Jeśli zadanie zmieni kryteria akceptacji albo wymagane kontrole, rozpocznij nowe uruchomienie po zaktualizowaniu planu.

## Zapisz weryfikację

Uruchom każdą kontrolę przypiętą do kontraktu akceptacji:

```bash
oma agent verify RUN_ID --required
```

Zastąp `RUN_ID` UUID-em zwróconym przez `begin`. Polecenie wykonuje zadeklarowane argv i zapisuje rzeczywisty kod wyjścia oraz odciski workspace’u przed i po. Pojedyncze dokładne polecenie można zapisać, gdy kontrakt zadania je obejmuje:

```bash
oma agent verify RUN_ID -- git diff --check
```

Używaj formy z dokładnym poleceniem tylko dla kontroli należącej do kontraktu zadania; w przeciwnym razie zachowaj `required_checks` z planu i użyj `--required`, aby pokwitowanie dowodziło zadeklarowanych kryteriów akceptacji.

Używaj `--affected PATH...` tylko wtedy, gdy graf ma pełny wybór testów dla tych ścieżek. Kontrole są uruchamiane szeregowo dla każdego uruchomienia. Niezerowy kod wyjścia albo zmiana workspace’u podczas kontroli unieważnia to pokwitowanie.

## Zapisz i zakończ zgłoszenie

Zapisz plik zgłoszenia pod dokładną ścieżką wypisaną przez `begin`:

```json
{
  "status": "completed",
  "changedFiles": [],
  "unresolved": [],
  "artifacts": []
}
```

`status` przyjmuje jedną z wartości `completed`, `partial`, `blocked` albo `failed`. Ścieżki są względne względem katalogu głównego projektu, a każdy artefakt musi być zwykłym plikiem w workspace. Używaj `verificationSkipped` tylko dla konkretnego przeglądu, dla którego nie istnieje wykonywalna kontrola; nie zamienia ono nieudanej kontroli w zaliczoną.

Po zapisaniu zgłoszenia sfinalizuj natywne uruchomienie:

```bash
oma agent finish RUN_ID CLAIM_PATH
```

Podstaw oba parametry wartościami z JSON-a `begin`. `CLAIM_PATH` to wygenerowana ścieżka `.claim.json`; nie wymyślaj nowej nazwy pliku.

Polecenie finish sprawdza zgłoszenie, bieżący kontrakt, aktualne pokwitowania i skróty artefaktów. Zakończone zgłoszenie z nieaktualnym dowodem staje się nieudane albo częściowe. Polecenie odmawia finalizacji zarządzanego uruchomienia, którego cyklem życia zarządza proces nadrzędny.

## Zachowanie uruchomień zlecanych i natywnych

`oma agent spawn` i `oma agent parallel` tworzą uruchomienie, wstrzykują do promptu dziecka jego tożsamość oraz instrukcje dotyczące wyniku i pozwalają rodzicowi przechwycić kod wyjścia dziecka. Dziecko powinno zapisać zgłoszenie i zaraportować artefakty; rodzic finalizuje zarządzane pokwitowanie. Dziecko tylko do odczytu zwraca jedną linię `OMA_RESULT_JSON: {...}`; rodzic ją utrwala, a wyjaśnienie `verificationSkipped` pozostaje odrębne od wykonywalnej weryfikacji.

Czytelne dla człowieka pliki wyników w `.agents/results/` i notatki pamięci w `.agents/state/memories/` pomagają śledzić postęp. Pokwitowanie czytelne maszynowo w `.agents/state/agent-runs/` jest dowodem używanym do ponownego wykorzystania i wznawiania.

## Sprawdź odzyskiwanie przed ponowieniem próby

Najpierw sprawdź, co zrobiłoby OMA:

```bash
oma agent resume SESSION_ID --dry-run
```

Raport klasyfikuje każde zadanie jako `reused`, `ready`, `running` albo `blocked` i podaje przyczynę. Prawidłowe zakończone pokwitowanie jest używane ponownie tylko wtedy, gdy jego kontrakt, dane wejściowe, skróty artefaktów i dowody zależności są nadal aktualne. Aktywny proces zarządzany albo natywne uruchomienie bez dowodu aktywności nie jest duplikowane.

Gdy raport pozwala bezpiecznie wykonać operację, wznów gotowe zadania w kolejności zależności:

```bash
oma agent resume SESSION_ID
```

Automatyczne odtworzenie wymaga `retry_policy: "safe"`, odtwarzalnego promptu oraz agenta w planie albo zapisanym dispatchu. Wartością domyślną jest `manual`. `--max-attempts` ma domyślnie wartość `3`, wliczając pierwszą próbę:

```bash
oma agent resume SESSION_ID --max-attempts 2
```

OMA zapisuje punkt kontrolny odzyskiwania w `.agents/state/agent-resume/` i używa dzierżawy sesji, aby dwaj koordynatorzy nie mogli ponowić tej samej sesji. Podczas odzyskiwania przypina plan. Jeśli zmieni się plan, zależność albo późniejsza próba zmieni wcześniejsze dane wejściowe, zadania, których to dotyczy, stają się zablokowane i wymagają nowego uruchomienia weryfikacji.

Wznowienie rozpoczyna nową próbę; nie przywraca przerwanej rozmowy z modelem. Przed wznowieniem przerwanego natywnego uruchomienia oznacz stare uruchomienie jako `partial` albo `failed`, podając rzeczywisty wynik i nierozwiązaną pracę. Następnie sprawdź raport podglądu i ponów tylko zadania z bezpieczną ścieżką odtworzenia.

## Przykłady odzyskiwania

| Sytuacja | Działanie | Oczekiwany wynik |
| --- | --- | --- |
| Wymagana kontrola nie powiodła się | Napraw zadanie, ponownie uruchom `oma agent verify RUN_ID --required`, a następnie zakończ je nowym zgłoszeniem. | Najnowsze pokwitowanie zastępuje nieudany wynik, gdy odcisk workspace’u jest aktualny. |
| Proces zakończył się przed zgłoszeniem | Oznacz uruchomienie jako częściowe albo nieudane, a następnie uruchom `oma agent resume SESSION_ID --dry-run`. | Stara próba zostaje zachowana; bezpieczne zadanie ma status `ready`, a ręczne `blocked`. |
| Zmieniła się zależność | Ponownie uruchom zależność i jeszcze raz sprawdź raport. | Możliwość ponownego użycia zależnego zadania zostaje unieważniona, nawet gdy jego pliki się nie zmieniły. |
| Zmieniono plan albo dane wejściowe | Rozpocznij nowe uruchomienie po ustabilizowaniu planu. | Nowe uruchomienie zapisuje migawkę nowego kontraktu; stary dowód nie jest używany ponownie. |
| Zadanie wymaga decyzji | Zapisz je jako `blocked` wraz z wyjaśnieniem. | Wznowienie pozostawi je zablokowane do czasu udostępnienia decyzji i promptu. |

W sprawie błędów parsowania, brakujących narzędzi dostawcy, stanu dashboardu, harmonogramów i nieaktualnych danych ewaluacji zobacz [Rozwiązywanie problemów](/docs/guide/troubleshooting).
