---
title: "Gids: Afbeeldingen genereren"
sidebar_label: Afbeeldingen genereren
description: Complete gids voor het genereren van afbeeldingen met oh-my-agent, met multi-vendor-dispatch via Codex (gpt-image-2), Pollinations (flux/zimage, gratis) en Antigravity via Gemini Code Assist, plus referentiebeelden, kostenbeveiliging, uitvoerindeling, probleemoplossing en gedeelde aanroeppatronen.
---

# Afbeeldingen genereren

`oma-image` is de multi-vendor afbeeldingsrouter voor oh-my-agent. De skill genereert afbeeldingen vanuit prompts in natuurlijke taal, stuurt de opdracht naar de vendor-CLI waarvoor je geauthenticeerd bent en schrijft naast de uitvoer een manifest met de invoer en providerkeuzes die nodig zijn om een run te auditen of te herhalen. Live provideruitvoer kan nog steeds variëren.

De skill activeert automatisch bij trefwoorden zoals *image*, *illustration*, *visual asset* en *concept art*, of wanneer een andere skill een afbeelding als bijeffect nodig heeft (hero-afbeelding, thumbnail, productfoto).

---

## Wanneer gebruiken

- Afbeeldingen, illustraties, productfoto's, concept art en hero-/landingvisuals genereren
- Dezelfde prompt naast elkaar met meerdere modellen vergelijken (`--vendor all`)
- Assets vanuit een editorworkflow produceren (Claude Code, Codex, Gemini CLI)
- Een andere skill (design, marketing, docs) de imagepipeline als gedeelde infrastructuur laten aanroepen

## Wanneer NIET gebruiken

- Een bestaande afbeelding bewerken of retoucheren (buiten scope; gebruik een dedicated tool)
- Video's of audio genereren (buiten scope)
- Inline SVG/vectorcompositie vanuit gestructureerde data (gebruik een templatingskill)
- Eenvoudig formaat wijzigen of converteren (gebruik een imagelibrary, geen generatiepipeline)

---

## Vendors in één oogopslag

De skill is CLI-first: wanneer de native CLI van een vendor ruwe afbeeldingsbytes kan teruggeven, heeft het subprocesspad de voorkeur boven een directe API-key.

