---
title: Skills
description: Progressive Offenlegung und Token-optimierte Skill-Architektur.
---

# Skills

## Progressive Offenlegung

Skills werden anhand der Absicht der Anfrage ausgewählt. Eine manuelle Skill-Auswahl ist in der Regel nicht erforderlich.

## Zwei-Schichten-Design

Jeder Skill verwendet ein **Token-optimiertes Zwei-Schichten-Design**:

| Schicht | Inhalt | Größe |
|---------|--------|-------|
| `SKILL.md` | Identität, Routing-Bedingungen, Kernregeln | ~40 Zeilen (~800B) |
| `resources/` | Ausführungsprotokolle, Beispiele, Checklisten, Playbooks, Snippets, Tech-Stack | Bei Bedarf geladen |

Dies erreicht **~75 % Token-Einsparung** beim initialen Laden eines Skills (3-7KB → ~800B pro Skill).

## Gemeinsame Ressourcenschicht (`_shared/`)

Gemeinsame Ressourcen, die über alle Skills hinweg dedupliziert werden:

| Ressource | Zweck |
|-----------|-------|
| `reasoning-templates.md` | Strukturierte Lückentext-Vorlagen für mehrstufiges Reasoning |
| `clarification-protocol.md` | Wann fragen vs. annehmen, Mehrdeutigkeitsstufen |
| `context-budget.md` | Token-effiziente Dateilesetrategien pro Modellstufe |
| `context-loading.md` | Aufgabentyp-zu-Ressource-Zuordnung für die Orchestrator-Prompt-Konstruktion |
| `skill-routing.md` | Schlüsselwort-zu-Skill-Zuordnung und Regeln für parallele Ausführung |
| `difficulty-guide.md` | Einfach/Mittel/Komplex-Bewertung mit Protokollverzweigung |
| `lessons-learned.md` | Sitzungsübergreifend gesammelte domänenspezifische Stolperfallen |
| `verify.sh` | Automatisiertes Verifizierungsskript nach Agentenabschluss |
| `api-contracts/` | PM erstellt Verträge, Backend implementiert, Frontend/Mobile konsumiert |
| `serena-memory-protocol.md` | Speicher-Lese-/Schreibprotokoll im CLI-Modus |
| `common-checklist.md` | Universelle Codequalitätsprüfungen |

## Skill-spezifische Ressourcen

Jeder Skill stellt domänenspezifische Ressourcen bereit:

| Ressource | Zweck |
|-----------|-------|
| `execution-protocol.md` | 4-Schritte-Chain-of-Thought-Workflow (Analysieren → Planen → Implementieren → Verifizieren) |
| `examples.md` | 2-3 Few-Shot-Eingabe-/Ausgabebeispiele |
| `checklist.md` | Domänenspezifische Selbstverifizierungs-Checkliste |
| `error-playbook.md` | Fehlerbehebung mit „3-Strikes"-Eskalationsregel |
| `tech-stack.md` | Detaillierte Technologiespezifikationen |
| `snippets.md` | Sofort einsetzbare Code-Muster |

## Warum das wichtig ist

Dies hält den initialen Kontext schlank und unterstützt gleichzeitig eine tiefgehende Ausführung bei Bedarf.
