---
title: "用例：多代理项目"
description: 复杂跨领域交付的端到端流程，包含显式的协调关卡。
---

# 用例：多代理项目

## 何时使用此路径

当功能跨越多个领域（例如 backend + frontend + QA）且并行执行有益时使用。

## 协调模型

推荐执行序列：

1. `/plan` 进行任务拆解和依赖映射
2. `/coordinate` 确定执行顺序和所有权
3. 按领域并行执行 `agent:spawn`
4. `/review` 进行 QA/安全/性能关卡审查

## 会话与工作区策略

每个功能流使用一个会话 ID：

```text
session-auth-v2
```

为每个领域分配隔离的工作区以减少合并冲突：

- backend：`./apps/api`
- frontend：`./apps/web`
- mobile：`./apps/mobile`

## 启动示例

```bash
oh-my-ag agent:spawn backend "Implement JWT auth API + refresh flow" session-auth-v2 -w ./apps/api
oh-my-ag agent:spawn frontend "Build login + refresh UX with error states" session-auth-v2 -w ./apps/web
oh-my-ag agent:spawn qa "Review auth risks, test matrix, and regression scope" session-auth-v2
```

## 契约优先原则

在并行编码之前，锁定共享契约：

- 请求/响应模式
- 错误码和错误消息
- 认证/会话生命周期假设

如果契约在执行过程中发生变更，暂停下游代理并使用更新后的契约重新发出提示。

## 合并关卡

所有关卡通过后方可合并：

1. 领域级测试通过
2. 集成点与约定的契约匹配
3. QA 高/严重级别问题已解决或明确豁免
4. 当外部可见行为变更时，更新了变更日志或发布说明

## 操作反模式

应避免：

- 所有代理共享同一工作区
- 变更契约而不通知其他代理
- 在兼容性检查前独立合并 backend/frontend

## 完成标准

多代理执行完成的条件：

- 所有领域的计划任务已完成
- 跨领域集成已验证
- QA 签核（或已记录的风险接受）已录入
