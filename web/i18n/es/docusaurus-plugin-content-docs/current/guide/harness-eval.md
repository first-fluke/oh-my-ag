---
title: "Evaluación del harness"
sidebar_label: Evaluación del harness
description: Evalúa una superposición completa de harness de OMA con tareas emparejadas en repositorios aislados y comprobaciones deterministas de artefactos.
---

# Evaluación del harness

`oma harness eval` mide si un harness candidato de OMA mejora un agente objetivo fijo sin cambiar su modelo. Adapta el patrón de evaluación en tiempo de prueba de [AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses](https://arxiv.org/abs/2608.12307): mantiene fijo el modelo objetivo, cambia el harness y compara los resultados en las mismas tareas.

Este comando evalúa una unidad mayor que `oma skill eval`:

| Comando | Tratamiento | Objetivo de la puntuación |
|:--------|:----------|:-------------|
| `oma skill eval` | Un cuerpo `SKILL.md` | Salida del agente |
| `oma harness eval` | Una superposición `.agents/` con alcance | Archivos y salida producidos en un workspace de repositorio |

Usa skill eval para responder «¿esta skill ayuda?». Usa harness eval para responder «¿esta combinación de skills, flujos de trabajo, reglas e instrucciones de agente hace que el agente fijo complete tareas del repositorio de forma más fiable?».

## Modelo de evaluación

Cada tarea se ejecuta como un experimento emparejado:

1. OMA copia el fixture de la tarea en un workspace base nuevo.
2. OMA copia las definiciones actuales de `agents`, `config`, `rules`, `skills` y `workflows` en ese workspace y las proyecta al formato del proveedor seleccionado.
3. OMA repite la preparación en un segundo workspace nuevo y aplica allí la superposición candidata.
4. En ambos brazos usa el mismo agente principal, ruta de proveedor, prompt, permisos de escritura y tiempo de espera.
5. Las comprobaciones deterministas inspeccionan el workspace resultante y, opcionalmente, la salida del agente.

El proyecto real nunca se usa como directorio de trabajo de un brazo. Los workspaces temporales de los brazos se eliminan después de puntuar; el sandbox del proceso propio del proveedor seleccionado sigue siendo la autoridad para el acceso fuera de ese directorio.

## Diseño del candidato

La ruta candidata es un directorio que contiene un árbol `.agents/` parcial:

```text
candidate/
└── .agents/
    ├── agents/
    │   └── docs-curator.md
    ├── rules/
    │   └── documentation.md
    ├── skills/
    │   └── project-docs/
    │       └── SKILL.md
    └── workflows/
        └── docs-check.md
```

Solo se aceptan archivos bajo `.agents/agents`, `.agents/rules`, `.agents/skills` y `.agents/workflows`. Se rechazan hooks, fixtures del evaluador, estado, resultados, archivos de configuración, symlinks y variantes de agentes de proveedores. Los campos protegidos del frontmatter del agente, como `model`, `tools`, `effort` y los límites de ejecución, deben coincidir con la base. Un brazo también falla si el agente en ejecución modifica las definiciones protegidas de `.agents/` antes de puntuar.

## Formato de la suite

Una suite es un archivo YAML y un directorio de fixture por tarea:

```text
harness-eval/
├── suite.yaml
└── fixtures/
    ├── stale-api-doc/
    │   ├── docs/api.md
    │   └── src/session.ts
    └── missing-guide/
        ├── docs/
        └── src/feature.ts
```

```yaml
schema_version: 1
id: docs-harness
agent: docs-curator
tasks:
  - id: stale-api-doc
    prompt: Update the API documentation to match the implementation.
    workspace: fixtures/stale-api-doc
    weight: 1
    checks:
      - type: file_contains
        path: docs/api.md
        value: openSession
      - type: file_not_contains
        path: docs/api.md
        value: createSession
```

Los IDs de tarea deben ser únicos. Las rutas de fixtures y comprobaciones deben permanecer dentro del proyecto y del workspace de la tarea. Los fixtures no pueden contener symlinks ni superficies de control del harness de agentes, como `.agents`, `.codex`, `.claude`, directorios de skills de proveedores o archivos de instrucciones del agente raíz. Esto evita que los datos de la tarea oculten el harness controlado de cualquiera de los dos brazos.

Los directorios de dependencias generados, como `node_modules` y `.venv`, no se copian desde el harness base. Incluye el código fuente de los helpers deterministas y los manifiestos de dependencias en la skill; prepara las dependencias de runtime en el fixture de la tarea cuando una comprobación las necesite.

### Tipos de comprobación

| Tipo | Campos | Condición de aprobación |
|:-----|:-------|:-------------|
| `file_exists` | `path` | La ruta existe cuando termina el brazo. |
| `file_not_exists` | `path` | La ruta no existe. |
| `file_contains` | `path`, `value` | El archivo existe y contiene el valor. |
| `file_not_contains` | `path`, `value` | El archivo existe y no contiene el valor. |
| `output_contains` | `value` | La salida capturada del agente contiene el valor. |
| `output_not_contains` | `value` | La salida capturada del agente no contiene el valor. |

Las comprobaciones de artefactos son intencionadamente deterministas. La primera versión no ejecuta scripts de paquetes mutables como jueces, porque un agente evaluado podría editar esos scripts o sus pruebas e invalidar al evaluador.

## Ejecutar y registrar

El modo live envía dos dispatches por tarea, muestra una vista previa de costos y requiere confirmación:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --live --record
```

En una ejecución correcta, el informe contiene puntuaciones emparejadas de base y candidato, un lift, recuentos de regresiones y una decisión como `pass` o `insufficient`. Si cambias la suite, las definiciones de base, la superposición candidata, los prompts, los fixtures o las comprobaciones, registra una nueva ejecución live; un archivo `_runs` antiguo será rechazado por su hash.

Usa `--yes` para la ejecución no interactiva y `--timeout-minutes` para definir el mismo límite de tiempo de pared por brazo. La ejecución live solo está disponible cuando el proveedor seleccionado descubre los archivos del harness relativos al workspace del proyecto. OMA rechaza el descubrimiento basado en HOME porque la base podría ver contenido candidato instalado globalmente.

`--record` escribe un registro JSON identificado por hash bajo `_runs/`, junto a la suite. El registro vincula los resultados a tres entradas:

- la suite, sus prompts, comprobaciones y contenidos de fixtures;
- las definiciones actuales del harness base;
- los contenidos de la superposición candidata.

El modo mock es el predeterminado y no realiza llamadas al modelo. Solo reproduce un registro cuando los tres hashes siguen coincidiendo:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --mock --require-coverage
```

## Métricas y gate de decisión

Cada tarea aprueba solo cuando todas las comprobaciones aprueban. Las puntuaciones son medias ponderadas de las tareas emparejadas:

```text
lift = candidateScore - baselineScore
```

OMA también informa de:

- tareas corregidas: la base falló y el candidato aprobó;
- tareas regresionadas: la base aprobó y el candidato falló;
- cobertura: se necesitan al menos cinco tareas emparejadas y puntuables.

El candidato aprueba cuando el lift es de al menos 5 puntos porcentuales y no hay regresiones. Cualquier regresión hace fallar al candidato. Un lift no negativo inferior a 5 puntos genera una advertencia, y menos de cinco tareas emparejadas produce una decisión `insufficient`. Añade `--require-coverage` para que una cobertura insuficiente termine con código distinto de cero en CI. Una puntuación no es evidencia cuando falta un brazo, el hash del registro está obsoleto o una comprobación determinista está incompleta.

## Límite actual

Esta es una base de evaluación, no una optimización automática de harness. Un builder puede producir superposiciones candidatas externamente y después usar este comando como gate de aceptación. Una suite final oculta separada, ensayos estocásticos repetidos, runners de pruebas externos de confianza, contabilidad de tokens, fijación forzada del modelo para llamadas de subagentes anidados y un bucle automatizado `harness opt` no forman parte del comando actual. Hasta que exista fijación para llamadas anidadas, las suites que pretendan medir un único modelo fijo deben evitar flujos candidatos que creen otros roles de agente configurados.
