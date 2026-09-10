---
title: スキル
description: OMA の 33 スキルによる 2 層アーキテクチャの完全ガイドです。SKILL.md のルーティング、オンデマンドリソース、共有・条件付きプロトコル、ベンダー実行、トークン計測、ルーティングの仕組みを説明します。
---

# スキル

スキルは、ディスパッチロールにドメインの指針を与える構造化された知識パッケージです。実行プロトコル、技術スタックのリファレンス、コードテンプレート、エラープレイブック、品質チェックリスト、スキルが提供する例を、トークン効率を考えた 2 層アーキテクチャで整理しています。

---

## 2 層設計

### Layer 1: SKILL.md（中央値約 2,631 トークン。スキルがルーティングされたときにロード）

すべてのスキルはルートに `SKILL.md` ファイルを持ちます。スキルがルーティングされるとコンテキストウィンドウに入ります。インジェクターフックが渡すのは本文ではなく **パス参照** なので、ルーティングされていないスキルは `description` 以外のコストを消費しません。次の内容を含みます。

- **YAML フロントマター**：ルーティングと表示に使う `name` と `description`
- **使用すべき場合 / 使用すべきでない場合**：明示的なアクティベーション条件
- **コアルール**：そのドメインで最も重要な 5〜15 個の制約
- **アーキテクチャ概要**：コードをどう構成するか
- **ライブラリ一覧**：承認済みの依存関係と用途
- **参照**：Layer 2 リソースへのポインター（自動ロードされません）

フロントマターの例：

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

`description` フィールドは、スキルルーティングシステムがタスクとエージェントを照合するためのキーワードを含むため重要です。

### Layer 2: resources/（オンデマンド）

`resources/` ディレクトリには、実行に必要な詳しい知識を収めます。次の場合にだけロードされます。

1. ホストまたはワークフローがスキルを選択した場合（ネイティブスキルの一致や明示的なコマンドなど）
2. 現在のタスクの種類と難易度に、そのリソースが必要な場合

このオンデマンドロードはコンテキストローディングガイド（`.agents/skills/_shared/core/context-loading.md`）が制御します。ガイドは、エージェントごとにタスクの種類を必要なリソースへ対応付けます。

---

## ファイル構造の例

```
.agents/skills/oma-frontend/
├── SKILL.md                          ← Layer 1: loaded when routed
└── resources/
    ├── execution-protocol.md         ← Layer 2: step-by-step workflow
    ├── tech-stack.md                 ← Layer 2: detailed technology specs
    ├── angular-rules.md              ← Layer 2: Angular-specific conventions
    ├── snippets.md                   ← Layer 2: copy-paste code patterns
    ├── error-playbook.md             ← Layer 2: error recovery procedures
    └── checklist.md                  ← Layer 2: quality verification checklist

.agents/skills/oma-backend/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── orm-reference.md              ← Domain-specific (ORM queries, N+1, transactions)
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Shipped language seeds / generated references
    ├── node/
    ├── python/
    └── rust/

.agents/skills/oma-mobile/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── tech-stack.md
│   ├── screen-template.dart
│   ├── screen-template.swift         ← Swift native iOS screen template
│   ├── screen-template.tsx            ← React Native screen template
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Stack schema and generated platform references
    ├── README.md
    └── stack.schema.json

.agents/skills/oma-design/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── anti-patterns.md
│   ├── checklist.md
│   ├── design-md-spec.md
│   ├── design-tokens.md
│   ├── prompt-enhancement.md
│   ├── stitch-integration.md
│   └── error-playbook.md
└── reference/                         ← Deep reference material
    ├── typography.md
    ├── color-and-contrast.md
    ├── spatial-design.md
    ├── motion-design.md
    ├── responsive-design.md
    ├── component-patterns.md
    ├── accessibility.md
    └── shader-and-3d.md
```

---

## スキルごとのリソースタイプ

