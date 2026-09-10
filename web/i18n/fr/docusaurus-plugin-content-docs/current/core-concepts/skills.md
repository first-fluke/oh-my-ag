---
title: Compétences
description: Guide complet de l’architecture en deux couches des 33 skills d’OMA, du routage par SKILL.md, des ressources à la demande, des protocoles partagés et conditionnels, de l’exécution par fournisseur, des mesures de tokens et de la mécanique de routage.
---

# Compétences

Les skills sont des ensembles de connaissances structurés qui fournissent à un rôle de dispatch les indications de son domaine. Ils regroupent des protocoles d’exécution, des références de stack, des modèles de code, des guides de résolution d’erreurs, des listes de contrôle qualité et, lorsque le skill en fournit, des exemples. L’ensemble suit une architecture en deux couches conçue pour économiser des tokens.

---

## La conception en deux couches

### Couche 1 : SKILL.md (~2 631 tokens en médiane, chargée lorsque le skill est routé)

Chaque skill possède un fichier `SKILL.md` à sa racine. Il entre dans la fenêtre de contexte lorsque le routage sélectionne le skill : le hook d’injection transmet une **référence de chemin**, et non le contenu. Un skill non routé ne coûte donc rien au-delà de sa `description`. Le fichier contient :

- **Frontmatter YAML** avec `name` et `description` (utilisés pour le routage et l’affichage)
- **When to use / When NOT to use** : conditions d’activation explicites
- **Core rules** : les 5 à 15 contraintes les plus importantes du domaine
- **Architecture overview** : la structure attendue du code
- **Library list** : les dépendances approuvées et leur rôle
- **References** : les pointeurs vers les ressources de la couche 2 (jamais chargées automatiquement)

Exemple de frontmatter :

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

Le champ `description` est essentiel : il contient les mots-clés de routage utilisés par le système pour associer les tâches aux agents.

### Couche 2 : resources/ (chargée à la demande)

Le répertoire `resources/` contient les connaissances d’exécution détaillées. Ces fichiers ne sont chargés que lorsque :
1. l’hôte ou le workflow a sélectionné le skill (par exemple via une correspondance native ou une commande explicite) ;
2. la ressource est nécessaire au type et à la difficulté de la tâche.

Ce chargement à la demande est régi par le guide de chargement du contexte (`.agents/skills/_shared/core/context-loading.md`), qui associe les types de tâches aux ressources requises pour chaque agent.

---

## Exemple de structure de fichiers

```
.agents/skills/oma-frontend/
├── SKILL.md                          ← Layer 1: loaded when routed
└── resources/
    ├── execution-protocol.md         ← Layer 2: step-by-step workflow
    ├── tech-stack.md                 ← Layer 2: detailed technology specs
    ├── angular-rules.md              ← Layer 2: Angular-specific conventions
    ├── snippets.md                   ← Layer 2: copy-paste code patterns
    ├── error-playbook.md             ← Layer 2: error recovery procedures
    └── checklist.md                  ← Layer 2: quality verification checklist

.agents/skills/oma-backend/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── orm-reference.md              ← Domain-specific (ORM queries, N+1, transactions)
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Shipped language seeds / generated references
    ├── node/
    ├── python/
    └── rust/

.agents/skills/oma-mobile/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── tech-stack.md
│   ├── screen-template.dart
│   ├── screen-template.swift         ← Swift native iOS screen template
│   ├── screen-template.tsx            ← React Native screen template
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Stack schema and generated platform references
    ├── README.md
    └── stack.schema.json

.agents/skills/oma-design/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── anti-patterns.md
│   ├── checklist.md
│   ├── design-md-spec.md
│   ├── design-tokens.md
│   ├── prompt-enhancement.md
│   ├── stitch-integration.md
│   └── error-playbook.md
└── reference/                         ← Deep reference material
    ├── typography.md
    ├── color-and-contrast.md
    ├── spatial-design.md
    ├── motion-design.md
    ├── responsive-design.md
    ├── component-patterns.md
    ├── accessibility.md
    └── shader-and-3d.md
```

---

## Types de ressources par skill

