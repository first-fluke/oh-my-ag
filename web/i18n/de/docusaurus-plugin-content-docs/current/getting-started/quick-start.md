---
title: Schnellstart
description: Der kürzeste Weg von einem leeren Projekt zu einem verifizierten oh-my-agent-Prompt mit erwarteten Ergebnissen und Wiederherstellungsschritten.
---

# Schnellstart

Verwenden Sie diese Seite, wenn Sie vor dem Lesen der vollständigen Referenz prüfen möchten, ob das Harness funktioniert. Sie benötigen ein Projektverzeichnis und mindestens eine unterstützte KI-CLI oder IDE. Der Installer kann `bun`, `uv`, Serena und CUE unter macOS, Linux oder Windows einrichten. Für den ersten Prompt ist die ausgewählte Host-Integration erforderlich; Provider- und Browser-Integrationen sind optional.

## 1. Projekt-Harness installieren

Führen Sie aus dem Projektverzeichnis den Bootstrap-Installer aus:

```bash
curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
```

Führen Sie unter Windows PowerShell Folgendes aus:

```powershell
irm https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.ps1 | iex
```

Die interaktive Einrichtung fragt nach Antwortsprache, CLI-Vendoren, Fähigkeits-Providern, dem Modell-Preset, dem Projekt-Skill-Preset und einer Stack-Variante. Verwenden Sie beim ersten Lauf die Standardwerte, wählen Sie den Vendor, den Sie bereits nutzen, und wählen Sie das Projekt-Preset, das dem Repository am nächsten kommt.

Wenn `bun` bereits installiert ist, verwenden Sie den Installer direkt:

```bash
bunx oh-my-agent@latest
```

Die Bootstrap-Skripte installieren OMA im aktuellen Projekt. Verwenden Sie `oma install --global` für eine Installation auf HOME-Ebene; lesen Sie [Installation](./installation.md), bevor Sie Projekt- und globale Installationen mischen.

## 2. Ergebnis prüfen

Führen Sie die Gesundheitsprüfung aus demselben Projektverzeichnis aus:

```bash
oma doctor
```

Bei Erfolg sind die ausgewählte Vendor-Integration und die `.agents/`-Dateien bereit. Optionale MCP-, Browser-, Memory- oder Code-Intelligence-Integrationen können als Warnungen erscheinen; sie werden nur für Aufgaben benötigt, die sie verwenden. Mit `oma doctor --profile` sehen Sie das aufgelöste Modell und die CLI für jede kanonische Agentenrolle.

Wenn der Befehl fehlt, wurde die CLI außerhalb Ihres aktuellen `PATH` installiert. Öffnen Sie eine neue Shell oder fügen Sie das Bin-Verzeichnis des Paketmanagers hinzu. Meldet `oma doctor` eine ungültige Konfiguration, korrigieren Sie das genannte Feld und führen Sie den Befehl erneut aus. Löschen Sie `.agents/oma-config.yaml` nicht zur Wiederherstellung: Diese benutzereigene Konfiguration bewahrt Ihre Einstellungen über Updates hinweg.

## 3. Eine kleine Aufgabe ausführen

Öffnen Sie das Repository im konfigurierten KI-Tool und beschreiben Sie eine in sich geschlossene Änderung:

```text
Add a validation message to the existing email field. Follow the project's current form and test conventions. Done when the invalid-email case is covered by a focused test.
```

Wenn der Keyword-Hook für den ausgewählten Host aktiviert ist, kann er einen passenden Workflow starten. Das Skill-Routing erfolgt durch den Host oder den ausgewählten Workflow. Ein beliebiger Host-Prompt garantiert daher keinen Hook, keinen bestimmten Skill und keinen `CHARTER_CHECK`. Der Ausführungsvertrag sollte trotzdem die Repository-Konventionen prüfen, nur die abgegrenzte Änderung vornehmen und die Verifizierung melden. Die konkreten Dateien und Befehle hängen vom Projekt ab; der obige Prompt ist nur ein Beispiel.

Für eine Aufgabe, die API- und UI-Grenzen überschreitet, wählen Sie ausdrücklich `/work` oder `/orchestrate`. Für eine einzelne Domäne fahren Sie mit [Ausführung eines einzelnen Skills](../guide/single-skill.md) fort. Der [Nutzungsleitfaden](../guide/usage.md) enthält längere Beispiele.

## 4. Vor der Skalierung die Standardwerte kennen

OMA startet mit `model_preset: auto`, Serena für Code-Intelligence, Agent Memory für semantischen Speicher, nativer Websuche und deaktivierter Telemetrie. Serena verwendet den gemeinsamen `bridge`-Transport und aktualisiert sich automatisch, sofern dies nicht anders konfiguriert ist. Browser-DevTools-MCP ist Opt-in; eine neue interaktive Einrichtung bietet zuerst Aside an. Unter [Wichtige Standardwerte](./important-defaults.md) finden Sie die Auswirkungen und Schlüssel zum Überschreiben.

Wenn eine verwaltete Aufgabe hängen bleibt, beginnen Sie mit `oma agent status <session-id> [agent-id]`. Prüfen Sie dann den Ausführungsbeleg (Receipt) unter `.agents/state/agent-runs/` und den Pfad der injizierten strukturierten Ergebnisdeklaration (Claim). Diese Aufzeichnungen enthalten Lauf, Aufgabe, Workspace, Exit-Code und Verifizierungsstatus. Menschenlesbare `result-*.md`- und `progress-*.md`-Dateien unter `.agents/state/memories/` liefern zusätzliche Informationen, sofern vorhanden. Führen Sie nur den kleinsten fehlgeschlagenen Befehl erneut aus, nachdem Sie bestätigt haben, dass der Lauf nicht mehr aktiv ist. Ein persistenter Workflow bleibt aktiv, bis er abgeschlossen ist oder Sie `workflow done` sagen; zur Wiederherstellung der Zustandsdatei siehe [Workflows](../core-concepts/workflows.md#persistent-mode-mechanics).

## Nächste Schritte

- [Wichtige Standardwerte](./important-defaults.md) für Vorrangregeln, Provider und Wiederherstellungsentscheidungen
- [Installation](./installation.md) für Presets, Vendor-Einrichtung, globale Installationen und Updates
- [Agenten](../core-concepts/agents.md) für die 33 Skill-Pakete und Dispatch-Rollen
- [Workflows](../core-concepts/workflows.md) für Planung, parallele Ausführung, QA und persistente Modi
