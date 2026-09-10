---
title: "Guide : Résultats d’agents et reprise"
sidebar_label: Résultats et reprise
description: Enregistrer le travail des agents avec des claims vérifiables, inspecter le contexte natif et récupérer les sessions incomplètes sans réutiliser de preuves obsolètes.
---

# Résultats d’agents et reprise

OMA traite un résultat d’agent comme un petit enregistrement de preuves, pas seulement comme le code de sortie du processus. Une exécution enregistre les identifiants de tâche et de session, l’empreinte de l’espace de travail, les reçus de vérification, les fichiers modifiés, le travail non résolu et les hachages d’artefacts. Un coordinateur peut ainsi réutiliser une tâche terminée tant que son contrat d’acceptation et ses entrées correspondent encore.

Utilisez directement ce cycle lorsque vous exécutez un agent natif. Les workflows et `oma agent spawn` créent les mêmes enregistrements pour vous et laissent la finalisation de l’exécution gérée au coordinateur parent.

## Démarrer une exécution native

Définissez d’abord la tâche, ses `acceptance_criteria` et ses `required_checks` dans un plan à `.agents/results/plan-SESSION_ID.json`. Pour une petite vérification générique de projet, le plan peut contenir une seule tâche comme celle-ci :

```json
{
  "tasks": [
    {
      "id": "docs",
      "agent": "docs",
      "task": "Review README.md and report any documentation issues",
      "workspace": ".",
      "acceptance_criteria": [
        { "id": "diff-clean", "description": "The current Git diff has no whitespace errors" }
      ],
      "required_checks": [
        { "id": "whitespace", "criteria": ["diff-clean"], "command": ["git", "diff", "--check"], "cwd": "." }
      ],
      "retry_policy": "manual"
    }
  ]
}
```

Cette vérification ne prouve que l’absence d’erreurs d’espaces dans le diff Git ; remplacez la tâche, le critère et la vérification par le véritable contrat d’acceptation du projet. Depuis la racine du projet, commencez l’exécution :

```bash
oma agent begin docs docs SESSION_ID --workspace .
```

Remplacez `SESSION_ID` par l’identifiant de session utilisé dans le plan. La commande affiche un JSON contenant un UUID `runId` généré et un `claimPath`, par exemple :

```json
{
  "runId": "<generated-run-id>",
  "taskId": "docs",
  "sessionId": "<your-session-id>",
  "status": "running",
  "claimPath": ".agents/state/agent-runs/<generated-run-id>.claim.json"
}
```

Les valeurs entre chevrons sont des placeholders ; utilisez les valeurs réelles affichées par votre exécution. Un démarrage réussi crée l’enregistrement de l’exécution sous `.agents/state/agent-runs/` et capture un instantané du contrat de tâche. Le chemin du claim est toujours le chemin de l’enregistrement d’exécution avec `.claim.json` à la place de `.json`.

## Charger le contexte et exécuter la tâche

Chargez les références sélectionnées par le graphe avant de modifier :

```bash
oma agent context docs --difficulty Medium
```

La difficulté doit être `Simple`, `Medium` ou `Complex`. La commande affiche le contexte assemblé pour l’agent sélectionné. Si aucun contexte fondé sur le graphe n’existe, corrigez la définition de tâche ou poursuivez avec le chemin de recherche natif documenté par le projet ; ne fabriquez pas de reçu de contexte.

Exécutez la tâche dans l’espace de travail enregistré par `begin`. Gardez le plan de session fixe pendant l’exécution. Si la tâche modifie ses critères d’acceptation ou ses vérifications requises, commencez une nouvelle exécution après avoir mis à jour le plan.

## Enregistrer la vérification

Lancez chaque vérification épinglée au contrat d’acceptation :

```bash
oma agent verify RUN_ID --required
```

Remplacez `RUN_ID` par l’UUID renvoyé par `begin`. La forme à commande exacte peut être enregistrée lorsqu’une telle vérification appartient au contrat de la tâche :

```bash
oma agent verify RUN_ID -- git diff --check
```

Utilisez la forme à commande exacte uniquement pour une vérification qui appartient au contrat de la tâche ; sinon, gardez les `required_checks` du plan et utilisez `--required` afin que le reçu prouve les critères d’acceptation déclarés.

Utilisez `--affected PATH...` uniquement lorsque le graphe fournit une sélection complète de tests pour ces chemins. Les vérifications s’exécutent en série pour chaque exécution. Un code de sortie non nul ou une modification de l’espace de travail pendant une vérification invalide ce reçu.

## Écrire et terminer le claim

Écrivez le fichier de claim au chemin exact affiché par `begin` :

```json
{
  "status": "completed",
  "changedFiles": [],
  "unresolved": [],
  "artifacts": []
}
```

