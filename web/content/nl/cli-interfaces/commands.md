---
title: Commando's
description: Volledig commando-overzicht uit cli/cli.ts.
---

# Commando's

Het onderstaande commando-overzicht weerspiegelt de huidige implementatie in `cli/cli.ts`.

## Kerncommando's

```bash
oh-my-ag                         # interactieve installer
oh-my-ag dashboard               # terminaldashboard
oh-my-ag dashboard:web           # webdashboard (:9847)
oh-my-ag usage                   # gebruiksquota
oh-my-ag update                  # skills bijwerken vanuit registry
oh-my-ag doctor                  # omgevings-/skilldiagnose
oh-my-ag stats                   # productiviteitsmetrieken
oh-my-ag retro                   # retrospectief rapport
oh-my-ag cleanup                 # opruimen van verweesde resources
oh-my-ag bridge [url]            # MCP stdio -> streamable HTTP
```

## Agentcommando's

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## Geheugen en verificatie

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
