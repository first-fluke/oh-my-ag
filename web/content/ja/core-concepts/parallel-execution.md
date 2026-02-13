---
title: 並列実行
description: 複数のエージェントを同時に実行するための CLI オーケストレーションパターン。
---

# 並列実行

## 基本パターン

```bash
oh-my-ag agent:spawn backend "Implement auth API" session-01 &
oh-my-ag agent:spawn frontend "Create login form" session-01 &
wait
```

## ワークスペース対応パターン

```bash
oh-my-ag agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oh-my-ag agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## モニタリングパターン

```bash
bunx oh-my-ag dashboard:web
# open http://localhost:9847
```

## マルチ CLI 設定

`.agent/config/user-preferences.yaml` でエージェントタイプごとに異なる CLI を設定できます:

```yaml
# Response language
language: ko  # ko, en, ja, zh, ...

# Default CLI (single tasks)
default_cli: gemini

# Per-agent CLI mapping (multi-CLI mode)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

`/setup` を実行してインタラクティブに設定できます。

## CLI ベンダー解決の優先順位

1. `--vendor` コマンドライン引数
2. user-preferences.yaml の `agent_cli_mapping`
3. user-preferences.yaml の `default_cli`
4. cli-config.yaml の `active_vendor`（レガシー）
5. ハードコードされたフォールバック: `gemini`
