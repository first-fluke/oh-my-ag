---
title: Skills
description: "Guia completo da arquitetura de duas camadas das 33 skills do OMA, incluindo roteamento por SKILL.md, recursos sob demanda, protocolos compartilhados e condicionais, execução por fornecedor, medições de tokens e mecânica de roteamento."
---

# Habilidades (Skills)

Skills são pacotes estruturados de conhecimento que fornecem a um papel de dispatch as orientações do seu domínio. Elas reúnem protocolos de execução, referências de stack, templates de código, playbooks de erros, checklists de qualidade e exemplos quando a skill os oferece, organizados em uma arquitetura de duas camadas criada para economizar tokens.

---

## O design em duas camadas

### Camada 1: SKILL.md (~2.631 tokens em mediana, carregado quando a skill é roteada)

Toda skill tem um arquivo `SKILL.md` na raiz. Ele entra na janela de contexto quando a skill é roteada: o hook injetor transmite uma **referência de caminho**, não o corpo, então uma skill não roteada não custa nada além de sua `description`. O arquivo contém:

- **Frontmatter YAML** com `name` e `description` (usado para roteamento e exibição)
- **Quando usar / Quando NÃO usar** — condições explícitas de ativação
- **Regras principais** — as 5-15 restrições mais críticas para o domínio
- **Visão geral da arquitetura** — como o código deve ser estruturado
- **Lista de bibliotecas** — dependências aprovadas e seus propósitos
- **Referências** — ponteiros para recursos da Camada 2 (nunca carregados automaticamente)

Exemplo de frontmatter:

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

O campo description é fundamental porque contém as palavras-chave de roteamento que o sistema usa para associar tarefas a agentes.

### Camada 2: resources/ (carregado sob demanda)

O diretório `resources/` contém conhecimento de execução detalhado. Esses arquivos são carregados somente quando:
1. O host ou workflow selecionou a skill (por exemplo, por uma correspondência nativa ou comando explícito)
2. O recurso específico é necessário para o tipo e a dificuldade da tarefa atual

Este carregamento sob demanda é governado pelo guia de context-loading (`.agents/skills/_shared/core/context-loading.md`), que mapeia tipos de tarefa para recursos necessários por agente.

---

## Exemplo de estrutura de arquivos

```
.agents/skills/oma-frontend/
├── SKILL.md                          ← Layer 1: loaded when routed
└── resources/
    ├── execution-protocol.md         ← Layer 2: step-by-step workflow
    ├── tech-stack.md                 ← Layer 2: detailed technology specs
    ├── angular-rules.md              ← Layer 2: Angular-specific conventions
    ├── snippets.md                   ← Layer 2: copy-paste code patterns
    ├── error-playbook.md             ← Layer 2: error recovery procedures
    └── checklist.md                  ← Layer 2: quality verification checklist

.agents/skills/oma-backend/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── orm-reference.md              ← Domain-specific (ORM queries, N+1, transactions)
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Shipped language seeds / generated references
    ├── node/
    ├── python/
    └── rust/

.agents/skills/oma-mobile/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── tech-stack.md
│   ├── screen-template.dart
│   ├── screen-template.swift         ← Swift native iOS screen template
│   ├── screen-template.tsx            ← React Native screen template
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Stack schema and generated platform references
    ├── README.md
    └── stack.schema.json

.agents/skills/oma-design/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── anti-patterns.md
│   ├── checklist.md
│   ├── design-md-spec.md
│   ├── design-tokens.md
│   ├── prompt-enhancement.md
│   ├── stitch-integration.md
│   └── error-playbook.md
└── reference/                         ← Deep reference material
    ├── typography.md
    ├── color-and-contrast.md
    ├── spatial-design.md
    ├── motion-design.md
    ├── responsive-design.md
    ├── component-patterns.md
    ├── accessibility.md
    └── shader-and-3d.md
```

---

## Tipos de recursos por skill