| Type de ressource | Motif de nom de fichier | Rôle | Quand elle est chargée |
|-------------------|-------------------------|------|------------------------|
| **Execution Protocol** | `execution-protocol.md` | Workflow étape par étape : Analyze -> Plan -> Implement -> Verify | Toujours (avec SKILL.md) |
| **Tech Stack** | `tech-stack.md` | Spécifications techniques détaillées, versions, configuration | Tâches complexes |
| **Error Playbook** | `error-playbook.md` | Procédures de récupération avec escalade « 3 strikes » | En cas d’erreur seulement |
| **Checklist** | `checklist.md` | Vérification qualité propre au domaine | À l’étape Verify |
| **Snippets** | `snippets.md` | Motifs de code prêts à copier-coller | Tâches moyennes ou complexes |
| **Examples** | `examples.md` ou `examples/` | Exemples input/output pour le LLM | Tâches moyennes ou complexes |
| **Variants** | répertoire `variants/` | Références propres au langage/framework. Le backend fournit les seeds `node`, `python` et `rust` ; le mobile fournit un schéma et peut recevoir des références de plateforme générées. | Lorsqu’une stack correspondante existe |
| **Templates** | `component-template.tsx`, `screen-template.dart` | Modèles de code réutilisables | Lors de la création d’un composant |
| **Domain Reference** | `orm-reference.md`, `anti-patterns.md`, etc. | Connaissances approfondies pour des sous-tâches précises | Selon le type de tâche |

---

## Ressources partagées (_shared/)

Tous les agents partagent les fondations de `.agents/skills/_shared/`. Elles sont réparties en trois catégories.

### Ressources fondamentales (`.agents/skills/_shared/core/`)

| Ressource | Rôle | Quand elle est chargée |
|-----------|------|------------------------|
| **`skill-routing.md`** | Associe les mots-clés de tâche à l’agent approprié. Contient les tables de correspondance Skill-Agent, les motifs de routage complexe, les dépendances inter-agents, les règles d’escalade et le guide des limites de tours. | Référencée par les skills d’orchestration et de coordination |
| **`context-loading.md`** | Définit les ressources à charger pour chaque type et difficulté de tâche, ainsi que les déclencheurs des protocoles conditionnels. | Au début du workflow (Step 0 / Phase 0) |
| **`prompt-structure.md`** | Définit les quatre éléments de chaque prompt : Goal, Context, Constraints, Done When. Comprend des modèles pour PM, implémentation et QA, ainsi que les anti-patterns. | Référencée par l’agent PM et tous les workflows |
| **`clarification-protocol.md`** | Définit les niveaux d’incertitude LOW/MEDIUM/HIGH et les actions correspondantes. Contient les modèles d’escalade, les vérifications requises par agent et le comportement en mode sous-agent. | Lorsque les exigences sont ambiguës |
| **`context-budget.md`** | Gère le budget de tokens. Définit la stratégie de lecture (utiliser `find_symbol` plutôt que `read_file`), le coût mesuré des ressources et des chargements Simple (~4 000 tokens) et Complex (~9 000 tokens), le plafond de `SKILL.md` (25 000 caractères, contrôlé par `oma skill audit`), la gestion des gros fichiers et les symptômes de dépassement de contexte. | Au début du workflow |
| **`difficulty-guide.md`** | Donne les critères Simple/Medium/Complex, les tours attendus, les branches de protocole (Fast Track / Standard / Extended) et la récupération après une mauvaise estimation. | Au début de la tâche (Step 0) |
| **`quality-principles.md`** | Quatre principes de qualité universels appliqués à tous les agents. | Au début des workflows axés qualité (ultrawork) |
| **`vendor-detection.md`** | Protocole de détection du runtime (Claude Code, Codex CLI, Antigravity, Cursor, Kiro, Qwen et fallback CLI), avec marqueurs d’hôte et état du fournisseur configuré. | Au début du workflow |
| **`session-metrics.md`** | Scoring de la dette de clarification (CD) et suivi des métriques de session. Définit les événements (clarify +10, correct +25, redo +40), les seuils (CD >= 50 = RCA, CD >= 80 = pause) et les points d’intégration. | Pendant les sessions d’orchestration |
| **`common-checklist.md`** | Liste de contrôle qualité universelle appliquée à la vérification finale des tâches complexes, en plus de celle du domaine. | À l’étape Verify des tâches complexes |
| **`lessons-learned.md`** | Registre des apprentissages de sessions, généré après les dépassements de dette de clarification et les expériences abandonnées. Il comprend les leçons QA sur les angles morts des évaluateurs. | Après les erreurs et à la fin d’une session |
| **`api-contracts/`** | Répertoire du modèle de contrat d’API et des contrats générés. `template.md` définit le format par endpoint (méthode, chemin, schémas request/response, auth, erreurs). | Lorsqu’une tâche traverse des frontières |