| リソースタイプ | ファイル名パターン | 目的 | ロードされるタイミング |
|--------------|-----------------|---------|-------------|
| **実行プロトコル** | `execution-protocol.md` | 手順型ワークフロー：Analyze -> Plan -> Implement -> Verify | 常時（`SKILL.md` とともに） |
| **技術スタック** | `tech-stack.md` | 技術仕様、バージョン、設定の詳細 | 複雑なタスク |
| **エラープレイブック** | `error-playbook.md` | 「3 回でエスカレーション」する復旧手順 | エラー発生時のみ |
| **チェックリスト** | `checklist.md` | ドメイン固有の品質検証 | Verify ステップ |
| **スニペット** | `snippets.md` | コピーして使えるコードパターン | Medium / Complex タスク |
| **例** | `examples.md` または `examples/` | LLM 向けの少数ショット入出力例 | Medium / Complex タスク |
| **バリアント** | `variants/` ディレクトリ | 言語・フレームワーク固有のリファレンス。Backend には `node`、`python`、`rust` のシードがあり、Mobile にはスキーマと生成されたプラットフォームリファレンスがあります。 | 対応するスタックがある場合 |
| **テンプレート** | `component-template.tsx`、`screen-template.dart` | ボイラープレートのファイルテンプレート | コンポーネント作成時 |
| **ドメインリファレンス** | `orm-reference.md`、`anti-patterns.md` など | 特定のサブタスク向けの詳しいドメイン知識 | タスクの種類に応じて |

---

## 共有リソース（_shared/）

すべてのエージェントは `.agents/skills/_shared/` の共通基盤を共有します。リソースは 3 つのカテゴリに分かれています。

### コアリソース（`.agents/skills/_shared/core/`）

| リソース | 目的 | ロードされるタイミング |
|---------|---------|-------------|
| **`skill-routing.md`** | タスクキーワードを適切なエージェントへ対応付けます。Skill-Agent Mapping、Complex Request Routing、Inter-Agent Dependency Rules、Escalation Rules、Turn Limit Guide の各表を含みます。 | オーケストレータとコーディネーションスキルが参照 |
| **`context-loading.md`** | タスクの種類と難易度ごとにロードするリソースを定義します。エージェントごとのタスク種類とリソースの対応表、条件付きプロトコルをロードするトリガーを含みます。 | ワークフロー開始時（Step 0 / Phase 0） |
| **`prompt-structure.md`** | すべてのタスクプロンプトに必要な 4 要素、Goal、Context、Constraints、Done When を定義します。PM、実装、QA エージェント向けのテンプレートと、Goal だけで始めるアンチパターンも含みます。 | PM エージェントとすべてのワークフローが参照 |
| **`clarification-protocol.md`** | 不確実性レベル（LOW / MEDIUM / HIGH）と各レベルのアクションを定義します。不確実性のトリガー、エスカレーションテンプレート、エージェント種別ごとの必須検証項目、サブエージェントモードの動作を含みます。 | 要件が曖昧な場合 |
| **`context-budget.md`** | トークン予算を管理します。ファイル読み取り戦略（`read_file` ではなく `find_symbol` を使う）、Simple（約 4,000 トークン）と Complex（約 9,000 トークン）のロードコスト、`oma skill audit` が確認する `SKILL.md` の上限（25,000 文字）、大きなファイルの扱い、コンテキスト不足の兆候を定義します。 | ワークフロー開始時 |
| **`difficulty-guide.md`** | タスクを Simple / Medium / Complex に分類する基準を定義します。想定ターン数、Fast Track / Standard / Extended のプロトコル分岐、判断を誤った場合の復旧を含みます。 | タスク開始時（Step 0） |
| **`quality-principles.md`** | すべてのエージェントに適用される 4 つの普遍的な品質原則です。 | 品質重視ワークフローの開始時 |
| **`vendor-detection.md`** | 現在のランタイム環境を検出するプロトコルです（Claude Code、Codex CLI、Antigravity、Cursor、Kiro、Qwen、CLI フォールバック）。ホストのマーカーと設定済みベンダー状態を使います。 | ワークフロー開始時 |
| **`session-metrics.md`** | Clarification Debt（CD）のスコアリングとセッションメトリクスを追跡します。イベント種別（clarify +10、correct +25、redo +40）、しきい値（CD >= 50 で RCA、CD >= 80 で一時停止）、統合ポイントを定義します。 | オーケストレーションセッション中 |
| **`common-checklist.md`** | Complex タスクの最終検証に適用する普遍的な品質チェックリストです（エージェント固有のチェックリストに加えて使います）。 | Complex タスクの Verify ステップ |
| **`lessons-learned.md`** | Clarification Debt のしきい値超過や破棄した実験から自動生成される過去セッションの学びです。ドメイン別の章と Evaluator Lessons を含みます。 | エラー後とセッション終了時に参照 |
| **`api-contracts/`** | API コントラクトテンプレートと生成されたコントラクトを収めます。`template.md` はエンドポイントごとの形式（メソッド、パス、リクエスト/レスポンススキーマ、認証、エラー）を定義します。 | 境界をまたぐ作業を計画するとき |

