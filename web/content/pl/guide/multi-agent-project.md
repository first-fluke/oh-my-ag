---
title: "Przypadek użycia: Projekt wieloagentowy"
description: Kompletny przepływ dla złożonego dostarczania między domenami z jawnymi bramkami koordynacji.
---

# Przypadek użycia: Projekt wieloagentowy

## Kiedy używać tej ścieżki

Użyj tego, gdy funkcjonalność obejmuje wiele domen (na przykład backend + frontend + QA) i wykonywanie równoległe jest korzystne.

## Model koordynacji

Zalecana sekwencja:

1. `/plan` do dekompozycji i mapowania zależności
2. `/coordinate` do kolejności wykonania i przypisania odpowiedzialności
3. Równoległe `agent:spawn` na domenę
4. `/review` do bramki QA/bezpieczeństwa/wydajności

## Strategia sesji i przestrzeni roboczych

Używaj jednego identyfikatora sesji na strumień funkcjonalności:

```text
session-auth-v2
```

Przypisz izolowane przestrzenie robocze na domenę, aby zmniejszyć konflikty scalania:

- backend: `./apps/api`
- frontend: `./apps/web`
- mobile: `./apps/mobile`

## Przykład uruchomienia

```bash
oh-my-ag agent:spawn backend "Implement JWT auth API + refresh flow" session-auth-v2 -w ./apps/api
oh-my-ag agent:spawn frontend "Build login + refresh UX with error states" session-auth-v2 -w ./apps/web
oh-my-ag agent:spawn qa "Review auth risks, test matrix, and regression scope" session-auth-v2
```

## Zasada kontraktu w pierwszej kolejności

Przed równoległym kodowaniem zablokuj współdzielone kontrakty:

- schematy żądania/odpowiedzi
- kody błędów i komunikaty
- założenia cyklu życia autoryzacji/sesji

Jeśli kontrakty zmienią się w trakcie wykonywania, wstrzymaj podrzędnych agentów i ponownie wydaj prompty ze zaktualizowanym kontraktem.

## Bramki scalania

Nie scalaj, dopóki wszystkie bramki nie zostaną przejdzie:

1. Testy na poziomie domeny przechodzą
2. Punkty integracji odpowiadają uzgodnionym kontraktom
3. Problemy QA o wysokim/krytycznym priorytecie rozwiązane lub jawnie zaakceptowane
4. Changelog lub notatki wydania zaktualizowane, gdy zmienia się zachowanie widoczne zewnętrznie

## Antywzorce operacyjne

Unikaj:

- współdzielenia jednej przestrzeni roboczej między wszystkimi agentami
- zmieniania kontraktów bez powiadamiania innych agentów
- scalania backendu/frontendu niezależnie przed sprawdzeniem kompatybilności

## Kryteria zakończenia

Wykonywanie wieloagentowe jest zakończone, gdy:

- zaplanowane zadania są ukończone we wszystkich domenach
- integracja między domenami jest zwalidowana
- zatwierdzenie QA (lub udokumentowana akceptacja ryzyka) jest zarejestrowane
