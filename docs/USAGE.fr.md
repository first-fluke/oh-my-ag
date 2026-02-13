# Comment utiliser les compétences multi-agents Antigravity

## Démarrage rapide

1. **Ouvrir dans Antigravity IDE**
   ```bash
   antigravity open /path/to/oh-my-ag
   ```

2. **Les compétences sont automatiquement détectées.** Antigravity analyse `.agent/skills/` et indexe toutes les compétences disponibles.

3. **Discutez dans l'IDE.** Décrivez ce que vous souhaitez construire.

---

## Exemples d'utilisation

### Exemple 1 : Tâche simple mono-domaine

**Vous tapez :**
```
"Créer un composant formulaire de connexion avec champs email et mot de passe utilisant Tailwind CSS"
```

**Ce qui se passe :**
- Antigravity détecte que cela correspond à `frontend-agent`
- La compétence se charge automatiquement (Divulgation progressive)
- Vous obtenez un composant React avec TypeScript, Tailwind, validation de formulaire

### Exemple 2 : Projet multi-domaine complexe

**Vous tapez :**
```
"Construire une application TODO avec authentification utilisateur"
```

**Ce qui se passe :**

1. **Workflow Guide s'active** — détecte la complexité multi-domaine
2. **PM Agent planifie** — crée décomposition des tâches avec priorités
3. **Vous générez agents via CLI** :
   ```bash
   oh-my-ag agent:spawn backend "API authentification JWT" session-01 &
   oh-my-ag agent:spawn frontend "UI connexion et TODO" session-01 &
   wait
   ```
4. **Les agents travaillent en parallèle** — enregistrent sorties dans Knowledge Base
5. **Vous coordonnez** — examinez `.gemini/antigravity/brain/` pour cohérence
6. **QA Agent examine** — audit sécurité/performance
7. **Corriger & itérer** — régénérer agents avec corrections

### Exemple 3 : Correction de bugs

**Vous tapez :**
```
"Il y a un bug — cliquer sur connexion affiche 'Cannot read property map of undefined'"
```

**Ce qui se passe :**

1. **debug-agent s'active** — analyse l'erreur
2. **Cause racine trouvée** — le composant mappe sur `todos` avant chargement données
3. **Correction fournie** — états de chargement et vérifications null ajoutés
4. **Test de régression écrit** — assure que le bug ne reviendra pas
5. **Modèles similaires trouvés** — corrige proactivement 3 autres composants

### Exemple 4 : Exécution parallèle basée CLI

```bash
# Agent unique (espace de travail auto-détecté)
oh-my-ag agent:spawn backend "Implémenter API auth JWT" session-01

# Agents parallèles
oh-my-ag agent:spawn backend "Implémenter API auth" session-01 &
oh-my-ag agent:spawn frontend "Créer formulaire connexion" session-01 &
oh-my-ag agent:spawn mobile "Construire écrans auth" session-01 &
wait
```

**Surveiller en temps réel :**
```bash
# Terminal (fenêtre terminal séparée)
bunx oh-my-ag dashboard

# Ou navigateur
bunx oh-my-ag dashboard:web
# → http://localhost:9847
```

---

## Tableaux de bord en temps réel

### Tableau de bord terminal

```bash
bunx oh-my-ag dashboard
```

Surveille `.serena/memories/` en utilisant `fswatch` (macOS) ou `inotifywait` (Linux). Affiche une table en direct avec statut session, états agents, tours et dernière activité. Se met à jour automatiquement quand fichiers mémoire changent.

**Exigences :**
- macOS : `brew install fswatch`
- Linux : `apt install inotify-tools`

### Tableau de bord web

```bash
npm install          # première fois seulement
bunx oh-my-ag dashboard:web
```

Ouvrez `http://localhost:9847` dans votre navigateur. Fonctionnalités :

- **Mises à jour en temps réel** via WebSocket (événementiel, pas polling)
- **Reconnexion automatique** si la connexion tombe
- **Interface thème Serena** avec couleurs d'accent violet
- **Statut session** — ID et état running/completed/failed
- **Table agents** — nom, statut (avec points colorés), nombre de tours, description tâche
- **Journal d'activité** — derniers changements depuis fichiers progress et result