### ランタイムリソース（`.agents/skills/_shared/runtime/`）

| リソース | 目的 |
|---------|---------|
| **`memory-protocol.md`** | CLI サブエージェント向けのメモリファイル形式と操作。On Start、During Execution、On Completion のプロトコルを定義します。実験追跡の拡張も含みます。 |
| **`execution-protocols/claude.md`** | Claude Code 固有の実行パターン。`oma agent spawn` がベンダーに応じて注入します。 |
| **`execution-protocols/antigravity.md`** | Antigravity CLI（`agy`）の実行パターン。 |
| **`execution-protocols/codex.md`** | Codex CLI 固有の実行パターン。 |
| **`execution-protocols/commandcode.md`** | CommandCode の実行パターン。 |
| **`execution-protocols/grok.md`** | Grok の実行パターン。 |
| **`execution-protocols/kimi.md`** | Kimi Code の実行パターン。 |
| **`execution-protocols/kiro.md`** | Kiro の実行パターン。 |
| **`execution-protocols/opencode.md`** | OpenCode 拡張の実行パターン。 |
| **`execution-protocols/pi.md`** | pi 拡張の実行パターン。 |
| **`execution-protocols/qwen.md`** | Qwen CLI 固有の実行パターン。 |

ベンダー固有の実行プロトコルは、CLI 起動のエージェントなら `oma agent spawn` が自動で注入します。ネイティブサブエージェントは、選択したベンダーの統合規則を使います。

### 条件付きリソース（`.agents/skills/_shared/conditional/`）

| トリガー条件 | ロード元 | 概算トークン |
|-------------------|---------|----------------|
| **`quality-score.md`**：ワークフローの VERIFY または SHIP フェーズが開始する | Orchestrator（QA エージェントへ渡す） | 約 250 |
| **`experiment-ledger.md`**：IMPL ベースライン確立後に最初の実験を記録する | Orchestrator（ベースライン計測後にインラインで渡す） | 約 250 |
| **`exploration-loop.md`**：同じゲートが同じ問題で 2 回失敗する | Orchestrator（仮説エージェントをスポーンする前にインラインで渡す） | 約 250 |

予算への影響は、3 つすべてをロードした場合で合計約 750 トークンです。条件付きなので、通常のセッションでは 1〜2 個だけがロードされ、約 4,000 トークンの Simple タスクのロード量に比べて小さい値です。

---

## skill-routing.md によるスキルルーティング

ルーティングマップはタスクをエージェントへ対応付けます。

### シンプルルーティング（単一ドメイン）

「Tailwind CSS でログインフォームを作成」というプロンプトは、`UI`、`component`、`form`、`Tailwind` に一致し、**oma-frontend** へルーティングされます。

### 複合リクエストのルーティング

| リクエストパターン | 実行順序 |
|----------------|----------------|
| 「フルスタックアプリを作成」 | oma-pm -> （oma-backend + oma-frontend）を並列実行 -> oma-qa |
| 「モバイルアプリを作成」 | oma-pm -> （oma-backend + oma-mobile）を並列実行 -> oma-qa |
| 「バグを修正してレビュー」 | oma-debug -> oma-qa |
| 「ランディングページをデザインして構築」 | oma-design -> oma-frontend |
| 「機能のアイデアがある」 | oma-brainstorm -> oma-pm -> 関連エージェント -> oma-qa |
| 「すべて自動で実行」 | oma-orchestration（内部では oma-pm -> エージェント群 -> oma-qa） |

### エージェント間の依存関係ルール

**並列で実行できる（依存関係なし）：**

- oma-backend + oma-frontend（API コントラクトが事前定義されている場合）
- oma-backend + oma-mobile（API コントラクトが事前定義されている場合）
- oma-frontend + oma-mobile（互いに独立している場合）

**順番に実行する必要がある：**

