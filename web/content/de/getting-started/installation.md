---
title: Installation
description: Voraussetzungen, Installationsoptionen und Ersteinrichtung.
---

# Installation

## Voraussetzungen

- Google Antigravity (2026+)
- Bun
- uv

## Option 1: Interaktive Installation

```bash
bunx oh-my-ag
```

Installiert Skills und Workflows in `.agent/` im aktuellen Projekt.

## Option 2: Globale Installation

```bash
bun install --global oh-my-ag
```

Empfohlen, wenn Sie häufig Orchestrator-Befehle verwenden.

## Option 3: Integration in ein bestehendes Projekt

### CLI-Weg

```bash
bunx oh-my-ag
bunx oh-my-ag doctor
```

### Manueller Kopierweg

```bash
cp -r oh-my-ag/.agent/skills /path/to/project/.agent/
cp -r oh-my-ag/.agent/workflows /path/to/project/.agent/
cp -r oh-my-ag/.agent/config /path/to/project/.agent/
```

## Ersteinrichtungsbefehl

```text
/setup
```

Erstellt `.agent/config/user-preferences.yaml`.

## Erforderliche CLI-Anbieter

Installieren und authentifizieren Sie mindestens einen:

- Gemini
- Claude
- Codex
- Qwen
