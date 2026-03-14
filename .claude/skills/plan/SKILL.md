---
name: plan
description: PM 기반 요구사항 분석, 태스크 분해, API 계약 정의
disable-model-invocation: true
---

# /plan

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/plan.md` (정식 워크플로우 — 모든 스텝 준수)
2. `.agents/skills/_shared/prompt-structure.md` (4요소 프레임워크: Goal, Context, Constraints, Done When)
3. `.agents/skills/_shared/context-loading.md` (리소스 선택적 로딩)

## Claude Code 어댑션

- PM Agent 로직을 inline으로 실행 (서브에이전트 스폰 불필요)
- MCP 도구 대신 Read, Grep, Glob 도구로 코드 분석
- 플랜 저장: `.agents/plan.json` (호환성 유지)
- 선택적으로 `docs/exec-plans/active/` 에도 저장

## 핵심 스텝 요약

1. **요구사항 수집**: 사용자 설명, 대상 사용자, 기능, 제약조건, 배포 타겟
2. **기술 타당성 분석**: 코드베이스 분석 (Glob, Grep, Read 활용)
3. **API 계약 정의**: `.agents/skills/_shared/api-contracts/`에 저장
4. **태스크 분해**: agent, title, acceptance criteria, priority (P0-P3), dependencies
5. **사용자 리뷰**: 반드시 사용자 확인 후 저장
6. **플랜 저장**: `.agents/plan.json` + 메모리

## 출력 후 안내

플랜 완성 시 사용자에게 실행 옵션 안내:
- `/orchestrate` — 자동 병렬 실행
- `/coordinate` — 태스크 기반 조율 실행
- `/ultrawork` — 5단계 Phase Gate 실행

$ARGUMENTS