- oma-brainstorm -> oma-pm（設計を先に行う）
- oma-pm -> その他すべてのエージェント（計画が先）
- 実装エージェント -> oma-qa（実装後にレビュー）
- oma-backend -> oma-frontend / oma-mobile（API コントラクトが事前定義されていない場合）

**QA は常に最後です。**ただし、ユーザーが特定ファイルだけのレビューを依頼した場合を除きます。

---

## トークン節約の計算 {#token-savings-math}

これらの数値は、手作業の推定ではなくスキルツリーから計測したものです。いつでも再計算できます。

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

トークン数は概算です（英語 Markdown のおおよその比率であるバイト数 ÷ 4）。表やコードフェンスはやや多くトークン化されるため、実際の値は少し高くなります。正確な値が必要なら、対象モデルのトークナイザーで計測してください。

### ロード階層

各階層は、エージェントが `context-loading.md` に従って実際に到達する状態です。

| 階層 | コンテキストに含まれるもの |
|------|------------------|
| `routed` | `SKILL.md` のみ |
| `simple` | `execution-protocol.md` を追加 |
| `medium` | タスク用に対応付けられたリソースがあれば追加 |
| `complex` | 対応付けられたリソースと、プロジェクトにあるスタックリファレンスを追加 |
| `all` | `SKILL.md` とすべてのリソース。上限であり、選択可能なモードではありません |

Backend と Mobile のスキルでは、`/stack-set` が `stack/` のプロジェクト固有リファレンスを生成できます。新しいチェックアウトには生成済みのスタックディレクトリがないため、`complex` の行は生成元になる `variants/` のシードを基に測定したサイズの目安です。エージェントが現時点でロードするファイルを示すものではありません。

:::note `all` は上限であり、別の選択肢ではありません
ランタイムがすべてのリソースを最初からロードすることはありません。スキルは `description` で見つかり、ルーティングされたときに本文が読み込まれ、リソースはタスクに必要なときだけ読まれます。`all` はスキルが消費し得る上限なので、割合は実際の構成との比較ではなく「回避できる量」として示しています。
:::

Layer 1 は下限であり、小さくはありません。インストール済み 33 スキルの `SKILL.md` は約 1,275〜5,489 トークン（中央値約 2,631）です。5 つのエージェントをルーティングすると `routed` 階層だけで上限の 15% に達するため、段階的開示による節約量にはこの下限があります。

### 5 エージェントのセッション（pm、backend、frontend、mobile、qa）

| 階層 | トークン | 上限に対する割合 | 回避量 |
|------|-------:|----------------:|--------:|
| `routed` | 11,497 | 15.7% | 84.3% |
| `simple` | 17,923 | 24.4% | 75.6% |
| `medium` | 19,125 | 26.1% | 73.9% |
| `complex` | 39,156 | 53.4% | 46.6% |
| `all` | 73,355 | 100% | なし |

5 つのエージェントで Simple または Medium タスクを扱う場合、すべてをロードする場合の 73K ではなく、およそ 17〜19K トークンのスキルコンテキストで済みます。Complex タスクでは約 38K です。通常の作業では約 74〜76% を節約し、スタックリファレンスをロードする場合でも約 47% を節約します。128K コンテキストのモデルなら、Simple / Medium では約 110K、Complex では約 90K を作業に使えます。

---

## タスクの難易度によるリソースロード

難易度ガイドはタスクを 3 つのレベルに分類し、Layer 2 をどこまでロードするかを決めます。

### Simple（想定 3〜5 ターン）

単一ファイルの変更、明確な要件、既存パターンの反復です。

ロードするのは `execution-protocol.md` だけです。分析を省略し、最小限のチェックリストで実装へ進みます。

### Medium（想定 8〜15 ターン）

2〜3 ファイルの変更、設計上の判断、既存パターンの新しいドメインへの適用が必要です。

`execution-protocol.md` と、存在する場合は Medium 用に対応付けられたリソースをロードします。短い分析と完全な検証を含む標準プロトコルを使います。

### Complex（想定 15〜25 ターン）

4 ファイル以上の変更、アーキテクチャ上の判断、新しいパターンの導入、他エージェントへの依存が必要です。

`execution-protocol.md`、対応付けられたリソース、利用可能な `tech-stack.md` / `snippets.md` リファレンスをロードします。チェックポイント、中間の進捗記録、`common-checklist.md` を含む完全な検証を行う拡張プロトコルを使います。

