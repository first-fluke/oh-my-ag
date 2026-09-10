---
title: "Anleitung: Bildgenerierung"
sidebar_label: Bildgenerierung
description: Vollständige Anleitung zur Bildgenerierung in oh-my-agent mit Multi-Vendor-Dispatch über Codex (gpt-image-2), Pollinations (flux/zimage, kostenlos) und Antigravity über Gemini Code Assist, Referenzbildern, Kosten-Guardrails, Output-Layout, Troubleshooting und gemeinsamen Aufrufmustern.
---

# Bildgenerierung

`oma-image` ist der Multi-Vendor-Bildrouter für oh-my-agent. Er erzeugt Bilder aus natürlichsprachlichen Prompts, leitet die Anfrage an die Vendor-CLI weiter, bei der Sie authentifiziert sind, und schreibt neben dem Output ein Manifest mit den Eingaben und Anbieterentscheidungen, die zur Prüfung oder Wiederholung eines Laufs erforderlich sind. Die Ausgabe eines Live-Anbieters kann dennoch variieren.

Der Skill aktiviert sich automatisch bei Keywords wie *image*, *illustration*, *visual asset*, *concept art* oder wenn ein anderer Skill ein Bild als Nebeneffekt benötigt (Hero-Shot, Thumbnail, Produktfoto).

---

## Wann verwenden

- Generieren von Bildern, Illustrationen, Produktfotos, Concept Art, Hero-/Landing-Visuals
- Vergleich desselben Prompts über mehrere Modelle hinweg (`--vendor all`)
- Erzeugen von Assets aus einem Editor-Workflow heraus (Claude Code, Codex, Gemini CLI)
- Ein anderer Skill (Design, Marketing, Docs) ruft die Bildpipeline als gemeinsame Infrastruktur auf

## Wann NICHT verwenden

- Bearbeiten oder Retuschieren eines vorhandenen Bildes — außerhalb des Geltungsbereichs (dediziertes Tool verwenden)
- Erzeugen von Videos oder Audio — außerhalb des Geltungsbereichs
- Inline-SVG-/Vektor-Komposition aus strukturierten Daten — Templating-Skill verwenden
- Einfaches Resize / Format-Konvertierung — eine Bildbibliothek verwenden, nicht eine Generierungspipeline

---

## Vendoren im Überblick

Der Skill ist CLI-first: Wenn die native CLI eines Vendors rohe Bild-Bytes zurückgeben kann, wird der Subprozess-Pfad gegenüber einem direkten API-Key bevorzugt.

