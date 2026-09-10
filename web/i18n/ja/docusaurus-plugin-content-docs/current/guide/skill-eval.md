---
title: "スキルユーティリティ評価"
sidebar_label: スキル評価
description: oma skill eval の評価タスク用フィクスチャ、.agents/eval/ のディレクトリ規約、チェッカーの種類、モックとライブの実行モードを説明します。
---

# スキルユーティリティ評価

`oma skill eval` は、スキルを読み込むことでエージェントのタスク結果が実際に改善するか測定します。`oma skill audit`（「2 つのスキルは冗長か」を問う）とは別の問いで、「このスキルは役に立つか」を問います。

設計の根拠は 2 件の研究結果です。WikiSkill（arXiv:2608.27454）は、生の経験、永続知識、実行可能なスキルを分けながら、進化のための保留ゲートを維持します。SkillLens（arXiv:2605.23899）は、スキルの効用が説明の独自性とは別であることを示します。説明が独自なスキルでも役に立たない場合があり、内容が重なるスキルでも役立つ場合があります。

---

## 動作

各タスクフィクスチャで、コマンドは 2 つの実験群を実行します。

1. **ベースライン実験群** では、スキルを外したエージェントにタスクプロンプトをディスパッチします。
2. **処置実験群** では、`SKILL.md` をプロンプトの先頭に追加してから、同じタスクをディスパッチします。

各実験群をタスクのチェッカーで採点します。0 は失敗、1 は合格です。主な指標は次のとおりです。

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

`utilityLift ≥ 5%` のとき、スキルは合格します。しきい値未満では、改善幅が小さい場合は警告、改善がない場合は失敗になります。判定には、採点可能なタスクが少なくとも 5 つ必要です。

---

## `.agents/eval/<skill>/` の規約

タスクフィクスチャは `.agents/eval/<skill>/` に置きます。このパスは `.agents/` の中にありますが、スキルディレクトリ自体の外にあるため、`oma update` でユーザーが作成した評価が上書きされません。

```
.agents/eval/
└── oma-scholar/
    ├── claims-only.yaml        ← task fixture
    ├── entity-lookup.yaml
    ├── partial-fetch.yaml
    ├── structured-output.yaml
    ├── edge-empty-response.yaml
    └── _rollouts/
        └── a3f1b2c4d5e6f7a8.json   ← recorded arm outputs + judge verdicts
```

`_` で始まるファイルはタスクフィクスチャを読み込むときにスキップされます。`_rollouts/` サブディレクトリには、過去の `--live --record` 実行で記録した出力があります。

## タスクフィクスチャのスキーマ

各フィクスチャは、次のフィールドを持つ YAML ファイルです。

```yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
checker:
  type: judge
  rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

| フィールド | 必須 | 説明 |
|:------|:---------|:-----------|
| `id` | はい | このタスクの一意な識別子。ロールアウトのファイル名とレポートで使います。 |
| `skill` | はい | 評価するスキル。親ディレクトリ名と一致します。 |
| `domain` | はい | ドメインのラベル。グループ化と将来の負の転移の検出で使います。 |
| `prompt` | はい | 両方の実験群へディスパッチするタスクプロンプト。 |
| `checker` | いいえ | 実験群の出力を採点する方法。省略時は `{ type: judge }`。 |
| `weight` | はい | 加重平均スコアでの相対的な重み。タスクの重要度が同じなら `1` を使います。 |

### チェッカーの種類

#### judge（デフォルト）

LLM がルーブリックに従って実験群の出力を評価し、PASS または FAIL を返します。`checker` を省略した場合、または `checker.type` がない場合のデフォルトです。

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

`rubric` は任意です。省略すると「回答はタスクプロンプトを正確かつ完全に満たしているか」というデフォルトルーブリックを使います。

簡潔にするため、ルーブリックをトップレベルに書くこともできます。

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**注意：** `--mock` モードでは、judge タスクに `_rollouts/` の以前の記録済み判定が必要です。タスクの記録済み判定がない場合、そのタスクは警告付きでレポートから除外されます。まず `--live --record` でロールアウトを作成します。

このルールは、どのチェッカー種別でも一方の実験群が完全に欠けている場合に適用されます。タスクは 0 点として採点せず、除外します。データがないことは失敗した回答ではありません。採点すると両方が 0 になり、改善幅 0 が `decision: "fail"` と解釈されるためです。除外によって採点数が `MIN_TASKS` 未満になると、`coverage: "insufficient"` と表示されます。

#### assert（オプトイン）

出力に特定の部分文字列が含まれるかを決定的に確認します。期待する出力が厳密な契約や形式である場合、ツール呼び出しの検証に使います。

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

`expect_contains` のすべての文字列が実験群の出力に含まれていれば合格です。

#### regex（オプトイン）

決定的な正規表現チェックです。完全一致ではなくパターンが必要な場合に使います。

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

200 文字を超えるパターンは 0 点です（ReDoS 対策）。照合前に出力を 10,000 文字へ切り詰めます。

## 実行モード

### `--mock`（デフォルト）

`_rollouts/` に記録されたロールアウトを再生します。完全に決定的でオフラインです。LLM は呼び出しません。

- `assert`／`regex` チェッカーでは、記録済みの出力文字列からスコアを計算します。
- `judge` チェッカーでは、`--live --record` が記録した `score` フィールドを再生します。

judge タスクに `_rollouts/` の記録済みスコアがなければ、コンソール警告を出してレポートから除外します。これにより mock モードは厳密にオフラインになります。

使用前に記録が古くないかも確認します。異なる `SKILL.md` 本文で記録した処置群のエントリ、フィクスチャの `prompt` が変わったエントリ、出所追跡より前のエントリは、ファイル名と件数を示す警告とともに破棄されます。採点可能なタスクが `MIN_TASKS` 未満になった場合、判定ではなく `coverage: "insufficient"` を報告します。編集したスキルが以前のスコアを引き継ぐことはありません。

:::note `oma skill optimize --mock`
最適化では候補の `SKILL.md` 本文を採点します。記録は作成時の本文に対してだけ有効なので、候補本文には一致するロールアウトがなく、未カバーとして報告されます。候補を採点するには `--live` を使います。
:::

CI でも安全に使えます。`OMA_SKILLEVAL_MOCK=1` を設定すると、このモードを強制します。

```bash
oma skill eval --skill oma-scholar
```

### `--live`

`oma agent spawn --read-only` で実際のエージェント実験群を起動します。プロジェクトのファイルを変更しないよう、両方の実験群は一時ワークスペースで実行されます。

ディスパッチ前に、タスク数、実験群のディスパッチ数、judge のディスパッチ数、判定されたベンダーを含むコストプレビューを表示します。`y` で確認するか、`--yes` で省略します。

以下の制御は CI とカバレッジ調査に便利です。

| オプション | 効果 |
| --- | --- |
| `--task-dir <path>` | `.agents/eval/<skill>` 以外のディレクトリからフィクスチャを評価します。 |
| `--max-tasks <n>` | ライブ実行で評価するフィクスチャ数に上限を設けます。 |
| `--neg-transfer` | 同じドメインの近隣を抽出して負の転移を調べます。デフォルトは無効です。 |
| `--require-coverage` | 採点可能なペアタスクが 5 未満なら終了コードを 0 以外にします。 |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### スキルの隔離（ベースラインを正しく保つ） {#skill-isolation-keeping-the-baseline-honest}

`utilityLift` は、**ベースライン実験群が対象スキルなしで実行される場合だけ**意味があります。ディスパッチされたエージェントはランタイムにインストールされた全スキルを自動ロードするため、単純なベースラインでも測定対象のスキルを読み込むことがあります。これでは比較が汚染され、ベースラインと処置群がほぼ同じになり、改善幅がほぼ 0 になります。

これを防ぐため、`--live` は、対象以外のインストール済みスキルを含む skills ディレクトリを持つ隔離された一時ワークスペースで両方の実験群を実行します。処置実験群には、プロンプトの先頭に注入した `SKILL.md` からだけ対象スキルを再び追加します。管理する変数はこの注入だけです。ベースラインはスキルなし、処置群は候補の `SKILL.md` です。

ほとんどのベンダーは作業ディレクトリに対して相対的にスキルを検出するため、この方法が機能します（例: `<cwd>/.claude/skills`、`<cwd>/.codex/skills`）。クリーンな作業ディレクトリなら、対象スキルを実際に隠せます。レポートの `isolation` フィールドには、隔離がどの程度保たれたかが示されます。

| 状態 | 意味 |
|---|---|
| `enforced` | cwd 相対のベンダーで、HOME パスに対象スキルがない。完全に隔離されている。 |
| `best-effort` | cwd 相対のベンダーだが、HOME にスキルのコピーがある（またはベンダーが不明）。プロジェクトのコピーは隠れるが、HOME のコピーが漏れる可能性がある。信頼度は低い。 |
| `unavailable` | HOME ベースのベンダー（例: `~/.gemini/antigravity-cli/skills` を読む **antigravity**）。クリーンな cwd では隠せない。警告を表示し、結果を低信頼度として扱う。 |
| `n/a` | モックモード。ライブのディスパッチはありません。 |

隔離が `enforced` でない場合は 1 行の警告を表示し、結果を低信頼度として扱います。信頼できる結果を得るには、HOME ベースではなく cwd 相対で隔離できるベンダー（claude、codex、qwen）を使います。評価ベンダーは `.agents/oma-config.yaml` の `model_preset` に従うため、デフォルトベンダーが cwd 相対のプリセットを選びます。

### `--live --record`

ライブ実験群を実行し、取得した出力（judge チェッカーのタスクでは判定も含む）を `_rollouts/<hash>.json` に書き込みます。ファイル名はタスク ID セットの決定的な SHA-256 ハッシュです。日付や乱数は使いません。

自分の環境で `--mock` 実行用の記録を作成すると、繰り返しをオフラインに保てます。

各エントリには出所情報があり、後の再生で適用できるか判断できます。

| フィールド | 記録する場所 | 比較対象 |
|---|---|---|
| `skillBodyHash` | `treatment` のみ（処置群） | 評価対象の SKILL.md 本文 |
| `promptHash` | 両方の実験群 | フィクスチャの現在の `prompt` |

ベースラインはスキルを外すため、`SKILL.md` を編集しても無効になりません。再記録が必要なのは処置群だけです。

:::caution `_rollouts/` はローカル専用。コミットしないでください
記録が再生されるのは、作成時と完全に同じ `SKILL.md` 本文に対してだけです。スキルを編集すると処置群の記録は次の `--mock` 実行で破棄され、リポジトリを取得した人に警告が出ます。ディレクトリは gitignore 済みなので、ローカルで記録してください。
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

ライブ実行が成功すると、レポートにはベースラインと処置群の件数、`utilityLift`、`coverage: "ok"`、隔離状態、`pass`／`warn`／`fail` の判定が含まれます。後のモック実行は、タスクプロンプトと処置群のスキル本文が一致する記録だけを再利用します。

---

## 最小限の動作するフィクスチャセット

判定には 5 個のフィクスチャ（`MIN_TASKS = 5`）が必要です。架空の `oma-scholar` スキル用の最小セットを示します。

```yaml
# .agents/eval/oma-scholar/claims-only.yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

