---
title: コマンド
description: cli/cli.ts の完全なコマンド一覧。
---

# コマンド

以下のコマンド一覧は、`cli/cli.ts` の現在の実装を反映しています。

## コアコマンド

```bash
oh-my-ag                         # インタラクティブインストーラー
oh-my-ag dashboard               # ターミナルダッシュボード
oh-my-ag dashboard:web           # Web ダッシュボード (:9847)
oh-my-ag usage                   # 使用量クォータ
oh-my-ag update                  # レジストリからスキルを更新
oh-my-ag doctor                  # 環境/スキル診断
oh-my-ag stats                   # 生産性メトリクス
oh-my-ag retro                   # 振り返りレポート
oh-my-ag cleanup                 # 孤立リソースのクリーンアップ
oh-my-ag bridge [url]            # MCP stdio -> streamable HTTP
```

## エージェントコマンド

```bash
oh-my-ag agent:spawn <agent-id> <prompt> <session-id>
oh-my-ag agent:status <session-id> [agent-ids...]
```

## メモリと検証

```bash
oh-my-ag memory:init
oh-my-ag verify <agent-type>
```
