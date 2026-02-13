# Antigravityマルチエージェントスキルの使用方法

## クイックスタート

1. **Antigravity IDEで開く**
   ```bash
   antigravity open /path/to/oh-my-ag
   ```

2. **スキルは自動的に検出されます。** Antigravityが`.agent/skills/`をスキャンし、利用可能なすべてのスキルをインデックス化します。

3. **IDEでチャット。** 構築したいものを説明してください。

---

## 使用例

### 例1: シンプルな単一ドメインタスク

**あなたが入力:**
```
"Tailwind CSSを使用してメールとパスワードフィールドを持つログインフォームコンポーネントを作成"
```

**何が起こるか:**
- Antigravityがこれが`frontend-agent`にマッチすると検出
- スキルが自動的にロード（Progressive Disclosure）
- TypeScript、Tailwind、フォームバリデーション付きのReactコンポーネントを取得

### 例2: 複雑なマルチドメインプロジェクト

**あなたが入力:**
```
"ユーザー認証付きのTODOアプリを構築"
```

**何が起こるか:**

1. **Workflow Guideが起動** — マルチドメインの複雑さを検出
2. **PM Agentが計画** — 優先順位付きのタスク分解を作成
3. **CLIでエージェントを起動**:
   ```bash
   oh-my-ag agent:spawn backend "JWT認証API" session-01 &
   oh-my-ag agent:spawn frontend "ログインとTODO UI" session-01 &
   wait
   ```
4. **エージェントが並列作業** — Knowledge Baseに出力を保存
5. **調整** — 一貫性のために`.gemini/antigravity/brain/`をレビュー
6. **QA Agentがレビュー** — セキュリティ/パフォーマンス監査
7. **修正と反復** — 修正を含めてエージェントを再起動

### 例3: バグ修正

**あなたが入力:**
```
"バグがあります — ログインをクリックすると'Cannot read property map of undefined'と表示されます"
```

**何が起こるか:**

1. **debug-agentが起動** — エラーを分析
2. **根本原因を発見** — データロード前にコンポーネントが`todos`をマップしている
3. **修正を提供** — ローディング状態とnullチェックを追加
4. **リグレッションテストを作成** — バグが再発しないことを保証
5. **類似パターンを発見** — 他の3つのコンポーネントを予防的に修正

### 例4: CLIベースの並列実行

```bash
# 単一エージェント (ワークスペース自動検出)
oh-my-ag agent:spawn backend "JWT認証APIを実装" session-01

# 並列エージェント
oh-my-ag agent:spawn backend "認証APIを実装" session-01 &
oh-my-ag agent:spawn frontend "ログインフォームを作成" session-01 &
oh-my-ag agent:spawn mobile "認証画面を構築" session-01 &
wait
```

**リアルタイムで監視:**
```bash
# ターミナル (別のターミナルウィンドウで)
bunx oh-my-ag dashboard

# またはブラウザで
bunx oh-my-ag dashboard:web
# → http://localhost:9847
```

---

## リアルタイムダッシュボード

### ターミナルダッシュボード

```bash
bunx oh-my-ag dashboard
```

`fswatch` (macOS) または `inotifywait` (Linux) を使用して`.serena/memories/`を監視します。セッションステータス、エージェント状態、ターン数、最新アクティビティを含むライブテーブルを表示します。メモリファイルが変更されると自動的に更新されます。

**要件:**
- macOS: `brew install fswatch`
- Linux: `apt install inotify-tools`

### Webダッシュボード

```bash
npm install          # 初回のみ
bunx oh-my-ag dashboard:web
```

ブラウザで`http://localhost:9847`を開きます。機能:

- **リアルタイム更新** WebSocket経由（ポーリングではなくイベント駆動）
- **自動再接続** 接続が切れた場合
- **SerenaテーマのUI** 紫のアクセントカラー
- **セッションステータス** — IDと実行中/完了/失敗状態
- **エージェントテーブル** — 名前、ステータス（カラードット付き）、ターン数、タスク説明
- **アクティビティログ** — 進捗と結果ファイルからの最新変更

サーバーはchokidarを使用して`.serena/memories/`を監視し、デバウンス（100ms）を適用します。変更されたファイルのみが読み取りをトリガーし、完全な再スキャンは行いません。

