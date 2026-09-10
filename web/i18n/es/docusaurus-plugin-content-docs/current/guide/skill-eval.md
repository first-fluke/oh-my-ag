---
title: "Evaluación de utilidad de skills"
sidebar_label: Evaluación de skills
description: Cómo escribir fixtures de tareas de evaluación para oma skill eval, la convención del directorio .agents/eval/, los tipos de comprobador y los modos de ejecución mock/live.
---

# Evaluación de utilidad de skills

`oma skill eval` mide si cargar una skill mejora realmente los resultados de las tareas del agente. Responde a una pregunta distinta de `oma skill audit` (que pregunta «¿son redundantes dos skills?»): pregunta «¿esta skill ayuda?».

El diseño sigue dos hallazgos de investigación: WikiSkill (arXiv:2608.27454) separa experiencia en bruto, conocimiento persistente y skills ejecutables, conservando gates reservados para la evolución; SkillLens (arXiv:2605.23899) muestra que la utilidad de una skill es independiente de que su descripción sea distintiva: una skill distinta puede seguir siendo inútil y una que se solapa puede seguir ayudando.

---

## Cómo funciona

Para cada fixture de tarea, el comando ejecuta dos brazos:

1. **Brazo base**: envía el prompt de la tarea a un agente sin la skill.
2. **Brazo de tratamiento**: antepone `SKILL.md` al prompt y envía la misma tarea.

Cada brazo recibe una puntuación (0 = falla, 1 = pasa) mediante el comprobador de la tarea. La métrica principal es:

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

Una skill aprueba cuando `utilityLift ≥ 5%`. Por debajo de ese umbral se marca como advertencia (mejora marginal) o como fallo (sin mejora). Se necesitan al menos 5 tareas puntuables para emitir un veredicto.

---

## Convención `.agents/eval/<skill>/`

Coloca los fixtures de tareas bajo `.agents/eval/<skill>/`. Esta ruta está dentro de `.agents/`, pero fuera del propio directorio de la skill, por lo que sobrevive a `oma update` sin sobrescribir evaluaciones escritas por el usuario.

```
.agents/eval/
└── oma-scholar/
    ├── claims-only.yaml        ← task fixture
    ├── entity-lookup.yaml
    ├── partial-fetch.yaml
    ├── structured-output.yaml
    ├── edge-empty-response.yaml
    └── _rollouts/
        └── a3f1b2c4d5e6f7a8.json   ← recorded arm outputs + judge verdicts
```

Los archivos cuyo nombre empieza por `_` se omiten al cargar los fixtures. El subdirectorio `_rollouts/` contiene las salidas registradas de los brazos de ejecuciones anteriores con `--live --record`.

## Esquema del fixture de tarea

Cada fixture es un archivo YAML con los campos siguientes:

```yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
checker:
  type: judge
  rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

| Campo | Obligatorio | Descripción |
|:------|:---------|:-----------|
| `id` | Sí | Identificador único de la tarea (se usa en nombres de rollouts e informes) |
| `skill` | Sí | Skill evaluada (coincide con el nombre del directorio padre) |
| `domain` | Sí | Etiqueta de dominio (se usa para agrupar y para detectar transferencia negativa en el futuro) |
| `prompt` | Sí | Prompt de tarea que se envía a ambos brazos |
| `checker` | No | Cómo puntuar la salida del brazo. Si se omite, el valor predeterminado es `{ type: judge }`. |
| `weight` | Sí | Peso relativo para la media ponderada (usa `1` salvo que las tareas tengan distinta importancia) |

### Tipos de comprobador

#### judge (predeterminado)

Un LLM evalúa la salida del brazo contra una rúbrica y devuelve PASS o FAIL. Es el valor predeterminado cuando se omite `checker` o `checker.type`.

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

El campo `rubric` es opcional; si se omite se usa la rúbrica predeterminada: «¿La respuesta satisface correcta y completamente el prompt de la tarea?».

También puedes escribir la rúbrica en el nivel superior para abreviar:

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**Importante:** en modo `--mock`, las tareas judge necesitan un veredicto registrado previamente en `_rollouts/`. Si no hay un veredicto registrado para una tarea, se excluye del informe con una advertencia. Ejecuta `--live --record` para poblar primero los rollouts.

Lo mismo ocurre con cualquier tipo de comprobador cuando falta por completo un brazo: la tarea se excluye en vez de recibir una puntuación 0. La ausencia de datos no es una respuesta fallida; puntuarla haría que ambos brazos fueran 0 y un lift cero se leería como `decision: "fail"`. Si las exclusiones reducen el recuento puntuado por debajo de `MIN_TASKS`, se muestra `coverage: "insufficient"`.

#### assert (opt-in)

Comprobación determinista de subcadenas. Úsala para verificar contratos, formatos o llamadas a herramientas donde la salida esperada sea exacta.

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

Aprueba cuando cada string de `expect_contains` está presente en la salida del brazo.

#### regex (opt-in)

Coincidencia determinista de expresión regular. Úsala cuando se necesite un patrón en lugar de una cadena exacta.

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

Los patrones de más de 200 caracteres reciben una puntuación 0 (protección contra ReDoS). La salida se trunca a 10.000 caracteres antes de hacer la coincidencia.

---

## Modos de ejecución

### --mock (predeterminado)

Reproduce los rollouts registrados desde `_rollouts/`. Es completamente determinista y funciona sin conexión: no se llama a ningún LLM.

- Para comprobadores `assert`/`regex`, las puntuaciones se calculan a partir de las cadenas de salida registradas.
- Para comprobadores `judge`, reproduce el campo `score` registrado por `--live --record`.

Si una tarea judge no tiene una puntuación registrada en `_rollouts/`, se excluye del informe (con una advertencia en consola). Así el modo mock permanece estrictamente sin conexión.

Las grabaciones también se comprueban para detectar obsolescencia. Una entrada de tratamiento registrada con un cuerpo SKILL.md distinto, una entrada cuyo `prompt` del fixture haya cambiado o cualquier entrada anterior al seguimiento de procedencia se descarta con una advertencia que nombra el archivo y el recuento. Si quedan menos de `MIN_TASKS` tareas puntuables, la ejecución informa `coverage: "insufficient"` en lugar de un veredicto: una skill editada nunca hereda su puntuación anterior.

:::note `oma skill optimize --mock`
El optimizador puntúa cuerpos candidatos de SKILL.md. Como una grabación solo es válida para el cuerpo con el que se creó, los cuerpos candidatos no tienen rollouts coincidentes y aparecen como no cubiertos. Usa `--live` para puntuar candidatos.
:::

Seguro para CI. Define `OMA_SKILLEVAL_MOCK=1` para forzar este modo.

```bash
oma skill eval --skill oma-scholar
```

### --live

Crea brazos de agente reales mediante `oma agent spawn --read-only`. Ambos brazos se ejecutan en un workspace temporal para impedir la modificación de archivos del proyecto.

Antes del despacho, el comando muestra una vista previa del costo con el número de tareas, despachos de brazos, despachos del juez y proveedor resuelto. Confirma con `y` o salta la confirmación con `--yes`.

Los otros controles son útiles en CI y al investigar la cobertura:

| Opción | Efecto |
| --- | --- |
| `--task-dir <path>` | Evalúa fixtures desde un directorio distinto de `.agents/eval/<skill>`. |
| `--max-tasks <n>` | Limita el número de fixtures para una ejecución live acotada. |
| `--neg-transfer` | Muestrea vecinos del mismo dominio para buscar transferencia negativa; está desactivado por defecto. |
| `--require-coverage` | Termina con código distinto de cero cuando quedan menos de cinco tareas emparejadas puntuables. |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### Aislamiento de la skill (mantener honesta la base) {#skill-isolation-keeping-the-baseline-honest}

`utilityLift` solo tiene sentido si el **brazo base se ejecuta sin la skill objetivo**. El problema es que un agente enviado carga automáticamente todas las skills instaladas en su runtime, por lo que una base ingenua también recogería la skill que se supone que se mide; la comparación quedaría contaminada (base ≈ tratamiento y lift ≈ 0).

Para evitarlo, `--live` ejecuta **ambos brazos en un workspace temporal aislado** cuyo directorio de skills contiene todas las skills instaladas **excepto la objetivo**. El brazo de tratamiento vuelve a añadir la objetivo **solo** mediante el `SKILL.md` inyectado (antepuesto al prompt). Por tanto, la inyección es la única variable controlada: base = sin skill, tratamiento = `SKILL.md` candidato.

Esto funciona porque la mayoría de los proveedores descubren skills **relativas al directorio de trabajo** (por ejemplo, `<cwd>/.claude/skills`, `<cwd>/.codex/skills`): un directorio de trabajo limpio oculta realmente la skill. El informe declara cuánto se mantuvo el aislamiento mediante un campo `isolation`:

| Estado | Significado |
|---|---|
| `enforced` | Proveedor relativo al cwd y la skill objetivo ausente de la ruta HOME: aislamiento completo. |
| `best-effort` | Proveedor relativo al cwd, pero también existe una copia HOME de la skill (o el proveedor es desconocido); la copia del proyecto está oculta, aunque una copia HOME puede filtrarse. Marcado como de baja confianza. |
| `unavailable` | Proveedor basado en HOME (por ejemplo, **antigravity**, que lee `~/.gemini/antigravity-cli/skills`); un cwd limpio no puede ocultarlo. Se muestra una advertencia y el resultado queda marcado como de baja confianza. |
| n/a | Modo mock: no hay despacho live. |

Cuando el aislamiento no es `enforced`, se muestra una advertencia de una línea y el resultado debe tratarse como de baja confianza. Para una señal limpia, ejecuta la evaluación con un proveedor relativo al cwd y aislable (claude, codex o qwen) en lugar de uno basado en HOME; el proveedor de evaluación sigue `model_preset` en `.agents/oma-config.yaml`, así que selecciona un preset cuyo proveedor predeterminado sea relativo al cwd.

### --live --record

Ejecuta brazos live y escribe las salidas capturadas (incluidos los veredictos del juez para tareas con comprobador judge) en `_rollouts/<hash>.json`. El nombre es un hash SHA-256 determinista del conjunto de IDs de tareas, no una fecha ni un valor aleatorio.

Úsalo para sembrar ejecuciones `--mock` en tu propia máquina y mantenerlas sin conexión en repeticiones posteriores.

Cada entrada incluye procedencia para que una reproducción posterior pueda saber si todavía aplica:

| Campo | Registrado en | Comparado con |
|---|---|---|
| `skillBodyHash` | solo `treatment` | el cuerpo de SKILL.md evaluado |
| `promptHash` | ambos brazos | el `prompt` actual del fixture |

El brazo base oculta la skill, así que editar SKILL.md no lo invalida; solo se vuelve a grabar el brazo de tratamiento.

:::caution `_rollouts/` es solo local: no lo confirmes
Una grabación solo se reproduce para el cuerpo exacto de SKILL.md con el que se creó. Edita una skill y sus grabaciones de tratamiento se descartan en la siguiente ejecución `--mock`, así que una grabación incluida en el repositorio quedaría obsoleta cuando alguien descargue el siguiente cambio y mostraría advertencias.
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

Después de una ejecución live correcta, el informe incluye recuentos de base y tratamiento, `utilityLift`, `coverage: "ok"`, el estado de aislamiento y una decisión pass/warn/fail. Una ejecución mock posterior reutiliza solo grabaciones cuyos prompts y cuerpo de la skill de tratamiento sigan coincidiendo.

---

## Un conjunto mínimo de fixtures funcionales

Para emitir un veredicto se necesitan cinco fixtures (`MIN_TASKS = 5`). Este es un conjunto mínimo para una skill `oma-scholar` imaginaria:

```yaml
# .agents/eval/oma-scholar/claims-only.yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

