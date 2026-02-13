---
title: インストール
description: 前提条件、インストールオプション、初回セットアップ。
---

# インストール

## 前提条件

- Google Antigravity (2026+)
- Bun
- uv

## オプション 1: インタラクティブインストール

```bash
bunx oh-my-ag
```

現在のプロジェクトの `.agent/` にスキルとワークフローをインストールします。

## オプション 2: グローバルインストール

```bash
bun install --global oh-my-ag
```

オーケストレーターコマンドを頻繁に使用する場合に推奨です。

## オプション 3: 既存プロジェクトへの統合

### CLI パス

```bash
bunx oh-my-ag
bunx oh-my-ag doctor
```

### 手動コピーパス

```bash
cp -r oh-my-ag/.agent/skills /path/to/project/.agent/
cp -r oh-my-ag/.agent/workflows /path/to/project/.agent/
cp -r oh-my-ag/.agent/config /path/to/project/.agent/
```

## 初期セットアップコマンド

```text
/setup
```

`.agent/config/user-preferences.yaml` を作成します。

## 必要な CLI ベンダー

少なくとも1つをインストールして認証してください:

- Gemini
- Claude
- Codex
- Qwen
