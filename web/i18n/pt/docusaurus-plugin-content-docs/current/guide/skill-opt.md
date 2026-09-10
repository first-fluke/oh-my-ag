---
title: "Otimização de skills"
sidebar_label: Otimização de skills
description: Como usar oma skill optimize para evoluir skills de forma persistente e orientada por evidências, com gates determinísticos de treino, validação e holdout pertencente ao runner.
---

# Otimização de skills

`oma skill optimize` evolui o `SKILL.md` de uma skill para maximizar seu `utilityLift` medido por `oma skill eval`. Ele separa evidências brutas de rollouts, conhecimento persistente delimitado e a skill executável. Um Wiki Maintainer consolida sucessos e falhas observáveis; um Proposer usa esse conhecimento para emitir edições limitadas de adição/remoção/substituição. Os candidatos precisam melhorar a utilidade de validação reservada, e `--apply` também exige melhoria em uma divisão de holdout pertencente ao runner. Em produção não há consulta extra a um wiki durante a inferência: a saída continua sendo um `SKILL.md`.

Base de pesquisa: Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C., & Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## Dependência obrigatória: fixtures de tarefas de avaliação

`oma skill optimize` não executa sem fixtures de tarefas de avaliação. Ele exige pelo menos **5 fixtures de tarefa** (`MIN_TASKS = 5`) em `.agents/eval/<skill>/`. Se encontrar menos, o comando falha imediatamente:

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

Consulte o [guia de avaliação da utilidade de skills](/docs/guide/skill-eval) para a convenção do diretório `.agents/eval/<skill>/`, o schema de fixtures, os tipos de verificador e como preparar rollouts para reprodução mock.

---

## Como funciona

As fixtures são ordenadas pelo ID da tarefa e divididas deterministicamente em conjuntos de **treino**, **validação reservada** e **teste final pertencente ao runner**. Com pelo menos cinco fixtures, as proporções-alvo são 60/20/20 e cada partição tem pelo menos uma tarefa. As tarefas do teste final vêm deste conjunto de fixtures local; ficam reservadas ao Maintainer e ao Proposer durante o loop, não são obtidas de uma suíte externa oculta.

Para cada época (até `--max-epochs`, padrão 8):

1. **Pontuar o melhor `SKILL.md` atual no conjunto TRAIN** — `oma skill eval` retorna prompts, saídas e lift observáveis por tarefa.
2. **O Wiki Maintainer consolida as evidências** — até cinco falhas e três sucessos se tornam padrões ligados a evidências. Padrões delimitados e resultados de gates anteriores são recuperados do sistema de memória L1/L2/L3 do OMA.
3. **O Proposer emite K edições candidatas** (até `--edits-per-epoch`, padrão 4). Edições exatas que já aparecem no histórico persistente de rejeições são ignoradas.
4. **Para cada edição candidata:**
   - Aplique a edição a uma cópia do `SKILL.md` em memória.
   - Valide o candidato (os campos de frontmatter `name`/`description` devem sobreviver; o corpo deve ser analisável).
   - Aplique o orçamento textual de taxa de aprendizado: descarte edições cuja alteração líquida de caracteres exceda `--lr` (padrão 600 caracteres).
   - Pontue novamente o candidato no conjunto de **validação reservada**.
5. **Aceite o melhor candidato de validação somente se** o lift de validação melhorar estritamente (`Δlift > 0`) **e** nenhuma entrada de transferência negativa ultrapassar o piso de regressão (`NEG_TRANSFER_FAIL = -0.1`). Cada gate da proposta é persistido.
6. **Pare antecipadamente** depois de 2 épocas consecutivas sem uma edição aceita (`OPT_EARLY_STOP_PATIENCE = 2`).
7. **Execute o teste final pertencente ao runner depois da evolução.** O Maintainer e o Proposer nunca veem essas tarefas durante o loop. Um teste final falho impede `--apply` e registra o vencedor da validação como conhecimento rejeitado.

O otimizador nunca edita o `SKILL.md` ativo durante o loop: sempre trabalha em uma cópia candidata na memória.

---

## Uso

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### Opções

| Flag | Padrão | Descrição |
|:-----|:--------|:-----------|
| `--skill <id>` | `_all` | ID da skill a otimizar (nome simples, sem separadores de caminho). |
| `--dry-run` | **sim (padrão)** | Propõe edições e imprime o diff sem alterar `SKILL.md`; as evidências e os eventos de evolução gerados continuam persistindo. |
| `--apply` | — | Aplica as edições aceitas a `SKILL.md` e faz backup do original antes de uma escrita atômica. Só executa quando os gates de validação e do teste final pertencente ao runner passam; uma skill pertencente ao OMA também exige `--yes`. |
| `--mock` | **sim (padrão)** | Reproduz edições do otimizador e veredictos de avaliação registrados em `_rollouts/`. Determinístico, offline e seguro para CI. |
| `--live` | — | Dispatch live do otimizador por LLM, com chamadas reais por época. Imprime uma prévia de custo e pede confirmação, salvo com `--yes`. |
| `--max-epochs <n>` | `8` | Número máximo de épocas de otimização. |
| `--edits-per-epoch <k>` | `4` | Quantidade de edições candidatas propostas pelo LLM otimizador por época. |
| `--lr <chars>` | `600` | Orçamento textual de taxa de aprendizado: alteração líquida máxima de caracteres por edição aceita. |
| `--yes` | — | Ignora a confirmação da prévia de custo. Só tem efeito com `--live`. |
| `--json` | — | Emite JSON para CI/CD. |
| `--output <format>` | `text` | Formato de saída (`text` ou `json`). |

