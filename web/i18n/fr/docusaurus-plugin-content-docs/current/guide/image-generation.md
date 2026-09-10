---
title: "Guide : génération d'images"
sidebar_label: Génération d'images
description: Guide complet de la génération d'images oh-my-agent, avec dispatch multi-fournisseurs via Codex (gpt-image-2), Pollinations (flux/zimage, gratuit) et Antigravity via Gemini Code Assist, images de référence, garde-fous de coût, organisation des sorties, dépannage et modes d'invocation partagés.
---

# Génération d'images

`oma-image` est le routeur d'images multi-fournisseurs d'oh-my-agent. Il génère des images à partir de prompts en langage naturel, les envoie au CLI du fournisseur auprès duquel vous êtes authentifié et écrit un manifeste à côté de la sortie avec les entrées et les décisions du fournisseur nécessaires pour auditer ou reproduire l'exécution. La sortie réelle du fournisseur peut varier.

La compétence s'active automatiquement avec des mots-clés comme *image*, *illustration*, *visual asset* ou *concept art*, ou lorsqu'une autre compétence a besoin d'une image comme effet secondaire (visuel principal, miniature, photo de produit).

---

## Quand l'utiliser

- Générer des images, illustrations, photos de produits, concept arts ou visuels principaux de landing page ;
- comparer le même prompt entre plusieurs modèles côte à côte (`--vendor all`) ;
- produire des ressources depuis un workflow d'éditeur (Claude Code, Codex, Gemini CLI) ;
- permettre à une autre compétence (design, marketing, docs) d'appeler le pipeline d'images comme infrastructure partagée.

## Quand NE PAS l'utiliser

