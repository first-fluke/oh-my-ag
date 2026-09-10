---
title: Habilidades
description: Guía completa de la arquitectura de dos capas de OMA con 33 habilidades, incluido el enrutamiento de SKILL.md, los recursos bajo demanda, los protocolos compartidos y condicionales, la ejecución por proveedor, las mediciones de tokens y la mecánica de enrutamiento.
---

# Habilidades

Las habilidades son paquetes de conocimiento estructurado que proporcionan a cada rol de despacho la orientación de su dominio. Incluyen protocolos de ejecución, referencias de stack tecnológico, plantillas de código, guías de recuperación de errores, listas de verificación de calidad y ejemplos cuando la habilidad los proporciona, organizados en una arquitectura de dos capas diseñada para ahorrar tokens.

---

## El diseño de dos capas

### Capa 1: SKILL.md (~2,631 tokens de mediana, cargada cuando se enruta la habilidad)

Cada habilidad tiene un archivo `SKILL.md` en su raíz. Entra en la ventana de contexto cuando se enruta la habilidad: el hook inyector pasa una **referencia de ruta**, no el contenido, de modo que una habilidad que no se enruta no cuesta nada más allá de su `description`. Contiene:

- **Frontmatter YAML** con `name` y `description` (se usa para el enrutamiento y la visualización)
- **Cuándo usar / Cuándo NO usar**: condiciones explícitas de activación
- **Reglas principales**: las 5-15 restricciones más importantes del dominio
- **Vista general de la arquitectura**: cómo debe estructurarse el código
- **Lista de librerías**: dependencias aprobadas y sus propósitos
- **Referencias**: punteros a recursos de la Capa 2 (nunca se cargan automáticamente)

Ejemplo de frontmatter:

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

El campo `description` es crítico porque contiene las palabras clave de enrutamiento que el sistema de enrutamiento de habilidades usa para asociar tareas con agentes.

### Capa 2: resources/ (cargada bajo demanda)

El directorio `resources/` contiene conocimiento profundo para la ejecución. Estos archivos se cargan solo cuando:
1. El host o el flujo de trabajo ha seleccionado la habilidad (por ejemplo, mediante una coincidencia nativa o un comando explícito)
2. El recurso específico es necesario para el tipo y la dificultad de la tarea actual

Esta carga bajo demanda está gobernada por la guía de carga de contexto (`.agents/skills/_shared/core/context-loading.md`), que asigna tipos de tarea a los recursos requeridos por cada agente.

---

## Ejemplo de estructura de archivos

```
.agents/skills/oma-frontend/
├── SKILL.md                          ← Layer 1: loaded when routed
└── resources/
    ├── execution-protocol.md         ← Layer 2: step-by-step workflow
    ├── tech-stack.md                 ← Layer 2: detailed technology specs
    ├── angular-rules.md              ← Layer 2: Angular-specific conventions
    ├── snippets.md                   ← Layer 2: copy-paste code patterns
    ├── error-playbook.md             ← Layer 2: error recovery procedures
    └── checklist.md                  ← Layer 2: quality verification checklist

.agents/skills/oma-backend/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── orm-reference.md              ← Domain-specific (ORM queries, N+1, transactions)
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Shipped language seeds / generated references
    ├── node/
    ├── python/
    └── rust/

.agents/skills/oma-mobile/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── tech-stack.md
│   ├── screen-template.dart
│   ├── screen-template.swift         ← Swift native iOS screen template
│   ├── screen-template.tsx            ← React Native screen template
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Stack schema and generated platform references
    ├── README.md
    └── stack.schema.json

.agents/skills/oma-design/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── anti-patterns.md
│   ├── checklist.md
│   ├── design-md-spec.md
│   ├── design-tokens.md
│   ├── prompt-enhancement.md
│   ├── stitch-integration.md
│   └── error-playbook.md
└── reference/                         ← Deep reference material
    ├── typography.md
    ├── color-and-contrast.md
    ├── spatial-design.md
    ├── motion-design.md
    ├── responsive-design.md
    ├── component-patterns.md
    ├── accessibility.md
    └── shader-and-3d.md
```

---

## Tipos de recursos por habilidad

