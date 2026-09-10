---
title: Snel starten
description: De kortste weg van een leeg project naar een geverifieerde oh-my-agent-prompt, met verwachte resultaten en herstelstappen.
---

# Snel starten

Gebruik deze pagina om te controleren of de harness werkt voordat je de volledige referentie leest. Je hebt een projectmap en minstens één ondersteunde AI-CLI of IDE nodig. De installer kan `bun`, `uv`, Serena en CUE op macOS, Linux of Windows instellen. De geselecteerde hostintegratie is nodig voor de eerste prompt; provider- en browserintegraties zijn optioneel.

## 1. Installeer de project-harness

Voer vanuit de projectmap de bootstrap-installer uit:

```bash
curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
```

Voer in Windows PowerShell het volgende uit:

```powershell
irm https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.ps1 | iex
```

De interactieve setup vraagt naar de antwoordtaal, CLI-leveranciers, capabilityproviders, modelpreset, skillpreset voor het project en eventuele stackvariant. Houd voor een eerste run de standaardwaarden aan, selecteer de leverancier die je al gebruikt en kies de projectpreset die het beste bij de repository past.

Als je `bun` al hebt, gebruik je de installer rechtstreeks:

```bash
bunx oh-my-agent@latest
```

De bootstrap-scripts installeren in het huidige project. Gebruik `oma install --global` als je op HOME-niveau wilt installeren; lees [Installatie](./installation.md) voordat je project- en globale installaties combineert.

## 2. Controleer het resultaat

Voer vanuit dezelfde projectmap de healthcheck uit:

```bash
oma doctor
```

Bij succes zijn de integratie van de geselecteerde leverancier en de `.agents/`-bestanden klaar. Optionele MCP-, browser-, memory- of code-intelligence-integraties kunnen als waarschuwing verschijnen; je hebt ze alleen nodig voor taken die ze gebruiken. Gebruik `oma doctor --profile` om het opgeloste model en de CLI voor elke canonieke agentrol te bekijken.

Als het commando ontbreekt, is de CLI buiten je huidige `PATH` geïnstalleerd; open een nieuwe shell of voeg de bin-map van de pakketbeheerder toe. Als `oma doctor` een ongeldige configuratie meldt, herstel je het genoemde veld en voer je het commando opnieuw uit. Verwijder `.agents/oma-config.yaml` niet om te herstellen: dit is de configuratie van de gebruiker en die bewaart instellingen tijdens updates.

## 3. Voer één kleine taak uit

Open de repository in de geconfigureerde AI-tool en beschrijf één zelfstandige wijziging:

```text
Add a validation message to the existing email field. Follow the project's current form and test conventions. Done when the invalid-email case is covered by a focused test.
```

Wanneer de keyword-hook voor de geselecteerde host is ingeschakeld, kan die een overeenkomende workflow activeren. Skillrouting gebeurt door de host of de geselecteerde workflow. Een willekeurige hostprompt garandeert daarom geen hook, specifieke skill of `CHARTER_CHECK`. Het uitvoeringscontract moet nog steeds de repositoryconventies controleren, alleen de afgebakende wijziging uitvoeren en de verificatie rapporteren. De exacte bestanden en commando’s hangen van het project af; de bovenstaande prompt is illustratief.

Kies voor een taak die API- en UI-grenzen overschrijdt expliciet `/work` of `/orchestrate`. Ga voor één domein verder met [Eén skill uitvoeren](../guide/single-skill.md). De [Gebruiksgids](../guide/usage.md) bevat langere voorbeelden.

## 4. Ken de standaardwaarden voordat je opschaalt

OMA start met `model_preset: auto`, Serena voor code-intelligence, Agent Memory voor semantisch geheugen, native web search en uitgeschakelde telemetrie. Serena gebruikt de gedeelde `bridge`-transportlaag en wordt automatisch bijgewerkt tenzij je dat anders configureert. Browser DevTools MCP is opt-in; een nieuwe interactieve setup biedt eerst Aside aan. Zie [Belangrijke standaardinstellingen](./important-defaults.md) voor de gevolgen en de sleutels waarmee je dit overschrijft.

Als een beheerde taak vastloopt, begin je met `oma agent status <session-id> [agent-id]`. Bekijk daarna de receipt onder `.agents/state/agent-runs/` en het geïnjecteerde gestructureerde claimpad. Deze records tonen de run, taak, workspace, exitcode en verificatiestatus. Mensleesbare `result-*.md`- en `progress-*.md`-bestanden onder `.agents/state/memories/` geven extra context als ze aanwezig zijn. Voer alleen het kleinste mislukte commando opnieuw uit nadat je hebt gecontroleerd dat de run niet meer actief is. Een persistente workflow blijft actief tot die klaar is of je `workflow done` zegt; zie [Workflows](../core-concepts/workflows.md#persistent-mode-mechanics) voor herstel van het statebestand.

## Volgende stappen

- [Belangrijke standaardinstellingen](./important-defaults.md) voor voorrang, providers en herstelkeuzes
- [Installatie](./installation.md) voor presets, leverancierssetup, globale installaties en updates
- [Agents](../core-concepts/agents.md) voor de 33 skillpakketten en dispatchrollen
- [Workflows](../core-concepts/workflows.md) voor planning, parallelle uitvoering, QA en persistente modi