- Modifier ou retoucher une image existante (hors périmètre ; utilisez un outil dédié) ;
- générer une vidéo ou de l'audio (hors périmètre) ;
- composer un SVG inline ou un vecteur à partir de données structurées (utilisez une compétence de templating) ;
- redimensionner ou convertir simplement un format (utilisez une bibliothèque d'images, pas un pipeline de génération).

---

## Fournisseurs en un coup d'œil

La compétence privilégie le CLI : lorsqu'un CLI natif peut renvoyer des octets d'image bruts, le chemin subprocess est préféré à une clé API directe.

| Fournisseur | Stratégie | Modèles | Déclencheur | Coût |
|---|---|---|---|---|
| `pollinations` | HTTP direct | Gratuit : `flux`, `zimage`. Avec crédits : `qwen-image`, `wan-image`, `gpt-image-2`, `klein`, `kontext`, `gptimage`, `gptimage-large` | `POLLINATIONS_API_KEY` défini (inscription gratuite sur https://enter.pollinations.ai) | Gratuit pour `flux` / `zimage` |
| `codex` | Via le CLI en priorité avec `codex exec` (OAuth ChatGPT) | `gpt-image-2` | `codex login` (aucune clé API nécessaire) | Facturé sur votre forfait ChatGPT |
| `antigravity` | CLI `agy` via l'abonnement Gemini Code Assist | Le modèle est choisi en interne par `agy` | `agy` installé et connecté | Aucun coût par image via Code Assist |

Le mode fournisseur intégré est `auto` : il exécute les fournisseurs qui passent leurs vérifications de santé. Les modèles `flux` et `zimage` de Pollinations sont gratuits par image, mais nécessitent tout de même une `POLLINATIONS_API_KEY` ; Codex et Antigravity exigent leur propre connexion. Les estimations payantes utilisent toujours le garde-fou de confirmation du coût.

---

## Démarrage rapide

Avant la première génération, vérifiez quel fournisseur est prêt et authentifiez l'un des chemins pris en charge :

```bash
oma image doctor

# Pollinations: create a free account and export its key.
export POLLINATIONS_API_KEY="<pollinations-key>"

# Or authenticate an alternative provider instead.
codex login
# Sign in to Gemini Code Assist for `agy` when using --vendor antigravity.
```

```bash
# Auto-selects the healthy provider; cost and auth depend on that provider.
oma image generate "minimalist sunrise over mountains"

# Run all configured vendors; every selected vendor must be healthy or the command stops.
oma image generate "cat astronaut" --vendor all

# Specific vendor + size + count, skip cost prompt
oma image generate "logo concept" --vendor codex --size 1024x1024 -n 3 -y

# Cost estimate without spending
oma image generate "test prompt" --dry-run

# Inspect authentication and install status per vendor
oma image doctor

# List registered vendors and supported models
oma image vendor list
```

`oma img` est un alias de `oma image`.

---

## Utiliser comme compétence

`oma-image` s'active automatiquement depuis le langage naturel et peut aussi être invoqué explicitement. Il possède trois points d'entrée.

### 1. Langage naturel (activation automatique)

Dans Claude Code, Codex CLI ou Gemini CLI, décrivez simplement l'image. La compétence reconnaît des mots-clés comme *image*, *illustration*, *visual asset*, *concept art*, *hero shot*, *thumbnail* ou *product photo*.

Vous n'avez pas besoin de retenir les flags du CLI. Décrivez votre besoin en langage courant et la compétence le traduit en options :

| Vous dites | La compétence en déduit |
|---|---|
| « utilise codex » / « avec gpt-image-2 » / « flux gratuit » | `--vendor codex` / `--vendor pollinations` |
| « compare les fournisseurs » / « côte à côte » | `--vendor all` |
| « portrait » / « paysage » / « 1024×1536 » | `--size 1024x1536` / `--size 1536x1024` |
| « haute qualité » / « brouillon » | `--quality high` / `--quality low` |
| « trois variantes » / « donne-m'en 3 » | `-n 3` |
| « enregistre dans ./hero » / « sortie dans docs/assets » | `--output-dir <dir>` |
| Image jointe + « rends-la nocturne » | `-r <attached path>` |
| « estime seulement le coût » / « exécution à blanc » | `--dry-run` |

Exemples :

> « Génère un lever de soleil minimaliste sur des montagnes pour le visuel principal de la landing page, au format paysage et en haute qualité. »
> « Compare une photo de produit d'une tasse en céramique chez tous les fournisseurs, avec trois variantes pour chacun. »
> « Utilise codex pour rendre cette photo de loutre dramatique et nocturne. » (avec une référence jointe)

L'agent applique le [protocole de clarification](#clarification-protocol), enrichit le prompt si nécessaire et appelle `oma image generate` avec les flags déduits. Utilisez la commande slash lorsque vous voulez contrôler explicitement les valeurs exactes des flags.

### 2. Commande slash explicite

```text
/oma-image a red apple on white background
/oma-image --vendor all --size 1536x1024 jeju coastline at sunset
/oma-image -n 3 --quality high --output-dir ./hero "minimalist dashboard hero illustration"
```

Tous les flags CLI (`--vendor`, `-n`, `--size`, `-r`, `--dry-run`, …) fonctionnent dans la commande slash et sont transmis au même pipeline `oma image generate`.

### 3. Depuis une autre compétence (infrastructure partagée)

Les autres compétences (design, marketing, docs) appellent le pipeline comme infrastructure partagée avec une sortie JSON :

```bash
oma image generate "<prompt>" --output json
```

Le manifeste écrit sur stdout comprend les chemins de sortie, le fournisseur, le modèle et le coût ; il est donc facile à analyser et à chaîner.

---

## Référence CLI

```bash
oma image generate "<prompt>"
  [--vendor auto|codex|pollinations|antigravity|all]
  [-n 1..5]
  [--size 1024x1024|1024x1536|1536x1024|auto]
  [--quality low|medium|high|auto]
  [--output-dir <dir>] [--allow-external-output]
  [-r <path>]...
  [--timeout 180] [-y] [--no-prompt-in-manifest]
  [--dry-run] [--output text|json]

oma image doctor
oma image vendor list
```

### Flags clés

| Flag | Rôle |
|---|---|
| `--vendor <name>` | `auto`, `pollinations`, `codex`, `antigravity` ou `all`. Avec `all`, chaque fournisseur demandé doit être sain (mode strict). |
| `-n, --count <n>` | Nombre d'images par fournisseur, de 1 à 5 (limite de temps réel). |
| `--size <size>` | Format : `1024x1024` (carré), `1024x1536` (portrait), `1536x1024` (paysage) ou `auto`. |
| `--quality <level>` | `low`, `medium`, `high` ou `auto` (valeur par défaut du fournisseur). |
| `--output-dir <dir>` | Répertoire de sortie. Par défaut : `.agents/results/images/{timestamp}/`. Les chemins hors de `$PWD` nécessitent `--allow-external-output`. |
| `--allow-external-output` | Autorise un répertoire de sortie situé hors de `$PWD`. |
| `--model <name>` | Remplace le modèle sélectionné du fournisseur pour cette exécution. `antigravity` ignore ce flag car `agy` choisit son modèle. |
| `-r, --reference <path>` | Jusqu'à 10 images de référence (PNG/JPEG/GIF/WebP, ≤ 5 Mo chacune). Répétable ou séparé par des virgules. Pris en charge par `codex` et `antigravity` ; rejeté par `pollinations`. |
| `-y, --yes` | Ignore la confirmation de coût pour les exécutions estimées à ≥ `$0.20`. Également disponible via `OMA_IMAGE_YES=1`. |
| `--no-prompt-in-manifest` | Stocke le SHA-256 du prompt au lieu du texte brut dans `manifest.json`. |
| `--dry-run` | Affiche le plan et l'estimation de coût sans dépenser. |
| `--output text\|json` | Format de sortie du CLI. JSON est la surface d'intégration pour les autres compétences. |
| `--timeout <duration>` | Délai d'attente par image. |

---

## Images de référence

Joignez jusqu'à 10 images de référence pour guider le style, l'identité du sujet ou la composition.

```bash
oma image generate -r ~/Downloads/otter.jpeg "same otter in dramatic lighting" --vendor codex
oma image generate -r a.png -r b.png "blend these styles" --vendor antigravity
oma image generate -r a.png,b.png "blend these styles" --vendor antigravity
```

| Fournisseur | Prise en charge des références | Méthode |
|---|---|---|
| `codex` (gpt-image-2) | Oui | Passe `-i <path>` à `codex exec` |
| `antigravity` | Oui | Copie les références dans un répertoire propre à l'exécution et en donne l'accès à `agy` |
| `pollinations` | Non | Rejeté avec le code de sortie 4 (nécessite un hébergement par URL) |

### Où se trouvent les images jointes

- **Claude Code :** `~/.claude/image-cache/<session>/N.png`, exposé dans les messages système sous la forme `[Image: source: <path>]`. Le chemin est limité à la session ; copiez l'image dans un emplacement durable si vous voulez la réutiliser.
- **Antigravity :** répertoire d'upload du workspace (l'IDE affiche le chemin exact).
- **Codex CLI comme hôte :** doit être transmis explicitement ; les pièces jointes de la conversation ne sont pas transmises.

Lorsqu'un utilisateur joint une image et demande d'en générer ou d'en modifier une à partir de celle-ci, l'agent appelant **doit** la transmettre via `--reference <path>` au lieu de la décrire en prose. Si le CLI local est trop ancien pour prendre en charge `--reference`, exécutez `oma update` puis réessayez.

---

## Structure de sortie

Chaque exécution écrit dans `.agents/results/images/` un répertoire horodaté avec suffixe de hash :

```
.agents/results/images/
├── 20260424-143052-ab12cd/                 # single-vendor run
│   ├── pollinations-flux.jpg
│   └── manifest.json
└── 20260424-143122-7z9kqw-compare/         # --vendor all run
    ├── codex-gpt-image-2.png
    ├── pollinations-flux.jpg
    └── manifest.json
```

`manifest.json` enregistre le fournisseur, le modèle, le prompt (ou son SHA-256), la taille, la qualité et le coût, afin que la demande puisse être auditée et reproduite. Il ne garantit pas des pixels identiques avec un fournisseur en production.

---

## Coût, sécurité et annulation

1. **Garde-fou de coût :** les exécutions estimées à ≥ `$0.20` demandent une confirmation. Contournez-la avec `-y` ou `OMA_IMAGE_YES=1`. Le fournisseur `pollinations` par défaut (flux/zimage) est gratuit, donc l'invite est automatiquement ignorée pour lui.
2. **Sécurité des chemins :** les chemins de sortie hors de `$PWD` nécessitent `--allow-external-output` pour éviter les écritures inattendues.
3. **Annulable :** `Ctrl+C` (SIGINT/SIGTERM) annule tous les appels de fournisseurs en cours et l'orchestrateur.
4. **Trace stable :** `manifest.json` est toujours écrit à côté des images.
5. **`n` maximal = 5 :** il s'agit d'une limite de temps réel, pas d'un quota.
6. **Codes de sortie :** alignés sur `oma search fetch` : `0` ok, `1` général, `2` sécurité, `3` introuvable, `4` entrée invalide, `5` authentification requise, `6` délai dépassé.

---

## Protocole de clarification {#clarification-protocol}

Avant d'invoquer `oma image generate`, l'agent appelant exécute cette liste de contrôle. Si une information manque et ne peut pas être déduite, il la demande ou enrichit le prompt, puis montre l'expansion pour approbation.

**Requis :**

- **Sujet :** quelle est la chose principale de l'image ? (objet, personne, scène)
- **Cadre / arrière-plan :** où se trouve-t-elle ?

**Fortement recommandé (à demander si absent et non déductible) :**

- **Style :** photoréaliste, illustration, rendu 3D, peinture à l'huile, concept art, vecteur plat ?
- **Ambiance / éclairage :** clair ou sombre, chaud ou froid, dramatique ou minimal ?
- **Contexte d'utilisation :** image principale, icône, miniature, photo de produit, affiche ?
- **Format :** carré, portrait ou paysage ?

Pour un prompt court comme *« une pomme rouge »*, l'agent **ne pose pas** de questions complémentaires. Il l'enrichit directement et montre à l'utilisateur :

> Utilisateur : « une pomme rouge »
> Agent : « Je vais la générer ainsi : *une seule pomme rouge brillante centrée sur un arrière-plan blanc épuré, éclairage studio doux, rendu photoréaliste, faible profondeur de champ, 1024×1024*. Voulez-vous que je continue, ou préférez-vous un autre style ou une autre composition ? »

Lorsque l'utilisateur a rédigé un brief créatif complet (au moins 2 éléments parmi sujet + style + éclairage + composition), son prompt est respecté mot pour mot, sans clarification ni enrichissement.

**Langue de sortie.** Les prompts de génération sont envoyés au fournisseur en anglais (les modèles d'image sont principalement entraînés sur des légendes anglaises). Si l'utilisateur écrit dans une autre langue, l'agent traduit et affiche la traduction pendant l'enrichissement afin que l'utilisateur puisse corriger toute mauvaise interprétation.

---

## Configuration

- **Configuration du projet :** section `image:` de `.agents/oma-config.yaml`. L'ancien `config/image-config.yaml` n'est plus lu.
- **Variables d'environnement :**
  - `OMA_IMAGE_DEFAULT_VENDOR` : remplace le fournisseur par défaut (sinon `pollinations`) ;
  - `OMA_IMAGE_DEFAULT_OUT` : remplace le répertoire de sortie par défaut ;
  - `OMA_IMAGE_YES` : `1` pour ignorer la confirmation du coût ;
  - `POLLINATIONS_API_KEY` : obligatoire pour le fournisseur Pollinations (inscription gratuite).

---

## Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| Code de sortie `5` (auth-required) | Le fournisseur sélectionné n'est pas authentifié | Exécutez `oma image doctor` pour voir quel fournisseur nécessite une connexion. Puis utilisez `codex login`, connectez-vous à `agy` ou définissez `POLLINATIONS_API_KEY`. |
| Code de sortie `4` sur `--reference` | `pollinations` rejette les références, ou le fichier est trop volumineux ou dans un mauvais format | Passez à `--vendor codex` ou `--vendor antigravity`. Chaque référence doit faire au maximum 5 Mo et être au format PNG/JPEG/GIF/WebP. |
| `--reference` non reconnu | CLI local obsolète | Exécutez `oma update` et réessayez. Ne remplacez pas la référence par une description en prose. |
| La confirmation de coût bloque l'automatisation | L'exécution est estimée à ≥ `$0.20` | Passez `-y` ou définissez `OMA_IMAGE_YES=1`. Mieux : utilisez `pollinations`, qui est gratuit. |
| `--vendor all` s'interrompt immédiatement | L'un des fournisseurs demandés n'est pas sain (mode strict) | Installez ou connectez le fournisseur manquant, ou choisissez un `--vendor` précis. |
| La sortie est écrite dans un répertoire inattendu | La valeur par défaut est `.agents/results/images/{timestamp}/` | Passez `--output-dir <dir>`. Les chemins hors de `$PWD` nécessitent `--allow-external-output`. |
| Antigravity échoue après une vérification de santé réussie | `agy --version` prouve l'installation, pas la connexion | Connectez-vous à Gemini Code Assist, puis réessayez avec `oma image doctor` et `--vendor antigravity`. |

---

## Voir aussi

- [Skills](/docs/core-concepts/skills) : l'architecture de compétence à deux couches qui alimente `oma-image` ;
- [CLI Commands](/docs/cli-interfaces/commands) : référence complète de la commande `oma image` ;
- [CLI Options](/docs/cli-interfaces/options) : matrice des options globales.
