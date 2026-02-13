---
title: "Przypadek użycia: Monitorowanie panelu"
description: Obsługa sesji orkiestratora za pomocą paneli terminalowych/webowych i sygnałów runbooka do podjęcia działań.
---

# Przypadek użycia: Monitorowanie panelu

## Komendy uruchomienia

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Domyślny URL panelu webowego: `http://localhost:9847`

## Zalecany układ terminala

Używaj co najmniej 3 terminali:

1. Panel terminalowy (`oh-my-ag dashboard`)
2. Komendy uruchamiania agentów
3. Logi testów/budowania

Trzymaj panel webowy otwarty dla wspólnej widoczności podczas sesji zespołowych.

## Co monitorują panele

Źródło danych: `.serena/memories/`

Główne sygnały:

- status sesji (`running`, `completed`, `failed`)
- przypisania tablicy zadań i zmiany stanów
- tury postępu poszczególnych agentów
- zdarzenia publikacji wyników

Aktualizacje są sterowane zdarzeniami ze zmienionych plików; pełna pętla odpytywania katalogu nie jest wymagana.

## Runbook: sygnał → działanie

- `No agents detected`
  - zweryfikuj, czy agenci zostali uruchomieni z tym samym `session-id`
  - potwierdź, że `.serena/memories/` jest zapisywany
- `Session stuck in running`
  - sprawdź znaczniki czasu najnowszych plików `progress-*`
  - uruchom ponownie zablokowanego agenta z jaśniejszym promptem
- `Frequent reconnects (web)`
  - sprawdź lokalny firewall/proxy
  - uruchom ponownie `dashboard:web` i odśwież stronę
- `Missing activity while agents are active`
  - zweryfikuj, czy zapisy orkiestratora nie są przekierowane do innej przestrzeni roboczej

## Lista kontrolna monitorowania przed scaleniem

- wszyscy wymagani agenci osiągnęli stan completed
- brak nierozwiązanych ustaleń QA o wysokim priorytecie
- najnowsze pliki wyników są obecne dla każdego agenta
- testy integracyjne wykonane po końcowych wynikach agentów

## Kryteria zakończenia

Faza monitorowania jest zakończona, gdy:

- sesja osiągnęła stan końcowy (`completed` lub celowo zatrzymana)
- historia aktywności wyjaśnia pochodzenie końcowego wyniku
- decyzja o wydaniu/scaleniu została podjęta z pełną widocznością statusu
