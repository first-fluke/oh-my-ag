---
title: Central Registry for Multi-Repo Setup
description: Operate this repository as a versioned central registry and safely sync consumer projects via PR-based updates.
---

# Central Registry for Multi-Repo Setup

This repository can serve as a **central registry** for agent skills so multiple consumer repositories stay aligned with versioned updates.

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│  Central Registry (this repo)                           │
│  • release-please for automatic versioning              │
│  • CHANGELOG.md auto-generation                         │
│  • prompt-manifest.json (version/files/checksums)       │
│  • agent-skills.tar.gz release artifact                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Consumer Repo                                          │
│  • .agent-registry.yaml for version pinning             │
│  • New version detection → PR (no auto-merge)           │
│  • Reusable Action for file sync                        │
└─────────────────────────────────────────────────────────┘
```

## For Registry Maintainers

Releases are automated via [release-please](https://github.com/googleapis/release-please):

1. Use Conventional Commits (`feat:`, `fix:`, `chore:`, ...).
2. Push to `main` to create/update the Release PR.
3. Merge the Release PR to publish GitHub Release assets:
   - `CHANGELOG.md` (auto-generated)
   - `prompt-manifest.json` (file list + SHA256 checksums)
   - `agent-skills.tar.gz` (compressed `.agent/` directory)

## For Consumer Projects

Copy templates from `docs/consumer-templates/` into your project:

```bash
# Configuration file
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# GitHub workflows
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

Then pin your desired version in `.agent-registry.yaml`:

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

Workflow roles:

- `check-registry-updates.yml`: checks for new versions and opens a PR.
- `sync-agent-registry.yml`: syncs `.agent/` when pinned version changes.

**Important**: Auto-merge is intentionally disabled. All updates should be manually reviewed.

## Using the Reusable Action

Consumer repos can call the sync action directly:

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
