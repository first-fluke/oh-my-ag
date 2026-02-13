---
title: "Caso de Uso: Monitoramento via Dashboard"
description: Opere sessões do orquestrador com dashboards de terminal/web e sinais de runbook acionáveis.
---

# Caso de Uso: Monitoramento via Dashboard

## Comandos de inicialização

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

URL padrão do dashboard web: `http://localhost:9847`

## Layout de terminal recomendado

Use pelo menos 3 terminais:

1. dashboard no terminal (`oh-my-ag dashboard`)
2. comandos de spawn de agentes
3. logs de teste/build

Mantenha o dashboard web aberto para visibilidade compartilhada durante sessões em equipe.

## O que os dashboards monitoram

Fonte de dados: `.serena/memories/`

Sinais primários:

- status da sessão (`running`, `completed`, `failed`)
- atribuição do quadro de tarefas e mudanças de estado
- turnos de progresso por agente
- eventos de publicação de resultados

As atualizações são orientadas por eventos a partir de arquivos alterados; não é necessário um loop de polling do diretório completo.

## Runbook: sinal -> ação

- `No agents detected`
  - verifique se os agentes foram criados com o mesmo `session-id`
  - confirme que `.serena/memories/` está sendo escrito
- `Session stuck in running`
  - inspecione os timestamps dos arquivos `progress-*` mais recentes
  - reinicie o agente com falha ou bloqueado com um prompt mais claro
- `Frequent reconnects (web)`
  - verifique firewall/proxy local
  - reinicie o `dashboard:web` e reabra a página
- `Missing activity while agents are active`
  - verifique se as escritas do orquestrador não estão sendo redirecionadas para outro workspace

## Checklist de monitoramento pré-merge

- todos os agentes necessários atingiram o estado concluído
- nenhuma descoberta de QA de alta severidade não resolvida
- os arquivos de resultado mais recentes estão presentes para cada agente
- testes de integração executados após as saídas finais dos agentes

## Critérios de conclusão

A fase de monitoramento está concluída quando:

- a sessão atingiu o estado terminal (`completed` ou intencionalmente interrompida)
- o histórico de atividades explica a proveniência da saída final
- a decisão de release/merge é tomada com visibilidade completa do status
