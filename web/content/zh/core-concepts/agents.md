---
title: 代理
description: 代理类型、工作区策略与编排流程。
---

# 代理

## 代理分类

- 规划类：PM agent
- 实现类：Frontend、Backend、Mobile
- 保障类：QA、Debug
- 协调类：workflow-guide、orchestrator

## 工作区策略

分离工作区可减少合并冲突：

```text
./apps/api      -> backend
./apps/web      -> frontend
./apps/mobile   -> mobile
```

## 代理管理流程

1. PM 定义任务拆解
2. 领域代理并行执行
3. 进度流写入 Serena 记忆
4. QA 验证系统级一致性

## Serena 运行时文件

- `orchestrator-session.md`
- `task-board.md`
- `progress-{agent}.md`
- `result-{agent}.md`
