---
title: Introdução
description: O que é o oh-my-ag e como funciona a colaboração multi-agente.
---

# Introdução

oh-my-ag é um orquestrador multi-agente para o Antigravity IDE. Ele roteia solicitações para skills especializadas e coordena agentes por meio das memórias do Serena.

## O Que Você Obtém

- Roteamento de skills baseado na solicitação
- Execução baseada em workflows para planejamento/revisão/depuração
- Orquestração CLI para execuções paralelas de agentes
- Dashboards em tempo real para monitoramento de sessões

## Papéis dos Agentes

| Agente | Responsabilidade |
|---|---|
| workflow-guide | Coordena projetos complexos de múltiplos domínios |
| pm-agent | Planejamento e decomposição de arquitetura |
| frontend-agent | Implementação React/Next.js |
| backend-agent | Implementação de API/banco de dados/autenticação |
| mobile-agent | Implementação Flutter/mobile |
| qa-agent | Revisão de segurança/performance/acessibilidade |
| debug-agent | Análise de causa raiz e correções seguras contra regressão |
| orchestrator | Orquestração de sub-agentes via CLI |
| commit | Workflow de commit convencional |

## Estrutura do Projeto

- `.agent/skills/`: definições de skills e recursos
- `.agent/workflows/`: comandos de workflow explícitos
- `.serena/memories/`: estado de orquestração em tempo de execução
- `cli/cli.ts`: fonte da verdade para interfaces de comando

## Divulgação Progressiva

1. Identificar a intenção da solicitação
2. Carregar apenas os recursos necessários da skill
3. Executar com agentes especializados
4. Verificar e iterar por meio de loops de QA/depuração
