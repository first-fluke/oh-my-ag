---
title: Centraal register voor multi-repo-opzet
description: Gebruik deze repository als een versiebeheerd centraal register en synchroniseer consumerprojecten veilig via PR-gebaseerde updates.
---

# Centraal register voor multi-repo-opzet

Deze repository kan dienen als een **centraal register** voor agentskills, zodat meerdere consumerrepository's op een lijn blijven met versiebeheerde updates.

## Architectuur

```text
┌─────────────────────────────────────────────────────────┐
│  Centraal register (deze repo)                          │
│  • release-please voor automatische versiebeheer        │
│  • CHANGELOG.md automatisch gegenereerd                 │
│  • prompt-manifest.json (versie/bestanden/checksums)    │
│  • agent-skills.tar.gz release-artefact                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Consumerrepo                                           │
│  • .agent-registry.yaml voor versiepinning              │
│  • Nieuwe versiedetectie → PR (geen auto-merge)         │
│  • Herbruikbare Action voor bestandssynchronisatie       │
└─────────────────────────────────────────────────────────┘
```

## Voor registerbeheerders

Releases zijn geautomatiseerd via [release-please](https://github.com/googleapis/release-please):

1. Gebruik Conventional Commits (`feat:`, `fix:`, `chore:`, ...).
2. Push naar `main` om de release-PR aan te maken/bij te werken.
3. Merge de release-PR om GitHub Release-assets te publiceren:
   - `CHANGELOG.md` (automatisch gegenereerd)
   - `prompt-manifest.json` (bestandslijst + SHA256-checksums)
   - `agent-skills.tar.gz` (gecomprimeerde `.agent/`-map)

## Voor consumerprojecten

Kopieer sjablonen uit `docs/consumer-templates/` naar uw project:

```bash
# Configuratiebestand
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# GitHub-workflows
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

Pin vervolgens de gewenste versie in `.agent-registry.yaml`:

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

Workflowrollen:

- `check-registry-updates.yml`: controleert op nieuwe versies en opent een PR.
- `sync-agent-registry.yml`: synchroniseert `.agent/` wanneer de vastgepinde versie wijzigt.

**Belangrijk**: Auto-merge is opzettelijk uitgeschakeld. Alle updates dienen handmatig te worden beoordeeld.

## De herbruikbare Action gebruiken

Consumerrepo's kunnen de synchronisatieactie rechtstreeks aanroepen:

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
