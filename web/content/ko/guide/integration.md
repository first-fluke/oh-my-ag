---
title: 기존 프로젝트 통합
description: 기존 Antigravity 프로젝트에 oh-my-ag 스킬을 안전하고 비파괴적으로 통합하는 가이드.
---

# 기존 프로젝트에 통합하기

이 문서는 루트의 구버전 `AGENT_GUIDE.md`를 대체하며, 현재 워크스페이스 구조(`cli` + `web`)와 최신 CLI 동작 기준으로 작성되었습니다.

## 목표

기존 프로젝트 자산을 덮어쓰지 않고 `oh-my-ag` 스킬을 추가합니다.

## 권장 경로 (CLI)

대상 프로젝트 루트에서 실행:

```bash
bunx oh-my-ag
```

실행 시 작업:

- `.agent/skills/*` 설치/업데이트
- `.agent/skills/_shared` 공통 리소스 설치
- `.agent/workflows/*` 설치
- `.agent/config/user-preferences.yaml` 설치
- 선택적으로 `~/.gemini/antigravity/global_workflows` 전역 워크플로우 설치

## 수동 통합 (안전 모드)

디렉토리별로 직접 통제해야 할 때 사용합니다.

```bash
cd /path/to/your-project

mkdir -p .agent/skills .agent/workflows .agent/config

# 없는 스킬만 복사 (예시)
for skill in workflow-guide pm-agent frontend-agent backend-agent mobile-agent qa-agent debug-agent orchestrator commit; do
  if [ ! -d ".agent/skills/$skill" ]; then
    cp -r /path/to/oh-my-ag/.agent/skills/$skill .agent/skills/$skill
  fi
done

# 공통 리소스가 없으면 복사
[ -d .agent/skills/_shared ] || cp -r /path/to/oh-my-ag/.agent/skills/_shared .agent/skills/_shared

# 워크플로우가 없으면 복사
for wf in coordinate.md orchestrate.md plan.md review.md debug.md setup.md tools.md; do
  [ -f ".agent/workflows/$wf" ] || cp /path/to/oh-my-ag/.agent/workflows/$wf .agent/workflows/$wf
done

# 기본 사용자 설정이 없으면 복사
[ -f .agent/config/user-preferences.yaml ] || cp /path/to/oh-my-ag/.agent/config/user-preferences.yaml .agent/config/user-preferences.yaml
```

## 검증 체크리스트

```bash
# 설치형 스킬 9개(_shared 제외)
find .agent/skills -mindepth 1 -maxdepth 1 -type d ! -name '_shared' | wc -l

# 공통 리소스
[ -d .agent/skills/_shared ] && echo ok

# 워크플로우 7개
find .agent/workflows -maxdepth 1 -name '*.md' | wc -l

# 기본 상태 점검
bunx oh-my-ag doctor
```

## 선택 기능: 대시보드

대시보드는 선택 기능이며 설치된 CLI로 실행합니다.

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

웹 대시보드 기본 주소: `http://localhost:9847`

## 롤백 전략

통합 전에 프로젝트에 체크포인트 커밋을 남기세요.

```bash
git add -A
git commit -m "chore: checkpoint before oh-my-ag integration"
```

되돌려야 하면 팀 표준 절차에 맞춰 해당 커밋을 롤백하세요.

## 멀티 CLI 심링크 지원

`bunx oh-my-ag`를 실행하면 스킬 선택 후 다음과 같은 프롬프트가 표시됩니다:

```text
또 다른 CLI 도구로도 개발하시나요?
  ○ Claude Code (.claude/skills/)
  ○ OpenCode, Amp, Codex (.agents/skills/)
  ○ GitHub Copilot (.github/skills/)
```

Antigravity와 함께 사용하는 추가 CLI 도구를 선택하세요. 설치 프로그램은 다음을 수행합니다:

1. 스킬을 `.agent/skills/`에 설치 (Antigravity의 기본 위치)
2. 선택한 각 CLI의 skills 디렉토리에서 `.agent/skills/`로 심링크 생성

이를 통해 단일 출처(스킬의 SSOT)를 유지하면서 여러 CLI 도구에서 스킬을 사용할 수 있습니다.

### 심링크 구조

```
.agent/skills/frontend-agent/      ← 출처 (SSOT)
.claude/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/
.agents/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (OpenCode, Amp, Codex)
.github/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (GitHub Copilot)
```

설치 프로그램은 기존 심링크를 건 넘기고, 대상 위치에 실제 디렉토리가 있는 경우 경고합니다.

## 참고

- 커스터마이즈된 `.agent/skills/*`가 있으면 의도하지 않은 덮어쓰기를 피하세요.
- 프로젝트 정책 파일(`.agent/config/*`)은 각 프로젝트 저장소 소유로 관리하세요.
- 멀티 에이전트 조율 패턴은 [`사용 가이드`](./usage.md)를 이어서 참고하세요.
