---
title: 技能
description: OMA 33 个技能的两层架构完整指南，涵盖 SKILL.md 路由、按需资源、共享与条件协议、供应商执行、令牌测量和路由机制。
---

# 技能

技能是为调度角色提供领域指导的结构化知识包。它们包含执行协议、技术栈参考、代码模板、错误处理手册、质量检查清单，以及技能提供的示例，并按为节省令牌而设计的两层架构组织。

---

## 两层设计

### 第一层：SKILL.md（中位数约 2,631 个令牌，在技能路由后加载）

每个技能的根目录都有一个 `SKILL.md` 文件。技能被路由后，该文件会进入上下文窗口。注入器钩子传递的是**路径引用**，而不是文件正文，因此未路由的技能除了 `description` 外不会产生额外开销。文件包含：

- **YAML 前置元数据**，包含 `name` 和 `description`（用于路由和显示）
- **何时使用 / 何时不使用**：明确的激活条件
- **核心规则**：该领域最关键的 5 到 15 条约束
- **架构概览**：代码应如何组织
- **库列表**：已批准的依赖及其用途
- **引用**：指向第二层资源的指针（不会自动加载）

前置元数据示例：

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

`description` 字段很关键，因为技能路由系统使用其中的路由关键词将任务匹配到智能体。

### 第二层：resources/（按需加载）

`resources/` 目录包含深入的执行知识。只有满足以下条件时才会加载其中的文件：

1. 宿主或工作流已选择该技能，例如通过原生技能匹配或显式命令
2. 当前任务类型和难度确实需要特定资源

这种按需加载由上下文加载指南（`.agents/skills/_shared/core/context-loading.md`）控制，该指南把任务类型映射到每个智能体所需的资源。

---

## 文件结构示例

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

## 每种技能资源的类型

| 资源类型 | 文件名模式 | 用途 | 加载时机 |
|--------------|-----------------|-------------|-------------|
| **执行协议** | `execution-protocol.md` | 分步工作流：分析 -> 规划 -> 实现 -> 验证 | 始终（随 SKILL.md） |
| **技术栈** | `tech-stack.md` | 详细技术规范、版本和配置 | 复杂任务 |
| **错误处理手册** | `error-playbook.md` | 带有“三次失败”升级的恢复流程 | 仅在出错时 |
| **检查清单** | `checklist.md` | 领域专用的质量验证 | 验证步骤 |
| **代码片段** | `snippets.md` | 可直接复制的代码模式 | 中等或复杂任务 |
| **示例** | `examples.md` 或 `examples/` | 面向 LLM 的少样本输入输出示例 | 中等或复杂任务 |
| **变体** | `variants/` 目录 | 语言或框架专用参考。后端提供 `node`、`python` 和 `rust` 种子，移动端提供模式，并可接收生成的平台参考资料。 | 存在匹配的技术栈时 |
| **模板** | `component-template.tsx`、`screen-template.dart` | 样板文件模板 | 创建组件时 |
| **领域参考** | `orm-reference.md`、`anti-patterns.md` 等 | 特定子任务的深入领域知识 | 按任务类型 |

---

## 共享资源（_shared/）

所有智能体都共享 `.agents/skills/_shared/` 中的公共基础。这些资源分为三类：

### 核心资源（`.agents/skills/_shared/core/`）

