---
title: "Guide : Évaluation de l’utilité des compétences"
sidebar_label: Évaluation des compétences
description: Comment écrire des fixtures de tâches d’évaluation pour oma skill eval, la convention du répertoire .agents/eval/, les types de vérificateurs et les modes d’exécution mock/live.
---

# Évaluation de l’utilité des compétences

`oma skill eval` mesure si le chargement d’une compétence améliore réellement les résultats des tâches d’un agent. Il répond à une question différente de `oma skill audit` (qui demande « deux compétences sont-elles redondantes ? ») : il demande « cette compétence aide-t-elle ? ».

La conception suit deux résultats de recherche : WikiSkill (arXiv:2608.27454) sépare l’expérience brute, les connaissances persistantes et les compétences exécutables tout en conservant des portes sur des données retenues pour l’évolution ; SkillLens (arXiv:2605.23899) montre que l’utilité d’une compétence est indépendante de la singularité de sa description — une compétence distincte peut rester inutile et une compétence qui se chevauche peut rester utile.

---

## Fonctionnement

Pour chaque fixture de tâche, la commande exécute deux bras :

1. **Bras de référence** — l’invite de tâche est envoyée à un agent sans la compétence.
2. **Bras de traitement** — `SKILL.md` est ajouté au début de l’invite, puis la même tâche est envoyée.

Chaque bras reçoit un score (0 = échec, 1 = réussite) par le vérificateur de la tâche. La métrique principale est :

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

Une compétence réussit lorsque `utilityLift ≥ 5%`. En dessous de ce seuil, elle reçoit un avertissement (gain marginal) ou échoue (aucun gain). Au moins 5 tâches évaluables sont requises pour rendre un verdict.

---

## Convention `.agents/eval/<skill>/`

Placez les fixtures de tâches sous `.agents/eval/<skill>/`. Ce chemin se trouve dans `.agents/` mais en dehors du répertoire de la compétence lui-même ; il survit donc à `oma update` sans écraser les évaluations écrites par l’utilisateur.

```
.agents/eval/
└── oma-scholar/
    ├── claims-only.yaml        ← task fixture
    ├── entity-lookup.yaml
    ├── partial-fetch.yaml
    ├── structured-output.yaml
    ├── edge-empty-response.yaml
    └── _rollouts/
        └── a3f1b2c4d5e6f7a8.json   ← recorded arm outputs + judge verdicts
```

Les fichiers dont le nom commence par `_` sont ignorés lors du chargement des fixtures de tâches. Le sous-répertoire `_rollouts/` contient les sorties enregistrées des exécutions `--live --record` précédentes.

---

## Schéma d’une fixture de tâche

Chaque fixture est un fichier YAML avec les champs suivants :

```yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
checker:
  type: judge
  rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

| Champ | Requis | Description |
|:------|:---------|:-----------|
| `id` | Oui | Identifiant unique de cette tâche (utilisé dans les noms de fichiers de rollout et les rapports) |
| `skill` | Oui | Compétence évaluée (correspond au nom du répertoire parent) |
| `domain` | Oui | Étiquette de domaine (utilisée pour le regroupement et la détection future du transfert négatif) |
| `prompt` | Oui | Invite de tâche envoyée aux deux bras |
| `checker` | Non | Méthode de scoring de la sortie du bras. Par défaut, `{ type: judge }` lorsqu’il est omis. |
| `weight` | Oui | Poids relatif pour la moyenne pondérée (utilisez `1` sauf si les tâches ont une importance différente) |

### Types de vérificateurs

#### judge (par défaut)

Un LLM évalue la sortie du bras selon une grille et renvoie PASS ou FAIL. C’est le comportement par défaut lorsque `checker` est omis ou lorsque `checker.type` est absent.

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

Le champ `rubric` est facultatif ; s’il est omis, la grille par défaut est utilisée : « Does the answer correctly and completely satisfy the task prompt? »

Vous pouvez aussi écrire la grille au niveau supérieur pour raccourcir la fixture :

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**Important :** en mode `--mock`, les tâches judge exigent un verdict précédemment enregistré dans `_rollouts/`. Si aucun verdict enregistré n’existe pour une tâche, celle-ci est exclue du rapport avec un avertissement. Lancez `--live --record` pour alimenter les rollouts en premier.

La même règle vaut pour tout type de vérificateur lorsqu’un bras manque entièrement : la tâche est exclue au lieu d’être notée 0. Une donnée absente n’est pas une réponse échouée — la noter ferait passer les deux bras à 0 et un lift nul se lirait comme `decision: "fail"`. Les exclusions qui font passer le nombre de tâches notées sous `MIN_TASKS` remontent `coverage: "insufficient"`.

#### assert (facultatif)

Vérification déterministe d’une sous-chaîne. À utiliser pour vérifier un contrat, un format ou un appel d’outil lorsque la sortie attendue est exacte.

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

La vérification réussit lorsque chaque chaîne de `expect_contains` est présente dans la sortie du bras.

#### regex (facultatif)

Correspondance d’une expression régulière déterministe. À utiliser lorsqu’un motif est nécessaire plutôt qu’une chaîne exacte.

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

Les motifs de plus de 200 caractères reçoivent le score 0 (mesure de protection temporaire contre ReDoS). La sortie est tronquée à 10 000 caractères avant la correspondance.

---

## Modes d’exécution

### --mock (par défaut)

Rejoue les rollouts enregistrés depuis `_rollouts/`. Le mode est entièrement déterministe et hors ligne : aucun LLM n’est appelé.

- Pour les vérificateurs `assert`/`regex` : les scores sont calculés à partir des chaînes de sortie enregistrées.
- Pour les vérificateurs `judge` : le champ `score` enregistré par `--live --record` est rejoué.

Si une tâche judge n’a aucun score enregistré dans `_rollouts/`, elle est exclue du rapport (avec un avertissement dans la console). Le mode mock reste ainsi strictement hors ligne.

Les enregistrements sont également vérifiés pour détecter l’obsolescence avant leur utilisation. Une entrée de traitement enregistrée sous un corps SKILL.md différent, une entrée dont la fixture `prompt` a changé et toute entrée antérieure au suivi de provenance sont supprimées avec un avertissement nommant le fichier et le nombre d’entrées. Lorsqu’il reste moins de `MIN_TASKS` tâches évaluables, l’exécution signale `coverage: "insufficient"` au lieu d’un verdict : une compétence modifiée ne réutilise jamais son score précédent.

:::note `oma skill optimize --mock`
L’optimiseur note les corps candidats de SKILL.md. Comme un enregistrement n’est valide que pour le corps qui l’a produit, les corps candidats n’ont aucun rollout correspondant et sont signalés comme non couverts. Utilisez `--live` pour noter les candidats.
:::

Ce mode est sûr pour la CI. Définissez `OMA_SKILLEVAL_MOCK=1` pour le forcer.

```bash
oma skill eval --skill oma-scholar
```

### --live

Crée de vrais bras d’agents via `oma agent spawn --read-only`. Les deux bras s’exécutent dans un espace de travail temporaire pour éviter de modifier les fichiers du projet.

Avant la répartition, la commande affiche un aperçu du coût indiquant le nombre de tâches, de répartitions de bras, de répartitions de juges et le fournisseur résolu. Confirmez avec `y` ou passez outre avec `--yes`.

Les autres contrôles sont utiles dans la CI et pour les analyses de couverture :

| Option | Effet |
| --- | --- |
| `--task-dir <path>` | Évalue les fixtures depuis un répertoire autre que `.agents/eval/<skill>`. |
| `--max-tasks <n>` | Limite le nombre de fixtures pour une exécution live bornée. |
| `--neg-transfer` | Échantillonne des voisins du même domaine pour rechercher un transfert négatif ; désactivé par défaut. |
| `--require-coverage` | Retourne un code non nul lorsqu’il reste moins de cinq tâches appariées évaluables. |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### Isolation de la compétence (garder la référence honnête) {#skill-isolation-keeping-the-baseline-honest}

`utilityLift` n’est pertinent que si le **bras de référence s’exécute sans la compétence cible**. Le piège est le suivant : un agent distribué charge automatiquement toutes les compétences installées dans son environnement d’exécution ; il récupérerait donc encore la compétence censée être mesurée *sans* elle, ce qui contaminerait la comparaison (référence ≈ traitement, lift ≈ 0).

Pour l’éviter, `--live` exécute **les deux bras dans un espace de travail temporaire isolé** dont le répertoire des compétences contient toutes les compétences installées **sauf la cible**. Le bras de traitement rajoute la cible **uniquement** via le `SKILL.md` injecté (ajouté au début de l’invite). L’injection est donc l’unique variable contrôlée : référence = sans compétence, traitement = `SKILL.md` candidat.

Cela fonctionne parce que la plupart des fournisseurs découvrent les compétences **relativement au répertoire de travail** (par exemple `<cwd>/.claude/skills`, `<cwd>/.codex/skills`) — un répertoire propre masque réellement la compétence. Le rapport déclare la qualité de l’isolation via un champ `isolation` :

| État | Signification |
|---|---|
| `enforced` | Fournisseur relatif au répertoire de travail, compétence cible absente du chemin HOME — isolation complète. |
| `best-effort` | Fournisseur relatif au répertoire de travail, mais une copie HOME de la compétence existe aussi (ou le fournisseur est inconnu) ; la copie du projet est masquée, mais une copie HOME peut encore fuiter. Confiance faible signalée. |
| `unavailable` | Fournisseur fondé sur HOME (par exemple **antigravity**, qui lit `~/.gemini/antigravity-cli/skills`) ; un répertoire de travail propre ne peut pas le masquer. Un avertissement est affiché et le résultat est signalé à faible confiance. |
| n/a | Mode mock — aucune répartition live. |

Lorsque l’isolation n’est pas `enforced`, un avertissement d’une ligne est affiché et le résultat doit être traité comme peu fiable. Pour un signal propre, lancez l’évaluation avec un fournisseur isolable et relatif au répertoire de travail (claude / codex / qwen) plutôt qu’avec un fournisseur fondé sur HOME — le fournisseur d’évaluation suit `model_preset` dans `.agents/oma-config.yaml` ; sélectionnez un préréglage dont le fournisseur par défaut est relatif au répertoire de travail.

### --live --record

Lance les bras live et écrit les sorties capturées (y compris les verdicts des juges pour les tâches vérifiées par judge) dans `_rollouts/<hash>.json`. Le nom de fichier est un hachage SHA-256 déterministe de l’ensemble des ID de tâches, et non une valeur fondée sur la date ou le hasard.

Utilisez cette option pour amorcer les exécutions `--mock` sur votre machine afin que les relances restent hors ligne.

Chaque entrée porte une provenance pour qu’une reprise ultérieure puisse déterminer si elle s’applique encore :

| Champ | Enregistré sur | Comparé à |
|---|---|---|
| `skillBodyHash` | `treatment` uniquement | le corps SKILL.md évalué |
| `promptHash` | les deux bras | le `prompt` courant de la fixture |

Le bras de référence ne reçoit pas la compétence, donc la modification de SKILL.md ne l’invalide pas — seul le bras de traitement est réenregistré.

:::caution `_rollouts/` est local uniquement — ne le commitez pas
Un enregistrement ne se rejoue que pour le corps SKILL.md exact qui l’a produit. Modifiez une compétence et ses enregistrements de traitement sont supprimés lors de la prochaine exécution `--mock` ; un enregistrement commité deviendrait obsolète à la prochaine modification de SKILL.md et afficherait des avertissements pour toute personne qui le récupère. Le répertoire est ignoré par Git ; enregistrez localement.
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

Après une exécution live réussie, le rapport contient les comptes de référence et de traitement, `utilityLift`, `coverage: "ok"`, l’état d’isolation et une décision pass/warn/fail. Une exécution mock ultérieure ne réutilise que les enregistrements dont les invites de tâche et le corps de compétence de traitement correspondent encore.

---

## Un jeu minimal de fixtures fonctionnel

Cinq fixtures sont requises pour un verdict (`MIN_TASKS = 5`). Voici un jeu minimal pour une compétence imaginaire `oma-scholar` :

```yaml
# .agents/eval/oma-scholar/claims-only.yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

