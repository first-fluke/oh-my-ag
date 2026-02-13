---
title: Opciones
description: Todas las opciones de comandos expuestas actualmente por la CLI.
---

# Opciones

## Globales

- `-h, --help`
- `-V, --version`

## usage

- `--json`
- `--raw`

## doctor

- `--json`

## stats

- `--json`
- `--reset`

## retro

- `--json`
- `--interactive`

## cleanup

- `--dry-run`
- `--json`

## agent:spawn

- `-v, --vendor <vendor>`
- `-w, --workspace <path>`

## agent:status

- `-r, --root <path>`

## memory:init

- `--json`
- `--force`

## verify

- `-w, --workspace <path>`
- `--json`

## Ejemplo practico

```bash
oh-my-ag usage --json
oh-my-ag stats --reset
oh-my-ag cleanup --dry-run
oh-my-ag agent:spawn backend "Implement auth API" session-01 -v codex -w ./apps/api
```
