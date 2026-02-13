---
title: "ユースケース: マルチエージェントプロジェクト"
description: 明示的な調整ゲートを伴うクロスドメインデリバリーのエンドツーエンドフロー。
---

# ユースケース: マルチエージェントプロジェクト

## このパスを使用する場合

機能が複数のドメイン（例: Backend + Frontend + QA）にまたがり、並列実行が有益な場合に使用します。

## 調整モデル

推奨シーケンス:

1. `/plan` でタスク分解と依存関係のマッピング
2. `/coordinate` で実行順序と担当の決定
3. ドメインごとに並列 `agent:spawn`
4. `/review` で QA/セキュリティ/パフォーマンスゲート

## セッションとワークスペース戦略

機能ストリームごとに1つのセッション ID を使用します:

```text
session-auth-v2
```

マージコンフリクトを減らすため、ドメインごとに分離されたワークスペースを割り当てます:

- backend: `./apps/api`
- frontend: `./apps/web`
- mobile: `./apps/mobile`

## スポーン例

```bash
oh-my-ag agent:spawn backend "Implement JWT auth API + refresh flow" session-auth-v2 -w ./apps/api
oh-my-ag agent:spawn frontend "Build login + refresh UX with error states" session-auth-v2 -w ./apps/web
oh-my-ag agent:spawn qa "Review auth risks, test matrix, and regression scope" session-auth-v2
```

## コントラクトファーストルール

並列コーディングの前に、共有コントラクトを確定してください:

- リクエスト/レスポンススキーマ
- エラーコードとメッセージ
- 認証/セッションライフサイクルの前提条件

実行中にコントラクトが変更された場合は、下流のエージェントを一時停止し、更新されたコントラクトを含むプロンプトを再発行してください。

## マージゲート

すべてのゲートを通過しない限りマージしないでください:

1. ドメインレベルのテストが合格
2. 統合ポイントが合意済みコントラクトに一致
3. QA の高/重大な問題が解決済みまたは明示的に免除
4. 外部に見える動作が変更された場合、changelog またはリリースノートが更新済み

## 運用上のアンチパターン

以下を避けてください:

- すべてのエージェントで1つのワークスペースを共有する
- 他のエージェントに通知せずにコントラクトを変更する
- 互換性チェック前に Backend/Frontend を個別にマージする

## 完了基準

マルチエージェント実行は以下の条件を満たした場合に完了です:

- すべてのドメインで計画されたタスクが完了
- クロスドメインの統合が検証済み
- QA のサインオフ（またはリスク受容の文書化）が記録されている
