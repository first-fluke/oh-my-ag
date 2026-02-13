---
title: Zentrale Registry für Multi-Repo-Setup
description: Dieses Repository als versionierte zentrale Registry betreiben und Consumer-Projekte sicher über PR-basierte Updates synchronisieren.
---

# Zentrale Registry für Multi-Repo-Setup

Dieses Repository kann als **zentrale Registry** für Agenten-Skills dienen, damit mehrere Consumer-Repositories mit versionierten Updates synchron bleiben.

## Architektur

```text
┌─────────────────────────────────────────────────────────┐
│  Zentrale Registry (dieses Repo)                        │
│  • release-please für automatische Versionierung        │
│  • CHANGELOG.md automatisch generiert                   │
│  • prompt-manifest.json (Version/Dateien/Prüfsummen)    │
│  • agent-skills.tar.gz Release-Artefakt                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Consumer-Repo                                          │
│  • .agent-registry.yaml für Versions-Pinning            │
│  • Neue Version erkannt → PR (kein Auto-Merge)          │
│  • Wiederverwendbare Action für Dateisynchronisation    │
└─────────────────────────────────────────────────────────┘
```

## Für Registry-Maintainer

Releases werden über [release-please](https://github.com/googleapis/release-please) automatisiert:

1. Verwenden Sie Conventional Commits (`feat:`, `fix:`, `chore:`, ...).
2. Pushen Sie auf `main`, um den Release-PR zu erstellen/aktualisieren.
3. Mergen Sie den Release-PR, um GitHub-Release-Assets zu veröffentlichen:
   - `CHANGELOG.md` (automatisch generiert)
   - `prompt-manifest.json` (Dateiliste + SHA256-Prüfsummen)
   - `agent-skills.tar.gz` (komprimiertes `.agent/`-Verzeichnis)

## Für Consumer-Projekte

Kopieren Sie die Vorlagen aus `docs/consumer-templates/` in Ihr Projekt:

```bash
# Konfigurationsdatei
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# GitHub-Workflows
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

Pinnen Sie dann Ihre gewünschte Version in `.agent-registry.yaml`:

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

Workflow-Rollen:

- `check-registry-updates.yml`: Prüft auf neue Versionen und öffnet einen PR.
- `sync-agent-registry.yml`: Synchronisiert `.agent/`, wenn sich die gepinnte Version ändert.

**Wichtig**: Auto-Merge ist absichtlich deaktiviert. Alle Updates sollten manuell überprüft werden.

## Verwendung der wiederverwendbaren Action

Consumer-Repos können die Sync-Action direkt aufrufen:

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