```yaml
# .agents/eval/oma-scholar/entity-lookup.yaml
id: entity-lookup
skill: oma-scholar
domain: research
prompt: "Look up the entity knows:concept/attention-mechanism"
rubric: "Does the answer return the entity name, description, and at least one related concept?"
weight: 1
```

Repite el proceso para al menos tres tareas más. Después ejecuta:

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```

---

## Leer el informe

**Salida de texto:**

```
Skill utility eval  (skill: oma-scholar)
  tasks: 7
  isolation: enforced [codex]

  baseline: 42.9%  treatment: 71.4%
  utilityLift: 28.6%  (stddev: 14.3%)
  [PASS]
  Skill shows positive utility lift >= 5%.

  Per-task findings:
    claims-only: baseline=0 treatment=1 lift=+1.000
    entity-lookup: baseline=1 treatment=1 lift=+0.000
    ...

  Thresholds: fail <= 0%, warn < 5%
```

**Salida JSON** (mediante `--json`):

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "taskCount": 7,
  "coverage": "ok",
  "decision": "pass",
  "baselineScore": 0.4286,
  "treatmentScore": 0.7143,
  "utilityLift": 0.2857,
  "utilityStdDev": 0.1429,
  "findings": [
    { "taskId": "claims-only", "baseline": 0, "treatment": 1, "lift": 1.0 }
  ],
  "negativeTransfer": [],
  "isolation": "enforced",
  "isolationVendor": "codex"
}
```

