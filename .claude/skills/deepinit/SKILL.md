---
name: deepinit
description: 프로젝트 하네스 초기화 — AGENTS.md, ARCHITECTURE.md, docs/ 구조 생성
disable-model-invocation: true
---

# /deepinit

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/deepinit.md` (정식 워크플로우 — 모든 스텝 준수)
2. `.agents/skills/_shared/context-loading.md` (리소스 선택적 로딩)

## Claude Code 어댑션

- inline 실행
- MCP 도구 대신 Read, Glob, Grep, Bash 도구로 코드베이스 분석
- 파일 생성: Write 도구 사용

## 핵심 스텝 요약

1. **기존 하네스 확인**: AGENTS.md 존재 시 업데이트 모드
2. **코드베이스 분석**: 구조, 심볼, 패턴 파악 (Glob, Grep, Read)
3. **ARCHITECTURE.md 생성**: 토폴로지, 도메인 맵 (<200줄)
4. **docs/ 지식 베이스 생성**: 관련 파일만 선별 생성
5. **루트 AGENTS.md 생성**: 목차 역할 (~100줄)
6. **바운더리 AGENTS.md 생성**: 패키지/앱 경계 (<50줄)
7. **검증**: 데드 링크 없음, 라인 제한 준수

## 목표 구조

```
AGENTS.md              (목차, ~100줄)
ARCHITECTURE.md        (도메인 맵, <200줄)
docs/
├── design-docs/
├── exec-plans/
├── generated/
├── product-specs/
├── references/
├── DESIGN.md, FRONTEND.md, PLANS.md
├── QUALITY-SCORE.md, RELIABILITY.md, SECURITY.md
└── CODE-REVIEW.md
```

## 중요

- AGENTS.md는 목차 역할 — 백과사전이 아님
- `.gitignore` 준수, 크로스 플랫폼 빌드 디렉토리 스킵
- `<!-- MANUAL: -->` 블록은 보존

$ARGUMENTS
