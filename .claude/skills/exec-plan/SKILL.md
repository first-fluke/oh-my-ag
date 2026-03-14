---
name: exec-plan
description: 실행 계획 생성 및 관리 — 리포지토리 아티팩트로서의 플랜 라이프사이클
disable-model-invocation: true
---

# /exec-plan

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/exec-plan.md` (정식 워크플로우 — 모든 스텝 준수)
2. `.agents/skills/_shared/prompt-structure.md` (4요소 프레임워크)
3. `.agents/skills/_shared/context-loading.md` (리소스 선택적 로딩)

## Claude Code 어댑션

- inline 실행 (서브에이전트 스폰 불필요)
- MCP 도구 대신 Read, Write, Grep, Glob 도구 활용
- 플랜 라이프사이클: `docs/exec-plans/active/` → `docs/exec-plans/completed/`

## 핵심 스텝 요약

1. **디렉토리 확인**: `docs/exec-plans/` 존재 여부 체크
2. **범위 분석**: Goal, Context, Constraints, Done When 4요소
3. **플랜 생성**: `docs/exec-plans/active/{plan-name}.md` 에 태스크 테이블, 의사결정 로그, 진행 노트
4. **API 계약 정의**: 크로스 바운더리 작업 시
5. **사용자 리뷰**: 반드시 확인 후 진행
6. **실행 핸드오프**: `/orchestrate` 또는 `/coordinate`로 전달
7. **완료 처리**: `completed/`로 이동, `tech-debt-tracker.md` 업데이트

$ARGUMENTS
