---
title: "Gebruiksscenario: Multi-agentproject"
description: End-to-end-stroom voor complexe cross-domainlevering met expliciete coördinatiepoorten.
---

# Gebruiksscenario: Multi-agentproject

## Wanneer dit pad te gebruiken

Gebruik dit wanneer een feature meerdere domeinen beslaat (bijvoorbeeld backend + frontend + QA) en parallelle uitvoering voordelig is.

## Coördinatiemodel

Aanbevolen volgorde:

1. `/plan` voor taakopsplitsing en afhankelijkheidstoewijzing
2. `/coordinate` voor uitvoeringsvolgorde en eigenaarschap
3. Parallelle `agent:spawn` per domein
4. `/review` voor QA-/beveiligings-/prestatiecontrole

## Sessie- en werkruimtestrategie

Gebruik een sessie-ID per featurestroom:

```text
session-auth-v2
```

Wijs geïsoleerde werkruimten toe per domein om mergeconflicten te verminderen:

- backend: `./apps/api`
- frontend: `./apps/web`
- mobile: `./apps/mobile`

## Spawnvoorbeeld

```bash
oh-my-ag agent:spawn backend "Implement JWT auth API + refresh flow" session-auth-v2 -w ./apps/api
oh-my-ag agent:spawn frontend "Build login + refresh UX with error states" session-auth-v2 -w ./apps/web
oh-my-ag agent:spawn qa "Review auth risks, test matrix, and regression scope" session-auth-v2
```

## Contract-firstregel

Vergrendel gedeelde contracten voordat er parallel wordt gecodeerd:

- Request-/responseschema's
- Foutcodes en -berichten
- Authenticatie-/sessielevenscyclusaannames

Als contracten tijdens de uitvoering wijzigen, pauzeer dan downstreamagents en geef prompts opnieuw uit met het bijgewerkte contract.

## Mergepoorten

Merge niet tenzij alle poorten zijn gepasseerd:

1. Domeinniveautests slagen
2. Integratiepunten komen overeen met afgesproken contracten
3. Hoge/kritieke QA-bevindingen zijn opgelost of expliciet geaccepteerd
4. Changelog of releasenotes zijn bijgewerkt wanneer extern zichtbaar gedrag wijzigt

## Operationele antipatronen

Vermijd:

- Een werkruimte delen over alle agents
- Contracten wijzigen zonder andere agents te informeren
- Backend/frontend onafhankelijk mergen voor compatibiliteitscontrole

## Gereedcriteria

Multi-agentuitvoering is gereed wanneer:

- Geplande taken zijn voltooid over alle domeinen
- Cross-domainintegratie is gevalideerd
- QA-aftekening (of gedocumenteerde risicoacceptatie) is vastgelegd