| Tipo de recurso | Patrón de nombre | Propósito | Cuándo se carga |
|-----------------|------------------|-----------|-----------------|
| **Protocolo de ejecución** | `execution-protocol.md` | Flujo paso a paso: Analyze -> Plan -> Implement -> Verify | Siempre (con `SKILL.md`) |
| **Stack tecnológico** | `tech-stack.md` | Especificaciones detalladas de tecnología, versiones y configuración | Tareas complejas |
| **Guía de errores** | `error-playbook.md` | Procedimientos de recuperación con escalamiento de "3 strikes" | Solo cuando ocurre un error |
| **Lista de verificación** | `checklist.md` | Verificación de calidad específica del dominio | En el paso Verify |
| **Snippets** | `snippets.md` | Patrones de código listos para copiar y pegar | Tareas medias o complejas |
| **Ejemplos** | `examples.md` o `examples/` | Ejemplos few-shot de entrada/salida para el LLM | Tareas medias o complejas |
| **Variantes** | Directorio `variants/` | Referencias específicas del lenguaje o framework. Backend incluye semillas `node`, `python` y `rust`; mobile incluye un esquema y puede recibir referencias de plataforma generadas. | Cuando existe un stack coincidente |
| **Plantillas** | `component-template.tsx`, `screen-template.dart` | Plantillas de archivos boilerplate | Al crear un componente |
| **Referencia de dominio** | `orm-reference.md`, `anti-patterns.md`, etc. | Conocimiento profundo del dominio para subtareas específicas | Según el tipo de tarea |

---

## Recursos compartidos (_shared/)

Todos los agentes comparten fundamentos comunes de `.agents/skills/_shared/`. Se organizan en tres categorías:

### Recursos core (`.agents/skills/_shared/core/`)

| Recurso | Propósito | Cuándo se carga |
|---------|-----------|-----------------|
| **`skill-routing.md`** | Asigna palabras clave de tareas al agente correcto. Contiene la tabla Skill-Agent Mapping, patrones de Complex Request Routing, Inter-Agent Dependency Rules y Turn Limit Guide. | Lo consultan las habilidades de orquestación y coordinación |
| **`context-loading.md`** | Define qué recursos cargar para cada tipo y dificultad de tarea. Contiene tablas de asignación por agente y disparadores de carga condicional de protocolos. | Al comenzar el flujo (Step 0 / Phase 0) |
| **`prompt-structure.md`** | Define los cuatro elementos que debe contener cada prompt: Goal, Context, Constraints y Done When. Incluye plantillas para agentes PM, de implementación y QA. Enumera los anti-patrones (comenzar solo con un Goal). | Lo consultan el agente PM y todos los flujos |
| **`clarification-protocol.md`** | Define niveles de incertidumbre (LOW/MEDIUM/HIGH) y las acciones de cada uno. Incluye disparadores, plantillas de escalamiento, elementos de verificación por tipo de agente y comportamiento en modo subagente. | Cuando los requisitos son ambiguos |
| **`context-budget.md`** | Gestiona el presupuesto de tokens. Define la estrategia de lectura (usar `find_symbol` en vez de `read_file`), el costo medido de cada recurso y de una carga Simple (~4,000 tokens) frente a una Complex (~9,000 tokens), el límite obligatorio de `SKILL.md` (25,000 caracteres, comprobado por `oma skill audit`), el manejo de archivos grandes y los síntomas de desbordamiento de contexto. | Al comenzar el flujo |
| **`difficulty-guide.md`** | Criterios para clasificar tareas como Simple, Medium o Complex. Define los turnos esperados, las ramas del protocolo (Fast Track / Standard / Extended) y la recuperación de errores de clasificación. | Al comenzar la tarea (Step 0) |
| **`quality-principles.md`** | Cuatro principios universales de calidad aplicados a todos los agentes. | Al comenzar flujos centrados en calidad (ultrawork) |
| **`vendor-detection.md`** | Protocolo para detectar el entorno de runtime actual (Claude Code, Codex CLI, Antigravity, Cursor, Kiro, Qwen y CLI alternativa). Usa marcadores del host y el estado del proveedor configurado. | Al comenzar el flujo |
| **`session-metrics.md`** | Puntuación de Clarification Debt y seguimiento de métricas de sesión. Define tipos de evento (clarify +10, correct +25, redo +40), umbrales (CD >= 50 = RCA, CD >= 80 = pausa) y puntos de integración. | Durante sesiones de orquestación |
| **`common-checklist.md`** | Lista de verificación universal de calidad aplicada en la verificación final de tareas Complex, además de las listas específicas del agente. | Paso Verify de tareas Complex |
| **`lessons-learned.md`** | Repositorio de aprendizajes de sesiones anteriores, generado a partir de incumplimientos de Clarification Debt y experimentos descartados. Se organiza por sección de dominio e incluye QA Evaluation Lessons para registrar puntos ciegos de los evaluadores. | Después de errores y al terminar la sesión |
| **`api-contracts/`** | Directorio con la plantilla de contratos de API y contratos generados. `template.md` define el formato por endpoint (método, ruta, esquemas de solicitud/respuesta, autenticación y errores). | Al planificar trabajo entre fronteras |

