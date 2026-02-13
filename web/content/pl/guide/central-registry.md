---
title: Centralny rejestr dla konfiguracji wielorepozytoryjnej
description: Wykorzystanie tego repozytorium jako wersjonowanego centralnego rejestru i bezpieczna synchronizacja projektów konsumenckich za pomocą aktualizacji opartych na PR.
---

# Centralny rejestr dla konfiguracji wielorepozytoryjnej

To repozytorium może służyć jako **centralny rejestr** umiejętności agentów, dzięki czemu wiele repozytoriów konsumenckich pozostaje zsynchronizowanych z wersjonowanymi aktualizacjami.

## Architektura

```text
┌─────────────────────────────────────────────────────────┐
│  Centralny rejestr (to repozytorium)                     │
│  • release-please do automatycznego wersjonowania        │
│  • Automatyczne generowanie CHANGELOG.md                 │
│  • prompt-manifest.json (wersja/pliki/sumy kontrolne)    │
│  • agent-skills.tar.gz artefakt wydania                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Repozytorium konsumenckie                               │
│  • .agent-registry.yaml do przypinania wersji            │
│  • Wykrywanie nowej wersji → PR (bez auto-merge)         │
│  • Akcja wielokrotnego użytku do synchronizacji plików   │
└─────────────────────────────────────────────────────────┘
```

## Dla opiekunów rejestru

Wydania są automatyzowane za pomocą [release-please](https://github.com/googleapis/release-please):

1. Używaj Conventional Commits (`feat:`, `fix:`, `chore:`, ...).
2. Wypchnij do `main`, aby utworzyć/zaktualizować PR wydania.
3. Scal PR wydania, aby opublikować artefakty GitHub Release:
   - `CHANGELOG.md` (generowany automatycznie)
   - `prompt-manifest.json` (lista plików + sumy kontrolne SHA256)
   - `agent-skills.tar.gz` (skompresowany katalog `.agent/`)

## Dla projektów konsumenckich

Skopiuj szablony z `docs/consumer-templates/` do swojego projektu:

```bash
# Configuration file
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# GitHub workflows
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

Następnie przypnij żądaną wersję w `.agent-registry.yaml`:

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

Role przepływów pracy:

- `check-registry-updates.yml`: sprawdza dostępność nowych wersji i otwiera PR.
- `sync-agent-registry.yml`: synchronizuje `.agent/` po zmianie przypiętej wersji.

**Ważne**: Auto-merge jest celowo wyłączony. Wszystkie aktualizacje powinny być ręcznie przeglądane.

## Użycie akcji wielokrotnego użytku

Repozytoria konsumenckie mogą wywoływać akcję synchronizacji bezpośrednio:

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
