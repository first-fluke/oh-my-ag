---
name: brainstorm
description: 디자인 퍼스트 아이디어 탐색 — 구현 전 사용자 의도 파악 및 설계 워크플로우
disable-model-invocation: true
---

# /brainstorm

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/brainstorm.md` (정식 워크플로우 — 모든 스텝 준수)
2. `.agents/skills/_shared/prompt-structure.md` (4요소 프레임워크)
3. `.agents/skills/_shared/context-loading.md` (리소스 선택적 로딩)

## Claude Code 어댑션

- inline 실행 (서브에이전트 스폰 불필요)
- MCP 코드 분석 도구 대신 Grep, Glob, Read 도구로 프로젝트 탐색
- 디자인 문서 저장: `docs/plans/<feature-name>-design.md`

## 핵심 스텝 요약

1. **프로젝트 컨텍스트 탐색**: 기존 코드베이스 분석 (Grep, Glob, Read)
2. **명확화 질문**: 의도, 범위, 제약, 성공 기준 (한 번에 하나씩)
3. **접근법 제안**: 2-3개 대안 + 장단점 + 공수 추정 → 사용자 선택
4. **디자인 상세화**: 섹션별로 제시, 각 섹션 승인
5. **디자인 저장**: `docs/plans/<feature-name>-design.md`
6. **다음 단계 안내**: `/plan` 실행 제안

## 중요

- 이 워크플로우에서 코드 작성 금지 (NO code writing)
- 디자인과 탐색에만 집중

$ARGUMENTS
