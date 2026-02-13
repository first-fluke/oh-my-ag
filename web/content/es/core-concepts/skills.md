---
title: Skills
description: Divulgacion progresiva y arquitectura de skills optimizada en tokens.
---

# Skills

## Divulgacion progresiva

Los skills se seleccionan a partir de la intencion de la solicitud. La seleccion manual de skills generalmente no es necesaria.

## Diseno de dos capas

Cada skill utiliza un **diseno de dos capas optimizado en tokens**:

| Capa | Contenido | Tamano |
|------|-----------|--------|
| `SKILL.md` | Identidad, condiciones de enrutamiento, reglas principales | ~40 lineas (~800B) |
| `resources/` | Protocolos de ejecucion, ejemplos, listas de verificacion, guias, fragmentos, stack tecnologico | Carga bajo demanda |

Esto logra un **ahorro de ~75% en tokens** en la carga inicial del skill (3-7KB -> ~800B por skill).

## Capa de recursos compartidos (`_shared/`)

Recursos comunes deduplicados entre todos los skills:

| Recurso | Proposito |
|---------|-----------|
| `reasoning-templates.md` | Plantillas estructuradas de completar espacios para razonamiento de multiples pasos |
| `clarification-protocol.md` | Cuando preguntar vs. asumir, niveles de ambiguedad |
| `context-budget.md` | Estrategias de lectura de archivos eficientes en tokens por nivel de modelo |
| `context-loading.md` | Mapeo de tipo de tarea a recurso para la construccion de prompts del orquestador |
| `skill-routing.md` | Mapeo de palabras clave a skills y reglas de ejecucion paralela |
| `difficulty-guide.md` | Evaluacion Simple/Medio/Complejo con bifurcacion de protocolo |
| `lessons-learned.md` | Problemas de dominio acumulados entre sesiones |
| `verify.sh` | Script de verificacion automatizada ejecutado tras la finalizacion del agente |
| `api-contracts/` | El PM crea contratos, backend los implementa, frontend/mobile los consume |
| `serena-memory-protocol.md` | Protocolo de lectura/escritura de memoria en modo CLI |
| `common-checklist.md` | Verificaciones universales de calidad de codigo |

## Recursos por skill

Cada skill proporciona recursos especificos de dominio:

| Recurso | Proposito |
|---------|-----------|
| `execution-protocol.md` | Flujo de trabajo de cadena de pensamiento en 4 pasos (Analizar -> Planificar -> Implementar -> Verificar) |
| `examples.md` | 2-3 ejemplos de entrada/salida tipo few-shot |
| `checklist.md` | Lista de autoverificacion especifica del dominio |
| `error-playbook.md` | Recuperacion de fallos con regla de escalacion de "3 intentos" |
| `tech-stack.md` | Especificaciones tecnologicas detalladas |
| `snippets.md` | Patrones de codigo listos para copiar y pegar |

## Por que es importante

Esto mantiene el contexto inicial liviano mientras soporta ejecucion profunda cuando se requiere.
