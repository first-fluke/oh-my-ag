---
title: "Guide : Optimisation des compétences"
sidebar_label: Optimisation des compétences
description: Utiliser oma skill optimize pour faire évoluer durablement une compétence avec des preuves, un entraînement déterministe, une validation et des portes de test final détenues par le runner.
---

# Optimisation des compétences

`oma skill optimize` fait évoluer le `SKILL.md` d’une compétence pour maximiser son `utilityLift` mesuré par `oma skill eval`. Il sépare les preuves brutes de rollout, les connaissances persistantes limitées au périmètre et la compétence exécutable. Un Wiki Maintainer consolide les réussites et échecs observables ; un Proposer utilise ces connaissances pour produire des modifications bornées d’ajout, suppression ou remplacement. Les candidats doivent améliorer l’utilité de validation sur données retenues et `--apply` exige en plus une amélioration sur une partition de test final détenue par le runner. Lors du déploiement, aucune recherche wiki supplémentaire n’a lieu au moment de l’inférence : la sortie reste un `SKILL.md`.

Fondement de recherche : Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C. et Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## Dépendance obligatoire : fixtures de tâches d’évaluation

`oma skill optimize` ne peut pas s’exécuter sans fixtures de tâches d’évaluation. Il en faut au moins **5** (`MIN_TASKS = 5`) dans `.agents/eval/<skill>/`. Si le nombre trouvé est inférieur, la commande échoue immédiatement :

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

Consultez le [Guide d’évaluation de l’utilité des compétences](/docs/guide/skill-eval) pour la convention du répertoire `.agents/eval/<skill>/`, le schéma des fixtures, les types de vérificateurs et la préparation des rollouts pour le rejeu mock.

---

## Fonctionnement

Les fixtures sont triées par ID de tâche et réparties de façon déterministe entre les ensembles **train**, de **validation retenue** et de **test final détenu par le runner**. Avec au moins cinq fixtures, les proportions visées sont 60/20/20 et chaque partition contient au moins une tâche. Les tâches du test final proviennent de ce jeu de fixtures local ; elles sont tenues hors de portée du Maintainer et du Proposer pendant la boucle, et ne sont pas récupérées depuis une suite externe cachée.

Pour chaque époque (jusqu’à `--max-epochs`, 8 par défaut) :

1. **Noter le meilleur `SKILL.md` actuel sur la partition TRAIN** — `oma skill eval` renvoie les invites observables par tâche, les sorties et le lift.
2. **Le Wiki Maintainer consolide les preuves** — jusqu’à cinq échecs et trois réussites deviennent des motifs liés aux preuves. Les motifs limités au périmètre et les résultats des portes précédentes sont rappelés depuis le système de mémoire L1/L2/L3 d’OMA.
3. **Le Proposer produit K modifications candidates** (jusqu’à `--edits-per-epoch`, 4 par défaut). Les modifications exactes déjà présentes dans l’historique persistant des rejets sont ignorées.
4. **Pour chaque modification candidate :**
   - appliquer la modification à une copie en mémoire de `SKILL.md` ;
   - valider le candidat (le frontmatter `name`/`description` doit subsister ; le corps doit être analysable) ;
   - imposer le budget de taux d’apprentissage textuel : supprimer les modifications dont la variation nette de caractères dépasse `--lr` (600 caractères par défaut) ;
   - renoter le candidat sur la partition de **validation retenue**.
5. **Accepter le meilleur candidat de validation SI ET SEULEMENT SI** le lift de validation s’améliore strictement (`Δlift > 0`) **et** aucune entrée de transfert négatif ne franchit le plancher de régression (`NEG_TRANSFER_FAIL = -0.1`). Chaque porte de proposition est persistée.
6. **Arrêt anticipé** après 2 époques consécutives sans modification acceptée (`OPT_EARLY_STOP_PATIENCE = 2`).
7. **Exécuter le test final détenu par le runner après l’évolution.** Le Maintainer et le Proposer ne voient jamais ces tâches pendant la boucle. Un test final échoué empêche `--apply` et enregistre le gagnant de validation comme connaissance rejetée.

L’optimiseur ne modifie jamais le `SKILL.md` actif pendant la boucle : il travaille toujours sur une copie candidate en mémoire.

---

## Utilisation

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### Options

| Option | Valeur par défaut | Description |
|:-----|:--------|:-----------|
| `--skill <id>` | `_all` | ID de la compétence à optimiser (nom simple, sans séparateurs de chemin). |
| `--dry-run` | **oui (par défaut)** | Proposer des modifications et afficher le diff sans modifier `SKILL.md` ; les preuves générées et les événements d’évolution restent persistants. |
| `--apply` | — | Appliquer les modifications acceptées à `SKILL.md` — sauvegarde l’original avant une écriture atomique. Ne s’exécute que lorsque les portes de validation et de test final détenu par le runner réussissent ; une compétence détenue par OMA exige aussi `--yes`. |
| `--mock` | **oui (par défaut)** | Rejouer les modifications d’optimiseur et les verdicts d’évaluation enregistrés depuis `_rollouts/`. Déterministe et hors ligne. Sûr pour la CI. |
| `--live` | — | Répartition live de l’optimiseur LLM — entraîne de vrais appels de modèle à chaque époque. Affiche un aperçu du coût et demande une confirmation, sauf avec `--yes`. |
| `--max-epochs <n>` | `8` | Nombre maximal d’époques d’optimisation. |
| `--edits-per-epoch <k>` | `4` | Modifications candidates proposées par le LLM optimiseur à chaque époque. |
| `--lr <chars>` | `600` | Budget de taux d’apprentissage textuel : variation nette maximale de caractères par modification acceptée. |
| `--yes` | — | Passer la confirmation de l’aperçu du coût. Pertinent uniquement avec `--live`. |
| `--json` | — | Sortie JSON pour la CI/CD. |
| `--output <format>` | `text` | Format de sortie (`text` ou `json`). |

