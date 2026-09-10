---
title: "技能效用评估"
sidebar_label: 技能评估
description: "说明如何为 oma skill eval 编写评估任务 fixture、使用 .agents/eval/ 目录约定、选择检查类型，以及使用 mock/live 执行模式。"
---

# 技能效用评估

`oma skill eval` 衡量加载某个技能是否确实改善智能体任务结果。它回答的问题不同于 `oma skill audit`（询问“两个技能是否重复？”）：它询问“这个技能有帮助吗？”。

设计遵循两项研究发现：WikiSkill（arXiv:2608.27454）将原始经验、持久化知识和可执行技能分开，同时保留用于演进的保留集关卡；SkillLens（arXiv:2605.23899）表明技能效用独立于描述的独特性，一个独特的技能仍可能无用，存在重叠的技能仍可能有帮助。

---

## 工作原理

对于每个任务 fixture，命令运行两个分支：

1. **基线分支**：将任务提示调度给一个不提供该技能的智能体。
2. **处理分支**：把 `SKILL.md` 加到提示开头，然后调度相同任务。

每个分支都由任务的检查器评分（0 = 失败，1 = 通过）。主要指标是：

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

`utilityLift ≥ 5%` 时技能通过。低于该阈值时会标记为警告（提升有限）或失败（没有提升）。得出结论至少需要 5 个可评分任务。

---

## `.agents/eval/<skill>/` 约定

将任务 fixture 放在 `.agents/eval/<skill>/` 下。此路径位于 `.agents/` 内，但位于技能目录之外，因此 `oma update` 不会覆盖用户编写的评估。

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

加载任务 fixture 时会跳过以 `_` 开头的文件。`_rollouts/` 子目录保存之前 `--live --record` 运行记录的输出。

---

## 任务 fixture 模式

每个 fixture 都是包含以下字段的 YAML 文件：

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

| 字段 | 必填 | 说明 |
|:------|:---------|:-----------|
| `id` | 是 | 此任务的唯一标识符（用于 rollout 文件名和报告）。 |
| `skill` | 是 | 要评估的技能（与父目录名称匹配）。 |
| `domain` | 是 | 领域标签（用于分组和未来的负迁移检测）。 |
| `prompt` | 是 | 调度给两个分支的任务提示。 |
| `checker` | 否 | 如何评分智能体输出。省略时默认为 `{ type: judge }`。 |
| `weight` | 是 | 加权平均分使用的相对权重（除非任务重要性不同，否则使用 `1`）。 |

### 检查器类型

#### judge（默认）

LLM 根据 rubric 评估分支输出，并返回 PASS 或 FAIL。省略 `checker` 或省略 `checker.type` 时，这是默认类型。

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

`rubric` 字段可选；省略时使用默认 rubric：“答案是否正确且完整地满足任务提示？”

为了简写，也可以将 rubric 写在顶层：

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**重要：**在 `--mock` 模式中，judge 任务需要 `_rollouts/` 中之前记录的结论。如果任务没有已记录的结论，它会带警告从报告中排除。先运行 `--live --record` 填充 rollout。

任意检查器类型在某个分支完全缺失时也遵循相同规则：任务会被排除，而不是评分为 0。缺失数据不是失败答案，给它评分会让两个分支都变成 0，使零提升读作 `decision: "fail"`。如果排除后已评分数量低于 `MIN_TASKS`，报告会显示 `coverage: "insufficient"`。

#### assert（选择启用）

确定性的子串检查。用于契约、格式或工具调用验证，其中预期输出是精确值。

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

只有当分支输出包含 `expect_contains` 中的每个字符串时才通过。

#### regex（选择启用）

确定性的正则匹配。需要模式而非精确字符串时使用。

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

为防止 ReDoS，超过 200 个字符的模式评分为 0。匹配前会将输出截断到 10,000 个字符。


---

## 执行模式

### --mock（默认）

从 `_rollouts/` 重放已记录的 rollout。完全确定性且离线，不会调用 LLM。

- 对于 `assert`/`regex` 检查器：根据记录的输出字符串计算分数。
- 对于 `judge` 检查器：重放 `--live --record` 记录的 `score` 字段。

如果 judge 任务在 `_rollouts/` 中没有记录的分数，它会从报告中排除（并打印控制台警告）。这样能让 mock 模式严格保持离线。

记录在使用前也会检查是否过期。在不同 SKILL.md 正文下记录的处理条目、fixture `prompt` 已改变的条目，以及早于来源追踪的条目，都会被丢弃，并给出包含文件和数量的警告。如果剩余可评分任务少于 `MIN_TASKS`，运行会报告 `coverage: "insufficient"` 而不是结论，因此编辑后的技能不会继承之前的分数。

:::note `oma skill optimize --mock`
优化器会为候选 SKILL.md 正文评分。由于记录只对创建它的正文有效，候选正文没有匹配的 rollout，报告会显示未覆盖。使用 `--live` 为候选评分。
:::

适合 CI。设置 `OMA_SKILLEVAL_MOCK=1` 强制使用此模式。

```bash
oma skill eval --skill oma-scholar
```

### --live

通过 `oma agent spawn --read-only` 生成真实智能体分支。两个分支都在临时工作区中运行，防止修改项目文件。

调度前，命令会打印成本预览，其中列出任务数、分支调度数、judge 调度数和解析出的供应商。使用 `y` 确认，或使用 `--yes` 跳过确认。

以下控制项对 CI 和覆盖率调查有帮助：

