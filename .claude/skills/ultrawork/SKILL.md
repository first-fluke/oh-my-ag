---
name: ultrawork
description: 5단계 17스텝 Phase Gate 오케스트레이션
disable-model-invocation: true
---

# /ultrawork

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/ultrawork.md` (정식 워크플로우 — 5 Phase, 17 Steps)
2. `.agents/skills/orchestrator/SKILL.md` (오케스트레이터 설정)
3. `.agents/skills/_shared/multi-review-protocol.md` (11 리뷰 스텝)
4. `.agents/skills/_shared/skill-routing.md` (에이전트 라우팅)
5. `.agents/skills/_shared/context-loading.md` (리소스 로딩)

## Claude Code 네이티브 어댑션

### Phase Gate Loop 패턴

각 Phase를 순차 실행하되, Gate 실패 시 해당 Phase로 루프백합니다.
메인 에이전트가 Gate 체크리스트를 직접 평가하여 루프를 제어합니다.

```
for each PHASE in [PLAN, IMPL, VERIFY, REFINE, SHIP]:
  GATE_LOOP:
    해당 Phase의 Steps 실행
    Gate 체크리스트 평가:
      모든 항목 PASS → 다음 Phase로 진행
      FAIL →
        PLAN_GATE 실패: Step 1로 회귀 (inline 재실행)
        IMPL_GATE 실패: 실패 에이전트만 Task tool 재스폰 → GATE_LOOP
        VERIFY_GATE 실패: Step 5로 회귀, 구현 수정 후 VERIFY 재실행
        REFINE_GATE 실패: debug-investigator 재스폰 → GATE_LOOP
        SHIP_GATE 실패: 해당 Step 재실행 → GATE_LOOP
```

---

### PLAN Phase (Steps 1-4): inline 실행

PM 분석을 메인 에이전트가 직접 수행:

1. **Step 1**: 요구사항 분석, 도메인 식별
2. **Step 2**: Completeness Review — 요구사항 완전성 확인
3. **Step 3**: Meta Review — 리뷰 자체의 적절성
4. **Step 4**: Over-Engineering Review — 불필요한 복잡성 제거

**PLAN_GATE**: 플랜 문서화, 가정 목록, 대안 검토, 오버엔지니어링 리뷰 → 사용자 확인

---

### IMPL Phase (Step 5): 구현 에이전트 병렬 스폰

구현 에이전트를 Task tool로 병렬 스폰:

- 같은 메시지에서 복수 Task tool 호출 (true 병렬)
- `.claude/agents/{agent}.md` 정의 사용
- 각 에이전트에 태스크 + API 계약 전달

**IMPL_GATE**: 빌드 성공(Bash), 테스트 통과(Bash), 계획된 파일만 변경

---

### VERIFY Phase (Steps 6-8): qa-reviewer Task tool 스폰

1. **Step 6**: Alignment Review — 구현 == 요구사항
2. **Step 7**: Security/Bug Review — OWASP Top 10
3. **Step 8**: Regression Review — 기존 기능 영향

`qa-reviewer` 서브에이전트를 Task tool로 스폰하여 3개 스텝 리뷰.

Review Loop 적용:
```
VERIFY 결과 파싱:
  PASS → 다음 Phase
  FAIL → 구현 에이전트 재스폰 (피드백 포함) → VERIFY 재실행
```

**VERIFY_GATE**: 구현==요구사항, CRITICAL 0, HIGH 0, 회귀 없음

---

### REFINE Phase (Steps 9-13): debug-investigator Task tool 스폰

1. **Step 9**: 대형 파일/함수 분리
2. **Step 10**: 통합 기회 캡처
3. **Step 11**: 부작용 분석
4. **Step 12**: 일관성 리뷰
5. **Step 13**: 정리

`debug-investigator` 서브에이전트 스폰.

> 50줄 미만 단순 태스크: REFINE Phase SKIP

**REFINE_GATE**: 대형 파일/함수 없음, 통합 기회 캡처, 부작용 검증

---

### SHIP Phase (Steps 14-17): 최종 QA + 배포 체크리스트

1. **Step 14**: Quality Review — lint/type/coverage
2. **Step 15**: UX Flow 검증
3. **Step 16**: Related Issues 확인
4. **Step 17**: Deployment Readiness

`qa-reviewer` 서브에이전트 스폰 (최종 리뷰).

**SHIP_GATE**: 품질 통과, UX 검증, 관련 이슈 해결 → 사용자 최종 승인

$ARGUMENTS
