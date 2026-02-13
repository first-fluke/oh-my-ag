---
title: Workflows
description: Expliciete slash-commandoworkflows en wanneer ze te gebruiken.
---

# Workflows

## Workflowcommando's

- `/coordinate`
- `/orchestrate`
- `/plan`
- `/review`
- `/debug`

## Skills versus workflows

- Skills: automatisch geactiveerd op basis van verzoekintentie
- Workflows: expliciete meerstapspijplijnen die door de gebruiker worden gestart

## Typische multi-agentsequentie

1. `/plan` voor taakopsplitsing
2. `/coordinate` voor gefaseerde uitvoering
3. `agent:spawn` voor parallelle subagents
4. `/review` voor QA-controle
