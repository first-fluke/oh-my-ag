---
title: Évaluation du harnais
sidebar_label: Évaluation du harnais
description: Évaluer une superposition complète de harnais OMA avec des tâches de dépôt appariées et isolées et des vérifications d’artefacts déterministes.
---

# Évaluation du harnais

`oma harness eval` mesure si un harnais OMA candidat améliore un agent cible fixe sans modifier le modèle de cet agent. La commande adapte le protocole d’évaluation au moment du test de [AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses](https://arxiv.org/abs/2608.12307) : garder le modèle cible fixe, modifier le harnais et comparer les résultats sur les mêmes tâches.

Cette commande évalue une unité plus grande que `oma skill eval` :

| Commande | Traitement | Cible du score |
|:--------|:----------|:-------------|
| `oma skill eval` | Un corps `SKILL.md` | Sortie de l’agent |
| `oma harness eval` | Une superposition `.agents/` limitée au périmètre | Fichiers et sortie produits dans un espace de travail de dépôt |

Utilisez l’évaluation de compétence pour répondre à « cette compétence aide-t-elle ? ». Utilisez l’évaluation du harnais pour répondre à « cette combinaison de compétences, workflows, règles et instructions d’agent permet-elle à l’agent fixe d’accomplir les tâches du dépôt de manière plus fiable ? ».

## Modèle d’évaluation

Chaque tâche s’exécute comme une expérience appariée :

1. OMA copie la fixture de tâche dans un nouvel espace de travail de référence.
2. OMA copie les définitions actuelles `agents`, `config`, `rules`, `skills` et `workflows` dans cet espace de travail et les projette dans le format du fournisseur sélectionné.
3. OMA répète l’installation dans un second espace de travail neuf et y applique la superposition candidate.
4. Le même agent principal, la même route fournisseur, la même autorisation d’écriture et le même délai d’expiration sont utilisés pour les deux bras.
5. Des vérifications déterministes inspectent l’espace de travail produit et la sortie facultative de l’agent.

Le vrai projet n’est jamais utilisé comme répertoire de travail d’un bras. Les espaces de travail temporaires des bras sont supprimés après le scoring ; le bac à sable du processus propre au fournisseur sélectionné reste l’autorité pour les accès en dehors de ce répertoire de travail.

## Structure du candidat

Le chemin du candidat est un répertoire contenant une arborescence `.agents/` partielle :

```text
candidate/
└── .agents/
    ├── agents/
    │   └── docs-curator.md
    ├── rules/
    │   └── documentation.md
    ├── skills/
    │   └── project-docs/
    │       └── SKILL.md
    └── workflows/
        └── docs-check.md
```

Seuls les fichiers sous `.agents/agents`, `.agents/rules`, `.agents/skills` et `.agents/workflows` sont acceptés. Les hooks, fixtures de l’évaluateur, l’état, les résultats, les fichiers de configuration, les liens symboliques et les variantes d’agents fournisseurs sont rejetés. Les champs protégés du frontmatter d’agent, comme `model`, `tools`, `effort` et les limites d’exécution, doivent correspondre à la référence. Un bras échoue également si l’agent en cours modifie les définitions protégées de `.agents/` avant le scoring.

## Format de la suite

Une suite est constituée d’un fichier YAML et d’un répertoire de fixture par tâche :

```text
harness-eval/
├── suite.yaml
└── fixtures/
    ├── stale-api-doc/
    │   ├── docs/api.md
    │   └── src/session.ts
    └── missing-guide/
        ├── docs/
        └── src/feature.ts
```

```yaml
schema_version: 1
id: docs-harness
agent: docs-curator
tasks:
  - id: stale-api-doc
    prompt: Update the API documentation to match the implementation.
    workspace: fixtures/stale-api-doc
    weight: 1
    checks:
      - type: file_contains
        path: docs/api.md
        value: openSession
      - type: file_not_contains
        path: docs/api.md
        value: createSession
```

Les ID de tâches doivent être uniques. Les chemins de fixtures et de vérifications doivent rester dans le projet et l’espace de travail de la tâche. Les fixtures ne peuvent pas contenir de liens symboliques ni de surfaces de contrôle du harnais d’agent telles que `.agents`, `.codex`, `.claude`, des répertoires de compétences fournisseur ou des fichiers d’instructions d’agent à la racine. Cela empêche les données de tâche d’usurper l’identité du harnais contrôlé de l’un ou l’autre bras.

Les répertoires de dépendances générés tels que `node_modules` et `.venv` ne sont pas copiés depuis le harnais de référence. Validez la source de l’assistant déterministe et les manifestes de dépendances dans la compétence ; fournissez les dépendances d’exécution dans la fixture de tâche lorsqu’une vérification en a besoin.

### Types de vérification

| Type | Champs | Condition de réussite |
|:-----|:-------|:---------------|
| `file_exists` | `path` | Le chemin existe après la fin du bras. |
| `file_not_exists` | `path` | Le chemin n’existe pas. |
| `file_contains` | `path`, `value` | Le fichier existe et contient la valeur. |
| `file_not_contains` | `path`, `value` | Le fichier existe et ne contient pas la valeur. |
| `output_contains` | `value` | La sortie capturée de l’agent contient la valeur. |
| `output_not_contains` | `value` | La sortie capturée de l’agent ne contient pas la valeur. |

Les vérifications d’artefacts sont volontairement déterministes. La première version n’exécute pas de scripts de paquets mutables comme juges, car un agent évalué pourrait modifier ces scripts ou leurs tests et invalider l’évaluateur.

## Exécuter et enregistrer

Le mode live lance deux répartitions par tâche, affiche un aperçu du coût et demande une confirmation :

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --live --record
```

Pour une exécution réussie, le rapport contient les scores appariés de référence et de candidat, un lift, le nombre de régressions et une décision telle que `pass` ou `insufficient`. Si vous modifiez la suite, les définitions de référence, la superposition candidate, les invites, les fixtures ou les vérifications, enregistrez une nouvelle exécution live ; un ancien fichier `_runs` sera rejeté par son hachage.

Utilisez `--yes` pour une exécution non interactive et `--timeout-minutes` pour définir une limite de temps murale identique pour chaque bras. L’exécution live n’est disponible que lorsque le fournisseur sélectionné découvre les fichiers du harnais relativement à l’espace de travail du projet. OMA refuse la découverte fondée sur HOME, car la référence pourrait voir du contenu candidat installé globalement.

`--record` écrit un enregistrement JSON adressé par hachage sous `_runs/` à côté de la suite. L’enregistrement lie les résultats à trois entrées :

- la suite, les invites, les vérifications et le contenu des fixtures ;
- les définitions du harnais de référence courant ;
- le contenu de la superposition candidate.

Le mode mock est la valeur par défaut et n’effectue aucun appel de modèle. Il ne rejoue un enregistrement que si les trois hachages correspondent encore :

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --mock --require-coverage
```

## Métriques et porte de décision

Chaque tâche ne réussit que lorsque toutes ses vérifications réussissent. Les scores sont des moyennes pondérées sur les tâches appariées :

```text
lift = candidateScore - baselineScore
```

OMA signale également :

- tâches corrigées : la référence a échoué et le candidat a réussi ;
- tâches en régression : la référence a réussi et le candidat a échoué ;
- couverture : au moins cinq tâches appariées et évaluables sont requises.

Le candidat réussit lorsque le lift atteint au moins 5 points de pourcentage et qu’il n’y a aucune régression. Toute régression fait échouer le candidat. Un lift non négatif inférieur à 5 points déclenche un avertissement, et moins de cinq tâches appariées produit la décision `insufficient`. Ajoutez `--require-coverage` pour qu’une couverture insuffisante retourne un code non nul dans la CI. Un score ne constitue pas une preuve lorsqu’un bras manque, qu’un hachage d’enregistrement est obsolète ou qu’une vérification déterministe est incomplète.

## Limite actuelle

Il s’agit d’une base d’évaluation, pas d’une optimisation automatique du harnais. Un constructeur peut produire des superpositions candidates à l’extérieur, puis utiliser cette commande comme porte d’acceptation. Une suite finale cachée distincte, des essais stochastiques répétés, des runners de tests externes de confiance, la comptabilisation des tokens, l’épinglage forcé du modèle pour les appels de sous-agents imbriqués et une boucle automatique `harness opt` ne font pas partie de la commande actuelle. Tant que l’épinglage des appels imbriqués n’existe pas, les suites destinées à mesurer un modèle fixe doivent éviter les workflows candidats qui créent d’autres rôles d’agents configurés.