### Recursos runtime (`.agents/skills/_shared/runtime/`)

| Recurso | Propósito |
|---------|-----------|
| **`memory-protocol.md`** | Formato y operaciones de archivos de memoria para subagentes CLI. Define los protocolos On Start, During Execution y On Completion con herramientas de memoria configurables, además de la extensión para seguimiento de experimentos. |
| **`execution-protocols/claude.md`** | Patrones de ejecución específicos de Claude Code. `oma agent spawn` los inyecta cuando el proveedor es claude. |
| **`execution-protocols/antigravity.md`** | Patrones de ejecución de Antigravity CLI (`agy`). |
| **`execution-protocols/codex.md`** | Patrones de ejecución específicos de Codex CLI. |
| **`execution-protocols/commandcode.md`** | Patrones de ejecución de CommandCode. |
| **`execution-protocols/grok.md`** | Patrones de ejecución de Grok. |
| **`execution-protocols/kimi.md`** | Patrones de ejecución de Kimi Code. |
| **`execution-protocols/kiro.md`** | Patrones de ejecución de Kiro. |
| **`execution-protocols/opencode.md`** | Patrones de ejecución de la extensión OpenCode. |
| **`execution-protocols/pi.md`** | Patrones de ejecución de la extensión pi. |
| **`execution-protocols/qwen.md`** | Patrones de ejecución específicos de Qwen CLI. |

Los protocolos de ejecución específicos del proveedor se inyectan automáticamente en los agentes generados por CLI mediante `oma agent spawn`. Los subagentes nativos usan las reglas de integración del proveedor seleccionado.

### Recursos condicionales (`.agents/skills/_shared/conditional/`)

Solo se cargan cuando se cumplen condiciones específicas durante la ejecución:

| Recurso | Condición de activación | Quién lo carga | Aprox. de tokens |
|---------|-------------------------|----------------|------------------|
| **`quality-score.md`** | Comienza la fase VERIFY o SHIP en un flujo que admite medición de calidad | Orquestador (lo pasa al prompt del agente QA) | ~250 |
| **`experiment-ledger.md`** | Se registra el primer experimento después de establecer una línea base IMPL | Orquestador (inline, después de la medición de línea base) | ~250 |
| **`exploration-loop.md`** | La misma puerta falla dos veces por el mismo problema | Orquestador (inline, antes de generar agentes de hipótesis) | ~250 |

Impacto en el presupuesto: aproximadamente 750 tokens en total si se cargan los tres. Como la carga es condicional, las sesiones normales cargan 1-2, un costo pequeño frente a los ~4,000 tokens que una tarea Simple ya usa para `SKILL.md` más `execution-protocol.md`.

---

## Cómo se enrutan las habilidades mediante skill-routing.md

El mapa de enrutamiento de habilidades define cómo se asocian las tareas con los agentes:

### Enrutamiento simple (un solo dominio)

Un prompt que contenga "Build a login form with Tailwind CSS" coincide con las palabras clave `UI`, `component`, `form`, `Tailwind` y se enruta a **oma-frontend**.

### Enrutamiento de solicitudes complejas

Las solicitudes multidominio siguen órdenes de ejecución establecidos:

| Patrón de solicitud | Orden de ejecución |
|---------------------|--------------------|
| "Create a fullstack app" | oma-pm -> (oma-backend + oma-frontend) en paralelo -> oma-qa |
| "Create a mobile app" | oma-pm -> (oma-backend + oma-mobile) en paralelo -> oma-qa |
| "Fix bug and review" | oma-debug -> oma-qa |
| "Design and build a landing page" | oma-design -> oma-frontend |
| "I have an idea for a feature" | oma-brainstorm -> oma-pm -> agentes relevantes -> oma-qa |
| "Do everything automatically" | oma-orchestration (internamente: oma-pm -> agentes -> oma-qa) |

### Reglas de dependencia entre agentes

