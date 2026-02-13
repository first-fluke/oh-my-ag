---
title: Befehle
description: Vollständige Befehlsoberfläche aus cli/cli.ts.
---

# Befehle

Die folgende Befehlsoberfläche entspricht der aktuellen Implementierung in `cli/cli.ts`.

## Kernbefehle

```bash
oh-my-ag                         # interaktiver Installer
oh-my-ag dashboard               # Terminal-Dashboard
oh-my-ag dashboard:web           # Web-Dashboard (:9847)
oh-my-ag usage                   # Nutzungskontingente
oh-my-ag update                  # Skills aus der Registry aktualisieren
oh-my-ag doctor                  # Umgebungs-/Skill-Diagnose
oh-my-ag stats                   # Produktivitätskennzahlen
oh-my-ag retro                   # Retrospektive-Bericht
oh-my-ag cleanup                 # Verwaiste Ressourcen bereinigen
oh-my-ag bridge [url]            # MCP stdio -> streamable HTTP
```

## Agenten-Befehle

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## Speicher und Verifizierung

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
