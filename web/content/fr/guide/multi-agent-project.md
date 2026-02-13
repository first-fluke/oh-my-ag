---
title: "Cas d'usage : Projet multi-agent"
description: Flux de bout en bout pour une livraison complexe inter-domaines avec des points de contrôle de coordination explicites.
---

# Cas d'usage : Projet multi-agent

## Quand utiliser ce chemin

Utilisez-le lorsqu'une fonctionnalité couvre plusieurs domaines (par exemple backend + frontend + QA) et que l'exécution parallèle est bénéfique.

## Modèle de coordination

Séquence recommandée :

1. `/plan` pour la décomposition et la cartographie des dépendances
2. `/coordinate` pour l'ordre d'exécution et l'attribution
3. `agent:spawn` en parallèle par domaine
4. `/review` pour le contrôle QA/sécurité/performance

## Stratégie de session et d'espace de travail

Utilisez un identifiant de session unique par flux fonctionnel :

```text
session-auth-v2
```

Attribuez des espaces de travail isolés par domaine pour réduire les conflits de fusion :

- backend : `./apps/api`
- frontend : `./apps/web`
- mobile : `./apps/mobile`

## Exemple de lancement

```bash
oh-my-ag agent:spawn backend "Implement JWT auth API + refresh flow" session-auth-v2 -w ./apps/api
oh-my-ag agent:spawn frontend "Build login + refresh UX with error states" session-auth-v2 -w ./apps/web
oh-my-ag agent:spawn qa "Review auth risks, test matrix, and regression scope" session-auth-v2
```

## Règle du contrat d'abord

Avant le développement en parallèle, verrouillez les contrats partagés :

- schémas de requête/réponse
- codes et messages d'erreur
- hypothèses sur le cycle de vie authentification/session

Si les contrats changent en cours d'exécution, mettez en pause les agents en aval et réémettez les prompts avec le contrat mis à jour.

## Points de contrôle de fusion

Ne fusionnez que si tous les contrôles sont validés :

1. les tests au niveau du domaine passent
2. les points d'intégration correspondent aux contrats convenus
3. les problèmes QA de haute/critique sévérité sont résolus ou explicitement acceptés
4. le changelog ou les notes de release sont mis à jour lorsque le comportement visible de l'extérieur change

## Anti-patterns opérationnels

A éviter :

- partager un seul espace de travail entre tous les agents
- modifier les contrats sans notifier les autres agents
- fusionner backend/frontend indépendamment avant la vérification de compatibilité

## Critères de terminaison

L'exécution multi-agent est terminée lorsque :

- les tâches planifiées sont complétées dans tous les domaines
- l'intégration inter-domaines est validée
- l'approbation QA (ou l'acceptation documentée du risque) est enregistrée
