---
title: 安装
description: 前置条件、安装选项与首次运行设置。
---

# 安装

## 前置条件

- Google Antigravity (2026+)
- Bun
- uv

## 选项 1：交互式安装

```bash
bunx oh-my-ag
```

将技能和工作流安装到当前项目的 `.agent/` 目录中。

## 选项 2：全局安装

```bash
bun install --global oh-my-ag
```

如果您经常使用编排器命令，建议采用此方式。

## 选项 3：集成到现有项目

### CLI 方式

```bash
bunx oh-my-ag
bunx oh-my-ag doctor
```

### 手动复制方式

```bash
cp -r oh-my-ag/.agent/skills /path/to/project/.agent/
cp -r oh-my-ag/.agent/workflows /path/to/project/.agent/
cp -r oh-my-ag/.agent/config /path/to/project/.agent/
```

## 初始设置命令

```text
/setup
```

创建 `.agent/config/user-preferences.yaml`。

## 必需的 CLI 供应商

至少安装并认证一个：

- Gemini
- Claude
- Codex
- Qwen
