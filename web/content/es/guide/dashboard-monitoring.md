---
title: "Caso de uso: Monitoreo con panel de control"
description: Operar sesiones del orquestador con paneles de terminal/web y senales de runbook accionables.
---

# Caso de uso: Monitoreo con panel de control

## Comandos de inicio

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

URL predeterminada del panel web: `http://localhost:9847`

## Disposicion de terminal recomendada

Use al menos 3 terminales:

1. Panel de control en terminal (`oh-my-ag dashboard`)
2. Comandos de creacion de agentes
3. Registros de pruebas/compilacion

Mantenga el panel web abierto para visibilidad compartida durante sesiones de equipo.

## Que monitorean los paneles

Fuente de datos: `.serena/memories/`

Senales principales:

- Estado de la sesion (`running`, `completed`, `failed`)
- Asignacion del tablero de tareas y cambios de estado
- Turnos de progreso por agente
- Eventos de publicacion de resultados

Las actualizaciones son dirigidas por eventos desde archivos modificados; no se requiere un ciclo de sondeo completo del directorio.

## Runbook: senal -> accion

- `No agents detected`
  - Verifique que los agentes fueron creados con el mismo `session-id`
  - Confirme que se esta escribiendo en `.serena/memories/`
- `Session stuck in running`
  - Inspeccione las marcas de tiempo de los archivos `progress-*` mas recientes
  - Reinicie el agente fallido o bloqueado con un prompt mas claro
- `Frequent reconnects (web)`
  - Verifique el firewall/proxy local
  - Reinicie `dashboard:web` y vuelva a abrir la pagina
- `Missing activity while agents are active`
  - Verifique que las escrituras del orquestador no se esten redirigiendo a otro espacio de trabajo

## Lista de verificacion pre-merge

- Todos los agentes requeridos alcanzaron el estado completado
- No hay hallazgos de QA de alta severidad sin resolver
- Los archivos de resultados mas recientes estan presentes para cada agente
- Las pruebas de integracion se ejecutaron despues de las salidas finales de los agentes

## Criterios de finalizacion

La fase de monitoreo esta completa cuando:

- La sesion alcanzo un estado terminal (`completed` o detenida intencionalmente)
- El historial de actividad explica la procedencia de la salida final
- La decision de release/merge se toma con visibilidad completa del estado
