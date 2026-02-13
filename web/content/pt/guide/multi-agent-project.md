---
title: "Caso de Uso: Projeto Multi-Agente"
description: Fluxo completo para entrega complexa entre domínios com portões de coordenação explícitos.
---

# Caso de Uso: Projeto Multi-Agente

## Quando usar este caminho

Use quando uma funcionalidade abrange múltiplos domínios (por exemplo, backend + frontend + QA) e a execução paralela é benéfica.

## Modelo de coordenação

Sequência recomendada:

1. `/plan` para decomposição e mapeamento de dependências
2. `/coordinate` para ordem de execução e propriedade
3. `agent:spawn` em paralelo por domínio
4. `/review` para portão de QA/segurança/performance

## Estratégia de sessão e workspace

Use um ID de sessão por fluxo de funcionalidade:

```text
session-auth-v2
```

Atribua workspaces isolados por domínio para reduzir conflitos de merge:

- backend: `./apps/api`
- frontend: `./apps/web`
- mobile: `./apps/mobile`

## Exemplo de spawn

```bash
oh-my-ag agent:spawn backend "Implement JWT auth API + refresh flow" session-auth-v2 -w ./apps/api
oh-my-ag agent:spawn frontend "Build login + refresh UX with error states" session-auth-v2 -w ./apps/web
oh-my-ag agent:spawn qa "Review auth risks, test matrix, and regression scope" session-auth-v2
```

## Regra de contrato primeiro

Antes da codificação em paralelo, fixe os contratos compartilhados:

- schemas de request/response
- códigos de erro e mensagens
- premissas do ciclo de vida de autenticação/sessão

Se os contratos mudarem durante a execução, pause os agentes dependentes e reemita os prompts com o contrato atualizado.

## Portões de merge

Não faça merge a menos que todos os portões sejam aprovados:

1. testes no nível do domínio passam
2. pontos de integração correspondem aos contratos acordados
3. problemas de QA de alta/crítica severidade resolvidos ou explicitamente dispensados
4. changelog ou notas de release atualizados quando houver mudanças visíveis externamente

## Anti-padrões operacionais

Evite:

- compartilhar um workspace entre todos os agentes
- alterar contratos sem notificar outros agentes
- fazer merge de backend/frontend independentemente antes da verificação de compatibilidade

## Critérios de conclusão

A execução multi-agente está concluída quando:

- as tarefas planejadas estão completas em todos os domínios
- a integração entre domínios está validada
- a aprovação do QA (ou aceitação documentada de risco) está registrada
