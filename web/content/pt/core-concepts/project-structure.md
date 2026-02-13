---
title: Estrutura do Projeto
description: Árvore de diretórios atualizada após a separação dos workspaces CLI e web docs.
---

# Estrutura do Projeto

Árvore detalhada de diretórios para este repositório.

```text
.
├── .agent/
│   ├── config/
│   │   └── user-preferences.yaml   # Idioma, fuso horário, mapeamento CLI
│   ├── workflows/
│   │   ├── coordinate.md           # /coordinate (orquestração multi-agente via UI)
│   │   ├── orchestrate.md          # /orchestrate (execução paralela CLI automatizada)
│   │   ├── plan.md                 # /plan (decomposição de tarefas PM)
│   │   ├── review.md               # /review (pipeline QA completo)
│   │   ├── debug.md                # /debug (correção estruturada de bugs)
│   │   ├── setup.md                # /setup (configuração CLI e MCP)
│   │   └── tools.md                # /tools (gestão de ferramentas MCP)
│   └── skills/
│       ├── _shared/                    # Recursos comuns (não é uma habilidade)
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
│       ├── workflow-guide/             # Coordenação multi-agente
│       ├── pm-agent/                   # Gerente de produto
│       ├── frontend-agent/             # React/Next.js
│       ├── backend-agent/              # FastAPI
│       ├── mobile-agent/               # Flutter
│       ├── qa-agent/                   # Segurança e QA
│       ├── debug-agent/                # Correção de bugs
│       ├── orchestrator/               # Criador de sub-agentes baseado em CLI
│       └── commit/                     # Habilidade de commits convencionais
│       # Cada habilidade tem:
│       #   SKILL.md              (~40 linhas, otimizado para tokens)
│       #   resources/
│       #     ├── execution-protocol.md  (etapas chain-of-thought)
│       #     ├── examples.md            (entrada/saída few-shot)
│       #     ├── checklist.md           (auto-verificação)
│       #     ├── error-playbook.md      (recuperação de falhas)
│       #     ├── tech-stack.md          (especificações técnicas detalhadas)
│       #     └── snippets.md            (padrões de copiar-colar)
├── .serena/
│   └── memories/                   # Estado de runtime (ignorado pelo git)
├── package.json
├── docs/
│   ├── USAGE.md                    # Guia detalhado de uso (Inglês)
│   ├── USAGE.ko.md                 # Guia detalhado de uso (Coreano)
│   ├── project-structure.md        # Referência completa da estrutura (Inglês)
│   └── project-structure.ko.md     # Referência completa da estrutura (Coreano)
├── README.md                       # Este arquivo (Inglês)
└── README.ko.md                    # Guia em coreano
```
