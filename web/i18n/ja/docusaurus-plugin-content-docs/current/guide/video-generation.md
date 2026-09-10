---
title: "ガイド：動画生成"
sidebar_label: 動画生成
description: oh-my-agent の動画生成を詳しく説明します。キーがなくても使える 3 層ルーターで、shorts、explainer、demo の各モードにおいて、スクリプト、ナレーション、映像、字幕、同梱 Remotion コンポジターを再現可能な実行ディレクトリへまとめます。
---

# 動画生成

`oma-video` は oh-my-agent の動画ルーターです。1 行の brief からスクリプト、ナレーション、映像、字幕をまとめ、計画を実行ディレクトリに記録します。プロバイダーの各段階はキーなしでも使え、ローカルまたは決定的なフォールバックを利用できます。ただし、実際の MP4 には動作するコンポジターと有効なコンポジションが必要です。

このスキルは *video*、*shorts*、*reels*、*explainer*、*demo*、*walkthrough*、*screencast* などのキーワード、または別のスキルが副作用として動画を必要とした場合に自動起動します。

---

## 使う場合

- brief、README、コード、データを短いクリップにする
- ナレーション付き解説やデモ／ウォークスルーの録画を作る
- 再実行するための再現可能な「brief → `.mp4`」パイプライン

## 使わない場合

- 静止画 1 枚 → [`oma-image`](/docs/guide/image-generation)
- 画面のライブ配信／ストリーミング → 対象外（capture は監督下で行い、配信しません）
- ナレーション音声だけ → `oma-voice`

## モード一覧

| モード | アスペクト比 | まとめる内容 |
|------|--------|------------------|
| `shorts` | 9:16 | 短い縦型クリップ（スクリプト → ナレーション → 映像 → 字幕）。 |
| `explainer` | 16:9 | README、コード、データの brief から作る横型解説。 |
| `demo` | derived | `--capture` で渡した人間の録画から作るウォークスルー。`--source web --url` は画面を表示したブラウザーでの監督下キャプチャーに文脈を渡しますが、ログインを自動化しません。 |

モードが適切なデフォルトを選びます。別の値が必要なときだけ関連フラグを渡します。

## クイックスタート

```bash
# Key-optional short — script, captions, and a local render when the toolchain is ready
oma video generate "three quick tips for better focus" --mode shorts -y

# 16:9 explainer in Korean
oma video generate "what oh-my-agent does" --mode explainer --aspect 16:9 --locale ko -y

# Demo from a human recording (you control login and capture)
oma video generate "product walkthrough" --mode demo --capture ./capture.mp4 --polish
```

各実行は実行ディレクトリを表示します。固定した `--seed` は決定的な計画入力を安定させますが、ライブのプロバイダー出力とキャプチャー映像は変わることがあります。保存済みのレンダー仕様とアセットを再利用したい場合は、既存の実行ディレクトリを再レンダーします。

`oma video generate --output json` をシェルから呼ぶ他のツールは、標準出力の JSON エンベロープ `{exitCode, runDir, manifestPath, scriptPath, renderSpecPath, warnings, error}` を解析します。`outputs` キーはありません。出力とアセットのパスは `manifestPath` のマニフェストから読みます。

---

## CLI リファレンス

```
oma video generate <brief...> [options]
oma video doctor [--install|--upgrade|--install-mpt|--install-strudel]  # toolchain readiness / provisioning
oma video render <runDir>        # re-render from render-spec.json (deterministic)
oma video provider list         # provider availability + key/fallback status
```

### 主なフラグ

