# oh-my-ag: Antigravity 多代理编排器

[English](../README.md) | [한국어](./README.ko.md) | [Português](./README.pt.md) | [日本語](./README.ja.md) | [Français](./README.fr.md) | [Español](./README.es.md) | [Nederlands](./README.nl.md) | [Polski](./README.pl.md) | [Українська](./README.uk.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

终极多代理框架，适用于 Google Antigravity 及更多场景。

通过 **Serena Memory** 编排 6 个专业领域代理（PM、Frontend、Backend、Mobile、QA、Debug）。支持并行 CLI 执行、实时可观测性仪表盘，以及零配置渐进式技能加载。开箱即用的代理编程解决方案。

## 目录

- [架构](#架构)
- [这是什么？](#这是什么)
- [快速开始](#快速开始)
- [文档](#文档)
- [赞助商](#赞助商)
- [许可证](#许可证)

## 架构

```mermaid
flowchart TD
    subgraph Workflows["工作流"]
        direction TB
        W1["/coordinate"]
        W2["/orchestrate"]
        W3["/plan"]
        W4["/review"]
        W5["/debug"]
    end

    subgraph Orchestration["编排"]
        direction TB
        PM[pm-agent]
        WF[workflow-guide]
        ORC[orchestrator]
    end

    subgraph Domain["领域代理"]
        direction TB
        FE[frontend-agent]
        BE[backend-agent]
        MB[mobile-agent]
    end

    subgraph Quality["质量"]
        direction TB
        QA[qa-agent]
        DBG[debug-agent]
    end

    Workflows --> Orchestration
    Orchestration --> Domain
    Domain --> Quality
    Quality --> CMT([commit])
```

## 这是什么？

一套 **Antigravity 技能**集合，支持协作式多代理开发。工作被分配给各专业代理：

| 代理 | 专业领域 | 触发条件 |
|------|---------|---------|
| **Workflow Guide** | 协调复杂的多代理项目 | "multi-domain", "complex project" |
| **PM Agent** | 需求分析、任务分解、架构设计 | "plan", "break down", "what should we build" |
| **Frontend Agent** | React/Next.js、TypeScript、Tailwind CSS | "UI", "component", "styling" |
| **Backend Agent** | FastAPI、PostgreSQL、JWT 认证 | "API", "database", "authentication" |
| **Mobile Agent** | Flutter 跨平台开发 | "mobile app", "iOS/Android" |
| **QA Agent** | OWASP Top 10 安全、性能、可访问性 | "review security", "audit", "check performance" |
| **Debug Agent** | Bug 诊断、根因分析、回归测试 | "bug", "error", "crash" |
| **Orchestrator** | 基于 CLI 的并行代理执行，使用 Serena Memory | "spawn agent", "parallel execution" |
| **Commit** | 遵循项目特定规则的 Conventional Commits | "commit", "save changes" |

## 快速开始

### 前置条件

- **Google Antigravity**（2026+）
- **Bun**（用于 CLI 和仪表盘）
- **uv**（用于 Serena 配置）

### 选项 1：交互式 CLI（推荐）

```bash
# Install bun if you don't have it:
# curl -fsSL https://bun.sh/install | bash

# Install uv if you don't have it:
# curl -LsSf https://astral.sh/uv/install.sh | sh

bunx oh-my-ag
```

选择你的项目类型，技能将安装到 `.agent/skills/`。

| 预设 | 技能 |
|------|------|
| ✨ 全部 | 所有技能 |
| 🌐 全栈 | frontend, backend, pm, qa, debug, commit |
| 🎨 前端 | frontend, pm, qa, debug, commit |
| ⚙️ 后端 | backend, pm, qa, debug, commit |
| 📱 移动端 | mobile, pm, qa, debug, commit |

### 选项 2：全局安装（用于编排器）

若要全局使用核心工具或运行 SubAgent Orchestrator：

```bash
bun install --global oh-my-ag
```

你还需要至少安装一个 CLI 工具：

| CLI | 安装 | 认证 |
|-----|------|------|
| Gemini | `bun install --global @google/gemini-cli` | `gemini auth` |
| Claude | `bun install --global @anthropic-ai/claude-code` | `claude auth` |
| Codex | `bun install --global @openai/codex` | `codex auth` |
| Qwen | `bun install --global @qwen-code/qwen` | `qwen auth` |

### 选项 3：集成到现有项目

**推荐（CLI）：**

在项目根目录运行以下命令，自动安装/更新技能和工作流：

```bash
bunx oh-my-ag
```

> **提示：** 安装后运行 `bunx oh-my-ag doctor` 可验证所有配置是否正确（包括全局工作流）。



### 2. 对话

**显式协调**（用户触发的工作流）：

```
/coordinate
→ Step-by-step: PM planning → agent spawning → QA review
```

**复杂项目**（workflow-guide 协调）：

```
"Build a TODO app with user authentication"
→ workflow-guide → PM Agent plans → agents spawned in Agent Manager
```

**简单任务**（单个代理自动激活）：

```
"Create a login form with Tailwind CSS and form validation"
→ frontend-agent activates
```

**提交变更**（conventional commits）：

```
/commit
→ Analyze changes, suggest commit type/scope, create commit with Co-Author
```

### 3. 使用仪表盘监控

有关仪表盘设置和使用详情，请参阅 [`web/content/en/guide/usage.md`](./web/content/en/guide/usage.md#real-time-dashboards)。

## 文档

详细文档请访问 [网页指南](./web/content/en/guide/usage.md)：

- [使用指南 (EN)](./web/content/en/guide/usage.md) · [KO](./web/content/ko/guide/usage.md)
- [技能架构 (EN)](./web/content/en/core-concepts/skills.md) · [KO](./web/content/ko/core-concepts/skills.md)
- [并行执行 (EN)](./web/content/en/core-concepts/parallel-execution.md) · [KO](./web/content/ko/core-concepts/parallel-execution.md)
- [仪表盘监控 (EN)](./web/content/en/guide/dashboard-monitoring.md) · [KO](./web/content/ko/guide/dashboard-monitoring.md)
- [CLI 命令 (EN)](./web/content/en/cli-interfaces/commands.md) · [KO](./web/content/ko/cli-interfaces/commands.md)
- [中央注册中心 (EN)](./web/content/en/guide/central-registry.md) · [KO](./web/content/ko/guide/central-registry.md)

## 赞助商

本项目的持续维护得益于慷慨赞助商的支持。

> **喜欢这个项目吗？** 给它一颗星！
>
> ```bash
> gh api --method PUT /user/starred/first-fluke/oh-my-ag
> ```
>
> **刚接触全栈开发？** 试试我们优化的入门模板：
>
> ```bash
> git clone https://github.com/first-fluke/fullstack-starter
> ```
>
> 已预配置这些技能，可即时进行多代理协作。

<a href="https://github.com/sponsors/first-fluke">
  <img src="https://img.shields.io/badge/Sponsor-♥-ea4aaa?style=for-the-badge" alt="Sponsor" />
</a>
<a href="https://buymeacoffee.com/firstfluke">
  <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-FFDD00?style=for-the-badge" alt="Buy Me a Coffee" />
</a>

### 🚀 冠军

<!-- Champion tier ($100/mo) logos here -->

### 🛸 助推者

<!-- Booster tier ($30/mo) logos here -->

### ☕ 贡献者

<!-- Contributor tier ($10/mo) names here -->

[成为赞助商 →](https://github.com/sponsors/first-fluke)

查看 [SPONSORS.md](./SPONSORS.md) 获取完整赞助者列表。

## Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=first-fluke/oh-my-ag&type=date&legend=bottom-right)](https://www.star-history.com/#first-fluke/oh-my-ag&type=date&legend=bottom-right)

## 许可证

MIT

---
**为 Google Antigravity 2026 构建** | **集成指南：** [EN](./web/content/en/guide/integration.md) · [KO](./web/content/ko/guide/integration.md)
