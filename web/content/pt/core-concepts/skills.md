---
title: Skills
description: Arquitetura de skills com divulgação progressiva e otimização de tokens.
---

# Skills

## Divulgação Progressiva

As skills são selecionadas com base na intenção da solicitação. Normalmente, não é necessário selecionar uma skill manualmente.

## Design em Duas Camadas

Cada skill utiliza um **design em duas camadas otimizado para tokens**:

| Camada | Conteúdo | Tamanho |
|--------|----------|---------|
| `SKILL.md` | Identidade, condições de roteamento, regras principais | ~40 linhas (~800B) |
| `resources/` | Protocolos de execução, exemplos, checklists, playbooks, snippets, stack tecnológico | Carregado sob demanda |

Isso alcança uma **economia de ~75% em tokens** no carregamento inicial da skill (3-7KB -> ~800B por skill).

## Camada de Recursos Compartilhados (`_shared/`)

Recursos comuns deduplicados entre todas as skills:

| Recurso | Finalidade |
|---------|-----------|
| `reasoning-templates.md` | Templates estruturados de preenchimento para raciocínio em múltiplas etapas |
| `clarification-protocol.md` | Quando perguntar vs. assumir, níveis de ambiguidade |
| `context-budget.md` | Estratégias de leitura de arquivos eficientes em tokens por nível de modelo |
| `context-loading.md` | Mapeamento de tipo de tarefa para recurso na construção do prompt do orquestrador |
| `skill-routing.md` | Mapeamento de palavras-chave para skills e regras de execução paralela |
| `difficulty-guide.md` | Avaliação Simples/Médio/Complexo com ramificação de protocolo |
| `lessons-learned.md` | Lições acumuladas entre sessões sobre peculiaridades do domínio |
| `verify.sh` | Script de verificação automatizada executado após a conclusão do agente |
| `api-contracts/` | O PM cria contratos, o backend implementa, o frontend/mobile consome |
| `serena-memory-protocol.md` | Protocolo de leitura/escrita de memória no modo CLI |
| `common-checklist.md` | Verificações universais de qualidade de código |

## Recursos por Skill

Cada skill fornece recursos específicos do domínio:

| Recurso | Finalidade |
|---------|-----------|
| `execution-protocol.md` | Fluxo de trabalho em 4 etapas com cadeia de pensamento (Analisar -> Planejar -> Implementar -> Verificar) |
| `examples.md` | 2-3 exemplos de entrada/saída (few-shot) |
| `checklist.md` | Checklist de auto-verificação específico do domínio |
| `error-playbook.md` | Recuperação de falhas com regra de escalação "3 tentativas" |
| `tech-stack.md` | Especificações detalhadas de tecnologia |
| `snippets.md` | Padrões de código prontos para copiar e colar |

## Por Que Isso Importa

Isso mantém o contexto inicial enxuto enquanto ainda suporta execução aprofundada quando necessário.