### Ressources d’exécution (`.agents/skills/_shared/runtime/`)

| Ressource | Rôle |
|-----------|------|
| **`memory-protocol.md`** | Format et opérations des fichiers mémoire pour les sous-agents CLI. Définit les protocoles On Start, During Execution et On Completion, avec outils mémoire configurables et extension de suivi d’expériences. |
| **`execution-protocols/claude.md`** | Patterns d’exécution propres à Claude Code, injectés par `oma agent spawn` lorsque le fournisseur est claude. |
| **`execution-protocols/antigravity.md`** | Patterns d’exécution de l’Antigravity CLI (`agy`). |
| **`execution-protocols/codex.md`** | Patterns d’exécution du Codex CLI. |
| **`execution-protocols/commandcode.md`** | Patterns d’exécution de CommandCode. |
| **`execution-protocols/grok.md`** | Patterns d’exécution de Grok. |
| **`execution-protocols/kimi.md`** | Patterns d’exécution de Kimi Code. |
| **`execution-protocols/kiro.md`** | Patterns d’exécution de Kiro. |
| **`execution-protocols/opencode.md`** | Patterns d’exécution de l’extension OpenCode. |
| **`execution-protocols/pi.md`** | Patterns d’exécution de pi. |
| **`execution-protocols/qwen.md`** | Patterns d’exécution du Qwen CLI. |

Les protocoles propres aux fournisseurs sont injectés automatiquement pour les agents lancés par CLI avec `oma agent spawn`. Les sous-agents natifs utilisent les règles d’intégration du fournisseur sélectionné.

### Ressources conditionnelles (`.agents/skills/_shared/conditional/`)

Elles ne sont chargées que lorsque les conditions d’exécution correspondantes sont réunies :

| Ressource | Condition | Chargée par | Tokens approx. |
|-----------|-----------|-------------|----------------|
| **`quality-score.md`** | Le workflow entre en phase VERIFY ou SHIP et prend en charge la mesure qualité | Orchestrator (la transmet au prompt QA) | ~250 |
| **`experiment-ledger.md`** | Une première expérience est enregistrée après l’établissement d’un baseline IMPL | Orchestrator (inline, après mesure baseline) | ~250 |
| **`exploration-loop.md`** | La même porte échoue deux fois sur le même problème | Orchestrator (inline, avant les agents d’hypothèses) | ~250 |

Si les trois ressources sont chargées, l’impact est d’environ 750 tokens. Comme le chargement est conditionnel, les sessions courantes n’en chargent qu’une ou deux, ce qui reste faible face aux ~4 000 tokens déjà consommés par une tâche Simple avec `SKILL.md` et `execution-protocol.md`.

---

## Comment les skills sont routés via skill-routing.md

La carte de routage définit la manière dont les tâches sont associées aux agents.

### Routage simple (un seul domaine)

Un prompt contenant « Build a login form with Tailwind CSS » correspond aux mots-clés `UI`, `component`, `form` et `Tailwind`, puis est routé vers **oma-frontend**.

### Routage d’une demande complexe

Les demandes couvrant plusieurs domaines suivent des ordres d’exécution établis :

| Motif de demande | Ordre d’exécution |
|------------------|-------------------|
| « Create a fullstack app » | oma-pm -> (oma-backend + oma-frontend) parallel -> oma-qa |
| « Create a mobile app » | oma-pm -> (oma-backend + oma-mobile) parallel -> oma-qa |
| « Fix bug and review » | oma-debug -> oma-qa |
| « Design and build a landing page » | oma-design -> oma-frontend |
| « I have an idea for a feature » | oma-brainstorm -> oma-pm -> relevant agents -> oma-qa |
| « Do everything automatically » | oma-orchestration (internally: oma-pm -> agents -> oma-qa) |

### Règles de dépendance entre agents

**Peuvent s’exécuter en parallèle (aucune dépendance) :**
- oma-backend + oma-frontend (lorsqu’un contrat d’API est déjà défini)
- oma-backend + oma-mobile (lorsqu’un contrat d’API est déjà défini)
- oma-frontend + oma-mobile (indépendants l’un de l’autre)