---

## コンテキストロードのタスクマップ（エージェント別）

コンテキストローディングガイドには、タスクの種類からリソースへの詳しい対応表があります。主要な対応は次のとおりです。

### Backend エージェント

| タスクの種類 | 必須リソース |
|-----------|-------------------|
| CRUD API の作成 | 存在する場合は対応する `variants/{node,python,rust}/snippets.md` |
| 認証 | 対応する `variants` の `snippets.md` と、存在する場合は `tech-stack.md` |
| DB マイグレーション | 存在する場合は対応する `variants/{node,python,rust}/snippets.md` |
| パフォーマンス最適化 | `orm-reference.md` と、スキルが提供する対応する例 |
| 既存コードの変更 | プロジェクトのコードインテリジェンスプロバイダーと関連する実行リソース |

### Frontend エージェント

| タスクの種類 | 必須リソース |
|-----------|-------------------|
| コンポーネント作成 | `snippets.md` とプロジェクト既存のコンポーネントパターン |
| フォーム実装 | `snippets.md`（フォーム + Zod） |
| API 統合 | `snippets.md`（TanStack Query） |
| スタイリング | `tailwind-rules.md` |
| ページレイアウト | `snippets.md`（grid） |

### Design エージェント

| タスクの種類 | 必須リソース |
|-----------|-------------------|
| デザインシステム作成 | `reference/typography.md` + `reference/color-and-contrast.md` + `reference/spatial-design.md` + `design-md-spec.md` |
| ランディングページのデザイン | `reference/component-patterns.md` + `reference/motion-design.md` + `prompt-enhancement.md` |
| デザイン監査 | `checklist.md` + `anti-patterns.md` |
| デザイントークンのエクスポート | `design-tokens.md` |
| 3D / シェーダー効果 | `reference/shader-and-3d.md` + `reference/motion-design.md` |
| アクセシビリティレビュー | `reference/accessibility.md` + `checklist.md` |

### QA エージェント

| タスクの種類 | 必須リソース |
|-----------|-------------------|
| セキュリティレビュー | `checklist.md`（Security セクション） |
| パフォーマンスレビュー | `checklist.md`（Performance セクション） |
| アクセシビリティレビュー | `checklist.md`（Accessibility セクション） |
| 完全監査 | `checklist.md`（全体）+ `self-check.md` |
| 品質スコアリング | `quality-score.md`（条件付き） |

---

## オーケストレータのプロンプト構成

オーケストレータがサブエージェントのプロンプトを組み立てるときは、タスクに関係するリソースだけを含めます。

1. エージェントの `SKILL.md` の Core Rules セクション
2. `execution-protocol.md`
3. 特定のタスク種類に対応するリソース（上のマップから）
4. `error-playbook.md`（常に含めます。復旧は不可欠です）
5. Memory Protocol（CLI モード）

この絞り込んだ構成により、不要なリソースをロードせず、サブエージェントが実際の作業に使えるコンテキストを増やせます。

---

## Clarification Debt とセッションメトリクス（詳細）

Clarification Debt（CD）は、セッション中に要件が不明確だったことによるコストを測定します。オーケストレータはユーザーからの訂正をすべて追跡してスコアを付けます。

| イベント種別 | ポイント | 説明 |
|------------|--------|-------------|
| `clarify` | +10 | 単純な明確化質問。MEDIUM の不確実性なら想定されます。 |
| `correct` | +25 | 方向転換が必要になった意図の誤解。 |
| `redo` | +40 | スコープまたは Charter の違反によりロールバックと再開が必要。 |
| `blocked` | +0 | エージェントが正しく停止して質問した。良い動作なので加点しません。 |

**修飾子：** Charter を読んでいない場合は +15、許可リスト違反は +20、同じエラーの繰り返しは ×1.5 です。

**しきい値と強制事項：**

- **CD >= 50** → `lessons-learned.md` に RCA エントリを必ず追加します。
- **CD >= 80** → セッションを停止し、ユーザーが要件を再指定する必要があります。
- **`redo` >= 2** → オーケストレータが一時停止し、明示的なスコープ確認を求めます。
- **同じエージェントで 3 セッション連続して CD >= 30** → エージェントのプロンプトテンプレートをレビューします。