---

## 主要な概念

### Progressive Disclosure（段階的開示）
Antigravityは自動的にリクエストをスキルにマッチングします。スキルを手動で選択することはありません。必要なスキルのみがコンテキストにロードされます。

### トークン最適化されたスキル設計
各スキルは最大限のトークン効率のために2層アーキテクチャを使用:
- **SKILL.md** (~40行): アイデンティティ、ルーティング、コアルール — 即座にロード
- **resources/**: 実行プロトコル、例、チェックリスト、エラープレイブック — オンデマンドでロード

共有リソースは`_shared/`（スキルではない）にあり、すべてのエージェントから参照されます:
- 4ステップワークフローを含むchain-of-thought実行プロトコル
- 中位モデルガイダンスのためのfew-shot入出力例
- "3 strikes"エスカレーションを含むエラー復旧プレイブック
- 構造化された多段階分析のための推論テンプレート
- Flash/Proモデルティアのコンテキスト予算管理
- `verify.sh`による自動検証
- セッション横断の教訓蓄積

### CLIエージェント起動
`oh-my-ag agent:spawn`を使用してCLI経由でエージェントを実行します。`user-preferences.yaml`の`agent_cli_mapping`を尊重して、エージェントタイプごとに適切なCLI（gemini、claude、codex、qwen）を選択します。ワークスペースは一般的なモノレポ規約から自動検出されるか、`-w`で明示的に設定できます。

### Knowledge Base
`.gemini/antigravity/brain/`に保存されたエージェント出力。計画、コード、レポート、調整メモを含みます。

### Serena Memory
`.serena/memories/`の構造化されたランタイム状態。orchestratorはセッション情報、タスクボード、エージェントごとの進捗、結果を書き込みます。ダッシュボードはこれらのファイルを監視して監視を提供します。

### ワークスペース
エージェントは競合を避けるために別々のディレクトリで作業できます。ワークスペースは一般的なモノレポ規約から自動検出されます:
```
./apps/api   または ./backend   → Backend Agentワークスペース
./apps/web   または ./frontend  → Frontend Agentワークスペース
./apps/mobile または ./mobile   → Mobile Agentワークスペース
```

---

## 利用可能なスキル

| スキル | 自動起動条件 | 出力 |
|-------|-------------------|--------|
| workflow-guide | 複雑なマルチドメインプロジェクト | ステップバイステップのエージェント調整 |
| pm-agent | "plan this"、"break down" | `.agent/plan.json` |
| frontend-agent | UI、コンポーネント、スタイリング | Reactコンポーネント、テスト |
| backend-agent | API、データベース、認証 | APIエンドポイント、モデル、テスト |
| mobile-agent | モバイルアプリ、iOS/Android | Flutter画面、状態管理 |
| qa-agent | "review security"、"audit" | 優先順位付きの修正を含むQAレポート |
| debug-agent | バグレポート、エラーメッセージ | 修正されたコード、リグレッションテスト |
| orchestrator | CLIサブエージェント実行 | `.agent/results/`の結果 |
| commit | "commit"、"커밋해줘" | Gitコミット（機能ごとに自動分割） |

---

## ワークフローコマンド

Antigravity IDEチャットでこれらを入力してステップバイステップのワークフローをトリガー:

| コマンド | 説明 |
|---------|-------------|
| `/coordinate` | ステップバイステップガイダンス付きCLI経由のマルチエージェントオーケストレーション |
| `/orchestrate` | 自動化されたCLIベースの並列エージェント実行 |
| `/plan` | APIコントラクト付きPMタスク分解 |
| `/review` | 完全なQAパイプライン（セキュリティ、パフォーマンス、アクセシビリティ、コード品質） |
| `/debug` | 構造化されたバグ修正（再現 → 診断 → 修正 → リグレッションテスト） |

これらは**スキル**（自動起動）とは別のものです。ワークフローは多段階プロセスに対する明示的な制御を提供します。

---

## 典型的なワークフロー

### ワークフローA: 単一スキル

```
あなた: "ボタンコンポーネントを作成"
  → Antigravityがfrontend-agentをロード
  → すぐにコンポーネントを取得
```

### ワークフローB: マルチエージェントプロジェクト（自動）

```
あなた: "認証付きTODOアプリを構築"
  → workflow-guideが自動的に起動
  → PM Agentが計画を作成
  → CLI経由でエージェントを起動 (oh-my-ag agent:spawn)
  → エージェントが並列作業
  → QA Agentがレビュー
  → 問題を修正し、反復
```

### ワークフローB-2: マルチエージェントプロジェクト（明示的）

```
あなた: /coordinate
  → ステップバイステップのガイド付きワークフロー
  → PM計画 → 計画レビュー → エージェント起動 → 監視 → QAレビュー
```

### ワークフローC: バグ修正

```
あなた: "ログインボタンがTypeErrorをスロー"
  → debug-agentが起動
  → 根本原因分析
  → 修正 + リグレッションテスト
  → 類似パターンをチェック
```

### ワークフローD: ダッシュボード付きCLIオーケストレーション

```
ターミナル1: bunx oh-my-ag dashboard:web
ターミナル2: oh-my-ag agent:spawn backend "task" session-01 &
            oh-my-ag agent:spawn frontend "task" session-01 &
ブラウザ:    http://localhost:9847 → リアルタイムステータス
```

---

## ヒント

1. **具体的に** — "JWT認証、Reactフロントエンド、FastAPIバックエンドでTODOアプリを構築"は"アプリを作る"よりも良い
2. **CLI起動を使用** マルチドメインプロジェクトには — 1つのチャットですべてをやろうとしない
3. **Knowledge Baseをレビュー** — API一貫性のために`.gemini/antigravity/brain/`をチェック
4. **再起動で反復** — 指示を洗練させ、最初からやり直さない
5. **ダッシュボードを使用** — orchestratorセッションを監視するために`bunx oh-my-ag dashboard`または`bunx oh-my-ag dashboard:web`
6. **ワークスペースを分離** — 各エージェントに独自のディレクトリを割り当てる

---

## トラブルシューティング

| 問題 | 解決策 |
|---------|----------|
| スキルがロードされない | `antigravity open .`、`.agent/skills/`をチェック、IDEを再起動 |
| CLIが見つからない | `which gemini` / `which claude`をチェック、欠落しているCLIをインストール |
| エージェント出力が互換性がない | Knowledge Baseで両方をレビュー、修正を含めて再起動 |
| ダッシュボード: "No agents" | メモリファイルがまだ作成されていない、最初にorchestratorを実行 |
| Webダッシュボードが起動しない | `npm install`を実行してchokidarとwsをインストール |
| fswatchが見つからない | macOS: `brew install fswatch`、Linux: `apt install inotify-tools` |
| QAレポートに50以上の問題 | まずCRITICAL/HIGHに焦点を当て、残りは後で文書化 |

---

## CLIコマンド

```bash
bunx oh-my-ag                # 対話型スキルインストーラー
bunx oh-my-ag doctor         # セットアップチェックと欠落スキルの修復
bunx oh-my-ag doctor --json  # CI/CD用JSON出力
bunx oh-my-ag update         # スキルを最新バージョンに更新
bunx oh-my-ag stats          # 生産性メトリクスを表示
bunx oh-my-ag stats --reset  # メトリクスをリセット
bunx oh-my-ag retro          # セッション振り返り（学びと次のステップ）
bunx oh-my-ag dashboard      # ターミナルリアルタイムダッシュボード
bunx oh-my-ag dashboard:web  # Webダッシュボード (http://localhost:9847)
bunx oh-my-ag help           # ヘルプを表示
```

---

## 開発者向け（統合ガイド）

これらのスキルを既存のAntigravityプロジェクトに統合したい場合は、[AGENT_GUIDE.md](../AGENT_GUIDE.md)を参照してください:
- クイック3ステップ統合
- 完全なダッシュボード統合
- 技術スタック用のスキルカスタマイズ
- トラブルシューティングとベストプラクティス

---

**Antigravity IDEでチャットするだけです。** 監視にはダッシュボードを使用してください。CLI実行にはorchestratorスクリプトを使用してください。既存プロジェクトに統合するには、[AGENT_GUIDE.md](../AGENT_GUIDE.md)を参照してください。
