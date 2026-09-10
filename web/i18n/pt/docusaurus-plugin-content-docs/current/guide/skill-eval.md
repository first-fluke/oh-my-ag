---
title: "Avaliação da utilidade de skills"
sidebar_label: Avaliação de skills
description: Como escrever fixtures de tarefas de avaliação para oma skill eval, a convenção do diretório .agents/eval/, os tipos de verificador e os modos de execução mock/live.
---

# Avaliação da utilidade de skills

`oma skill eval` mede se carregar uma skill realmente melhora os resultados das tarefas do agente. Ele responde a uma pergunta diferente de `oma skill audit` (que pergunta “duas skills são redundantes?”): pergunta “esta skill ajuda?”.

O design segue duas descobertas de pesquisa: o WikiSkill (arXiv:2608.27454) separa experiência bruta, conhecimento persistente e skills executáveis, mantendo gates reservados para a evolução; o SkillLens (arXiv:2605.23899) mostra que a utilidade de uma skill é independente da distinção da descrição: uma skill distinta ainda pode ser inútil, e uma skill sobreposta ainda pode ajudar.

---

## Como funciona

Para cada fixture de tarefa, o comando executa dois braços:

1. **Braço de baseline** — o prompt da tarefa é enviado a um agente sem a skill.
2. **Braço de tratamento** — `SKILL.md` é colocado no início do prompt e a mesma tarefa é enviada.

Cada braço recebe uma pontuação (0 = falha, 1 = aprovação) pelo verificador da tarefa. A métrica principal é:

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

Uma skill passa quando `utilityLift ≥ 5%`. Abaixo desse limiar, ela recebe aviso (lift marginal) ou falha (sem lift). São necessárias pelo menos 5 tarefas pontuáveis para obter um veredicto.

---

## Convenção `.agents/eval/<skill>/`

Coloque as fixtures de tarefas em `.agents/eval/<skill>/`. Esse caminho fica dentro de `.agents/`, mas fora do próprio diretório da skill, portanto sobrevive a `oma update` sem substituir avaliações escritas pelo usuário.

```
.agents/eval/
└── oma-scholar/
    ├── claims-only.yaml        ← task fixture
    ├── entity-lookup.yaml
    ├── partial-fetch.yaml
    ├── structured-output.yaml
    ├── edge-empty-response.yaml
    └── _rollouts/
        └── a3f1b2c4d5e6f7a8.json   ← recorded arm outputs + judge verdicts
```

Arquivos que começam com `_` são ignorados ao carregar fixtures de tarefas. O subdiretório `_rollouts/` guarda saídas registradas de execuções anteriores com `--live --record`.

---

## Esquema de uma fixture de tarefa

Cada fixture é um arquivo YAML com os campos a seguir:

```yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
checker:
  type: judge
  rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

| Campo | Obrigatório | Descrição |
|:------|:---------|:-----------|
| `id` | Sim | Identificador único desta tarefa (usado nos nomes de arquivo de rollouts e relatórios) |
| `skill` | Sim | Skill avaliada (corresponde ao nome do diretório pai) |
| `domain` | Sim | Rótulo de domínio (usado para agrupamento e futura detecção de transferência negativa) |
| `prompt` | Sim | Prompt da tarefa enviado aos dois braços |
| `checker` | Não | Como pontuar a saída do braço. O padrão é `{ type: judge }` quando omitido. |
| `weight` | Sim | Peso relativo para a pontuação média ponderada (use `1`, salvo quando tarefas tiverem importâncias diferentes) |

### Tipos de verificador

#### judge (padrão)

Um LLM avalia a saída do braço contra uma rubrica e retorna PASS ou FAIL. Esse é o padrão quando `checker` é omitido ou quando `checker.type` não está presente.

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

O campo `rubric` é opcional; quando omitido, usa-se a rubrica padrão: "Does the answer correctly and completely satisfy the task prompt?"

Também é possível escrever a rubrica no nível superior por brevidade:

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**Importante:** no modo `--mock`, tarefas judge exigem um veredicto previamente registrado em `_rollouts/`. Se não houver veredicto registrado para uma tarefa, ela será excluída do relatório com um aviso. Execute `--live --record` para preencher os rollouts primeiro.

O mesmo vale para qualquer tipo de verificador quando faltar completamente um braço: a tarefa é excluída em vez de receber 0. Dados ausentes não são uma resposta falha; pontuá-los faria os dois braços valerem 0 e um lift zero aparecer como `decision: "fail"`. Exclusões que reduzem a contagem pontuada abaixo de `MIN_TASKS` aparecem como `coverage: "insufficient"`.

#### assert (opcional)

Verificação determinística por substring. Use para verificar contratos, formatos ou chamadas de ferramenta quando a saída esperada for exata.

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

Passa quando cada string em `expect_contains` está presente na saída do braço.

#### regex (opcional)

Correspondência determinística por regex. Use quando for necessário um padrão em vez de uma string exata.

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

Padrões com mais de 200 caracteres recebem 0 (barreira contra ReDoS). A saída é truncada para 10.000 caracteres antes da correspondência.

---

## Modos de execução

### --mock (padrão)

Reproduz rollouts registrados de `_rollouts/`. É totalmente determinístico e offline: nenhum LLM é chamado.

- Para verificadores `assert`/`regex`, as pontuações são calculadas a partir das strings de saída registradas.
- Para verificadores `judge`, reproduz o campo `score` registrado por `--live --record`.

Se uma tarefa judge não tiver uma pontuação registrada em `_rollouts/`, ela será excluída do relatório (com um aviso no console). Assim, o modo mock continua estritamente offline.

As gravações também são verificadas quanto à obsolescência antes do uso. Uma entrada de tratamento gravada sob um corpo de SKILL.md diferente, uma entrada cuja fixture `prompt` tenha mudado e qualquer entrada anterior ao rastreamento de proveniência são descartadas com um aviso que informa o arquivo e a quantidade. Quando isso deixa menos que `MIN_TASKS` tarefas pontuáveis, a execução informa `coverage: "insufficient"` em vez de um veredicto, para que uma skill editada nunca herde sua pontuação anterior.

:::note `oma skill optimize --mock`
O otimizador pontua corpos candidatos de SKILL.md. Como uma gravação só é válida para o corpo a partir do qual foi feita, corpos candidatos não têm rollouts correspondentes e aparecem sem cobertura. Use `--live` para pontuar candidatos.
:::

Seguro para CI. Defina `OMA_SKILLEVAL_MOCK=1` para forçar este modo.

```bash
oma skill eval --skill oma-scholar
```

### --live

Cria braços de agentes reais por meio de `oma agent spawn --read-only`. Os dois braços executam em um workspace temporário para impedir alterações nos arquivos do projeto.

Antes do dispatch, o comando imprime uma prévia de custo com a quantidade de tarefas, dispatches de braços, dispatches de judge e vendor resolvido. Confirme com `y` ou ignore com `--yes`.

Os outros controles são úteis no CI e em investigações de cobertura:

| Opção | Efeito |
| --- | --- |
| `--task-dir <path>` | Avalia fixtures de um diretório diferente de `.agents/eval/<skill>`. |
| `--max-tasks <n>` | Limita a quantidade de fixtures em uma execução live delimitada. |
| `--neg-transfer` | Amostra vizinhas do mesmo domínio para procurar transferência negativa; desativado por padrão. |
| `--require-coverage` | Sai com código diferente de zero quando restarem menos de cinco tarefas emparelhadas pontuáveis. |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### Isolamento da skill (mantendo o baseline honesto) {#skill-isolation-keeping-the-baseline-honest}

`utilityLift` só é significativo se o **braço de baseline executar sem a skill-alvo**. O problema é que um agente enviado automaticamente carrega todas as skills instaladas em seu runtime; um baseline ingênuo ainda carregaria a skill que deveria ser medida *sem* ela, contaminando a comparação (baseline ≈ tratamento, lift ≈ 0).

Para evitar isso, `--live` executa **os dois braços em um workspace temporário isolado** cujo diretório de skills contém todas as skills instaladas **exceto a alvo**. O braço de tratamento readiciona a alvo **somente** por meio do `SKILL.md` injetado (colocado no início do prompt). Assim, a injeção é a única variável controlada: baseline = sem skill, tratamento = o `SKILL.md` candidato.

Isso funciona porque a maioria dos vendors descobre skills **relativas ao diretório de trabalho** (por exemplo, `<cwd>/.claude/skills`, `<cwd>/.codex/skills`): um diretório de trabalho limpo realmente oculta a skill. O relatório declara o quanto o isolamento funcionou por meio de um campo `isolation`:

| Status | Significado |
|---|---|
| `enforced` | Vendor relativo ao cwd, com a skill-alvo ausente do caminho HOME: totalmente isolado. |
| `best-effort` | Vendor relativo ao cwd, mas também existe uma cópia da skill no HOME (ou o vendor é desconhecido); a cópia do projeto fica oculta, mas a cópia no HOME pode vazar. Marcado com baixa confiança. |
| `unavailable` | Vendor baseado em HOME (por exemplo, **antigravity**, que lê `~/.gemini/antigravity-cli/skills`); um cwd limpo não consegue ocultá-lo. Um aviso é impresso e o resultado é marcado com baixa confiança. |
| n/a | Modo mock: não há dispatch live. |

Quando o isolamento não for `enforced`, um aviso de uma linha é impresso e o resultado deve ser tratado como de baixa confiança. Para um sinal limpo, execute a avaliação com um vendor **relativo ao cwd e isolável** (claude / codex / qwen), em vez de um baseado em HOME; o vendor da avaliação segue `model_preset` em `.agents/oma-config.yaml`, então selecione um preset cujo vendor padrão seja relativo ao cwd.

### --live --record

Executa braços live e grava as saídas capturadas (incluindo veredictos de judge para tarefas com verificador judge) em `_rollouts/<hash>.json`. O nome do arquivo é um hash SHA-256 determinístico do conjunto de IDs de tarefas, não baseado em data nem aleatoriedade.

Use isso para preparar execuções `--mock` na sua máquina, para que repetições permaneçam offline.

Cada entrada carrega proveniência para que uma reprodução posterior possa verificar se ainda se aplica:

| Campo | Registrado em | Comparado com |
|---|---|---|
| `skillBodyHash` | `treatment` somente | o corpo SKILL.md avaliado |
| `promptHash` | os dois braços | o `prompt` atual da fixture |

O braço de baseline não recebe a skill, portanto editar SKILL.md não o invalida; somente o braço de tratamento precisa ser gravado novamente.

:::caution `_rollouts/` é somente local — não faça commit
Uma gravação só é reproduzida para o corpo exato de SKILL.md a partir do qual foi criada. Edite uma skill e suas gravações de tratamento serão descartadas na próxima execução `--mock`; um arquivo gravado em Git ficaria obsoleto na próxima alteração do SKILL.md e emitiria avisos para todas as pessoas que o baixassem. O diretório é ignorado pelo Git; grave localmente.
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

Depois de uma execução live bem-sucedida, o relatório inclui as contagens de baseline e tratamento, `utilityLift`, `coverage: "ok"`, o estado de isolamento e uma decisão pass/warn/fail. Uma execução mock posterior reutiliza somente gravações cujos prompts de tarefa e corpo da skill de tratamento ainda correspondam.

---

## Um conjunto mínimo de fixtures funcional

São necessárias cinco fixtures para um veredicto (`MIN_TASKS = 5`). Este é um conjunto mínimo para uma skill imaginária `oma-scholar`:

```yaml
# .agents/eval/oma-scholar/claims-only.yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