**Pueden ejecutarse en paralelo (sin dependencias):**
- oma-backend + oma-frontend (cuando el contrato de API está definido)
- oma-backend + oma-mobile (cuando el contrato de API está definido)
- oma-frontend + oma-mobile (independientes entre sí)

**Deben ejecutarse secuencialmente:**
- oma-brainstorm -> oma-pm (el diseño precede a la planificación)
- oma-pm -> todos los demás agentes (la planificación es lo primero)
- agente de implementación -> oma-qa (la revisión ocurre después de la implementación)
- oma-backend -> oma-frontend/oma-mobile (cuando no existe un contrato de API predefinido)

**QA siempre es el último**, salvo cuando el usuario solicita revisar solo archivos específicos.

---

## Cálculo de ahorro de tokens {#token-savings-math}

Estas cifras se midieron en el árbol de habilidades, no se estimaron manualmente. Puedes volver a calcularlas en cualquier momento:

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

Los recuentos de tokens son **aproximaciones** (bytes ÷ 4, la proporción aproximada para Markdown en inglés). Las tablas y las vallas de código suelen tokenizarse peor, por lo que estas cifras son ligeramente bajas; usa un tokenizador real contra tu modelo si necesitas números exactos.

### Niveles de carga

Cada nivel representa un estado real al que llega un agente, según `context-loading.md`:

| Nivel | Qué contiene el contexto |
|------|---------------------------|
| `routed` | Solo `SKILL.md` |
| `simple` | + `execution-protocol.md` |
| `medium` | + el recurso asignado para la tarea, cuando existe |
| `complex` | + el recurso asignado y las referencias de stack cuando el proyecto las proporciona |
| `all` | `SKILL.md` + todos los archivos de recursos — el **techo**, no un modo seleccionable |

Para las habilidades backend y mobile, `/stack-set` puede generar referencias específicas del proyecto dentro de `stack/`. Un checkout nuevo no tiene un directorio de stack generado, así que la fila `complex` se mide contra las semillas distribuidas en `variants/` a partir de las cuales se adapta la generación; es un proxy de tamaño, no un archivo que el agente cargue todavía.

### Una sesión con 5 agentes (pm, backend, frontend, mobile, qa)

| Nivel | Tokens | Parte del techo | Evitados |
|------|-------:|-----------------:|---------:|
| `routed` | 11,497 | 15.7% | 84.3% |
| `simple` | 17,923 | 24.4% | 75.6% |
| `medium` | 19,125 | 26.1% | 73.9% |
| `complex` | 39,156 | 53.4% | 46.6% |
| `all` | 73,355 | 100% | — |

Así, una tarea Simple o Medium en cinco agentes mantiene aproximadamente **17-19K tokens** de contexto de habilidades en lugar del techo de 73K, y una tarea Complex mantiene unos **38K**: el ahorro es de ~74-76% en el trabajo normal y baja a ~47% cuando la tarea incorpora referencias de stack. En un modelo con contexto de 128K, quedan unos 110K libres para tareas Simple/Medium y 90K para Complex.

:::note
Trata `all` como un límite, no como una alternativa. Ningún runtime carga todos los recursos de antemano: las habilidades aparecen por `description`, su cuerpo se lee cuando se enrutan y los recursos se leen según los necesita la tarea. `all` es el límite superior de lo que podría costar una habilidad; por eso los porcentajes se expresan como "evitados" y no como una comparación con una configuración real.
:::

La Capa 1 es el suelo, y no es pequeña: entre las 33 habilidades instaladas, `SKILL.md` tiene aproximadamente entre 1,275 y 5,489 tokens (mediana de ~2,631). Ese suelo limita cuánto puede ahorrar la carga progresiva: con los cinco agentes enrutados, solo el nivel `routed` ya representa el 15% del techo.

---

## Carga de recursos según la dificultad de la tarea

La guía de dificultad clasifica las tareas en tres niveles, que determinan cuánto de la Capa 2 se carga:

### Simple (3-5 turnos esperados)

Cambio en un solo archivo, requisitos claros, repetición de patrones existentes.

Carga: solo `execution-protocol.md`. Omite el análisis y pasa directamente a la implementación con una lista de verificación mínima.

### Media (8-15 turnos esperados)

Cambios en 2-3 archivos, con algunas decisiones de diseño necesarias y aplicación de patrones a dominios nuevos.

Carga: `execution-protocol.md` más el recurso Medium asignado cuando existe. Protocolo estándar con un análisis breve y verificación completa.

