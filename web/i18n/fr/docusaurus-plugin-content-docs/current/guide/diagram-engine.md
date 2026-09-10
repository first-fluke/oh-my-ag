---
title: "Guide : Moteur de diagrammes (archify)"
sidebar_label: Diagrammes
description: Comment oh-my-agent choisit entre Mermaid et la compétence agent facultative tt-a1i/archify pour les diagrammes d’architecture, de séquence et de flux de données — section de configuration des diagrammes, oma diagram resolve / oma diagram archify, utilisation par /architecture et /explain et boucle validate-repair-deliver sans plafond.
---

# Moteur de diagrammes

`/architecture` (ADR, recommandations, revues) et `/explain` (explicateurs de modifications de code) produisent tous deux des diagrammes structurels. Il s’agit toujours de blocs **Mermaid** dans l’artefact Markdown et — chaque fois qu’[archify](https://github.com/tt-a1i/archify) peut être résolu, ce qui est le cas normal — également d’un **diagramme HTML interactif et validé** à côté de l’artefact : thème sombre/clair, déplacement-zoom, recherche, traçage des relations, export PNG/SVG/WebM, rendu depuis une spécification JSON typée.

Mermaid ne disparaît jamais : c’est le SSOT textuel présent dans le Markdown et les diffs git. archify est un artefact dérivé.

---

## Archify toujours à jour — rien à installer

archify est une compétence d’agent sous licence MIT (Node ≥ 18, aucune dépendance d’exécution). oh-my-agent ne dépend pas d’une copie installée une fois pour toutes ; il conserve **sa propre copie gérée** et suit la dernière version :

- Cache : `~/.cache/oma-diagram/archify/<tag>/` avec un pointeur `state.json`.
- Avant chaque utilisation, `oma diagram resolve` demande à GitHub la dernière balise de version (vérification limitée à une fois par `check_interval_min`, 60 minutes par défaut), télécharge l’archive source lorsqu’une balise plus récente existe (répertoire par balise atomique ; les anciennes balises sont supprimées), et réutilise sinon la copie en cache.
- Les échecs réseau ne sont jamais fatals : la copie en cache est utilisée et signalée comme `stale` avec la raison. Seule une première exécution sans réseau et sans cache revient à une copie de compétence installée par l’utilisateur, puis à Mermaid.

```bash
# Illustrative output; the release tag, cache path, and quality can vary.
oma diagram update          # force a check / download now
oma diagram resolve
# engine:   archify  (requested: auto)
# reason:   archify 2.15.0 via managed:v2.15.0 (current)
# root:     /Users/you/.cache/oma-diagram/archify/v2.15.0
# quality:  showcase
oma diagram resolve --offline   # never touch the network
```

Ordre de résolution (le premier résultat l’emporte, identique dans tous les environnements fournisseur) :

1. `diagram.archify.path` dans `oma-config.yaml` — épinglage explicite, désactive le suivi automatique de la dernière version
2. Variable d’environnement `ARCHIFY_HOME` — épinglage explicite
3. **Dernière version gérée** (`~/.cache/oma-diagram/archify`)
4. Répertoires de compétences installées par l’utilisateur : projet `.agents` / `.claude` / `.codex` / `.cursor` / `.qwen` / `.kiro` `/skills/archify`, puis les mêmes sous `~`, puis `~/.raven/workspace/skills/archify`

<!-- oma-docs:ignore-start -->
Une installation archify gérée ou épinglée n’est retenue que si elle contient `bin/archify.mjs`.
<!-- oma-docs:ignore-end -->

---

## Configuration

Section sparse dans `.agents/oma-config.yaml` (les clés absentes utilisent les valeurs par défaut montrées) :

```yaml
diagram:
  engine: auto                # auto | archify | mermaid
  explain_sidecar: false      # /explain also writes an archify sidecar
  archify:
    managed: true             # false = never download; use pins / skill dirs only
    channel: stable           # stable (latest GitHub Release) | main (HEAD of main)
    check_interval_min: 60    # minutes between remote checks; 0 = every call
    path: null                # explicit install dir (pin)
    quality: showcase         # showcase | standard  → --quality
    open: false               # pass --open to deliver
```

| `engine` | Comportement |
|---|---|
| `auto` (par défaut) | archify chaque fois qu’il se résout (dernière version gérée, épingle ou répertoire de compétence), sinon Mermaid |
| `archify` | Exiger archify. `oma diagram resolve` se termine avec 1 lorsque rien ne se résout (première exécution hors ligne) ; les workflows s’arrêtent au lieu de rétrograder silencieusement |
| `mermaid` | Ne jamais appeler archify |

Une invite peut remplacer la configuration pour une exécution (`/explain 640 with archify`).

---

## CLI

```bash
oma diagram resolve [--engine auto|archify|mermaid] [--refresh] [--offline] [--json]
oma diagram update  [--json]
oma diagram archify <archify args…>
```

`oma diagram archify` exécute l’exécutable archify résolu avec `ARCHIFY_UPDATE_CHECK_DISABLED=1` (aucun réseau) et transmet le code de sortie, afin que `validate` / `deliver` / `visual-check` se comportent exactement comme le documente archify :

```bash
oma diagram archify guide "show the auth request lifecycle" --json
oma diagram archify validate architecture adr-auth.archify.json --quality showcase --json
oma diagram archify deliver  architecture adr-auth.archify.json adr-auth.archify.html --quality showcase --json
oma diagram archify visual-check adr-auth.archify.html --json   # exit 2 = no Chrome, reported as skipped
```

`--json` sur `resolve` renvoie `{ ok, requested, engine, quality, open, explainSidecar, archify?: { root, bin, version, source, status?, note? }, reason, probed }` — `source` vaut `managed:<tag>`, `config:…`, `env:…` ou un libellé de répertoire de compétence ; `status` (`fresh` / `current` / `stale`) et `note` sont définis pour les copies gérées.

---

## Utilisation par les workflows

Le protocole partagé se trouve dans `.agents/skills/_shared/conditional/diagram-engine.md`. Les deux workflows suivent la même séquence :

1. `oma diagram resolve --json`
2. Rédiger d’abord le bloc Mermaid (toujours).
3. Si `engine: archify` : traduire la topologie Mermaid en IR JSON d’archify (`architecture` / `sequence` / `dataflow` / `lifecycle` / `workflow`), en ne lisant que le schéma correspondant et un exemple de l’installation.
4. `validate` → réparer → `deliver`. **Il n’y a pas de plafond fixe d’itérations.** L’agent continue à réparer tant que le nombre d’erreurs objectif d’archify s’améliore et s’arrête uniquement selon la règle de convergence propre à archify (deux tours consécutifs sans amélioration). Les libellés sémantiques ne sont jamais supprimés uniquement pour réussir.
5. Lier le HTML — ne jamais l’intégrer.

### `/architecture`

Uniquement pour les décisions structurelles (frontières, dépendances, flux de données). Sortie à côté de l’artefact Markdown sous `.agents/results/architecture/` :

```
adr-notification-service.md            # Mermaid block + "Interactive:" link
adr-notification-service.archify.json  # frozen spec (kept even on failure)
adr-notification-service.archify.html  # delivered viewer
```

### `/explain`

Facultatif, car le contrat propre à l’explicateur (fichier unique autonome, thème par variables CSS) n’autorise pas l’intégration d’un second document HTML complet. Activez avec `diagram.explain_sidecar: true` ou demandez-le dans l’invite. Le sidecar `{date}-{slug}.archify.html` est dérivé du diagramme Système/Flux principal de l’explicateur et relié avec un `<a href>` simple ; un échec du sidecar ne bloque jamais l’explicateur.

---

## Modes d’échec

| Situation | Résultat |
|---|---|
| La vérification de mise à jour échoue (hors ligne, limitée par le débit) | La copie en cache est utilisée et signalée comme `stale` avec la raison |
| Pas de cache, pas de réseau, pas de répertoire de compétence, `engine: auto` | Mermaid uniquement ; le rapport indique de lancer `oma diagram update` une fois en ligne |
| Même situation, mais `engine: archify` | Le workflow s’arrête (`ok: false`) avec l’indication `oma diagram update` |
| `validate` ne converge jamais | Mermaid reste le diagramme livré ; le dernier `.archify.json` est laissé à une personne ; les diagnostics sont rapportés textuellement |
| Chrome absent pour `visual-check` | Signalé comme `skipped`, jamais comme une réussite |

---

## Voir aussi

- [Explicateur de code](/docs/guide/code-explainer) — workflow `/explain`
- [Sémantique de oma-config.yaml](/docs/guide/oma-config-semantics)
- Source archify : [tt-a1i/archify](https://github.com/tt-a1i/archify)
