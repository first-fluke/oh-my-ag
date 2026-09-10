---
title: "가이드: 다이어그램 엔진(archify)"
sidebar_label: 다이어그램
description: Mermaid와 선택적 tt-a1i/archify 에이전트 스킬 중에서 아키텍처, 시퀀스, 데이터 흐름 다이어그램에 사용할 엔진을 선택하는 방법을 설명합니다. 다이어그램 설정, oma diagram resolve / oma diagram archify, /architecture와 /explain의 사용 방식, 제한 없는 검증-수정-전달 루프를 다룹니다.
---

# 다이어그램 엔진 {#diagram-engine}

`/architecture`(ADR, 권장안, 리뷰)와 `/explain`(코드 변경 설명서)은 모두 구조 다이어그램을 만듭니다. 항상 Markdown 산출물 안에 **Mermaid** 블록을 넣으며, [archify](https://github.com/tt-a1i/archify)를 해석할 수 있는 경우(일반적인 경우) 산출물 옆에 **대화형 검증 HTML 다이어그램**도 추가합니다. 이 HTML에는 라이트/다크 테마, 이동·확대/축소, 검색, 관계 추적, PNG/SVG/WebM 내보내기가 있으며 타입이 있는 JSON 사양에서 렌더링됩니다.

Mermaid는 사라지지 않습니다. Markdown과 git diff에 남는 텍스트 SSOT입니다. archify는 파생 산출물입니다.

---

## 항상 최신 archify 사용, 설치할 필요 없음 {#always-the-latest-archify-nothing-to-install}

archify는 MIT 라이선스의 에이전트 스킬입니다(Node ≥ 18, 런타임 의존성 0개). oh-my-agent는 사용자가 한 번 설치한 사본에 의존하지 않습니다. 자체 관리 사본을 유지하고 최신 릴리스를 추적합니다.

- 캐시: `~/.cache/oma-diagram/archify/<tag>/` 및 포인터를 담은 `state.json`
- 사용하기 전에 `oma diagram resolve`가 GitHub에서 최신 릴리스 태그를 확인합니다. 확인은 `check_interval_min`(기본 60분)마다 한 번으로 제한됩니다. 새 태그가 있으면 소스 tarball을 내려받고, 태그별 디렉토리를 원자적으로 만들며 오래된 태그를 정리합니다. 새 태그가 없으면 캐시 사본을 재사용합니다.
- 네트워크 실패는 치명적이지 않습니다. 캐시 사본을 사용하고 이유와 함께 `stale`로 보고합니다. 네트워크와 캐시가 모두 없는 첫 실행에서만 사용자 설치 스킬 사본으로 폴백한 뒤 Mermaid를 사용합니다.

```bash
# 출력은 예시입니다. 릴리스 태그, 캐시 경로, 품질은 달라질 수 있습니다.
oma diagram update          # 지금 확인하거나 다운로드
oma diagram resolve
# engine:   archify  (requested: auto)
# reason:   archify 2.15.0 via managed:v2.15.0 (current)
# root:     /Users/you/.cache/oma-diagram/archify/v2.15.0
# quality:  showcase
oma diagram resolve --offline   # 네트워크에 절대 접속하지 않음
```

해석 순서는 다음과 같습니다. 먼저 찾은 항목을 사용하며, 모든 벤더 런타임에서 동일합니다.

1. `oma-config.yaml`의 `diagram.archify.path`, 명시적 고정이며 자동 최신 추적을 사용하지 않습니다.
2. `ARCHIFY_HOME` 환경 변수, 명시적 고정입니다.
3. **관리되는 최신 사본**(`~/.cache/oma-diagram/archify`)
4. 사용자 설치 스킬 디렉토리. 프로젝트의 `.agents` / `.claude` / `.codex` / `.cursor` / `.qwen` / `.kiro` `/skills/archify`, 그 다음 홈 디렉토리의 같은 경로, 마지막으로 `~/.raven/workspace/skills/archify` 순서입니다.

<!-- oma-docs:ignore-start -->
관리되는 설치 또는 고정된 archify 설치 안에 `bin/archify.mjs`가 있어야 찾은 것으로 인정합니다.
<!-- oma-docs:ignore-end -->

---

## 설정 {#configuration}

`.agents/oma-config.yaml`에 필요한 항목만 작성합니다. 없는 키는 아래 기본값을 사용합니다.

```yaml
diagram:
  engine: auto                # auto | archify | mermaid
  explain_sidecar: false      # /explain도 archify 사이드카 작성
  archify:
    managed: true             # false = 다운로드하지 않고 고정 경로/스킬 디렉토리만 사용
    channel: stable           # stable (최신 GitHub Release) | main (main의 HEAD)
    check_interval_min: 60    # 원격 확인 간격(분), 0 = 호출할 때마다
    path: null                # 명시적 설치 디렉토리(고정)
    quality: showcase         # showcase | standard  → --quality
    open: false               # 전달할 때 --open 전달
```

| `engine` | 동작 |
|---|---|
| `auto`(기본값) | archify가 해석되면 관리 최신 사본, 고정 경로, 스킬 디렉토리 중 해당 사본을 사용하고, 그렇지 않으면 Mermaid를 사용합니다. |
| `archify` | archify를 요구합니다. 아무 사본도 해석되지 않으면(첫 실행이 오프라인인 경우 등) `oma diagram resolve`가 종료 코드 1로 끝납니다. 워크플로우는 조용히 하위 호환으로 낮추지 않고 중지합니다. |
| `mermaid` | archify를 호출하지 않습니다. |

프롬프트에서 `/explain 640 with archify`처럼 요청하면 해당 실행에서 설정을 덮어쓸 수 있습니다.

---

## CLI {#cli}

```bash
oma diagram resolve [--engine auto|archify|mermaid] [--refresh] [--offline] [--json]
oma diagram update  [--json]
oma diagram archify <archify args…>
```

`oma diagram archify`는 해석된 archify 실행 파일을 `ARCHIFY_UPDATE_CHECK_DISABLED=1`로 실행합니다(네트워크 없음). 종료 코드를 그대로 전달하므로 `validate` / `deliver` / `visual-check`의 동작은 archify 문서와 같습니다.

```bash
oma diagram archify guide "show the auth request lifecycle" --json
oma diagram archify validate architecture adr-auth.archify.json --quality showcase --json
oma diagram archify deliver  architecture adr-auth.archify.json adr-auth.archify.html --quality showcase --json
oma diagram archify visual-check adr-auth.archify.html --json   # 종료 코드 2 = Chrome 없음, skipped로 보고
```

`resolve`의 `--json`은 `{ ok, requested, engine, quality, open, explainSidecar, archify?: { root, bin, version, source, status?, note? }, reason, probed }`를 반환합니다. `source`는 `managed:<tag>`, `config:…`, `env:…`, 스킬 디렉토리 레이블 중 하나입니다. 관리 사본에는 `status`(`fresh` / `current` / `stale`)와 `note`가 설정됩니다.

---

## 워크플로우에서의 사용 방식 {#how-the-workflows-use-it}

공유 프로토콜은 `.agents/skills/_shared/conditional/diagram-engine.md`에 있습니다. 두 워크플로우 모두 같은 순서를 따릅니다.

1. `oma diagram resolve --json`
2. 먼저 Mermaid 블록을 작성합니다. 항상 작성합니다.
3. `engine: archify`이면 Mermaid 토폴로지를 archify JSON IR(`architecture` / `sequence` / `dataflow` / `lifecycle` / `workflow`)로 변환합니다. 설치된 사본에서 해당 스키마와 예시 하나만 읽습니다.
4. `validate` → 수정 → `deliver` 순서로 진행합니다. **고정된 반복 횟수 제한은 없습니다.** archify의 객관적 오류 수가 개선되는 동안 계속 수정하고, 두 라운드 연속 개선이 없다는 archify 자체 수렴 규칙에서 멈춥니다. 통과만을 위해 의미 레이블을 삭제하지 않습니다.
5. HTML을 링크합니다. HTML을 삽입하지 않습니다.

### `/architecture` {#architecture}

경계, 의존성, 데이터 흐름 같은 구조적 결정에만 사용합니다. Markdown 산출물 옆의 `.agents/results/architecture/`에 다음을 출력합니다.

```
adr-notification-service.md            # Mermaid 블록 + "Interactive:" 링크
adr-notification-service.archify.json  # 고정된 사양(실패해도 보존)
adr-notification-service.archify.html  # 전달된 뷰어
```

### `/explain` {#explain}

설명서 자체의 계약이 자체 완결형 단일 파일이고 CSS 변수 테마를 사용하므로 기본적으로 선택 사항입니다. `diagram.explain_sidecar: true`를 설정하거나 프롬프트에서 요청하면 사용합니다. 사이드카 `{date}-{slug}.archify.html`은 설명서의 기본 시스템/데이터 흐름 다이어그램에서 파생되며 일반 `<a href>`로 연결됩니다. 사이드카 실패가 설명서 전달을 막지는 않습니다.

---

## 실패 상황 {#failure-modes}

| 상황 | 결과 |
|---|---|
| 업데이트 확인 실패(오프라인, 속도 제한) | 캐시 사본을 이유와 함께 `stale`로 보고하며 사용합니다. |
| 캐시·네트워크·스킬 디렉토리가 모두 없고 `engine: auto` | Mermaid만 사용합니다. 온라인에서 한 번 `oma diagram update`를 실행하라는 보고가 남습니다. |
| 같은 상황에서 `engine: archify` | 워크플로우가 `ok: false`와 `oma diagram update` 힌트를 남기고 중지합니다. |
| `validate`가 수렴하지 않음 | Mermaid가 전달되는 다이어그램으로 남고, 마지막 `.archify.json`은 사람이 검토할 수 있도록 보존됩니다. 진단은 원문 그대로 보고합니다. |
| `visual-check`에 Chrome 없음 | 통과가 아니라 `skipped`로 보고합니다. |

---

## 관련 문서 {#related}

- [코드 설명서](/docs/guide/code-explainer), `/explain` 워크플로우
- [oma-config.yaml 의미](/docs/guide/oma-config-semantics)
- archify upstream: [tt-a1i/archify](https://github.com/tt-a1i/archify)
