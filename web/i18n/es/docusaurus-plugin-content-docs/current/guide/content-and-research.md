---
title: "Guía: Flujos de contenido e investigación"
sidebar_label: Descripción general
description: Elige la ruta adecuada de oh-my-agent para extraer PDF y HWP, trabajar con voz, investigar bibliografía, crear diapositivas, resumir, traducir y redactar textos académicos.
---

# Flujos de contenido e investigación

Esta guía dirige el trabajo con documentos, audio, investigación y presentaciones hacia la capacidad que lo gestiona. Empieza por el artefacto que necesitas y después usa el comando o punto de entrada de skill más pequeño que produzca un resultado revisable.

| Necesidad | Punto de entrada | Primer resultado |
|---|---|---|
| Extraer un PDF | skill `oma-pdf` o los comandos `uvx opendataloader-pdf` de abajo | Markdown, texto, JSON o un informe breve de extracción |
| Extraer HWP/HWPX/HWPML | skill `oma-hwp` y `bunx kordoc@latest` | Markdown o JSON/chunks estructurados |
| Generar voz o transcribir audio | `/oma-voice` | Audio con manifest, o `transcript.md` con manifest |
| Buscar y validar artículos | `oma scholar` | Resultados de búsqueda, un sidecar recuperado o un informe de lint |
| Crear una presentación | skill `oma-slide` y `oma slide` | Diapositivas HTML validadas y exportaciones opcionales |
| Resumir conversaciones de agentes | `oma recap` | Recap en Markdown fechado con estado de evidencia |
| Traducir o revisar prosa localizada | skill `oma-translation` | Texto en el idioma de destino o revisión respaldada por evidencia |
| Redactar o auditar prosa académica | skill `oma-academic-writing` | Borrador, revisión o informe de cumplimiento con Claim-Evidence Map |

Los nombres de comandos `oma` de esta página son comandos públicos registrados. `uvx`, `bunx` y `bun` son herramientas externas de conversión documentadas por las skills que las gestionan. Las demás skills son puntos de entrada de lenguaje natural o de barra; no existe un comando independiente `oma pdf`, `oma hwp`, `oma voice`, `oma translation` ni `oma academic-writing`.

## Extraer contenido PDF {#extract-pdf-content}

Usa la skill `oma-pdf` cuando la entrada sea un PDF y la salida necesite una estructura legible para una persona, un LLM o un pipeline de recuperación. La skill examina primero la capa de texto antes de elegir extracción estándar, etiquetada o OCR híbrida.

Para comprobar rápidamente la capa de texto, muestra un rango pequeño de páginas sin crear un archivo de salida:

```bash
uvx opendataloader-pdf "<input.pdf>" -f text --pages 1-3 --to-stdout -q
```

Para extraer y normalizar Markdown:

```bash
OUT=".agents/results/pdf/<document>"
uvx opendataloader-pdf "<input.pdf>" --format markdown --output-dir "$OUT"
uvx mdformat "$OUT/<document>.md"
```

Elige un rango con `--pages` para documentos grandes. Si la capa de texto es legible, mantén la extracción estándar. Si existe estructura etiquetada pero el orden de lectura es incorrecto, vuelve a intentarlo con `--use-struct-tree`; para tablas rotas, prueba `--table-method cluster` o `--markdown-with-html` antes de cambiar a OCR.

Para un PDF escaneado o basado en imágenes, inicia el servidor híbrido y después ejecuta el conversor híbrido:

```bash
# Terminal 1: leave this local server running while the conversion runs.
uvx --from "opendataloader-pdf[hybrid]" opendataloader-pdf-hybrid \
  --port 5002 --force-ocr --ocr-lang "ko,en"
```

En un segundo terminal, define el directorio de salida y ejecuta el conversor:

```bash
OUT=".agents/results/pdf/<document>"
uvx opendataloader-pdf --hybrid docling-fast --hybrid-mode full \
  "<input.pdf>" --format markdown --output-dir "$OUT"
```