| Vendor | Strategie | Modellen | Trigger | Kosten |
|---|---|---|---|---|
| `pollinations` | Direct HTTP | Gratis: `flux`, `zimage`. Credit-gated: `qwen-image`, `wan-image`, `gpt-image-2`, `klein`, `kontext`, `gptimage`, `gptimage-large` | `POLLINATIONS_API_KEY` ingesteld (gratis registratie via https://enter.pollinations.ai) | Gratis voor `flux` / `zimage` |
| `codex` | CLI-first via `codex exec` (ChatGPT OAuth) | `gpt-image-2` | `codex login` (geen API-key nodig) | Wordt in rekening gebracht via je ChatGPT-plan |
| `antigravity` | `agy`-CLI via het Gemini Code Assist-abonnement | Model wordt intern door `agy` geselecteerd | `agy` geïnstalleerd en aangemeld | Geen kosten per afbeelding via Code Assist |

De ingebouwde vendormodus is `auto`: de providers die hun health checks doorstaan worden uitgevoerd. De modellen `flux` en `zimage` van Pollinations zijn gratis per afbeelding, maar vereisen nog steeds een `POLLINATIONS_API_KEY`; Codex en Antigravity vereisen elk hun eigen aanmelding. Betaalde schattingen gebruiken nog steeds de kostenbevestigingsbeveiliging.

---

## Snelle start

Controleer vóór de eerste generatie welke provider klaarstaat en authenticeer een van de ondersteunde paden:

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

`oma img` is een alias voor `oma image`.

---

## Als skill gebruiken

`oma-image` activeert automatisch vanuit natuurlijke taal en kan ook expliciet worden aangeroepen. Er zijn drie ingangspunten.

### 1. Natuurlijke taal (auto-activatie)

Beschrijf in Claude Code, Codex CLI of Gemini CLI gewoon de gewenste afbeelding. De skill herkent trefwoorden zoals *image*, *illustration*, *visual asset*, *concept art*, *hero shot*, *thumbnail* en *product photo*.

Je hoeft CLI-flags niet te onthouden. Beschrijf het in gewone taal; de skill vertaalt dit naar de juiste opties:

| Wat je zegt | Wat de skill afleidt |
|---|---|
| "gebruik codex" / "met gpt-image-2" / "gratis flux" | `--vendor codex` / `--vendor pollinations` |
| "vergelijk vendors" / "naast elkaar" | `--vendor all` |
| "portret" / "landschap" / "1024×1536" | `--size 1024x1536` / `--size 1536x1024` |
| "hoge kwaliteit" / "kladversie" | `--quality high` / `--quality low` |
| "drie varianten" / "geef me 3" | `-n 3` |
| "opslaan naar ./hero" / "uitvoer naar docs/assets" | `--output-dir <dir>` |
| Bijgevoegde afbeelding + "maak het nachtelijk" | `-r <attached path>` |
| "schat alleen de kosten" / "dry run" | `--dry-run` |

Voorbeelden:

> "Genereer een minimalistische zonsopgang boven bergen voor de hero van de landingspagina, liggend formaat, hoge kwaliteit."
> "Vergelijk een productfoto van een keramische mok bij alle vendors, met drie varianten per vendor."
> "Gebruik codex om deze otterfoto dramatischer en nachtelijk te maken." (met een bijgevoegde referentie)

De agent doorloopt het [Verduidelijkingsprotocol](#clarification-protocol), werkt de prompt zo nodig uit en roept `oma image generate` aan met de afgeleide flags. Gebruik het slashcommando wanneer je expliciete controle over de exacte flagwaarden wilt.

### 2. Expliciet slashcommando

```text
/oma-image a red apple on white background
/oma-image --vendor all --size 1536x1024 jeju coastline at sunset
/oma-image -n 3 --quality high --output-dir ./hero "minimalist dashboard hero illustration"
```

Elke CLI-flag (`--vendor`, `-n`, `--size`, `-r`, `--dry-run` enzovoort) werkt in het slashcommando en wordt doorgestuurd naar dezelfde pipeline als `oma image generate`.

### 3. Vanuit een andere skill (gedeelde infrastructuur)

Andere skills (design, marketing, docs) roepen de pipeline als gedeelde infrastructuur aan met JSON-uitvoer:

```bash
oma image generate "<prompt>" --output json
```

Het manifest dat naar stdout wordt geschreven bevat uitvoerpaden, vendor, model en kosten, zodat het gemakkelijk kan worden geparsed en doorgegeven.

---

## CLI-referentie

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

### Belangrijke flags

| Flag | Doel |
|---|---|
| `--vendor <name>` | `auto`, `pollinations`, `codex`, `antigravity` of `all`. Met `all` moet elke aangevraagde vendor gezond zijn (strikt). |
| `-n, --count <n>` | Aantal afbeeldingen per vendor, 1–5 (begrensde wandeltijd). |
| `--size <size>` | Aspect: `1024x1024` (vierkant), `1024x1536` (portret), `1536x1024` (landschap) of `auto`. |
| `--quality <level>` | `low`, `medium`, `high` of `auto` (standaard van de vendor). |
| `--output-dir <dir>` | Uitvoermap. Standaard `.agents/results/images/{timestamp}/`. Paden buiten `$PWD` vereisen `--allow-external-output`. |
| `--allow-external-output` | Staat een uitvoermap buiten `$PWD` toe. |
| `--model <name>` | Overschrijft het model van de geselecteerde vendor voor deze run. `antigravity` negeert dit omdat `agy` zijn model kiest. |
| `-r, --reference <path>` | Maximaal 10 referentieafbeeldingen (PNG/JPEG/GIF/WebP, elk ≤ 5 MB). Herhaalbaar of kommagescheiden. Ondersteund door `codex` en `antigravity`; afgewezen door `pollinations`. |
| `-y, --yes` | Slaat de kostenbevestiging over voor runs met een schatting van ≥ `$0.20`. Ook via `OMA_IMAGE_YES=1`. |
| `--no-prompt-in-manifest` | Slaat de SHA-256 van de prompt op in plaats van de ruwe tekst in `manifest.json`. |
| `--dry-run` | Toont het plan en de kostenraming zonder uitgaven. |
| `--output text\|json` | Uitvoerformaat van de CLI. JSON is de integratie-interface voor andere skills. |
| `--timeout <duration>` | Timeout per afbeelding. |

---

## Referentiebeelden

Voeg maximaal 10 referentieafbeeldingen toe om stijl, identiteit van het onderwerp of compositie te sturen.

```bash
oma image generate -r ~/Downloads/otter.jpeg "same otter in dramatic lighting" --vendor codex
oma image generate -r a.png -r b.png "blend these styles" --vendor antigravity
oma image generate -r a.png,b.png "blend these styles" --vendor antigravity
```

| Vendor | Ondersteuning voor referenties | Hoe |
|---|---|---|
| `codex` (gpt-image-2) | Ja | Geeft `-i <path>` door aan `codex exec` |
| `antigravity` | Ja | Kopieert referenties naar een directory per run en geeft `agy` er toegang toe |
| `pollinations` | Nee | Afgewezen met exitcode 4 (vereist hosting via een URL) |

### Waar bijgevoegde afbeeldingen staan

- **Claude Code:** `~/.claude/image-cache/<session>/N.png`, in systeemberichten getoond als `[Image: source: <path>]`. Sessiespecifiek; kopieer het bestand naar een duurzame locatie als je het opnieuw wilt gebruiken.
- **Antigravity:** uploadmap van de workspace (de IDE toont het exacte pad).
- **Codex CLI als host:** moet expliciet worden doorgegeven; bijlagen uit het gesprek worden niet doorgestuurd.

Wanneer de gebruiker een afbeelding bijvoegt en vraagt om die als basis voor generatie of bewerking te gebruiken, **moet** de aanroepende agent deze doorgeven met `--reference <path>` in plaats van de afbeelding in proza te beschrijven. Als de lokale CLI `--reference` nog niet ondersteunt, voer je `oma update` uit en probeer je opnieuw.

---

## Uitvoerindeling

Elke run schrijft naar `.agents/results/images/` in een directory met timestamp en hash:

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

`manifest.json` registreert vendor, model, prompt (of de SHA-256 ervan), formaat, kwaliteit en kosten, zodat het verzoek kan worden geaudit en herhaald. Het dwingt geen identieke pixels af bij een live provider.

---

## Kosten, veiligheid en annuleren

1. **Kostenbeveiliging:** runs met een schatting van ≥ `$0.20` vragen om bevestiging. Omzeil dit met `-y` of `OMA_IMAGE_YES=1`. De standaardprovider Pollinations (`flux`/`zimage`) is gratis, dus de prompt wordt daarvoor automatisch overgeslagen.
2. **Padveiligheid:** uitvoerpaden buiten `$PWD` vereisen `--allow-external-output` om onverwachte schrijfacties te voorkomen.
3. **Annuleerbaar:** `Ctrl+C` (`SIGINT`/`SIGTERM`) breekt elke lopende provideraanroep en de orchestrator af.
4. **Stabiele runregistratie:** `manifest.json` wordt altijd naast de afbeeldingen geschreven.
5. **Maximaal `n` = 5:** een begrenzing van de wandeltijd, geen quotum.
6. **Exitcodes:** gelijk aan `oma search fetch`: `0` ok, `1` algemeen, `2` safety, `3` niet gevonden, `4` ongeldige invoer, `5` auth vereist, `6` timeout.

---

## Verduidelijkingsprotocol {#clarification-protocol}

Voordat `oma image generate` wordt aangeroepen, doorloopt de aanroepende agent deze checklist. Als iets ontbreekt en niet kan worden afgeleid, stelt de agent eerst een vraag of werkt de prompt uit en toont de uitbreiding ter goedkeuring.

**Vereist:**

- **Onderwerp:** wat is het belangrijkste element in de afbeelding? (object, persoon, scène)
- **Setting / achtergrond:** waar is het?

**Sterk aanbevolen (vraag ernaar als het ontbreekt en niet kan worden afgeleid):**

- **Stijl:** fotorealistisch, illustratie, 3D-render, olieverfschilderij, concept art, flat vector?
- **Sfeer / belichting:** helder versus stemmig, warm versus koel, dramatisch versus minimalistisch
- **Gebruikscontext:** hero-afbeelding, pictogram, thumbnail, productfoto, poster?
- **Beeldverhouding:** vierkant, portret of landschap

Bij een korte prompt zoals *"een rode appel"* stelt de agent geen vervolgvragen. In plaats daarvan werkt de agent de prompt inline uit en toont die aan de gebruiker:

> Gebruiker: "een rode appel"
> Agent: "Ik genereer dit als: *één glanzende rode appel in het midden op een schone witte achtergrond, zachte studiobelichting, fotorealistisch, geringe scherptediepte, 1024×1024*. Zal ik doorgaan, of wil je een andere stijl/compositie?"

Wanneer de gebruiker een volledige creatieve briefing heeft geschreven (minstens 2 van: onderwerp + stijl + belichting + compositie), wordt de prompt letterlijk gerespecteerd, zonder verduidelijking of uitbreiding.

**Uitvoertaal.** Generatieprompts worden in het Engels naar de provider gestuurd (beeldmodellen zijn hoofdzakelijk met Engelse bijschriften getraind). Als de gebruiker een andere taal schrijft, vertaalt de agent de prompt en toont die vertaling tijdens de uitbreiding, zodat de gebruiker een verkeerde interpretatie kan corrigeren.

---

## Configuratie

- **Projectconfiguratie:** de sectie `image:` van `.agents/oma-config.yaml`. De verouderde `config/image-config.yaml` wordt niet meer gelezen.
- **Omgevingsvariabelen:**
  - `OMA_IMAGE_DEFAULT_VENDOR`: overschrijft de standaardvendor (anders `pollinations`)
  - `OMA_IMAGE_DEFAULT_OUT`: overschrijft de standaarduitvoermap
  - `OMA_IMAGE_YES`: `1` om kostenbevestiging over te slaan
  - `POLLINATIONS_API_KEY`: vereist voor de Pollinations-vendor (gratis registratie)

---

## Probleemoplossing

| Symptoom | Waarschijnlijke oorzaak | Oplossing |
|---|---|---|
| Exitcode `5` (auth vereist) | De geselecteerde vendor is niet geauthenticeerd | Voer `oma image doctor` uit om te zien welke vendor login nodig heeft. Voer daarna `codex login` uit, meld je aan bij `agy` of stel `POLLINATIONS_API_KEY` in. |
| Exitcode `4` op `--reference` | `pollinations` weigert referenties, of bestand is te groot/verkeerd formaat | Schakel over naar `--vendor codex` of `--vendor antigravity`. Elke referentie moet ≤ 5 MB zijn en PNG/JPEG/GIF/WebP. |
| `--reference` wordt niet herkend | Lokale CLI is verouderd | Voer `oma update` uit en probeer opnieuw. Val niet terug op een beschrijving in proza. |
| Kostenbevestiging blokkeert automatisering | Run wordt geschat op ≥ `$0.20` | Geef `-y` door of stel `OMA_IMAGE_YES=1` in. Beter: schakel over naar de gratis `pollinations`. |
| `--vendor all` breekt direct af | Een van de aangevraagde vendors is niet gezond (strikte modus) | Installeer of meld je aan bij de ontbrekende vendor, of kies een specifieke `--vendor`. |
| Uitvoer staat in een onverwachte directory | Standaard is `.agents/results/images/{timestamp}/` | Geef `--output-dir <dir>` door. Paden buiten `$PWD` vereisen `--allow-external-output`. |
| Antigravity mislukt nadat de health check slaagde | `agy --version` bewijst installatie, geen aanmelding | Meld je aan bij Gemini Code Assist en probeer opnieuw met `oma image doctor` en `--vendor antigravity`. |

---

## Gerelateerd

- [Skills](/docs/core-concepts/skills): de two-layer skillarchitectuur achter `oma-image`
- [CLI Commands](/docs/cli-interfaces/commands): volledige referentie voor het commando `oma image`
- [CLI Options](/docs/cli-interfaces/options): matrix met globale opties
