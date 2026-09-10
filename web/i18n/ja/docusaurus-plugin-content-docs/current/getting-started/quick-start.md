---
title: クイックスタート
description: 空のプロジェクトから、動作を確認した oh-my-agent のプロンプトまでを最短で進める手順です。各手順の結果と、停止した場合の復旧方法も説明します。
---

# クイックスタート

完全なリファレンスを読む前に、ハーネスが動作することを確認したい場合にこのページを使います。必要なのはプロジェクトのディレクトリと、対応する AI CLI または IDE が少なくとも 1 つあることです。インストーラーは macOS、Linux、Windows に `bun`、`uv`、Serena、CUE をセットアップできます。最初のプロンプトには選択したホストの統合が必要ですが、プロバイダーやブラウザーの統合は任意です。

## 1. プロジェクトのハーネスをインストールする

プロジェクトのディレクトリから、ブートストラップインストーラーを実行します。

```bash
curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
```

Windows PowerShell では次を実行します。

```powershell
irm https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.ps1 | iex
```

対話式のセットアップでは、応答言語、CLI ベンダー、機能プロバイダー、モデルプリセット、プロジェクトのスキルプリセット、スタックのバリアントを指定します。最初の実行ではデフォルトを使い、普段使っているベンダーを選び、リポジトリに最も近いプロジェクトプリセットを選択してください。

すでに `bun` がある場合は、インストーラーを直接実行できます。

```bash
bunx oh-my-agent@latest
```

ブートストラップスクリプトは現在のプロジェクトにインストールします。HOME 単位でインストールしたい場合は `oma install --global` を使います。プロジェクト単位とグローバルインストールを組み合わせる前に、[インストール](./installation.md)を読んでください。

## 2. 結果を確認する

同じプロジェクトのディレクトリからヘルスチェックを実行します。

```bash
oma doctor
```

選択したベンダーの統合と `.agents/` ファイルが準備できていれば成功です。任意の MCP、ブラウザー、メモリ、コードインテリジェンス統合は警告として表示されることがあります。これらは利用するタスクにだけ必要です。各標準エージェントロールで解決されたモデルと CLI を確認するには `oma doctor --profile` を使います。

コマンドが見つからない場合は、CLI が現在の `PATH` の外にインストールされています。新しいシェルを開くか、パッケージマネージャーの bin ディレクトリを追加してください。`oma doctor` が無効な設定を報告した場合は、指定されたフィールドを修正してもう一度実行します。復旧のために `.agents/oma-config.yaml` を削除しないでください。このファイルはユーザーが管理する設定で、更新後も設定を保持します。

## 3. 小さなタスクを 1 つ実行する

設定した AI ツールでリポジトリを開き、自己完結した変更を 1 つ説明します。

```text
Add a validation message to the existing email field. Follow the project's current form and test conventions. Done when the invalid-email case is covered by a focused test.
```

選択したホストでキーワードフックが有効になっている場合、対応するワークフローを起動できます。スキルのルーティングはホストまたは選択したワークフローが行います。そのため、任意のホストへのプロンプトだけでフック、特定のスキル、`CHARTER_CHECK` が必ず使われるわけではありません。実行コントラクトでは、リポジトリの規約を確認し、対象範囲だけを変更し、検証結果を報告します。実際のファイルとコマンドはプロジェクトによって異なります。上のプロンプトは例です。

API と UI の両方にまたがるタスクでは、`/work` または `/orchestrate` を明示的に選択します。単一ドメインのタスクなら、[単一スキル実行](../guide/single-skill.md)に進んでください。より長い例は[使い方ガイド](../guide/usage.md)にあります。

## 4. 規模を広げる前にデフォルトを確認する

OMA は初期状態で `model_preset: auto`、コードインテリジェンスに Serena、意味メモリに Agent Memory、Web 検索にネイティブ検索を使い、テレメトリを無効にします。Serena は共有 `bridge` トランスポートを使い、設定しない限り自動更新されます。ブラウザー DevTools MCP はオプトインで、初回の対話式セットアップでは Aside が先に提示されます。動作への影響と上書きキーは[重要なデフォルト](./important-defaults.md)を参照してください。

管理対象のタスクが停止した場合は、まず `oma agent status <session-id> [agent-id]` を実行し、`.agents/state/agent-runs/` にある receipt（実行記録）と、注入された claim（構造化された結果宣言）のパスを確認します。これらの記録には、実行、タスク、ワークスペース、終了コード、検証状態が含まれます。`.agents/state/memories/` の人間向け `result-*.md` と `progress-*.md` は、存在する場合に追加の文脈を提供します。実行が終了したことを確認してから、失敗した最小のコマンドだけを再実行してください。持続実行ワークフローは完了するか `workflow done` と指示するまでアクティブです。状態ファイルからの復旧については、[ワークフロー](../core-concepts/workflows.md#persistent-mode-mechanics)を参照してください。

## 次のステップ

- [重要なデフォルト](./important-defaults.md): 優先順位、プロバイダー、復旧方法
- [インストール](./installation.md): プリセット、ベンダー設定、グローバルインストール、更新
- [エージェント](../core-concepts/agents.md): 33 個のスキルパッケージとディスパッチロール
- [ワークフロー](../core-concepts/workflows.md): 計画、並列実行、QA、持続モード
