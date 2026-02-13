---
title: "用例：单一技能"
description: 针对范围明确的单领域工作的快速路径，具有清晰的边界和快速反馈循环。
---

# 用例：单一技能

## 何时使用此路径

当输出范围较窄且主要由单个领域负责时使用：

- 一个 UI 组件
- 一个 API 端点
- 某一层的一个缺陷
- 某一模块的一次重构

如果任务需要跨领域协调（API 契约 + UI + QA），请使用 [`多代理项目`](./multi-agent-project.md)。

## 预检清单

在发出提示前，明确以下内容：

1. 精确的输出物（文件或行为）
2. 目标技术栈和版本
3. 验收标准
4. 测试预期

## 提示模板

```text
Build <specific artifact> using <stack>.
Constraints: <style/perf/security constraints>.
Acceptance criteria:
1) ...
2) ...
Add tests for: <critical cases>.
```

## 提示示例

```text
Create a login form component in React + TypeScript + Tailwind CSS.
Constraints: accessible labels, client-side validation, no external form library.
Acceptance criteria:
1) email and password validation messages
2) disabled submit while invalid
3) keyboard and screen-reader friendly
Add unit tests for valid/invalid submit paths.
```

## 预期执行流程

1. 自动选择相关技能。
2. 代理提出实现方案和假设。
3. 您确认或调整假设。
4. 代理交付代码和测试。
5. 您运行本地验证并请求小幅后续调整。

## 合并前质量关卡

- 行为符合验收标准
- 测试覆盖了正常路径和核心边界情况
- 无不相关的文件变更
- 无对共享模块的隐性破坏性变更

## 升级信号

在以下情况下切换到多代理流程：

- UI 工作需要新的 API 契约
- 一个修复引发了跨层级的级联变更
- 首次迭代后范围扩展超出了单个领域

## 完成标准

单一技能执行完成的条件：

- 目标产物已实现
- 验收标准已明确满足
- 已为变更的行为添加或更新了测试
