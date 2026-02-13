---
title: Introduction
description: Ce qu'est oh-my-ag et comment fonctionne la collaboration multi-agent.
---

# Introduction

oh-my-ag est un orchestrateur multi-agent pour l'IDE Antigravity. Il route les requêtes vers des skills spécialisés et coordonne les agents via les mémoires Serena.

## Ce que vous obtenez

- Routage de skills piloté par la requête
- Exécution basée sur les workflows pour la planification, la revue et le débogage
- Orchestration CLI pour l'exécution parallèle des agents
- Tableaux de bord en temps réel pour la surveillance des sessions

## Rôles des agents

| Agent | Responsabilité |
|---|---|
| workflow-guide | Coordonne les projets complexes multi-domaines |
| pm-agent | Planification et décomposition architecturale |
| frontend-agent | Implémentation React/Next.js |
| backend-agent | Implémentation API/base de données/authentification |
| mobile-agent | Implémentation Flutter/mobile |
| qa-agent | Revue sécurité/performance/accessibilité |
| debug-agent | Analyse des causes racines et correctifs sans régression |
| orchestrator | Orchestration de sous-agents via CLI |
| commit | Workflow de commit conventionnel |

## Structure du projet

- `.agent/skills/` : définitions des skills et ressources
- `.agent/workflows/` : commandes de workflow explicites
- `.serena/memories/` : état d'orchestration en temps réel
- `cli/cli.ts` : source de vérité pour les interfaces de commande

## Divulgation progressive

1. Identifier l'intention de la requête
2. Charger uniquement les ressources de skill nécessaires
3. Exécuter avec des agents spécialisés
4. Vérifier et itérer via les boucles QA/debug
