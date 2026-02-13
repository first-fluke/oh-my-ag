---
title: "Cas d'usage : Skill unique"
description: Chemin rapide pour un travail ciblé sur un seul domaine avec un périmètre clair et des boucles de retour rapides.
---

# Cas d'usage : Skill unique

## Quand utiliser ce chemin

Utilisez-le lorsque le livrable est de portée limitée et principalement géré par un seul domaine :

- un composant UI
- un endpoint API
- un bug dans une seule couche
- un refactoring dans un seul module

Si la tâche nécessite une coordination inter-domaines (contrat API + UI + QA), utilisez [`Projet multi-agent`](./multi-agent-project.md).

## Checklist de pré-lancement

Avant de rédiger le prompt, définissez :

1. le livrable exact (fichier ou comportement)
2. la pile technique cible et ses versions
3. les critères d'acceptation
4. les attentes de test

## Modèle de prompt

```text
Build <specific artifact> using <stack>.
Constraints: <style/perf/security constraints>.
Acceptance criteria:
1) ...
2) ...
Add tests for: <critical cases>.
```

## Exemple de prompt

```text
Create a login form component in React + TypeScript + Tailwind CSS.
Constraints: accessible labels, client-side validation, no external form library.
Acceptance criteria:
1) email and password validation messages
2) disabled submit while invalid
3) keyboard and screen-reader friendly
Add unit tests for valid/invalid submit paths.
```

## Flux d'exécution attendu

1. Le skill pertinent est sélectionné automatiquement.
2. L'agent propose l'implémentation et les hypothèses.
3. Vous confirmez ou ajustez les hypothèses.
4. L'agent livre le code et les tests.
5. Vous effectuez la vérification locale et demandez de petits ajustements.

## Contrôle qualité avant fusion

- le comportement correspond aux critères d'acceptation
- les tests couvrent le chemin nominal et les cas limites principaux
- aucune modification de fichier non liée
- aucun changement cassant caché sur les modules partagés

## Signaux d'escalade

Passez au flux multi-agent lorsque :

- le travail UI nécessite de nouveaux contrats API
- un correctif crée des changements en cascade à travers les couches
- le périmètre s'étend au-delà d'un seul domaine après la première itération

## Critères de terminaison

L'exécution en skill unique est terminée lorsque :

- le livrable cible est implémenté
- les critères d'acceptation sont démontrés comme satisfaits
- les tests sont ajoutés ou mis à jour pour le comportement modifié
