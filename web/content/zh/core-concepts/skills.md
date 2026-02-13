---
title: 技能
description: 渐进式披露与 Token 优化的技能架构。
---

# 技能

## 渐进式披露

技能根据请求意图自动选择。通常无需手动选择技能。

## 双层设计

每个技能采用 **Token 优化的双层设计**：

| 层级 | 内容 | 大小 |
|------|------|------|
| `SKILL.md` | 身份标识、路由条件、核心规则 | 约 40 行（约 800B） |
| `resources/` | 执行协议、示例、检查清单、手册、代码片段、技术栈 | 按需加载 |

这在初始技能加载时实现了 **约 75% 的 Token 节省**（每个技能从 3-7KB 降至约 800B）。

## 共享资源层（`_shared/`）

跨所有技能去重的公共资源：

| 资源 | 用途 |
|------|------|
| `reasoning-templates.md` | 用于多步推理的结构化填空模板 |
| `clarification-protocol.md` | 何时询问与何时假设、歧义等级 |
| `context-budget.md` | 按模型层级的 Token 高效文件读取策略 |
| `context-loading.md` | 任务类型到资源的映射，用于编排器提示构建 |
| `skill-routing.md` | 关键词到技能的映射与并行执行规则 |
| `difficulty-guide.md` | 简单/中等/复杂评估与协议分支 |
| `lessons-learned.md` | 跨会话积累的领域经验教训 |
| `verify.sh` | 代理完成后运行的自动化验证脚本 |
| `api-contracts/` | PM 创建契约，backend 实现，frontend/mobile 消费 |
| `serena-memory-protocol.md` | CLI 模式下的记忆读写协议 |
| `common-checklist.md` | 通用代码质量检查 |

## 技能专属资源

每个技能提供领域特定的资源：

| 资源 | 用途 |
|------|------|
| `execution-protocol.md` | 四步思维链工作流（分析 → 规划 → 实现 → 验证） |
| `examples.md` | 2-3 个少样本输入/输出示例 |
| `checklist.md` | 领域特定的自验证检查清单 |
| `error-playbook.md` | 带有"三振出局"升级规则的故障恢复手册 |
| `tech-stack.md` | 详细的技术规格说明 |
| `snippets.md` | 可直接复制粘贴的代码模式 |

## 为何如此重要

这使初始上下文保持精简，同时在需要时仍支持深度执行。