| 资源 | 用途 | 加载时机 |
|------|------|---------|
| **`skill-routing.md`** | 将任务关键词映射到正确的智能体。包含技能与智能体映射表、复杂请求路由模式、智能体间依赖规则、升级规则和回合限制指南。 | 由编排技能和协调技能引用 |
| **`context-loading.md`** | 定义不同任务类型和难度应加载哪些资源。包含每个智能体的任务类型到资源映射表，以及条件协议的加载触发器。 | 工作流开始时（步骤 0 / 阶段 0） |
| **`prompt-structure.md`** | 定义每个任务提示必须包含的四个要素：目标、上下文、约束、完成条件。包含 PM、实现和 QA 智能体的模板，并列出反模式（例如只写目标）。 | 由 PM 智能体和所有工作流引用 |
| **`clarification-protocol.md`** | 定义不确定性级别（LOW、MEDIUM、HIGH）及其操作。包含不确定性触发器、升级模板、各类智能体的必需验证项和子智能体模式行为。 | 需求不明确时 |
| **`context-budget.md`** | 管理令牌预算。定义文件读取策略（使用 `find_symbol` 而不是 `read_file`）、各资源文件及 Simple（约 4,000 个令牌）和 Complex（约 9,000 个令牌）加载的测量成本、由 `oma skill audit` 检查的 `SKILL.md` 上限（25,000 个字符）、大文件处理方式和上下文溢出症状。 | 工作流开始时 |
| **`difficulty-guide.md`** | 定义将任务分类为 Simple、Medium 或 Complex 的标准、预期回合数、协议分支（Fast Track / Standard / Extended）和误判后的恢复方式。 | 任务开始时（步骤 0） |
| **`quality-principles.md`** | 所有智能体通用的 4 条质量原则。 | 以质量为重点的工作流（ultrawork）开始时 |
| **`vendor-detection.md`** | 检测当前运行时环境的协议（Claude Code、Codex CLI、Antigravity、Cursor、Kiro、Qwen 和 CLI 回退）。使用宿主标记和配置的供应商状态。 | 工作流开始时 |
| **`session-metrics.md`** | 澄清债务（CD）评分和会话指标追踪。定义事件类型（clarify +10、correct +25、redo +40）、阈值（CD >= 50 = RCA、CD >= 80 = 暂停）和集成点。 | 编排会话期间 |
| **`common-checklist.md`** | 复杂任务最终验证时使用的通用质量清单（除此之外还要使用智能体专用清单）。 | 复杂任务的验证步骤 |
| **`lessons-learned.md`** | 过去会话经验的存储库，由澄清债务违规和被丢弃的实验自动生成，并按领域分节。包含用于记录评估器盲点的 QA 评估经验。 | 出错后和会话结束时引用 |
| **`api-contracts/`** | 包含 API 契约模板和生成契约的目录。`template.md` 定义每个端点的格式（方法、路径、请求和响应模式、认证、错误）。 | 规划跨边界工作时 |

### 运行时资源（`.agents/skills/_shared/runtime/`）

| 资源 | 用途 |
|----------|---------|
| **`memory-protocol.md`** | CLI 子智能体的内存文件格式和操作。定义使用可配置内存工具（read、write、edit）的启动、执行中和完成协议，并包含实验追踪扩展。 |
| **`execution-protocols/claude.md`** | Claude Code 专用执行模式。供应商为 claude 时由 `oma agent spawn` 注入。 |
| **`execution-protocols/antigravity.md`** | Antigravity CLI（`agy`）执行模式。 |
| **`execution-protocols/codex.md`** | Codex CLI 专用执行模式。 |
| **`execution-protocols/commandcode.md`** | CommandCode 执行模式。 |
| **`execution-protocols/grok.md`** | Grok 执行模式。 |
| **`execution-protocols/kimi.md`** | Kimi Code 执行模式。 |
| **`execution-protocols/kiro.md`** | Kiro 执行模式。 |
| **`execution-protocols/opencode.md`** | OpenCode 扩展的执行模式。 |
| **`execution-protocols/pi.md`** | pi 扩展的执行模式。 |
| **`execution-protocols/qwen.md`** | Qwen CLI 专用执行模式。 |

供应商专用的执行协议会由 `oma agent spawn` 自动注入 CLI 子智能体。原生子智能体使用所选供应商的集成规则。

### 条件资源（`.agents/skills/_shared/conditional/`）

只有执行过程中满足特定条件时才会加载这些资源：

| 资源 | 触发条件 | 加载方 | 约略令牌数 |
|---------------------|-----------------|---------|-----------------|
| **`quality-score.md`** | 支持质量度量的工作流进入 VERIFY 或 SHIP 阶段 | 编排器（传递给 QA 智能体提示） | 约 250 |
| **`experiment-ledger.md`** | 建立 IMPL 基线后首次记录实验 | 编排器（在基线测量后内联） | 约 250 |
| **`exploration-loop.md`** | 同一个关卡因同一问题失败两次 | 编排器（启动假设智能体前内联） | 约 250 |

