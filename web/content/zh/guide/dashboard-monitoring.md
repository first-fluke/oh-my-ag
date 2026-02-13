---
title: "用例：仪表盘监控"
description: 使用终端/Web 仪表盘和可操作的运维手册信号来运行编排器会话。
---

# 用例：仪表盘监控

## 启动命令

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Web 仪表盘默认 URL：`http://localhost:9847`

## 推荐的终端布局

至少使用 3 个终端：

1. 终端仪表盘（`oh-my-ag dashboard`）
2. 代理启动命令
3. 测试/构建日志

在团队协作会话中，保持 Web 仪表盘打开以实现共享可见性。

## 仪表盘监控内容

数据来源：`.serena/memories/`

主要信号：

- 会话状态（`running`、`completed`、`failed`）
- 任务看板的分配与状态变更
- 每个代理的进度回合
- 结果发布事件

更新由文件变更事件驱动；无需完整的目录轮询循环。

## 运维手册：信号 → 行动

- `No agents detected`（未检测到代理）
  - 验证代理是否使用了相同的 `session-id` 启动
  - 确认 `.serena/memories/` 正在被写入
- `Session stuck in running`（会话卡在运行状态）
  - 检查最新的 `progress-*` 文件时间戳
  - 使用更清晰的提示重启失败或阻塞的代理
- `Frequent reconnects (web)`（Web 端频繁重连）
  - 检查本地防火墙/代理
  - 重启 `dashboard:web` 并重新打开页面
- `Missing activity while agents are active`（代理活跃但缺少活动记录）
  - 验证编排器的写入是否被重定向到其他工作区

## 合并前监控检查清单

- 所有必需代理已达到完成状态
- 无未解决的高严重程度 QA 发现
- 每个代理的最新结果文件均已生成
- 在最终代理输出后执行了集成测试

## 完成标准

监控阶段完成的条件：

- 会话已达到终态（`completed` 或有意停止）
- 活动历史记录解释了最终输出的来源
- 在充分了解状态的情况下做出了发布/合并决策