El artefacto correcto es el archivo Markdown o de texto del directorio de salida elegido, acompañado por el número de páginas y cualquier nota de calidad. Los PDF cifrados requieren una copia desbloqueada o una contraseña. Los archivos grandes pueden necesitar rangos de páginas y directorios de salida separados para que las ejecuciones repetidas no sobrescriban el mismo nombre base. No trates las conjeturas del OCR como hechos de la fuente; informa de las tablas inciertas o ausentes.

## Extraer documentos de la familia HWP {#extract-hwp-family-documents}

Usa `oma-hwp` para archivos `.hwp`, `.hwpx` y `.hwpml`. Ejecuta `kordoc` mediante Bun y después procesa las tablas Markdown y los glifos del Área de Uso Privado cuando hace falta.

```bash
OUT=".agents/results/hwp/<document>.md"
bunx kordoc@latest "<input.hwp>" -o "$OUT"

# The skill's cleanup helper; set this to the project or global oma-hwp skill directory.
HWP_SKILL_DIR=".agents/skills/oma-hwp"
bun "$HWP_SKILL_DIR/resources/flatten-tables.ts" "$OUT"
```

En un clon nuevo, el helper puede informar `Cannot find module "turndown"`; ejecuta `bun install` en el directorio `resources/` de la skill `oma-hwp` y vuelve a ejecutar el helper.

Usa un directorio de salida explícito para un lote:

```bash
bunx kordoc@latest "./incoming/*.hwpx" -d ".agents/results/hwp"
```

La salida predeterminada es Markdown. Solicita `json` para un AST estructurado o `chunks` para fragmentos orientados a recuperación cuando necesites esos formatos. Las opciones de conversión `--dedupe-headers`, `--keep-empty-cols` y `--inline-images` controlan casos habituales de tablas e imágenes. Comprueba encabezados, tablas anidadas o combinadas, listas, imágenes, notas al pie y enlaces antes de entregar el resultado a otra skill.

`bun` y `bunx` son requisitos previos. Una salida vacía puede indicar contenido escaneado como imagen; dirige ese caso a un flujo con OCR. El material cifrado o limitado por DRM puede quedar incompleto. Las entradas PDF, DOCX y XLSX corresponden a sus skills respectivas, aunque `kordoc` tenga otros subcomandos de autoría y análisis.

## Generar voz o transcribir audio {#generate-speech-or-transcribe-audio}

`oma-voice` es nativa de MCP y usa un servidor Voicebox local. Invócala desde un agente con un comando de barra:

```text
/oma-voice "The build is ready for review."
/oma-voice --profile prof_warm_korean "다음 단계 진행 준비됐어요"
/oma-voice transcribe ~/Downloads/standup.m4a
```

TTS acepta hasta 5.000 caracteres por llamada y necesita un perfil de voz de Voicebox. La transcripción no necesita un perfil TTS y acepta audio de hasta 30 minutos. El trabajo TTS y STT persistido se guarda bajo `.agents/results/voice/`; la transcripción produce `transcript.md` y `manifest.json`. El modo de notificación normalmente se queda en Voicebox Captures y no escribe un archivo de audio local.

El endpoint MCP local es `http://127.0.0.1:17493/mcp`. La configuración de primer uso registra Voicebox en el agente y la aplicación de escritorio de Voicebox proporciona los perfiles de voz. La skill descubre los nombres reales de las herramientas MCP con `tools/list` y después llama a `voicebox_speak`, `voicebox_transcribe` o `voicebox_list_profiles`. Si TTS no tiene perfil, crea o selecciona uno en Voicebox; dividir una solicitud demasiado larga es decisión del usuario porque la skill no la divide automáticamente. Si el servidor no está disponible, comprueba el endpoint de salud local y reinicia Voicebox antes de reintentarlo.

## Buscar y validar material académico {#search-and-validate-scholarly-material}

Usa el CLI `oma scholar` para sidecars de Knows y metadatos de artículos. Search y resolve son operaciones de descubrimiento; `get` recupera un registro o una sección seleccionada; `lint` es el control previo a compartir.

