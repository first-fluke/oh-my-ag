---
title: Registro central para configuracion multi-repositorio
description: Operar este repositorio como un registro central versionado y sincronizar proyectos consumidores de forma segura mediante actualizaciones basadas en PR.
---

# Registro central para configuracion multi-repositorio

Este repositorio puede servir como un **registro central** de skills de agentes para que multiples repositorios consumidores se mantengan alineados con actualizaciones versionadas.

## Arquitectura

```text
┌─────────────────────────────────────────────────────────┐
│  Registro Central (este repositorio)                     │
│  • release-please para versionado automatico             │
│  • Generacion automatica de CHANGELOG.md                 │
│  • prompt-manifest.json (version/archivos/checksums)     │
│  • agent-skills.tar.gz artefacto de release              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Repositorio consumidor                                  │
│  • .agent-registry.yaml para fijar version               │
│  • Deteccion de nueva version → PR (sin auto-merge)      │
│  • Action reutilizable para sincronizacion de archivos   │
└─────────────────────────────────────────────────────────┘
```

## Para mantenedores del registro

Los releases se automatizan mediante [release-please](https://github.com/googleapis/release-please):

1. Use Conventional Commits (`feat:`, `fix:`, `chore:`, ...).
2. Haga push a `main` para crear/actualizar el PR de release.
3. Haga merge del PR de release para publicar los activos del GitHub Release:
   - `CHANGELOG.md` (generado automaticamente)
   - `prompt-manifest.json` (lista de archivos + checksums SHA256)
   - `agent-skills.tar.gz` (directorio `.agent/` comprimido)

## Para proyectos consumidores

Copie las plantillas de `docs/consumer-templates/` a su proyecto:

```bash
# Archivo de configuracion
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# Flujos de trabajo de GitHub
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

Luego fije la version deseada en `.agent-registry.yaml`:

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

Roles de los flujos de trabajo:

- `check-registry-updates.yml`: verifica nuevas versiones y abre un PR.
- `sync-agent-registry.yml`: sincroniza `.agent/` cuando cambia la version fijada.

**Importante**: El auto-merge esta deshabilitado intencionalmente. Todas las actualizaciones deben revisarse manualmente.

## Uso de la Action reutilizable

Los repositorios consumidores pueden llamar a la action de sincronizacion directamente:

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
