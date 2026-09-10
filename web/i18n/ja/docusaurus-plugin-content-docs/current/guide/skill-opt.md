---
title: "ガイド：スキル最適化"
sidebar_label: スキル最適化
description: oma skill optimize を使い、決定的な学習、検証、実行側が所有する保留ゲートで、証拠に基づくスキルの継続的な改善を行う方法を説明します。
---

# スキル最適化

`oma skill optimize` は、`oma skill eval` が生成する `utilityLift` を最大化するよう `SKILL.md` を改善します。生のロールアウト証拠、スコープを持つ永続知識、実行可能なスキルを分けます。Wiki メンテナーが観測できる成功と失敗をまとめ、提案者がその知識から、追加・削除・置換の範囲を限定した編集を出力します。候補は検証用保留分割の効用を改善しなければならず、`--apply` には実行側が所有する保留分割の改善も必要です。デプロイ時に推論用の Wiki 検索は追加されず、出力は `SKILL.md` のままです。

研究上の根拠：Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C., & Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## 必須の依存関係：評価タスクのフィクスチャ

`oma skill optimize` は評価タスクのフィクスチャなしでは実行できません。`.agents/eval/<skill>/` に少なくとも **5 個のタスクフィクスチャ**（`MIN_TASKS = 5`）が必要です。5 個未満の場合、コマンドはすぐにエラーになります。

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

`.agents/eval/<skill>/` のディレクトリ規約、フィクスチャスキーマ、チェッカーの種類、モック再生用のロールアウトの準備については、[スキルユーティリティ評価ガイド](/docs/guide/skill-eval)を参照してください。

## 動作

フィクスチャはタスク ID で並べ替え、**学習（train）**、**検証用保留（held-out validation）**、**実行側が所有する最終テスト（runner-owned final-test）** に決定的に分割されます。5 個以上ある場合、目標比率は 60/20/20 で、各分割に少なくとも 1 タスクを入れます。最終テストのタスクはこのローカルフィクスチャセットから選ばれます。ループ中はメンテナーと提案者から隠され、非公開の外部スイートから取得されません。

各エポック（`--max-epochs` の上限、デフォルト 8）で次を行います。

1. **現在の最良の `SKILL.md` を学習分割で採点します。** `oma skill eval` が、タスクごとの観測可能なプロンプト、出力、改善幅を返します。
2. **Wiki メンテナーが証拠をまとめます。** 最大 5 件の失敗と 3 件の成功を、証拠と結び付いたパターンにします。スコープを持つパターンと過去のゲート結果は、OMA の L1/L2/L3 メモリシステムから再利用されます。
3. **提案者が K 個の候補編集を出力します。** 上限は `--edits-per-epoch` のデフォルト値である 4 件です。永続的な却下履歴にすでにある完全一致の編集はスキップします。
4. **各候補編集について：**
   - `SKILL.md` のメモリ内コピーに編集を適用します。
   - 候補を検証します（frontmatter の `name` と `description` は残り、本文はパースできなければなりません）。
   - 文章上の学習率予算を適用します。正味の文字変更が `--lr`（デフォルト 600）を超える編集を破棄します。
   - **検証用保留分割**で候補を再採点します。
5. **検証用保留分割で最も良かった候補だけを受け入れます。** 検証の改善幅が厳密に向上（`Δlift > 0`）し、負の転移エントリが回帰の下限（`NEG_TRANSFER_FAIL = -0.1`）を下回らない場合に限ります。すべての提案ゲートを保存します。
6. 受け入れられた編集がないエポックが 2 回続いたら早期停止します（`OPT_EARLY_STOP_PATIENCE = 2`）。
7. **改善後に実行側が所有する最終テストを実行します。** ループ中、メンテナーと提案者はこれらのタスクを見ません。最終テストが失敗すると `--apply` を禁止し、検証の勝者を却下された知識として記録します。

最適化中にライブの `SKILL.md` を直接編集することはありません。常にメモリ内の候補コピーを使います。

## 使い方

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### フラグ

| フラグ | デフォルト | 説明 |
|:-----|:--------|:-----------|
| `--skill <id>` | `_all` | 最適化するスキル ID（単純名。パス区切りなし）。 |
| `--dry-run` | **yes（デフォルト）** | `SKILL.md` を変更せずに編集案と diff を表示します。生成された証拠と進化イベントは保存されます。 |
| `--apply` | なし | 受け入れた編集を `SKILL.md` に適用し、アトミックな書き込み前に元ファイルをバックアップします。検証と実行側が所有する最終テストのゲートに合格したときだけ実行されます。OMA 所有のスキルには `--yes` も必要です。 |
| `--mock` | **yes（デフォルト）** | `_rollouts/` から記録済みの最適化編集と評価判定を再生します。決定的でオフラインです。CI で安全に使えます。 |
| `--live` | なし | ライブ LLM 最適化ディスパッチです。エポックごとに実際のモデル呼び出しが発生します。コストプレビューを表示し、`--yes` がなければ確認を求めます。 |
| `--max-epochs <n>` | `8` | 最大の最適化エポック数。 |
| `--edits-per-epoch <k>` | `4` | 1 エポックあたりに最適化 LLM が提案する候補編集数。 |
| `--lr <chars>` | `600` | 文章上の学習率予算。受け入れる編集 1 件あたりの正味文字変更上限。 |
| `--yes` | なし | コストプレビューの確認を省略します。`--live` の場合だけ意味があります。 |
| `--json` | なし | CI/CD 用に JSON で出力します。 |
| `--output <format>` | `text` | 出力形式（`text` または `json`）。 |

