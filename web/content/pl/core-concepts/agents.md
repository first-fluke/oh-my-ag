---
title: Agenci
description: Typy agentów, strategia przestrzeni roboczych i przepływ orkiestracji.
---

# Agenci

## Kategorie agentów

- Planowanie: agent PM
- Implementacja: Frontend, Backend, Mobile
- Zapewnienie jakości: QA, Debug
- Koordynacja: workflow-guide, orchestrator

## Strategia przestrzeni roboczych

Oddzielne przestrzenie robocze zmniejszają konflikty scalania:

```text
./apps/api      -> backend
./apps/web      -> frontend
./apps/mobile   -> mobile
```

## Przepływ menedżera agentów

1. PM definiuje dekompozycję zadań
2. Agenci domenowi wykonują zadania równolegle
3. Postęp jest strumieniowany do pamięci Serena
4. QA waliduje spójność na poziomie systemu

## Pliki uruchomieniowe Serena

- `orchestrator-session.md`
- `task-board.md`
- `progress-{agent}.md`
- `result-{agent}.md`