セッションログは `.agents/state/memories/session-metrics.md` に保持します。イベントごとの行（ターン、エージェント、イベント種別、ポイント、詳細）とサマリーを記録します。

---

## 評価者の精度と QA チューニング

QA エージェントは、記録した判断ミスから改善します。CD がリアルタイムの指標なのに対して、Evaluator Accuracy（EA）は事後的な指標です。多くのエラーはセッション終了後に見つかります。

**EA イベント種別：**

| イベント | ポイント | 発見されるタイミング |
|-------|--------|-----------------|
| `false_negative` | +30 | 次のセッションまたは本番環境（QA が見逃したバグ） |
| `false_positive` | +15 | セッション中（実装エージェントが QA の指摘に正当な反論をした場合） |
| `severity_mismatch` | +10 | セッション中または次のセッションのレビュー時（重要度を誤って割り当てた場合） |
| `missed_stub` | +20 | ランタイム検証で表示だけの機能を捕捉した場合 |
| `good_catch` | -10 | QA が見つけにくいバグを捕捉した場合（良いシグナル） |

**EA は直近 3 セッションのローリングウィンドウで計算します。**しきい値は次のとおりです。

- **EA >= 30** → チューニングを推奨します。累積した EA イベントをレビューして、繰り返す QA 判断エラーを確認します。
- **EA >= 50** → チューニングが必須です。QA の `execution-protocol.md` を更新します。
- **ウィンドウ内で `false_negative` >= 3** → QA の `checklist.md` に検出パターンを追加します。
- **ウィンドウ内で `good_catch` >= 5** → 成功したパターンを `common-checklist.md` に一般化します。

しきい値を超えたら、累積した EA イベントをレビューしてエラーを分類し、QA のチェックリストまたは実行プロトコルを更新します。その後の 3 セッションで検証します。

---

## 複雑なタスクのスプリント分解

複雑なタスク（4 ファイル以上の変更、アーキテクチャ上の判断）は、1 回の長い実行ではなくスプリント単位で進めます。

1. **分解**：各スプリントを独立してテストできる、機能に焦点を当てた 2〜4 個のスプリントへ分けます。
2. **目標**：各スプリントを 5〜8 ターンにします。
3. **スプリントゲート**（各スプリントの後）：
   - スプリントの成果物は完成したか？
   - lint / test は通ったか？
   - 想定の 2 倍のターン数がかかった場合は、チェックポイントを書き、ユーザーへ通知します。
4. **継続**：ゲートを通過したら次のスプリントへ進みます。

**例：**「JWT 認証 + CRUD API + テスト」というタスクは次のように分解します。

- スプリント 1：ユーザーモデル + 認証エンドポイント（register / login）
- スプリント 2：CRUD エンドポイント + バリデーション
- スプリント 3：テスト + エラーハンドリング

**難易度の判断を誤った場合の復旧：** Simple で始めたタスクが複雑だと分かったら、実行中に Medium または Complex プロトコルへ切り替え、その変更を進捗に記録します。

---

## コンテキストリセットプロトコル

長時間動作するエージェントは、コンテキストが埋まるにつれて品質が低下します。エージェント自身ではなく、オーケストレータがこの状態を監視してリセットを開始します。

**トリガー条件（オーケストレータが監視中に確認）：**

| 条件 | 検出 | アクション |
|-----------|-----------|--------|
| ターン予算の枯渇 | 想定ターン数の 80%以上を消費し、受入基準の達成が 50% 未満 | コンテキストをリセット |
| 進捗の停止 | 3 回以上連続した監視サイクルで進捗ファイルが更新されない | コンテキストをリセット |
| 浅い出力 | 結果ファイルにスタブマーカーまたは TODO プレースホルダーがある | 明示的な指示を付けて再スポーン |

**リセット手順：**

1. **チェックポイント**：完了項目、残りの項目、主要な決定を保存します。
2. **終了**：現在のエージェント実行を停止します。
3. **再スポーン**：チェックポイントをコンテキストとして新しいエージェントを起動します。
4. **再開**：新しいエージェントがチェックポイントを読み、残りの項目だけを続けます。

オーケストレータを使わない単独実行では、`difficulty-guide.md` のスプリントゲートが安全網になります。スプリントが想定の 2 倍のターン数を要したら、エージェントはチェックポイントを書いてユーザーへ通知します。
