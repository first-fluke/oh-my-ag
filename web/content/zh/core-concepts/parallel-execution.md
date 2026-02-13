---
title: 并行执行
description: 用于同时运行多个代理的 CLI 编排模式。
---

# 并行执行

## 基本模式

```bash
oh-my-ag agent:spawn backend "Implement auth API" session-01 &
oh-my-ag agent:spawn frontend "Create login form" session-01 &
wait
```

## 工作区感知模式

```bash
oh-my-ag agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oh-my-ag agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## 监控模式

```bash
bunx oh-my-ag dashboard:web
# open http://localhost:9847
```

## 多 CLI 配置

在 `.agent/config/user-preferences.yaml` 中为不同代理类型配置不同的 CLI：

```yaml
# 响应语言
language: ko  # ko, en, ja, zh, ...

# 默认 CLI（单任务）
default_cli: gemini

# 每个代理的 CLI 映射（多 CLI 模式）
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

运行 `/setup` 可进行交互式配置。

## CLI 供应商解析优先级

1. `--vendor` 命令行参数
2. user-preferences.yaml 中的 `agent_cli_mapping`
3. user-preferences.yaml 中的 `default_cli`
4. cli-config.yaml 中的 `active_vendor`（旧版）
5. 硬编码兜底值：`gemini`
