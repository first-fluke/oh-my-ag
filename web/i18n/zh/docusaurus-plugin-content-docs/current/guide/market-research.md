---
title: "指南：市场研究（last30days 引擎）"
sidebar_label: 市场研究
description: oh-my-agent 的 oma-market 技能如何在上游 mvanhorn/last30days 引擎上运行社区信号研究，并自动保持最新版本；包括市场配置区段、oma market resolve / update / run、detect-trap 门禁、从意图到框架的映射以及失败模式。
---

# 市场研究

`oma-market` 回答“过去 N 天里，人们实际上在说什么”这类关于 X 的问题，覆盖痛点、趋势、竞品情绪和发现，并从社区来源收集真实互动数据：Reddit（赞数和热门评论）、X、YouTube 转录、TikTok、Instagram、Hacker News、Polymarket、GitHub、arXiv、Techmeme、Digg、LinkedIn、StockTwits、Bluesky、Web 等。

研究本身运行在上游 [**last30days**](https://github.com/mvanhorn/last30days-skill) 引擎上（MIT，Python 3.12+）。oh-my-agent 不会 fork 它，而是维护**始终最新的受管副本**，为每次运行设置门禁，并在上层加入战略框架。发布节奏、星标数和供应商覆盖范围属于上游项目，可能发生变化。

---

## 始终使用最新引擎，无需安装

```bash
# Illustrative output; the release tag, cache path, and Python version vary.
oma market resolve
# engine:   last30days
# reason:   last30days 3.21.1 via managed:v3.21.1 (current)
# root:     ~/.cache/oma-market/last30days/v3.21.1
# skill:    ~/.cache/oma-market/last30days/v3.21.1/SKILL.md
# python:   python3.14 (3.14.7, PATH)
# save_dir: <workspace>/.agents/results/market/raw
```

- 缓存：`~/.cache/oma-market/last30days/<tag>/` 和 `state.json`。
- 每次使用前，`resolve` 会向 GitHub 请求最新发布版本（检查频率受 `check_interval_min` 控制，默认每 60 分钟一次），将更新标签下载到专用目录（清理旧标签），否则复用缓存。网络失败时复用缓存副本，并报告 `stale`。
- Python 解析顺序为 `LAST30DAYS_PYTHON` → `market.python` → PATH 中的 `python3.14 … python3`（必须 ≥ 3.12）→ `uv python find '>=3.12'`。找不到时，`resolve` 不通过并打印安装提示；技能停止，不会退回到仅 Web 搜索的研究。
- 引擎配置和 API key 位于 `~/.config/last30days/`（由上游设置向导在征得你同意后写入），因此引擎升级后仍会保留。

解析顺序如下，命中第一项即停止：`market.path` → `LAST30DAYS_HOME` → **受管最新版本** → 用户安装的副本（项目内及 `~` 下 `.agents|.claude|.codex|.cursor|.qwen|.kiro/skills/last30days`，然后是 Claude Code 插件缓存）。

```bash
oma market update            # force a check / download now
oma market resolve --offline # never touch the network
oma market run --help        # the engine's own flags
```

---

## 配置

```yaml
market:
  managed: true                   # false = never download; pins / skill dirs only
  channel: stable                 # stable (latest Release) | main (HEAD)
  check_interval_min: 60          # 0 = check on every call
  path: null                      # explicit engine dir (pin)
  python: null                    # interpreter override
  save_dir: .agents/results/market/raw
```

---

## 运行方式

1. `oma market detect-trap "<topic>"`，拒绝关键词陷阱和人口统计购物类主题（退出码 2），并给出重新表述建议。
2. `oma market resolve --json`，解析引擎和 Python；`ok: false` 时停止。
3. 智能体从头到尾读取解析出的引擎 `SKILL.md` 并遵循其中步骤：首次运行设置向导、研究前解析账号、子版块和标签（WebSearch 可用时）、查询规划以及前置条件门禁。
4. `oma market run "<topic>" <flags> --emit=compact`，参数与上游 `python3 scripts/last30days.py` 调用相同；从 `market.save_dir` 添加 `--save-dir`。
5. 综合遵循上游 OUTPUT CONTRACT（首行徽章、按排名排列的证据集群、LAWs 1 至 8），然后由 oma 添加只引用引擎集群的框架部分：

| 意图 | 引擎调整 | 框架 |
|---|---|---|
| pain | 投诉型主题，`--days 30`；结果过少时使用 `--deep` | SWOT |
| trend | `--days 7/30/90/180`；询问“最近什么热门”时使用 `--discover "<domain>"` | SWOT |
| competitor | `"A vs B"` → 上游比较流程 | SWOT + Porter 的 5F |
| discovery | `--discover`，然后进行 `--drill` 跟进 | SWOT + PESTEL |

6. 自检，然后写入 `.agents/results/market/{topic-slug}-{YYYYMMDD}.md`。

---

## 失败模式

| 情况 | 结果 |
|---|---|
| 主题被 detect-trap 拒绝 | 显示重新表述建议，不运行引擎。只有明确重新确认后才能使用 `--force` |
| 离线且没有缓存引擎 | `ok: false`，联网后运行一次 `oma market update` |
| 没有 Python 3.12+ | `ok: false` 并显示安装提示（brew / apt / `uv python install 3.12`），不提供仅 Web 搜索的替代方案 |
| 发布检查失败 | 使用缓存引擎，并报告 `stale` |
| 来源没有 key | 引擎内部跳过这些来源，并在页脚列出；通过上游设置向导启用 |

---

## 相关内容

- [图表引擎](/docs/guide/diagram-engine)，同样使用受管最新模式的 archify
- [oma-config.yaml 语义](/docs/guide/oma-config-semantics)
- 上游：[mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)
