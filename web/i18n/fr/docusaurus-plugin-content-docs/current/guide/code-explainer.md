---
title: "Guide : Explicateur de code"
sidebar_label: Explicateurs de code
description: Guide complet du workflow /explain et de la compétence oma-explanation d’oh-my-agent — transforme un diff, une PR, une branche ou une plage de commits en document HTML interactif autonome avec sections Background, Intuition, Code et Quiz, et couvre la résolution de référence, les niveaux de lecture, les garde-fous secrets, la checklist de validation et les cas limites.
---

# Explicateur de code

`/explain` transforme une modification de code en document HTML riche et autonome qui enseigne ce qui a changé et pourquoi — un contexte approfondi que les débutants peuvent ignorer, une section d’intuition centrale avec données jouets, une présentation du code ordonnée pour la compréhension et un quiz de cinq questions. La sortie est un fichier `.html` unique, utilisable hors ligne, avec diagrammes, encadrés et quiz accessible ; il est enregistré sous `.agents/results/explain/` et validé avec une checklist déterministe avant livraison.

`/explain` ne s’active qu’avec une commande slash — il ne s’active pas automatiquement en langage naturel. « explain » est un mot courant, il est donc volontairement exclu de la détection des mots-clés (même précédent que `/convert`). Dites explicitement `/explain` ou demandez à une autre compétence de produire un « document explicatif » comme sortie déléguée.

---

## Quand l’utiliser

- Expliquer une PR, une branche, une plage de commits ou la modification indexée/non indexée courante sous forme de document
- Intégrer un coéquipier à une modification qu’il n’a pas écrite
- Produire un artefact pédagogique révisable après l’arrivée d’une modification importante ou subtile

## Quand NE PAS l’utiliser

- *Vidéo* explicative narrée → utilisez [`oma-video`](/docs/guide/video-generation) (mode explainer) ; `/explain` produit un document HTML, pas une vidéo
- Vérifier que la documentation correspond toujours au codebase → utilisez `oma-docs` (détection de dérive)
- Présentation / diapositives → utilisez `oma-slide` (contrat de deck fixe en 1920×1080)
- Trouver des défauts ou rendre des verdicts de revue → utilisez `/review` / `code-review` ; `/explain` raconte une modification de façon pédagogique, il ne l’évalue pas

---

## Démarrage rapide

```text
/explain
/explain 640
/explain a1b2c3d..e5f6a7b
/explain payments-refactor for reviewer
```

La référence cible est résolue à partir de la formulation :

| Vous tapez | Résolution de la cible | Niveau de lecture |
|----------|--------------------|--------------|
| `/explain` | Modifications indexées (`git diff --cached`), avec repli vers l’arbre de travail modifié | `onboarding` |
| `/explain 640`, `/explain #640` | PR #640 via `gh pr diff` | `onboarding` |
| `/explain a..b` | Plage SHA `a..b` (ou `a...b`) | `onboarding` |
| `/explain feature-branch for reviewer` | `git diff main...feature-branch` | `reviewer` |

Si aucune référence explicite n’est fournie et que les arbres de travail indexé et modifié sont tous deux vides, la résolution revient à `HEAD~1..HEAD`.

---

## Ordre de résolution des références

1. **Argument explicite** — numéro de PR (`#640`), nom de branche ou plage SHA (`a..b` / `a...b`)
2. **Modifications indexées** — `git diff --cached`
3. **Arbre de travail modifié** — `git diff`
4. **Repli** — `HEAD~1..HEAD`

Un diff vide ou une référence impossible à résoudre arrête le workflow ; il propose les commits récents comme candidats au lieu de deviner une autre référence.

---

## Niveaux de lecture

| Niveau | Effet |
|-------|--------|
| `onboarding` (par défaut) | Contexte approfondi complet (niveau A), pour un lecteur qui ne connaît pas le système environnant |
| `reviewer` | Condense le niveau de contexte approfondi ; les sections Intuition et Code restent complètes |

Demandez `reviewer` en ajoutant « for reviewer » à la commande, comme dans `/explain feature-branch for reviewer`.

---

## Contenu du document

Chaque explicateur est une seule longue page déroulante (sans onglets ni navigation multipage) avec une table des matières suivie de quatre sections fixes, dans cet ordre :

1. **Background** — niveau A (contexte système/architecture approfondi, marqué « skippable if you already know the system ») et niveau B (contexte étroit pour cette modification précise)
2. **Intuition** — essence centrale de la modification avec exemples obligatoires sur données jouets, renforcée par 2 ou 3 familles de diagrammes réutilisées (maquette UI simplifiée, diagramme système/de flux portant les données d’exemple, état avant/après) rendues uniquement en HTML/SVG inline — pas d’art ASCII
3. **Code** — présentation organisée pour la compréhension humaine (ni ordre alphabétique ni ordre du diff), avec références au code sous la forme `file:line`
4. **Quiz** — 5 questions par défaut (paramétrables), chacune ciblant un aspect distinct de la modification, avec distracteurs plausibles et texte de retour pour chaque option (correcte ou incorrecte)

La prose et le contenu du quiz sont écrits dans la langue de sortie demandée (langue de l’invite → `.agents/oma-config.yaml` `language` → anglais) ; le code, les identifiants et le code inline restent en anglais selon les règles i18n. Le contrat complet du contenu se trouve dans `.agents/skills/oma-explanation/resources/document-structure.md`.

---

## Contrat HTML