```yaml
# .agents/eval/oma-scholar/entity-lookup.yaml
id: entity-lookup
skill: oma-scholar
domain: research
prompt: "Look up the entity knows:concept/attention-mechanism"
rubric: "Does the answer return the entity name, description, and at least one related concept?"
weight: 1
```

少なくとも 3 つのタスクを追加してから実行します。

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```

---

## レポートを読む

**テキスト出力：**

```
Skill utility eval  (skill: oma-scholar)
  tasks: 7
  isolation: enforced [codex]

  baseline: 42.9%  treatment: 71.4%
  utilityLift: 28.6%  (stddev: 14.3%)
  [PASS]
  Skill shows positive utility lift >= 5%.

  Per-task findings:
    claims-only: baseline=0 treatment=1 lift=+1.000
    entity-lookup: baseline=1 treatment=1 lift=+0.000
    ...

  Thresholds: fail <= 0%, warn < 5%
```

**JSON 出力**（`--json`）：

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "taskCount": 7,
  "coverage": "ok",
  "decision": "pass",
  "baselineScore": 0.4286,
  "treatmentScore": 0.7143,
  "utilityLift": 0.2857,
  "utilityStdDev": 0.1429,
  "findings": [
    { "taskId": "claims-only", "baseline": 0, "treatment": 1, "lift": 1.0 }
  ],
  "negativeTransfer": [],
  "isolation": "enforced",
  "isolationVendor": "codex"
}
```

`ok` が `true` になるのは `coverage === "ok"` かつ `decision === "pass"` の場合だけです。`isolation` フィールドは、ベースライン実験群が対象スキルなしで実際に実行されたかを示します。[スキルの隔離](#skill-isolation-keeping-the-baseline-honest)を参照してください。`--mock` モードでは `isolation` は `"n/a"` です。

## CI への統合

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

終了コード：
- `0` の場合は `pass` または `warn` です。
- `1` の場合は `fail`、または `--require-coverage` 使用時のカバレッジ不足です。

## `live` と `mock` の選び方

オープンエンドのタスクで実際の効用を測るには、judge チェッカーと `--live` を使います。以前記録した judge 判定をオフラインで再生する場合、または決定的な `assert`／`regex` 契約チェックを行う場合は `--mock` を使います。

`--live --record` の実行中に judge の二値判定（PASS／FAIL）をロールアウトエントリへ記録し、後の `--mock` 実行で記録済みのスコアを再生するため、モックの決定性が保たれます。LLM を再度呼び出しません。

**データ送信：** `--live` では、judge が候補実験群の出力を設定されたベンダーへ送って採点します。各ライブ実行の開始時に 1 回限りの警告を表示します。

モック実行でカバレッジ不足が出た場合は、破棄または欠落した `_rollouts` エントリの警告を確認し、フィクスチャまたはスキルを修正してからライブ記録を行います。隔離が `best-effort` または `unavailable` の場合は、改善幅を強いシグナルと扱う前に Claude、Codex、Qwen など cwd 相対のベンダーを選びます。

## スキルと一緒に評価タスクを配布する

スキルは `.agents/eval/<skill>/` にフィクスチャを置くことで評価タスクセットを含められます。これはスキルディレクトリ外のユーザー作成ファイルなので、`oma update` 後も残ります。`oma-skill-creation` で新しいスキルを作る場合は、将来の作成者がスキルの効果を確認できるよう、対応する `eval/` フィクスチャセットを追加します。スキル作成のワークフローは `.agents/skills/oma-skill-creation/SKILL.md` を参照してください。