```yaml
# .agents/eval/oma-scholar/entity-lookup.yaml
id: entity-lookup
skill: oma-scholar
domain: research
prompt: "Look up the entity knows:concept/attention-mechanism"
rubric: "Does the answer return the entity name, description, and at least one related concept?"
weight: 1
```

Répétez pour au moins trois tâches supplémentaires. Lancez ensuite :

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```

---

## Lire le rapport

**Sortie texte :**

```
Skill utility eval  (skill: oma-scholar)
  tasks: 7
  isolation: enforced [codex]

  baseline: 42.9%  treatment: 71.4%
  utilityLift: 28.6%  (stddev: 14.3%)
  [PASS]
  Skill shows positive utility lift >= 5%.

  Per-task findings:
    claims-only: baseline=0 treatment=1 lift=+1.000
    entity-lookup: baseline=1 treatment=1 lift=+0.000
    ...

  Thresholds: fail <= 0%, warn < 5%
```

**Sortie JSON** (via `--json`) :

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "taskCount": 7,
  "coverage": "ok",
  "decision": "pass",
  "baselineScore": 0.4286,
  "treatmentScore": 0.7143,
  "utilityLift": 0.2857,
  "utilityStdDev": 0.1429,
  "findings": [
    { "taskId": "claims-only", "baseline": 0, "treatment": 1, "lift": 1.0 }
  ],
  "negativeTransfer": [],
  "isolation": "enforced",
  "isolationVendor": "codex"
}
```

