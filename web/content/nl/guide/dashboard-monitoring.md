---
title: "Gebruiksscenario: Dashboardmonitoring"
description: Beheer orkestratiesessies met terminal-/webdashboards en bruikbare runbook-signalen.
---

# Gebruiksscenario: Dashboardmonitoring

## Startcommando's

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Standaard URL webdashboard: `http://localhost:9847`

## Aanbevolen terminalindeling

Gebruik minimaal 3 terminals:

1. Terminaldashboard (`oh-my-ag dashboard`)
2. Agent-spawncommando's
3. Test-/buildlogs

Houd het webdashboard open voor gedeelde zichtbaarheid tijdens teamsessies.

## Wat de dashboards bewaken

Gegevensbron: `.serena/memories/`

Primaire signalen:

- Sessiestatus (`running`, `completed`, `failed`)
- Taakbordtoewijzing en statuswijzigingen
- Voortgangsbeurten per agent
- Resultaatpublicatiegebeurtenissen

Updates zijn gebeurtenisgestuurd op basis van gewijzigde bestanden; er is geen volledige directory-pollinglus nodig.

## Runbook: signaal naar actie

- `No agents detected`
  - Controleer of agents zijn gestart met hetzelfde `session-id`
  - Bevestig dat `.serena/memories/` wordt beschreven
- `Session stuck in running`
  - Inspecteer de tijdstempels van het meest recente `progress-*`-bestand
  - Herstart de mislukte of geblokkeerde agent met een duidelijkere prompt
- `Frequent reconnects (web)`
  - Controleer lokale firewall/proxy
  - Herstart `dashboard:web` en open de pagina opnieuw
- `Missing activity while agents are active`
  - Controleer of orkestrator-schrijfbewerkingen niet naar een andere werkruimte worden omgeleid

## Pre-merge monitoringchecklist

- Alle vereiste agents hebben de status voltooid bereikt
- Geen onopgeloste QA-bevindingen met hoge ernst
- Meest recente resultaatbestanden zijn aanwezig voor elke agent
- Integratietests zijn uitgevoerd na de laatste agentuitvoer

## Gereedcriteria

De monitoringfase is gereed wanneer:

- De sessie een eindstatus heeft bereikt (`completed` of opzettelijk gestopt)
- De activiteitengeschiedenis de herkomst van de uiteindelijke uitvoer verklaart
- De release-/mergebeslissing is genomen met volledig statusoverzicht
