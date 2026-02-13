---
title: Skills
description: Divulgation progressive et architecture de skills optimisée en tokens.
---

# Skills

## Divulgation progressive

Les skills sont sélectionnés en fonction de l'intention de la requête. La sélection manuelle de skill est généralement inutile.

## Conception à deux couches

Chaque skill utilise une **conception à deux couches optimisée en tokens** :

| Couche | Contenu | Taille |
|--------|---------|--------|
| `SKILL.md` | Identité, conditions de routage, règles principales | ~40 lignes (~800 o) |
| `resources/` | Protocoles d'exécution, exemples, checklists, playbooks, extraits de code, pile technique | Chargé à la demande |

Cela permet une **économie d'environ 75 % de tokens** lors du chargement initial du skill (3-7 Ko vers ~800 o par skill).

## Couche de ressources partagées (`_shared/`)

Ressources communes dédupliquées entre tous les skills :

| Ressource | Objectif |
|-----------|----------|
| `reasoning-templates.md` | Modèles structurés à compléter pour le raisonnement en plusieurs étapes |
| `clarification-protocol.md` | Quand demander vs supposer, niveaux d'ambiguïté |
| `context-budget.md` | Stratégies de lecture de fichiers optimisées en tokens par niveau de modèle |
| `context-loading.md` | Correspondance type de tâche vers ressource pour la construction du prompt de l'orchestrateur |
| `skill-routing.md` | Correspondance mot-clé vers skill et règles d'exécution parallèle |
| `difficulty-guide.md` | Évaluation Simple/Moyen/Complexe avec branchement de protocole |
| `lessons-learned.md` | Retours d'expérience accumulés entre sessions |
| `verify.sh` | Script de vérification automatisé exécuté après la complétion de l'agent |
| `api-contracts/` | Le PM crée les contrats, le backend les implémente, le frontend/mobile les consomme |
| `serena-memory-protocol.md` | Protocole de lecture/écriture mémoire en mode CLI |
| `common-checklist.md` | Vérifications universelles de qualité de code |

## Ressources par skill

Chaque skill fournit des ressources spécifiques à son domaine :

| Ressource | Objectif |
|-----------|----------|
| `execution-protocol.md` | Workflow en 4 étapes de type chaîne de pensée (Analyser, Planifier, Implémenter, Vérifier) |
| `examples.md` | 2-3 exemples entrée/sortie en few-shot |
| `checklist.md` | Checklist d'auto-vérification spécifique au domaine |
| `error-playbook.md` | Récupération sur erreur avec règle d'escalade « 3 tentatives » |
| `tech-stack.md` | Spécifications techniques détaillées |
| `snippets.md` | Modèles de code prêts à copier-coller |

## Pourquoi c'est important

Cela maintient un contexte initial léger tout en supportant une exécution approfondie lorsque nécessaire.
