---
title: Wprowadzenie
description: Czym jest oh-my-ag i jak działa współpraca wieloagentowa.
---

# Wprowadzenie

oh-my-ag to wieloagentowy orkiestrator dla Antigravity IDE. Kieruje żądania do wyspecjalizowanych umiejętności i koordynuje agentów za pośrednictwem pamięci Serena.

## Co otrzymujesz

- Routing umiejętności oparty na żądaniach
- Wykonanie oparte na przepływach pracy dla planowania/przeglądu/debugowania
- Orkiestracja CLI do równoległego uruchamiania agentów
- Panele czasu rzeczywistego do monitorowania sesji

## Role agentów

| Agent | Odpowiedzialność |
|---|---|
| workflow-guide | Koordynuje złożone projekty wielodomenowe |
| pm-agent | Planowanie i dekompozycja architektury |
| frontend-agent | Implementacja React/Next.js |
| backend-agent | Implementacja API/bazy danych/autoryzacji |
| mobile-agent | Implementacja Flutter/mobile |
| qa-agent | Przegląd bezpieczeństwa/wydajności/dostępności |
| debug-agent | Analiza przyczyn źródłowych i poprawki bezpieczne dla regresji |
| orchestrator | Orkiestracja podagentów oparta na CLI |
| commit | Przepływ pracy konwencjonalnych commitów |

## Struktura projektu

- `.agent/skills/`: definicje umiejętności i zasoby
- `.agent/workflows/`: jawne komendy przepływów pracy
- `.serena/memories/`: stan orkiestracji w czasie wykonania
- `cli/cli.ts`: źródło prawdy dla interfejsów komend

## Progresywne ujawnianie

1. Zidentyfikuj intencję żądania
2. Załaduj tylko wymagane zasoby umiejętności
3. Wykonaj za pomocą wyspecjalizowanych agentów
4. Zweryfikuj i iteruj przez pętle QA/debug