### Compleja (15-25 turnos esperados)

Cambios en 4 o más archivos, decisiones de arquitectura, introducción de patrones nuevos o dependencias de otros agentes.

Carga: `execution-protocol.md` más el recurso asignado y las referencias disponibles de `tech-stack.md` / `snippets.md`. Protocolo extendido con puntos de control, registro de progreso durante la ejecución y verificación completa que incluye `common-checklist.md`.

---

## Mapas de carga de contexto por tarea (por agente)

La guía de carga de contexto contiene asignaciones detalladas de tipo de tarea a recurso. Estas son las principales:

### Agente backend

| Tipo de tarea | Recursos requeridos |
|---------------|---------------------|
| Creación de API CRUD | `variants/{node,python,rust}/snippets.md` coincidente cuando existe |
| Autenticación | `snippets.md` de la variante coincidente + `tech-stack.md` cuando existe |
| Migración de base de datos | `snippets.md` de la variante coincidente cuando existe |
| Optimización de rendimiento | `orm-reference.md` y cualquier ejemplo coincidente proporcionado por la habilidad |
| Modificación de código existente | Proveedor de inteligencia de código del proyecto y recursos de ejecución relevantes |

### Agente frontend

| Tipo de tarea | Recursos requeridos |
|---------------|---------------------|
| Creación de componentes | `snippets.md` + patrones de componentes existentes del proyecto |
| Implementación de formularios | `snippets.md` (formularios + Zod) |
| Integración de API | `snippets.md` (TanStack Query) |
| Estilos | `tailwind-rules.md` |
| Layout de página | `snippets.md` (grid) |

### Agente de diseño

| Tipo de tarea | Recursos requeridos |
|---------------|---------------------|
| Creación de sistema de diseño | `reference/typography.md` + `reference/color-and-contrast.md` + `reference/spatial-design.md` + `design-md-spec.md` |
| Diseño de landing page | `reference/component-patterns.md` + `reference/motion-design.md` + `prompt-enhancement.md` |
| Auditoría de diseño | `checklist.md` + `anti-patterns.md` |
| Exportación de tokens de diseño | `design-tokens.md` |
| Efectos 3D o shaders | `reference/shader-and-3d.md` + `reference/motion-design.md` |
| Revisión de accesibilidad | `reference/accessibility.md` + `checklist.md` |

### Agente QA

| Tipo de tarea | Recursos requeridos |
|---------------|---------------------|
| Revisión de seguridad | `checklist.md` (sección Security) |
| Revisión de rendimiento | `checklist.md` (sección Performance) |
| Revisión de accesibilidad | `checklist.md` (sección Accessibility) |
| Auditoría completa | `checklist.md` (completo) + `self-check.md` |
| Puntuación de calidad | `quality-score.md` (condicional) |

---

## Composición de prompts del orquestador

Cuando el orquestador compone prompts para subagentes, incluye solo los recursos relevantes para la tarea:

1. Sección Core Rules del `SKILL.md` del agente
2. `execution-protocol.md`
3. Recursos que coinciden con el tipo de tarea concreto (según los mapas anteriores)
4. `error-playbook.md` (siempre incluido; la recuperación es esencial)
5. Memory Protocol (modo CLI)

Esta composición dirigida evita cargar recursos innecesarios y maximiza el contexto disponible para el trabajo real del subagente.

---

## Deuda de clarificación y métricas de sesión (análisis profundo)

Clarification Debt (CD) mide el costo de los requisitos poco claros durante una sesión. El orquestador registra cada corrección del usuario y le asigna una puntuación:

| Tipo de evento | Puntos | Descripción |
|----------------|--------|-------------|
| `clarify` | +10 | Pregunta de aclaración sencilla (esperable con incertidumbre MEDIUM) |
| `correct` | +25 | Malentendido de la intención que requiere cambiar de dirección |
| `redo` | +40 | Incumplimiento de alcance o charter que requiere revertir y reiniciar |
| `blocked` | +0 | El agente se detuvo correctamente y preguntó (buen comportamiento, no se penaliza) |

**Modificadores:** charter no leído (+15), incumplimiento de la lista permitida (+20), mismo error repetido (x1.5).

**Umbrales y aplicación:**
- **CD >= 50** → Se añade una entrada RCA obligatoria a `lessons-learned.md`.
- **CD >= 80** → Se detiene la sesión y el usuario debe volver a especificar los requisitos.
- **`redo` >= 2** → El orquestador pausa y solicita confirmación explícita del alcance.
- **CD >= 30 en 3 sesiones consecutivas para el mismo agente** → Revisión de la plantilla de prompt del agente.

