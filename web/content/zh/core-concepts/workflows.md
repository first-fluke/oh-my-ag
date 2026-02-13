---
title: 工作流
description: 显式斜杠命令工作流及其使用场景。
---

# 工作流

## 工作流命令

- `/coordinate`
- `/orchestrate`
- `/plan`
- `/review`
- `/debug`

## 技能与工作流的区别

- 技能：根据请求意图自动激活
- 工作流：由用户触发的显式多步骤流水线

## 典型的多代理执行序列

1. `/plan` 进行任务拆解
2. `/coordinate` 进行分阶段执行
3. `agent:spawn` 启动并行子代理
4. `/review` 进行 QA 关卡审查