| Vendor | Strategie | Modelle | Trigger | Kosten |
|---|---|---|---|---|
| `pollinations` | Direktes HTTP | Kostenlos: `flux`, `zimage`. Credit-pflichtig: `qwen-image`, `wan-image`, `gpt-image-2`, `klein`, `kontext`, `gptimage`, `gptimage-large` | `POLLINATIONS_API_KEY` gesetzt (kostenlose Anmeldung unter https://enter.pollinations.ai) | Kostenlos für `flux` / `zimage` |
| `codex` | CLI-first — `codex exec` über ChatGPT OAuth | `gpt-image-2` | `codex login` (kein API-Key erforderlich) | Wird Ihrem ChatGPT-Plan in Rechnung gestellt |
| `antigravity` | `agy`-CLI über das Gemini-Code-Assist-Abonnement | Das Modell wird intern von `agy` ausgewählt | `agy` installiert und angemeldet | Keine Kosten pro Bild über Code Assist |

Der integrierte Vendor-Modus ist `auto`: Er führt die Anbieter aus, die ihre Gesundheitsprüfungen bestehen. Die Pollinations-Modelle `flux` und `zimage` sind pro Bild kostenlos, benötigen aber weiterhin einen `POLLINATIONS_API_KEY`; Codex und Antigravity erfordern jeweils eine eigene Anmeldung. Kostenschätzungen für kostenpflichtige Läufe verwenden weiterhin das Kostenbestätigungs-Gate.

---

## Schnellstart

```bash
oma image doctor

# Pollinations: create a free account and export its key.
export POLLINATIONS_API_KEY="<pollinations-key>"

# Or authenticate an alternative provider instead.
codex login
# Sign in to Gemini Code Assist for `agy` when using --vendor antigravity.
```

```bash
# Auto-selects the healthy provider; cost and auth depend on that provider.
oma image generate "minimalist sunrise over mountains"

# Run all configured vendors; every selected vendor must be healthy or the command stops.
oma image generate "cat astronaut" --vendor all

# Specific vendor + size + count, skip cost prompt
oma image generate "logo concept" --vendor codex --size 1024x1024 -n 3 -y

# Cost estimate without spending
oma image generate "test prompt" --dry-run

# Inspect authentication and install status per vendor
oma image doctor

# List registered vendors and supported models
oma image vendor list
```

`oma img` ist ein Alias für `oma image`.

---

## Als Skill verwenden

`oma-image` ist ein Skill — er aktiviert sich automatisch aus natürlicher Sprache und kann auch explizit aufgerufen werden. Es gibt drei Einstiegspunkte.

### 1. Natürliche Sprache (automatische Aktivierung)

Beschreiben Sie das Bild einfach in Claude Code, Codex CLI oder Gemini CLI. Der Skill matcht Keywords wie *image*, *illustration*, *visual asset*, *concept art*, *hero shot*, *thumbnail*, *product photo*.

Sie müssen sich keine CLI-Flags merken — formulieren Sie es in Alltagssprache und der Skill bildet es auf die passenden Optionen ab:

| Sie sagen | Skill leitet ab |
|---|---|
| "mit codex" / "mit gpt-image-2" / "kostenloses flux" | `--vendor codex` / `--vendor pollinations` |
| "über Vendoren vergleichen" / "nebeneinander" | `--vendor all` |
| "Hochformat" / "Querformat" / "1024×1536" | `--size 1024x1536` / `--size 1536x1024` |
| "hohe Qualität" / "Entwurf" | `--quality high` / `--quality low` |
| "drei Varianten" / "gib mir 3" | `-n 3` |
| "in ./hero speichern" / "Output nach docs/assets" | `--output-dir <dir>` |
| Angehängtes Bild + "mach es nächtlich" | `-r <attached path>` |
| "nur Kosten schätzen" / "dry run" | `--dry-run` |

Beispiele:

> "Generiere einen minimalistischen Sonnenaufgang über Bergen für den Landing-Hero, Querformat, hohe Qualität."
> "Vergleiche ein Produktfoto einer Keramiktasse über alle Vendoren, jeweils drei Varianten."
> "Mach dieses Otterfoto mit codex dramatisch und nächtlich." (mit angehängter Referenz)

Der Agent durchläuft das [Klärungsprotokoll](#clarification-protocol), erweitert den Prompt bei Bedarf und ruft `oma image generate` mit den abgeleiteten Flags auf. Verwenden Sie den Slash-Befehl, wenn Sie die exakten Flag-Werte explizit kontrollieren möchten.

### 2. Expliziter Slash-Befehl

```text
/oma-image a red apple on white background
/oma-image --vendor all --size 1536x1024 jeju coastline at sunset
/oma-image -n 3 --quality high --output-dir ./hero "minimalist dashboard hero illustration"
```

Jeder CLI-Flag (`--vendor`, `-n`, `--size`, `-r`, `--dry-run`, …) funktioniert auch im Slash-Befehl — er wird an dieselbe `oma image generate`-Pipeline weitergeleitet.

### 3. Aus einem anderen Skill (gemeinsame Infrastruktur)

Andere Skills (Design, Marketing, Docs) rufen die Pipeline als gemeinsame Infrastruktur mit JSON-Output auf:

```bash
oma image generate "<prompt>" --output json
```

Das auf stdout geschriebene Manifest enthält Output-Pfade, Vendor, Modell und Kosten — leicht zu parsen und zu verketten.

---

## CLI-Referenz

```bash
oma image generate "<prompt>"
  [--vendor auto|codex|pollinations|antigravity|all]
  [-n 1..5]
  [--size 1024x1024|1024x1536|1536x1024|auto]
  [--quality low|medium|high|auto]
  [--output-dir <dir>] [--allow-external-output]
  [-r <path>]...
  [--timeout 180] [-y] [--no-prompt-in-manifest]
  [--dry-run] [--output text|json]

oma image doctor
oma image vendor list
```

### Wichtige Flags

| Flag | Zweck |
|---|---|
| `--vendor <name>` | `auto`, `pollinations`, `codex`, `antigravity` oder `all`. Bei `all` muss jeder angeforderte Vendor gesund sein (strict). |
| `-n, --count <n>` | Anzahl der Bilder pro Vendor, 1–5 (durch Wall-Time begrenzt). |
| `--size <size>` | Seitenverhältnis: `1024x1024` (quadratisch), `1024x1536` (Hochformat), `1536x1024` (Querformat) oder `auto`. |
| `--quality <level>` | `low`, `medium`, `high` oder `auto` (Vendor-Standard). |
| `--output-dir <dir>` | Output-Verzeichnis. Standard ist `.agents/results/images/{timestamp}/`. Pfade außerhalb von `$PWD` erfordern `--allow-external-output`. |
| `--allow-external-output` | Erlaubt ein Output-Verzeichnis außerhalb von `$PWD`. |
| `--model <name>` | Überschreibt das Modell des ausgewählten Vendors für diesen Lauf. `antigravity` ignoriert dies, weil `agy` sein Modell auswählt. |
| `-r, --reference <path>` | Bis zu 10 Referenzbilder (PNG/JPEG/GIF/WebP, je ≤ 5 MB). Wiederholbar oder kommagetrennt. Unterstützt von `codex` und `antigravity`; bei `pollinations` abgelehnt. |
| `-y, --yes` | Überspringt die Kostenbestätigungsabfrage für Läufe mit geschätzten Kosten ≥ `$0.20`. Auch via `OMA_IMAGE_YES=1`. |
| `--no-prompt-in-manifest` | Speichert den SHA-256 des Prompts statt des Klartexts in `manifest.json`. |
| `--dry-run` | Gibt den Plan und die Kostenschätzung aus, ohne Geld auszugeben. |
| `--output text\|json` | Format des CLI-Outputs. JSON ist die Integrationsschnittstelle für andere Skills. |
| `--timeout <duration>` | Zeitüberschreitung pro Bild. |

---

## Referenzbilder

Hängen Sie bis zu 10 Referenzbilder an, um Stil, Subjektidentität oder Komposition zu steuern.

```bash
oma image generate -r ~/Downloads/otter.jpeg "same otter in dramatic lighting" --vendor codex
oma image generate -r a.png -r b.png "blend these styles" --vendor antigravity
oma image generate -r a.png,b.png "blend these styles" --vendor antigravity
```

| Vendor | Referenz-Unterstützung | Wie |
|---|---|---|
| `codex` (gpt-image-2) | Ja | Übergibt `-i <path>` an `codex exec` |
| `antigravity` | Ja | Kopiert Referenzen in ein laufbezogenes Verzeichnis und gewährt `agy` Zugriff darauf |
| `pollinations` | Nein | Abgelehnt mit Exit-Code 4 (erfordert URL-Hosting) |

### Wo angehängte Bilder liegen

- **Claude Code** — `~/.claude/image-cache/<session>/N.png`, in Systemnachrichten als `[Image: source: <path>]` angezeigt. Session-bezogen: An einen dauerhaften Speicherort kopieren, wenn Sie es später wiederverwenden möchten.
- **Antigravity** — Workspace-Upload-Verzeichnis (die IDE zeigt den genauen Pfad an)
- **Codex CLI als Host** — muss explizit übergeben werden; In-Conversation-Anhänge werden nicht weitergeleitet

Wenn der Benutzer ein Bild anhängt und darum bittet, ein Bild auf dieser Basis zu erzeugen oder zu bearbeiten, **muss** der aufrufende Agent es per `--reference <path>` weiterleiten, anstatt es in Prosa zu beschreiben. Falls die lokale CLI zu alt ist, um `--reference` zu unterstützen, `oma update` ausführen und erneut versuchen.

---

## Output-Layout

Jeder Lauf schreibt nach `.agents/results/images/` in ein Verzeichnis mit Zeitstempel und Hash-Suffix:

```
.agents/results/images/
├── 20260424-143052-ab12cd/                 # single-vendor run
│   ├── pollinations-flux.jpg
│   └── manifest.json
└── 20260424-143122-7z9kqw-compare/         # --vendor all run
    ├── codex-gpt-image-2.png
    ├── pollinations-flux.jpg
    └── manifest.json
```

`manifest.json` erfasst Vendor, Modell, Prompt (oder dessen SHA-256), Größe, Qualität und Kosten, sodass die Anfrage geprüft und wiederholt werden kann. Bei einem Live-Anbieter erzwingt das nicht identische Pixel.

---

## Kosten, Sicherheit und Abbruch

1. **Kosten-Guardrail** — Läufe mit geschätzten Kosten ≥ `$0.20` fragen nach Bestätigung. Umgehung mit `-y` oder `OMA_IMAGE_YES=1`. Der Standard `pollinations` (flux/zimage) ist kostenlos, sodass die Abfrage dort automatisch übersprungen wird.
2. **Pfadsicherheit** — Output-Pfade außerhalb von `$PWD` erfordern `--allow-external-output`, um unerwartete Schreibvorgänge zu vermeiden.
3. **Abbrechbar** — `Ctrl+C` (SIGINT/SIGTERM) bricht jeden laufenden Provider-Aufruf und den Orchestrator gemeinsam ab.
4. **Deterministische Outputs** — `manifest.json` wird stets neben den Bildern geschrieben.
5. **Max `n` = 5** — eine Wall-Time-Grenze, kein Kontingent.
6. **Exit-Codes** — abgestimmt mit `oma search fetch`: `0` ok, `1` general, `2` safety, `3` not-found, `4` invalid-input, `5` auth-required, `6` timeout.

---

## Klärungsprotokoll {#clarification-protocol}

Vor dem Aufruf von `oma image generate` arbeitet der aufrufende Agent diese Checkliste ab. Falls etwas fehlt und nicht erschlossen werden kann, fragt er zuerst nach oder erweitert den Prompt und legt die Erweiterung zur Genehmigung vor.

**Erforderlich:**
- **Subjekt** — was ist das primäre Element im Bild? (Objekt, Person, Szene)
- **Setting / Hintergrund** — wo befindet es sich?

**Dringend empfohlen (nachfragen, falls fehlend und nicht ableitbar):**
- **Stil** — fotorealistisch, Illustration, 3D-Render, Ölgemälde, Concept Art, flacher Vektor?
- **Stimmung / Beleuchtung** — hell vs. düster, warm vs. kühl, dramatisch vs. minimalistisch
- **Verwendungskontext** — Hero-Bild, Icon, Thumbnail, Produktshot, Poster?
- **Seitenverhältnis** — quadratisch, Hoch- oder Querformat

Bei einem kurzen Prompt wie *"a red apple"* stellt der Agent **keine** Rückfragen. Stattdessen erweitert er inline und zeigt dem Benutzer:

> Benutzer: "a red apple"
> Agent: "Ich werde dies wie folgt generieren: *a single glossy red apple centered on a clean white background, soft studio lighting, photorealistic, shallow depth of field, 1024×1024*. Soll ich fortfahren oder möchten Sie einen anderen Stil bzw. eine andere Komposition?"

Wenn der Benutzer ein vollständiges kreatives Briefing verfasst hat (≥ 2 von: Subjekt + Stil + Beleuchtung + Komposition), wird sein Prompt wortgetreu respektiert — keine Klärung, keine Erweiterung.

**Output-Sprache.** Generierungs-Prompts werden auf Englisch an den Provider gesendet (Bildmodelle werden überwiegend auf englischen Bildunterschriften trainiert). Hat der Benutzer in einer anderen Sprache geschrieben, übersetzt der Agent und zeigt die Übersetzung während der Erweiterung, damit der Benutzer Fehlinterpretationen korrigieren kann.

---

## Konfiguration

- **Projektkonfiguration:** der Abschnitt `image:` in `.agents/oma-config.yaml`. Die veraltete `config/image-config.yaml` wird nicht mehr gelesen.
- **Umgebungsvariablen:**
  - `OMA_IMAGE_DEFAULT_VENDOR` — überschreibt den Standard-Vendor (sonst `pollinations`)
  - `OMA_IMAGE_DEFAULT_OUT` — überschreibt das Standard-Output-Verzeichnis
  - `OMA_IMAGE_YES` — `1` zum Überspringen der Kostenbestätigung
  - `POLLINATIONS_API_KEY` — erforderlich für den pollinations-Vendor (kostenlose Anmeldung)

---

## Troubleshooting

| Symptom | Wahrscheinliche Ursache | Lösung |
|---|---|---|
| Exit-Code `5` (auth-required) | Ausgewählter Vendor ist nicht authentifiziert | `oma image doctor` ausführen, um zu sehen, welcher Vendor sich anmelden muss. Anschließend `codex login`, bei `agy` anmelden oder `POLLINATIONS_API_KEY` setzen. |
| Exit-Code `4` bei `--reference` | `pollinations` lehnt Referenzen ab oder Datei zu groß / falsches Format | Auf `--vendor codex` oder `--vendor antigravity` wechseln. Jede Referenz muss ≤ 5 MB und im Format PNG/JPEG/GIF/WebP sein. |
| `--reference` wird nicht erkannt | Lokale CLI ist veraltet | `oma update` ausführen und erneut versuchen. Nicht auf eine Beschreibung in Prosa zurückfallen. |
| Kostenbestätigung blockiert Automatisierung | Lauf ist auf ≥ `$0.20` geschätzt | `-y` übergeben oder `OMA_IMAGE_YES=1` setzen. Besser: auf das kostenlose `pollinations` umsteigen. |
| `--vendor all` bricht sofort ab | Einer der angeforderten Vendoren ist nicht gesund (Strict-Modus) | Den fehlenden Vendor installieren/anmelden oder einen spezifischen `--vendor` wählen. |
| Output wird in unerwartetes Verzeichnis geschrieben | Standard ist `.agents/results/images/{timestamp}/` | `--output-dir <dir>` übergeben. Pfade außerhalb von `$PWD` benötigen `--allow-external-output`. |
| Antigravity schlägt trotz bestandener Gesundheitsprüfung fehl | `agy --version` bestätigt die Installation, nicht die Anmeldung | Bei Gemini Code Assist anmelden, dann mit `oma image doctor` und `--vendor antigravity` erneut versuchen. |

---

## Verwandt

- [Skills](/docs/core-concepts/skills) — die zweischichtige Skill-Architektur, die `oma-image` antreibt
- [CLI-Befehle](/docs/cli-interfaces/commands) — vollständige Referenz der `oma image`-Befehle
- [CLI-Optionen](/docs/cli-interfaces/options) — Matrix der globalen Optionen
