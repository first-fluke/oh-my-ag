---
title: "ガイド: エージェント結果と再開"
sidebar_label: 結果と再開
description: 検証可能な claim（構造化された結果宣言）でエージェントの作業を記録し、ネイティブコンテキストを確認し、古い証拠を再利用せずに未完了のセッションを復旧します。
---

# エージェント結果と再開

OMA はエージェントの結果を、プロセスの終了コードだけでなく、小さな証拠記録として扱います。ここで receipt は、実行と検証の結果を記録する機械可読な実行記録です。claim は、エージェントが結果を宣言する構造化データです。実行記録にはタスク ID とセッション ID、ワークスペースのフィンガープリント、検証の receipt、変更ファイル、未解決の作業、アーティファクトのハッシュが含まれます。これにより、受入コントラクトと入力が一致している間だけ、コーディネーターは完了したタスクを再利用できます。

ネイティブエージェントを実行する場合は、このライフサイクルを直接使います。ワークフローと `oma agent spawn` は同じ記録を作成し、管理対象の実行の確定は親コーディネーターに任せます。

## ネイティブ実行を開始する

まず、`.agents/results/plan-SESSION_ID.json` のプランに `acceptance_criteria` と `required_checks` を定義します。小さな一般的プロジェクトチェックなら、次のように 1 つのタスクを含められます。

```json
{
  "tasks": [
    {
      "id": "docs",
      "agent": "docs",
      "task": "Review README.md and report any documentation issues",
      "workspace": ".",
      "acceptance_criteria": [
        { "id": "diff-clean", "description": "The current Git diff has no whitespace errors" }
      ],
      "required_checks": [
        { "id": "whitespace", "criteria": ["diff-clean"], "command": ["git", "diff", "--check"], "cwd": "." }
      ],
      "retry_policy": "manual"
    }
  ]
}
```

このチェックが証明するのは Git diff に空白エラーがないことだけです。タスク、基準、チェックをプロジェクトの実際の受け入れコントラクトに置き換えてください。プロジェクトルートから実行を開始します。

```bash
oma agent begin docs docs SESSION_ID --workspace .
```

`SESSION_ID` はプランで使ったセッション ID に置き換えます。コマンドは生成された UUID の `runId` と `claimPath` を含む JSON を、たとえば次のように表示します。

```json
{
  "runId": "<generated-run-id>",
  "taskId": "docs",
  "sessionId": "<your-session-id>",
  "status": "running",
  "claimPath": ".agents/state/agent-runs/<generated-run-id>.claim.json"
}
```

山括弧の値はプレースホルダーです。実行時に表示された実際の値を使ってください。begin が成功すると、`.agents/state/agent-runs/` に実行記録が作成され、タスクコントラクトのスナップショットが保存されます。claim パスは常に実行記録のパスで、`.json` を `.claim.json` に置き換えたものです。

## コンテキストを読み込み、タスクを実行する

編集前にグラフが選んだ参照を読み込みます。

```bash
oma agent context docs --difficulty Medium
```

難易度は `Simple`、`Medium`、`Complex` のいずれかでなければなりません。コマンドは選択したエージェント用に組み立てたコンテキストを表示します。グラフに基づくコンテキストがない場合はタスク定義を修正するか、プロジェクトに記載されたネイティブ検索パスを使います。コンテキストの receipt を捏造しないでください。

`begin` に記録されたワークスペースでタスクを実行します。実行中はセッションプランを固定してください。受け入れ基準や必要なチェックを変更する場合は、プランを更新してから新しい実行を開始します。

## 検証を記録する

受け入れコントラクトに固定されたすべてのチェックを実行します。

```bash
oma agent verify RUN_ID --required
```

`RUN_ID` は `begin` が返した UUID に置き換えます。コマンドは宣言された argv を実行し、実際の終了コードと検証前後のワークスペースフィンガープリントを記録します。タスクコントラクトに含まれているチェックなら、正確なコマンドを 1 つだけ記録できます。

```bash
oma agent verify RUN_ID -- git diff --check
```

正確なコマンド形式は、タスクのコントラクトに属するチェックだけに使います。それ以外ではプランの `required_checks` を使い、`--required` で宣言された受け入れ基準を証明してください。

`--affected PATH...` は、グラフにそのパスの完全なテスト選択がある場合だけ使います。チェックは実行ごとに直列で行われます。終了コードが 0 以外の場合やチェック中にワークスペースが変わった場合、その検証記録は無効です。

## claim を書き込み、実行を完了する

`begin` が表示した正確なパスに claim ファイルを書き込みます。