```bash
oma scholar search "vision language action" --limit 10
oma scholar search --year-min 2024 "vision language action"
oma scholar resolve "Attention Is All You Need"
oma scholar get "10.48550/arXiv.1706.03762"
oma scholar get --section statements "knows:generated/reconvla/1.0.0"
oma scholar lint paper.knows.yaml
oma scholar lint --lenient paper.knows.yaml
oma scholar lint --fail-on-warning paper.knows.yaml
```

Primero se intenta Knows, con fallbacks a OpenAlex y Semantic Scholar. `--section` puede solicitar `statements`, `evidence`, `relations`, `artifacts` o `citation`. Usa `--lenient` cuando durante el ensamblado local esperes referencias cruzadas colgantes; usa `--fail-on-warning` como gate estricto de CI. Un resultado de búsqueda o un sidecar recuperado es evidencia de descubrimiento, no una afirmación de que el artículo respalde todas las conclusiones. Genera o revisa el sidecar en el agente y ejecuta `oma scholar lint` antes de compartirlo.

Si un servicio remoto agota el tiempo, reintenta una consulta más amplia o permite el fallback del CLI. Un 429 de Semantic Scholar puede ser un límite del grupo anónimo; reintenta más tarde o configura su clave API. Si un sidecar tiene un error de enum de procedencia, usa `tool`, `person` u `org`; si persisten advertencias de densidad de relaciones, añade relaciones de evidencia respaldadas solo donde la fuente las admita.

## Diapositivas y presentaciones {#slides-and-presentations}

Usa `oma-slide` cuando el entregable sea una presentación de escenario fijo. La skill de autoría escribe fragmentos HTML a 1920×1080; el CLI valida la geometría, empaqueta el deck y lo exporta.

```bash
DECK_DIR=".agents/results/slides/<session-id>"
oma slide create --output-dir "$DECK_DIR"
# author slide-01.html and meta.json in "$DECK_DIR"
oma slide validate --workspace "$DECK_DIR" --output json
oma slide preview --workspace "$DECK_DIR"
oma slide bundle --workspace "$DECK_DIR"
```

Exporta solo después de validar:

```bash
oma slide export pdf --workspace "$DECK_DIR" --output-file "$DECK_DIR/out/deck.pdf" --mode capture
oma slide export png --workspace "$DECK_DIR" --output-dir "$DECK_DIR/out/png" --resolution 1080p
oma slide export pptx --workspace "$DECK_DIR" --output-file "$DECK_DIR/out/deck.pptx"
```

Usa `--slide <file>` para comprobar una sola diapositiva y `--report-file <path>` con salida JSON cuando otro proceso necesite los hallazgos. `slide import pptx <file>` inicia un flujo de importación; `slide asset fetch-video <url>` descarga un recurso de vídeo; `slide style list|preview|get <slug>` inspecciona estilos. La salida PPTX está respaldada por raster, así que no proporciona texto ni capas de formas editables. La validación y la exportación necesitan Chrome/puppeteer; define `OMA_CHROME_PATH` cuando el ejecutable no se pueda descubrir. Si la validación no converge después de tres iteraciones de autocorrección, usa los hallazgos de geometría informados para editar el fragmento afectado.

## Recaps de conversaciones de agentes

Usa `oma recap` para resúmenes de trabajo basados en evidencia. Una fecha de calendario y una ventana móvil son entradas diferentes:

```bash
# A calendar day
oma recap --date "$(date +%F)" --json

# A rolling 24-hour window ending now
oma recap --json

# A rolling multi-day window, capped at 30 days
oma recap --window 7d --tool claude,codex --json
```

El resultado se guarda bajo `.agents/results/recap/`, normalmente como `{date}.md` para un recap diario o `{start-date}~{end-date}.md` para un rango. El recap agrupa por contenido del trabajo, separa el trabajo solicitado y en curso del completado y registra la falta de historial de herramientas. Usa `--top`, `--sort`, `--mermaid` o `--graph` cuando el informe necesite una vista más acotada o visual. Si el CLI no está disponible, la skill puede usar el fallback de historial de Claude documentado, pero debe indicar la cobertura reducida de la fuente.

Usa `oma retro` para una retrospectiva de ingeniería basada en Git. Responde a una pregunta distinta de la recapitulación de conversaciones y puede comparar ventanas contiguas con `--compare`.

