---
title: プロジェクト構造
description: CLIとWebドキュメントワークスペース分離後の更新されたディレクトリツリー。
---

# プロジェクト構造

このリポジトリの詳細なディレクトリツリー。

```text
.
├── .agent/
│   ├── config/
│   │   └── user-preferences.yaml   # 言語、タイムゾーン、CLIマッピング
│   ├── workflows/
│   │   ├── coordinate.md           # /coordinate (UI経由のマルチエージェントオーケストレーション)
│   │   ├── orchestrate.md          # /orchestrate (自動化されたCLI並列実行)
│   │   ├── plan.md                 # /plan (PMタスク分解)
│   │   ├── review.md               # /review (完全なQAパイプライン)
│   │   ├── debug.md                # /debug (構造化されたバグ修正)
│   │   ├── setup.md                # /setup (CLIとMCP設定)
│   │   └── tools.md                # /tools (MCPツール管理)
│   └── skills/
│       ├── _shared/                    # 共通リソース (スキルではない)
│       │   ├── serena-memory-protocol.md
│       │   ├── common-checklist.md
│       │   ├── skill-routing.md
│       │   ├── context-loading.md
│       │   ├── context-budget.md
│       │   ├── reasoning-templates.md
│       │   ├── clarification-protocol.md
│       │   ├── difficulty-guide.md
│       │   ├── lessons-learned.md
│       │   ├── verify.sh
│       │   └── api-contracts/
│       ├── workflow-guide/             # マルチエージェント調整
│       ├── pm-agent/                   # プロダクトマネージャー
│       ├── frontend-agent/             # React/Next.js
│       ├── backend-agent/              # FastAPI
│       ├── mobile-agent/               # Flutter
│       ├── qa-agent/                   # セキュリティとQA
│       ├── debug-agent/                # バグ修正
│       ├── orchestrator/               # CLIベースのサブエージェント起動
│       └── commit/                     # Conventional commitsスキル
│       # 各スキルには以下が含まれます:
│       #   SKILL.md              (~40行、トークン最適化)
│       #   resources/
│       #     ├── execution-protocol.md  (chain-of-thoughtステップ)
│       #     ├── examples.md            (few-shot入出力)
│       #     ├── checklist.md           (自己検証)
│       #     ├── error-playbook.md      (障害復旧)
│       #     ├── tech-stack.md          (詳細な技術仕様)
│       #     └── snippets.md            (コピー&ペーストパターン)
├── .serena/
│   └── memories/                   # ランタイム状態 (gitignored)
├── package.json
├── docs/
│   ├── USAGE.md                    # 詳細な使用ガイド（英語）
│   ├── USAGE.ko.md                 # 詳細な使用ガイド（韓国語）
│   ├── project-structure.md        # 完全な構造リファレンス（英語）
│   └── project-structure.ko.md     # 完全な構造リファレンス（韓国語）
├── README.md                       # このファイル（英語）
└── README.ko.md                    # 韓国語ガイド
```
