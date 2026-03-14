---
name: debug
description: 구조적 버그 진단 및 수정 — 근본 원인 분석, 패턴 스캔, 회귀 테스트
disable-model-invocation: true
---

# /debug

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/debug.md` (정식 워크플로우 — 모든 스텝 준수)
2. `.agents/skills/debug-agent/SKILL.md` (Debug Agent 전문성)
3. `.agents/skills/_shared/context-loading.md` (리소스 선택적 로딩)

## Claude Code 어댑션

### 기본 모드 (inline 진단)

간단한 버그는 메인 에이전트가 직접 처리:

1. **에러 수집**: 에러 메시지, 재현 스텝, 환경 정보
2. **재현 확인**: Grep, Read 도구로 코드 추적
3. **근본 원인 진단**: null access, race condition, type mismatch 등
4. **수정 제안**: 최소 변경, 사용자 확인 후 적용
5. **회귀 테스트 작성**: 수정에 대한 테스트
6. **유사 패턴 스캔**: 동일 패턴이 다른 곳에 존재하는지 Grep

### 복잡한 디버그 (서브에이전트 위임)

유사 패턴 스캔이 넓은 범위를 커버해야 할 경우:

1. `debug-investigator` 서브에이전트를 Task tool로 스폰
2. 현재까지의 진단 결과 + 스캔 범위를 프롬프트에 포함
3. 결과 수신 후 사용자에게 보고

Task tool 스폰 판단 기준:
- 에러가 여러 도메인에 걸쳐 있을 때
- 유사 패턴 스캔 범위가 10+ 파일일 때
- 진단에 깊은 의존성 추적이 필요할 때

## 핵심 원칙

- 증상이 아닌 근본 원인 수정
- 최소 변경만 — 디버그 중 리팩토링 금지
- 모든 수정에 회귀 테스트 필수

$ARGUMENTS
