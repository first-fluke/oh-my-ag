---
title: "ガイド：画像生成"
sidebar_label: 画像生成
description: oh-my-agentで画像を生成するための完全ガイドです。Codex（gpt-image-2）、Pollinations（flux/zimage、無料）、Gemini Code Assist経由のAntigravityによるマルチベンダーディスパッチ、リファレンス画像、コストガードレール、出力レイアウト、トラブルシューティング、共有呼び出しパターンを扱います。
---

# 画像生成

`oma-image`はoh-my-agentのマルチベンダー画像ルーターです。自然言語のプロンプトから画像を生成し、認証済みのベンダーCLIへディスパッチして、実行の監査や再実行に必要な入力とプロバイダーの選択を出力の隣にマニフェストとして書き出します。ライブプロバイダーの出力は変わる場合があります。

このスキルは、*image*、*illustration*、*visual asset*、*concept art*などのキーワードや、別のスキルが副作用として画像を必要とする場合（ヒーローショット、サムネイル、商品写真）に自動アクティベートされます。

---

## 使うタイミング

- 画像、イラスト、商品写真、コンセプトアート、ヒーローまたはランディング向けビジュアルを生成する
- 同じプロンプトを複数モデルで横並びに比較する（`--vendor all`）
- エディターワークフロー（Claude Code、Codex、Gemini CLI）の中でアセットを作成する
- 別のスキル（design、marketing、docs）から共有インフラとして画像パイプラインを呼び出す

## 使わないタイミング

- 既存画像を編集またはレタッチする（スコープ外のため、専用ツールを使う）
- 動画や音声を生成する（スコープ外）
- 構造化データからインラインSVGまたはベクターを合成する（テンプレートスキルを使う）
- 単純なリサイズまたは形式変換を行う（生成パイプラインではなく画像ライブラリを使う）

---

## ベンダーの概要

このスキルはCLIファーストです。ベンダーのネイティブCLIが画像のrawバイトを返せる場合は、直接APIキーを使うよりサブプロセス経路を優先します。

| ベンダー | 戦略 | モデル | トリガー | コスト |
|---|---|---|---|---|
| `pollinations` | Direct HTTP | 無料：`flux`、`zimage`。クレジット制：`qwen-image`、`wan-image`、`gpt-image-2`、`klein`、`kontext`、`gptimage`、`gptimage-large` | `POLLINATIONS_API_KEY`を設定（無料登録：https://enter.pollinations.ai） | `flux` / `zimage`は無料 |
| `codex` | `codex exec`経由のCLIファースト（ChatGPT OAuth） | `gpt-image-2` | `codex login`（APIキー不要） | ChatGPTプランに課金 |
| `antigravity` | Gemini Code Assistサブスクリプション上の`agy` CLI | モデルは`agy`が内部で選択 | `agy`をインストールしてサインイン | Code Assist経由の画像ごとの追加料金なし |

組み込みのベンダーモードは`auto`です。ヘルスチェックに合格したプロバイダーを実行します。Pollinationsの`flux`と`zimage`は画像ごとに無料ですが、`POLLINATIONS_API_KEY`が必要です。CodexとAntigravityにはそれぞれのサインインが必要です。有料の見積もりにはコスト確認ガードレールが適用されます。

---

## クイックスタート

最初に生成する前に、どのプロバイダーを利用できるか確認し、対応する方法のいずれかで認証します。

```bash
oma image doctor

# Pollinations: create a free account and export its key.
export POLLINATIONS_API_KEY="<pollinations-key>"

# Or authenticate an alternative provider instead.
codex login
# Sign in to Gemini Code Assist for `agy` when using --vendor antigravity.
```

```bash
# Auto-selects the healthy provider; cost and auth depend on that provider.
oma image generate "minimalist sunrise over mountains"

# Run all configured vendors; every selected vendor must be healthy or the command stops.
oma image generate "cat astronaut" --vendor all

# Specific vendor + size + count, skip cost prompt
oma image generate "logo concept" --vendor codex --size 1024x1024 -n 3 -y

# Cost estimate without spending
oma image generate "test prompt" --dry-run

# Inspect authentication and install status per vendor
oma image doctor

# List registered vendors and supported models
oma image vendor list
```

`oma img`は`oma image`のエイリアスです。

---

## スキルとして使う

