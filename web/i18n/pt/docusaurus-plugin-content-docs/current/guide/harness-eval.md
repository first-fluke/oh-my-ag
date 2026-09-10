---
title: "Avaliação do harness"
sidebar_label: Avaliação do harness
description: Avalie uma sobreposição completa de harness do OMA com tarefas emparelhadas e isoladas de repositório e verificações determinísticas de artefatos.
---

# Avaliação do harness

`oma harness eval` mede se um harness candidato do OMA melhora um agente-alvo fixo sem mudar o modelo desse agente. O comando adapta o padrão de avaliação em tempo de teste de [AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses](https://arxiv.org/abs/2608.12307): mantenha o modelo-alvo fixo, altere o harness e compare os resultados nas mesmas tarefas.

Este comando avalia uma unidade maior que `oma skill eval`:

| Comando | Tratamento | Alvo da pontuação |
|:--------|:----------|:-------------|
| `oma skill eval` | Um corpo de `SKILL.md` | Saída do agente |
| `oma harness eval` | Uma sobreposição delimitada de `.agents/` | Arquivos e saída produzidos em um workspace de repositório |

Use a avaliação de skill para responder “esta skill ajuda?”. Use a avaliação do harness para responder “esta combinação de skills, workflows, regras e instruções de agente faz o agente fixo concluir tarefas do repositório com mais confiabilidade?”.

## Modelo de avaliação

Cada tarefa é executada como um experimento emparelhado:

1. OMA copia a fixture da tarefa para um workspace de baseline novo.
2. OMA copia as definições atuais de `agents`, `config`, `rules`, `skills` e `workflows` para esse workspace e as projeta no formato do vendor selecionado.
3. OMA repete a configuração em um segundo workspace novo e aplica a sobreposição candidata nele.
4. O mesmo agente principal, rota de vendor, prompt, permissões de escrita e timeout são usados nos dois braços.
5. Verificações determinísticas inspecionam o workspace resultante e a saída opcional do agente.

O projeto real nunca é usado como diretório de trabalho do braço. Workspaces temporários dos braços são removidos depois da pontuação; o sandbox de processo próprio do vendor selecionado continua sendo a autoridade para acessos fora desse diretório de trabalho.

## Estrutura do candidato

O caminho do candidato é um diretório que contém uma árvore `.agents/` parcial:

```text
candidate/
└── .agents/
    ├── agents/
    │   └── docs-curator.md
    ├── rules/
    │   └── documentation.md
    ├── skills/
    │   └── project-docs/
    │       └── SKILL.md
    └── workflows/
        └── docs-check.md
```

Somente arquivos abaixo de `.agents/agents`, `.agents/rules`, `.agents/skills` e `.agents/workflows` são aceitos. Hooks, fixtures do avaliador, estado, resultados, arquivos de configuração, symlinks e variantes de agentes do vendor são rejeitados. Campos protegidos do frontmatter do agente, como `model`, `tools`, `effort` e limites de execução, devem corresponder ao baseline. Um braço também falha se o agente em execução alterar definições protegidas de `.agents/` antes da pontuação.

## Formato da suíte

Uma suíte é um arquivo YAML e um diretório de fixture por tarefa:

```text
harness-eval/
├── suite.yaml
└── fixtures/
    ├── stale-api-doc/
    │   ├── docs/api.md
    │   └── src/session.ts
    └── missing-guide/
        ├── docs/
        └── src/feature.ts
```

```yaml
schema_version: 1
id: docs-harness
agent: docs-curator
tasks:
  - id: stale-api-doc
    prompt: Update the API documentation to match the implementation.
    workspace: fixtures/stale-api-doc
    weight: 1
    checks:
      - type: file_contains
        path: docs/api.md
        value: openSession
      - type: file_not_contains
        path: docs/api.md
        value: createSession
```

Os IDs das tarefas devem ser únicos. Os caminhos de fixtures e verificações devem permanecer dentro do projeto e do workspace da tarefa. Fixtures não podem conter symlinks nem superfícies de controle do harness do agente, como `.agents`, `.codex`, `.claude`, diretórios de skills de vendors ou arquivos de instruções do agente na raiz. Isso impede que os dados da tarefa ocultem o harness controlado de qualquer braço.

Diretórios de dependências gerados, como `node_modules` e `.venv`, não são copiados do harness de baseline. Faça commit da fonte de helpers determinísticos e dos manifestos de dependência na skill; disponibilize as dependências de runtime na fixture da tarefa quando uma verificação exigir isso.

### Tipos de verificador

| Tipo | Campos | Condição de aprovação |
|:-----|:-------|:---------------|
| `file_exists` | `path` | O caminho existe depois que o braço termina. |
| `file_not_exists` | `path` | O caminho não existe. |
| `file_contains` | `path`, `value` | O arquivo existe e contém o valor. |
| `file_not_contains` | `path`, `value` | O arquivo existe e não contém o valor. |
| `output_contains` | `value` | A saída capturada do agente contém o valor. |
| `output_not_contains` | `value` | A saída capturada do agente não contém o valor. |

As verificações de artefatos são intencionalmente determinísticas. A primeira versão não executa scripts mutáveis de pacotes como avaliadores, porque um agente avaliado poderia alterar esses scripts ou seus testes e invalidar o avaliador.

## Executar e registrar

O modo live envia dois dispatches por tarefa, imprime uma prévia de custo e exige confirmação:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --live --record
```

Em uma execução bem-sucedida, o relatório contém as pontuações pareadas de baseline/candidato, um lift, contagens de regressão e uma decisão como `pass` ou `insufficient`. Se você alterar a suíte, as definições de baseline, a sobreposição candidata, prompts, fixtures ou verificações, grave uma nova execução live; um arquivo `_runs` antigo será rejeitado pelo seu hash.

Use `--yes` para execução não interativa e `--timeout-minutes` para definir o mesmo limite de tempo de parede em cada braço. A execução live só está disponível quando o vendor selecionado descobre arquivos do harness relativos ao workspace do projeto. O OMA recusa descoberta baseada em HOME, pois o baseline poderia enxergar conteúdo candidato instalado globalmente.

`--record` grava um registro JSON endereçado por hash em `_runs/`, ao lado da suíte. O registro vincula os resultados a três entradas:

- a suíte, os prompts, as verificações e os conteúdos das fixtures;
- as definições atuais do harness de baseline;
- os conteúdos da sobreposição candidata.

O modo mock é o padrão e não faz chamadas de modelo. Ele só reproduz um registro quando os três hashes ainda correspondem:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --mock --require-coverage
```

## Métricas e gate de decisão

Cada tarefa passa somente quando todas as verificações passam. As pontuações são médias ponderadas entre as tarefas emparelhadas:

```text
lift = candidateScore - baselineScore
```

O OMA também informa:

- tarefas corrigidas: o baseline falhou e o candidato passou;
- tarefas regredidas: o baseline passou e o candidato falhou;
- cobertura: são necessárias pelo menos cinco tarefas emparelhadas e pontuáveis.

O candidato passa quando o lift é de pelo menos 5 pontos percentuais e não há regressões. Qualquer regressão reprova o candidato. Um lift não negativo abaixo de 5 pontos gera um aviso, e menos de cinco tarefas emparelhadas produz uma decisão `insufficient`. Adicione `--require-coverage` para fazer a cobertura insuficiente sair com código diferente de zero no CI. Uma pontuação não é evidência quando falta um braço, o hash do registro está obsoleto ou uma verificação determinística está incompleta.

## Limite atual

Esta é uma base de avaliação, não uma otimização automática de harness. Um builder pode produzir sobreposições candidatas externamente e depois usar este comando como gate de aceitação. Uma suíte final oculta separada, tentativas estocásticas repetidas, runners de teste externos confiáveis, contabilização de tokens, fixação forçada de modelos para chamadas aninhadas de subagentes e um loop automatizado `harness opt` não fazem parte do comando atual. Até existir fixação de chamadas aninhadas, suítes destinadas a medir um único modelo fixo devem evitar workflows candidatos que criem outros papéis de agente configurados.