如果 3 个资源全部加载，预算影响约为 750 个令牌。由于是条件加载，典型会话会加载其中 1 到 2 个，相比 Simple 任务已经使用的约 4,000 个令牌，这个开销很小。

---

## 技能如何通过 skill-routing.md 路由

技能路由映射定义任务如何匹配到智能体：

### 简单路由（单一领域）

包含“使用 Tailwind CSS 构建登录表单”的提示会匹配 `UI`、`component`、`form` 和 `Tailwind` 关键词，并路由到 **oma-frontend**。

### 复杂请求路由

多领域请求遵循既定的执行顺序：

| 请求模式 | 执行顺序 |
|---------|---------|
| “创建全栈应用” | oma-pm ->（oma-backend + oma-frontend）并行 -> oma-qa |
| “创建移动应用” | oma-pm ->（oma-backend + oma-mobile）并行 -> oma-qa |
| “修复问题并审查” | oma-debug -> oma-qa |
| “设计并构建着陆页” | oma-design -> oma-frontend |
| “我有一个功能想法” | oma-brainstorm -> oma-pm -> 相关智能体 -> oma-qa |
| “自动完成所有工作” | oma-orchestration（内部：oma-pm -> 智能体 -> oma-qa） |

### 智能体间依赖规则

**可以并行运行（没有依赖）：**
- oma-backend + oma-frontend（API 契约已预先定义时）
- oma-backend + oma-mobile（API 契约已预先定义时）
- oma-frontend + oma-mobile（彼此独立时）

**必须顺序运行：**
- oma-brainstorm -> oma-pm（先设计，再规划）
- oma-pm -> 所有其他智能体（先规划）
- 实现智能体 -> oma-qa（实现后审查）
- oma-backend -> oma-frontend/oma-mobile（没有预定义 API 契约时）

**QA 始终最后运行**，除非用户只要求审查特定文件。

---

## 令牌节省计算 {#token-savings-math}

这些数字根据技能树测量得出，不是手工估算。可以随时重新计算：

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

令牌数是近似值（字节数除以 4，这是英语 Markdown 的粗略比例）。表格和代码围栏的分词表现略差，因此数值略低。如果需要精确数值，应使用目标模型的实际分词器。

### 加载层级

