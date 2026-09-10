---
title: "가이드: 이미지 생성"
sidebar_label: 이미지 생성
description: oh-my-agent 이미지 생성 종합 가이드입니다. Codex(gpt-image-2), Pollinations(flux/zimage, 무료), Gemini Code Assist를 통한 Antigravity, 참조 이미지, 비용 가드레일, 출력 레이아웃, 트러블슈팅, 공유 호출 패턴을 다룹니다.
---

# 이미지 생성

`oma-image`는 oh-my-agent의 멀티 벤더 이미지 라우터입니다. 자연어 프롬프트로 이미지를 생성하고, 인증된 벤더 CLI로 디스패치하며, 실행 입력과 프로바이더 결정을 기록한 매니페스트를 출력물 옆에 작성합니다. 라이브 프로바이더의 결과 이미지는 실행할 때마다 달라질 수 있습니다.

이 스킬은 *image*, *illustration*, *visual asset*, *concept art* 같은 키워드 또는 다른 스킬에 부수적으로 이미지가 필요할 때(히어로 샷, 썸네일, 제품 사진) 자동 활성화됩니다.

---

## 사용할 때

- 이미지, 일러스트, 제품 사진, 콘셉트 아트, 히어로/랜딩 비주얼 생성
- 동일한 프롬프트를 여러 모델에서 나란히 비교 (`--vendor all`)
- 에디터 워크플로우(Claude Code, Codex, Gemini CLI) 내부에서 에셋 생성
- 다른 스킬(디자인, 마케팅, 문서)이 공유 인프라로서 이미지 파이프라인을 호출하도록 허용

## 사용하지 말아야 할 때

- 기존 이미지 편집 또는 보정 (범위 밖. 전용 도구 사용)
- 비디오 또는 오디오 생성 (범위 밖)
- 구조화된 데이터로 인라인 SVG / 벡터 합성 (템플릿 스킬 사용)
- 단순 리사이즈 / 포맷 변환 (생성 파이프라인이 아닌 이미지 라이브러리 사용)

---

## 한눈에 보는 벤더

이 스킬은 CLI 우선입니다. 벤더의 네이티브 CLI가 원시 이미지 바이트를 반환할 수 있으면 직접 API 키보다 서브프로세스 경로가 우선됩니다.