| フラグ | 用途 |
|------|---------|
| `--mode <m>` | `shorts` \| `explainer` \| `demo`。 |
| `--aspect <a>` | `9:16` \| `16:9` \| `1:1` \| `auto`。 |
| `--locale <lang>` | ナレーション／字幕の言語タグ。 |
| `--captions <s>` | `tiktok` \| `lower-third` \| `none`（キーなしの整列）。 |
| `--visual <m>` | `auto` \| `generate` \| `stock` \| `aigc` \| `slide`。 |
| `--voice <profile>` | ナレーション音声。`none`（デフォルト）を指定するか、フラグを省略すると、推定した字幕タイミングで音声なしの動画をレンダーします。 |
| `--music <mode>` | `upbeat`、`calm`、`cinematic`、`lofi`、`piano`、または `none`。 |
| `--compositor <c>` | `remotion`（デフォルト） \| `mpt`。 |
| `--capture <path>` | demo モードの入力録画パス（`--source file`）。 |
| `--source <k>` | demo のキャプチャー元。`file` または `web`（デフォルトは `file`）。 |
| `--url <url>` | `--source web` の対象 URL（ローカル、ステージング、または本番）。録画が必要なとき、`--capture` の代わりにはなりません。 |
| `--device <name>` | Web キャプチャーのデバイス枠。アスペクトサイズを上書きします。 |
| `--ready-selector <css>` | Web キャプチャー前に待つ CSS セレクター。 |
| `--show-cursor` | Web キャプチャーに表示カーソルを重ねます。 |
| `--polish` | キャプチャーした映像に Remotion コンポジションを重ねます。 |
| `--capture-timeout <sec>` | ライブ Web キャプチャーの上限時間。 |
| `--capture-stop <mode>` | CI 用の非対話式停止。`duration:<sec>` または `selector:<css>`。 |
| `--output-dir <path>` | 出力の基底ディレクトリ。`$PWD` 外のパスには `--allow-external-output` が必要です。 |
| `--allow-external-output` | `$PWD` 外の出力パスを許可します。 |
| `--max-usd <n>` | 確認前の推定コスト上限。 |
| `--duration <sec>` | 目標の長さ、または `auto`。 |
| `--seed <n>` | 決定的な seed。 |
| `--dry-run` | スクリプト、render-spec、マニフェストを出力し、レンダーを省略します。 |
| `--script <path>` | エージェントが作成した注入用の `script.json`（骨格を上書きし、ナレーション、画面上のテキスト、シーンごとの映像プロンプトを制御）。 |
| `-y, --yes` | コスト確認を省略します。 |
| `--output <f>` | CLI の出力は `text`（デフォルト）または `json`。 |
| `--no-brief-in-manifest` | brief の生値の代わりに SHA-256 をマニフェストへ保存します。 |

---

## キーなしで使えるプロバイダー

プロバイダーの段階は **実際の分岐**に解決され、段階が対応している場合は**決定的なフォールバック**も使います。そのため、キーがない場合も推定タイミングやローカルアセットを持つ計画済みの実行を残せます。コンポジターは必須の最終段階で、通常のプレースホルダーフォールバックはありません。

| 機能 | 実際の分岐 | フォールバック |
|------------|-------------|----------|
| script | キーがある場合は LLM | brief から決定的なアウトライン |
| voice | `oma-voice`（Voicebox、ローカル） | 推定タイミング、音声なし |
| visual | `oma-image` / `oma-slide` / stock | プレースホルダーアセット |
| caption | キーなしの強制アラインメント | 単語の推定タイミング |
| capture | 監督下のブラウザー Web capture（`--source web`）または指定した録画（`--source file --capture`） | 「自分で録画する」ガイド付き手順 |
| compositor | Remotion（同梱）または MoneyPrinterTurbo | コンポジターのフォールバックなし。実行は診断付きで失敗します |

認証情報の自動化はありません。キャプチャー中の画面ログインは人が行います。URL とクエリトークンはログとマニフェストでマスクされます。

字幕は **静的なウィンドウ形式のキュー**としてレンダーされます。現在のフレームで有効な 1 行の字幕を CSS で折り返し、単語ごとのアニメーションは行いません。

## ツールチェーンと `doctor`

重いツールチェーン（同梱された Remotion プロジェクトの `node_modules`、埋め込み Pretendard フォント、MoneyPrinterTurbo のチェックアウト、キャプチャーブラウザー、Chrome Headless Shell）は**必要なときに準備され**、パッケージには含まれません。通常の `doctor` はレポートだけを行い、インストールはしません。

```bash
oma video doctor
```

`node`、`chromium`、`ffmpeg`、`remotion-toolchain`、`remotion-skills`、`pretendard-font`、`mpt-project`、`voicebox`、`oma-image`、`pixelle`、`cap` を報告し、不足しているもののインストール方法を表示します。キーなしの基準（Node + Chromium + FFmpeg + `oma-image`）で、実際の `.mp4` を作成できます。

ツールチェーンを準備するにはインストールフラグを使います。

```bash
oma video doctor --install             # warm the latest Remotion toolchain + Chrome Headless Shell + Pretendard + remotion-dev/skills
oma video doctor --upgrade             # force a latest-version check now
oma video doctor --install-mpt         # MoneyPrinterTurbo checkout (clone + venv + deps) for --compositor mpt
```