| Tipo de Recurso | Padrão de Nome | Propósito | Quando Carregado |
|-----------------|---------------|---------|-------------|
| **Protocolo de Execução** | `execution-protocol.md` | Workflow passo a passo: Analisar -> Planejar -> Implementar -> Verificar | Sempre (com SKILL.md) |
| **Stack Tecnológico** | `tech-stack.md` | Specs detalhadas de tecnologia, versões, configuração | Tarefas complexas |
| **Playbook de Erros** | `error-playbook.md` | Procedimentos de recuperação com escalação "3 strikes" | Apenas em erros |
| **Checklist** | `checklist.md` | Verificação de qualidade específica do domínio | Na etapa de Verificação |
| **Snippets** | `snippets.md` | Padrões de código prontos para copiar | Tarefas Médias/Complexas |
| **Exemplos** | `examples.md` ou `examples/` | Exemplos few-shot de entrada/saída para o LLM | Tarefas Médias/Complexas |
| **Variantes** | Diretório `variants/` | Referências específicas de linguagem/framework. O backend fornece seeds `node`, `python` e `rust`; o mobile fornece um schema e pode receber referências de plataforma geradas. | Quando existe uma stack correspondente |
| **Templates** | `component-template.tsx`, `screen-template.dart` | Templates boilerplate de arquivo | Na criação de componentes |
| **Referência de Domínio** | `orm-reference.md`, `anti-patterns.md`, etc. | Conhecimento profundo de domínio para subtarefas específicas | Específico por tipo de tarefa |

---

## Recursos compartilhados (_shared/)

Todos os agentes compartilham fundamentos comuns de `.agents/skills/_shared/`. Estes são organizados em três categorias:

### Recursos core (`.agents/skills/_shared/core/`)

| Recurso | Finalidade | Quando carregado |
|---------|---------|------------------------|
| **`skill-routing.md`** | Mapeia palavras-chave de tarefas ao agente correto. Contém a tabela Skill-Agent Mapping, padrões de Complex Request Routing, Inter-Agent Dependency Rules, Escalation Rules e Turn Limit Guide. | Referenciado por skills de orquestração e coordenação |
| **`context-loading.md`** | Define quais recursos carregar para cada tipo e dificuldade de tarefa. Contém tabelas de mapeamento por agente e gatilhos de carregamento de protocolos condicionais. | No início do workflow (Step 0 / Phase 0) |
| **`prompt-structure.md`** | Define os quatro elementos de todo prompt: Goal, Context, Constraints, Done When. Inclui templates para agentes PM, implementação e QA e lista anti-padrões. | Referenciado pelo agente PM e por todos os workflows |
| **`clarification-protocol.md`** | Define níveis LOW/MEDIUM/HIGH de incerteza e as ações correspondentes. Contém gatilhos, templates de escalonamento, verificações obrigatórias por agente e comportamento em modo subagente. | Quando os requisitos são ambíguos |
| **`context-budget.md`** | Gerencia o orçamento de tokens. Define estratégia de leitura (use `find_symbol` em vez de `read_file`), custos medidos de cada recurso e de um carregamento Simple (~4.000 tokens) versus Complex (~9.000 tokens), o teto de `SKILL.md` (25.000 caracteres, verificado por `oma skill audit`), tratamento de arquivos grandes e sintomas de overflow de contexto. | No início do workflow |
| **`difficulty-guide.md`** | Define critérios de classificação Simple/Medium/Complex, turnos esperados, ramificações de protocolo (Fast Track / Standard / Extended) e recuperação de um julgamento errado. | No início da tarefa (Step 0) |
| **`quality-principles.md`** | Quatro princípios universais de qualidade aplicados a todos os agentes. | No início de workflows orientados à qualidade (ultrawork) |
| **`vendor-detection.md`** | Protocolo para detectar o runtime atual (Claude Code, Codex CLI, Antigravity, Cursor, Kiro, Qwen e fallback CLI), usando marcadores do host e estado do fornecedor configurado. | No início do workflow |
| **`session-metrics.md`** | Pontuação de Clarification Debt (CD) e acompanhamento das métricas da sessão. Define eventos (clarify +10, correct +25, redo +40), limiares (CD >= 50 = RCA, CD >= 80 = pause) e pontos de integração. | Durante sessões de orquestração |
| **`common-checklist.md`** | Checklist universal de qualidade aplicado na verificação final de tarefas Complex, além dos checklists específicos do agente. | Etapa Verify de tarefas Complex |
| **`lessons-learned.md`** | Repositório de aprendizados de sessões anteriores, gerado após violações de Clarification Debt e experimentos descartados. Organizado por domínio e com QA Evaluation Lessons para rastrear pontos cegos do avaliador. | Consultado após erros e no fim da sessão |
| **`api-contracts/`** | Diretório com o template de contrato de API e contratos gerados. `template.md` define o formato por endpoint (método, caminho, schemas de request/response, auth e erros). | Quando o trabalho atravessa fronteiras |