| 벤더 | 전략 | 모델 | 트리거 | 비용 |
|---|---|---|---|---|
| `pollinations` | 직접 HTTP | 무료: `flux`, `zimage`. 크레딧 필요: `qwen-image`, `wan-image`, `gpt-image-2`, `klein`, `kontext`, `gptimage`, `gptimage-large` | `POLLINATIONS_API_KEY` 설정 (https://enter.pollinations.ai에서 무료 가입) | `flux` / `zimage`는 무료 |
| `codex` | CLI 우선 (ChatGPT OAuth로 `codex exec`) | `gpt-image-2` | `codex login` (API 키 불필요) | ChatGPT 플랜에 청구 |
| `antigravity` | Gemini Code Assist 구독을 사용하는 `agy` CLI | 모델은 `agy`가 내부에서 선택 | `agy` 설치 및 로그인 | Code Assist를 통한 이미지별 추가 요금 없음 |

기본 벤더 모드는 `auto`이며, 상태 확인을 통과한 프로바이더를 실행합니다. Pollinations의 `flux`와 `zimage`는 이미지별로 무료지만 `POLLINATIONS_API_KEY`가 필요합니다. Codex와 Antigravity도 각각 로그인이 필요하며, 유료 실행에는 비용 확인 가드레일이 적용됩니다.

---

## 빠른 시작

처음 생성하기 전에 프로바이더 상태를 확인하고 다음 방법 중 하나로 인증합니다.

```bash
oma image doctor

# Pollinations: 무료 계정을 만들고 키를 내보냅니다.
export POLLINATIONS_API_KEY="<pollinations-key>"

# 또는 다른 프로바이더를 인증합니다.
codex login
# --vendor antigravity를 사용할 때는 Gemini Code Assist에 로그인합니다.
```

```bash
# 상태가 정상인 프로바이더를 자동 선택합니다. 비용과 인증 요구 사항은 프로바이더에 따라 다릅니다.
oma image generate "minimalist sunrise over mountains"

# 설정된 모든 벤더를 실행합니다. 선택된 벤더가 모두 정상이어야 합니다.
oma image generate "cat astronaut" --vendor all

# Specific vendor + size + count, skip cost prompt
oma image generate "logo concept" --vendor codex --size 1024x1024 -n 3 -y

# Cost estimate without spending
oma image generate "test prompt" --dry-run

# 벤더별 인증 및 설치 상태를 확인합니다.
oma image doctor

# 등록된 벤더와 지원 모델을 확인합니다.
oma image vendor list
```

`oma img`는 `oma image`의 별칭입니다.

---

## 스킬로 사용하기

`oma-image`는 스킬입니다. 자연어로 자동 활성화되며, 명시적으로 호출할 수도 있습니다. 진입 경로는 세 가지입니다.

### 1. 자연어 (자동 활성화)

Claude Code, Codex CLI, Gemini CLI 안에서 그냥 이미지를 설명하면 됩니다. *image*, *illustration*, *visual asset*, *concept art*, *hero shot*, *thumbnail*, *product photo* 같은 키워드에 매칭됩니다.

CLI 플래그를 외울 필요가 없습니다. 자연어로 말하면 스킬이 알맞은 옵션으로 매핑합니다:

| 자연어 | 스킬이 추론 |
|---|---|
| "codex로" / "gpt-image-2로" / "무료 flux로" | `--vendor codex` / `--vendor pollinations` |
| "벤더 비교" / "다 같이" | `--vendor all` |
| "세로" / "가로" / "1024×1536" | `--size 1024x1536` / `--size 1536x1024` |
| "고품질" / "초안" | `--quality high` / `--quality low` |
| "세 가지 변형" / "3개 뽑아줘" | `-n 3` |
| "./hero에 저장" / "docs/assets로" | `--output-dir <dir>` |
| 첨부 이미지 + "야간으로 바꿔줘" | `-r <첨부 경로>` |
| "비용만 추정" / "드라이런" | `--dry-run` |

예시:

> "랜딩 히어로용으로 산 너머 일출, 가로, 고품질로 만들어줘."
> "세라믹 머그 제품 사진을 모든 벤더로 비교, 각각 세 장씩."
> "이 수달 사진을 codex로 드라마틱한 야간 분위기로." (참조 이미지 첨부 시)

에이전트는 [Clarification Protocol](#clarification-protocol)을 실행하고, 필요하면 프롬프트를 보강한 뒤 추론된 플래그로 `oma image generate`를 호출합니다. 정확한 플래그 값을 직접 통제하고 싶을 때만 슬래시 커맨드를 쓰면 됩니다.

### 2. 명시적 슬래시 커맨드

```text
/oma-image a red apple on white background
/oma-image --vendor all --size 1536x1024 jeju coastline at sunset
/oma-image -n 3 --quality high --output-dir ./hero "minimalist dashboard hero illustration"
```

모든 CLI 플래그(`--vendor`, `-n`, `--size`, `-r`, `--dry-run`, …)가 슬래시 커맨드에서도 그대로 동작합니다. 동일한 `oma image generate` 파이프라인으로 전달됩니다.

### 3. 다른 스킬에서 (공유 인프라)

다른 스킬(디자인, 마케팅, 문서)은 공유 인프라로 이 파이프라인을 JSON 출력과 함께 호출합니다:

```bash
oma image generate "<prompt>" --output json
```

stdout으로 작성되는 매니페스트에는 출력 경로, 벤더, 모델, 비용이 포함되어 파싱과 체이닝이 쉽습니다.

---

## CLI 레퍼런스

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

### 주요 플래그

| 플래그 | 용도 |
|---|---|
| `--vendor <name>` | `auto`, `pollinations`, `codex`, `antigravity`, 또는 `all`. `all`을 사용하면 설정된 모든 벤더가 정상이어야 합니다(엄격 모드). |
| `-n, --count <n>` | 벤더당 이미지 개수, 1–5 (wall-clock 시간 제한). |
| `--size <size>` | `1024x1024`(정사각형), `1024x1536`(세로형), `1536x1024`(가로형), 또는 `auto`입니다. |
| `--quality <level>` | `low`, `medium`, `high`, 또는 `auto` (벤더 기본값). |
| `--output-dir <dir>` | 출력 디렉토리. 기본값은 `.agents/results/images/{timestamp}/`입니다. `$PWD` 외부 경로에는 `--allow-external-output`이 필요합니다. |
| `--allow-external-output` | `$PWD` 외부의 출력 디렉토리를 허용합니다. |
| `--model <name>` | 선택한 벤더의 모델을 이 실행에서 덮어씁니다. `antigravity`는 `agy`가 모델을 선택하므로 무시합니다. |
| `-r, --reference <path>` | 최대 10개의 참조 이미지(PNG/JPEG/GIF/WebP, 각 ≤ 5 MB). 반복하거나 쉼표로 구분합니다. `codex`와 `antigravity`에서 지원하며 `pollinations`에서는 거부됩니다. |
| `-y, --yes` | `$0.20` 이상으로 추정되는 실행에서 비용 확인 프롬프트를 생략. `OMA_IMAGE_YES=1`로도 가능. |
| `--no-prompt-in-manifest` | `manifest.json`에 원문 대신 프롬프트의 SHA-256 저장. |
| `--dry-run` | 비용 없이 계획과 비용 추정값만 출력. |
| `--output text\|json` | CLI 출력 형식입니다. JSON은 다른 스킬이 사용하는 통합 인터페이스입니다. |
| `--timeout <duration>` | 이미지별 제한 시간입니다. |

---

## 참조 이미지

스타일, 피사체 정체성, 또는 구도를 안내하기 위해 최대 10개의 참조 이미지를 첨부합니다.

```bash
oma image generate -r ~/Downloads/otter.jpeg "same otter in dramatic lighting" --vendor codex
oma image generate -r a.png -r b.png "blend these styles" --vendor antigravity
oma image generate -r a.png,b.png "blend these styles" --vendor antigravity
```

| 벤더 | 참조 지원 | 방식 |
|---|---|---|
| `codex` (gpt-image-2) | 예 | `codex exec`에 `-i <path>` 전달 |
| `antigravity` | 예 | 참조 이미지를 실행별 디렉토리에 복사하고 `agy`가 접근하도록 합니다 |
| `pollinations` | 아니오 | exit code 4로 거부 (URL 호스팅 필요) |

### 첨부 이미지 위치

- **Claude Code**: `~/.claude/image-cache/<session>/N.png`, 시스템 메시지에 `[Image: source: <path>]`로 노출. 세션 스코프이며, 나중에 재사용하려면 영구 위치로 복사 필요.
- **Antigravity**: 워크스페이스 업로드 디렉토리 (IDE가 정확한 경로 표시)
- **호스트로서의 Codex CLI**: 명시적으로 전달해야 함. 대화 내 첨부는 전달되지 않음

사용자가 이미지를 첨부하고 그것을 기반으로 생성 또는 편집을 요청하면, 호출하는 에이전트는 **반드시** 말로 풀어 설명하지 말고 `--reference <path>`로 전달해야 합니다. 로컬 CLI가 너무 오래되어 `--reference`를 지원하지 않으면 `oma update`를 실행한 뒤 재시도합니다.

---

## 출력 레이아웃

모든 실행은 타임스탬프와 해시 접미사가 붙은 디렉토리로 `.agents/results/images/`에 기록됩니다:

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

`manifest.json`은 벤더, 모델, 프롬프트(또는 그 SHA-256), 크기, 품질, 비용을 기록하므로 실행을 감사하고 반복할 수 있습니다. 라이브 프로바이더가 생성한 픽셀이 동일하다는 뜻은 아닙니다.

---

## 비용, 안전성, 취소

1. **비용 가드레일**: `$0.20` 이상으로 추정되는 실행은 확인을 요청합니다. `-y` 또는 `OMA_IMAGE_YES=1`로 우회할 수 있습니다. 기본 `auto` 모드와 프로바이더 인증 상태에 따라 비용이 달라집니다.
2. **경로 안전성**: `$PWD` 외부의 출력 경로에는 `--allow-external-output`이 필요합니다.
3. **취소 가능**: `Ctrl+C` (SIGINT/SIGTERM)는 진행 중인 모든 프로바이더 호출과 오케스트레이터를 함께 중단시킵니다.
4. **안정적인 실행 기록**: `manifest.json`은 항상 이미지 옆에 작성됩니다.
5. **최대 `n` = 5**: 쿼터가 아니라 wall-clock 시간 제한입니다.
6. **Exit code**: `oma search fetch`와 정렬됨. `0` ok, `1` general, `2` safety, `3` not-found, `4` invalid-input, `5` auth-required, `6` timeout.

---

## 명확화 프로토콜 {#clarification-protocol}

`oma image generate`를 호출하기 전에, 호출하는 에이전트는 다음 체크리스트를 실행합니다. 누락되어 있고 추론할 수 없는 것이 있으면 먼저 질문하거나, 프롬프트를 보강하고 그 확장을 사용자에게 보여 승인을 받습니다.

**필수:**
- **피사체**: 이미지의 주된 대상은 무엇인가? (사물, 사람, 장면)
- **세팅 / 배경**: 어디에 있는가?

**강력 권장 (없고 추론 불가능하면 질문):**
- **스타일**: 사진 같은 사실주의, 일러스트, 3D 렌더, 유화, 콘셉트 아트, 플랫 벡터?
- **무드 / 조명**: 밝은 분위기와 어두운 분위기, 따뜻한 색과 차가운 색, 극적인 표현과 미니멀한 표현 중 무엇인가?
- **사용 컨텍스트**: 히어로 이미지, 아이콘, 썸네일, 제품 샷, 포스터?
- **종횡비**: 정사각형, 세로형, 또는 가로형

*"a red apple"*과 같은 짧은 프롬프트의 경우, 에이전트는 후속 질문을 하지 **않습니다**. 대신 인라인으로 보강하여 사용자에게 보여줍니다:

> 사용자: "a red apple"
> 에이전트: "다음과 같이 생성하겠습니다: *a single glossy red apple centered on a clean white background, soft studio lighting, photorealistic, shallow depth of field, 1024×1024*. 진행해도 괜찮을까요, 아니면 다른 스타일/구도를 원하시나요?"

사용자가 완전한 크리에이티브 브리프(피사체 + 스타일 + 조명 + 구도 중 2개 이상)를 작성한 경우, 그 프롬프트는 그대로 존중됩니다(명확화도, 보강도 없음).

**출력 언어.** 생성 프롬프트는 영어로 프로바이더에 전송됩니다 (이미지 모델은 주로 영어 캡션으로 학습됨). 사용자가 다른 언어로 작성한 경우, 에이전트는 번역한 프롬프트를 보강 단계에서 보여주어, 잘못 옮긴 부분이 있으면 사용자가 바로잡을 수 있게 합니다.

---

## 설정

- **프로젝트 설정:** `.agents/oma-config.yaml`의 `image:` 섹션입니다. 레거시 `config/image-config.yaml`은 더 이상 읽지 않습니다.
- **환경 변수:**
  - `OMA_IMAGE_DEFAULT_VENDOR`: 기본 벤더를 덮어씁니다(그 외에는 `pollinations`).
  - `OMA_IMAGE_DEFAULT_OUT`: 기본 출력 디렉토리 오버라이드
  - `OMA_IMAGE_YES`: 비용 확인을 우회하려면 `1`
  - `POLLINATIONS_API_KEY`: pollinations 벤더에 필요 (무료 가입)

---

## 트러블슈팅

| 증상 | 가능한 원인 | 해결 |
|---|---|---|
| Exit code `5` (auth-required) | 선택한 벤더가 인증되지 않음 | `oma image doctor`로 로그인이 필요한 벤더를 확인합니다. 그런 다음 `codex login`, `agy` 로그인, 또는 `POLLINATIONS_API_KEY` 설정을 진행합니다. |
| `--reference`에서 Exit code `4` | `pollinations`가 참조를 거부했거나 파일이 너무 크거나 형식이 잘못됨 | `--vendor codex` 또는 `--vendor antigravity`로 전환합니다. 각 참조는 5 MB 이하이고 PNG/JPEG/GIF/WebP여야 합니다. |
| `--reference`가 인식되지 않음 | 로컬 CLI가 오래됨 | `oma update`를 실행하고 재시도. 말로 풀어 설명하는 방식으로 되돌아가지 말 것. |
| 비용 확인이 자동화를 차단 | 실행이 `$0.20` 이상으로 추정됨 | `-y`를 전달하거나 `OMA_IMAGE_YES=1`을 설정합니다. 무료 Pollinations를 선택할 수도 있지만 키가 필요합니다. |
| `--vendor all`이 즉시 중단됨 | 요청한 벤더 중 하나가 인증되지 않음 (엄격 모드) | 누락된 벤더를 인증하거나, 특정 `--vendor`를 선택. |
| 출력이 예상치 못한 디렉토리에 작성됨 | 기본값은 `.agents/results/images/{timestamp}/` | `--output-dir <dir>`를 전달합니다. `$PWD` 외부 경로에는 `--allow-external-output`이 필요합니다. |
| Antigravity가 상태 확인 후 실패함 | `agy --version`은 설치 여부만 확인하고 로그인을 확인하지 않음 | Gemini Code Assist에 로그인한 뒤 `oma image doctor`와 `--vendor antigravity`로 다시 실행합니다. |

---

## 관련 문서

- [Skills](/docs/core-concepts/skills): `oma-image`를 구동하는 2계층 스킬 아키텍처
- [CLI Commands](/docs/cli-interfaces/commands): `oma image` 전체 커맨드 레퍼런스
- [CLI Options](/docs/cli-interfaces/options): 글로벌 옵션 매트릭스
