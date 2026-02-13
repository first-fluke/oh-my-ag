---
title: "Caso de uso: Skill individual"
description: Ruta rapida para trabajo enfocado en un solo dominio con alcance claro y ciclos de retroalimentacion rapidos.
---

# Caso de uso: Skill individual

## Cuando usar esta ruta

Use esta opcion cuando la salida tiene un alcance reducido y es propiedad principalmente de un dominio:

- Un componente de UI
- Un endpoint de API
- Un error en una sola capa
- Una refactorizacion en un solo modulo

Si la tarea requiere coordinacion entre dominios (contrato de API + UI + QA), use [`Proyecto multi-agente`](./multi-agent-project.md).

## Lista de verificacion previa

Antes de escribir el prompt, defina:

1. Salida exacta (archivo o comportamiento)
2. Stack tecnologico y versiones objetivo
3. Criterios de aceptacion
4. Expectativas de pruebas

## Plantilla de prompt

```text
Build <specific artifact> using <stack>.
Constraints: <style/perf/security constraints>.
Acceptance criteria:
1) ...
2) ...
Add tests for: <critical cases>.
```

## Ejemplo de prompt

```text
Create a login form component in React + TypeScript + Tailwind CSS.
Constraints: accessible labels, client-side validation, no external form library.
Acceptance criteria:
1) email and password validation messages
2) disabled submit while invalid
3) keyboard and screen-reader friendly
Add unit tests for valid/invalid submit paths.
```

## Flujo de ejecucion esperado

1. El skill relevante se selecciona automaticamente.
2. El agente propone la implementacion y las suposiciones.
3. Usted confirma o ajusta las suposiciones.
4. El agente entrega el codigo y las pruebas.
5. Usted ejecuta la verificacion local y solicita pequenos ajustes.

## Compuerta de calidad antes del merge

- El comportamiento coincide con los criterios de aceptacion
- Las pruebas cubren la ruta exitosa y los casos limite principales
- No hay cambios en archivos no relacionados
- No hay cambios incompatibles ocultos en modulos compartidos

## Senales de escalacion

Cambie al flujo multi-agente cuando:

- El trabajo de UI requiere nuevos contratos de API
- Una correccion genera cambios en cascada entre capas
- El alcance crece mas alla de un dominio despues de la primera iteracion

## Criterios de finalizacion

La ejecucion de skill individual esta completa cuando:

- El artefacto objetivo esta implementado
- Los criterios de aceptacion estan satisfechos de forma demostrable
- Las pruebas estan agregadas o actualizadas para el comportamiento modificado
