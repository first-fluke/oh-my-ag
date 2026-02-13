---
title: Komendy
description: Kompletna powierzchnia komend z cli/cli.ts.
---

# Komendy

Poniższa powierzchnia komend odzwierciedla bieżącą implementację w `cli/cli.ts`.

## Komendy podstawowe

```bash
oh-my-ag                         # interaktywny instalator
oh-my-ag dashboard               # panel terminalowy
oh-my-ag dashboard:web           # panel webowy (:9847)
oh-my-ag usage                   # limity użycia
oh-my-ag update                  # aktualizacja umiejętności z rejestru
oh-my-ag doctor                  # diagnostyka środowiska/umiejętności
oh-my-ag stats                   # metryki produktywności
oh-my-ag retro                   # raport retrospektywny
oh-my-ag cleanup                 # czyszczenie osieroconych zasobów
oh-my-ag bridge [url]            # MCP stdio -> streamable HTTP
```

## Komendy agentów

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## Pamięć i weryfikacja

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
