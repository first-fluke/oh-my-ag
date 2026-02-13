---
title: 多仓库设置的中央注册中心
description: 将本仓库作为版本化的中央注册中心运行，并通过基于 PR 的更新安全同步消费者项目。
---

# 多仓库设置的中央注册中心

本仓库可作为代理技能的 **中央注册中心**，使多个消费者仓库与版本化更新保持同步。

## 架构

```text
┌─────────────────────────────────────────────────────────┐
│  中央注册中心（本仓库）                                    │
│  • 使用 release-please 自动版本管理                       │
│  • 自动生成 CHANGELOG.md                                 │
│  • prompt-manifest.json（版本/文件/校验和）                │
│  • agent-skills.tar.gz 发布产物                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  消费者仓库                                               │
│  • 使用 .agent-registry.yaml 锁定版本                     │
│  • 检测到新版本 → 创建 PR（不自动合并）                      │
│  • 可复用的 Action 进行文件同步                             │
└─────────────────────────────────────────────────────────┘
```

## 注册中心维护者指南

发布通过 [release-please](https://github.com/googleapis/release-please) 自动完成：

1. 使用约定式提交（`feat:`、`fix:`、`chore:` 等）。
2. 推送到 `main` 以创建/更新 Release PR。
3. 合并 Release PR 以发布 GitHub Release 产物：
   - `CHANGELOG.md`（自动生成）
   - `prompt-manifest.json`（文件列表 + SHA256 校验和）
   - `agent-skills.tar.gz`（压缩的 `.agent/` 目录）

## 消费者项目指南

将 `docs/consumer-templates/` 中的模板复制到您的项目中：

```bash
# 配置文件
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# GitHub 工作流
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

然后在 `.agent-registry.yaml` 中锁定您需要的版本：

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

工作流角色：

- `check-registry-updates.yml`：检查新版本并创建 PR。
- `sync-agent-registry.yml`：当锁定版本变更时同步 `.agent/`。

**重要提示**：自动合并被有意禁用。所有更新均应经过人工审核。

## 使用可复用 Action

消费者仓库可直接调用同步 Action：

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