`oma-image`は自然言語で自動アクティベートされるスキルですが、明示的に呼び出すこともできます。エントリーポイントは3つあります。

### 1. 自然言語（自動アクティベーション）

Claude Code、Codex CLI、Gemini CLIの中で画像を説明するだけで構いません。*image*、*illustration*、*visual asset*、*concept art*、*hero shot*、*thumbnail*、*product photo*などのキーワードにマッチします。

CLIフラグを覚える必要はありません。自然な言葉で伝えると、スキルが適切なオプションへ変換します。

| ユーザーの発話 | スキルが推測するフラグ |
|---|---|
| 「Codex を使う」 / 「gpt-image-2 を使う」 / 「無料の flux」 | `--vendor codex` / `--vendor pollinations` |
| 「ベンダー間で比較」 / 「並べて比較」 | `--vendor all` |
| 「縦長」 / 「横長」 / 「1024×1536」 | `--size 1024x1536` / `--size 1536x1024` |
| 「高品質」 / 「下書き」 | `--quality high` / `--quality low` |
| 「3 種類のバリエーション」 / 「3 つ」 | `-n 3` |
| 「./hero に保存」 / 「docs/assets に出力」 | `--output-dir <dir>` |
| 添付画像 + 「夜にして」 | `-r <attached path>` |
| 「コストだけ見積もる」 / 「dry run」 | `--dry-run` |

例：

> 「ランディングページのヒーロー用に、山々の上に昇るミニマルな朝日を、横長・高品質で生成して。」
> 「セラミックマグの商品写真をすべてのベンダーで比較して。各3バリエーション。」
> 「このカワウソの写真を、Codexでドラマチックな夜の雰囲気にして。」（リファレンス画像を添付）

