---
title: "Optimización de skills"
sidebar_label: Optimización de skills
description: "Cómo usar oma skill optimize para evolucionar una skill de forma persistente y basada en evidencia, con gates deterministas de entrenamiento, validación y pruebas propiedad del runner."
---

# Optimización de skills

`oma skill optimize` evoluciona el archivo `SKILL.md` de una skill para maximizar su `utilityLift` medido por `oma skill eval`. Separa la evidencia bruta de los rollouts, el conocimiento persistente acotado y la skill ejecutable. Un Wiki Maintainer consolida los éxitos y fallos observables; un Proposer usa ese conocimiento para emitir ediciones acotadas de adición, eliminación o reemplazo. Los candidatos deben mejorar la utilidad de validación reservada, y `--apply` también requiere una mejora en una división de prueba reservada al runner. En el despliegue no hay una consulta adicional de wiki durante la inferencia: la salida sigue siendo un `SKILL.md`.

Base de investigación: Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C., & Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## Dependencia obligatoria: fixtures de tareas de evaluación

`oma skill optimize` no puede ejecutarse sin fixtures de tareas de evaluación. Requiere al menos **5 fixtures de tareas** (`MIN_TASKS = 5`) en `.agents/eval/<skill>/`. Si encuentra menos, el comando falla inmediatamente:

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

Consulta la [guía de evaluación de utilidad de skills](/docs/guide/skill-eval) para la convención del directorio `.agents/eval/<skill>/`, el esquema de fixtures, los tipos de comprobador y cómo preparar rollouts para la reproducción simulada.

---

## Cómo funciona

Los fixtures se ordenan por ID de tarea y se dividen de forma determinista en conjuntos de **train**, **validación reservada** y **prueba final reservada al runner**. Con al menos cinco fixtures, las proporciones objetivo son 60/20/20 y cada partición contiene al menos una tarea. Las tareas de la prueba final proceden de este conjunto local de fixtures; se mantienen fuera del Maintainer y del Proposer durante el bucle, no se obtienen de una suite externa oculta.

En cada época (hasta `--max-epochs`, cuyo valor predeterminado es 8):

1. **Puntuar el mejor `SKILL.md` actual en la división TRAIN** — `oma skill eval` devuelve los prompts, las salidas y la mejora observables de cada tarea.
2. **El Wiki Maintainer consolida la evidencia** — hasta cinco fallos y tres éxitos se convierten en patrones enlazados a evidencia. Los patrones acotados y los resultados de gates anteriores se recuperan del sistema de memoria L1/L2/L3 de OMA.
3. **El Proposer emite K ediciones candidatas** (hasta `--edits-per-epoch`, cuyo valor predeterminado es 4). Las ediciones exactas que ya estén en el historial persistente de rechazos se omiten.
4. **Para cada edición candidata:**
   - Aplica la edición a una copia en memoria de `SKILL.md`.
   - Valida el candidato (el frontmatter `name`/`description` debe sobrevivir; el cuerpo debe poder analizarse).
   - Hace cumplir el presupuesto textual de tasa de aprendizaje: descarta ediciones cuyo cambio neto de caracteres supere `--lr` (600 caracteres de forma predeterminada).
   - Vuelve a puntuar el candidato en la división de validación **reservada**.
5. **Aceptar el mejor candidato de validación solo si** la mejora de validación aumenta estrictamente (`Δlift > 0`) y ninguna entrada de transferencia negativa infringe el umbral de regresión (`NEG_TRANSFER_FAIL = -0.1`). Cada gate de propuesta se conserva.
6. **Detener pronto** después de 2 épocas consecutivas sin una edición aceptada (`OPT_EARLY_STOP_PATIENCE = 2`).
7. **Ejecutar la prueba final propiedad del runner después de la evolución.** El Maintainer y el Proposer nunca ven estas tareas durante el bucle. Una prueba final fallida impide `--apply` y registra el candidato ganador de validación como conocimiento rechazado.

El optimizador nunca modifica el `SKILL.md` activo durante el bucle: siempre trabaja sobre una copia candidata en memoria.

---

## Uso

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### Flags

| Flag | Valor predeterminado | Descripción |
|:-----|:---------------------|:------------|
| `--skill <id>` | `_all` | ID de la skill que se optimizará (nombre simple, sin separadores de ruta). |
| `--dry-run` | **sí (predeterminado)** | Propone ediciones e imprime el diff sin cambiar `SKILL.md`; la evidencia generada y los eventos de evolución se conservan igualmente. |
| `--apply` | — | Aplica las ediciones aceptadas a `SKILL.md` y hace una copia de seguridad del original antes de una escritura atómica. Solo se ejecuta cuando pasan los gates de validación y de prueba final propiedad del runner; una skill propiedad de OMA también requiere `--yes`. |
| `--mock` | **sí (predeterminado)** | Reproduce ediciones del optimizador y veredictos de evaluación registrados desde `_rollouts/`. Es determinista, funciona sin conexión y es seguro para CI. |
| `--live` | — | Despacho del optimizador LLM en vivo; genera llamadas de modelo reales en cada época. Imprime una vista previa del coste y solicita confirmación salvo que se use `--yes`. |
| `--max-epochs <n>` | `8` | Número máximo de épocas de optimización. |
| `--edits-per-epoch <k>` | `4` | Número de ediciones candidatas que propone el LLM optimizador por época. |
| `--lr <chars>` | `600` | Presupuesto textual de tasa de aprendizaje: cambio neto máximo de caracteres por edición aceptada. |
| `--yes` | — | Omite la confirmación de la vista previa del coste. Solo tiene efecto con `--live`. |
| `--json` | — | Produce JSON para CI/CD. |
| `--output <format>` | `text` | Formato de salida (`text` o `json`). |

