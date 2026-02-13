---
title: 项目结构
description: 拆分 CLI 和 Web 文档工作区后的更新版仓库目录树。
---

# 项目结构

当前 monorepo 布局（`cli` + `web` 工作区）的更新版目录树。

## 顶层目录树

```text
.
├── .agent/
│   ├── config/
│   │   └── user-preferences.yaml
│   ├── workflows/
│   │   ├── coordinate.md
│   │   ├── orchestrate.md
│   │   ├── plan.md
│   │   ├── review.md
│   │   ├── debug.md
│   │   ├── setup.md
│   │   └── tools.md
│   └── skills/
│       ├── _shared/
│       ├── workflow-guide/
│       ├── pm-agent/
│       ├── frontend-agent/
│       ├── backend-agent/
│       ├── mobile-agent/
│       ├── qa-agent/
│       ├── debug-agent/
│       ├── orchestrator/
│       └── commit/
├── .github/
│   └── workflows/
│       ├── release-please.yml
│       └── docs-deploy.yml
├── .serena/
│   └── memories/
├── cli/
│   ├── bin/
│   │   └── cli.js
│   ├── package.json
│   ├── cli.ts
│   ├── commands/
│   ├── lib/
│   ├── types/
│   ├── __tests__/
│   ├── dashboard.ts
│   ├── terminal-dashboard.ts
│   └── generate-manifest.ts
├── web/
│   ├── content/
│   │   ├── en/
│   │   │   ├── getting-started/
│   │   │   ├── core-concepts/
│   │   │   ├── guide/
│   │   │   └── cli-interfaces/
│   │   └── ko/
│   │       ├── getting-started/
│   │       ├── core-concepts/
│   │       ├── guide/
│   │       └── cli-interfaces/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── next.config.ts
├── docs/
│   ├── consumer-templates/
│   └── demo/
├── package.json
├── bun.lock
├── README.md
└── README.ko.md
```

## 重要说明

- CLI 源码已从 `src/` 迁移至 `cli/`。
- 文档页面现维护在 `web/content/{lang}/{group}/*.md` 下。
- 根目录的 `docs/` 现仅用于存放面向使用者的模板和演示。