| 选项 | 作用 |
| --- | --- |
| `--task-dir <path>` | 从 `.agents/eval/<skill>` 之外的目录评估 fixture。 |
| `--max-tasks <n>` | 为有界实时运行限制 fixture 数量。 |
| `--neg-transfer` | 抽样同领域邻居以查找负迁移，默认关闭。 |
| `--require-coverage` | 可评分的成对任务少于五个时以非零状态退出。 |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### 技能隔离（保持基线诚实） {#skill-isolation-keeping-the-baseline-honest}

只有当**基线分支在没有目标技能的情况下运行**时，`utilityLift` 才有意义。问题在于：被调度的智能体会自动加载其运行时安装的所有技能，因此一个朴素的基线仍会加载本应被测量为“不提供”的技能，导致比较被污染（基线约等于处理组，提升约等于 0）。

为防止这种情况，`--live` 会在隔离的临时工作区中运行**两个分支**，其技能目录包含除目标技能外的所有已安装技能。处理分支只通过注入的 `SKILL.md` 重新加入目标技能（该文件加在提示开头）。因此注入是唯一受控变量：基线 = 没有技能，处理组 = 候选 `SKILL.md`。

这是因为大多数供应商会相对于工作目录发现技能（例如 `<cwd>/.claude/skills`、`<cwd>/.codex/skills`），干净的工作目录确实可以隐藏该技能。报告通过 `isolation` 字段说明隔离保持得多好：

| 状态 | 含义 |
|---|---|
| `enforced` | 相对于 cwd 的供应商，目标技能不在 HOME 路径中，完全隔离。 |
| `best-effort` | 相对于 cwd 的供应商，但 HOME 中也有技能副本（或供应商未知）；项目副本被隐藏，但 HOME 副本仍可能泄漏。标记为低置信度。 |
| `unavailable` | 基于 HOME 的供应商（例如 **antigravity**，它读取 `~/.gemini/antigravity-cli/skills`）；干净的 cwd 无法隐藏它。打印警告，结果标记为低置信度。 |
| n/a | mock 模式，不进行实时调度。 |

隔离不是 `enforced` 时，会打印一行警告，结果应视为低置信度。为了得到干净信号，请使用相对于 cwd 且可隔离的供应商（claude、codex、qwen），不要使用基于 HOME 的供应商。评估供应商遵循 `.agents/oma-config.yaml` 中的 `model_preset`，因此请选择默认供应商相对于 cwd 的预设。

### --live --record

运行实时分支，并将捕获的输出（包括 judge 检查器任务的判定）写入 `_rollouts/<hash>.json`。文件名是任务 ID 集合的确定性 SHA-256 哈希，不使用日期或随机值。

使用此模式在自己的机器上准备 `--mock` 运行所需的数据，让重复运行保持离线。

每个条目都携带来源信息，以便之后的重放判断它是否仍适用：

| 字段 | 记录于 | 比较对象 |
|---|---|---|
| `skillBodyHash` | 仅 `treatment` | 正在评估的 SKILL.md 正文 |
| `promptHash` | 两个分支 | fixture 当前的 `prompt` |

基线分支不提供技能，因此编辑 SKILL.md 不会使其失效，只有处理分支需要重新记录。

:::caution `_rollouts/` 仅限本地使用，请勿提交
记录只对创建它时的确切 SKILL.md 正文重放。编辑技能后，处理记录会在下一次 `--mock` 运行中被丢弃，并为所有拉取该仓库的人产生警告。该目录已加入 gitignore，请在本地记录。
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

成功的实时运行后，报告包含基线和处理组计数、`utilityLift`、`coverage: "ok"`、隔离状态以及 pass/warn/fail 决策。之后的 mock 运行只会复用任务提示和处理技能正文仍然匹配的记录。

---

## 最小可用 fixture 集

要得出结论，需要五个 fixture（`MIN_TASKS = 5`）。下面是虚构 `oma-scholar` 技能的最小集合：

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

至少再重复创建三个任务。然后运行：

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```


---

## 阅读报告

**文本输出：**

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

**JSON 输出**（使用 `--json`）：

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

只有当 `coverage === "ok"` 且 `decision === "pass"` 时，`ok` 才为 `true`。`isolation` 字段报告基线分支是否确实在没有目标技能的情况下运行（请参阅[技能隔离](#skill-isolation-keeping-the-baseline-honest)）；在 `--mock` 模式下，`isolation` 为 `"n/a"`。


---

## CI 集成

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

退出码：
- `0`：通过或警告
- `1`：失败，或使用 `--require-coverage` 时覆盖率不足

---

## 选择实时或 mock

对 judge 检查器使用 `--live`，测量开放式任务上的实际效用。使用 `--mock` 离线重放之前记录的 judge 判定，或运行确定性的 `assert`/`regex` 契约检查。

mock 的确定性来自于：在 `--live --record` 期间将 judge 的二元判定（PASS/FAIL）记录到 rollout 条目中，然后在后续 `--mock` 运行中重放已记录的分数，不会再次调用 LLM。

**数据外流：**`--live` 期间，judge 会将候选分支输出调度给配置的供应商评分。每次实时运行开始时都会打印一次性警告。

如果 mock 运行报告覆盖率不足，请检查警告中被丢弃或缺失的 `_rollouts` 条目，修复 fixture 或技能后再运行实时记录。如果隔离状态为 `best-effort` 或 `unavailable`，在将提升视为强信号前，请选择相对于 cwd 的供应商，例如 Claude、Codex 或 Qwen。

---

## 随技能发布评估任务

技能可以通过将 fixture 放在 `.agents/eval/<skill>/` 下，来包含一组评估任务。这些是技能目录之外的用户编写文件，因此会在 `oma update` 后保留。使用 `oma-skill-creation` 创建新技能时，加入匹配的 `eval/` fixture 集，为未来作者提供验证技能效果的方法。请参阅 `.agents/skills/oma-skill-creation/SKILL.md` 了解技能创作流程。
