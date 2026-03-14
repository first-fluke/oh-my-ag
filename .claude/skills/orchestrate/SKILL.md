---
name: orchestrate
description: 자동 병렬 멀티 에이전트 오케스트레이션 (Review Loop 포함)
disable-model-invocation: true
---

# /orchestrate

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/orchestrate.md` (정식 워크플로우)
2. `.agents/skills/orchestrator/SKILL.md` (오케스트레이터 설정)
3. `.agents/skills/orchestrator/resources/subagent-prompt-template.md` (프롬프트 템플릿)
4. `.agents/skills/_shared/skill-routing.md` (에이전트 라우팅)
5. `.agents/skills/_shared/context-loading.md` (리소스 로딩)

## Claude Code 네이티브 어댑션

CLI 스폰(`oh-my-ag agent:spawn`) 대신 `.claude/agents/` 서브에이전트를 Task tool로 스폰합니다.
Task tool 결과가 동기 반환되므로 폴링 불필요.

### Step 1: 플랜 로드

- `.agents/plan.json` 존재 확인
- 없으면: `/plan` 먼저 실행하도록 안내

### Step 2: 세션 초기화

1. `.agents/config/user-preferences.yaml` 로드
2. 세션 ID 생성 (format: `session-YYYYMMDD-HHMMSS`)
3. 에이전트 라우팅 표시 (skill-routing.md 기반)

### Step 3: 에이전트 스폰 (Task tool 병렬 호출)

우선순위 티어별로 에이전트 스폰:

- **같은 메시지에서 복수 Task tool 호출** = true 병렬 실행
- 각 에이전트: `.claude/agents/{agent}.md` 정의 사용
- 프롬프트에 포함: 태스크 설명, API 계약, 컨텍스트

에이전트 매핑:
| 도메인 | 서브에이전트 파일 |
|:------|:---------------|
| backend | `.claude/agents/backend-impl.md` |
| frontend | `.claude/agents/frontend-impl.md` |
| mobile | `.claude/agents/mobile-impl.md` |
| db | `.claude/agents/db-impl.md` |
| qa | `.claude/agents/qa-reviewer.md` |
| debug | `.claude/agents/debug-investigator.md` |
| pm | `.claude/agents/pm-planner.md` |

### Step 4: 모니터링

Task tool 결과가 직접 반환 → 폴링 불필요.
각 에이전트 결과에서 status, files changed, issues 확인.

### Step 5: Agent-to-Agent Review Loop (네이티브 루프)

아래 루프를 메인 에이전트가 직접 제어합니다. iteration 카운터를 유지하세요.

```
iteration = 0
MAX_SELF = 3, MAX_CROSS = 2, MAX_TOTAL = 5

LOOP:
  iteration += 1
  if iteration > MAX_TOTAL → FORCE_COMPLETE (품질 경고 포함)

  [1] Self-Review:
      구현 에이전트 결과에서 self-review 섹션 확인
      lint/type-check/test 결과 확인 (Bash tool)
      PASS → [3]으로 진행
      FAIL (self_count < MAX_SELF) → 피드백과 함께 Task tool 재스폰 → LOOP
      FAIL (self_count >= MAX_SELF) → 강제 [3]으로 진행

  [3] Cross-Review:
      `qa-reviewer` 서브에이전트를 Task tool로 스폰
      QA 결과 파싱: PASS / FAIL
      PASS → ACCEPT
      FAIL (cross_count < MAX_CROSS) → 피드백 포맷:
        ## Review Feedback (iteration {n}/{MAX_TOTAL})
        **Reviewer**: qa-reviewer
        **Verdict**: FAIL
        **Issues**: [구체적 파일:라인 참조]
        **Fix instruction**: [수정 방법]
      → 구현 에이전트 Task tool 재스폰 (피드백 포함) → LOOP
      FAIL (cross_count >= MAX_CROSS) → 사용자에게 리뷰 히스토리와 함께 보고
```

### Step 6: 결과 수집

모든 에이전트 완료 후:
- `.agents/results/result-{agent}.md` 수집
- 완료/실패 태스크, 변경 파일, 잔여 이슈 정리

### Step 7: 최종 보고

세션 요약:
- 완료된 태스크
- 실패한 태스크 (재시도 후에도 실패 시 에러 상세)
- 다음 단계 제안: 수동 수정, 특정 에이전트 재실행, `/review` QA

$ARGUMENTS
