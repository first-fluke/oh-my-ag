# oh-my-ag: Antigravity를 위한 멀티 에이전트 오케스트레이터

Google Antigravity를 위한 궁극의 멀티 에이전트 프레임워크.

**Serena Memory**를 통해 6개의 전문 도메인 에이전트(PM, Frontend, Backend, Mobile, QA, Debug)를 조율하세요. 병렬 CLI 실행, 실시간 관측 대시보드, 제로 설정(zero-config) 방식의 점진적 스킬 로딩을 지원합니다. 에이전트 기반 코딩을 위해 모든 것이 준비된 올인원 솔루션입니다.

> **마음에 드셨나요?** 스타 눌러주세요!
>
> ```bash
> gh api --method PUT /user/starred/first-fluke/oh-my-ag
> ```
>
> **풀스택 개발이 처음이신가요?** 최적화된 스타터 템플릿으로 시작필보세요:
>
> ```bash
> git clone https://github.com/first-fluke/fullstack-starter
> ```
>
> 이 스킬들이 미리 설정되어 있어 바로 멀티 에이전트 협업이 가능합니다.

## 목차

- [아키텍처](#아키텍처)
- [이게 뭔가요?](#이게-뭔가요)
- [빠른 시작](#빠른-시작)
- [동작 원리](#동작-원리)
- [실시간 대시보드](#실시간-대시보드)
- [스킬 아키텍처](#스킬-아키텍처)
- [CLI 명령어](#cli-명령어)
- [후원하기](#후원하기)
- [라이선스](#라이선스)

## 이게 뭔가요?

멀티 에이전트 협업 개발을 위한 **Antigravity Skills** 모음입니다. 작업을 전문 에이전트에게 분배합니다:

| 에이전트 | 전문 분야 | 발동 키워드 |
|---------|----------|-----------|
| **Workflow Guide** | 복잡한 멀티 에이전트 프로젝트 조율 | "멀티 도메인", "복잡한 프로젝트" |
| **PM Agent** | 요구사항 분석, 태스크 분해, 아키텍처 설계 | "기획", "분석", "뭘 만들어야 할까" |
| **Frontend Agent** | React/Next.js, TypeScript, Tailwind CSS | "UI", "컴포넌트", "스타일링" |
| **Backend Agent** | FastAPI, PostgreSQL, JWT 인증 | "API", "데이터베이스", "인증" |
| **Mobile Agent** | Flutter 크로스 플랫폼 개발 | "모바일 앱", "iOS/Android" |
| **QA Agent** | OWASP Top 10 보안, 성능, 접근성 감사 | "보안 검토", "감사", "성능 확인" |
| **Debug Agent** | 버그 진단, 근본 원인 분석, 회귀 테스트 | "버그", "에러", "크래시" |
| **Orchestrator** | CLI 기반 병렬 에이전트 실행 + Serena Memory | "에이전트 실행", "병렬 실행" |
| **Commit** | Conventional Commits 규칙 기반 커밋 관리 | "커밋", "변경사항 저장" |

## 아키텍처

```mermaid
flowchart TD
    subgraph Workflows["워크플로우"]
        direction TB
        W1["/coordinate"]
        W2["/orchestrate"]
        W3["/plan"]
        W4["/review"]
        W5["/debug"]
    end

    subgraph Orchestration["오케스트레이션"]
        direction TB
        PM[pm-agent]
        WF[workflow-guide]
        ORC[orchestrator]
    end

    subgraph Domain["도메인 에이전트"]
        direction TB
        FE[frontend-agent]
        BE[backend-agent]
        MB[mobile-agent]
    end

    subgraph Quality["품질"]
        direction TB
        QA[qa-agent]
        DBG[debug-agent]
    end

    Workflows --> Orchestration
    Orchestration --> Domain
    Domain --> Quality
    Quality --> CMT([commit])
```

## 빠른 시작

### 사전 요구 사항

- **Google Antigravity** (2026+)
- **Bun** (CLI 및 대시보드용)
- **uv** (Serena 설정용)

### 옵션 1: 대화형 CLI (권장)

```bash
# bun이 없으면 먼저 설치:
# curl -fsSL https://bun.sh/install | bash

# uv가 없으면 먼저 설치:
# curl -LsSf https://astral.sh/uv/install.sh | sh

bunx oh-my-ag
```

프로젝트 타입을 선택하면 `.agent/skills/`에 스킬이 설치됩니다.

| 프리셋 | 스킬 |
|--------|--------|
| ✨ All | 전체 |
| 🌐 Fullstack | frontend, backend, pm, qa, debug, commit |
| 🎨 Frontend | frontend, pm, qa, debug, commit |
| ⚙️ Backend | backend, pm, qa, debug, commit |
| 📱 Mobile | mobile, pm, qa, debug, commit |

### 옵션 2: 전역 설치 (Orchestrator용)

SubAgent Orchestrator를 사용하거나 도구를 전역에서 사용하려면:

```bash
bun install --global oh-my-ag
```

최소 1개의 CLI 도구가 필요합니다:

| CLI | 설치 | 인증 |
|-----|------|------|
| Gemini | `bun install --global @anthropic-ai/gemini-cli` | `gemini auth` |
| Claude | `bun install --global @anthropic-ai/claude-code` | `claude auth` |
| Codex | `bun install --global @openai/codex` | `codex auth` |
| Qwen | `bun install --global @qwen-code/qwen` | `qwen auth` |

### 옵션 3: 기존 프로젝트에 통합하기

**권장 방법 (CLI):**

기존 프로젝트의 루트 디렉토리에서 다음 명령어를 실행하면 스킬과 워크플로우가 자동으로 설치됩니다:

```bash
bunx oh-my-ag
```

> **팁:** 설치 후 `bunx oh-my-ag doctor`를 실행하여 모든 설정(전역 워크플로우 포함)이 올바른지 확인하세요.



### 2. 채팅으로 사용

**명시적 조율** (유저가 워크플로우 호출):

```
/coordinate
→ 단계별: PM 기획 → 에이전트 생성 → QA 검토
```

**복잡한 프로젝트** (workflow-guide가 조율):

```
"사용자 인증이 있는 TODO 앱 만들어줘"
→ workflow-guide → PM Agent 기획 → Agent Manager에서 에이전트 생성
```

**간단한 작업** (단일 에이전트 자동 활성화):

```
"Tailwind CSS로 로그인 폼 만들어줘"
→ frontend-agent 자동 활성화
```

**변경사항 커밋** (Conventional Commits):

```
/commit
→ 변경 분석, 커밋 타입/스코프 제안, Co-Author 포함 커밋 생성
```

### 3. 대시보드로 모니터링

대시보드 설정과 상세 사용법은 [`web/content/ko/guide/usage.md`](./web/content/ko/guide/usage.md#실시간-대시보드)를 참고하세요.

## 동작 원리

### Progressive Disclosure (점진적 공개)

스킬을 수동으로 선택할 필요 없습니다. Antigravity가 자동으로:

1. 채팅 요청을 분석
2. `.agent/skills/`의 스킬 설명과 매칭
3. 필요한 스킬만 컨텍스트에 로드
4. 지연 로딩으로 토큰 절약

### Agent Manager UI

복잡한 프로젝트에는 Antigravity **Agent Manager** (Mission Control)를 사용합니다:

1. PM Agent가 기획서 작성
2. Agent Manager UI에서 에이전트 생성
3. 에이전트들이 별도 워크스페이스에서 병렬 작업
4. 인박스 알림으로 진행 상황 확인
5. QA Agent가 최종 검토

### SubAgent Orchestrator (CLI)

프로그래밍 방식의 병렬 실행:

```bash
# 인라인 프롬프트 (workspace 자동 탐지)
oh-my-ag agent:spawn backend "인증 API 구현" session-01

# 파일에서 프롬프트 읽기
oh-my-ag agent:spawn backend .agent/tasks/backend-auth.json session-01

# 명시적 workspace 지정
oh-my-ag agent:spawn backend "인증 API 구현" session-01 -w ./apps/api

# 병렬 실행
oh-my-ag agent:spawn backend "인증 API 구현" session-01 &
oh-my-ag agent:spawn frontend "로그인 폼 생성" session-01 &
wait
```

지원 CLI: **Gemini**, **Claude**, **Codex**, **Qwen**

### 멀티-CLI 설정

`.agent/config/user-preferences.yaml`에서 에이전트별 CLI 설정:

```yaml
# 응답 언어
language: ko  # ko, en, ja, zh, ...

# 기본 CLI (단일 작업)
default_cli: gemini

# 에이전트별 CLI 매핑 (멀티-CLI 모드)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

**CLI 우선순위**:

1. `--vendor` 명령줄 인자
2. `user-preferences.yaml`의 `agent_cli_mapping`
3. `user-preferences.yaml`의 `default_cli`
4. `cli-config.yaml`의 `active_vendor` (레거시)
5. 하드코딩 기본값: `gemini`

대화형으로 설정하려면 `/setup` 실행.

### Serena Memory 조율

Orchestrator가 `.serena/memories/`에 구조화된 상태를 기록합니다:

| 파일 | 용도 |
|------|------|
| `orchestrator-session.md` | 세션 ID, 상태, 단계 |
| `task-board.md` | 에이전트 할당 및 상태 테이블 |
| `progress-{agent}.md` | 에이전트별 턴 단위 진행 상황 |
| `result-{agent}.md` | 에이전트별 완료 결과 |

두 대시보드 모두 이 파일들을 감시하여 실시간 모니터링합니다.

## 실시간 대시보드

대시보드는 orchestrator 세션 모니터링을 위한 선택 기능입니다.

- 터미널: `bunx oh-my-ag dashboard`
- 웹: `bunx oh-my-ag dashboard:web` (`http://localhost:9847`)

요구사항, 화면, 상세 동작은 [`web/content/ko/guide/usage.md`](./web/content/ko/guide/usage.md#실시간-대시보드)를 참고하세요.

## 스킬 아키텍처

스킬은 **토큰 최적화된 2계층 설계**를 사용하여 점진적 공개(progressive disclosure)를 구현합니다—핵심 규칙은 즉시 로드(~800B), 상세 리소스는 필요 시 로드됩니다.

전체 아키텍처 상세 정보와 리소스 명세는 [`web/content/ko/core-concepts/skills.md`](./web/content/ko/core-concepts/skills.md)를 참고하세요.

## CLI 명령어

```bash
bunx oh-my-ag                # 대화형 스킬 설치
bunx oh-my-ag bridge         # MCP stdio - SSE 브릿지 (Serena용)
bunx oh-my-ag dashboard      # 터미널 실시간 대시보드
bunx oh-my-ag dashboard:web  # 웹 대시보드 (http://localhost:9847)
bunx oh-my-ag doctor         # 설정 확인 & 누락된 스킬 보강
bunx oh-my-ag help           # 도움말 표시
bunx oh-my-ag memory:init    # Serena 메모리 스키마 초기화
bunx oh-my-ag retro          # 세션 회고 (배운 점 & 다음 단계)
bunx oh-my-ag stats          # 생산성 메트릭 조회
bunx oh-my-ag update         # 스킬을 최신 버전으로 업데이트
bunx oh-my-ag usage          # 모델 사용량 쿼터 조회
```

문제 해결과 멀티-레포 중앙 레지스트리 문서는 웹 가이드로 이동했습니다:

- 사용 가이드 (EN): [`web/content/en/guide/usage.md`](./web/content/en/guide/usage.md)
- 사용 가이드 (KO): [`web/content/ko/guide/usage.md`](./web/content/ko/guide/usage.md)
- 중앙 레지스트리 (EN): [`web/content/en/guide/central-registry.md`](./web/content/en/guide/central-registry.md)
- 중앙 레지스트리 (KO): [`web/content/ko/guide/central-registry.md`](./web/content/ko/guide/central-registry.md)

## 후원하기

이 프로젝트는 후원자분들의 지원으로 유지됩니다.

<a href="https://github.com/sponsors/first-fluke">
  <img src="https://img.shields.io/badge/후원하기-♥-ea4aaa?style=for-the-badge" alt="Sponsor" />
</a>
<a href="https://buymeacoffee.com/firstfluke">
  <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-FFDD00?style=for-the-badge" alt="Buy Me a Coffee" />
</a>

### 🚀 Champion

<!-- Champion 티어 ($100/월) 로고 -->

### 🛸 Booster

<!-- Booster 티어 ($30/월) 로고 -->

### ☕ Contributor

<!-- Contributor 티어 ($10/월) 이름 -->

[후원자 되기 →](https://github.com/sponsors/first-fluke)

전체 후원자 목록은 [SPONSORS.md](./SPONSORS.md)를 참고하세요.

## 스타 히스토리

[![Star History Chart](https://api.star-history.com/svg?repos=first-fluke/oh-my-ag&type=date&legend=bottom-right)](https://www.star-history.com/#first-fluke/oh-my-ag&type=date&legend=bottom-right)

## 라이선스

MIT

---
**Google Antigravity 2026용** | **통합 가이드:** [EN](./web/content/en/guide/integration.md) · [KO](./web/content/ko/guide/integration.md)
