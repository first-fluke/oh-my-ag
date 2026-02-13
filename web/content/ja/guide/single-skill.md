---
title: "ユースケース: 単一スキル"
description: 明確なスコープと素早いフィードバックループによる、集中的な単一ドメイン作業のための高速パス。
---

# ユースケース: 単一スキル

## このパスを使用する場合

出力のスコープが狭く、主に1つのドメインが担当する場合に使用します:

- 1つの UI コンポーネント
- 1つの API エンドポイント
- 1つのレイヤーにおける1つのバグ
- 1つのモジュールにおける1つのリファクタリング

タスクがクロスドメインの調整（API コントラクト + UI + QA）を必要とする場合は、[`マルチエージェントプロジェクト`](./multi-agent-project.md) を使用してください。

## 事前チェックリスト

プロンプトを送信する前に、以下を定義してください:

1. 正確な出力（ファイルまたは動作）
2. 対象のスタックとバージョン
3. 受け入れ基準
4. テストの期待値

## プロンプトテンプレート

```text
Build <specific artifact> using <stack>.
Constraints: <style/perf/security constraints>.
Acceptance criteria:
1) ...
2) ...
Add tests for: <critical cases>.
```

## プロンプト例

```text
Create a login form component in React + TypeScript + Tailwind CSS.
Constraints: accessible labels, client-side validation, no external form library.
Acceptance criteria:
1) email and password validation messages
2) disabled submit while invalid
3) keyboard and screen-reader friendly
Add unit tests for valid/invalid submit paths.
```

## 期待される実行フロー

1. 関連するスキルが自動選択される。
2. エージェントが実装と前提条件を提案する。
3. ユーザーが前提条件を確認または調整する。
4. エージェントがコードとテストを提供する。
5. ユーザーがローカル検証を行い、小さなフォローアップを要求する。

## マージ前の品質ゲート

- 動作が受け入れ基準に一致
- テストが正常系とコアとなるエッジケースをカバー
- 無関係なファイル変更がない
- 共有モジュールへの隠れた破壊的変更がない

## エスカレーションシグナル

以下の場合にマルチエージェントフローに切り替えてください:

- UI 作業に新しい API コントラクトが必要
- 1つの修正がレイヤー間で連鎖的な変更を引き起こす
- 最初のイテレーション後にスコープが1つのドメインを超えて拡大

## 完了基準

単一スキル実行は以下の条件を満たした場合に完了です:

- 対象のアーティファクトが実装済み
- 受け入れ基準が実証的に満たされている
- 変更された動作に対してテストが追加または更新されている
