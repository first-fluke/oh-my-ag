---
title: Commandes
description: Surface complète des commandes issues de cli/cli.ts.
---

# Commandes

La surface de commandes ci-dessous reflète l'implémentation actuelle dans `cli/cli.ts`.

## Commandes principales

```bash
oh-my-ag                         # installateur interactif
oh-my-ag dashboard               # tableau de bord terminal
oh-my-ag dashboard:web           # tableau de bord web (:9847)
oh-my-ag usage                   # quotas d'utilisation
oh-my-ag update                  # mettre à jour les skills depuis le registre
oh-my-ag doctor                  # diagnostics environnement/skills
oh-my-ag stats                   # métriques de productivité
oh-my-ag retro                   # rapport rétrospectif
oh-my-ag cleanup                 # nettoyage des ressources orphelines
oh-my-ag bridge [url]            # MCP stdio -> streamable HTTP
```

## Commandes d'agent

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## Mémoire et vérification

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