`ok` vaut `true` uniquement lorsque `coverage === "ok"` et `decision === "pass"`. Le champ `isolation` indique si le bras de référence a réellement été exécuté sans la compétence cible (voir [Isolation de la compétence](#skill-isolation-keeping-the-baseline-honest)) ; `isolation` vaut `"n/a"` en mode `--mock`.

---

## Intégration CI

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

Codes de sortie :
- `0` — réussite ou avertissement
- `1` — échec ou couverture insuffisante avec `--require-coverage`

---

## Choisir le mode live ou mock

Utilisez `--live` avec des vérificateurs judge pour mesurer l’utilité réelle sur des tâches ouvertes. Utilisez `--mock` pour rejouer hors ligne des verdicts judge enregistrés ou exécuter des vérifications de contrat déterministes `assert`/`regex`.

Le déterminisme mock est conservé en enregistrant le verdict binaire du juge (PASS/FAIL) dans l’entrée de rollout pendant `--live --record`, puis en rejouant ce score enregistré lors des exécutions `--mock` suivantes — aucun nouvel appel de LLM.

**Sortie des données :** pendant `--live`, la répartition du juge envoie la sortie du bras candidat au fournisseur configuré pour l’évaluation. Un avertissement unique est affiché au début de chaque exécution live.

Si une exécution mock signale une couverture insuffisante, examinez l’avertissement pour repérer les entrées `_rollouts` supprimées ou manquantes, puis lancez une passe d’enregistrement live après avoir corrigé la fixture ou la compétence. Si l’isolation vaut `best-effort` ou `unavailable`, choisissez un fournisseur relatif au répertoire de travail tel que Claude, Codex ou Qwen avant de considérer un lift comme un signal fort.

---

## Publier des tâches d’évaluation avec une compétence

Les compétences peuvent inclure un jeu de tâches d’évaluation en plaçant les fixtures dans `.agents/eval/<skill>/`. Ce sont des fichiers écrits par l’utilisateur en dehors du répertoire de la compétence ; ils survivent donc à `oma update`. Lors de la création d’une nouvelle compétence avec `oma-skill-creation`, ajoutez un jeu de fixtures `eval/` correspondant afin de donner aux futurs auteurs un moyen de vérifier l’effet de la compétence. Consultez `.agents/skills/oma-skill-creation/SKILL.md` pour le workflow d’écriture de compétences.
