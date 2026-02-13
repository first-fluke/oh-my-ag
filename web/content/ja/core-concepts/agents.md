---
title: エージェント
description: エージェントの種類、ワークスペース戦略、オーケストレーションフロー。
---

# エージェント

## エージェントカテゴリ

- 計画: PM エージェント
- 実装: Frontend、Backend、Mobile
- 品質保証: QA、Debug
- 調整: workflow-guide、orchestrator

## ワークスペース戦略

ワークスペースを分離することでマージコンフリクトを削減します:

```text
./apps/api      -> backend
./apps/web      -> frontend
./apps/mobile   -> mobile
```

## エージェントマネージャーフロー

1. PM がタスク分解を定義
2. ドメインエージェントが並列に実行
3. 進捗が Serena メモリにストリーミング
4. QA がシステムレベルの整合性を検証

## Serena ランタイムファイル

- `orchestrator-session.md`
- `task-board.md`
- `progress-{agent}.md`
- `result-{agent}.md`
