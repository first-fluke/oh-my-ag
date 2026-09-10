---
title: "技能优化"
sidebar_label: 技能优化
description: "使用 oma skill optimize，通过确定性的训练、验证和运行器拥有的保留集关卡，持续、以证据为依据地演进技能。"
---

# 技能优化

`oma skill optimize` 会根据 `oma skill eval` 产生的 `utilityLift`，演进技能的 `SKILL.md` 以最大化测得的提升。它将原始 rollout 证据、持久化的范围知识和可执行技能分开。Wiki Maintainer 汇总可观察到的成功与失败；Proposer 使用这些知识生成有范围的添加/删除/替换编辑。候选必须提高保留集验证效用，`--apply` 还要求运行器拥有的保留集拆分有所提升。部署时不会额外在推理阶段查询 wiki，输出仍然是一个 `SKILL.md`。

研究依据：Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C., & Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## 硬性依赖：评估任务 fixture

没有评估任务 fixture 时，`oma skill optimize` 无法运行。它要求 `.agents/eval/<skill>/` 中至少有 **5 个任务 fixture**（`MIN_TASKS = 5`）。如果找到的数量不足，命令会立即报错：

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

请参阅[技能效用评估指南](/docs/guide/skill-eval)，了解 `.agents/eval/<skill>/` 目录约定、fixture 模式、检查类型，以及如何为 mock 重放准备 rollout。

---

## 工作原理

fixture 按任务 ID 排序，并确定性地拆分为 **train**、**held-out validation** 和 **runner-owned final-test** 集合。至少有五个 fixture 时，目标比例为 60/20/20，并且每个分区至少包含一个任务。final-test 任务来自这组本地 fixture；在循环中它们对 Maintainer 和 Proposer 隐藏，不会从隐藏的外部套件获取。

每个 epoch（最多 `--max-epochs` 次，默认 8 次）执行以下步骤：

1. **在 TRAIN 拆分上为当前最佳 `SKILL.md` 评分**：`oma skill eval` 返回每项任务可观察到的提示、输出和提升。
2. **Wiki Maintainer 汇总证据**：最多五个失败和三个成功会变成与证据关联的模式。范围模式和之前的关卡结果会从 OMA 的 L1/L2/L3 内存系统中召回。
3. **Proposer 生成 K 个候选编辑**（最多 `--edits-per-epoch` 个，默认 4 个）。持久化拒绝历史中已经存在的精确编辑会跳过。
4. **对每个候选编辑：**
   - 将编辑应用到 `SKILL.md` 的内存副本。
   - 验证候选（frontmatter 的 `name`/`description` 必须保留；正文必须能解析）。
   - 执行文本学习率预算：净字符变化超过 `--lr`（默认 600 字符）的编辑会丢弃。
   - 在 **held-out validation** 拆分上重新为候选评分。
5. **只有在以下条件同时满足时才接受最佳验证候选**：验证提升严格增加（`Δlift > 0`），且没有负迁移条目突破回归下限（`NEG_TRANSFER_FAIL = -0.1`）。每个提议关卡都会持久化。
6. **连续 2 个 epoch 没有接受编辑后提前停止**（`OPT_EARLY_STOP_PATIENCE = 2`）。
7. **演进后运行运行器拥有的最终测试。**循环期间 Maintainer 和 Proposer 永远看不到这些任务。最终测试失败会阻止 `--apply`，并把验证胜者记录为被拒绝知识。

优化器在循环期间绝不会编辑活动的 `SKILL.md`，始终使用内存中的候选副本。

---

## 用法

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### 标志

