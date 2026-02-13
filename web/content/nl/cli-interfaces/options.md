---
title: Opties
description: Alle commando-opties die momenteel door de CLI worden aangeboden.
---

# Opties

## Globaal

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

## Praktisch voorbeeld

```bash
oh-my-ag usage --json
oh-my-ag stats --reset
oh-my-ag cleanup --dry-run
oh-my-ag agent:spawn backend "Implement auth API" session-01 -v codex -w ./apps/api
```
