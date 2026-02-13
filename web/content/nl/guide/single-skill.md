---
title: "Gebruiksscenario: Enkele skill"
description: Snelpad voor gefocust werk binnen een enkel domein met duidelijke scope en snelle feedbacklussen.
---

# Gebruiksscenario: Enkele skill

## Wanneer dit pad te gebruiken

Gebruik dit wanneer de uitvoer nauw afgebakend is en grotendeels tot een domein behoort:

- een UI-component
- een API-endpoint
- een bug in een laag
- een refactoring in een module

Als de taak cross-domaincoördinatie vereist (API-contract + UI + QA), gebruik dan [`Multi-agentproject`](./multi-agent-project.md).

## Preflightchecklist

Definieer voor het prompten:

1. Exacte uitvoer (bestand of gedrag)
2. Doelstack en versies
3. Acceptatiecriteria
4. Testverwachtingen

## Promptsjabloon

```text
Build <specific artifact> using <stack>.
Constraints: <style/perf/security constraints>.
Acceptance criteria:
1) ...
2) ...
Add tests for: <critical cases>.
```

## Voorbeeldprompt

```text
Create a login form component in React + TypeScript + Tailwind CSS.
Constraints: accessible labels, client-side validation, no external form library.
Acceptance criteria:
1) email and password validation messages
2) disabled submit while invalid
3) keyboard and screen-reader friendly
Add unit tests for valid/invalid submit paths.
```

## Verwachte uitvoeringsstroom

1. De relevante skill wordt automatisch geselecteerd.
2. De agent stelt implementatie en aannames voor.
3. U bevestigt of past de aannames aan.
4. De agent levert code en tests op.
5. U voert lokale verificatie uit en vraagt kleine aanpassingen aan.

## Kwaliteitspoort voor merge

- Gedrag komt overeen met acceptatiecriteria
- Tests dekken het succespad en kernrandgevallen
- Geen ongerelateerde bestandswijzigingen
- Geen verborgen brekende wijzigingen aan gedeelde modules

## Escalatiesignalen

Schakel over naar multi-agentstroom wanneer:

- UI-werk nieuwe API-contracten vereist
- Een fix cascaderende wijzigingen over lagen veroorzaakt
- De scope na de eerste iteratie verder reikt dan een domein

## Gereedcriteria

Enkele-skilluitvoering is gereed wanneer:

- Het doelartefact is geïmplementeerd
- Acceptatiecriteria aantoonbaar zijn voldaan
- Tests zijn toegevoegd of bijgewerkt voor het gewijzigde gedrag
