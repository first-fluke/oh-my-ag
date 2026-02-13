---
title: 既存プロジェクトへの統合
description: 既存の Antigravity プロジェクトに oh-my-ag スキルを追加するための安全で非破壊的な統合ワークフロー。
---

# 既存プロジェクトへの統合

このガイドは、レガシーのルート `AGENT_GUIDE.md` ワークフローを置き換え、現在のワークスペース構成（`cli` + `web`）と CLI の動作を反映しています。

## 目的

既存のアセットを上書きせずに、既存プロジェクトに `oh-my-ag` スキルを追加します。

## 推奨パス（CLI）

対象プロジェクトのルートで以下を実行します:

```bash
bunx oh-my-ag
```

実行内容:

- `.agent/skills/*` をインストールまたは更新
- `.agent/skills/_shared` に共有リソースをインストール
- `.agent/workflows/*` をインストール
- `.agent/config/user-preferences.yaml` をインストール
- オプションで `~/.gemini/antigravity/global_workflows` にグローバルワークフローをインストール

## 安全な手動パス

コピーするディレクトリを完全に制御したい場合に使用します。

```bash
cd /path/to/your-project

mkdir -p .agent/skills .agent/workflows .agent/config

# Copy only missing skill directories (example)
for skill in workflow-guide pm-agent frontend-agent backend-agent mobile-agent qa-agent debug-agent orchestrator commit; do
  if [ ! -d ".agent/skills/$skill" ]; then
    cp -r /path/to/oh-my-ag/.agent/skills/$skill .agent/skills/$skill
  fi
done

# Copy shared resources if missing
[ -d .agent/skills/_shared ] || cp -r /path/to/oh-my-ag/.agent/skills/_shared .agent/skills/_shared

# Copy workflows if missing
for wf in coordinate.md orchestrate.md plan.md review.md debug.md setup.md tools.md; do
  [ -f ".agent/workflows/$wf" ] || cp /path/to/oh-my-ag/.agent/workflows/$wf .agent/workflows/$wf
done

# Copy default user preferences only if missing
[ -f .agent/config/user-preferences.yaml ] || cp /path/to/oh-my-ag/.agent/config/user-preferences.yaml .agent/config/user-preferences.yaml
```

## 検証チェックリスト

```bash
# 9 installable skills (excluding _shared)
find .agent/skills -mindepth 1 -maxdepth 1 -type d ! -name '_shared' | wc -l

# Shared resources
[ -d .agent/skills/_shared ] && echo ok

# 7 workflows
find .agent/workflows -maxdepth 1 -name '*.md' | wc -l

# Basic command health
bunx oh-my-ag doctor
```

## オプションのダッシュボード

ダッシュボードはオプションで、インストール済みの CLI を使用します:

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Web ダッシュボードのデフォルト URL: `http://localhost:9847`

## ロールバック戦略

統合前に、プロジェクトでチェックポイントコミットを作成してください:

```bash
git add -A
git commit -m "chore: checkpoint before oh-my-ag integration"
```

元に戻す必要がある場合は、チームの通常のプロセスでそのコミットを取り消してください。

## マルチ CLI シンボリックリンクサポート

`bunx oh-my-ag` を実行すると、スキル選択後に以下のプロンプトが表示されます:

```text
Also develop with other CLI tools?
  ○ Claude Code (.claude/skills/)
  ○ OpenCode, Amp, Codex (.agents/skills/)
  ○ GitHub Copilot (.github/skills/)
```

Antigravity と併用する追加の CLI ツールを選択してください。インストーラーは以下を行います:

1. `.agent/skills/`（Antigravity のネイティブロケーション）にスキルをインストール
2. 選択した各 CLI のスキルディレクトリから `.agent/skills/` へのシンボリックリンクを作成

これにより、単一の正式なソースを維持しつつ、複数の CLI ツールでスキルを利用できます。

### シンボリックリンク構成

```
.agent/skills/frontend-agent/      ← ソース（SSOT）
.claude/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/
.agents/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (OpenCode, Amp, Codex)
.github/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (GitHub Copilot)
```

インストーラーは既存のシンボリックリンクをスキップし、ターゲットの場所に実ディレクトリが存在する場合は警告します。

## 注意事項

- カスタマイズされたスキルを置き換える意図がない限り、既存の `.agent/skills/*` フォルダを上書きしないでください。
- プロジェクト固有のポリシーファイル（`.agent/config/*`）はリポジトリの所有下に保持してください。
- マルチエージェントオーケストレーションパターンについては、[`使用ガイド`](./usage.md) に進んでください。
