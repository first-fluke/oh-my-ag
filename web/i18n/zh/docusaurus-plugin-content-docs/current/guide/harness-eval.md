---
title: "Harness 评估"
sidebar_label: Harness 评估
description: "使用成对、隔离的仓库任务和确定性产物检查，评估完整的 OMA harness 覆盖层。"
---

# Harness 评估

`oma harness eval` 用于衡量候选 OMA harness 是否能在不改变目标智能体模型的情况下提升它的表现。它采用 [AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses](https://arxiv.org/abs/2608.12307) 中的测试时评估模式：固定目标模型，改变 harness，并在同一组任务上比较结果。

该命令评估的单元比 `oma skill eval` 更大：

| 命令 | 处理对象 | 评分目标 |
|:--------|:----------|:-------------|
| `oma skill eval` | 一个 `SKILL.md` 正文 | 智能体输出 |
| `oma harness eval` | 范围限定的 `.agents/` 覆盖层 | 仓库工作区中产生的文件和输出 |

用技能评估回答“这个技能有帮助吗？”，用 harness 评估回答“这组技能、工作流、规则和智能体指令，能否让固定智能体更可靠地完成仓库任务？”

## 评估模型

每个任务都会作为成对实验运行：

1. OMA 将任务 fixture 复制到新的基线工作区。
2. OMA 将当前的 `agents`、`config`、`rules`、`skills` 和 `workflows` 定义复制到该工作区，并投影为所选供应商格式。
3. OMA 在第二个新的工作区中重复设置，然后在那里应用候选覆盖层。
4. 两个分支使用相同的主智能体、供应商路由、提示、写权限和超时。
5. 确定性检查会检查生成的工作区以及可选的智能体输出。

真实项目永远不会作为任一分支的工作目录。临时分支工作区会在评分后删除；所选供应商自己的进程沙箱仍是访问该工作目录以外内容的权威边界。

## 候选目录布局

候选路径是包含部分 `.agents/` 树的目录：

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

只接受 `.agents/agents`、`.agents/rules`、`.agents/skills` 和 `.agents/workflows` 下的文件。钩子、评估 fixture、状态、结果、配置文件、符号链接和供应商智能体变体都会被拒绝。受保护的智能体 frontmatter 字段，例如 `model`、`tools`、`effort` 和执行限制，必须与基线一致。若运行中的智能体在评分前修改受保护的 `.agents/` 定义，该分支也会失败。

## 套件格式

套件由一个 YAML 文件和每个任务一个 fixture 目录组成：

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

任务 ID 必须唯一。fixture 路径和检查路径必须保持在项目与任务工作区内。fixture 不能包含符号链接，也不能包含 `.agents`、`.codex`、`.claude`、供应商技能目录或根目录智能体指令文件等 harness 控制面。这样可以防止任务数据遮蔽两个分支所使用的受控 harness。

像 `node_modules` 和 `.venv` 这样的生成依赖目录不会从基线 harness 复制。将确定性的辅助源代码和依赖清单提交到技能中；检查需要运行时依赖时，在任务 fixture 中提供它们。

### 检查类型

| 类型 | 字段 | 通过条件 |
|:-----|:-------|:---------------|
| `file_exists` | `path` | 分支完成后路径存在。 |
| `file_not_exists` | `path` | 路径不存在。 |
| `file_contains` | `path`、`value` | 文件存在且包含该值。 |
| `file_not_contains` | `path`、`value` | 文件存在且不包含该值。 |
| `output_contains` | `value` | 捕获的智能体输出包含该值。 |
| `output_not_contains` | `value` | 捕获的智能体输出不包含该值。 |

产物检查有意保持确定性。首个版本不会运行可变的包脚本作为判定器，因为被评估的智能体可能修改这些脚本或其测试，从而使评估器失效。

## 运行并记录

实时模式会为每个任务发起两次调度，打印成本预览，并要求确认：

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --live --record
```

成功运行后，报告包含成对的基线/候选评分、提升值、回归计数以及 `pass` 或 `insufficient` 等决策。如果修改了套件、基线定义、候选覆盖层、提示、fixture 或检查，请记录新的实时运行；旧的 `_runs` 文件会因哈希不匹配而被拒绝。

使用 `--yes` 进行非交互式执行，使用 `--timeout-minutes` 设置两个分支相同的墙钟限制。只有在所选供应商能相对于项目工作区发现 harness 文件时，才可以实时执行。OMA 拒绝基于 HOME 的发现，因为这样基线可能看到全局安装的候选内容。

`--record` 会在套件旁的 `_runs/` 下写入按哈希寻址的 JSON 记录。该记录将结果绑定到三个输入：

- 套件、提示、检查和 fixture 内容；
- 当前基线 harness 定义；
- 候选覆盖层内容。

默认使用 mock 模式，不调用模型。只有三个哈希仍然全部匹配时，它才会重放记录：

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --mock --require-coverage
```

## 指标和决策关卡

只有每项检查都通过时，任务才通过。评分是成对任务的加权平均值：

```text
lift = candidateScore - baselineScore
```

OMA 还会报告：

- 已修正任务：基线失败而候选通过；
- 已回归任务：基线通过而候选失败；
- 覆盖率：至少需要五个成对且可评分的任务。

候选在提升值至少为 5 个百分点且没有回归时通过。任何回归都会使候选失败。非负但低于 5 个百分点的提升会发出警告，成对任务少于五个会产生 `insufficient` 决策。在 CI 中添加 `--require-coverage`，让覆盖不足以非零状态退出。如果某个分支缺失、记录哈希过期或确定性检查未完成，评分不构成证据。

## 当前边界

这是评估基础设施，不是自动 harness 优化器。构建器可以在外部生成候选覆盖层，再用此命令作为验收关卡。单独的隐藏最终测试套件、重复的随机试验、受信任的外部测试运行器、token 记账、为嵌套子智能体调用强制固定模型，以及自动化的 `harness opt` 循环，都不属于当前命令。在嵌套调用固定功能存在前，计划测量一个固定模型的套件应避免会生成其他已配置智能体角色的候选工作流。