**Doivent s’exécuter séquentiellement :**
- oma-brainstorm -> oma-pm (la conception précède la planification)
- oma-pm -> tous les autres agents (la planification vient d’abord)
- agent d’implémentation -> oma-qa (la revue suit l’implémentation)
- oma-backend -> oma-frontend/oma-mobile (sans contrat d’API prédéfini)

**La QA intervient toujours en dernier**, sauf lorsqu’une revue de fichiers précis est demandée.

---

## Calcul des économies de tokens {#token-savings-math}

Ces chiffres sont mesurés sur l’arbre des skills, et non estimés à la main. Vous pouvez les recalculer à tout moment :

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

Les nombres de tokens sont des **approximations** (octets ÷ 4, ratio approximatif pour le Markdown anglais). Les tableaux et les blocs de code sont un peu moins bien tokenisés, donc ces valeurs sont légèrement basses ; utilisez un vrai tokenizer pour le modèle cible si vous avez besoin de nombres exacts.

### Niveaux de chargement

Chaque niveau correspond à un état réellement atteint par un agent, selon [`context-loading.md`](https://github.com/first-fluke/oh-my-agent/blob/main/.agents/skills/_shared/core/context-loading.md) :

| Niveau | Contenu du contexte |
|--------|--------------------|
| `routed` | `SKILL.md` seul |
| `simple` | + `execution-protocol.md` |
| `medium` | + la ressource mappée pour la tâche, lorsqu’elle existe |
| `complex` | + la ressource mappée et les références de stack lorsque le projet les fournit |
| `all` | `SKILL.md` + tous les fichiers de ressources — le **plafond**, pas un mode sélectionnable |

Pour les skills backend et mobile, `/stack-set` peut générer des références propres au projet dans `stack/`. Un checkout neuf ne contient aucun répertoire de stack généré ; la ligne `complex` ci-dessous est donc mesurée à partir des seeds livrés dans `variants/`, dont la génération s’inspire : c’est un proxy de taille, pas un fichier déjà chargé par un agent.

### Une session de 5 agents (pm, backend, frontend, mobile, qa)

| Niveau | Tokens | Part du plafond | Économisés |
|--------|-------:|----------------:|-----------:|
| `routed` | 11,497 | 15.7% | 84.3% |
| `simple` | 17,923 | 24.4% | 75.6% |
| `medium` | 19,125 | 26.1% | 73.9% |
| `complex` | 39,156 | 53.4% | 46.6% |
| `all` | 73,355 | 100% | — |

Ainsi, une tâche Simple ou Medium menée par cinq agents ne conserve qu’environ **17–19 K tokens** de contexte de skills au lieu du plafond de 73 K, tandis qu’une tâche Complex en conserve environ **38 K**. L’économie est d’environ 74–76 % pour le travail courant et tombe à environ 47 % lorsqu’une tâche charge les références de stack. Avec un modèle doté d’un contexte de 128 K, il reste environ 110 K pour le travail Simple/Medium et 90 K pour le travail Complex.

:::note Lire `all` comme une limite, pas comme une option
Aucun runtime ne charge toutes les ressources au démarrage : les skills sont proposés par leur `description`, leur corps est lu lors du routage et les ressources sont lues selon les besoins. `all` est la borne supérieure de ce qu’un skill *pourrait* coûter. C’est pourquoi les pourcentages indiquent une part « économisée », et non une comparaison avec une configuration réelle.
:::

La couche 1 constitue le plancher, et il n’est pas petit : sur les 33 skills installés, `SKILL.md` représente environ 1 275–5 489 tokens (médiane ~2 631). Ce plancher limite les économies du chargement progressif ; avec les cinq agents routés, le seul niveau `routed` représente déjà 15 % du plafond.

---

## Chargement des ressources selon la difficulté de la tâche

Le guide de difficulté classe les tâches en trois niveaux, qui déterminent la quantité de couche 2 chargée.

### Simple (3–5 tours attendus)

Modification d’un seul fichier, exigences claires, répétition de motifs existants.

Charge uniquement `execution-protocol.md`. L’analyse est ignorée et l’implémentation commence directement avec une checklist minimale.

### Medium (8–15 tours attendus)

Modification de 2–3 fichiers, quelques décisions de conception, application de motifs à de nouveaux domaines.

Charge `execution-protocol.md` et la ressource Medium correspondante lorsqu’elle existe. Le protocole standard comprend une brève analyse et une vérification complète.

### Complex (15–25 tours attendus)

Modification de 4 fichiers ou plus, décisions d’architecture nécessaires, introduction de nouveaux motifs ou dépendances envers d’autres agents.

Charge `execution-protocol.md`, la ressource mappée et les références `tech-stack.md` / `snippets.md` disponibles. Le protocole étendu ajoute des points de contrôle, l’enregistrement de la progression en cours d’exécution et une vérification complète avec `common-checklist.md`.

---

## Cartes de chargement du contexte (par agent)

Le guide de chargement du contexte fournit les correspondances détaillées entre type de tâche et ressource. Voici les principales.

### Agent backend

| Type de tâche | Ressources requises |
|---------------|--------------------|
| Création d’une API CRUD | `variants/{node,python,rust}/snippets.md` correspondants lorsqu’ils existent |
| Authentification | `snippets.md` de la variante correspondante + `tech-stack.md` lorsqu’il existe |
| Migration de base | `snippets.md` de la variante correspondante lorsqu’il existe |
| Optimisation des performances | `orm-reference.md` et les exemples correspondants fournis par le skill |
| Modification d’un code existant | Fournisseur d’intelligence du code du projet et ressources d’exécution pertinentes |

### Agent frontend

| Type de tâche | Ressources requises |
|---------------|--------------------|
| Création d’un composant | snippets.md + motifs de composants existants du projet |
| Implémentation d’un formulaire | snippets.md (formulaire + Zod) |
| Intégration API | snippets.md (TanStack Query) |
| Styling | tailwind-rules.md |
| Mise en page | snippets.md (grid) |

### Agent design

| Type de tâche | Ressources requises |
|---------------|--------------------|
| Création d’un système de design | reference/typography.md + reference/color-and-contrast.md + reference/spatial-design.md + design-md-spec.md |
| Design d’une landing page | reference/component-patterns.md + reference/motion-design.md + prompt-enhancement.md |
| Audit design | checklist.md + anti-patterns.md |
| Export de tokens de design | design-tokens.md |
| Effets 3D / shaders | reference/shader-and-3d.md + reference/motion-design.md |
| Revue d’accessibilité | reference/accessibility.md + checklist.md |

### Agent QA

| Type de tâche | Ressources requises |
|---------------|--------------------|
| Revue de sécurité | checklist.md (section Security) |
| Revue de performance | checklist.md (section Performance) |
| Revue d’accessibilité | checklist.md (section Accessibility) |
| Audit complet | checklist.md (complet) + self-check.md |
| Scoring qualité | quality-score.md (conditionnel) |

---

## Composition du prompt de l’orchestrateur

Lorsque l’orchestrateur compose les prompts des sous-agents, il n’inclut que les ressources pertinentes pour la tâche :

1. La section Core Rules du `SKILL.md` de l’agent
2. `execution-protocol.md`
3. Les ressources correspondant au type de tâche (selon les cartes ci-dessus)
4. `error-playbook.md` (toujours inclus, car la récupération est essentielle)
5. Memory Protocol (mode CLI)

Cette composition ciblée évite de charger des ressources inutiles et maximise le contexte disponible pour le travail réel du sous-agent.

---

## Dette de clarification et métriques de session (approfondissement)

La dette de clarification (CD) mesure le coût des exigences floues pendant une session. L’orchestrateur suit chaque correction de l’utilisateur et lui attribue un score :

| Type d’événement | Points | Description |
|------------------|--------|-------------|
| `clarify` | +10 | Question de clarification simple (attendue avec une incertitude MEDIUM) |
| `correct` | +25 | Mauvaise compréhension de l’intention qui impose de changer de direction |
| `redo` | +40 | Violation du périmètre/charter qui impose un rollback et un redémarrage |
| `blocked` | +0 | L’agent s’est correctement arrêté pour demander (bon comportement, non pénalisé) |

**Modificateurs :** charter non lu (+15), violation de l’allowlist (+20), même erreur répétée (x1.5).

**Seuils et application :**
- **CD >= 50** → une entrée RCA obligatoire est ajoutée à `lessons-learned.md`
- **CD >= 80** → la session est arrêtée ; l’utilisateur doit préciser à nouveau les exigences
- **`redo` >= 2** → l’orchestrateur met en pause et demande une confirmation explicite du périmètre
- **CD >= 30 sur 3 sessions consécutives pour le même agent** → revue du modèle de prompt de l’agent

Le journal est conservé dans `.agents/state/memories/session-metrics.md`, avec une ligne par événement (tour, agent, type, points, détail) et une section de synthèse.

---

## Exactitude de l’évaluation et réglage de la QA

Les agents QA progressent grâce au suivi des erreurs de jugement. Contrairement à la CD, qui est en temps réel, l’exactitude de l’évaluateur (EA) est rétrospective : la plupart des erreurs sont découvertes après la fin de la session.

**Types d’événements EA :**

| Événement | Points | Découvert quand |
|-----------|--------|-----------------|
| `false_negative` | +30 | Session suivante ou production (bug manqué par la QA) |
| `false_positive` | +15 | Pendant la session (l’agent d’implémentation réfute avec succès le constat QA) |
| `severity_mismatch` | +10 | Pendant la session ou à la revue suivante (mauvaise sévérité) |
| `missed_stub` | +20 | La vérification runtime détecte une fonctionnalité réduite à son affichage |
| `good_catch` | -10 | La QA détecte un bug difficile à voir (signal positif) |

**L’EA est calculée sur une fenêtre glissante de 3 sessions.** Seuils :
- **EA >= 30** → réglage suggéré : examiner les événements EA accumulés et les erreurs de jugement récurrentes
- **EA >= 50** → réglage requis : mettre à jour `execution-protocol.md` de la QA
- **`false_negative` >= 3** sur la fenêtre → ajouter le motif de détection à `checklist.md` de la QA
- **`good_catch` >= 5** sur la fenêtre → généraliser le motif réussi dans `common-checklist.md`

Lorsqu’un seuil est franchi, examinez les événements EA accumulés, classez les erreurs, corrigez la checklist ou le protocole d’exécution de la QA, puis validez le changement sur les trois sessions suivantes.

---

## Décomposition en sprints pour les tâches complexes

Les tâches complexes (4 fichiers ou plus, décisions d’architecture) utilisent une exécution par sprints plutôt qu’un seul long run :

1. **Décomposer** en 2–4 sprints centrés sur une fonctionnalité, chacun testable séparément
2. **Viser** 5–8 tours par sprint
3. **Sprint Gate** après chaque sprint :
   - Le livrable du sprint est-il terminé ?
   - Lint/test passent-ils ?
   - Si le sprint prend 2 fois plus de tours que prévu, écrire un checkpoint et informer l’utilisateur
4. **Continuer** vers le sprint suivant si la porte passe

**Exemple :** la tâche « JWT auth + CRUD API + tests » se décompose ainsi :
- Sprint 1 : modèle User + endpoints d’authentification (register/login)
- Sprint 2 : endpoints CRUD + validation
- Sprint 3 : tests + gestion des erreurs

**Récupération après une mauvaise estimation :** si une tâche commencée en Simple se révèle plus complexe, l’agent passe au protocole Medium ou Complex pendant l’exécution et consigne le changement dans la progression.

---

## Protocole de réinitialisation du contexte

La qualité des agents qui durent se dégrade lorsque le contexte se remplit. L’orchestrateur, et non l’agent, surveille ce phénomène et déclenche les réinitialisations.

**Conditions de déclenchement (vérifiées par l’orchestrateur) :**

| Condition | Détection | Action |
|-----------|-----------|--------|
| Budget de tours épuisé | L’agent a consommé >= 80 % des tours prévus et les critères d’acceptation sont remplis à moins de 50 % | Réinitialisation du contexte |
| Progression bloquée | Aucun fichier de progression mis à jour pendant au moins 3 cycles de surveillance consécutifs | Réinitialisation du contexte |
| Sortie superficielle | Le fichier de résultat contient des marqueurs stub ou des placeholders TODO | Relancer avec une instruction explicite |

**Procédure de reset :**
1. **Checkpoint :** enregistrer l’état courant (éléments terminés, reste à faire, décisions clés)
2. **Terminer :** arrêter le run actuel
3. **Relancer :** démarrer un agent neuf avec le checkpoint comme contexte
4. **Reprendre :** le nouvel agent lit le checkpoint et ne traite que les éléments restants

Pour les agents autonomes (sans orchestrateur), le Sprint Gate de `difficulty-guide.md` sert de filet de sécurité. Si un sprint prend deux fois plus de temps que prévu, l’agent écrit un checkpoint et informe l’utilisateur.
