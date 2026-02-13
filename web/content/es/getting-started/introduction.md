---
title: Introduccion
description: Que es oh-my-ag y como funciona la colaboracion multi-agente.
---

# Introduccion

oh-my-ag es un orquestador multi-agente para Antigravity IDE. Enruta solicitudes a skills especializados y coordina agentes a traves de las memorias de Serena.

## Que obtiene

- Enrutamiento de skills basado en la solicitud
- Ejecucion basada en flujos de trabajo para planificacion/revision/depuracion
- Orquestacion CLI para ejecuciones paralelas de agentes
- Paneles de control en tiempo real para monitoreo de sesiones

## Roles de agentes

| Agente | Responsabilidad |
|--------|----------------|
| workflow-guide | Coordina proyectos complejos multi-dominio |
| pm-agent | Planificacion y descomposicion de arquitectura |
| frontend-agent | Implementacion React/Next.js |
| backend-agent | Implementacion de API/base de datos/autenticacion |
| mobile-agent | Implementacion Flutter/mobile |
| qa-agent | Revision de seguridad/rendimiento/accesibilidad |
| debug-agent | Analisis de causa raiz y correcciones seguras contra regresiones |
| orchestrator | Orquestacion de sub-agentes basada en CLI |
| commit | Flujo de trabajo de commits convencionales |

## Estructura del proyecto

- `.agent/skills/`: definiciones de skills y recursos
- `.agent/workflows/`: comandos de flujo de trabajo explicitos
- `.serena/memories/`: estado de orquestacion en tiempo de ejecucion
- `cli/cli.ts`: fuente de verdad para las interfaces de comandos

## Divulgacion progresiva

1. Identificar la intencion de la solicitud
2. Cargar solo los recursos de skill necesarios
3. Ejecutar con agentes especializados
4. Verificar e iterar mediante ciclos de QA/depuracion