`--install` は埋め込み Pretendard フォント（固定リリース）も同梱プロジェクトへ取得します。これは再現性の境界に含まれます。ネットワークに失敗した場合は警告し、レンダーはシステムフォントへフォールバックします。マシン間でバイト単位に同じ出力が保証されるのはフォントが存在するときだけです。

## 出力レイアウト

```
.agents/results/videos/{timestamp}-{shortid}-{mode}/
├── script.json          # scenes + narration
├── render-spec.json     # the deterministic render contract
├── timing.json          # per-segment timing (voicebox-stt or estimated)
├── captions.srt / .vtt
├── audio/narration-*.wav
├── visuals/scene-*.{png,svg,…}
├── {mode}-{slug}.mp4    # the rendered output (slug derived from the script title)
└── manifest.json        # providers, assets, cost, warnings
```

`render-spec.json` とアセットが再現性の境界です。ライブキャプチャーはマニフェストで `nondeterministic` と記録されます。

## トラブルシューティング

| 症状 | 原因／修正 |
|---------|-------------|
| MP4 が生成されない | コンポジター、コンポジション、ツールチェーンのチェックが失敗しました。`oma video doctor`、次に `oma video compose <runDir>` を実行し、報告されたコンポジションを直してから `oma video render <runDir>` を再実行します。 |
| ナレーションが無音（`source: estimated`） | Voicebox に接続できません。`oma-voice` サーバーを起動するか、推定タイミングを受け入れます。 |
| `--source web` が録画の代わりにガイド付き手順を表示する | TTY がないか、ブラウザーのキャプチャーランタイムを利用できません。準備済みのキャプチャーランタイムと `--capture-stop` を使った対話式ターミナルを使うか、録画ファイルを `--capture` で渡します。 |
| 初回レンダーが遅い | Remotion ブラウザー／MPT のチェックアウトを一度準備しています。以降の実行ではキャッシュを再利用します。 |

## 常に最新の Remotion。コンポジションは自分で作成する

oh-my-agent に Remotion のコンポジションコードは**含まれていません**。各実行は `<runDir>/remotion/` に専用プロジェクトを持ち、最新 npm Remotion を使って `oma video compose` が雛形を生成します。ツールチェーンのキャッシュは `~/.cache/oma-video/remotion/<version>/` にあり、`node_modules` のシンボリックリンクで共有されます。[remotion-dev/skills](https://github.com/remotion-dev/skills) は HEAD（`~/.cache/oma-video/remotion-skills/`）にあります。エージェントは、生成された雛形の `AUTHORING.md`、スキル、`.agents/skills/oma-video/resources/remotion-authoring/` のモード仕様に従って生成コンポジションのソースを作成します。

```bash
oma video generate "…"                     # → render-spec.json + <runDir>/remotion/ (composition pending)
oma video compose <runDir> --output json   # refresh scaffold / print the contract (idempotent)
#   author the generated composition source as instructed by AUTHORING.md
oma video render <runDir> --output json    # tsc → npx remotion render → ffprobe; exit 1 on any failure
```

- 最新版の確認（npm + GitHub）は `video.remotion.check_interval_min`（デフォルト 60、`0` なら compose ごと）で間引かれます。`oma update` と `oma video doctor --upgrade` は確認を強制します。オフライン実行ではキャッシュしたツールチェーンを使い、`stale` と報告します。
- 再現性は実行ディレクトリにあります。`render-spec.json`、作成したコンポジションのソース、生成された Remotion パッケージメタデータに記録されたツールチェーンのバージョンが境界です。同じ実行を再レンダーすると同じレンダー契約を再利用し、新しい実行では最新 Remotion を確認します。
- 型チェックやレンダーの失敗はプレースホルダーで隠されません（それが存在するのは `OMA_VIDEO_MOCK=1` の場合だけです）。`oma video render` は診断付きで終了コード 1 を返し、エージェントは最新スキルを使ってコンポジションを修正します。新しい Remotion リリースでの破損はコンポジションのバグであり、固定する理由にはなりません。

```yaml
video:
  remotion:
    check_interval_min: 60    # 0 = check on every compose
```

## 関連項目

- [`/video` ワークフロー](/docs/core-concepts/workflows)。brief → script → assets → render-spec → Remotion のパイプラインです。
- [画像生成](/docs/guide/image-generation)。動画の visual プロバイダーとして再利用される静止画ルーターです。