---

## Exemple minimal de bout en bout

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

Exemple de sortie :

```
[oma skill opt] skill: oma-scholar, tasks: 8 (train: 4, val: 4), dry-run: true

Skill opt  (skill: oma-scholar)
  applied: false
  baselineLift: 18.5%  finalLift: 32.0%
  epochs: 3  acceptedEdits: 2  rejected: 6

  diff:
--- a/SKILL.md
+++ b/SKILL.md
@@ -12,6 +12,9 @@
 ### When to use
 - User asks to look up an academic paper or technical claim.
+- User asks for a summary of arxiv abstracts or DOI-linked documents.
 - User wants citations or sources for a factual statement.
```

Le diff montre ce que l’optimiseur écrirait. `SKILL.md` reste inchangé, tandis que les preuves d’évolution générées et les résultats des portes limités au périmètre sont conservés pour les exécutions futures.

---

## Appliquer une amélioration validée

Lorsque le diff proposé vous convient, relancez avec `--apply` :

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

`--apply` n’écrit que lorsque l’optimisation a trouvé une amélioration strictement positive sur la validation et que le lift du candidat au test final détenu par le runner est supérieur à son lift de référence. Une sauvegarde du `SKILL.md` original est créée avant l’écriture atomique. Le diff est toujours affiché afin que vous puissiez examiner les changements.

---

## Mode live

Le mode live appelle le Maintainer et le Proposer réels et relance des bras d’évaluation live à chaque époque. Il est coûteux : chaque tâche notée entraîne des appels de référence et de traitement, les fixtures judge ajoutent des appels de notation et le test final note les corps original et candidat. L’aperçu indique une borne supérieure des appels de modèle sous-jacents calculée à partir de la partition réelle. Chaque appel a un délai de 120 secondes ; les bras d’évaluation Claude s’exécutent avec les outils, compétences, MCP et AgentMemory ambiants désactivés.

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

L’aperçu du coût liste la borne supérieure des appels de modèle sous-jacents avant tout appel LLM.

---

## Sortie JSON

```bash
oma skill optimize --skill oma-scholar --json
```

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "baselineLift": 0.1850,
  "finalLift": 0.3200,
  "epochCount": 3,
  "acceptedEdits": [
    { "op": "add", "anchor": "### When to use", "after": "\n- User asks for a summary of arxiv abstracts or DOI-linked documents." }
  ],
  "rejectedCount": 6,
  "applied": false,
  "diff": "--- a/SKILL.md\n+++ b/SKILL.md\n...",
  "_dryRun": true,
  "finalTest": { "baselineLift": 0.10, "candidateLift": 0.25, "passed": true },
  "_split": { "trainCount": 4, "valCount": 1, "testCount": 3 }
}
```

`ok` vaut `true` uniquement lorsque le candidat améliore la validation et que le test final détenu par le runner n’échoue pas (ou que le candidat a été appliqué). Les comptes `_split` affichent la partition de fixtures locale réellement utilisée pour l’exécution.

---

## Réserve SSOT pour les compétences `oma-*`

Les compétences dont l’ID commence par `oma-` appartiennent à oh-my-agent et sont **écrasées par `oma update`**. Pour ces compétences, `--apply` est déconseillé — utilisez `--dry-run` (la valeur par défaut), examinez le diff proposé et envoyez les modifications au registre si l’amélioration est significative. Pour les compétences écrites par l’utilisateur, `--apply` est sûr.

La commande affiche un avertissement lorsque la compétence cible appartient à OMA :

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

---

## Protection contre le surapprentissage

Le Maintainer et le Proposer ne voient que les preuves de rollout TRAIN. La sélection du candidat utilise la partition VALIDATION retenue, tandis que la partition TEST détenue par le runner reste indisponible jusqu’à la fin de l’évolution. Un gagnant de validation qui n’améliore pas le test final n’est pas appliqué et est ajouté à l’historique persistant des rejets.

---

## Intégration CI

En mode `--mock`, `oma skill optimize` est entièrement déterministe et hors ligne — aucun LLM n’est appelé. Utilisez-le dans la CI pour vérifier qu’un diff de compétence proposé conserve un lift par rapport aux rollouts enregistrés :

```bash
oma skill optimize --skill oma-scholar --mock --json
```

Codes de sortie :
- `0` — optimisation terminée (avec ou sans amélioration)
- `1` — moins de `MIN_TASKS` fixtures ou argument `--skill` invalide

---

## Voir aussi

- [Évaluation de l’utilité des compétences](/docs/guide/skill-eval) — écriture des fixtures de tâches, types de vérificateurs, modes mock/live et répertoire `_rollouts/`.
- [Commandes CLI](/docs/cli-interfaces/commands) — référence des options pour toutes les commandes de gestion des compétences.
