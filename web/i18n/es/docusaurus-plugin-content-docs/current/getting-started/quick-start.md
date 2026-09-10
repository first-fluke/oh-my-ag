---
title: Inicio rápido
description: El camino más corto desde un proyecto vacío hasta un prompt de oh-my-agent verificado, con resultados esperados y pasos de recuperación.
---

# Inicio rápido

Usa esta página para confirmar que el harness funciona antes de leer toda la referencia. Necesitas un directorio de proyecto y al menos un CLI o IDE de IA compatible. El instalador puede preparar `bun`, `uv`, Serena y CUE en macOS, Linux o Windows; la integración con el host seleccionado es necesaria para el primer prompt, mientras que las integraciones de proveedores y del navegador son opcionales.

## 1. Instala el harness del proyecto

Desde el directorio del proyecto, ejecuta el instalador de arranque:

```bash
curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
```

En Windows PowerShell, ejecuta:

```powershell
irm https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.ps1 | iex
```

La configuración interactiva pregunta por el idioma de respuesta, los proveedores de CLI, los proveedores de capacidades, el preset de modelos, el preset de skills del proyecto y cualquier variante de stack. Para la primera ejecución, conserva los valores predeterminados, selecciona el proveedor que ya usas y elige el preset de proyecto más cercano al repositorio.

Si ya tienes `bun`, usa directamente el instalador:

```bash
bunx oh-my-agent@latest
```

Los scripts de arranque instalan en el proyecto actual. Usa `oma install --global` cuando quieras una instalación a nivel de HOME; lee [Instalación](./installation.md) antes de mezclar instalaciones de proyecto y globales.

## 2. Comprueba el resultado

Ejecuta la comprobación de salud desde el mismo directorio del proyecto:

```bash
oma doctor
```

El éxito significa que la integración del proveedor seleccionado y los archivos `.agents/` están listos. Las integraciones opcionales de MCP, navegador, memoria o inteligencia de código pueden aparecer como advertencias; solo hacen falta para tareas que las utilicen. Usa `oma doctor --profile` para inspeccionar el modelo y el CLI resueltos para cada rol de agente canónico.

Si falta el comando, el CLI se instaló fuera de tu `PATH`; abre un shell nuevo o añade el directorio bin del gestor de paquetes. Si `oma doctor` informa de una configuración no válida, corrige el campo indicado y vuelve a ejecutarlo. No borres `.agents/oma-config.yaml` para recuperarte: es la configuración propiedad del usuario que conserva los ajustes entre actualizaciones.

## 3. Ejecuta una tarea pequeña

Abre el repositorio en la herramienta de IA configurada y describe un cambio autocontenido:

```text
Add a validation message to the existing email field. Follow the project's current form and test conventions. Done when the invalid-email case is covered by a focused test.
```

Cuando el hook de palabras clave está habilitado para el host seleccionado, puede activar un flujo de trabajo coincidente. El host o el flujo seleccionado realiza el enrutamiento de skills, por lo que un prompt arbitrario del host no garantiza un hook, una skill concreta ni un `CHARTER_CHECK`. El contrato de ejecución debe revisar aun así las convenciones del repositorio, hacer solo el cambio dentro del alcance e informar de su verificación. Los archivos y comandos exactos dependen del proyecto; el prompt anterior es ilustrativo.

Para una tarea que cruce los límites de API y UI, selecciona `/work` o `/orchestrate` explícitamente. Para un solo dominio, continúa con [Ejecución de una skill](../guide/single-skill.md). La [Guía de uso](../guide/usage.md) contiene ejemplos más largos.

## 4. Conoce los valores predeterminados antes de escalar

OMA empieza con `model_preset: auto`, Serena para la inteligencia de código, Agent Memory para la memoria semántica, búsqueda web nativa y la telemetría desactivada. Serena usa el transporte compartido `bridge` y se actualiza automáticamente, salvo que se configure de otro modo. El MCP de DevTools del navegador está desactivado por defecto; una configuración interactiva nueva ofrece Aside primero. Consulta [Valores predeterminados importantes](./important-defaults.md) para conocer las consecuencias y las claves de sobrescritura.

Si una tarea gestionada se atasca, empieza con `oma agent status <session-id> [agent-id]` y después inspecciona su receipt, el registro de ejecución en `.agents/state/agent-runs/`, y la ruta de claim inyectada, que contiene la declaración estructurada de resultados. Esos registros muestran la ejecución, la tarea, el workspace, el código de salida y el estado de verificación. Los archivos legibles `result-*.md` y `progress-*.md` de `.agents/state/memories/` aportan contexto cuando existen. Vuelve a ejecutar solo el comando fallido más pequeño después de confirmar que la ejecución ya no está activa. Un flujo persistente sigue activo hasta completarse o hasta que digas `workflow done`; consulta [Flujos de trabajo](../core-concepts/workflows.md#persistent-mode-mechanics) para recuperar el archivo de estado.

## Próximos pasos

- [Valores predeterminados importantes](./important-defaults.md) para la precedencia, los proveedores y las opciones de recuperación
- [Instalación](./installation.md) para presets, configuración de proveedores, instalaciones globales y actualizaciones
- [Agentes](../core-concepts/agents.md) para los 33 paquetes de skills y los roles de despacho
- [Flujos de trabajo](../core-concepts/workflows.md) para planificación, ejecución paralela, QA y modos persistentes
