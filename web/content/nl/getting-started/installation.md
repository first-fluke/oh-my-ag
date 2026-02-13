---
title: Installatie
description: Vereisten, installatieopties en eerste configuratie.
---

# Installatie

## Vereisten

- Google Antigravity (2026+)
- Bun
- uv

## Optie 1: Interactieve installatie

```bash
bunx oh-my-ag
```

Installeert skills en workflows in `.agent/` in het huidige project.

## Optie 2: Globale installatie

```bash
bun install --global oh-my-ag
```

Aanbevolen als u regelmatig orkestratiecommando's gebruikt.

## Optie 3: Integratie in bestaand project

### CLI-pad

```bash
bunx oh-my-ag
bunx oh-my-ag doctor
```

### Handmatig kopieerpad

```bash
cp -r oh-my-ag/.agent/skills /path/to/project/.agent/
cp -r oh-my-ag/.agent/workflows /path/to/project/.agent/
cp -r oh-my-ag/.agent/config /path/to/project/.agent/
```

## Initieel configuratiecommando

```text
/setup
```

Maakt `.agent/config/user-preferences.yaml` aan.

## Vereiste CLI-vendors

Installeer en authenticeer minimaal een van de volgende:

- Gemini
- Claude
- Codex
- Qwen
