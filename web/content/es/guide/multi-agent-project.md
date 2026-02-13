---
title: "Caso de uso: Proyecto multi-agente"
description: Flujo de extremo a extremo para entregas complejas entre dominios con compuertas de coordinacion explicitas.
---

# Caso de uso: Proyecto multi-agente

## Cuando usar esta ruta

Use esta opcion cuando una funcionalidad abarca multiples dominios (por ejemplo backend + frontend + QA) y la ejecucion paralela es beneficiosa.

## Modelo de coordinacion

Secuencia recomendada:

1. `/plan` para la descomposicion y mapeo de dependencias
2. `/coordinate` para el orden de ejecucion y asignacion de responsabilidades
3. `agent:spawn` en paralelo por dominio
4. `/review` para la compuerta de QA/seguridad/rendimiento

## Estrategia de sesion y espacios de trabajo

Use un ID de sesion por flujo de funcionalidad:

```text
session-auth-v2
```

Asigne espacios de trabajo aislados por dominio para reducir conflictos de merge:

- backend: `./apps/api`
- frontend: `./apps/web`
- mobile: `./apps/mobile`

## Ejemplo de creacion de agentes

```bash
oh-my-ag agent:spawn backend "Implement JWT auth API + refresh flow" session-auth-v2 -w ./apps/api
oh-my-ag agent:spawn frontend "Build login + refresh UX with error states" session-auth-v2 -w ./apps/web
oh-my-ag agent:spawn qa "Review auth risks, test matrix, and regression scope" session-auth-v2
```

## Regla de contratos primero

Antes de codificar en paralelo, fije los contratos compartidos:

- Esquemas de solicitud/respuesta
- Codigos de error y mensajes
- Suposiciones del ciclo de vida de autenticacion/sesion

Si los contratos cambian durante la ejecucion, pause los agentes dependientes y reemita los prompts con el contrato actualizado.

## Compuertas de merge

No haga merge a menos que todas las compuertas pasen:

1. Las pruebas a nivel de dominio pasan
2. Los puntos de integracion coinciden con los contratos acordados
3. Los problemas de QA altos/criticos estan resueltos o explicitamente exceptuados
4. El changelog o notas de release estan actualizados cuando hay cambios visibles externamente

## Anti-patrones operacionales

Evite:

- Compartir un espacio de trabajo entre todos los agentes
- Cambiar contratos sin notificar a los demas agentes
- Hacer merge de backend/frontend de forma independiente antes de verificar la compatibilidad

## Criterios de finalizacion

La ejecucion multi-agente esta completa cuando:

- Las tareas planificadas estan completas en todos los dominios
- La integracion entre dominios esta validada
- La aprobacion de QA (o la aceptacion documentada de riesgos) esta registrada