## Traducir o revisar contenido localizado

Usa `oma-translation` para strings de UI, documentación, informes, copy de marketing o prosa académica. Invócala en lenguaje natural o con el punto de entrada `/oma-translation`; no existe un comando público `oma translation`.

Indica a la skill la fuente, el locale de destino, el tipo de contenido y si se trata de traducción, revisión o sincronización con un diff de fuente. Carga un perfil de idioma coincidente cuando existe, conserva placeholders, enlaces, estructura Markdown y sintaxis protegida, y sigue las traducciones hermanas y el glosario del proyecto. Para un documento largo o una revisión también aplica la rúbrica de traducción. Si no existe un perfil para el destino, usa las reglas compartidas e informa de ese límite una vez.

Para documentación, traduce la página estable en inglés después de fijar sus anclas y ejemplos de comandos. Mantén exactos los nombres de CLI, flags, rutas, variables de entorno y bloques de código; traduce la explicación que los rodea y comprueba la estructura de la página de destino frente a la inglesa. Un significado ambiguo de la fuente debe marcarse, no adivinarse en silencio.

## Redactar o auditar prosa académica

Usa `oma-academic-writing` para ensayos, informes, revisiones bibliográficas, análisis, resúmenes ejecutivos, conclusiones y revisiones en inglés. Selecciona un modo y proporciona la rúbrica o las restricciones de la fuente:

```text
Draft a literature review in draft mode from these sources. Include a Claim-Evidence Map.
Revise this section in revise mode against the quoted rubric below.
Review this draft in review mode and return the compliance report with recommended fixes.
```

`draft` devuelve prosa, Writing Notes y un Claim-Evidence Map. `revise` devuelve los bloques original y revisado junto con cambios concretos. `review` devuelve hallazgos PASS/FAIL sobre estructura de frases, verbos, hedging, especificidad, patrones anti-IA, claridad de párrafos, ritmo y alineación entre claims y evidencia. La skill lee por completo un borrador existente para revise/review, debilita o elimina claims sin respaldo y entrega la salida no inglesa a `oma-translation` después del paso en inglés.

Usa `oma scholar` para descubrir fuentes y evidencia del sidecar antes de redactar. Si falta una cita o una rúbrica, marca el claim como pendiente o solicita la restricción que falta; no llenes el hueco con una fuente inventada. El artefacto útil de finalización es la prosa junto con el mapa de evidencia o el informe de auditoría, no un párrafo genéricamente «pulido» sin soporte rastreable.

## Lista de recuperación

| Síntoma | Siguiente acción |
|---|---|
| La salida está vacía o tiene una estructura incorrecta | Comprueba el tipo de entrada y elige el modo etiquetado, de tablas u OCR para PDF; en HWP verifica Bun e inspecciona si las páginas solo contienen imágenes. |
| Una skill local no puede conectarse | Comprueba el servicio o CLI local propietario (`Voicebox`, `Chrome`, `uvx`, `bunx`) antes de cambiar la solicitud de contenido. |
| Un resultado de investigación es escaso | Amplía la consulta, inspecciona el estado del fallback o la fuente y conserva la incertidumbre en el informe. |
| Falla una exportación de diapositivas | Ejecuta `oma slide validate --workspace <dir> --output json`, corrige los hallazgos de geometría o fuentes y exporta de nuevo. |
| Un recap exagera la finalización | Vuelve a comprobar receipts y artefactos; un prompt o una invocación de herramienta por sí solos no demuestran finalización. |
| Una traducción cambia la sintaxis del código | Restaura los nombres protegidos y vuelve a ejecutar las comprobaciones de estructura antes de revisar la calidad de la prosa. |
| La prosa académica contiene claims sin respaldo | Elimina o matiza el claim, añade evidencia por la ruta de scholar y vuelve a ejecutar el Claim-Evidence Map. |

Para consultar todas las rutas de CLI y sus alias de opciones, consulta [Comandos CLI](../cli-interfaces/commands.md) y [Opciones CLI](../cli-interfaces/options.md).