---

## Exemplo mínimo de ponta a ponta

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

Saída de exemplo:

```
[oma skill opt] skill: oma-scholar, tasks: 8 (train: 4, val: 4), dry-run: true

Skill opt  (skill: oma-scholar)
  applied: false
  baselineLift: 18.5%  finalLift: 32.0%
  epochs: 3  acceptedEdits: 2  rejected: 6

  diff:
--- a/SKILL.md
+++ b/SKILL.md
@@ -12,6 +12,9 @@
 ### When to use
 - User asks to look up an academic paper or technical claim.
+- User asks for a summary of arxiv abstracts or DOI-linked documents.
 - User wants citations or sources for a factual statement.
```

O diff mostra o que o otimizador escreveria. `SKILL.md` permanece inalterado, enquanto as evidências de evolução geradas e os resultados de gates delimitados são persistidos para execuções futuras.

---

## Aplicar uma melhoria validada

Quando estiver satisfeito com o diff proposto, execute novamente com `--apply`:

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

`--apply` grava somente quando a otimização encontra uma melhoria estritamente positiva na validação e o lift do candidato no teste final pertencente ao runner é maior que o lift do baseline. Um backup do `SKILL.md` original é criado antes da escrita atômica. O diff sempre é impresso para que você possa revisar a alteração.

---

## Modo live

O modo live chama o Maintainer e o Proposer reais e executa novamente os braços de avaliação live a cada época. É caro: cada tarefa pontuada tem chamadas de baseline e tratamento, fixtures judge adicionam chamadas de avaliação e o teste final pontua os corpos original e candidato. A prévia informa um limite superior de chamadas de modelo subjacentes a partir da divisão real. Cada chamada tem timeout de 120 segundos; os braços de avaliação do Claude executam restritos, com ferramentas, skills, MCP e AgentMemory do ambiente desabilitados.

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

A prévia de custo lista o limite superior de chamadas de modelo subjacentes antes de qualquer chamada de LLM.

---

## Saída JSON

```bash
oma skill optimize --skill oma-scholar --json
```

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "baselineLift": 0.1850,
  "finalLift": 0.3200,
  "epochCount": 3,
  "acceptedEdits": [
    { "op": "add", "anchor": "### When to use", "after": "\n- User asks for a summary of arxiv abstracts or DOI-linked documents." }
  ],
  "rejectedCount": 6,
  "applied": false,
  "diff": "--- a/SKILL.md\n+++ b/SKILL.md\n...",
  "_dryRun": true,
  "finalTest": { "baselineLift": 0.10, "candidateLift": 0.25, "passed": true },
  "_split": { "trainCount": 4, "valCount": 1, "testCount": 3 }
}
```

`ok` é `true` somente quando o candidato melhora a validação e o teste final pertencente ao runner não falha (ou quando o candidato foi aplicado). As contagens de `_split` mostram a partição local de fixtures usada na execução.

---

## Ressalva de SSOT para skills `oma-*`

Skills cujo ID começa com `oma-` pertencem ao oh-my-agent e são **substituídas por `oma update`**. Para essas skills, `--apply` é desaconselhado: use `--dry-run` (o padrão), revise o diff proposto e envie alterações ao registro se a melhoria for relevante. Para skills escritas pelo usuário, `--apply` é seguro.

O comando imprime um aviso quando a skill-alvo pertence ao OMA:

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

---

## Proteção contra overfitting

O Maintainer e o Proposer veem somente as evidências de rollout do TRAIN. A seleção de candidatos usa a divisão de **VALIDAÇÃO** reservada, enquanto a divisão de **TESTE** pertencente ao runner continua indisponível até o fim da evolução. Um vencedor da validação que não melhorar o teste final não é aplicado e é adicionado ao histórico persistente de rejeições.

---

## Integração CI

No modo `--mock`, `oma skill optimize` é totalmente determinístico e offline: nenhum LLM é chamado. Use-o no CI para verificar se um diff de skill proposto ainda mostra lift sobre os rollouts registrados:

```bash
oma skill optimize --skill oma-scholar --mock --json
```

Códigos de saída:
- `0` — otimização concluída (com ou sem melhoria)
- `1` — menos que `MIN_TASKS` fixtures ou argumento `--skill` inválido

---

## Consulte também

- [Avaliação da utilidade de skills](/docs/guide/skill-eval) — autoria de fixtures de tarefas, tipos de verificador, modos mock/live e o diretório `_rollouts/`.
- [Comandos da CLI](/docs/cli-interfaces/commands) — referência de flags para todos os comandos de gerenciamento de skills.
