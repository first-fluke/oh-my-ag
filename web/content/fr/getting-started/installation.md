---
title: Installation
description: Prérequis, options d'installation et configuration initiale.
---

# Installation

## Prérequis

- Google Antigravity (2026+)
- Bun
- uv

## Option 1 : Installation interactive

```bash
bunx oh-my-ag
```

Installe les skills et workflows dans `.agent/` du projet courant.

## Option 2 : Installation globale

```bash
bun install --global oh-my-ag
```

Recommandé si vous utilisez fréquemment les commandes de l'orchestrateur.

## Option 3 : Intégration dans un projet existant

### Via le CLI

```bash
bunx oh-my-ag
bunx oh-my-ag doctor
```

### Copie manuelle

```bash
cp -r oh-my-ag/.agent/skills /path/to/project/.agent/
cp -r oh-my-ag/.agent/workflows /path/to/project/.agent/
cp -r oh-my-ag/.agent/config /path/to/project/.agent/
```

## Commande de configuration initiale

```text
/setup
```

Crée `.agent/config/user-preferences.yaml`.

## Fournisseurs CLI requis

Installez et authentifiez au moins un fournisseur :

- Gemini
- Claude
- Codex
- Qwen