```json
{
  "status": "completed",
  "changedFiles": [],
  "unresolved": [],
  "artifacts": []
}
```

`status` は `completed`、`partial`、`blocked`、`failed` のいずれかです。パスはプロジェクトルートからの相対パスで、すべてのアーティファクトはワークスペース内の通常ファイルでなければなりません。実行可能なチェックがない特定のレビューには `verificationSkipped` を使えます。失敗したチェックを成功に変えるものではありません。

claim を書いたら、ネイティブ実行を確定します。

```bash
oma agent finish RUN_ID CLAIM_PATH
```

`begin` が返した UUID と claim パスに置き換えます。新しいファイル名を作らないでください。`CLAIM_PATH` は生成された `.claim.json` パスです。

finish コマンドは claim、現在のコントラクト、現在の検証記録、アーティファクトのハッシュを確認します。古い証拠を含む完了 claim は failed または partial になります。親プロセスがライフサイクルを管理している実行は確定できません。

## 起動された実行とネイティブ実行

`oma agent spawn` と `oma agent parallel` は実行を作成し、実行 ID と結果の指示を子プロセスへ注入し、子プロセスの終了コードを親が取得できるようにします。子は claim を書き、アーティファクトを報告します。親は管理対象の receipt を確定します。読み取り専用の子は `OMA_RESULT_JSON: {...}` を 1 行返します。親はこれを保存し、`verificationSkipped` の説明は実行可能な検証とは別に扱います。

`.agents/results/` の人間向け結果ファイルと `.agents/state/memories/` のメモは、作業を追うために役立ちます。再利用と再開の根拠になるのは、`.agents/state/agent-runs/` の機械可読な実行記録です。

## 再試行前に復旧状態を確認する

まず、OMA が何をするかを確認します。

```bash
oma agent resume SESSION_ID --dry-run
```

レポートは各タスクを `reused`、`ready`、`running`、`blocked` に分類し、理由を含めます。有効な完了 receipt を再利用できるのは、コントラクト、入力、アーティファクトのハッシュ、依存関係の証拠が現在も有効な場合だけです。管理対象のプロセスが実行中の場合や、ネイティブ実行に生存確認の証拠がない場合は、二重実行しません。

安全に実行できることを確認したら、依存関係の順序で準備済みのタスクを再開します。

```bash
oma agent resume SESSION_ID
```

自動再生には、`retry_policy: "safe"`、再生可能なプロンプト、プランまたは保存済みディスパッチにあるエージェントが必要です。デフォルトは `manual` です。元の試行を含む `--max-attempts` のデフォルトは `3` です。

```bash
oma agent resume SESSION_ID --max-attempts 2
```

OMA は復旧チェックポイントを `.agents/state/agent-resume/` に書き込み、セッションリースを使って 2 つのコーディネーターが同じセッションを再試行できないようにします。復旧中はプランを固定します。プランや依存関係が変わった場合、または後の再試行が以前の入力を変えた場合、影響を受けるタスクは blocked になり、新しい検証実行が必要です。

再開は新しい試行を開始します。中断されたモデルの会話を復元するものではありません。中断されたネイティブ実行を再開する前に、実際の結果と未解決の作業を記録して、古い実行を `partial` または `failed` にします。その後、dry-run レポートを確認し、安全に再試行できる経路があるタスクだけを再試行します。

## 復旧例

| 状況 | 操作 | 期待される結果 |
| --- | --- | --- |
| 必須チェックが失敗した | タスクを修正し、もう一度 `oma agent verify RUN_ID --required` を実行して、新しい claim で完了する | ワークスペースのフィンガープリントが現在のものであれば、最新の receipt が失敗した結果を置き換える |
| claim の前にプロセスが終了した | 実行を partial または failed にしてから、`oma agent resume SESSION_ID --dry-run` を実行する | 古い試行は保持され、安全なタスクは `ready`、手動タスクは `blocked` になる |
| 依存関係が変わった | 依存タスクを再実行して、レポートをもう一度確認する | 自分のファイルが変わっていなくても、依存タスクの再利用は無効になる |
| プランまたは入力が変わった | プランを安定させてから新しい実行を開始する | 新しい実行は新しいコントラクトを記録し、古い証拠は再利用されない |
| タスクに判断が必要 | 説明を付けて `blocked` として記録する | 判断とプロンプトが用意されるまで、再開しても blocked のままになる |

パースエラー、ベンダーツールの不足、ダッシュボードの状態、スケジュール、古い評価データについては、[トラブルシューティング](/docs/guide/troubleshooting)を参照してください。