```yaml
# .agents/eval/oma-scholar/entity-lookup.yaml
id: entity-lookup
skill: oma-scholar
domain: research
prompt: "Look up the entity knows:concept/attention-mechanism"
rubric: "Does the answer return the entity name, description, and at least one related concept?"
weight: 1
```

Repita para pelo menos mais três tarefas. Depois, execute:

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```

---

## Ler o relatório

**Saída de texto:**

```
Skill utility eval  (skill: oma-scholar)
  tasks: 7
  isolation: enforced [codex]

  baseline: 42.9%  treatment: 71.4%
  utilityLift: 28.6%  (stddev: 14.3%)
  [PASS]
  Skill shows positive utility lift >= 5%.

  Per-task findings:
    claims-only: baseline=0 treatment=1 lift=+1.000
    entity-lookup: baseline=1 treatment=1 lift=+0.000
    ...

  Thresholds: fail <= 0%, warn < 5%
```

**Saída JSON** (com `--json`):

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "taskCount": 7,
  "coverage": "ok",
  "decision": "pass",
  "baselineScore": 0.4286,
  "treatmentScore": 0.7143,
  "utilityLift": 0.2857,
  "utilityStdDev": 0.1429,
  "findings": [
    { "taskId": "claims-only", "baseline": 0, "treatment": 1, "lift": 1.0 }
  ],
  "negativeTransfer": [],
  "isolation": "enforced",
  "isolationVendor": "codex"
}
```

`ok` é `true` somente quando `coverage === "ok"` e `decision === "pass"`. O campo `isolation` informa se o braço de baseline realmente executou sem a skill-alvo (consulte [Isolamento da skill](#skill-isolation-keeping-the-baseline-honest)); `isolation` é `"n/a"` no modo `--mock`.

---

## Integração CI

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

Códigos de saída:
- `0` — aprovação ou aviso
- `1` — falha ou cobertura insuficiente com `--require-coverage`

---

## Escolher o modo live ou mock

Use `--live` com verificadores judge para medir a utilidade real em tarefas abertas. Use `--mock` para reproduzir offline veredictos judge registrados anteriormente ou executar verificações determinísticas de contrato `assert`/`regex`.

O determinismo do mock é preservado gravando o veredicto binário do judge (PASS/FAIL) na entrada do rollout durante `--live --record` e reproduzindo essa pontuação registrada em execuções `--mock` posteriores: não há uma nova chamada ao LLM.

**Saída de dados:** durante `--live`, o dispatch do judge envia a saída do braço candidato ao vendor configurado para avaliação. Um aviso único é impresso no início de cada execução live.

Se uma execução mock informar cobertura insuficiente, inspecione o aviso em busca de entradas `_rollouts` descartadas ou ausentes e execute uma gravação live depois de corrigir a fixture ou a skill. Se o isolamento for `best-effort` ou `unavailable`, escolha um vendor relativo ao cwd, como Claude, Codex ou Qwen, antes de tratar um lift como sinal forte.

---

## Publicar tarefas de avaliação com uma skill

Skills podem incluir um conjunto de tarefas de avaliação colocando fixtures em `.agents/eval/<skill>/`. Esses são arquivos escritos pelo usuário fora do diretório da skill, portanto sobrevivem a `oma update`. Ao criar uma nova skill com `oma-skill-creation`, adicione um conjunto correspondente de fixtures em `eval/` para oferecer às futuras pessoas autoras uma forma de verificar o efeito da skill. Consulte `.agents/skills/oma-skill-creation/SKILL.md` para o fluxo de autoria de skills.