### Recursos de runtime (`.agents/skills/_shared/runtime/`)

| Recurso | Finalidade |
|---------|---------|
| **`memory-protocol.md`** | Formato e operações de arquivos de memória para subagentes CLI. Define protocolos On Start, During Execution e On Completion usando ferramentas de memória configuráveis, com extensão para rastrear experimentos. |
| **`execution-protocols/claude.md`** | Padrões de execução específicos do Claude Code, injetados por `oma agent spawn` quando o fornecedor é claude. |
| **`execution-protocols/antigravity.md`** | Padrões de execução da CLI Antigravity (`agy`). |
| **`execution-protocols/codex.md`** | Padrões de execução da CLI Codex. |
| **`execution-protocols/commandcode.md`** | Padrões de execução do CommandCode. |
| **`execution-protocols/grok.md`** | Padrões de execução do Grok. |
| **`execution-protocols/kimi.md`** | Padrões de execução do Kimi Code. |
| **`execution-protocols/kiro.md`** | Padrões de execução do Kiro. |
| **`execution-protocols/opencode.md`** | Padrões de execução da extensão OpenCode. |
| **`execution-protocols/pi.md`** | Padrões de execução do pi. |
| **`execution-protocols/qwen.md`** | Padrões de execução da CLI Qwen. |

Os protocolos específicos de fornecedor são injetados automaticamente em agentes iniciados pela CLI com `oma agent spawn`. Subagentes nativos usam as regras de integração do fornecedor selecionado.

### Recursos condicionais (`.agents/skills/_shared/conditional/`)

Estes são carregados apenas quando condições específicas são atendidas durante a execução:

| Recurso | Condição de Gatilho | Carregado Por | Tokens Aprox. |
|---------|---------------------|--------------|--------------|
| **`quality-score.md`** | Fase VERIFY ou SHIP começa em um workflow que suporta medição de qualidade | Orquestrador (passa para prompt do agente QA) | ~250 |
| **`experiment-ledger.md`** | Primeiro experimento registrado após estabelecer baseline IMPL | Orquestrador (inline, após medição de baseline) | ~250 |
| **`exploration-loop.md`** | Mesmo portão falha duas vezes no mesmo problema | Orquestrador (inline, antes de spawnar agentes de hipótese) | ~250 |

Impacto no orçamento: aproximadamente 750 tokens no total se todos os 3 forem carregados. Como o carregamento é condicional, sessões típicas carregam 1-2 destes — um valor pequeno perto dos ~4.000 tokens que uma tarefa Simple já usa com `SKILL.md` e `execution-protocol.md`.

---

## Como habilidades roteiam via skill-routing.md

O mapa de roteamento de habilidades define como tarefas são correspondidas a agentes:

### Roteamento simples (domínio único)

Um prompt contendo "Build a login form with Tailwind CSS" corresponde às palavras-chave `UI`, `component`, `form`, `Tailwind` e roteia para **oma-frontend**.

### Roteamento de requisições complexas

Requisições multi-domínio seguem ordens de execução estabelecidas:

| Padrão da Requisição | Ordem de Execução |
|---------------------|------------------|
| "Create a fullstack app" | oma-pm -> (oma-backend + oma-frontend) paralelo -> oma-qa |
| "Create a mobile app" | oma-pm -> (oma-backend + oma-mobile) paralelo -> oma-qa |
| "Fix bug and review" | oma-debug -> oma-qa |
| "Design and build a landing page" | oma-design -> oma-frontend |
| "I have an idea for a feature" | oma-brainstorm -> oma-pm -> agentes relevantes -> oma-qa |
| "Do everything automatically" | oma-orchestration (internamente: oma-pm -> agentes -> oma-qa) |

### Regras de dependência inter-agente

**Podem executar em paralelo (sem dependências):**
- oma-backend + oma-frontend (quando contrato de API é pré-definido)
- oma-backend + oma-mobile (quando contrato de API é pré-definido)
- oma-frontend + oma-mobile (independentes um do outro)

