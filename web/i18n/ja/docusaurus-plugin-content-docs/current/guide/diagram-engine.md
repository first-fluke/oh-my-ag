---
title: "ガイド：ダイアグラムエンジン（archify）"
sidebar_label: ダイアグラム
description: oh-my-agent がアーキテクチャ、シーケンス、データフローの図に Mermaid と、任意で使える tt-a1i/archify のエージェントスキルをどう選ぶかを説明します。diagram 設定、oma diagram resolve / oma diagram archify、/architecture と /explain からの利用、検証・修復・配信ループを扱います。
---

# ダイアグラムエンジン

`/architecture`（ADR、推奨事項、レビュー）と `/explain`（コード変更の解説）は、どちらも構造図を出力します。図は常に Markdown アーティファクト内の Mermaid ブロックです。[archify](https://github.com/tt-a1i/archify) を解決できる場合（通常はこちら）は、アーティファクトの隣にインタラクティブで検証済みの HTML 図も出力します。HTML 図にはダーク／ライトテーマ、パンとズーム、検索、関係の追跡、PNG／SVG／WebM エクスポートがあり、型付き JSON 仕様から描画されます。

Mermaid がなくなることはありません。Markdown と git diff に残るテキストの SSOT です。archify は派生アーティファクトです。

---

## 常に最新の archify を使う。インストールは不要

archify は MIT ライセンスのエージェントスキルです（Node ≥ 18、ランタイム依存なし）。oh-my-agent は一度インストールしたコピーに依存せず、**独自の管理コピー**を保持して最新リリースを追跡します。

- キャッシュ: `~/.cache/oma-diagram/archify/<tag>/` と `state.json` ポインター。
- 各回の利用前に `oma diagram resolve` が GitHub に最新リリースタグを問い合わせます。確認は `check_interval_min`（デフォルト 60 分）に従って間引かれます。新しいタグがあればソースの tarball をダウンロードし（タグごとのディレクトリをアトミックに作成し、古いタグを削除）、なければキャッシュを再利用します。
- ネットワーク障害は致命的になりません。キャッシュがあれば、理由とともに `stale` と報告して使います。初回にネットワークもキャッシュもない場合だけ、ユーザーがインストールしたスキルのコピーへフォールバックし、その後 Mermaid にフォールバックします。

```bash
# Illustrative output; the release tag, cache path, and quality can vary.
oma diagram update          # force a check / download now
oma diagram resolve
# engine:   archify  (requested: auto)
# reason:   archify 2.15.0 via managed:v2.15.0 (current)
# root:     /Users/you/.cache/oma-diagram/archify/v2.15.0
# quality:  showcase
oma diagram resolve --offline   # never touch the network
```

解決順序はすべてのベンダーランタイムで同じです（最初に見つかったものを使います）。

1. `oma-config.yaml` の `diagram.archify.path`。明示的な固定値で、自動最新版を使いません
2. `ARCHIFY_HOME` 環境変数。明示的な固定値です
3. **管理される最新版**（`~/.cache/oma-diagram/archify`）
4. ユーザーがインストールしたスキルディレクトリ。プロジェクトの `.agents` / `.claude` / `.codex` / `.cursor` / `.qwen` / `.kiro` の `/skills/archify`、次に `~` の同じ場所、最後に `~/.raven/workspace/skills/archify`

<!-- oma-docs:ignore-start -->
管理または固定された archify のインストールに `bin/archify.mjs` が含まれている場合だけ解決できます。
<!-- oma-docs:ignore-end -->

---

## 設定

`.agents/oma-config.yaml` の最小限の設定項目です（キーを省略すると表示されたデフォルトを使います）。

```yaml
diagram:
  engine: auto                # auto | archify | mermaid
  explain_sidecar: false      # /explain also writes an archify sidecar
  archify:
    managed: true             # false = never download; use pins / skill dirs only
    channel: stable           # stable (latest GitHub Release) | main (HEAD of main)
    check_interval_min: 60    # minutes between remote checks; 0 = every call
    path: null                # explicit install dir (pin)
    quality: showcase         # showcase | standard  → --quality
    open: false               # pass --open to deliver
```

| `engine` | 動作 |
|---|---|
| `auto`（デフォルト） | 解決できれば archify（管理最新版、固定値、スキルディレクトリのいずれか）、それ以外は Mermaid |
| `archify` | archify を必須にします。何も解決できない場合（初回のオフライン実行）は `oma diagram resolve` が終了コード 1 で終了し、ワークフローは黙って格下げしません |
| `mermaid` | archify を呼び出しません |

プロンプトで 1 回の実行だけ設定を上書きできます（`/explain 640 with archify`）。

## CLI

```bash
oma diagram resolve [--engine auto|archify|mermaid] [--refresh] [--offline] [--json]
oma diagram update  [--json]
oma diagram archify <archify args…>
```

`oma diagram archify` は、`ARCHIFY_UPDATE_CHECK_DISABLED=1`（ネットワークなし）で解決された archify 実行ファイルを動かし、終了コードをそのまま返します。そのため、`validate` / `deliver` / `visual-check` の動作は archify のドキュメントどおりです。

```bash
oma diagram archify guide "show the auth request lifecycle" --json
oma diagram archify validate architecture adr-auth.archify.json --quality showcase --json
oma diagram archify deliver  architecture adr-auth.archify.json adr-auth.archify.html --quality showcase --json
oma diagram archify visual-check adr-auth.archify.html --json   # exit 2 = no Chrome, reported as skipped
```

`resolve` の `--json` は `{ ok, requested, engine, quality, open, explainSidecar, archify?: { root, bin, version, source, status?, note? }, reason, probed }` を返します。`source` は `managed:<tag>`、`config:…`、`env:…`、またはスキルディレクトリのラベルです。管理コピーでは `status`（`fresh` / `current` / `stale`）と `note` も設定されます。

## ワークフローからの利用

共有プロトコルは `.agents/skills/_shared/conditional/diagram-engine.md` にあります。2 つのワークフローは同じ順序に従います。

1. `oma diagram resolve --json`
2. Mermaid ブロックを最初に作成します（常に行います）。
3. `engine: archify` の場合は、Mermaid のトポロジーを archify の JSON IR（`architecture` / `sequence` / `dataflow` / `lifecycle` / `workflow`）に変換します。インストール先から対応するスキーマと 1 つの例だけを読みます。
4. `validate` → 修復 → `deliver`。**固定の反復回数上限はありません。** archify の客観的なエラー数が改善している間は修復を続け、2 ラウンド連続で改善しなくなったときにだけ archify 自身の収束ルールで停止します。意味のあるラベルを、通過させるためだけに削除してはいけません。
5. HTML をリンクします。埋め込んではいけません。

### `/architecture`

境界、依存関係、データフローなど、構造上の意思決定だけに使います。Markdown アーティファクトの隣の `.agents/results/architecture/` に出力します。

```
adr-notification-service.md            # Mermaid block + "Interactive:" link
adr-notification-service.archify.json  # frozen spec (kept even on failure)
adr-notification-service.archify.html  # delivered viewer
```

### `/explain`

解説ページ自身のコントラクト（CSS 変数でテーマを切り替える、自己完結した 1 つのファイル）では、別の完全な HTML ドキュメントを埋め込めないため、オプトインです。`diagram.explain_sidecar: true` を設定するか、プロンプトで依頼します。サイドカーの `{date}-{slug}.archify.html` は解説ページの System／Data-Flow 図から派生し、通常の `<a href>` でリンクされます。サイドカーの失敗が解説ページを止めることはありません。

## 失敗時の動作

| 状況 | 結果 |
|---|---|
| 更新確認に失敗（オフライン、レート制限） | キャッシュを使い、理由とともに `stale` と報告します |
| キャッシュ、ネットワーク、スキルディレクトリがなく `engine: auto` | Mermaid だけを使います。レポートは、オンライン時に一度 `oma diagram update` を実行するよう案内します |
| 同じ状況で `engine: archify` | ワークフローは `ok: false` と `oma diagram update` のヒントを返して停止します |
| `validate` が収束しない | Mermaid を配信する図として残します。最後の `.archify.json` は人間向けに残し、診断をそのまま報告します |
| `visual-check` に Chrome がない | `skipped` と報告します。pass にはしません |

## 関連項目

- [コード解説](/docs/guide/code-explainer)。`/explain` ワークフローです。
- [oma-config.yaml のセマンティクス](/docs/guide/oma-config-semantics)
- archify 上流： [tt-a1i/archify](https://github.com/tt-a1i/archify)