每个层级都是智能体根据 [`context-loading.md`](https://github.com/first-fluke/oh-my-agent/blob/main/.agents/skills/_shared/core/context-loading.md) 实际达到的状态：

| 层级 | 上下文包含内容 |
|------|----------------|
| `routed` | 只有 `SKILL.md` |
| `simple` | 加上 `execution-protocol.md` |
| `medium` | 加上任务对应的资源（该文件存在时） |
| `complex` | 加上对应资源和项目提供的技术栈参考 |
| `all` | `SKILL.md` 加上每个资源文件，表示上限，不是可选模式 |

对于后端和移动端技能，`/stack-set` 可以在 `stack/` 下生成项目专用参考资料。全新检出没有生成的 stack 目录，因此下面的 `complex` 行按照随附的 `variants/` 种子测量，这只是大小代理值，不是智能体当前会加载的文件。

### 一个 5 智能体会话（pm、backend、frontend、mobile、qa）

| 层级 | 令牌数 | 占上限比例 | 避免的令牌 |
|------|-------:|----------------:|------------:|
| `routed` | 11,497 | 15.7% | 84.3% |
| `simple` | 17,923 | 24.4% | 75.6% |
| `medium` | 19,125 | 26.1% | 73.9% |
| `complex` | 39,156 | 53.4% | 46.6% |
| `all` | 73,355 | 100% | 无 |

因此，5 个智能体执行 Simple 或 Medium 任务时，技能上下文约为 **17K 到 19K 个令牌**，而不是 73K 的上限；Complex 任务约为 **38K**。普通工作可节省约 **74% 到 76%**，任务拉取技术栈参考时则降至约 **47%**。对于 128K 上下文模型，这意味着 Simple 或 Medium 工作约有 110K 个令牌可用，Complex 工作约有 90K。

:::note 将 `all` 视为上界，而不是另一种选择
运行时不会预先加载每个资源：技能先通过 `description` 暴露，路由后读取技能正文，再按任务需要读取资源。`all` 是技能**可能**产生的成本上界，所以这些百分比写成“避免的令牌”，而不是与真实配置比较。
:::

第一层是下限，但它并不小：已安装的 33 个技能中，`SKILL.md` 约为 1,275 到 5,489 个令牌（中位数约 2,631）。这个下限限制了渐进式披露能节省的数量，5 个智能体全部路由时，仅 `routed` 层就已经达到上限的 15%。

---

## 按任务难度加载资源

难度指南把任务分为三个级别，并据此决定加载多少第二层资源：

### Simple（预期 3 到 5 个回合）

单文件修改、要求明确、重复已有模式。

加载：仅 `execution-protocol.md`。跳过分析，直接开始实现，并使用最小检查清单。

### Medium（预期 8 到 15 个回合）

修改 2 到 3 个文件，需要一些设计决策，把模式应用到新领域。

加载：`execution-protocol.md`，以及文件存在时任务对应的 Medium 资源。使用简短分析和完整验证的标准协议。

### Complex（预期 15 到 25 个回合）

修改 4 个或更多文件，需要架构决策、引入新模式，或依赖其他智能体。

加载：`execution-protocol.md`、任务对应的资源，以及可用的 `tech-stack.md` / `snippets.md` 参考。使用带检查点和执行中进度记录的扩展协议，并通过 `common-checklist.md` 完成全面验证。

---

## 上下文加载任务映射（按智能体）

上下文加载指南提供详细的任务类型到资源映射。以下是关键映射：

### 后端智能体

| 任务类型 | 所需资源 |
|-----------|-------------------|
| CRUD API 创建 | 存在时使用匹配的 `variants/{node,python,rust}/snippets.md` |
| 身份验证 | 存在时使用匹配变体的 `snippets.md` + `tech-stack.md` |
| 数据库迁移 | 存在时使用匹配变体的 `snippets.md` |
| 性能优化 | `orm-reference.md` 和技能提供的匹配示例 |
| 修改现有代码 | 项目代码智能提供程序和相关执行资源 |

### 前端智能体

| 任务类型 | 所需资源 |
|-----------|-------------------|
| 创建组件 | `snippets.md` + 项目现有组件模式 |
| 实现表单 | `snippets.md`（表单 + Zod） |
| API 集成 | `snippets.md`（TanStack Query） |
| 样式处理 | `tailwind-rules.md` |
| 页面布局 | `snippets.md`（网格） |

### 设计智能体

| 任务类型 | 所需资源 |
|-----------|-------------------|
| 创建设计系统 | `reference/typography.md` + `reference/color-and-contrast.md` + `reference/spatial-design.md` + `design-md-spec.md` |
| 设计着陆页 | `reference/component-patterns.md` + `reference/motion-design.md` + `prompt-enhancement.md` |
| 设计审计 | `checklist.md` + `anti-patterns.md` |
| 导出设计令牌 | `design-tokens.md` |
| 3D / 着色器效果 | `reference/shader-and-3d.md` + `reference/motion-design.md` |
| 无障碍审查 | `reference/accessibility.md` + `checklist.md` |

### QA 智能体

| 任务类型 | 所需资源 |
|-----------|-------------------|
| 安全审查 | `checklist.md`（安全章节） |
| 性能审查 | `checklist.md`（性能章节） |
| 无障碍审查 | `checklist.md`（无障碍章节） |
| 完整审计 | `checklist.md`（完整）+ `self-check.md` |
| 质量评分 | 条件资源 `quality-score.md` |

---

## 编排器提示组合

编排器为子智能体组合提示时，只包含与任务相关的资源：

1. 智能体 `SKILL.md` 的核心规则部分
2. `execution-protocol.md`
3. 与特定任务类型匹配的资源（来自上述映射）
4. `error-playbook.md`（始终包含，恢复是必要的）
5. 内存协议（CLI 模式）

这种定向组合避免加载不必要的资源，使子智能体有更多上下文空间处理实际工作。

---

## 澄清债务与会话指标（深入说明）

澄清债务（CD）衡量会话中需求不清造成的成本。编排器会追踪每次用户纠正并为其评分：

| 事件类型 | 分值 | 说明 |
|------------|------|-------------|
| `clarify` | +10 | 简单澄清问题（MEDIUM 不确定性下可预期） |
| `correct` | +25 | 误解意图，需要改变方向 |
| `redo` | +40 | 违反范围或章程，需要回滚并重新开始 |
| `blocked` | +0 | 智能体正确停下并提问（良好行为，不扣分） |

**修正系数：**未读取章程（+15）、违反允许列表（+20）、同一错误重复出现（x1.5）。

**阈值与执行：**
- **CD >= 50** → 必须在 `lessons-learned.md` 中添加 RCA 条目
- **CD >= 80** → 会话暂停，用户必须重新说明需求
- **`redo` >= 2** → 编排器暂停并请求明确的范围确认
- **同一智能体连续 3 个会话的 CD >= 30** → 建议审查该智能体的提示模板

会话日志保存在 `.agents/state/memories/session-metrics.md`，其中包含每个事件的行（回合、智能体、事件类型、分值、详情）和摘要部分。

---

## 评估器准确性与 QA 调优

QA 智能体通过记录判断错误来改进。与 CD（实时指标）不同，评估器准确性（EA）是回顾性指标。大多数错误会在会话结束后发现。

**EA 事件类型：**

| 事件 | 分值 | 发现时机 |
|-------|------|----------|
| `false_negative` | +30 | 下一次会话或生产环境（QA 漏掉的错误） |
| `false_positive` | +15 | 会话期间（实现智能体成功反驳 QA 发现） |
| `severity_mismatch` | +10 | 会话期间或下一次审查（严重性分级错误） |
| `missed_stub` | +20 | 运行时验证发现仅有展示的功能 |
| `good_catch` | -10 | QA 发现了不明显的问题（正向奖励信号） |

**EA 按滚动的 3 个会话计算。**阈值：
- **EA >= 30** → 建议调优：审查累计 EA 事件，查找反复出现的 QA 判断错误
- **EA >= 50** → 必须调优：更新 QA `execution-protocol.md`
- **3 次以上 `false_negative`** → 将检测模式加入 QA `checklist.md`
- **3 次以上 `good_catch`** → 将成功模式提炼到 `common-checklist.md`

达到阈值后，审查累计 EA 事件，归类错误，并相应修改 QA 检查清单或执行协议，然后在接下来的 3 个会话中验证。

---

## 复杂任务的迭代分解

复杂任务（4 个或更多文件，需要架构决策）使用按迭代执行的方式，而不是一次长时间运行：

1. **分解**为 2 到 4 个以功能为重点、可独立测试的迭代
2. **目标**是每个迭代 5 到 8 个回合
3. **迭代关卡**：每个迭代后检查：
   - 迭代交付物是否完成？
   - 检查或测试是否通过？
   - 如果耗时达到预期的 2 倍，写入检查点并告知用户
4. 关卡通过后继续下一个迭代

**示例：**“JWT 身份验证 + CRUD API + 测试”可以分解为：
- 迭代 1：用户模型和身份验证端点（注册和登录）
- 迭代 2：CRUD 端点和验证
- 迭代 3：测试和错误处理

**难度误判后的恢复：**如果任务开始时判断为 Simple，后来证明更复杂，则在执行中升级到 Medium 或 Complex 协议，并在进度中记录这一变化。

---

## 上下文重置协议

长时间运行的智能体会随着上下文填满而降低质量。编排器（而不是智能体自身）监控这一点并触发重置。

**触发条件（编排器在监控时检查）：**

| 条件 | 检测方式 | 操作 |
|------|----------|------|
| 回合预算耗尽 | 智能体已消耗预期回合数的 >= 80%，且完成度低于 50% | 重置上下文 |
| 进度停滞 | 进度文件连续 3 个或更多监控周期没有更新 | 重置上下文 |
| 输出浅薄 | 结果文件包含 stub 标记或 TODO 占位符 | 使用明确指令重新生成 |

**重置步骤：**
1. **检查点**：保存智能体当前状态（已完成项目、剩余项目、关键决策）
2. **终止**：停止当前智能体运行
3. **重新生成**：以检查点为上下文启动新的智能体
4. **恢复**：新智能体只从剩余项目继续

对于独立运行的智能体，复杂任务的迭代关卡充当安全网。如果某个迭代耗时达到预期的 2 倍，则写入进度检查点并通知用户。
