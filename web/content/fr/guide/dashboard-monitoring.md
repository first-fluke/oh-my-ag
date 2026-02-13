---
title: "Cas d'usage : Surveillance par tableau de bord"
description: Exploiter les sessions d'orchestrateur avec les tableaux de bord terminal/web et les signaux exploitables du runbook.
---

# Cas d'usage : Surveillance par tableau de bord

## Commandes de démarrage

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

URL par défaut du tableau de bord web : `http://localhost:9847`

## Disposition recommandée des terminaux

Utilisez au moins 3 terminaux :

1. Tableau de bord terminal (`oh-my-ag dashboard`)
2. Commandes de lancement d'agents
3. Logs de tests/build

Gardez le tableau de bord web ouvert pour une visibilité partagée lors des sessions d'équipe.

## Ce que surveillent les tableaux de bord

Source de données : `.serena/memories/`

Signaux principaux :

- statut de session (`running`, `completed`, `failed`)
- affectation du tableau de tâches et changements d'état
- tours de progression par agent
- événements de publication de résultats

Les mises à jour sont déclenchées par les changements de fichiers ; aucune boucle de scrutation complète du répertoire n'est nécessaire.

## Runbook : signal vers action

- `No agents detected`
  - vérifier que les agents ont été lancés avec le même `session-id`
  - confirmer que `.serena/memories/` est bien alimenté
- `Session stuck in running`
  - inspecter les horodatages des derniers fichiers `progress-*`
  - relancer l'agent défaillant ou bloqué avec un prompt plus clair
- `Frequent reconnects (web)`
  - vérifier le pare-feu/proxy local
  - relancer `dashboard:web` et rouvrir la page
- `Missing activity while agents are active`
  - vérifier que les écritures de l'orchestrateur ne sont pas redirigées vers un autre espace de travail

## Checklist de surveillance pré-fusion

- tous les agents requis ont atteint l'état terminé
- aucune constatation QA de haute sévérité non résolue
- les derniers fichiers de résultats sont présents pour chaque agent
- les tests d'intégration ont été exécutés après les sorties finales des agents

## Critères de terminaison

La phase de surveillance est terminée lorsque :

- la session a atteint un état final (`completed` ou arrêtée volontairement)
- l'historique d'activité explique la provenance du résultat final
- la décision de release/fusion est prise avec une visibilité complète sur le statut