エージェントは[クラリフィケーションプロトコル](#clarification-protocol)を実行し、必要に応じてプロンプトを増幅してから、推測したフラグで`oma image generate`を呼び出します。正確なフラグ値を指定したい場合はスラッシュコマンドを使います。

### 2. 明示的なスラッシュコマンド

```text
/oma-image a red apple on white background
/oma-image --vendor all --size 1536x1024 jeju coastline at sunset
/oma-image -n 3 --quality high --output-dir ./hero "minimalist dashboard hero illustration"
```

`--vendor`、`-n`、`--size`、`-r`、`--dry-run`、`…`を含むすべてのCLIフラグがスラッシュコマンドで機能し、同じ`oma image generate`パイプラインへ転送されます。

### 3. 別のスキルから（共有インフラ）

別のスキル（design、marketing、docs）は、JSON出力で共有インフラとしてパイプラインを呼び出します。

```bash
oma image generate "<prompt>" --output json
```

標準出力に書き出されるマニフェストには出力パス、ベンダー、モデル、コストが含まれるため、解析して次の処理へ渡せます。

---

## CLIリファレンス

```bash
oma image generate "<prompt>"
  [--vendor auto|codex|pollinations|antigravity|all]
  [-n 1..5]
  [--size 1024x1024|1024x1536|1536x1024|auto]
  [--quality low|medium|high|auto]
  [--output-dir <dir>] [--allow-external-output]
  [-r <path>]...
  [--timeout 180] [-y] [--no-prompt-in-manifest]
  [--dry-run] [--output text|json]

oma image doctor
oma image vendor list
```

### 主なフラグ

| フラグ | 用途 |
|---|---|
| `--vendor <name>` | `auto`、`pollinations`、`codex`、`antigravity`、`all`のいずれか。`all`では、要求したすべてのベンダーが正常である必要があります（strict）。 |
| `-n, --count <n>` | ベンダーごとの画像枚数。1〜5（実時間の上限）。 |
| `--size <size>` | アスペクト比：`1024x1024`（正方形）、`1024x1536`（縦長）、`1536x1024`（横長）、`auto`。 |
| `--quality <level>` | `low`、`medium`、`high`、`auto`（ベンダーのデフォルト）のいずれか。 |
| `--output-dir <dir>` | 出力ディレクトリ。デフォルトは`.agents/results/images/{timestamp}/`です。`$PWD`外のパスには`--allow-external-output`が必要です。 |
| `--allow-external-output` | `$PWD`外の出力ディレクトリを許可します。 |
| `--model <name>` | この実行で選択したベンダーのモデルを上書きします。`antigravity`は`agy`がモデルを選ぶため無視します。 |
| `-r, --reference <path>` | 最大10枚のリファレンス画像（PNG/JPEG/GIF/WebP、各5MB以下）。繰り返し指定またはカンマ区切りで指定できます。`codex`と`antigravity`で対応し、`pollinations`では拒否されます。 |
| `-y, --yes` | `$0.20`以上と見積もられる実行で、コスト確認プロンプトをスキップします。`OMA_IMAGE_YES=1`でも指定できます。 |
| `--no-prompt-in-manifest` | `manifest.json`にプロンプトの生テキストではなくSHA-256を保存します。 |
| `--dry-run` | 実費を発生させず、計画とコスト見積もりを表示します。 |
| `--output text\|json` | CLIの出力形式。JSONは他のスキルとの統合インターフェースです。 |
| `--timeout <duration>` | 画像ごとのタイムアウトです。 |

---

## リファレンス画像

スタイル、被写体の同一性、構図を指定するために、最大10枚のリファレンス画像を添付できます。

```bash
oma image generate -r ~/Downloads/otter.jpeg "same otter in dramatic lighting" --vendor codex
oma image generate -r a.png -r b.png "blend these styles" --vendor antigravity
oma image generate -r a.png,b.png "blend these styles" --vendor antigravity
```

| ベンダー | リファレンス対応 | 方法 |
|---|---|---|
| `codex` (gpt-image-2) | 対応 | `codex exec`に`-i <path>`を渡す |
| `antigravity` | 対応 | リファレンスを実行ごとのディレクトリにコピーし、`agy`にアクセス権を付与する |
| `pollinations` | 非対応 | 終了コード4で拒否（URLホスティングが必要） |

### 添付画像の保存場所

- **Claude Code**：`~/.claude/image-cache/<session>/N.png`。システムメッセージに`[Image: source: <path>]`として表示されます。セッション単位の場所なので、後で再利用する場合は永続的な場所へコピーします。
- **Antigravity**：ワークスペースのアップロードディレクトリ（IDEに正確なパスが表示されます）
- **ホストとしてのCodex CLI**：明示的に渡す必要があります。会話内の添付ファイルは転送されません。

ユーザーが画像を添付し、それを基に生成または編集するよう依頼した場合、呼び出し元のエージェントは散文で説明せず、`--reference <path>`で転送しなければなりません。ローカルCLIが`--reference`に対応していない場合は、`oma update`を実行して再試行します。

---

## 出力レイアウト

すべての実行は、タイムスタンプとハッシュの接尾辞を付けたディレクトリとして`.agents/results/images/`に書き出されます。

```
.agents/results/images/
├── 20260424-143052-ab12cd/                 # single-vendor run
│   ├── pollinations-flux.jpg
│   └── manifest.json
└── 20260424-143122-7z9kqw-compare/         # --vendor all run
    ├── codex-gpt-image-2.png
    ├── pollinations-flux.jpg
    └── manifest.json
```

`manifest.json`にはベンダー、モデル、プロンプト（またはそのSHA-256）、サイズ、品質、コストが記録されるため、リクエストを監査して再実行できます。ライブプロバイダーが返すピクセルを同一にするものではありません。

---

## コスト、安全性、キャンセル

1. **コストガードレール：** `$0.20`以上と見積もられる実行では確認を求めます。`-y`または`OMA_IMAGE_YES=1`で省略できます。デフォルトの`pollinations`（flux/zimage）は無料なので、自動的に確認を省略します。
2. **パスの安全性：** `$PWD`外の出力パスには、予期しない書き込みを防ぐため`--allow-external-output`が必要です。
3. **キャンセル可能：** `Ctrl+C`（SIGINT/SIGTERM）で、実行中のすべてのプロバイダー呼び出しとオーケストレーターを中止します。
4. **安定した実行記録：** `manifest.json`は常に画像の隣に書き込まれます。
5. **最大`n` = 5：** クォータではなく、経過時間の上限です。
6. **終了コード：** `oma search fetch`と同じです。`0`はok、`1`はgeneral、`2`はsafety、`3`はnot-found、`4`はinvalid-input、`5`はauth-required、`6`はtimeoutです。

---

## クラリフィケーションプロトコル {#clarification-protocol}

`oma image generate`を呼び出す前に、呼び出し元のエージェントはこのチェックリストを実行します。欠落していて推測できない項目があれば、先に質問するか、プロンプトを増幅して拡張案を示し、承認を得ます。

**必須：**
- **被写体：** 画像の主な対象は何か（物体、人物、シーン）
- **設定または背景：** どこにあるか

**強く推奨（欠落していて推測できない場合は質問）：**
- **スタイル：** フォトリアル、イラスト、3Dレンダー、油絵、コンセプトアート、フラットベクターのどれか
- **ムードまたはライティング：** 明るいかムーディーか、暖色か寒色か、ドラマチックかミニマルか
- **利用コンテキスト：** ヒーロー画像、アイコン、サムネイル、商品ショット、ポスターのどれか
- **アスペクト比：** 正方形、縦長、横長のどれか

*"赤いリンゴ"*のような短いプロンプトでは、エージェントは追加質問を**しません**。代わりにインラインで増幅し、次のようにユーザーへ示します。

> ユーザー："赤いリンゴ"
> エージェント：「次のように生成します： *a single glossy red apple centered on a clean white background, soft studio lighting, photorealistic, shallow depth of field, 1024×1024*. このまま進めますか。それとも別のスタイルや構図にしますか。」

ユーザーが完全なクリエイティブブリーフ（被写体、スタイル、ライティング、構図のうち2つ以上）を作成している場合は、プロンプトをそのまま尊重し、明確化も増幅もしません。

**出力言語：** 生成プロンプトは英語でプロバイダーへ送信します（画像モデルは主に英語のキャプションで学習されているため）。ユーザーが別の言語で書いた場合は、エージェントが翻訳し、増幅時に翻訳結果を示してユーザーが誤読を訂正できるようにします。

---

## 設定

- **プロジェクト設定：** `.agents/oma-config.yaml`の`image:`セクション。従来の`config/image-config.yaml`はもう読み込まれません。
- **環境変数：**
  - `OMA_IMAGE_DEFAULT_VENDOR`：デフォルトベンダーを上書きします（指定がなければ`pollinations`）
  - `OMA_IMAGE_DEFAULT_OUT`：デフォルト出力ディレクトリを上書きします
  - `OMA_IMAGE_YES`：`1`でコスト確認をバイパスします
  - `POLLINATIONS_API_KEY`：pollinationsベンダーで必須です（無料登録）

---

## トラブルシューティング

| 症状 | 想定原因 | 対処 |
|---|---|---|
| 終了コード`5`（auth-required） | 選択したベンダーが認証されていない | `oma image doctor`でログインが必要なベンダーを確認します。その後、`codex login`、`agy`へのサインイン、または`POLLINATIONS_API_KEY`の設定を行います。 |
| `--reference`で終了コード`4` | `pollinations`がリファレンスを拒否した、またはファイルが大きすぎるか形式が正しくない | `--vendor codex`または`--vendor antigravity`に切り替えます。各リファレンスは5MB以下で、PNG/JPEG/GIF/WebPである必要があります。 |
| `--reference`が認識されない | ローカルCLIが古い | `oma update`を実行して再試行します。散文による説明にフォールバックしないでください。 |
| コスト確認が自動化を止める | 実行見積もりが`$0.20`以上 | `-y`を渡すか`OMA_IMAGE_YES=1`を設定します。無料の`pollinations`に切り替える方法もあります。 |
| `--vendor all`がすぐに中止される | 要求したベンダーの1つが正常でない（strictモード） | 不足しているベンダーをインストールまたはサインインするか、特定の`--vendor`を選択します。 |
| 出力が予期しないディレクトリに書き込まれる | デフォルトが`.agents/results/images/{timestamp}/`である | `--output-dir <dir>`を渡します。`$PWD`外のパスには`--allow-external-output`が必要です。 |
| Antigravityがヘルスチェック後に失敗する | `agy --version`はインストールを証明するだけで、サインインは確認しない | Gemini Code Assistにサインインしてから、`oma image doctor`と`--vendor antigravity`で再試行します。 |

---

## 関連

- [スキル](/docs/core-concepts/skills)：`oma-image`を動かす2層スキルアーキテクチャ
- [CLIコマンド](/docs/cli-interfaces/commands)：`oma image`コマンドの完全なリファレンス
- [CLIオプション](/docs/cli-interfaces/options)：グローバルオプションの一覧