**Devem executar sequencialmente:**
- oma-brainstorm -> oma-pm (design vem antes do planejamento)
- oma-pm -> todos os outros agentes (planejamento vem primeiro)
- agente de implementação -> oma-qa (revisão após implementação)
- oma-backend -> oma-frontend/oma-mobile (quando não há contrato de API pré-definido)

**QA é sempre por último**, exceto quando o usuário solicita revisão de arquivos específicos apenas.

---

## Matemática de economia de tokens {#token-savings-math}

Esses números são medidos na árvore de skills, e não estimados manualmente. Recalcule-os a qualquer momento:

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

As contagens de tokens são **aproximações** (bytes ÷ 4, proporção aproximada para Markdown em inglês). Tabelas e blocos de código tokenizam um pouco pior, então os valores ficam ligeiramente abaixo do real; use um tokenizer real para o modelo-alvo se precisar de números exatos.

### Níveis de carregamento

Cada nível corresponde a um estado que um agente realmente alcança, segundo [`context-loading.md`](https://github.com/first-fluke/oh-my-agent/blob/main/.agents/skills/_shared/core/context-loading.md):

| Nível | O que entra no contexto |
|------|--------------------------|
| `routed` | Apenas `SKILL.md` |
| `simple` | + `execution-protocol.md` |
| `medium` | + o recurso mapeado para a tarefa, quando esse arquivo existe |
| `complex` | + o recurso mapeado e as referências de stack quando o projeto as fornece |
| `all` | `SKILL.md` + todos os arquivos de recursos — o **teto**, não um modo selecionável |

Para as skills backend e mobile, `/stack-set` pode gerar referências específicas do projeto em `stack/`. Um checkout novo não contém um diretório de stack gerado, então a linha `complex` abaixo é medida contra as seeds fornecidas em `variants/`, das quais a geração parte: trata-se de um proxy de tamanho, não de um arquivo que o agente carregue.

### Uma sessão com 5 agentes (pm, backend, frontend, mobile, qa)

| Nível | Tokens | Participação do teto | Evitados |
|--------|-------:|-----------------:|--------:|
| `routed` | 11,497 | 15.7% | 84.3% |
| `simple` | 17,923 | 24.4% | 75.6% |
| `medium` | 19,125 | 26.1% | 73.9% |
| `complex` | 39,156 | 53.4% | 46.6% |
| `all` | 73,355 | 100% | — |

Assim, uma tarefa Simple ou Medium em cinco agentes mantém aproximadamente **17–19K tokens** de contexto de skills em vez do teto de 73K, enquanto uma tarefa Complex mantém cerca de **38K**. A economia fica em torno de 74–76% no trabalho comum e cai para aproximadamente 47% quando uma tarefa carrega referências de stack. Em um modelo com contexto de 128K, isso deixa cerca de 110K livres para trabalho Simple/Medium e 90K para trabalho Complex.

:::note Leia `all` como um limite, não como uma alternativa
Nenhum runtime carrega todos os recursos antecipadamente: as skills são apresentadas por sua `description`, seu corpo é lido quando roteado e os recursos são lidos conforme a necessidade. `all` é o limite superior do custo que uma skill *poderia* ter; por isso os percentuais acima indicam o que é "evitado", e não uma comparação com uma configuração real.
:::

A Camada 1 é o piso, e ele não é pequeno: entre as 33 skills instaladas, `SKILL.md` ocupa cerca de 1.275–5.489 tokens (mediana ~2.631). Esse piso limita o quanto a divulgação progressiva pode economizar; com os cinco agentes roteados, apenas o nível `routed` já representa 15% do teto.

---

## Carregamento de recursos conforme a dificuldade da tarefa

O guia de dificuldade classifica as tarefas em três níveis, que determinam quanto da Camada 2 é carregado:

### Simples (3-5 turnos esperados)

Mudança em um único arquivo, requisitos claros, repetição de padrões existentes.

Carrega: somente `execution-protocol.md`. Pule a análise e siga diretamente para a implementação com um checklist mínimo.

### Média (8-15 turnos esperados)

Mudança em 2–3 arquivos, algumas decisões de design necessárias, aplicação de padrões a novos domínios.

Carrega: `execution-protocol.md` e o recurso Medium mapeado quando esse arquivo existe. Protocolo padrão com análise breve e verificação completa.

### Complexa (15-25 turnos esperados)

Mudança em 4 ou mais arquivos, decisões de arquitetura necessárias, introdução de novos padrões ou dependências de outros agentes.

Carrega: `execution-protocol.md`, o recurso mapeado e referências disponíveis de `tech-stack.md`/`snippets.md`. Protocolo estendido com checkpoints, registro de progresso durante a execução e verificação completa incluindo `common-checklist.md`.

---

## Mapas de tarefas de context-loading (por agente)

O guia de context-loading fornece mapeamentos detalhados entre tipo de tarefa e recurso. Estes são os principais:

### Agente backend

| Tipo de tarefa | Recursos obrigatórios |
|-----------|-------------------|
| Criação de API CRUD | `variants/{node,python,rust}/snippets.md` correspondente quando existir |
| Autenticação | `snippets.md` e `tech-stack.md` da variante correspondente quando existirem |
| Migração de DB | `snippets.md` da variante correspondente quando existir |
| Otimização de performance | `orm-reference.md` e exemplos correspondentes fornecidos pela skill |
| Modificação de código existente | provedor de inteligência de código do projeto e recursos de execução relevantes |

### Agente frontend

| Tipo de tarefa | Recursos obrigatórios |
|-----------|-------------------|
| Criação de componente | snippets.md + padrões de componentes existentes no projeto |
| Implementação de formulário | snippets.md (form + Zod) |
| Integração com API | snippets.md (TanStack Query) |
| Estilização | tailwind-rules.md |
| Layout de página | snippets.md (grid) |

### Agente de design

| Tipo de tarefa | Recursos obrigatórios |
|-----------|-------------------|
| Criação de sistema de design | reference/typography.md + reference/color-and-contrast.md + reference/spatial-design.md + design-md-spec.md |
| Design de landing page | reference/component-patterns.md + reference/motion-design.md + prompt-enhancement.md |
| Auditoria de design | checklist.md + anti-patterns.md |
| Exportação de design tokens | design-tokens.md |
| Efeitos 3D/shader | reference/shader-and-3d.md + reference/motion-design.md |
| Revisão de acessibilidade | reference/accessibility.md + checklist.md |

### Agente de QA

| Tipo de tarefa | Recursos obrigatórios |
|-----------|-------------------|
| Revisão de segurança | checklist.md (seção Security) |
| Revisão de performance | checklist.md (seção Performance) |
| Revisão de acessibilidade | checklist.md (seção Accessibility) |
| Auditoria completa | checklist.md (completo) + self-check.md |
| Pontuação de qualidade | quality-score.md (condicional) |

---

## Composição de prompt do orquestrador

Quando o orquestrador compõe prompts para subagentes, inclui somente recursos relevantes à tarefa:

1. A seção Core Rules do SKILL.md do agente
2. `execution-protocol.md`
3. Recursos correspondentes ao tipo de tarefa específico, a partir dos mapas acima
4. `error-playbook.md` (sempre incluído; recuperação é essencial)
5. Memory Protocol (modo CLI)

Essa composição direcionada evita carregar recursos desnecessários e maximiza o contexto disponível do subagente para o trabalho real.

---

## Dívida de clarificação e métricas de sessão (análise detalhada)

Clarification Debt (CD) mede o custo de requisitos pouco claros durante uma sessão. O orquestrador acompanha cada correção do usuário e atribui uma pontuação:

| Tipo de evento | Pontos | Descrição |
|------------|-------|---------------|
| `clarify` | +10 | Pergunta simples de clarificação (esperada para incerteza MEDIUM) |
| `correct` | +25 | Mal-entendido de intenção que exige mudar de direção |
| `redo` | +40 | Violação de escopo/charter que exige rollback e reinício |
| `blocked` | +0 | Agente parou corretamente e perguntou (bom comportamento, sem penalidade) |

**Modificadores:** charter não lido (+15), violação de allowlist (+20), repetição do mesmo erro (x1.5).

**Limiares e enforcement:**
- **CD >= 50** → Entrada de RCA obrigatória adicionada a `lessons-learned.md`
- **CD >= 80** → Sessão pausada; o usuário deve reespecificar os requisitos
- **`redo` >= 2** → Orquestrador pausa e pede confirmação explícita do escopo
- **CD >= 30 em 3 sessões consecutivas para o mesmo agente** → Revisão do template de prompt desse agente

O log da sessão fica em `.agents/state/memories/session-metrics.md`, com uma linha por evento (turno, agente, tipo, pontos, detalhe) e uma seção de resumo.

---

## Precisão do avaliador e ajuste de QA

Os agentes de QA melhoram por meio de erros de julgamento rastreados. Diferentemente do CD (em tempo real), a Evaluator Accuracy (EA) é retrospectiva; a maioria dos erros só aparece depois que a sessão termina.

**Tipos de eventos EA:**

| Evento | Pontos | Quando descoberto |
|--------|-------|-------------------|
| `false_negative` | +30 | Próxima sessão ou produção — bug que o QA não detectou |
| `false_positive` | +15 | Durante a sessão — agente de implementação refuta com sucesso o achado do QA |
| `severity_mismatch` | +10 | Durante a sessão ou na revisão seguinte — severidade atribuída incorretamente |
| `missed_stub` | +20 | Verificação em runtime captura uma feature apenas visual |
| `good_catch` | -10 | QA capturou um bug não óbvio (sinal de recompensa positiva) |

**EA é calculada em uma janela móvel de 3 sessões.** Limiares:
- **EA >= 30** → Ajuste sugerido: revisar os eventos EA acumulados em busca de erros recorrentes do QA
- **EA >= 50** → Ajuste obrigatório: atualizar o execution-protocol.md do QA
- **`false_negative` >= 3** na janela → Adicionar o padrão de detecção ao checklist.md do QA
- **`good_catch` >= 5** na janela → Generalizar o padrão bem-sucedido em `common-checklist.md`

Quando um limiar é violado, revise os eventos EA, categorize os erros, aplique patches ao checklist/protocolo de execução do QA e valide nas 3 sessões seguintes.

---

## Decomposição em sprints para tarefas complexas

Tarefas complexas (4 ou mais arquivos e decisões de arquitetura) usam execução baseada em sprints, em vez de uma única execução longa:

1. **Decomponha** em 2–4 sprints focados em funcionalidades, cada um testável de forma independente
2. **Mire** 5–8 turnos por sprint
3. **Sprint Gate** após cada sprint:
   - O entregável do sprint está completo?
   - Lint/teste passa?
   - Se o sprint levou 2x os turnos esperados, escreva um checkpoint e informe o usuário
4. **Continue** para o sprint seguinte quando o gate for aprovado

**Exemplo:** a tarefa "JWT auth + CRUD API + tests" é decomposta em:
- Sprint 1: modelo de usuário + endpoints de auth (register/login)
- Sprint 2: endpoints CRUD + validação
- Sprint 3: testes + tratamento de erros

**Recuperação de um julgamento errado de dificuldade:** se uma tarefa começou como Simples mas se revelar mais complexa, o agente eleva para o protocolo Médio ou Complexo durante a execução e registra a mudança no progresso.

---

## Protocolo de reset de contexto

Agentes de longa duração perdem qualidade conforme o contexto enche. O Orquestrador, e não o agente, monitora esse estado e aciona resets.

**Condições de disparo (verificadas pelo Orquestrador durante o monitoramento):**

| Condição | Detecção | Ação |
|----------|----------|------|
| Orçamento de turnos esgotado | Agente consumiu >= 80% dos turnos esperados E menos de 50% dos critérios de aceitação estão completos | Reset de contexto |
| Progresso estagnado | Nenhuma atualização no arquivo de progresso por 3 ou mais ciclos consecutivos de monitoramento | Reset de contexto |
| Saída superficial | Arquivo de resultado contém marcadores de stub ou placeholders TODO | Re-spawn com instrução explícita |

**Procedimento de reset:**
1. **Checkpoint** — salvar o estado atual do agente (itens completos, itens restantes e decisões-chave)
2. **Terminar** — parar a execução atual do agente
3. **Re-spawnar** — iniciar um agente novo com o checkpoint como contexto
4. **Retomar** — o novo agente lê o checkpoint e continua somente os itens restantes

Para agentes standalone (sem Orquestrador), o Sprint Gate em `difficulty-guide.md` serve como rede de segurança: se um sprint levar 2x os turnos esperados, o agente escreve um checkpoint e informa.
