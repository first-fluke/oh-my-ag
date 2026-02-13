---
title: 命令
description: cli/cli.ts 中的完整命令接口。
---

# 命令

以下命令接口与 `cli/cli.ts` 中的当前实现保持一致。

## 核心命令

```bash
oh-my-ag                         # 交互式安装器
oh-my-ag dashboard               # 终端仪表盘
oh-my-ag dashboard:web           # Web 仪表盘 (:9847)
oh-my-ag usage                   # 用量配额
oh-my-ag update                  # 从注册中心更新技能
oh-my-ag doctor                  # 环境/技能诊断
oh-my-ag stats                   # 生产力指标
oh-my-ag retro                   # 回顾报告
oh-my-ag cleanup                 # 清理孤立资源
oh-my-ag bridge [url]            # MCP stdio -> 可流式 HTTP
```

## 代理命令

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## 记忆与验证

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