Le serveur surveille `.serena/memories/` en utilisant chokidar avec debounce (100ms). Seuls les fichiers modifiés déclenchent lectures — pas de re-scan complet.

---

## Concepts clés

### Divulgation progressive
Antigravity fait automatiquement correspondre les demandes aux compétences. Vous ne sélectionnez jamais manuellement une compétence. Seule la compétence nécessaire se charge dans le contexte.

### Conception de compétence optimisée pour tokens
Chaque compétence utilise une architecture à deux couches pour efficacité maximale des tokens :
- **SKILL.md** (~40 lignes) : Identité, routage, règles de base — chargé immédiatement
- **resources/** : Protocoles d'exécution, exemples, listes de contrôle, playbooks d'erreurs — chargé à la demande

Les ressources partagées vivent dans `_shared/` (pas une compétence) et sont référencées par tous les agents :
- Protocoles d'exécution chaîne de pensée avec workflow en 4 étapes
- Exemples few-shot entrée/sortie pour guidance modèle niveau intermédiaire
- Playbooks de récupération d'erreur avec escalade "3 tentatives"
- Modèles de raisonnement pour analyse multi-étapes structurée
- Gestion budget contexte pour niveaux modèle Flash/Pro
- Vérification automatisée via `verify.sh`
- Accumulation leçons apprises entre sessions

### Génération d'agents CLI
Utilisez `oh-my-ag agent:spawn` pour exécuter agents via CLI. Respecte `agent_cli_mapping` dans `user-preferences.yaml` pour sélectionner le CLI approprié (gemini, claude, codex, qwen) par type d'agent. L'espace de travail est auto-détecté depuis conventions monorepo communes, ou peut être défini explicitement avec `-w`.

### Knowledge Base
Sorties agents stockées à `.gemini/antigravity/brain/`. Contient plans, code, rapports et notes de coordination.

### Serena Memory
État d'exécution structuré à `.serena/memories/`. L'orchestrator écrit infos session, tableaux tâches, progression par agent et résultats. Les tableaux de bord surveillent ces fichiers pour monitoring.

### Espaces de travail
Les agents peuvent travailler dans répertoires séparés pour éviter conflits. L'espace de travail est auto-détecté depuis conventions monorepo communes :
```
./apps/api   ou ./backend   → Espace de travail Backend Agent
./apps/web   ou ./frontend  → Espace de travail Frontend Agent
./apps/mobile ou ./mobile   → Espace de travail Mobile Agent
```

---

## Compétences disponibles

| Compétence | S'active automatiquement pour | Sortie |
|------------|------------------------------|--------|
| workflow-guide | Projets multi-domaine complexes | Coordination d'agents étape par étape |
| pm-agent | "planifier ceci", "décomposer" | `.agent/plan.json` |
| frontend-agent | UI, composants, style | Composants React, tests |
| backend-agent | APIs, bases de données, auth | Points terminaison API, modèles, tests |
| mobile-agent | Applications mobiles, iOS/Android | Écrans Flutter, gestion état |
| qa-agent | "vérifier sécurité", "audit" | Rapport QA avec corrections priorisées |
| debug-agent | Rapports bugs, messages erreur | Code corrigé, tests régression |
| orchestrator | Exécution sous-agents CLI | Résultats dans `.agent/results/` |
| commit | "commit", "enregistrer" | Commits Git (auto-divisés par fonctionnalité) |

---

## Commandes workflow

Tapez-les dans le chat Antigravity IDE pour déclencher workflows étape par étape :

| Commande | Description |
|----------|-------------|
| `/coordinate` | Orchestration multi-agents via CLI avec guidance étape par étape |
| `/orchestrate` | Exécution parallèle d'agents automatisée basée CLI |
| `/plan` | Décomposition tâches PM avec contrats API |
| `/review` | Pipeline QA complet (sécurité, performance, accessibilité, qualité code) |
| `/debug` | Correction bugs structurée (reproduire → diagnostiquer → corriger → test régression) |

Ces commandes sont séparées des **compétences** (qui s'activent automatiquement). Les workflows vous donnent contrôle explicite sur processus multi-étapes.

---

## Workflows typiques

### Workflow A : Compétence unique

```
Vous : "Créer un composant bouton"
  → Antigravity charge frontend-agent
  → Obtenir composant immédiatement
```

### Workflow B : Projet multi-agents (Auto)

```
Vous : "Construire une application TODO avec authentification"
  → workflow-guide s'active automatiquement
  → PM Agent crée plan
  → Vous générez agents via CLI (oh-my-ag agent:spawn)
  → Agents travaillent en parallèle
  → QA Agent examine
  → Corriger problèmes, itérer
```

### Workflow B-2 : Projet multi-agents (Explicite)

```
Vous : /coordinate
  → Workflow guidé étape par étape
  → Planification PM → revue plan → génération agents → monitoring → revue QA
```

### Workflow C : Correction bugs

```
Vous : "Bouton connexion lance TypeError"
  → debug-agent s'active
  → Analyse cause racine
  → Correction + test régression
  → Modèles similaires vérifiés
```

### Workflow D : Orchestration CLI avec tableau de bord

```
Terminal 1: bunx oh-my-ag dashboard:web
Terminal 2: oh-my-ag agent:spawn backend "tâche" session-01 &
            oh-my-ag agent:spawn frontend "tâche" session-01 &
Navigateur: http://localhost:9847 → statut temps réel
```

---

## Conseils

1. **Soyez spécifique** — "Construire une application TODO avec auth JWT, frontend React, backend FastAPI" est meilleur que "faire une app"
2. **Utilisez génération CLI** pour projets multi-domaine — n'essayez pas de tout faire dans une discussion
3. **Examinez Knowledge Base** — vérifiez `.gemini/antigravity/brain/` pour cohérence API
4. **Itérez avec régénérations** — affinez instructions, ne recommencez pas de zéro
5. **Utilisez tableaux de bord** — `bunx oh-my-ag dashboard` ou `bunx oh-my-ag dashboard:web` pour surveiller sessions orchestrator
6. **Espaces de travail séparés** — assignez à chaque agent son propre répertoire

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Compétences ne chargent pas | `antigravity open .`, vérifier `.agent/skills/`, redémarrer IDE |
| CLI introuvable | Vérifier `which gemini` / `which claude`, installer CLI manquants |
| Sorties agents incompatibles | Examiner les deux dans Knowledge Base, régénérer avec corrections |
| Tableau de bord : "No agents" | Fichiers mémoire pas encore créés, exécuter orchestrator d'abord |
| Tableau de bord web ne démarre pas | Exécuter `npm install` pour installer chokidar et ws |
| fswatch introuvable | macOS : `brew install fswatch`, Linux : `apt install inotify-tools` |
| Rapport QA a 50+ problèmes | Se concentrer sur CRITICAL/HIGH d'abord, documenter reste pour plus tard |

---

## Commandes CLI

```bash
bunx oh-my-ag                # Installateur compétences interactif
bunx oh-my-ag doctor         # Vérifier configuration & réparer compétences manquantes
bunx oh-my-ag doctor --json  # Sortie JSON pour CI/CD
bunx oh-my-ag update         # Mettre à jour compétences vers dernière version
bunx oh-my-ag stats          # Voir métriques productivité
bunx oh-my-ag stats --reset  # Réinitialiser métriques
bunx oh-my-ag retro          # Rétrospective session (apprentissages & prochaines étapes)
bunx oh-my-ag dashboard      # Tableau de bord terminal temps réel
bunx oh-my-ag dashboard:web  # Tableau de bord web (http://localhost:9847)
bunx oh-my-ag help           # Afficher aide
```

---

## Pour développeurs (Guide d'intégration)

Si vous souhaitez intégrer ces compétences dans votre projet Antigravity existant, voir [AGENT_GUIDE.md](../AGENT_GUIDE.md) pour :
- Intégration rapide en 3 étapes
- Intégration complète tableau de bord
- Personnalisation compétences pour votre stack technique
- Dépannage et bonnes pratiques

---

**Discutez simplement dans Antigravity IDE.** Pour monitoring, utilisez tableaux de bord. Pour exécution CLI, utilisez scripts orchestrator. Pour intégrer dans votre projet existant, voir [AGENT_GUIDE.md](../AGENT_GUIDE.md).