`status` vaut `completed`, `partial`, `blocked` ou `failed`. Les chemins sont relatifs à la racine du projet et chaque artefact doit être un fichier ordinaire situé dans l’espace de travail. Utilisez `verificationSkipped` uniquement pour une revue précise qui n’a pas de vérification exécutable ; cela ne transforme pas une vérification échouée en réussite.

Finalisez une exécution native après avoir écrit le claim :

```bash
oma agent finish RUN_ID CLAIM_PATH
```

Remplacez les deux valeurs par celles du JSON renvoyé par `begin`. `CLAIM_PATH` est le chemin `.claim.json` généré ; n’inventez pas de nouveau nom de fichier.

La commande de fin valide le claim, le contrat courant, les reçus courants et les hachages d’artefacts. Un claim terminé avec des preuves obsolètes devient failed ou partial. La commande refuse de finaliser une exécution gérée dont le processus parent possède le cycle de vie.

## Comportement des exécutions créées et natives

`oma agent spawn` et `oma agent parallel` créent une exécution, injectent l’identité d’exécution et les instructions de résultat dans l’invite enfant, puis laissent le parent capturer le code de sortie de l’enfant. Un enfant doit écrire son claim et signaler ses artefacts ; le parent finalise le reçu géré. Un enfant en lecture seule renvoie une ligne `OMA_RESULT_JSON: {...}` ; le parent la conserve, et son explication `verificationSkipped` reste distincte d’une vérification exécutable.

Les fichiers de résultat lisibles dans `.agents/results/` et les notes mémoire dans `.agents/state/memories/` aident les personnes à suivre l’avancement. Le reçu lisible par machine dans `.agents/state/agent-runs/` est la preuve utilisée pour la réutilisation et la reprise.

## Inspecter la récupération avant de réessayer

Commencez par demander ce qu’OMA ferait :

```bash
oma agent resume SESSION_ID --dry-run
```

Le rapport classe chaque tâche comme `reused`, `ready`, `running` ou `blocked` et inclut la raison. Un reçu terminé valide n’est réutilisé que lorsque son contrat, ses entrées, les hachages d’artefacts et les preuves de dépendances restent actuels. Un processus géré actif, ou une exécution native sans preuve de vivacité, n’est pas dupliqué.

Lorsque le rapport indique que l’exécution est sûre, reprenez les tâches prêtes dans l’ordre des dépendances :

```bash
oma agent resume SESSION_ID
```

La relecture automatique exige `retry_policy: "safe"` ainsi qu’une invite et un agent rejouables dans le plan ou la répartition enregistrée. La valeur par défaut est `manual`. `--max-attempts` vaut par défaut `3`, tentative initiale comprise :

```bash
oma agent resume SESSION_ID --max-attempts 2
```

OMA écrit le point de contrôle de récupération sous `.agents/state/agent-resume/` et utilise un bail de session afin que deux coordinateurs ne puissent pas réessayer la même session. Il épingle le plan pendant la récupération. Si le plan change, si une dépendance change ou si une tentative ultérieure modifie une entrée antérieure, les tâches concernées deviennent bloquées et nécessitent une nouvelle exécution de vérification.

La reprise commence une nouvelle tentative ; elle ne restaure pas la conversation interrompue avec le modèle. Avant de reprendre une exécution native interrompue, marquez l’ancienne exécution `partial` ou `failed` avec son résultat réel et son travail non résolu. Examinez ensuite le rapport de simulation et ne réessayez que les tâches qui disposent d’un chemin de rejeu sûr.

## Exemples de récupération

| Situation | Action | Résultat attendu |
| --- | --- | --- |
| Une vérification requise a échoué | Corrigez la tâche, relancez `oma agent verify RUN_ID --required`, puis terminez avec un nouveau claim. | Le reçu le plus récent remplace le résultat en échec lorsque l’empreinte de l’espace de travail est actuelle. |
| Le processus est mort avant un claim | Marquez l’exécution partial ou failed, puis lancez `oma agent resume SESSION_ID --dry-run`. | L’ancienne tentative est conservée ; une tâche sûre est `ready`, tandis qu’une tâche manuelle est `blocked`. |
| Une dépendance a changé | Relancez la dépendance et examinez à nouveau le rapport. | La réutilisation dépendante est invalidée même si ses propres fichiers sont inchangés. |
| Le plan ou les entrées ont changé | Commencez une nouvelle exécution une fois le plan stabilisé. | La nouvelle exécution capture le nouveau contrat ; les anciennes preuves ne sont pas réutilisées. |
| Une tâche nécessite une décision | Enregistrez-la comme `blocked` avec une explication. | La reprise la laisse bloquée jusqu’à ce que la décision et l’invite soient disponibles. |

Pour les erreurs d’analyse, les outils fournisseur manquants, l’état du tableau de bord, les plannings et les données d’évaluation obsolètes, consultez [Dépannage](/docs/guide/troubleshooting).
