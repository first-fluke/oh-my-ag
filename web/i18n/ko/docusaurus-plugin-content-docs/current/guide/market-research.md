---
title: "가이드: 시장 조사(last30days 엔진)"
sidebar_label: 시장 조사
description: 최신 릴리스를 자동으로 유지하는 upstream mvanhorn/last30days 엔진에서 oma-market 스킬이 커뮤니티 신호 조사를 수행하는 방법을 설명합니다. 시장 설정, oma market resolve / update / run, detect-trap 게이트, 의도와 프레임워크 매핑, 실패 상황을 다룹니다.
---

# 시장 조사 {#market-research}

`oma-market`은 Reddit(업보트와 상위 댓글), X, YouTube 자막, TikTok, Instagram, Hacker News, Polymarket, GitHub, arXiv, Techmeme, Digg, LinkedIn, StockTwits, Bluesky, 웹 등 커뮤니티 소스에서 실제 참여 수치와 함께 “최근 N일 동안 사람들이 X에 대해 실제로 무엇을 말하는가”를 답합니다. 불편 사항, 트렌드, 경쟁사 반응, 발견을 조사할 수 있습니다.

조사는 upstream [**last30days**](https://github.com/mvanhorn/last30days-skill) 엔진(MIT, Python 3.12 이상)에서 실행됩니다. oh-my-agent는 엔진을 포크하지 않습니다. **항상 최신 관리 사본**을 유지하고 모든 실행을 게이트하며 그 위에 전략 프레임워크 계층을 추가합니다. 릴리스 주기, 별 수, 제공자 범위는 upstream 프로젝트에 속하므로 바뀔 수 있습니다.

---

## 항상 최신 엔진 사용, 설치할 필요 없음 {#always-the-latest-engine-nothing-to-install}

```bash
# 출력은 예시입니다. 릴리스 태그, 캐시 경로, Python 버전은 달라질 수 있습니다.
oma market resolve
# engine:   last30days
# reason:   last30days 3.21.1 via managed:v3.21.1 (current)
# root:     ~/.cache/oma-market/last30days/v3.21.1
# skill:    ~/.cache/oma-market/last30days/v3.21.1/SKILL.md
# python:   python3.14 (3.14.7, PATH)
# save_dir: <workspace>/.agents/results/market/raw
```

- 캐시: `~/.cache/oma-market/last30days/<tag>/` 및 `state.json`
- 사용하기 전에 `resolve`가 GitHub에서 최신 릴리스를 확인합니다. 확인은 `check_interval_min`(기본 60분)마다 한 번으로 제한됩니다. 새 태그는 독립 디렉토리에 내려받고 오래된 태그를 정리하며, 그렇지 않으면 캐시를 재사용합니다. 네트워크가 실패하면 캐시를 재사용하고 `stale`로 보고합니다.
- Python 선택 순서: `LAST30DAYS_PYTHON` → `market.python` → PATH의 `python3.14 … python3`(3.12 이상이어야 함) → `uv python find '>=3.12'`. 사용할 Python이 없으면 `resolve`가 `ok`가 아니며 설치 힌트를 출력합니다. 스킬은 웹 검색 전용 조사로 낮추지 않고 중지합니다.
- 엔진 설정과 API 키는 upstream 설정 마법사가 동의를 받아 기록하는 `~/.config/last30days/`에 저장되므로 엔진 업그레이드 뒤에도 유지됩니다.

해석 순서는 다음과 같습니다. 먼저 찾은 항목을 사용합니다. `market.path` → `LAST30DAYS_HOME` → **관리되는 최신 사본** → 사용자 설치 사본(프로젝트와 홈 아래의 `.agents|.claude|.codex|.cursor|.qwen|.kiro/skills/last30days`, 그 다음 Claude Code 플러그인 캐시).

```bash
oma market update            # 지금 확인하거나 다운로드
oma market resolve --offline # 네트워크에 절대 접속하지 않음
oma market run --help        # 엔진 자체 플래그
```

---

## 설정 {#configuration}

```yaml
market:
  managed: true                   # false = 다운로드하지 않고 고정 경로/스킬 디렉토리만 사용
  channel: stable                 # stable (최신 Release) | main (main의 HEAD)
  check_interval_min: 60          # 원격 확인 간격(분), 0 = 호출할 때마다
  path: null                      # 명시적 엔진 디렉토리(고정)
  python: null                    # 인터프리터 오버라이드
  save_dir: .agents/results/market/raw
```

---

## 실행 방식 {#how-a-run-works}

1. `oma market detect-trap "<topic>"`, 키워드 트랩과 인구통계 쇼핑 주제를 거부합니다(종료 코드 2). 거부하면 재구성 제안을 보여줍니다.
2. `oma market resolve --json`, 엔진과 Python을 확인하고 `ok: false`이면 중지합니다.
3. 에이전트가 해석된 엔진의 `SKILL.md`를 처음부터 끝까지 읽고 따릅니다. 첫 실행 설정 마법사, WebSearch를 사용할 수 있을 때 핸들/서브레딧/해시태그의 사전 조사 해석, 질의 계획, 사전 조건 게이트가 여기에 포함됩니다.
4. `oma market run "<topic>" <flags> --emit=compact`, upstream `python3 scripts/last30days.py` 호출과 같은 인자를 사용하며 `--save-dir`는 `market.save_dir`에서 추가됩니다.
5. upstream OUTPUT CONTRACT를 따라 조사 결과를 종합합니다. 첫 줄에는 배지가 오고, 증거 클러스터를 순위화하며, LAWs 1–8을 포함합니다. 그 다음 oma가 엔진 클러스터만 인용하는 프레임워크 절을 추가합니다.

| 의도 | 엔진 구성 | 프레임워크 |
|---|---|---|
| pain | 불만 형태의 주제, `--days 30`, 자료가 부족할 때 `--deep` | SWOT |
| trend | `--days 7/30/90/180`, “무엇이 뜨는가”에는 `--discover "<domain>"` | SWOT |
| competitor | `"A vs B"` → upstream 비교 흐름 | SWOT + Porter's 5F |
| discovery | `--discover`, 이어서 `--drill` 후속 질의 | SWOT + PESTEL |

6. 자체 검사를 수행한 뒤 `.agents/results/market/{topic-slug}-{YYYYMMDD}.md`에 작성합니다.

---

## 실패 상황 {#failure-modes}

| 상황 | 결과 |
|---|---|
| `detect-trap`이 주제를 거부함 | 재구성안을 보여주고 엔진은 실행하지 않습니다. 명시적으로 사용자가 다시 확인한 뒤에만 `--force`를 사용합니다. |
| 엔진 캐시가 없고 오프라인임 | `ok: false`가 됩니다. 온라인에서 한 번 `oma market update`를 실행합니다. |
| Python 3.12 이상이 없음 | 설치 힌트(brew / apt / `uv python install 3.12`)와 함께 `ok: false`가 됩니다. 웹 검색 전용 대체 경로는 없습니다. |
| 릴리스 확인 실패 | 캐시 엔진을 사용하고 `stale`로 보고합니다. |
| 키가 없는 소스 | 엔진 안에서 건너뛰고 푸터에 기록합니다. upstream 설정 마법사에서 활성화합니다. |

---

## 관련 문서 {#related}

- [다이어그램 엔진](/docs/guide/diagram-engine), archify의 관리 최신 패턴
- [oma-config.yaml 의미](/docs/guide/oma-config-semantics)
- upstream: [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)
