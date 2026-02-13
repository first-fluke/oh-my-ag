---
title: Skills
description: Progressieve ontsluiting en tokengeoptimaliseerde skillarchitectuur.
---

# Skills

## Progressieve ontsluiting

Skills worden geselecteerd op basis van de intentie van het verzoek. Handmatige skillselectie is doorgaans niet nodig.

## Tweelaags ontwerp

Elke skill maakt gebruik van een **tokengeoptimaliseerd tweelaags ontwerp**:

| Laag | Inhoud | Grootte |
|------|--------|---------|
| `SKILL.md` | Identiteit, routeringsvoorwaarden, kernregels | ~40 regels (~800B) |
| `resources/` | Uitvoeringsprotocollen, voorbeelden, checklists, draaiboeken, codefragmenten, technologiestack | Op aanvraag geladen |

Dit levert **~75% tokenbesparing** op bij het initieel laden van skills (3-7KB naar ~800B per skill).

## Gedeelde resourcelaag (`_shared/`)

Gemeenschappelijke resources die over alle skills worden ontdubbeld:

| Resource | Doel |
|----------|------|
| `reasoning-templates.md` | Gestructureerde invulsjablonen voor meerstapsredenering |
| `clarification-protocol.md` | Wanneer vragen versus aannemen, ambiguïteitsniveaus |
| `context-budget.md` | Tokenefficiënte bestandsleesstrategieën per modelniveau |
| `context-loading.md` | Taaktype-naar-resourcetoewijzing voor orkestrator-promptconstructie |
| `skill-routing.md` | Trefwoord-naar-skilltoewijzing en parallelle uitvoeringsregels |
| `difficulty-guide.md` | Eenvoudig/Gemiddeld/Complex-beoordeling met protocolvertakking |
| `lessons-learned.md` | Sessie-overstijgende verzamelde domeinvalkuilen |
| `verify.sh` | Geautomatiseerd verificatiescript dat na voltooiing van de agent wordt uitgevoerd |
| `api-contracts/` | PM maakt contracten, backend implementeert, frontend/mobile consumeert |
| `serena-memory-protocol.md` | CLI-modus geheugen lees-/schrijfprotocol |
| `common-checklist.md` | Universele codekwaliteitscontroles |

## Resources per skill

Elke skill biedt domeinspecifieke resources:

| Resource | Doel |
|----------|------|
| `execution-protocol.md` | 4-staps chain-of-thought-werkstroom (Analyseren, Plannen, Implementeren, Verifiëren) |
| `examples.md` | 2-3 few-shot invoer-/uitvoervoorbeelden |
| `checklist.md` | Domeinspecifieke zelfverificatiechecklist |
| `error-playbook.md` | Foutherstel met "3 strikes"-escalatieregel |
| `tech-stack.md` | Gedetailleerde technologiespecificaties |
| `snippets.md` | Kant-en-klare codepatronen |

## Waarom dit belangrijk is

Dit houdt de initiële context compact en ondersteunt tegelijkertijd diepgaande uitvoering wanneer dat nodig is.
