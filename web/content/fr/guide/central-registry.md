---
title: Registre central pour une configuration multi-dépôts
description: Exploiter ce dépôt comme un registre central versionné et synchroniser les projets consommateurs de manière sécurisée via des mises à jour par PR.
---

# Registre central pour une configuration multi-dépôts

Ce dépôt peut servir de **registre central** pour les skills d'agents afin que plusieurs dépôts consommateurs restent alignés sur les mises à jour versionnées.

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│  Registre central (ce dépôt)                            │
│  • release-please pour le versionnement automatique     │
│  • Génération automatique du CHANGELOG.md               │
│  • prompt-manifest.json (version/fichiers/checksums)    │
│  • Artefact de release agent-skills.tar.gz              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Dépôt consommateur                                     │
│  • .agent-registry.yaml pour l'épinglage de version     │
│  • Détection de nouvelle version → PR (pas d'auto-merge)│
│  • Action réutilisable pour la synchronisation           │
└─────────────────────────────────────────────────────────┘
```

## Pour les mainteneurs du registre

Les releases sont automatisées via [release-please](https://github.com/googleapis/release-please) :

1. Utilisez les Conventional Commits (`feat:`, `fix:`, `chore:`, ...).
2. Poussez sur `main` pour créer/mettre à jour la PR de release.
3. Fusionnez la PR de release pour publier les artefacts de la release GitHub :
   - `CHANGELOG.md` (généré automatiquement)
   - `prompt-manifest.json` (liste des fichiers + checksums SHA256)
   - `agent-skills.tar.gz` (répertoire `.agent/` compressé)

## Pour les projets consommateurs

Copiez les modèles depuis `docs/consumer-templates/` dans votre projet :

```bash
# Configuration file
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# GitHub workflows
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

Puis épinglez la version souhaitée dans `.agent-registry.yaml` :

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

Rôles des workflows :

- `check-registry-updates.yml` : vérifie les nouvelles versions et ouvre une PR.
- `sync-agent-registry.yml` : synchronise `.agent/` lorsque la version épinglée change.

**Important** : La fusion automatique est volontairement désactivée. Toutes les mises à jour doivent être révisées manuellement.

## Utilisation de l'action réutilisable

Les dépôts consommateurs peuvent appeler l'action de synchronisation directement :

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