Le fichier généré doit s’ouvrir correctement hors ligne via `file://` avec **zéro chargement de ressource externe** — pas de scripts/feuilles de style CDN, pas de polices web, pas d’images externes (SVG inline ou URI de données uniquement). Les ancres d’hyperliens (`<a href="https://...">`) sont autorisées ; l’interdiction ne concerne que le **chargement** de ressources.

- Les blocs de code utilisent `<pre>` ; tout conteneur personnalisé déclare `white-space: pre-wrap`. Aucune bibliothèque externe de coloration syntaxique.
- Pile de polices : `local()` Pretendard en premier (pour le CJK), puis les polices CJK système, puis `system-ui`.
- Adaptatif à partir de 375 px, contraste WCAG AA dans les thèmes clair et sombre, prise en charge de `prefers-color-scheme: dark` et respect de `prefers-reduced-motion`.
- Le quiz est en JavaScript vanilla : options comme éléments `<button>`, retour instantané correct/incorrect annoncé dans une région `aria-live="polite"`, réponses correctes réparties aléatoirement entre les positions, résumé du score final et navigation complète au clavier.

Spécification comportementale complète : `.agents/skills/oma-explanation/resources/html-contract.md`.

---

## Secrets et défense contre l’injection d’invite

Le contenu des diffs et les descriptions de PR sont traités strictement comme des **données** — toute instruction intégrée à la modification expliquée est ignorée.

Les secrets sont contrôlés deux fois :

1. **Avant génération :** le diff collecté est analysé avant toute rédaction.
2. **Après génération :** le HTML final est aussi analysé, car la prose de contexte peut citer des fichiers inchangés que le seul scan du diff manquerait.

À la moindre détection, la génération s’arrête immédiatement, seules les positions masquées sont signalées (jamais la valeur réelle) et la continuation expurgée exige une confirmation explicite.

---

## Checklist de validation

Après génération, une checklist fondée sur grep s’exécute sur le fichier de sortie : aucune référence chargeant une ressource externe, conformité des conteneurs de code `pre`/`pre-wrap`, présence du script de quiz, format de nom `{YYYY-MM-DD}-{slug}.html` (date en Asia/Seoul) et scan final des secrets HTML. En cas d’échec, la boucle corrige et revalide jusqu’à **3 itérations**, puis s’arrête et expose les éléments restants en échec au lieu de livrer silencieusement.

C’est une contrainte v1 : la validation est fondée sur des fichiers et grep et vérifie uniquement la **présence** du script de quiz (pas sa correction comportementale complète). Utilisez un navigateur (ou le MCP chrome-devtools) pour exercer manuellement le quiz lorsque la confiance comportementale est importante.

Vous pouvez valider un artefact existant avec la commande CLI enregistrée :

```bash
oma explain validate .agents/results/explain/2026-09-09-payment-refactor.html
oma explain validate --input-dir .agents/results/explain --output json
```

La première forme vérifie un seul fichier HTML. La forme répertoire vérifie chaque rapport d’un répertoire et renvoie un rapport lisible par machine. Utilisez `--report-file <path>` (l’ancienne forme est `--out-file`) pour conserver le rapport JSON. Une sortie non nulle signifie qu’au moins un artefact a échoué aux vérifications déterministes ; elle n’évalue pas l’exactitude pédagogique de la prose ou des réponses du quiz.

---

## Sortie

```
.agents/results/explain/{YYYY-MM-DD}-{slug}.html
```

La date est localisée en Asia/Seoul. Relancer la même date et le même slug écrase le fichier précédent — vous êtes responsable de conserver une exécution antérieure. Après réussite de la validation, le workflow tente `open <path>` (avertissement seulement ; un environnement sans interface ou sans `open` revient simplement au signalement du chemin) et signale un TL;DR ainsi que le chemin du fichier.

---

## Sidecar archify facultatif

Lorsque `diagram.explain_sidecar: true` est défini dans `oma-config.yaml` ou que vous le demandez (`/explain 640 with archify`), `/explain` dérive aussi un `{date}-{slug}.archify.html` interactif à partir du diagramme de flux principal de l’explicateur et le relie avec une ancre simple. Il n’est jamais intégré — l’explicateur reste un fichier unique autonome — et l’échec du sidecar ne bloque jamais la livraison. Voir [Moteur de diagrammes](/docs/guide/diagram-engine).

## Cas limites

| Situation | Comportement |
|-----------|----------|
| Diff vide / référence impossible à résoudre | Arrêter, proposer les commits récents comme candidats — ne jamais deviner une autre référence |
| Diff trop volumineux | Exclure automatiquement les fichiers lock/générés, regrouper le reste par fichier et lister les exclusions dans le pied de page de provenance |
| Diff uniquement binaire ou généré | Arrêter — rien à expliquer |
| CLI `gh` manquant ou non authentifié (référence PR) | Indications d’installation/authentification, avec alternative de diff de branche locale |
| Fusion/rebase en cours | Arrêter — arbre de travail instable |
| Répertoire non Git | Arrêter immédiatement |
| Échec de validation après 3 boucles de correction | Arrêter et exposer les éléments de checklist en échec |
| Échec de `open` / environnement sans interface | Avertissement seulement — le chemin signalé suffit |

---

## Voir aussi

- [Workflow `/explain`](/docs/core-concepts/workflows) — pipeline résolution de référence → collecte → porte de secrets → génération → validation → livraison
- [Génération vidéo](/docs/guide/video-generation) — le *mode* explainer de `oma-video` produit une vidéo narrée au lieu d’un document HTML
