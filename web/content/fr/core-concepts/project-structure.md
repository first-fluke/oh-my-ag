---
title: Structure du Projet
description: Arborescence mise à jour après la séparation des workspaces CLI et docs web.
---

# Structure du projet

Arborescence détaillée des répertoires pour ce dépôt.

```text
.
├── .agent/
│   ├── config/
│   │   └── user-preferences.yaml   # Langue, fuseau horaire, mappage CLI
│   ├── workflows/
│   │   ├── coordinate.md           # /coordinate (orchestration multi-agents via UI)
│   │   ├── orchestrate.md          # /orchestrate (exécution parallèle CLI automatisée)
│   │   ├── plan.md                 # /plan (décomposition tâches PM)
│   │   ├── review.md               # /review (pipeline QA complet)
│   │   ├── debug.md                # /debug (correction bugs structurée)
│   │   ├── setup.md                # /setup (configuration CLI & MCP)
│   │   └── tools.md                # /tools (gestion outils MCP)
│   └── skills/
│       ├── _shared/                    # Ressources communes (pas une compétence)
│       │   ├── serena-memory-protocol.md
│       │   ├── common-checklist.md
│       │   ├── skill-routing.md
│       │   ├── context-loading.md
│       │   ├── context-budget.md
│       │   ├── reasoning-templates.md
│       │   ├── clarification-protocol.md
│       │   ├── difficulty-guide.md
│       │   ├── lessons-learned.md
│       │   ├── verify.sh
│       │   └── api-contracts/
│       ├── workflow-guide/             # Coordination multi-agents
│       ├── pm-agent/                   # Chef de projet
│       ├── frontend-agent/             # React/Next.js
│       ├── backend-agent/              # FastAPI
│       ├── mobile-agent/               # Flutter
│       ├── qa-agent/                   # Sécurité & QA
│       ├── debug-agent/                # Correction bugs
│       ├── orchestrator/               # Générateur sous-agents basé CLI
│       └── commit/                     # Compétence commits conventionnels
│       # Chaque compétence contient :
│       #   SKILL.md              (~40 lignes, optimisé tokens)
│       #   resources/
│       #     ├── execution-protocol.md  (étapes chaîne de pensée)
│       #     ├── examples.md            (entrée/sortie few-shot)
│       #     ├── checklist.md           (auto-vérification)
│       #     ├── error-playbook.md      (récupération échec)
│       #     ├── tech-stack.md          (spécifications tech détaillées)
│       #     └── snippets.md            (modèles copier-coller)
├── .serena/
│   └── memories/                   # État d'exécution (gitignored)
├── package.json
├── docs/
│   ├── USAGE.md                    # Guide utilisation détaillé (Anglais)
│   ├── USAGE.ko.md                 # Guide utilisation détaillé (Coréen)
│   ├── project-structure.md        # Référence structure complète (Anglais)
│   └── project-structure.ko.md     # Référence structure complète (Coréen)
├── README.md                       # Ce fichier (Anglais)
└── README.ko.md                    # Guide coréen
```