`ok` es `true` solo cuando `coverage === "ok"` y `decision === "pass"`. El campo `isolation` informa si el brazo base se ejecutó realmente sin la skill objetivo (consulta [Aislamiento de la skill](#skill-isolation-keeping-the-baseline-honest)); `isolation` es `"n/a"` en modo `--mock`.

---

## Integración con CI

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

Códigos de salida:
- `0`: pass o warn
- `1`: fail o cobertura insuficiente con `--require-coverage`

---

## Elegir live o mock

Usa `--live` con comprobadores judge para medir la utilidad real en tareas abiertas. Usa `--mock` para reproducir veredictos judge registrados previamente sin conexión o para ejecutar comprobaciones de contrato deterministas `assert`/`regex`.

El determinismo de mock se conserva registrando el veredicto binario del juez (PASS/FAIL) en la entrada del rollout durante `--live --record` y reproduciendo después esa puntuación registrada en ejecuciones `--mock`; no se vuelve a llamar al LLM.

**Salida de datos:** durante `--live`, el despacho del juez envía la salida del brazo candidato al proveedor configurado para que la califique. Al inicio de cada ejecución live se muestra una advertencia de una sola vez.

Si una ejecución mock informa de cobertura insuficiente, inspecciona la advertencia en busca de entradas `_rollouts` descartadas o ausentes y ejecuta después una pasada de grabación live tras corregir el fixture o la skill. Si el aislamiento es `best-effort` o `unavailable`, elige un proveedor relativo al cwd como Claude, Codex o Qwen antes de considerar el lift una señal sólida.

---

## Distribuir tareas de evaluación con una skill

Las skills pueden incluir un conjunto de tareas de evaluación colocando fixtures en `.agents/eval/<skill>/`. Son archivos escritos por el usuario fuera del directorio de la skill, por lo que sobreviven a `oma update`. Al crear una skill nueva con `oma-skill-creation`, añade un conjunto de fixtures `eval/` correspondiente para que los autores futuros puedan verificar el efecto de la skill. Consulta `.agents/skills/oma-skill-creation/SKILL.md` para el flujo de autoría de skills.