## 最小のエンドツーエンド例

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

出力例:

```
[oma skill opt] skill: oma-scholar, tasks: 8 (train: 4, val: 4), dry-run: true

Skill opt  (skill: oma-scholar)
  applied: false
  baselineLift: 18.5%  finalLift: 32.0%
  epochs: 3  acceptedEdits: 2  rejected: 6

  diff:
--- a/SKILL.md
+++ b/SKILL.md
@@ -12,6 +12,9 @@
 ### When to use
 - User asks to look up an academic paper or technical claim.
+- User asks for a summary of arxiv abstracts or DOI-linked documents.
 - User wants citations or sources for a factual statement.
```

diff は最適化が書き込む内容を示します。`SKILL.md` は変更されませんが、生成された進化の証拠とスコープ付きゲート結果は今後の実行に向けて保存されます。

## 検証済みの改善を適用する

候補の diff を確認して問題がなければ、`--apply` で再実行します。

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

`--apply` が書き込むのは、検証で厳密に正の改善が見つかり、実行側が所有する最終テストで候補の改善幅がベースラインの改善幅を上回った場合だけです。アトミックな書き込みの前に元の `SKILL.md` をバックアップします。変更された内容を確認できるよう、diff は常に表示されます。

## ライブモード

ライブモードは実際のメンテナーと提案者を呼び出し、エポックごとに評価の実験群をライブで再実行します。コストが高くなります。採点するタスクごとにベースラインと処置群の呼び出しがあり、判定フィクスチャが追加の採点呼び出しを行い、最終テストでは元の本文と候補本文を採点します。プレビューには実際の分割から計算した、基礎モデルの呼び出し上限が表示されます。各呼び出しのタイムアウトは 120 秒です。Claude の評価実験群は、環境ツール、スキル、MCP、AgentMemory を無効にして制限付きで実行します。

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

コストプレビューには、LLM 呼び出しを始める前に基礎モデルの呼び出し上限が表示されます。

## JSON 出力

```bash
oma skill optimize --skill oma-scholar --json
```

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "baselineLift": 0.1850,
  "finalLift": 0.3200,
  "epochCount": 3,
  "acceptedEdits": [
    { "op": "add", "anchor": "### When to use", "after": "\n- User asks for a summary of arxiv abstracts or DOI-linked documents." }
  ],
  "rejectedCount": 6,
  "applied": false,
  "diff": "--- a/SKILL.md\n+++ b/SKILL.md\n...",
  "_dryRun": true,
  "finalTest": { "baselineLift": 0.10, "candidateLift": 0.25, "passed": true },
  "_split": { "trainCount": 4, "valCount": 1, "testCount": 3 }
}
```

`ok` が `true` になるのは、候補が検証を改善し、実行側が所有する最終テストが失敗しない場合（または候補が適用された場合）だけです。`_split` のカウントは、使用されたローカルフィクスチャ分割の実数を示します。

## `oma-*` スキルの SSOT に関する注意

ID が `oma-` で始まるスキルは oh-my-agent が所有し、`oma update` で上書きされます。これらのスキルでは `--apply` は推奨しません。デフォルトの `--dry-run` を使い、意味のある改善ならレジストリへ反映してください。ユーザーが作成したスキルでは `--apply` を安全に使えます。

OMA 所有のスキルを対象にすると、コマンドは次の警告を表示します。

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

## 過学習ガード

メンテナーと提案者が見るのは TRAIN のロールアウト証拠だけです。候補の選択には保持した VALIDATION 分割を使い、実行側が所有する TEST 分割は進化が終わるまで見えません。検証の勝者が最終テストを改善できなければ適用せず、却下履歴に永続知識として追加します。

## CI への統合

`--mock` モードでは、`oma skill optimize` は完全に決定的でオフラインです。記録済みのロールアウトに対して、提案されたスキルの diff が改善幅を示すか CI で確認できます。

```bash
oma skill optimize --skill oma-scholar --mock --json
```

終了コード：
- `0` の場合は、改善の有無にかかわらず最適化が完了しています。
- `1` の場合は、`MIN_TASKS` 未満のフィクスチャ、または無効な `--skill` 引数です。

## 関連項目

- [スキルユーティリティ評価](/docs/guide/skill-eval)。タスクフィクスチャ、チェッカー、モックとライブのモード、`_rollouts/` ディレクトリの作成方法を説明します。
- [CLI コマンド](/docs/cli-interfaces/commands)。すべてのスキル管理コマンドのフラグを参照できます。
