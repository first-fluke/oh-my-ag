---
title: "Guía: Motor de diagramas (archify)"
sidebar_label: Diagramas
description: "Cómo elige oh-my-agent entre Mermaid y la skill opcional de agente tt-a1i/archify para diagramas de arquitectura, secuencia y flujo de datos: la sección de configuración de diagramas, oma diagram resolve / oma diagram archify, su uso por /architecture y /explain y el ciclo sin límite fijo de validar, reparar y entregar."
---

# Motor de diagramas

`/architecture` (ADR, recomendaciones y revisiones) y `/explain` (explicadores de cambios de código) generan diagramas estructurales. Siempre son bloques **Mermaid** dentro del artefacto Markdown y, cuando se puede resolver [archify](https://github.com/tt-a1i/archify), que es lo normal, también generan un **diagrama HTML interactivo y validado** junto al artefacto: tema claro u oscuro, paneo y zoom, búsqueda, trazado de relaciones, exportación PNG/SVG/WebM y renderizado desde una especificación JSON tipada.

Mermaid no desaparece: es la SSOT de texto que vive en Markdown y en los diffs de git. archify es un artefacto derivado.

---

## Siempre la última versión de archify, sin instalar nada

archify es una skill de agente con licencia MIT (Node ≥ 18 y cero dependencias de runtime). oh-my-agent no depende de una copia que instalaras una vez; mantiene su **propia copia gestionada** y sigue la última versión:

- Caché: `~/.cache/oma-diagram/archify/<tag>/` más un puntero `state.json`.
- Antes de cada uso, `oma diagram resolve` pregunta a GitHub por la última etiqueta de release (limitado a una vez por `check_interval_min`, 60 minutos por defecto), descarga el tarball de fuentes si existe una etiqueta más nueva (directorio atómico por etiqueta; las etiquetas antiguas se eliminan) y, si no, reutiliza la copia en caché.
- Los fallos de red nunca son fatales: se usa la copia en caché y se informa como `stale` con el motivo. Solo una primera ejecución sin red y sin caché recurre a una copia de la skill instalada por el usuario y, después, a Mermaid.

```bash
# Illustrative output; the release tag, cache path, and quality can vary.
oma diagram update          # force a check / download now
oma diagram resolve
# engine:   archify  (requested: auto)
# reason:   archify 2.15.0 via managed:v2.15.0 (current)
# root:     /Users/you/.cache/oma-diagram/archify/v2.15.0
# quality:  showcase
oma diagram resolve --offline   # never touch the network
```

Orden de resolución (gana el primer resultado, idéntico en todos los runtimes de proveedor):

1. `diagram.archify.path` en `oma-config.yaml`: anclaje explícito que desactiva auto-latest
2. Variable de entorno `ARCHIFY_HOME`: anclaje explícito
3. **Última versión gestionada** (`~/.cache/oma-diagram/archify`)
4. Directorios de skills instalados por el usuario: proyecto `.agents` / `.claude` / `.codex` / `.cursor` / `.qwen` / `.kiro` `/skills/archify`, después los mismos bajo `~`, además de `~/.raven/workspace/skills/archify`

<!-- oma-docs:ignore-start -->
Para que haya un resultado, la instalación gestionada o anclada de archify debe contener `bin/archify.mjs`.
<!-- oma-docs:ignore-end -->

---

## Configuración

Sección concisa en `.agents/oma-config.yaml` (las claves ausentes usan los valores mostrados):

```yaml
diagram:
  engine: auto                # auto | archify | mermaid
  explain_sidecar: false      # /explain also writes an archify sidecar
  archify:
    managed: true             # false = never download; use pins / skill dirs only
    channel: stable           # stable (latest GitHub Release) | main (HEAD of main)
    check_interval_min: 60    # minutes between remote checks; 0 = every call
    path: null                # explicit install dir (pin)
    quality: showcase         # showcase | standard  → --quality
    open: false               # pass --open to deliver
```

| `engine` | Comportamiento |
|---|---|
| `auto` (predeterminado) | archify siempre que se resuelva (última gestionada, anclaje o directorio de skill); de lo contrario, Mermaid |
| `archify` | Requiere archify. `oma diagram resolve` termina con código 1 cuando no se resuelve nada (primera ejecución sin conexión); los flujos se detienen en vez de degradar silenciosamente |
| `mermaid` | Nunca llama a archify |

Un prompt puede sobrescribir la configuración para una ejecución (`/explain 640 with archify`).

---

## CLI

```bash
oma diagram resolve [--engine auto|archify|mermaid] [--refresh] [--offline] [--json]
oma diagram update  [--json]
oma diagram archify <archify args…>
```

`oma diagram archify` ejecuta el ejecutable de archify resuelto con `ARCHIFY_UPDATE_CHECK_DISABLED=1` (sin red) y propaga el código de salida, por lo que `validate` / `deliver` / `visual-check` se comportan exactamente como documenta archify:

```bash
oma diagram archify guide "show the auth request lifecycle" --json
oma diagram archify validate architecture adr-auth.archify.json --quality showcase --json
oma diagram archify deliver  architecture adr-auth.archify.json adr-auth.archify.html --quality showcase --json
oma diagram archify visual-check adr-auth.archify.html --json   # exit 2 = no Chrome, reported as skipped
```

`--json` en `resolve` devuelve `{ ok, requested, engine, quality, open, explainSidecar, archify?: { root, bin, version, source, status?, note? }, reason, probed }`; `source` es `managed:<tag>`, `config:…`, `env:…` o una etiqueta de directorio de skill; `status` (`fresh` / `current` / `stale`) y `note` se establecen para las copias gestionadas.

---

## Cómo lo usan los flujos de trabajo

El protocolo compartido vive en `.agents/skills/_shared/conditional/diagram-engine.md`. Ambos flujos siguen la misma secuencia:

1. `oma diagram resolve --json`
2. Escribe primero el bloque Mermaid (siempre).
3. Si `engine: archify`: traduce la topología Mermaid al IR JSON de archify (`architecture` / `sequence` / `dataflow` / `lifecycle` / `workflow`), leyendo solo el esquema correspondiente y un ejemplo de la instalación.
4. `validate` → reparar → `deliver`. **No hay un límite fijo de iteraciones.** El agente sigue reparando mientras mejore el recuento objetivo de errores de archify y se detiene solo según la regla de convergencia de archify (dos rondas consecutivas sin mejora). Las etiquetas semánticas nunca se eliminan solo para pasar.
5. Enlaza el HTML; nunca lo incrustes.

### `/architecture`

Solo para decisiones estructurales (límites, dependencias y flujo de datos). La salida se guarda junto al artefacto Markdown bajo `.agents/results/architecture/`:

```
adr-notification-service.md            # Mermaid block + "Interactive:" link
adr-notification-service.archify.json  # frozen spec (kept even on failure)
adr-notification-service.archify.html  # delivered viewer
```

### `/explain`

Es opcional, porque el contrato del explicador (un único archivo autocontenido con temas basados en variables CSS) no permite incrustar un segundo documento HTML completo. Actívalo con `diagram.explain_sidecar: true` o pídelo en el prompt. El sidecar `{date}-{slug}.archify.html` se deriva del diagrama principal de Sistema/Flujo de datos del explicador y se enlaza con un `<a href>` sencillo; un fallo del sidecar nunca bloquea el explicador.

---

## Modos de fallo

| Situación | Resultado |
|---|---|
| Falla la comprobación de actualización (sin conexión o con límite) | Se usa la copia en caché y se informa como `stale` con el motivo |
| Sin caché, red ni directorio de skill, `engine: auto` | Solo Mermaid; el informe indica ejecutar `oma diagram update` una vez con conexión |
| Igual, pero `engine: archify` | El flujo se detiene (`ok: false`) con la sugerencia `oma diagram update` |
| `validate` nunca converge | Mermaid sigue siendo el diagrama entregado; el último `.archify.json` queda para una persona y los diagnósticos se informan literalmente |
| Falta Chrome para `visual-check` | Se informa como `skipped`, nunca como aprobado |

---

## Relacionado

- [Explicador de código](/docs/guide/code-explainer): flujo de trabajo `/explain`
- [Semántica de oma-config.yaml](/docs/guide/oma-config-semantics)
- upstream de archify: [tt-a1i/archify](https://github.com/tt-a1i/archify)
