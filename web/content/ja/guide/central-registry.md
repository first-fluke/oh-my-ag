---
title: マルチリポジトリ構成のセントラルレジストリ
description: このリポジトリをバージョン管理されたセントラルレジストリとして運用し、PR ベースの更新でコンシューマープロジェクトを安全に同期する方法。
---

# マルチリポジトリ構成のセントラルレジストリ

このリポジトリは、複数のコンシューマーリポジトリがバージョン管理された更新に揃うよう、エージェントスキルの**セントラルレジストリ**として機能できます。

## アーキテクチャ

```text
┌─────────────────────────────────────────────────────────┐
│  セントラルレジストリ（このリポジトリ）                      │
│  • release-please による自動バージョニング                  │
│  • CHANGELOG.md の自動生成                                │
│  • prompt-manifest.json（バージョン/ファイル/チェックサム）  │
│  • agent-skills.tar.gz リリースアーティファクト             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  コンシューマーリポジトリ                                   │
│  • .agent-registry.yaml によるバージョンピニング            │
│  • 新バージョン検出 → PR（自動マージなし）                  │
│  • ファイル同期用の再利用可能な Action                      │
└─────────────────────────────────────────────────────────┘
```

## レジストリメンテナー向け

リリースは [release-please](https://github.com/googleapis/release-please) により自動化されています:

1. Conventional Commits を使用します（`feat:`、`fix:`、`chore:`、...）。
2. `main` にプッシュしてリリース PR を作成/更新します。
3. リリース PR をマージして GitHub Release アセットを公開します:
   - `CHANGELOG.md`（自動生成）
   - `prompt-manifest.json`（ファイルリスト + SHA256 チェックサム）
   - `agent-skills.tar.gz`（圧縮された `.agent/` ディレクトリ）

## コンシューマープロジェクト向け

`docs/consumer-templates/` からテンプレートをプロジェクトにコピーします:

```bash
# Configuration file
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# GitHub workflows
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

次に、`.agent-registry.yaml` で目的のバージョンをピニングします:

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

ワークフローの役割:

- `check-registry-updates.yml`: 新しいバージョンを確認し、PR を作成します。
- `sync-agent-registry.yml`: ピニングされたバージョンが変更されたときに `.agent/` を同期します。

**重要**: 自動マージは意図的に無効化されています。すべての更新は手動でレビューしてください。

## 再利用可能な Action の使用

コンシューマーリポジトリは同期アクションを直接呼び出すことができます:

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