El registro de la sesión se mantiene en `.agents/state/memories/session-metrics.md`, con filas por evento (turno, agente, tipo, puntos y detalle) y una sección de resumen.

---

## Precisión del evaluador y ajuste de QA

Los agentes QA mejoran mediante errores de juicio registrados. A diferencia de CD, Evaluator Accuracy (EA) es retrospectiva: la mayoría de los errores se descubren después de terminar la sesión.

**Tipos de evento EA:**

| Evento | Puntos | Cuándo se descubre |
|--------|--------|--------------------|
| `false_negative` | +30 | En la siguiente sesión o en producción (QA no detectó un bug) |
| `false_positive` | +15 | Durante la sesión (el agente de implementación rebate con éxito el hallazgo de QA) |
| `severity_mismatch` | +10 | Durante la sesión o en la siguiente (se asignó una severidad incorrecta) |
| `missed_stub` | +20 | La verificación en runtime detecta una funcionalidad que solo era de presentación |
| `good_catch` | -10 | QA detectó un bug no evidente (señal positiva) |

**EA se calcula en una ventana móvil de 3 sesiones.** Umbrales:
- **EA >= 30** → Se sugiere un ajuste: revisar los eventos EA acumulados para detectar errores de juicio recurrentes.
- **EA >= 50** → El ajuste es obligatorio: actualizar `execution-protocol.md` de QA.
- **`false_negative` >= 3** en la ventana → Añadir el patrón de detección a `checklist.md` de QA.
- **`good_catch` >= 5** en la ventana → Generalizar el patrón exitoso en `common-checklist.md`.

Cuando se supera un umbral, revisa los eventos EA acumulados, clasifica los errores, actualiza la lista de verificación o el protocolo de ejecución de QA y valida el cambio durante las 3 sesiones siguientes.

---

## Descomposición en sprints para tareas complejas

Las tareas complejas (4 o más archivos y decisiones de arquitectura) usan ejecución por sprints en lugar de una sola ejecución larga:

1. **Descompón** en 2-4 sprints centrados en funcionalidades y comprobables de forma independiente.
2. **Apunta** a 5-8 turnos por sprint.
3. **Puerta de sprint** después de cada sprint:
   - ¿Se completó el entregable del sprint?
   - ¿Pasaron lint/test?
   - Si el sprint tardó el doble de los turnos esperados, escribe un checkpoint e informa al usuario.
4. **Continúa** con el sprint siguiente cuando la puerta pasa.

**Ejemplo:** la tarea "JWT auth + CRUD API + tests" se descompone en:
- Sprint 1: modelo de usuario + endpoints de autenticación (register/login)
- Sprint 2: endpoints CRUD + validación
- Sprint 3: pruebas + manejo de errores

**Recuperación de una clasificación incorrecta:** si una tarea empezó como Simple pero resulta más compleja, el agente cambia al protocolo Medium o Complex y registra el cambio en el progreso.

---

## Protocolo de reinicio de contexto

Los agentes de larga duración pierden calidad cuando el contexto se llena. El orquestador, no el agente, supervisa esta situación y activa reinicios.

**Condiciones de activación (el orquestador las comprueba durante el monitoreo):**

| Condición | Detección | Acción |
|-----------|-----------|--------|
| Agotamiento del presupuesto de turnos | El agente consumió >= 80% de los turnos esperados y los criterios de aceptación están < 50% completos | Reinicio de contexto |
| Estancamiento del progreso | El archivo de progreso no se actualizó durante 3 o más ciclos consecutivos de monitoreo | Reinicio de contexto |
| Salida superficial | El archivo de resultados contiene stubs o marcadores TODO | Volver a generar con una instrucción explícita |

**Procedimiento de reinicio:**
1. **Checkpoint:** guarda el estado actual del agente (elementos completados, pendientes y decisiones clave).
2. **Terminar:** detén la ejecución actual.
3. **Volver a generar:** inicia un agente nuevo con el checkpoint como contexto.
4. **Reanudar:** el agente nuevo lee el checkpoint y continúa solo con los elementos pendientes.

Para agentes independientes (sin orquestador), la puerta de sprint en `difficulty-guide.md` es la red de seguridad. Si un sprint tarda el doble de los turnos esperados, el agente escribe un checkpoint e informa al usuario.