| 标志 | 默认值 | 说明 |
|:-----|:--------|:-----------|
| `--skill <id>` | `_all` | 要优化的技能 ID（简单名称，不能包含路径分隔符）。 |
| `--dry-run` | **yes (default)** | 提议编辑并打印 diff，不改变 `SKILL.md`；生成的证据和演进事件仍会持久化。 |
| `--apply` | 无 | 将接受的编辑应用到 `SKILL.md`，原子写入前先备份原文件。只有验证和运行器拥有的最终测试关卡通过时才运行；OMA 拥有的技能还需要 `--yes`。 |
| `--mock` | **yes (default)** | 从 `_rollouts/` 重放记录的优化器编辑和评估结论。确定性、离线。适合 CI。 |
| `--live` | 无 | 实时 LLM 优化器调度，每个 epoch 会产生真实模型调用。打印成本预览，除非使用 `--yes`，否则要求确认。 |
| `--max-epochs <n>` | `8` | 最大优化 epoch 数。 |
| `--edits-per-epoch <k>` | `4` | 每个 epoch 优化器 LLM 提议的候选编辑数。 |
| `--lr <chars>` | `600` | 文本学习率预算：每个接受的编辑允许的最大净字符变化。 |
| `--yes` | 无 | 跳过成本预览确认。只对 `--live` 有意义。 |
| `--json` | 无 | 输出 JSON，供 CI/CD 使用。 |
| `--output <format>` | `text` | 输出格式（`text` 或 `json`）。 |

---

## 最小端到端示例

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

示例输出：

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

diff 会显示优化器准备写入的内容。`SKILL.md` 保持不变，而生成的演进证据和范围关卡结果会持久化，供后续运行使用。

---

## 应用已验证的改进

确认提议的 diff 后，使用 `--apply` 重新运行：

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

只有当优化在验证集上找到严格为正的提升，且运行器拥有的最终测试候选提升大于基线提升时，`--apply` 才会写入。原始 `SKILL.md` 会在原子写入前备份。diff 始终会打印，供你检查写入内容。

---

## 实时模式

实时模式会调用真实的 Maintainer 和 Proposer，并在每个 epoch 重新运行实时评估分支。它成本较高：每项评分任务需要基线和处理组调用，judge fixture 会增加评分调用，最终测试还会为原始正文和候选正文评分。预览会根据实际拆分报告底层模型调用的上限。每次调用超时为 120 秒；Claude 评估分支会在禁用环境工具、技能、MCP 和 AgentMemory 的限制条件下运行。

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

成本预览会在任何 LLM 调用前列出底层模型调用的上限。

---

## JSON 输出

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

`ok` 仅在候选提高验证结果且运行器拥有的最终测试未失败（或候选已应用）时为 `true`。`_split` 计数显示此次运行使用的本地 fixture 分区实际数量。

---

## `oma-*` 技能的 SSOT 注意事项

ID 以 `oma-` 开头的技能由 oh-my-agent 拥有，并会被 `oma update` **覆盖**。对于这些技能，不建议使用 `--apply`，请使用默认的 `--dry-run`，审阅提议的 diff；如果改进有意义，请将变更上游到注册表。用户编写的技能可以安全使用 `--apply`。

目标技能属于 OMA 时，命令会打印警告：

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

---

## 过拟合保护

Maintainer 和 Proposer 只能看到 TRAIN rollout 证据。候选选择使用保留的 VALIDATION 拆分，运行器拥有的 TEST 拆分在演进结束前对它们不可见。验证胜者未能改善最终测试时，不会应用它，并会加入持久化拒绝历史。

---

## CI 集成

在 `--mock` 模式下，`oma skill optimize` 完全确定性且离线，不会调用 LLM。在 CI 中使用它，验证提议的技能 diff 相对于已记录 rollout 仍然显示提升：

```bash
oma skill optimize --skill oma-scholar --mock --json
```

退出码：
- `0`：优化完成（无论是否有改进）
- `1`：fixture 少于 `MIN_TASKS`，或 `--skill` 参数无效

---

## 另请参阅

- [技能效用评估](/docs/guide/skill-eval)：编写评估任务 fixture、检查类型、mock/live 模式和 `_rollouts/` 目录。
- [CLI 命令](/docs/cli-interfaces/commands)：所有技能管理命令的标志参考。