---

## Ejemplo mínimo de extremo a extremo

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

Salida de ejemplo:

```
[oma skill opt] skill: oma-scholar, tasks: 8 (train: 4, val: 4), dry-run: true

Skill opt  (skill: oma-scholar)
  applied: false
  baselineLift: 18.5%  finalLift: 32.0%
  epochs: 3  acceptedEdits: 2  rejected: 6

  diff:
--- a/SKILL.md
+++ b/SKILL.md
@@ -12,6 +12,9 @@
 ### When to use
 - User asks to look up an academic paper or technical claim.
+- User asks for a summary of arxiv abstracts or DOI-linked documents.
 - User wants citations or sources for a factual statement.
```

El diff muestra lo que escribiría el optimizador. `SKILL.md` no cambia, mientras que la evidencia de evolución generada y los resultados de gates acotados se conservan para ejecuciones futuras.

---

## Aplicar una mejora validada

Cuando estés conforme con el diff propuesto, vuelve a ejecutarlo con `--apply`:

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

`--apply` solo escribe cuando la optimización encuentra una mejora estrictamente positiva en la validación y la mejora del candidato en la prueba final propiedad del runner es mayor que la mejora de su línea base. Antes de la escritura atómica se crea una copia de seguridad del `SKILL.md` original. El diff siempre se imprime para que puedas revisarlo.

---

## Modo live

El modo live llama al Maintainer y al Proposer reales y vuelve a ejecutar los brazos de evaluación en vivo en cada época. Es costoso: cada tarea puntuada tiene llamadas de línea base y tratamiento, los fixtures de juez añaden llamadas de evaluación y la prueba final puntúa el cuerpo original y el candidato. La vista previa informa de un límite superior de llamadas de modelo subyacentes calculado a partir de la división real. Cada llamada tiene un tiempo de espera de 120 segundos; los brazos de evaluación de Claude se ejecutan con herramientas ambientales, skills, MCP y AgentMemory desactivados.

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

La vista previa del coste muestra el límite superior de llamadas de modelo subyacentes antes de realizar cualquier llamada LLM.

---

## Salida JSON

```bash
oma skill optimize --skill oma-scholar --json
```

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "baselineLift": 0.1850,
  "finalLift": 0.3200,
  "epochCount": 3,
  "acceptedEdits": [
    { "op": "add", "anchor": "### When to use", "after": "\n- User asks for a summary of arxiv abstracts or DOI-linked documents." }
  ],
  "rejectedCount": 6,
  "applied": false,
  "diff": "--- a/SKILL.md\n+++ b/SKILL.md\n...",
  "_dryRun": true,
  "finalTest": { "baselineLift": 0.10, "candidateLift": 0.25, "passed": true },
  "_split": { "trainCount": 4, "valCount": 1, "testCount": 3 }
}
```

`ok` es `true` solo cuando el candidato mejora la validación y la prueba final propiedad del runner no falla (o cuando el candidato se aplicó). Los conteos de `_split` muestran la partición real de fixtures locales usada en la ejecución.

---

## Advertencia de SSOT para skills `oma-*`

Las skills cuyo ID empieza por `oma-` son propiedad de oh-my-agent y `oma update` las sobrescribe. Para estas skills, se desaconseja `--apply`: usa `--dry-run` (el valor predeterminado), revisa el diff propuesto y sube los cambios al registro si la mejora es significativa. En las skills escritas por el usuario, `--apply` es seguro. La CLI muestra una advertencia cuando el objetivo pertenece a OMA:

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

---

## Protección contra el sobreajuste

El Maintainer y el Proposer solo ven la evidencia de rollouts de TRAIN. La selección de candidatos usa la división de VALIDATION reservada, mientras que la división de TEST propiedad del runner permanece fuera de su alcance hasta que termina la evolución. Si un ganador de validación no mejora la prueba final, no se aplica y se añade al historial persistente de rechazos.

---

## Integración con CI

En modo `--mock`, `oma skill optimize` es totalmente determinista y funciona sin conexión: no se llama a ningún LLM. Úsalo en CI para comprobar que un diff de skill propuesto aún muestra una mejora respecto de los rollouts registrados:

```bash
oma skill optimize --skill oma-scholar --mock --json
```

Códigos de salida:

- `0` — la optimización terminó (con o sin mejora)
- `1` — hay menos fixtures que `MIN_TASKS` o el argumento `--skill` no es válido

---

## Consulta también

- [Evaluación de utilidad de skills](/docs/guide/skill-eval) — creación de fixtures de tareas, tipos de comprobador, modos mock/live y el directorio `_rollouts/`.
- [Comandos de la CLI](/docs/cli-interfaces/commands) — referencia de flags para todos los comandos de gestión de skills.
