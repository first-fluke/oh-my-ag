---
title: 集成到现有项目
description: 将 oh-my-ag 技能添加到现有 Antigravity 项目的安全且无损的集成工作流。
---

# 集成到现有项目

本指南替代旧版根目录 `AGENT_GUIDE.md` 工作流，并反映当前的工作区结构（`cli` + `web`）和 CLI 行为。

## 目标

将 `oh-my-ag` 技能添加到现有项目中，且不覆盖当前资源。

## 推荐方式（CLI）

在目标项目根目录运行：

```bash
bunx oh-my-ag
```

执行内容：

- 安装或更新 `.agent/skills/*`
- 安装共享资源到 `.agent/skills/_shared`
- 安装 `.agent/workflows/*`
- 安装 `.agent/config/user-preferences.yaml`
- 可选安装全局工作流到 `~/.gemini/antigravity/global_workflows`

## 安全的手动方式

当您需要完全控制每个复制目录时使用此方式。

```bash
cd /path/to/your-project

mkdir -p .agent/skills .agent/workflows .agent/config

# 仅复制缺失的技能目录（示例）
for skill in workflow-guide pm-agent frontend-agent backend-agent mobile-agent qa-agent debug-agent orchestrator commit; do
  if [ ! -d ".agent/skills/$skill" ]; then
    cp -r /path/to/oh-my-ag/.agent/skills/$skill .agent/skills/$skill
  fi
done

# 如果缺失则复制共享资源
[ -d .agent/skills/_shared ] || cp -r /path/to/oh-my-ag/.agent/skills/_shared .agent/skills/_shared

# 如果缺失则复制工作流
for wf in coordinate.md orchestrate.md plan.md review.md debug.md setup.md tools.md; do
  [ -f ".agent/workflows/$wf" ] || cp /path/to/oh-my-ag/.agent/workflows/$wf .agent/workflows/$wf
done

# 仅在缺失时复制默认用户偏好设置
[ -f .agent/config/user-preferences.yaml ] || cp /path/to/oh-my-ag/.agent/config/user-preferences.yaml .agent/config/user-preferences.yaml
```

## 验证检查清单

```bash
# 9 个可安装技能（不含 _shared）
find .agent/skills -mindepth 1 -maxdepth 1 -type d ! -name '_shared' | wc -l

# 共享资源
[ -d .agent/skills/_shared ] && echo ok

# 7 个工作流
find .agent/workflows -maxdepth 1 -name '*.md' | wc -l

# 基本命令健康检查
bunx oh-my-ag doctor
```

## 可选仪表盘

仪表盘为可选功能，使用已安装的 CLI：

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Web 仪表盘默认 URL：`http://localhost:9847`

## 回滚策略

集成前，在您的项目中创建一个检查点提交：

```bash
git add -A
git commit -m "chore: checkpoint before oh-my-ag integration"
```

如需撤销，按照您团队的常规流程回退该提交即可。

## 多 CLI 符号链接支持

当您运行 `bunx oh-my-ag` 时，选择技能后会看到此提示：

```text
Also develop with other CLI tools?
  ○ Claude Code (.claude/skills/)
  ○ OpenCode, Amp, Codex (.agents/skills/)
  ○ GitHub Copilot (.github/skills/)
```

选择您在 Antigravity 之外使用的其他 CLI 工具。安装器将：

1. 将技能安装到 `.agent/skills/`（Antigravity 的原生位置）
2. 从每个选定 CLI 的技能目录创建到 `.agent/skills/` 的符号链接

这确保了单一真实来源，同时允许技能在多个 CLI 工具间共用。

### 符号链接结构

```
.agent/skills/frontend-agent/      ← 源（唯一真实来源）
.claude/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/
.agents/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (OpenCode, Amp, Codex)
.github/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (GitHub Copilot)
```

安装器会跳过已存在的符号链接，如果目标位置存在真实目录则发出警告。

## 注意事项

- 除非您打算替换自定义技能，否则请勿覆盖现有的 `.agent/skills/*` 文件夹。
- 将项目特定的策略文件（`.agent/config/*`）保留在您的仓库管理下。
- 如需了解多代理编排模式，请继续阅读 [`使用指南`](./usage.md)。
